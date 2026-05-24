"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useSyncExternalStore,
} from "react";

import {
	createEquipment,
	EQUIPMENT_SELECTION_STORAGE_KEY,
	EQUIPMENTS_STORAGE_KEY,
	type Equipment,
	LEGACY_EQUIPMENT_STORAGE_KEY,
} from "@/lib/equipment";

type SelectionMap = Record<string, string>;

type EquipmentContextValue = {
	equipments: Equipment[];
	add: (name?: string) => Equipment;
	update: (id: string, patch: Partial<Equipment>) => void;
	remove: (id: string) => void;
	getById: (id: string | null | undefined) => Equipment | null;
	selection: SelectionMap;
	getSelected: (calculatorSlug: string) => Equipment | null;
	select: (calculatorSlug: string, equipmentId: string | null) => void;
};

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

let cachedEquipmentsRaw: string | null = "<uninit>";
let cachedEquipments: Equipment[] = [];
let cachedSelectionRaw: string | null = "<uninit>";
let cachedSelection: SelectionMap = {};
const equipmentsListeners = new Set<() => void>();
const selectionListeners = new Set<() => void>();

function migrateLegacy(): Equipment[] | null {
	try {
		const legacy = window.localStorage.getItem(LEGACY_EQUIPMENT_STORAGE_KEY);
		if (legacy === null) return null;
		const parsed = JSON.parse(legacy) as Partial<Equipment>;
		const migrated: Equipment = {
			...createEquipment(parsed.client || parsed.location || "Equipment 1"),
			...parsed,
		};
		window.localStorage.setItem(
			EQUIPMENTS_STORAGE_KEY,
			JSON.stringify([migrated]),
		);
		window.localStorage.removeItem(LEGACY_EQUIPMENT_STORAGE_KEY);
		return [migrated];
	} catch {
		return null;
	}
}

function readEquipments(): Equipment[] {
	if (typeof window === "undefined") return [];
	let raw: string | null = null;
	try {
		raw = window.localStorage.getItem(EQUIPMENTS_STORAGE_KEY);
	} catch {
		return cachedEquipments;
	}
	if (raw === null) {
		const migrated = migrateLegacy();
		if (migrated) {
			cachedEquipmentsRaw = JSON.stringify(migrated);
			cachedEquipments = migrated;
			return cachedEquipments;
		}
	}
	if (raw === cachedEquipmentsRaw) return cachedEquipments;
	cachedEquipmentsRaw = raw;
	if (raw === null) {
		cachedEquipments = [];
		return cachedEquipments;
	}
	try {
		const parsed = JSON.parse(raw) as Equipment[];
		cachedEquipments = Array.isArray(parsed) ? parsed : [];
	} catch {
		cachedEquipments = [];
	}
	return cachedEquipments;
}

function readSelection(): SelectionMap {
	if (typeof window === "undefined") return {};
	let raw: string | null = null;
	try {
		raw = window.localStorage.getItem(EQUIPMENT_SELECTION_STORAGE_KEY);
	} catch {
		return cachedSelection;
	}
	if (raw === cachedSelectionRaw) return cachedSelection;
	cachedSelectionRaw = raw;
	if (raw === null) {
		cachedSelection = {};
		return cachedSelection;
	}
	try {
		const parsed = JSON.parse(raw) as SelectionMap;
		cachedSelection = parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		cachedSelection = {};
	}
	return cachedSelection;
}

function writeEquipments(next: Equipment[]) {
	cachedEquipments = next;
	try {
		cachedEquipmentsRaw = JSON.stringify(next);
		window.localStorage.setItem(EQUIPMENTS_STORAGE_KEY, cachedEquipmentsRaw);
	} catch {
		// ignore
	}
	for (const l of equipmentsListeners) l();
}

function writeSelection(next: SelectionMap) {
	cachedSelection = next;
	try {
		cachedSelectionRaw = JSON.stringify(next);
		window.localStorage.setItem(
			EQUIPMENT_SELECTION_STORAGE_KEY,
			cachedSelectionRaw,
		);
	} catch {
		// ignore
	}
	for (const l of selectionListeners) l();
}

function subscribeEquipments(listener: () => void) {
	equipmentsListeners.add(listener);
	const onStorage = (e: StorageEvent) => {
		if (e.key === EQUIPMENTS_STORAGE_KEY) listener();
	};
	window.addEventListener("storage", onStorage);
	return () => {
		equipmentsListeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

function subscribeSelection(listener: () => void) {
	selectionListeners.add(listener);
	const onStorage = (e: StorageEvent) => {
		if (e.key === EQUIPMENT_SELECTION_STORAGE_KEY) listener();
	};
	window.addEventListener("storage", onStorage);
	return () => {
		selectionListeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

const SERVER_EQUIPMENTS: Equipment[] = [];
const SERVER_SELECTION: SelectionMap = {};

export function EquipmentProvider({ children }: { children: ReactNode }) {
	const equipments = useSyncExternalStore(
		subscribeEquipments,
		readEquipments,
		() => SERVER_EQUIPMENTS,
	);
	const selection = useSyncExternalStore(
		subscribeSelection,
		readSelection,
		() => SERVER_SELECTION,
	);

	const add = useCallback((name?: string): Equipment => {
		const list = readEquipments();
		const eq = createEquipment(name ?? `Equipment ${list.length + 1}`);
		writeEquipments([...list, eq]);
		return eq;
	}, []);

	const update = useCallback((id: string, patch: Partial<Equipment>) => {
		const list = readEquipments();
		writeEquipments(
			list.map((e) => (e.id === id ? { ...e, ...patch, id: e.id } : e)),
		);
	}, []);

	const remove = useCallback((id: string) => {
		const list = readEquipments();
		writeEquipments(list.filter((e) => e.id !== id));
		const sel = readSelection();
		const cleaned: SelectionMap = {};
		for (const [slug, eqId] of Object.entries(sel)) {
			if (eqId !== id) cleaned[slug] = eqId;
		}
		if (Object.keys(cleaned).length !== Object.keys(sel).length) {
			writeSelection(cleaned);
		}
	}, []);

	const getById = useCallback(
		(id: string | null | undefined): Equipment | null => {
			if (!id) return null;
			return equipments.find((e) => e.id === id) ?? null;
		},
		[equipments],
	);

	const getSelected = useCallback(
		(calculatorSlug: string): Equipment | null => {
			const id = selection[calculatorSlug];
			if (!id) return null;
			return equipments.find((e) => e.id === id) ?? null;
		},
		[equipments, selection],
	);

	const select = useCallback(
		(calculatorSlug: string, equipmentId: string | null) => {
			const sel = readSelection();
			if (equipmentId === null) {
				if (!(calculatorSlug in sel)) return;
				const next = { ...sel };
				delete next[calculatorSlug];
				writeSelection(next);
				return;
			}
			if (sel[calculatorSlug] === equipmentId) return;
			writeSelection({ ...sel, [calculatorSlug]: equipmentId });
		},
		[],
	);

	const value = useMemo<EquipmentContextValue>(
		() => ({
			equipments,
			add,
			update,
			remove,
			getById,
			selection,
			getSelected,
			select,
		}),
		[equipments, add, update, remove, getById, selection, getSelected, select],
	);

	return (
		<EquipmentContext.Provider value={value}>
			{children}
		</EquipmentContext.Provider>
	);
}

export function useEquipment(): EquipmentContextValue {
	const ctx = useContext(EquipmentContext);
	if (!ctx) {
		throw new Error(
			"useEquipment must be used inside <EquipmentProvider>. Check that " +
				"the root layout wraps children with it.",
		);
	}
	return ctx;
}

/** Convenience hook: returns the equipment selected for a calculator slug. */
export function useSelectedEquipment(calculatorSlug: string): Equipment | null {
	const { getSelected } = useEquipment();
	return getSelected(calculatorSlug);
}
