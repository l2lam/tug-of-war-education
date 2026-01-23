// Arcade Audio Synth using Web Audio API
const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
let ctx: AudioContext;

function getCtx() {
    if (!ctx) ctx = new AudioContext();
    return ctx;
}



import { SOUND_TYPE } from '../constants';

export function playSound(type: string) {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();

    const now = c.currentTime;

    switch (type) {
        case SOUND_TYPE.HIT:
            // Dramatic "Victory" Chord - Layered for punch
            {
                // Core Ding
                const osc1 = c.createOscillator();
                const gain1 = c.createGain();
                osc1.type = 'sine';
                osc1.frequency.setValueAtTime(1200, now);
                osc1.frequency.exponentialRampToValueAtTime(1800, now + 0.1);
                gain1.gain.setValueAtTime(0.4, now);
                gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc1.connect(gain1);
                gain1.connect(c.destination);
                osc1.start(now);
                osc1.stop(now + 0.4);

                // Brass-like "Triumph" Layer (Perfect 5th)
                const osc2 = c.createOscillator();
                const gain2 = c.createGain();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(800, now); // Approx E5
                gain2.gain.setValueAtTime(0.15, now);
                gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                osc2.connect(gain2);
                gain2.connect(c.destination);
                osc2.start(now);
                osc2.stop(now + 0.3);

                // High Sparkle (Octave + 5th)
                const osc3 = c.createOscillator();
                const gain3 = c.createGain();
                osc3.type = 'sine';
                osc3.frequency.setValueAtTime(2400, now);
                gain3.gain.setValueAtTime(0.1, now);
                gain3.gain.linearRampToValueAtTime(0, now + 0.15);
                osc3.connect(gain3);
                gain3.connect(c.destination);
                osc3.start(now);
                osc3.stop(now + 0.15);
            }
            break;

        case SOUND_TYPE.MISS:
            // Dramatic "Ouch" / "Failure" - Low minor chord cluster + descend
            {
                [110, 130, 155].forEach((freq) => { // Minor chord cluster
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(freq, now);
                    osc.frequency.linearRampToValueAtTime(freq * 0.7, now + 0.5);

                    gain.gain.setValueAtTime(0.2, now);
                    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

                    // Low pass filter to make it "heavy/muffled"
                    const filter = c.createBiquadFilter();
                    filter.type = 'lowpass';
                    filter.frequency.setValueAtTime(500, now);
                    filter.Q.value = 10;

                    osc.connect(filter);
                    filter.connect(gain);
                    gain.connect(c.destination);
                    osc.start(now);
                    osc.stop(now + 0.5);
                });

                // Sudden sharp discord hit at start
                const noise = c.createOscillator();
                const nGain = c.createGain();
                noise.type = 'square';
                noise.frequency.setValueAtTime(60, now);
                nGain.gain.setValueAtTime(0.1, now);
                nGain.gain.linearRampToValueAtTime(0, now + 0.1);
                noise.connect(nGain);
                nGain.connect(c.destination);
                noise.start(now);
                noise.stop(now + 0.1);
            }
            break;

        case SOUND_TYPE.SPAWN:
            // "Power Up" - Rapid slide up
            {
                const osc = c.createOscillator();
                const gain = c.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.linearRampToValueAtTime(600, now + 0.15);

                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0.15, now + 0.1);
                gain.gain.linearRampToValueAtTime(0, now + 0.2);

                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            break;

        case SOUND_TYPE.ELIMINATE:
            // "Shrink/Pop" - Quick slide down with noise feel
            {
                const osc = c.createOscillator();
                const gain = c.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);

                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            break;

        case SOUND_TYPE.WIN:
            // 1. Stop background music immediately
            stopBackgroundMusic();

            // 2. Heavy Impact Sound (Explosion/Slam)
            {
                // Noise burst
                const bufferSize = c.sampleRate * 0.5; // 0.5 sec
                const buffer = c.createBuffer(1, bufferSize, c.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = Math.random() * 2 - 1;
                }
                const noise = c.createBufferSource();
                noise.buffer = buffer;
                const noiseGain = c.createGain();

                noiseGain.gain.setValueAtTime(0.5, now);
                noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

                // Low pass filter sweeping down (Impact thud)
                const filter = c.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(800, now);
                filter.frequency.exponentialRampToValueAtTime(50, now + 0.3);

                noise.connect(filter);
                filter.connect(noiseGain);
                noiseGain.connect(c.destination);
                noise.start(now);

                // Sub-bass Kick
                const osc = c.createOscillator();
                const gain = c.createGain();
                osc.frequency.setValueAtTime(150, now);
                osc.frequency.exponentialRampToValueAtTime(40, now + 0.3);

                gain.gain.setValueAtTime(0.8, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(now);
                osc.stop(now + 0.3);
            }

            // 3. Announcer Voice ("You Win")
            // Delay slightly to let impact hit first
            setTimeout(() => {
                const utter = new SpeechSynthesisUtterance("You Win!");
                utter.pitch = 0.7; // Deep voice
                utter.rate = 0.9;  // Slightly slow
                utter.volume = 1.0;
                window.speechSynthesis.speak(utter);
            }, 300);

            // 4. Triumph Fanfare (Arcade Style) - Starts after voice/impact
            const fanfareStart = now + 1.2;

            // Fast Arpeggio Run
            const arpeggio = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            arpeggio.forEach((freq, i) => {
                const t = fanfareStart + (i * 0.06);
                const osc = c.createOscillator();
                const gain = c.createGain();
                osc.type = 'square';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.1, t);
                gain.gain.linearRampToValueAtTime(0, t + 0.06);
                osc.connect(gain);
                gain.connect(c.destination);
                osc.start(t);
                osc.stop(t + 0.06);
            });

            // Final Chords (Ba-Dum!)
            [
                { t: 0.3, freq: [783.99, 987.77, 1174.66] }, // G major (G5, B5, D6)
                { t: 0.6, freq: [1046.50, 1318.51, 1567.98] } // C Major (C6, E6, G6)
            ].forEach(chord => {
                const t = fanfareStart + chord.t;
                chord.freq.forEach(f => {
                    const osc = c.createOscillator();
                    const gain = c.createGain();
                    osc.type = 'sawtooth';
                    osc.frequency.value = f;

                    // Brass envelope
                    gain.gain.setValueAtTime(0, t);
                    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
                    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);

                    osc.connect(gain);
                    gain.connect(c.destination);
                    osc.start(t);
                    osc.stop(t + 0.6);
                });
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
        bpm: 150,
        type: 'square',
        melody: [
            // Theme A - Part 1
            { freq: FREQ.E5, duration: 4 }, { freq: FREQ.B4, duration: 2 }, { freq: FREQ.C5, duration: 2 }, { freq: FREQ.D5, duration: 4 },
            { freq: FREQ.C5, duration: 2 }, { freq: FREQ.B4, duration: 2 }, { freq: FREQ.A4, duration: 4 }, { freq: FREQ.A4, duration: 2 },
            { freq: FREQ.C5, duration: 2 }, { freq: FREQ.E5, duration: 4 }, { freq: FREQ.D5, duration: 2 }, { freq: FREQ.C5, duration: 2 },
            { freq: FREQ.B4, duration: 6 }, { freq: FREQ.C5, duration: 2 }, { freq: FREQ.D5, duration: 4 }, { freq: FREQ.E5, duration: 4 },
            { freq: FREQ.C5, duration: 4 }, { freq: FREQ.A4, duration: 4 }, { freq: FREQ.A4, duration: 8 },

            // Theme A - Part 2 (Bridge)
            { freq: FREQ.REST, duration: 2 }, { freq: FREQ.D5, duration: 2 }, { freq: FREQ.F5, duration: 4 }, { freq: FREQ.A5, duration: 4 },
            { freq: FREQ.G5, duration: 2 }, { freq: FREQ.F5, duration: 2 }, { freq: FREQ.E5, duration: 6 }, { freq: FREQ.C5, duration: 2 },
            { freq: FREQ.E5, duration: 4 }, { freq: FREQ.D5, duration: 2 }, { freq: FREQ.C5, duration: 2 }, { freq: FREQ.B4, duration: 4 },
            { freq: FREQ.B4, duration: 2 }, { freq: FREQ.C5, duration: 2 }, { freq: FREQ.D5, duration: 4 }, { freq: FREQ.E5, duration: 4 },
            { freq: FREQ.C5, duration: 4 }, { freq: FREQ.A4, duration: 4 }, { freq: FREQ.A4, duration: 8 },
            { freq: FREQ.REST, duration: 4 }
        ],
        bassline: [
            // Simple pumping bass
            { freq: FREQ.E3, duration: 4 }, { freq: FREQ.E4, duration: 4 }, { freq: FREQ.E3, duration: 4 }, { freq: FREQ.E4, duration: 4 },
            { freq: FREQ.A3, duration: 4 }, { freq: FREQ.A4, duration: 4 }, { freq: FREQ.A3, duration: 4 }, { freq: FREQ.A4, duration: 4 },
            { freq: FREQ.G3, duration: 4 }, { freq: FREQ.G4, duration: 4 }, { freq: FREQ.E3, duration: 4 }, { freq: FREQ.E4, duration: 4 },
            { freq: FREQ.B3, duration: 4 }, { freq: FREQ.B4, duration: 4 }, { freq: FREQ.A3, duration: 4 }, { freq: FREQ.A4, duration: 4 },

            // Bridge bass
            { freq: FREQ.D3, duration: 4 }, { freq: FREQ.D4, duration: 4 }, { freq: FREQ.F3, duration: 4 }, { freq: FREQ.F4, duration: 4 },
            { freq: FREQ.C3, duration: 4 }, { freq: FREQ.C4, duration: 4 }, { freq: FREQ.E3, duration: 4 }, { freq: FREQ.E4, duration: 4 },
            { freq: FREQ.E3, duration: 4 }, { freq: FREQ.E4, duration: 4 }, { freq: FREQ.G3, duration: 4 }, { freq: FREQ.G4, duration: 4 },
            { freq: FREQ.A3, duration: 4 }, { freq: FREQ.A4, duration: 4 }, { freq: FREQ.A3, duration: 4 }, { freq: FREQ.REST, duration: 4 }
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

