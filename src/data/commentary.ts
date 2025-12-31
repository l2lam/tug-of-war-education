export const COMMENTARY_TYPE = {
    WINNING: 'winning',
    LOSING: 'losing',
    TIE: 'tie',
    IMMINENT_DEFEAT: 'imminent_defeat',
    IMMINENT_VICTORY: 'imminent_victory',
    WINNING_LOSING_MOMENTUM: 'winning_losing_momentum',
    LOSING_GAINING_MOMENTUM: 'losing_gaining_momentum',
    WON: 'won',
    LOST: 'lost'
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
    ],
    [COMMENTARY_TYPE.WINNING_LOSING_MOMENTUM]: [
        "Wait, what's happening?",
        "They're coming back!",
        "Hold the line!",
        "Don't let them catch up!",
        "We're slipping!",
        "Focus!",
        "They're getting stronger!",
        "Uh oh...",
        "Keep the pressure on!",
        "Don't lose it now!"
    ],
    [COMMENTARY_TYPE.LOSING_GAINING_MOMENTUM]: [
        "We're coming back!",
        "I feel it turning!",
        "There's hope!",
        "Keep it up!",
        "We can do this!",
        "The tide is turning!",
        "They're weakening!",
        "Push harder!",
        "We're gaining ground!",
        "Don't stop now!"
    ],
    [COMMENTARY_TYPE.WON]: [
        "We did it!",
        "Victory!",
        "Champions!",
        "That's how it's done!",
        "Too easy!",
        "First try...",
        "Who's the best?",
        "They never had a chance!",
        "GG EZ!",
        "Who's your daddy?"
    ],
    [COMMENTARY_TYPE.LOST]: [
        "GG",
        "Nooo!",
        "We lost...",
        "Defeated...",
        "They were too strong",
        "Better luck next time fellas",
        "I gave it my all",
        "So close...",
        "We'll get them next time",
        "Ugh, embarrassing",
        "You got lucky",
        "Rematch!",
        "How did this happen?",
        "We have brought shame upon our family"
    ]
};
