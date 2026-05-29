import { useState } from 'react';

function playTone(frequency: number, duration = 0.09, volume = 0.03) {
  if (typeof window === 'undefined' || !('AudioContext' in window)) {
    return;
  }

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  gainNode.gain.value = volume;
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

export function useSound() {
  const [enabled, setEnabled] = useState(true);

  return {
    enabled,
    toggleSound: () => setEnabled((current) => !current),
    playClick: () => enabled && playTone(420),
    playError: () => enabled && playTone(180, 0.12, 0.04),
    playSuccess: () => enabled && playTone(660, 0.18, 0.05),
  };
}
