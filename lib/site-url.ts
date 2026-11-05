export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.RENDER_EXTERNAL_URL ??
    "http://localhost:3000";

  return new URL(configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`);
}
