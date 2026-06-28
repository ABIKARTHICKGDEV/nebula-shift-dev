// EmailJS configuration via Vite env vars.
// Set VITE_EMAIL_SERVICE_ID, VITE_EMAIL_TEMPLATE_ID, VITE_EMAIL_PUBLIC_KEY
// in .env.local for development and as repo Secrets for the GitHub Actions
// build. The app continues to work (falls back to mailto:) when unset.

export const emailConfig = {
  serviceId: import.meta.env.VITE_EMAIL_SERVICE_ID ?? "",
  templateId: import.meta.env.VITE_EMAIL_TEMPLATE_ID ?? "",
  publicKey: import.meta.env.VITE_EMAIL_PUBLIC_KEY ?? "",
} as const;

export function isEmailConfigured(): boolean {
  return !!(emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey);
}

// Dev-only warning so configuration gaps are visible while building.
if (import.meta.env.DEV && !isEmailConfigured()) {
  // eslint-disable-next-line no-console
  console.warn(
    "[email] EmailJS is not configured. Set VITE_EMAIL_SERVICE_ID, " +
      "VITE_EMAIL_TEMPLATE_ID, and VITE_EMAIL_PUBLIC_KEY in .env.local. " +
      "The contact form will fall back to mailto: until then.",
  );
}
