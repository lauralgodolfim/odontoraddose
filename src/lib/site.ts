/**
 * Canonical site base URL used by sitemap.xml and robots.txt.
 *
 * The Sitemaps protocol and robots.txt `Sitemap:` directive both require
 * absolute URLs, so a relative value isn't permitted by spec. Until the
 * production domain is known, override via `NEXT_PUBLIC_SITE_URL`
 * (e.g. in `.env.local` or in the deploy host's env config); otherwise the
 * placeholder below is emitted so the files are still well-formed.
 *
 * No trailing slash — callers append paths.
 */
export const SITE_URL =
	process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
	"https://radqc.vercel.app";
