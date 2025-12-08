import { useState, useEffect, useRef, useCallback } from "react";
import { createComponentLogger } from "@websites/infrastructure/logging";

// Note: MySpeechRecognition and SpeechRecognitionEvent interfaces are locally defined
// but mirror the global types defined in src/features/modules/voice/global.d.ts for consistency
// within this hook's scope, potentially before global types are fully recognized by the tooling.

/**
 * @interface MySpeechRecognition
 * @description Defines the structure for the speech recognition instance used within the hook.
 * Mirrors the standard SpeechRecognition interface but is defined locally.
 */
export interface MySpeechRecognition extends EventTarget {
  /** Starts the speech recognition service. */
  start: () => void;
  /** Stops the speech recognition service. */
  stop: () => void;
  /** Determines if recognition returns continuous results. */
  continuous: boolean;
  /** Language for the recognition. */
  lang: string;
  /** Determines if interim results should be returned. */
  interimResults: boolean;
  /** Event handler for successful recognition results. */
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  /** Event handler for recognition errors. */
  onerror: ((event: Event) => void) | null;
}

/**
 * @interface SpeechRecognitionEvent
 * @description Defines the structure for the event object passed to onresult.
 * Mirrors the standard SpeechRecognitionEvent interface but is defined locally.
 */
export interface SpeechRecognitionEvent extends Event {
  /** The index of the current result. */
  readonly resultIndex: number;
  /** The list of recognition results. */
  readonly results: SpeechRecognitionResultList;
}

/**
 * @interface SpeechRecognitionErrorEvent
 * @description Defines the structure for the error event object passed to onerror.
 */
export interface SpeechRecognitionErrorEvent extends Event {
  /** The error code from the speech recognition service. */
  error: string;
}

/**
 * @interface VoiceRecognitionError
 * @description Defines the structure for voice recognition errors.
 */
export interface VoiceRecognitionError {
  /** The type of error that occurred. */
  type: "permission" | "hardware" | "network" | "unsupported" | "unknown";
  /** Translation key for the error message. */
  messageKey: string;
  /** Additional error details. */
  details: string;
}

/**
 * @hook useVoiceRecognition
 * @description A React hook to manage speech recognition using the Web Speech API.
 * Provides state for listening status, error handling, and a function to start listening.
 * @param {function(string): void} onResult - Callback function invoked with the final transcript when speech is recognized.
 * @returns {{
 *   isListening: boolean,
 *   error: VoiceRecognitionError | null,
 *   startListening: () => void,
 *   clearError: () => void
 * }}
 *          An object containing:
 *          - `isListening`: Boolean state indicating if the recognition service is active.
 *          - `error`: Error state with type and message key for UI feedback.
 *          - `startListening`: Function to manually start the speech recognition.
 *          - `clearError`: Function to clear the current error state.
 */
export function useVoiceRecognition(onResult: (transcript: string) => void) {
  const logger = createComponentLogger("VoiceRecognition");
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<VoiceRecognitionError | null>(null);
  const [recognition, setRecognition] = useState<MySpeechRecognition | null>(null);

  // Use refs to track initialization state and prevent repeated warnings
  const hasWarnedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Use a ref to store the onResult callback so that it doesn't trigger re-renders.
  const onResultRef = useRef(onResult);
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  /**
   * Clears the current error state.
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Initializes the speech recognition instance if not already initialized.
   * This is called lazily when startListening is invoked.
   */
  const initializeRecognition = useCallback(() => {
    if (isInitializedRef.current) return;

    if (typeof window !== "undefined") {
      const SpeechRecognitionConstructor =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recog = new SpeechRecognitionConstructor() as MySpeechRecognition;
        recog.continuous = false; // Only capture final result
        recog.lang = "en-US";
        recog.interimResults = false;

        /**
         * Handles the 'result' event from the SpeechRecognition instance.
         * Extracts the transcript, updates listening state, and calls the onResult callback.
         * @param {SpeechRecognitionEvent} event - The speech recognition event containing results.
         */
        recog.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          clearError(); // Clear any previous errors on success
          onResultRef.current(transcript);
        };

        /**
         * Handles the 'error' event from the SpeechRecognition instance.
         * Categorizes errors and sets appropriate error state for UI feedback.
         * @param {Event} event - The error event.
         */
        recog.onerror = (event: Event) => {
          const errorEvent = event as SpeechRecognitionErrorEvent;
          const errorCode = errorEvent.error || "unknown";
          let errorType: VoiceRecognitionError["type"] = "unknown";
          let messageKey = "voice_error_unknown";

          // Categorize errors based on SpeechRecognitionError codes
          switch (errorCode) {
            case "not-allowed":
              errorType = "permission";
              messageKey = "voice_error_permission";
              break;
            case "no-speech":
              errorType = "hardware";
              messageKey = "voice_error_no_speech";
              break;
            case "audio-capture":
              errorType = "hardware";
              messageKey = "voice_error_audio_capture";
              break;
            case "network":
              errorType = "network";
              messageKey = "voice_error_network";
              break;
            case "service-not-allowed":
              errorType = "permission";
              messageKey = "voice_error_service_not_allowed";
              break;
            case "bad-grammar":
            case "language-not-supported":
              errorType = "unknown";
              messageKey = "voice_error_language";
              break;
            default:
              errorType = "unknown";
              messageKey = "voice_error_unknown";
          }

          const voiceError: VoiceRecognitionError = {
            type: errorType,
            messageKey,
            details: errorCode,
          };

          logger.error(
            "Speech recognition error",
            new Error(`Speech recognition failed: ${errorCode}`),
            {
              operation: "recognition",
              errorCode,
              errorType,
            }
          );

          setIsListening(false);
          setError(voiceError);
        };
        setRecognition(recog);
        isInitializedRef.current = true;
      } else {
        // Only log warning once per session
        if (!hasWarnedRef.current) {
          logger.warn("Speech recognition is not supported in this browser", {
            operation: "initialization",
            userAgent: navigator.userAgent,
          });
          hasWarnedRef.current = true;
        }

        const unsupportedError: VoiceRecognitionError = {
          type: "unsupported",
          messageKey: "voice_error_unsupported_browser",
          details: "Speech recognition not available",
        };

        setError(unsupportedError);
        isInitializedRef.current = true;
      }
    }
  }, [clearError, logger]);

  /**
   * @function startListening
   * @description Starts the speech recognition service if available and not already listening.
   * Clears any previous errors and sets appropriate error state if speech recognition is not supported.
   */
  const startListening = useCallback(() => {
    // Initialize recognition if not already done
    if (!isInitializedRef.current) {
      initializeRecognition();
    }

    if (!recognition) {
      const unsupportedError: VoiceRecognitionError = {
        type: "unsupported",
        messageKey: "voice_error_unsupported_browser",
        details: "Speech recognition not available",
      };
      setError(unsupportedError);
      return;
    }
    if (isListening) {
      logger.info("Already listening, ignoring start request");
      return; // Prevent starting multiple times
    }

    clearError(); // Clear any previous errors
    setIsListening(true);
    try {
      recognition.start();
    } catch (error) {
      const startError: VoiceRecognitionError = {
        type: "unknown",
        messageKey: "voice_error_start_failed",
        details: error instanceof Error ? error.message : String(error),
      };

      logger.error(
        "Error starting speech recognition",
        error instanceof Error ? error : new Error(String(error)),
        {
          operation: "start_recognition",
        }
      );

      setIsListening(false);
      setError(startError);
    }
  }, [recognition, isListening, clearError, logger, initializeRecognition]);

  return { isListening, error, startListening, clearError };
}
