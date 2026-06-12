import { createNavigation } from "next-intl/navigation";
import type { ComponentProps } from "react";
import { routing } from "./routing";

const nav = createNavigation(routing);

export const { redirect, usePathname, useRouter, getPathname } = nav;

const BaseLink = nav.Link;

/**
 * Link that defaults to `prefetch={false}`.
 *
 * The app is a static export (`output: "export"`), and Next does not emit RSC
 * prefetch payloads for the dynamic `[locale]` routes — the default prefetch
 * therefore requests `__next.$d$locale.__PAGE__.txt` and gets a 404 (logged as
 * a console error, hurting the Lighthouse best-practices score) with no
 * navigation benefit. Callers can still opt back in with `prefetch`.
 */
export function Link(props: ComponentProps<typeof BaseLink>) {
	return <BaseLink prefetch={false} {...props} />;
}
