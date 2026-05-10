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
	defaultEquipment,
	EQUIPMENT_STORAGE_KEY,
	type Equipment,
} from "@/lib/equipment";

type EquipmentContextValue = {
	equipment: Equipment;
	update: (patch: Partial<Equipment>) => void;
	reset: () => void;
};

const EquipmentContext = createContext<EquipmentContextValue | null>(null);

// Module-level cache so getSnapshot returns a stable reference when the
// underlying raw string hasn't changed (required by useSyncExternalStore).
let cachedRaw: string | null = "<uninitialised>";
let cachedSnapshot: Equipment = defaultEquipment;
const listeners = new Set<() => void>();

function readSnapshot(): Equipment {
	if (typeof window === "undefined") return defaultEquipment;
	let raw: string | null = null;
	try {
		raw = window.localStorage.getItem(EQUIPMENT_STORAGE_KEY);
	} catch {
		return defaultEquipment;
	}
	if (raw === cachedRaw) return cachedSnapshot;
	cachedRaw = raw;
	if (raw === null) {
		cachedSnapshot = defaultEquipment;
		return cachedSnapshot;
	}
	try {
		cachedSnapshot = {
			...defaultEquipment,
			...(JSON.parse(raw) as Partial<Equipment>),
		};
	} catch {
		cachedSnapshot = defaultEquipment;
	}
	return cachedSnapshot;
}

function readServerSnapshot(): Equipment {
	return defaultEquipment;
}

function subscribe(listener: () => void) {
	listeners.add(listener);
	const onStorage = (e: StorageEvent) => {
		if (e.key === EQUIPMENT_STORAGE_KEY) listener();
	};
	window.addEventListener("storage", onStorage);
	return () => {
		listeners.delete(listener);
		window.removeEventListener("storage", onStorage);
	};
}

function notify() {
	for (const l of listeners) l();
}

function writeSnapshot(next: Equipment) {
	cachedSnapshot = next;
	try {
		cachedRaw = JSON.stringify(next);
		window.localStorage.setItem(EQUIPMENT_STORAGE_KEY, cachedRaw);
	} catch {
		// ignore
	}
	notify();
}

function clearSnapshot() {
	cachedSnapshot = defaultEquipment;
	cachedRaw = null;
	try {
		window.localStorage.removeItem(EQUIPMENT_STORAGE_KEY);
	} catch {
		// ignore
	}
	notify();
}

export function EquipmentProvider({ children }: { children: ReactNode }) {
	const equipment = useSyncExternalStore(
		subscribe,
		readSnapshot,
		readServerSnapshot,
	);

	const update = useCallback((patch: Partial<Equipment>) => {
		writeSnapshot({ ...readSnapshot(), ...patch });
	}, []);

	const reset = useCallback(() => {
		clearSnapshot();
	}, []);

	const value = useMemo<EquipmentContextValue>(
		() => ({ equipment, update, reset }),
		[equipment, update, reset],
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
