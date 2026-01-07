// Voice Utilities with Voice Selection

// Get all available voices
export const getAvailableVoices = (): SpeechSynthesisVoice[] => {
  return window.speechSynthesis.getVoices();
};

// Get selected voice from localStorage
export const getSelectedVoice = (): string | null => {
  return localStorage.getItem("selectedVoice");
};

// Set selected voice to localStorage
export const setSelectedVoice = (voiceName: string): void => {
  localStorage.setItem("selectedVoice", voiceName);
};

// Get voice settings from localStorage
export const getVoiceSettings = () => {
  const rate = localStorage.getItem("voiceRate");
  const pitch = localStorage.getItem("voicePitch");
  const volume = localStorage.getItem("voiceVolume");

  return {
    rate: rate ? parseFloat(rate) : 1.0,
    pitch: pitch ? parseFloat(pitch) : 1.0,
    volume: volume ? parseFloat(volume) : 1.0,
  };
};

// Set voice settings to localStorage
export const setVoiceSettings = (settings: {
  rate?: number;
  pitch?: number;
  volume?: number;
}) => {
  if (settings.rate !== undefined) {
    localStorage.setItem("voiceRate", settings.rate.toString());
  }
  if (settings.pitch !== undefined) {
    localStorage.setItem("voicePitch", settings.pitch.toString());
  }
  if (settings.volume !== undefined) {
    localStorage.setItem("voiceVolume", settings.volume.toString());
  }
};

// Main speak function with voice selection
export const speak = (text: string): void => {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const settings = getVoiceSettings();
  const selectedVoiceName = getSelectedVoice();

  // Apply settings
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;

  // Set selected voice if available
  if (selectedVoiceName) {
    const voices = getAvailableVoices();
    const voice = voices.find((v) => v.name === selectedVoiceName);
    if (voice) {
      utterance.voice = voice;
    }
  }

  window.speechSynthesis.speak(utterance);
};

// Test a voice with sample text
export const testVoice = (
  voiceName: string,
  text = "Hello, this is a voice preview"
): void => {
  const voices = getAvailableVoices();
  const voice = voices.find((v) => v.name === voiceName);

  if (!voice) {
    console.warn("Voice not found:", voiceName);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const settings = getVoiceSettings();

  utterance.voice = voice;
  utterance.rate = settings.rate;
  utterance.pitch = settings.pitch;
  utterance.volume = settings.volume;

  window.speechSynthesis.speak(utterance);
};

// Get recommended voices (English voices, prioritize high quality)
export const getRecommendedVoices = (): SpeechSynthesisVoice[] => {
  const voices = getAvailableVoices();

  // Filter for English voices
  const englishVoices = voices.filter((voice) => voice.lang.startsWith("en"));

  // Prioritize certain voice names (Google, Microsoft, Apple high quality)
  const priorityKeywords = [
    "Google",
    "Microsoft",
    "Premium",
    "Enhanced",
    "Natural",
  ];

  return englishVoices.sort((a, b) => {
    const aHasPriority = priorityKeywords.some((keyword) =>
      a.name.includes(keyword)
    );
    const bHasPriority = priorityKeywords.some((keyword) =>
      b.name.includes(keyword)
    );

    if (aHasPriority && !bHasPriority) return -1;
    if (!aHasPriority && bHasPriority) return 1;

    return a.name.localeCompare(b.name);
  });
};

// Group voices by language
export const getVoicesByLanguage = (): Record<
  string,
  SpeechSynthesisVoice[]
> => {
  const voices = getAvailableVoices();
  const grouped: Record<string, SpeechSynthesisVoice[]> = {};

  voices.forEach((voice) => {
    const lang = voice.lang.split("-")[0]; // Get base language (e.g., 'en' from 'en-US')
    if (!grouped[lang]) {
      grouped[lang] = [];
    }
    grouped[lang].push(voice);
  });

  return grouped;
};

// Get voice quality indicator
export const getVoiceQuality = (
  voice: SpeechSynthesisVoice
): "high" | "medium" | "low" => {
  const name = voice.name.toLowerCase();

  if (
    name.includes("premium") ||
    name.includes("enhanced") ||
    name.includes("natural") ||
    name.includes("neural")
  ) {
    return "high";
  }

  if (name.includes("google") || name.includes("microsoft")) {
    return "medium";
  }

  return "low";
};
