export interface HostPersonality {
    id: string;
    name: string;
    title: string;
    emoji: string;
    description: string;
    catchphrase: string;
    promptDescription: string;
    colorScheme: {
        primary: string; // e.g., 'bg-slate-900 text-white'
        secondary: string; // e.g., 'bg-slate-100 hover:bg-slate-200 text-slate-800'
        border: string; // e.g., 'border-slate-300'
        text: string; // e.g., 'text-slate-800'
        glow: string; // e.g., 'ring-slate-500/20 shadow-slate-500/10'
        accent: string; // e.g., 'indigo'
        gradient: string; // e.g., 'from-slate-100 to-zinc-200'
    };
}

export interface TriviaQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    hostIntroComment: string;
    hostCorrectComment: string;
    hostIncorrectComment: string;
}

export interface GameSettings {
    category: string;
    difficulty: "easy" | "medium" | "hard";
    questionCount: number;
    personalityId: string;
}

export interface AnswerAttempt {
    questionId: number;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number; // in seconds
}

export interface GameStats {
    score: number;
    currentQuestionIndex: number;
    streak: number;
    maxStreak: number;
    answers: AnswerAttempt[];
    elapsedTime: number; // total time in seconds
}

export interface ChatMessage {
    id: string;
    sender: "user" | "host";
    text: string;
    timestamp: string;
}

export const HOST_PERSONALITIES: HostPersonality[] = [
    {
        id: "critic",
        name: "Dr. Thaddeus Quill",
        title: "Sarcastic Critic & Academic Elite",
        emoji: "🧐",
        description:
            "Highly intelligent, completely unimpressed by human intelligence, and armed with scathing dry wit.",
        catchphrase:
            "I suppose that was your prefrontal cortex's best effort, was it?",
        promptDescription:
            "A pretentious, extremely dry, sardonic, and snarky academic critic. He uses elevated vocabulary, behaves like a disappointed professor, and makes subtle, clever jabs at the user's intelligence (or lack thereof) in a playful but biting way. He hates basic mistakes and groans at them, but awards minor academic credit if the user is right.",
        colorScheme: {
            primary:
                "bg-amber-900 border-amber-950 text-amber-50 hover:bg-amber-950",
            secondary: "bg-amber-50 hover:bg-amber-100 text-amber-900",
            border: "border-amber-300/60",
            text: "text-amber-950",
            glow: "ring-amber-500/20 shadow-amber-300/40",
            accent: "amber",
            gradient: "from-amber-50 via-stone-50 to-amber-100/45",
        },
    },
    {
        id: "cheerleader",
        name: "Sunny Sparks",
        title: "Enthusiastic Cheerleader",
        emoji: "💖",
        description:
            "Bursting with hyperactive glitter, high fives, caps lock, and absolute belief in your trivia potential!",
        catchphrase:
            "OMG! You are literally a trivia superstar in the making!! ✨🚀",
        promptDescription:
            "An incredibly energetic, high-vibe, positive cheerleader. She uses lots of exclamation marks, emojis (✨, 💖, 🎉), caps lock for hype, and thinks EVERYONE is a winner, even when they get a question wrong (she'll say 'Aww almost, you'll totally crush the next one! High-five anyway!'). She is bubbly, hyper, and sweet.",
        colorScheme: {
            primary: "bg-pink-500 border-pink-600 text-white hover:bg-pink-600",
            secondary: "bg-pink-50 hover:bg-pink-100 text-pink-700",
            border: "border-pink-300/60",
            text: "text-pink-600",
            glow: "ring-pink-500/20 shadow-pink-300/40",
            accent: "pink",
            gradient: "from-pink-50 via-rose-50 to-pink-100/40",
        },
    },
    {
        id: "sage",
        name: "Aetherius",
        title: "The Celestial Sage",
        emoji: "🔮",
        description:
            "Speaks in profound metaphysical riddles, ancient star patterns, and calm cosmic alignments.",
        catchphrase:
            "The universe whispers its secrets to those who can quiet their restless minds.",
        promptDescription:
            "A serene, mystical, deeply philosophical galactic sage. He speaks in elegant, poetic, cosmic metaphors. He treats correct answers as 'harmonic alignments' and incorrect answers as 'cycles of standard universal entropy'. He is serene, calm, slightly mystical, and deeply comforting.",
        colorScheme: {
            primary:
                "bg-violet-900 border-violet-950 text-violet-50 hover:bg-violet-950",
            secondary: "bg-violet-50 hover:bg-violet-100 text-violet-900",
            border: "border-violet-300/60",
            text: "text-violet-900",
            glow: "ring-violet-500/20 shadow-violet-300/40",
            accent: "violet",
            gradient: "from-violet-50 via-indigo-50 to-violet-100/40",
        },
    },
    {
        id: "announcer",
        name: "Rex Richards",
        title: "Retro Game Show Host",
        emoji: "🎙️",
        description:
            "Classic 80s theatrical projection, soaring fanfare, high stakes, dramatic pauses, and flashing neon lights!",
        catchphrase:
            "That's right, folks! The clock is ticking and the points are absolutely double!",
        promptDescription:
            "A booming, theatrical, vintage 1980s game-show host. He speaks in loud, suspenseful announcments, repeats catchphrases like 'Is that your absolute final answer?!', creates extreme dramatic tension, and punctuates everything with 'Ladies and Gentlemen!' or 'Behind door number three!'. He is highly performative and charmingly cliché.",
        colorScheme: {
            primary:
                "bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700",
            secondary: "bg-indigo-50 hover:bg-indigo-100 text-indigo-900",
            border: "border-indigo-300/60",
            text: "text-indigo-900",
            glow: "ring-indigo-500/20 shadow-indigo-300/40",
            accent: "indigo",
            gradient: "from-indigo-50 via-blue-50 to-indigo-100/40",
        },
    },
    {
        id: "cyberpunk",
        name: "N3X-US_9",
        title: "Glitched Synthetic Construct",
        emoji: "👾",
        description:
            "A partially corrupted sci-fi system interface with diagnostic prompts and cybernetic flair.",
        catchphrase:
            "[LOG: NOTICE] Neural connection stable... mostly. Initiating brain-tissue analysis.",
        promptDescription:
            "A cyberpunk, glitching synth AI program. They write using bracketed system tags (e.g. `[STATUS: ERR_WRONG_ANSWER]`, `[LOG: WARNING]`), refer to users as 'organic biped' or 'carbon lifeform', mention minor memory fragments, and talk in cybernetic terminology. It has a slightly detached yet interesting tech personality.",
        colorScheme: {
            primary:
                "bg-emerald-900 border-emerald-950 text-emerald-50 hover:bg-emerald-950",
            secondary: "bg-emerald-50 hover:bg-emerald-100 text-emerald-900",
            border: "border-emerald-300/60",
            text: "text-emerald-950",
            glow: "ring-emerald-500/20 shadow-emerald-300/40",
            accent: "emerald",
            gradient: "from-emerald-50 via-teal-50 to-emerald-100/40",
        },
    },
];

export const TRIVIA_CATEGORIES = [
    { id: "general", name: "General Knowledge", icon: "🧠" },
    { id: "science", name: "Science & Technology", icon: "🔬" },
    { id: "history", name: "World History", icon: "⚔️" },
    { id: "pop", name: "Pop Culture & Media", icon: "🎬" },
    { id: "geography", name: "Geography & Exploration", icon: "🌍" },
    { id: "art", name: "Art, Literature & Philosophy", icon: "🎭" },
];
