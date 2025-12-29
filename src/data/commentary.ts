export const COMMENTARY_TYPE = {
    WINNING: 'winning',
    LOSING: 'losing',
    TIE: 'tie',
    IMMINENT_DEFEAT: 'imminent_defeat',
    IMMINENT_VICTORY: 'imminent_victory'
} as const;

export type CommentaryType = typeof COMMENTARY_TYPE[keyof typeof COMMENTARY_TYPE];

export const COMMENTARY: Record<CommentaryType, readonly string[]> = {
    [COMMENTARY_TYPE.WINNING]: [
        "They're breaking!",
        "Too easy!",
        "Heave!",
        "They're slipping!",
        "One more pull!",
        "Feel the burn!",
        "Victory is ours!",
        "Keep pulling!",
        "We got this!",
        "They look tired!",
        "You pull like worms!",
        "Losers!",
    ],
    [COMMENTARY_TYPE.LOSING]: [
        "Hold on!",
        "Dig in!",
        "No, no, no!",
        "Help!",
        "My arms!",
        "They're too strong!",
        "Don't give up!",
        "Slip!",
        "Need backup!",
        "Who fed them?"
    ],
    [COMMENTARY_TYPE.TIE]: [
        "Why is nothing happening?",
        "Pull!",
        "Grrrr!",
        "Somebody do something!",
        "Steady!",
        "Break the deadlock!",
        "Keep tension!",
        "Stay strong!"
    ],
    [COMMENTARY_TYPE.IMMINENT_DEFEAT]: [
        "It's over...",
        "Goodbye cruel world!",
        "I can't hold it!",
        "Retreat?",
        "Aaaahhh!",
        "Game over man!",
        "Sliding away!",
        "Not like this!",
        "Mercy!",
        "Doomed!",
        "Pull! you filthy animals!",
        "Tell Sarah I love her!",
        "Mommy"
    ],
    [COMMENTARY_TYPE.IMMINENT_VICTORY]: [
        "Go for the kill!",
        "Nananah nananah whey hey hey goodbye!",
        "Finish them!",
        "Bring it home!",
        "It's in the bag!",
        "Hahaha!",
        "One last yank!",
        "I almost feel sorry for them",
        "You guys suck!",
        "We are the champions, no time for losers",
        "Bye bye!"
    ]
};
