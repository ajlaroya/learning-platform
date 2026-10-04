import posthog from "posthog-js";

function sanitizeUrlProperties(value: unknown, propertyName = ""): unknown {
  if (
    typeof value === "string" &&
    /(?:url|referrer|href)$/i.test(propertyName)
  ) {
    try {
      const isRelativeUrl = value.startsWith("/");
      const url = new URL(value, window.location.origin);
      url.search = "";
      url.hash = "";
      return isRelativeUrl ? url.pathname : url.toString();
    } catch {
      return "[redacted]";
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUrlProperties(item, propertyName));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sanitizeUrlProperties(nestedValue, key),
      ]),
    );
  }

  return value;
}

const projectToken = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

if (!projectToken) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN is configured",
    );
  }
} else if (!apiHost) {
  if (process.env.NODE_ENV === "development") {
    throw new Error(
      "NEXT_PUBLIC_POSTHOG_HOST variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once NEXT_PUBLIC_POSTHOG_HOST is configured",
    );
  }
} else {
  posthog.init(projectToken, {
    api_host: apiHost,
    defaults: "2026-05-30",
    capture_exceptions: true,
    debug: process.env.NODE_ENV === "development",
    autocapture: {
      dom_event_allowlist: ["click"],
      element_allowlist: ["a", "button"],
      css_selector_ignorelist: [".ph-no-capture", "[data-ph-no-autocapture]"],
    },
    mask_all_text: true,
    mask_all_element_attributes: true,
    mask_personal_data_properties: true,
    custom_personal_data_properties: ["q"],
    session_recording: {
      maskAllInputs: true,
    },
    before_send: (event) => {
      if (!event?.properties) return event;
      event.properties.$geoip_disable = true;
      event.properties = sanitizeUrlProperties(
        event.properties,
      ) as typeof event.properties;
      return event;
    },
  });
}
