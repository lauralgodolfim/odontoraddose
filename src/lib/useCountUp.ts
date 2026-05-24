import { useEffect, useRef, useState } from "react";

const DURATION_MS = 300;

export function useCountUp(target: number): number {
	const [display, setDisplay] = useState(0);
	const fromRef = useRef(0);
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		if (!Number.isFinite(target)) {
			fromRef.current = target;
			setDisplay(target);
			return;
		}
		const from = Number.isFinite(fromRef.current) ? fromRef.current : 0;
		if (from === target) return;

		const start = performance.now();
		const tick = (now: number) => {
			const t = Math.min((now - start) / DURATION_MS, 1);
			const eased = 1 - (1 - t) ** 3;
			const next = from + (target - from) * eased;
			setDisplay(next);
			fromRef.current = next;
			if (t < 1) {
				rafRef.current = requestAnimationFrame(tick);
			} else {
				rafRef.current = null;
			}
		};
		rafRef.current = requestAnimationFrame(tick);

		return () => {
			if (rafRef.current !== null) {
				cancelAnimationFrame(rafRef.current);
				rafRef.current = null;
			}
		};
	}, [target]);

	return display;
}
