/**
 * Console filtering patterns for suppressing known harmless errors and warnings.
 *
 * These patterns filter out:
 * - Third-party script errors (Google Ads, YouTube, Twitch)
 * - Cookie warnings from embedded content
 * - Source map errors in development
 * - Browser extension errors
 * - HMR warnings
 * - Vercel analytics debug logs
 */

export const CONSOLE_FILTER_PATTERNS = [
  // Google Ads tracking errors
  /Cross-Origin Request Blocked.*googleads\.g\.doubleclick\.net/i,
  /googleads\.g\.doubleclick\.net/i,
  /doubleclick\.net/i,

  // YouTube cookie warnings (comprehensive patterns)
  /Cookie.*__Secure-YEC.*has been rejected/i,
  /Cookie.*LAST_RESULT_ENTRY_KEY.*will soon be rejected/i,
  /Cookie.*will soon be rejected.*Partitioned/i,
  /Cookie.*has been rejected/i,
  /Cookie.*will soon be rejected/i,

  // Feature Policy warnings (deprecated API, harmless) - including Lithuanian translations
  /Feature Policy: Skipping unsupported feature name/i,
  /Funkcionalumo nuostatas: praleidžiamas nepalaikomas funkcionalumas/i,

  // CSP warnings about unknown directives (harmless)
  /Content-Security-Policy: Couldn't process unknown directive/i,
  /require-trusted-types-for/i,

  // Vercel Live feedback third-party context warnings
  /vercel\.live.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
  /https:\/\/vercel\.live\/_next-live\/feedback\/feedback\.html.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,

  // YouTube third-party context warnings (expected behavior)
  /Partitioned cookie or storage access was provided.*youtube/i,
  /gavo išskaidytą slapuką arba saugyklos priėjimą.*youtube/i,
  /www\.youtube-nocookie\.com.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
  /youtube\.com.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,

  // Twitch third-party context warnings (expected behavior)
  /gavo išskaidytą slapuką arba saugyklos priėjimą.*twitch/i,
  /clips\.twitch\.tv.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,
  /twitch\.tv.*gavo išskaidytą slapuką arba saugyklos priėjimą/i,

  // Google Tag Manager script loading failures
  /Nepavyko įkelti.*googletagmanager\.com.*gtag\/js/i,
  /Failed to load.*googletagmanager\.com.*gtag\/js/i,
  /googletagmanager\.com.*gtag\/js/i,

  // Unreachable code warnings from minified third-party scripts
  /unreachable code after return statement/i,

  // YouTube/Twitch script files (minified code warnings)
  /9bXBegwkXqu77ttg1H2zNptqxcGE6xDjLfnManLdL_4\.js/i,
  /sUOU1m3X_CK9BVAcAV_LmyW1AodswI8pVN5XxRmf9ec\.js/i,
  /godoiXtxOBs/i,
  /player-core-variant-b.*\.js/i,
  /player-core-base.*\.js/i,

  // Source map errors (development only, harmless)
  /Source map error: request failed with status 404/i,
  /Source map error: can't access property/i,
  /installHook\.js\.map/i,
  /react_devtools_backend_compact\.js\.map/i,
  /installHook\.js\.map/i,
  /source-map-loader/i,

  // Cookie warnings (third-party embeds)
  /Cookie warnings/i,

  // React Router future flag warnings
  /React Router Future Flag Warning/i,
  /React Router will begin wrapping state updates in/i,
  /Relative route resolution within Splat routes is changing in v7/i,
  /v7_startTransition/i,
  /v7_relativeSplatPath/i,

  // WEBGL debug renderer deprecation warnings
  /WEBGL_debug_renderer_info is deprecated in Firefox/i,
  /WEBGL_debug_renderer_info.*deprecated/i,

  // Feature policy unsupported features (harmless browser warnings)
  /accelerometer.*unsupported/i,
  /autoplay.*unsupported/i,
  /clipboard-write.*unsupported/i,
  /encrypted-media.*unsupported/i,
  /gyroscope.*unsupported/i,
  /picture-in-picture.*unsupported/i,

  // Amazon IVS Player SDK warnings
  /Amazon IVS Player SDK/i,
  /MediaCapabilities: codec string is empty or undefined/i,
  /amazon-ivs-wasmworker/i,

  // Generic third-party cookie/storage access warnings
  /gavo išskaidytą slapuką arba saugyklos priėjimą.*trečiosios šalies kontekste/i,
  /Partitioned cookie or storage access/i,

  // Extension/script injection warnings
  /content-script-start\.js/i,
  /embed:.*:4126/i,

  // Firebase/third-party initialization warnings (non-critical)
  /Firebase Analytics/i,
  /Analytics initialization/i,

  // HMR warnings (excluding ISR manifest which is handled separately)
  /appIsrManifest/i,

  // Vercel analytics debug logs
  /\[Vercel/i,

  // Browser extension errors
  /Promised response from onMessage listener went out of scope/i,
  /onMessage listener/i,

  // Request failed errors (often from source maps)
  /request failed with status 404/i,
];

/**
 * Sets up console filtering to suppress known harmless errors and warnings.
 * This should be called once when the app initializes (client-side only).
 *
 * @param options Configuration options
 * @param options.enableInProduction Whether to enable filtering in production (default: true)
 * @param options.disableProductionLogFiltering Environment variable to check for disabling in production
 */
export function setupConsoleFiltering(
  options: {
    enableInProduction?: boolean;
    disableProductionLogFiltering?: string;
  } = {},
) {
  if (typeof window === "undefined") {
    return; // Server-side, do nothing
  }

  const { enableInProduction = true, disableProductionLogFiltering } = options;
  const isDevelopment = process.env.NODE_ENV === "development";
  const isProduction = process.env.NODE_ENV === "production";

  // In production, only suppress if enabled and not explicitly disabled
  const shouldFilterLogs =
    isDevelopment ||
    (isProduction &&
      enableInProduction &&
      !process.env[
        disableProductionLogFiltering || "DISABLE_PRODUCTION_LOG_FILTERING"
      ]);

  if (!shouldFilterLogs) {
    return;
  }

  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;

  console.error = (...args: unknown[]) => {
    const message = args.join(" ");
    const shouldSuppress = CONSOLE_FILTER_PATTERNS.some((pattern) =>
      pattern.test(message),
    );
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };

  console.warn = (...args: unknown[]) => {
    const message = args.join(" ");

    // Special handling for HMR ISR manifest warnings - replace with short message
    const isHmrIsrWarning =
      /\[HMR\] Invalid message.*isrManifest/i.test(message) ||
      /\[HMR\].*isrManifest/i.test(message);

    if (isHmrIsrWarning) {
      originalWarn("[HMR] ISR manifest message (already handled)");
      return;
    }

    const shouldSuppress = CONSOLE_FILTER_PATTERNS.some((pattern) =>
      pattern.test(message),
    );
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };

  // Only filter console.log in development (for Vercel analytics)
  if (isDevelopment) {
    console.log = (...args: unknown[]) => {
      if (typeof args[0] === "string" && args[0].includes("[Vercel")) {
        // Suppress Vercel analytics debug logs
        return;
      }
      originalLog.apply(console, args);
    };
  }
}
