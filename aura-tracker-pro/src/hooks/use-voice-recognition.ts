// hooks/use-voice-recognition.ts

import { useState, useEffect, useRef, useCallback } from "react";

interface VoiceRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  lang?: string;
  onResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export function useVoiceRecognition({
  continuous = true, // Changed default to true for better continuous listening
  interimResults = true,
  lang = "en-US",
  onResult,
  onError,
  onEnd,
}: VoiceRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isManualStopRef = useRef(false);
  const finalTranscriptRef = useRef("");
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      const recognition = new SpeechRecognition();

      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.lang = lang;
      recognition.maxAlternatives = 1;

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      setError("Speech recognition is not supported in this browser");
    }

    return () => {
      if (recognitionRef.current && isListening) {
        isManualStopRef.current = true;
        recognitionRef.current.stop();
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [continuous, interimResults, lang, isListening]);

  // Setup event handlers
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      // Clear any existing silence timeout
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      // Update transcript state with interim results
      if (interimResults) {
        setTranscript(interimTranscript || finalTranscript.trim());
      }

      // Accumulate final results
      if (finalTranscript) {
        finalTranscriptRef.current += finalTranscript;

        // Set a timeout to detect when user stops speaking
        // This allows for natural pauses in speech
        silenceTimeoutRef.current = setTimeout(() => {
          if (finalTranscriptRef.current.trim() && onResult) {
            onResult(finalTranscriptRef.current.trim());
            finalTranscriptRef.current = "";
            setTranscript(""); // Clear interim transcript after final result
          }
        }, 1500); // Wait 1.5 seconds of silence before finalizing
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error);

      // Ignore 'no-speech' errors during continuous listening
      if (event.error === "no-speech" && continuous) {
        return;
      }

      // Ignore 'aborted' errors when manually stopping
      if (event.error === "aborted" && isManualStopRef.current) {
        return;
      }

      let errorMessage = "Voice recognition error";

      switch (event.error) {
        case "no-speech":
          errorMessage = "No speech detected. Please try again.";
          break;
        case "audio-capture":
          errorMessage = "Microphone not available. Please check your device.";
          break;
        case "not-allowed":
          errorMessage =
            "Microphone permission denied. Please enable it in browser settings.";
          break;
        case "network":
          errorMessage = "Network error. Please check your connection.";
          break;
        case "aborted":
          return; // Don't show error for manual stops
        default:
          errorMessage = `Voice error: ${event.error}`;
      }

      setError(errorMessage);
      setIsListening(false);
      setTranscript("");
      finalTranscriptRef.current = "";

      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      // Clear any pending timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }

      // If there's accumulated text, send it
      if (
        finalTranscriptRef.current.trim() &&
        onResult &&
        !isManualStopRef.current
      ) {
        onResult(finalTranscriptRef.current.trim());
      }

      finalTranscriptRef.current = "";
      setTranscript("");

      // Auto-restart if continuous mode and not manually stopped
      if (continuous && isListening && !isManualStopRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          try {
            if (recognitionRef.current && isListening) {
              recognitionRef.current.start();
            }
          } catch (err) {
            console.error("Error restarting recognition:", err);
          }
        }, 100);
      } else {
        setIsListening(false);
        if (onEnd) {
          onEnd();
        }
      }

      // Reset manual stop flag
      isManualStopRef.current = false;
    };

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript("");
      finalTranscriptRef.current = "";
      isManualStopRef.current = false;
    };
  }, [continuous, interimResults, onResult, onError, onEnd, isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || !isSupported) {
      const errorMsg = "Voice recognition is not available";
      setError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    if (isListening) return;

    try {
      setError(null);
      setTranscript("");
      finalTranscriptRef.current = "";
      isManualStopRef.current = false;
      recognitionRef.current.start();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "Failed to start voice recognition";
      setError(errorMsg);
      if (onError) onError(errorMsg);
    }
  }, [isSupported, isListening, onError]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current || !isListening) return;

    try {
      isManualStopRef.current = true;

      // Clear any pending timeouts
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
      }

      // Send any accumulated text before stopping
      if (finalTranscriptRef.current.trim() && onResult) {
        onResult(finalTranscriptRef.current.trim());
      }

      recognitionRef.current.stop();
      finalTranscriptRef.current = "";
      setTranscript("");
    } catch (err) {
      console.error("Error stopping recognition:", err);
    }
  }, [isListening, onResult]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    finalTranscriptRef.current = "";
  }, []);

  return {
    isListening,
    isSupported,
    transcript,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}
