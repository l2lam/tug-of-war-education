// Arcade Audio Synth using Web Audio API
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let ctx: AudioContext;

function getCtx() {
    if (!ctx) ctx = new AudioContext();
    return ctx;
}

function beep(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start();
    osc.stop(c.currentTime + duration);
}

import { SOUND_TYPE } from '../constants';

export function playSound(type: string) {
    switch (type) {
        case SOUND_TYPE.HIT:
            beep(600, 'square', 0.1);
            setTimeout(() => beep(900, 'square', 0.2), 50);
            break;
        case SOUND_TYPE.MISS:
            beep(150, 'sawtooth', 0.3);
            setTimeout(() => beep(100, 'sawtooth', 0.3), 100);
            break;
        case SOUND_TYPE.WIN:
            [440, 554, 659, 880].forEach((freq, i) => {
                setTimeout(() => beep(freq, 'square', 0.2), i * 100);
            });
            break;
    }
}

// Background Music System
export const MUSIC_TRACK = {
    MENU: 'MENU',
    GAMEPLAY: 'GAMEPLAY',
    VICTORY: 'VICTORY'
} as const;

export type MusicTrack = keyof typeof MUSIC_TRACK;

interface Note {
    freq: number;
    duration: number; // in 1/16 notes
}

interface TrackDef {
    bpm: number;
    melody: Note[];
    bassline: Note[];
    type: OscillatorType;
}

const FREQ = {
    REST: 0,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77
};

const TRACKS: Record<MusicTrack, TrackDef> = {
    [MUSIC_TRACK.MENU]: {
        bpm: 110,
        type: 'square',
        melody: [
            { freq: FREQ.C4, duration: 2 }, { freq: FREQ.E4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.C5, duration: 2 },
            { freq: FREQ.B4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.A4, duration: 2 }, { freq: FREQ.G4, duration: 2 },
            { freq: FREQ.F4, duration: 2 }, { freq: FREQ.A4, duration: 2 }, { freq: FREQ.C5, duration: 2 }, { freq: FREQ.A4, duration: 2 },
            { freq: FREQ.G4, duration: 4 }, { freq: FREQ.E4, duration: 4 }
        ],
        bassline: [
            { freq: FREQ.C3, duration: 4 }, { freq: FREQ.G3, duration: 4 }, { freq: FREQ.C3, duration: 4 }, { freq: FREQ.G3, duration: 4 },
            { freq: FREQ.F3, duration: 4 }, { freq: FREQ.C3, duration: 4 }, { freq: FREQ.G3, duration: 4 }, { freq: FREQ.E3, duration: 4 }
        ]
    },
    [MUSIC_TRACK.GAMEPLAY]: {
        bpm: 135,
        type: 'square',
        melody: [
            // Bar 1-2
            { freq: FREQ.C4, duration: 2 }, { freq: FREQ.E4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.C5, duration: 2 },
            { freq: FREQ.A4, duration: 2 }, { freq: FREQ.F4, duration: 2 }, { freq: FREQ.D4, duration: 2 }, { freq: FREQ.G4, duration: 2 },
            // Bar 3-4
            { freq: FREQ.E4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.C5, duration: 2 }, { freq: FREQ.B4, duration: 2 },
            { freq: FREQ.A4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.F4, duration: 2 }, { freq: FREQ.G4, duration: 2 },
            // Bar 5-6 (Variation)
            { freq: FREQ.C4, duration: 2 }, { freq: FREQ.E4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.C5, duration: 2 },
            { freq: FREQ.D5, duration: 2 }, { freq: FREQ.B4, duration: 2 }, { freq: FREQ.G4, duration: 2 }, { freq: FREQ.B4, duration: 2 },
            // Bar 7-8
            { freq: FREQ.C5, duration: 4 }, { freq: FREQ.G4, duration: 4 }, { freq: FREQ.E4, duration: 4 }, { freq: FREQ.C4, duration: 4 }
        ],
        bassline: [
            { freq: FREQ.C3, duration: 4 }, { freq: 110, duration: 4 }, { freq: FREQ.C3, duration: 4 }, { freq: 110, duration: 4 },
            { freq: 110, duration: 4 }, { freq: 87, duration: 4 }, { freq: FREQ.C3, duration: 4 }, { freq: 110, duration: 4 },
            { freq: FREQ.C3, duration: 4 }, { freq: 110, duration: 4 }, { freq: FREQ.C3, duration: 4 }, { freq: 110, duration: 4 },
            { freq: FREQ.F3, duration: 4 }, { freq: FREQ.G3, duration: 4 }, { freq: FREQ.C3, duration: 8 }
        ]
    },
    [MUSIC_TRACK.VICTORY]: {
        bpm: 140,
        type: 'square',
        melody: [
            { freq: FREQ.C4, duration: 2 }, { freq: FREQ.C4, duration: 2 }, { freq: FREQ.C4, duration: 2 }, { freq: FREQ.C4, duration: 4 },
            { freq: FREQ.G3, duration: 4 }, { freq: FREQ.A3, duration: 4 }, { freq: FREQ.C4, duration: 8 }
        ],
        bassline: [
            { freq: FREQ.C3, duration: 8 }, { freq: 98, duration: 8 }, { freq: FREQ.C3, duration: 16 }
        ]
    }
};

let musicGain: GainNode | null = null;
let musicOscillators: OscillatorNode[] = [];
let currentTrackTimeout: number | undefined;
let isPlaying = false;
let currentTrack: MusicTrack | null = null;

function playMusicNote(freq: number, duration: number, startTime: number, volume: number, type: OscillatorType) {
    if (freq === 0) return;
    const c = getCtx();
    const osc = c.createOscillator();
    const noteGain = c.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    noteGain.gain.setValueAtTime(0, startTime);
    noteGain.gain.linearRampToValueAtTime(volume, startTime + 0.01);
    noteGain.gain.setValueAtTime(volume, startTime + duration - 0.02);
    noteGain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(noteGain);
    noteGain.connect(musicGain!);

    osc.start(startTime);
    osc.stop(startTime + duration);

    musicOscillators.push(osc);
}

function scheduleMusicLoop(track: MusicTrack) {
    if (!isPlaying || !musicGain || currentTrack !== track) return;

    const def = TRACKS[track];
    const c = getCtx();
    const secondsPerSixteenth = (60 / def.bpm) / 4;
    const currentTime = c.currentTime;

    // Cleanup old oscillators periodically
    if (musicOscillators.length > 100) {
        musicOscillators = musicOscillators.filter(osc => {
            try {
                // @ts-ignore - non-standard but works in some browsers to check state
                return osc.playbackState !== 3; // FINISHED_STATE
            } catch (e) { return true; }
        });
    }

    let melodyTime = currentTime + 0.1;
    def.melody.forEach((note: Note) => {
        const dur = note.duration * secondsPerSixteenth;
        playMusicNote(note.freq, dur, melodyTime, 0.04, def.type);
        melodyTime += dur;
    });

    let bassTime = currentTime + 0.1;
    def.bassline.forEach((note: Note) => {
        const dur = note.duration * secondsPerSixteenth;
        playMusicNote(note.freq, dur, bassTime, 0.03, 'triangle');
        bassTime += dur;
    });

    const totalDuration = Math.max(
        def.melody.reduce((acc: number, n: Note) => acc + n.duration, 0),
        def.bassline.reduce((acc: number, n: Note) => acc + n.duration, 0)
    ) * secondsPerSixteenth;

    // Victory track doesn't loop
    if (track !== MUSIC_TRACK.VICTORY) {
        currentTrackTimeout = window.setTimeout(() => scheduleMusicLoop(track), (totalDuration * 1000) - 50);
    } else {
        isPlaying = false;
    }
}

export function startBackgroundMusic(track: MusicTrack = MUSIC_TRACK.MENU, volume: number = 0.3) {
    if (isPlaying && currentTrack === track) return;

    stopBackgroundMusic();

    const c = getCtx();
    if (c.state === 'suspended') c.resume();

    musicGain = c.createGain();
    const initialVol = Math.max(0, Math.min(1, volume));
    musicGain.gain.setValueAtTime(initialVol, c.currentTime);
    musicGain.connect(c.destination);

    isPlaying = true;
    currentTrack = track;
    scheduleMusicLoop(track);
}

export function stopBackgroundMusic() {
    isPlaying = false;
    currentTrack = null;
    if (currentTrackTimeout) {
        clearTimeout(currentTrackTimeout);
        currentTrackTimeout = undefined;
    }

    musicOscillators.forEach(osc => {
        try { osc.stop(); } catch (e) { }
    });
    musicOscillators = [];

    if (musicGain) {
        musicGain.disconnect();
        musicGain = null;
    }
}

export function setMusicVolume(volume: number) {
    if (musicGain) {
        const vol = Math.max(0, Math.min(1, volume));
        const c = getCtx();
        musicGain.gain.setTargetAtTime(vol, c.currentTime, 0.1);
    }
}

