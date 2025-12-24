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
