/**
 * @module global
 * @description Extends the global scope with types for the Web Speech API.
 */
declare global {
  /**
   * @interface SpeechRecognition
   * @extends EventTarget
   * @description Represents a speech recognition service.
   */
  interface SpeechRecognition extends EventTarget {
    /** Controls whether continuous results are returned for each recognition, or only a single result. Defaults to false. */
    continuous: boolean;
    /** Controls whether interim results are returned. Defaults to false. */
    interimResults: boolean;
    /** Sets the language of the recognition. */
    lang: string;
    /** Sets the maximum number of SpeechRecognitionAlternatives provided per result. Defaults to 1. */
    maxAlternatives: number;
    /** Starts the speech recognition service listening to incoming audio. */
    start(): void;
    /** Stops the speech recognition service from listening to incoming audio. */
    stop(): void;
    /** Stops the speech recognition service and discards any obtained results. */
    abort(): void;
    /** Fired when the speech recognition service returns a result. */
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
    /** Fired when a speech recognition error occurs. */
    onerror: ((this: SpeechRecognition, ev: Event) => void) | null;
  }

  /**
   * @interface SpeechRecognitionEvent
   * @extends Event
   * @description Represents the event object for the result event.
   */
  interface SpeechRecognitionEvent extends Event {
    /** The index of the current result in the results list. */
    resultIndex: number;
    /** A SpeechRecognitionResultList object representing all the speech recognition results for the current session. */
    results: SpeechRecognitionResultList;
  }

  /**
   * @interface SpeechRecognitionResultList
   * @description Represents a list of SpeechRecognitionResult objects.
   */
  interface SpeechRecognitionResultList {
    /** Accessor for individual SpeechRecognitionResult items. */
    [index: number]: SpeechRecognitionResult;
    /** The number of results in the list. */
    length: number;
  }

  /**
   * @interface SpeechRecognitionResult
   * @description Represents a single recognition match, which may contain multiple SpeechRecognitionAlternative objects.
   */
  interface SpeechRecognitionResult {
    /** A boolean value indicating whether this result is final (true) or interim (false). */
    isFinal: boolean;
    /** Accessor for individual SpeechRecognitionAlternative items. */
    [index: number]: SpeechRecognitionAlternative;
  }

  /**
   * @interface SpeechRecognitionAlternative
   * @description Represents a single word recognized by the speech recognition service.
   */
  interface SpeechRecognitionAlternative {
    /** A string containing the transcript of the recognized word. */
    transcript: string;
    /** A number representing the confidence level of the recognition, between 0 and 1. */
    confidence: number;
  }

  /**
   * @interface SpeechRecognitionConstructor
   * @description Represents the constructor for the SpeechRecognition object.
   */
  interface SpeechRecognitionConstructor {
    prototype: SpeechRecognition;
    new (): SpeechRecognition;
  }

  /**
   * @interface Window
   * @description Extends the global Window interface.
   */
  interface Window {
    /** Standard SpeechRecognition constructor. */
    SpeechRecognition: SpeechRecognitionConstructor;
    /** Prefixed SpeechRecognition constructor (for older browsers). */
    webkitSpeechRecognition: SpeechRecognitionConstructor;
  }
}

export {};
