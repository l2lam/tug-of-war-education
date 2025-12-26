export const PLAYER_ID = {
    LEFT: 'left',
    RIGHT: 'right'
} as const;

export type PlayerId = typeof PLAYER_ID[keyof typeof PLAYER_ID];

export const SOUND_TYPE = {
    HIT: 'hit',
    MISS: 'miss',
    WIN: 'win'
} as const;

export type SoundType = typeof SOUND_TYPE[keyof typeof SOUND_TYPE];

export const CHARACTERS = [
    { id: 'ant', name: 'Ant', emoji: '🐜', strength: 1.0 },
    { id: 'mouse', name: 'Mouse', emoji: '🐁', strength: 1.2 },
    { id: 'cat', name: 'Cat', emoji: '🐈', strength: 1.5 },
    { id: 'dog', name: 'Dog', emoji: '🐕', strength: 1.8 },
    { id: 'tiger', name: 'Tiger', emoji: '🐅', strength: 2.0 },
    { id: 'horse', name: 'Horse', emoji: '🐎', strength: 2.2 },
    { id: 'rhinoceros', name: 'Rhino', emoji: '🦏', strength: 2.2 },
    { id: 'elephant', name: 'Elephant', emoji: '🐘', strength: 3.0 },
    { id: 't-rex', name: 'T-Rex', emoji: '🦖', strength: 3.0 },
    { id: 'dragon', name: 'Dragon', emoji: '🐉', strength: 5.0 },
] as const;
