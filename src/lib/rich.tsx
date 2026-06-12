import type { ReactNode } from "react";

/**
 * Tag renderers for translated copy containing inline markup.
 * Use with next-intl: `t.rich("key", richTags)` — replaces the previous
 * `dangerouslySetInnerHTML` + `t.raw` pattern.
 */
export const richTags = {
	strong: (chunks: ReactNode) => <strong>{chunks}</strong>,
	sub: (chunks: ReactNode) => <sub>{chunks}</sub>,
};
