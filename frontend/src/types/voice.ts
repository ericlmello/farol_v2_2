// Tipos para APIs de voz do navegador

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition
    webkitSpeechRecognition: typeof SpeechRecognition
    speechSynthesis: SpeechSynthesis
  }
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognitionResultList {
  readonly length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  readonly length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechSynthesis extends EventTarget {
  speak(utterance: SpeechSynthesisUtterance): void
  cancel(): void
  pause(): void
  resume(): void
  getVoices(): SpeechSynthesisVoice[]
  onvoiceschanged: ((this: SpeechSynthesis, ev: Event) => any) | null
}

interface SpeechSynthesisUtterance extends EventTarget {
  text: string
  lang: string
  voice: SpeechSynthesisVoice | null
  volume: number
  rate: number
  pitch: number
  onstart: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onend: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisEvent) => any) | null
  onerror: ((this: SpeechSynthesisUtterance, ev: SpeechSynthesisErrorEvent) => any) | null
}

interface SpeechSynthesisEvent extends Event {
  charIndex: number
  charLength: number
  elapsedTime: number
  name: string
}

interface SpeechSynthesisErrorEvent extends SpeechSynthesisEvent {
  error: string
}

interface SpeechSynthesisVoice {
  voiceURI: string
  name: string
  lang: string
  localService: boolean
  default: boolean
}

export {}
