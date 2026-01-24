export const PLAYER_ID = {
    LEFT: 'left',
    RIGHT: 'right'
} as const;

export type PlayerId = typeof PLAYER_ID[keyof typeof PLAYER_ID];

export const SOUND_TYPE = {
    HIT: 'hit',
    MISS: 'miss',
    WIN: 'win',
    SPAWN: 'spawn',
    ELIMINATE: 'eliminate'
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
    { id: 't-rex', name: 'T-Rex', emoji: '🦖', strength: 4.0 },
    { id: 'dragon', name: 'Dragon', emoji: '🐉', strength: 5.0 },
] as const;

export const SCREEN_ID = {
    CONFIG: 'config',
    GAME: 'game',
    TOPICS_EDITOR: 'topics-editor',
    ABOUT: 'about'
} as const;

export type ScreenId = typeof SCREEN_ID[keyof typeof SCREEN_ID];

export const STORAGE_KEYS = {
    MUSIC_VOLUME: 'musicVolume',
    CUSTOM_TOPICS: 'mock_custom_topics',
    CUSTOM_QUESTIONS: 'mock_custom_questions',
    PLAYER_CONFIG_PREFIX: 'player_config_',
    P1_NAME: 'last_p1_name',
    P2_NAME: 'last_p2_name',
    PULL_FORCE_MULTIPLIER: 'pullForceMultiplier'
} as const;

export const CATEGORY = {
    CUSTOM: 'Custom'
} as const;

export const POWER_TYPE = {
    STRENGTHEN: 'strengthen',
    WEAKEN: 'weaken'
} as const;

export type PowerType = typeof POWER_TYPE[keyof typeof POWER_TYPE];

export const POWER_CONFIG = {
    SPAWN_CHANCE: 0.005,
    DURATION: 5000, // Sprite stays on screen for 5s
    PHASE_DURATION: 5000, // Time to use power once caught
};

export const POWER_SPRITES_DATA = [
    { id: 'strawberry', emoji: '🍓', type: POWER_TYPE.STRENGTHEN, amount: 1, name: 'Strawberry' },
    { id: 'cherry', emoji: '🍒', type: POWER_TYPE.STRENGTHEN, amount: 2, name: 'Cherry' },
    { id: 'peach', emoji: '🍑', type: POWER_TYPE.STRENGTHEN, amount: 3, name: 'Peach' },
    { id: 'apple', emoji: '🍎', type: POWER_TYPE.STRENGTHEN, amount: 4, name: 'Apple' },
    { id: 'watermelon', emoji: '🍉', type: POWER_TYPE.STRENGTHEN, amount: 5, name: 'Watermelon' },
    { id: 'avocado', emoji: '🥑', type: POWER_TYPE.STRENGTHEN, amount: 6, name: 'Avocado' },
    { id: 'candy', emoji: '🍬', type: POWER_TYPE.STRENGTHEN, amount: 7, name: 'Candy' },
    { id: 'fairy', emoji: '🧚', type: POWER_TYPE.STRENGTHEN, amount: 8, name: 'Fairy' },
    { id: 'potion', emoji: '💖', type: POWER_TYPE.STRENGTHEN, amount: 9, name: 'Love' },
    { id: 'diamond', emoji: '💎', type: POWER_TYPE.STRENGTHEN, amount: 10, name: 'Diamond' },
    { id: 'hammer', emoji: '🔨', type: POWER_TYPE.WEAKEN, amount: 1, name: 'Hammer' },
    { id: 'poison', emoji: '☠️', type: POWER_TYPE.WEAKEN, amount: 2, name: 'Poison' },
    { id: 'fire', emoji: '🔥', type: POWER_TYPE.WEAKEN, amount: 3, name: 'Fire' },
    { id: 'bomb', emoji: '💥', type: POWER_TYPE.WEAKEN, amount: 4, name: 'Bomb' },
    { id: 'lightning', emoji: '⚡', type: POWER_TYPE.WEAKEN, amount: 5, name: 'Lightning' },
    { id: 'broken_heart', emoji: '💔', type: POWER_TYPE.WEAKEN, amount: 6, name: 'Broken Heart' },
] as const;

export const SPRITE_KEYS = [
    'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '5', '6', '7', '8', '9', '0'
];

export const TARGET_KEYS = {
    LEFT: ['q', 'w', 'e', 'r', 't', 'y'],
    RIGHT: ['u', 'i', 'o', 'p', 'j', 'k']
} as const;
