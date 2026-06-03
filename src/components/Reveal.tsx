"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";

const EXIT_MS = 280;

export function Reveal({
	when,
	children,
	className,
}: {
	when: boolean;
	children: ReactNode;
	className?: string;
}) {
	const [mounted, setMounted] = useState(when);
	const [leaving, setLeaving] = useState(false);
	const cached = useRef<ReactNode>(when ? children : null);

	if (when) {
		cached.current = children;
	}

	useEffect(() => {
		if (when) {
			setMounted(true);
			setLeaving(false);
			return;
		}
		if (!mounted) return;
		setLeaving(true);
		const t = setTimeout(() => {
			setMounted(false);
			setLeaving(false);
		}, EXIT_MS);
		return () => clearTimeout(t);
	}, [when, mounted]);

	if (!mounted) return null;

	const classes = [leaving ? "animate-fade-down" : undefined, className]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={classes || undefined}>
			{when ? children : cached.current}
		</div>
	);
}
