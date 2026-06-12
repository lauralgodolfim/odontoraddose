"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Verdict } from "./verdict";

const STORAGE_KEY = "odontoraddose:audio:muted";

const VERDICT_VOLUME = 0.55;
const CLICK_VOLUME = 1;

type AudioCtx = {
	isMuted: boolean;
	toggleMute: () => void;
	playClick: () => void;
	playVerdict: (v: Verdict) => void;
};

const Ctx = createContext<AudioCtx | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
	const [isMuted, setIsMuted] = useState(false);
	const isMutedRef = useRef(isMuted);

	useEffect(() => {
		isMutedRef.current = isMuted;
	}, [isMuted]);

	useEffect(() => {
		try {
			if (localStorage.getItem(STORAGE_KEY) === "true") setIsMuted(true);
		} catch {
			/* localStorage unavailable; default to unmuted */
		}
	}, []);

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, isMuted ? "true" : "false");
		} catch {
			/* ignore */
		}
	}, [isMuted]);

	const toggleMute = useCallback(() => setIsMuted((m) => !m), []);

	const playFile = useCallback((src: string, volume: number) => {
		if (isMutedRef.current) return;
		try {
			const el = new Audio(src);
			el.volume = volume;
			el.play().catch(() => {});
		} catch {
			/* Audio constructor unavailable (SSR or restricted env) */
		}
	}, []);

	const playClick = useCallback(
		() => playFile("/sounds/click.mp3", CLICK_VOLUME),
		[playFile],
	);

	const playVerdict = useCallback(
		(v: Verdict) => playFile(`/sounds/${v}.mp3`, VERDICT_VOLUME),
		[playFile],
	);

	return (
		<Ctx.Provider
			value={{
				isMuted,
				toggleMute,
				playClick,
				playVerdict,
			}}
		>
			{children}
		</Ctx.Provider>
	);
}

export function useAudio(): AudioCtx {
	const ctx = useContext(Ctx);
	if (!ctx) throw new Error("useAudio must be used inside <AudioProvider>");
	return ctx;
}
