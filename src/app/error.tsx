"use client";

import { useEffect } from "react";
import { ErrorContent } from "@/components/ErrorContent";

/**
 * Error boundary for the app tree (pages and the `[locale]` layout), rendered
 * inside the root layout. Root-layout crashes are handled by `global-error.tsx`.
 */
export default function AppError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error(error);
	}, [error]);

	return <ErrorContent reset={reset} digest={error.digest} />;
}
