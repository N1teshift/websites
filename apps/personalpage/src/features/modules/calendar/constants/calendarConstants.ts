// Lesson Scheduler Constants
export const LESSON_SCHEDULER_CONSTANTS = {
  GO_BACK_TARGET: "/projects/edtech",
  TITLE_KEY: "lesson_scheduler",
  DISABLED_MESSAGE_KEY: "lesson_scheduler_disabled",
  SUCCESS_MESSAGE_DURATION: 5000,
  CACHE_CLEAR_DELAY: 3000,
} as const;

// Event Creation Constants
export const DEFAULT_DURATIONS = [30, 60];

export const PROVIDER_LOGIN_ENDPOINTS = {
  google: "/api/auth/login-google",
  microsoft: "/api/auth/login-microsoft",
} as const;

export const GUEST_REGISTRATION_ENDPOINT = "/api/calendar/register-others";

export const EVENT_SUMMARY_KEY = "math_lesson";
