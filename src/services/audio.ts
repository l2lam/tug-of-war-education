// Arcade Audio Synth using Web Audio API
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
const ctx = new AudioContext();

function beep(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
}

import { SOUND_TYPE } from '../constants';

export function playSound(type: string) {
    switch (type) {
        case SOUND_TYPE.HIT:
            // High pitch jump sound
            beep(600, 'square', 0.1);
            setTimeout(() => beep(900, 'square', 0.2), 50);
            break;
        case SOUND_TYPE.MISS:
            // Low pitch error
            beep(150, 'sawtooth', 0.3);
            setTimeout(() => beep(100, 'sawtooth', 0.3), 100);
            break;
        case SOUND_TYPE.WIN:
            // Victory melody
            [440, 554, 659, 880].forEach((freq, i) => {
                setTimeout(() => beep(freq, 'square', 0.2), i * 100);
            });
            break;
    }
}
