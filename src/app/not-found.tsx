import { NotFoundContent } from "@/components/NotFoundContent";

/**
 * Rendered inside the root layout (dark theme + Geist) when `notFound()` fires
 * within the app — e.g. an unknown path under a valid locale like `/en/nope`.
 * Top-level paths that never match `[locale]` are handled by `global-not-found`.
 */
export default function NotFound() {
	return <NotFoundContent />;
}
