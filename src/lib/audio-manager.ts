/**
 * Global audio conflict manager
 * Ensures only ONE audio source plays at a time across the entire app
 * (Quran player + Radio player)
 */

type AudioSource = "quran" | "radio";
type StopCallback = () => void;

const listeners = new Map<AudioSource, StopCallback>();

export function registerAudioSource(source: AudioSource, stopFn: StopCallback) {
  listeners.set(source, stopFn);
}

export function requestAudioFocus(requester: AudioSource) {
  // Stop all other audio sources
  for (const [source, stopFn] of listeners.entries()) {
    if (source !== requester) {
      try { stopFn(); } catch { /* ignore */ }
    }
  }
}

export function unregisterAudioSource(source: AudioSource) {
  listeners.delete(source);
}
