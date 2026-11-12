const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

// NEXT_PUBLIC_* values must be read with literal `process.env.X` access so
// Next.js can inline them at build time. Defaults keep the app working when no
// .env is present; see .env.example.
export const CONSTANTS = {
  API_BASE_URL: stripTrailingSlash(
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://careersportal.8848digital.com"
  ),
  API_MANDATE_PARAMS:
    process.env.NEXT_PUBLIC_API_MANDATE_PARAMS || "/api/method/job_portal.sdk.api",
  VERSION: process.env.NEXT_PUBLIC_API_VERSION || "v2",
  SITE_URL: stripTrailingSlash(
    process.env.NEXT_PUBLIC_SITE_URL || "https://careers.8848digital.com"
  ),
  CAREER_OPPORTUNITIES_PORTAL: true,
  CANDIDATE_EVALUATION_PORTAL: true,
};
