import React, { useState } from "react";
import {
    HOST_PERSONALITIES,
    TRIVIA_CATEGORIES,
    GameSettings,
    HostPersonality,
} from "../types";
import { Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface GameSetupProps {
    onStartGame: (settings: GameSettings) => void;
    isLoading: boolean;
    error: string | null;
}

export default function GameSetup({
    onStartGame,
    isLoading,
    error,
}: GameSetupProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("general");
    const [selectedDifficulty, setSelectedDifficulty] = useState<
        "easy" | "medium" | "hard"
    >("medium");
    const [questionCount, setQuestionCount] = useState<number>(5);
    const [selectedPersonality, setSelectedPersonality] =
        useState<string>("critic");

    const currentHost: HostPersonality =
        HOST_PERSONALITIES.find((h) => h.id === selectedPersonality) ||
        HOST_PERSONALITIES[0];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onStartGame({
            category: selectedCategory,
            difficulty: selectedDifficulty,
            questionCount,
            personalityId: selectedPersonality,
        });
    };

    return (
        <div id="game-setup-container" className="max-w-5xl mx-auto px-2 py-4">
            <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
            >
                <span className="px-3 py-1 text-[10px] font-mono tracking-wider font-semibold uppercase bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 rounded-full inline-block mb-3">
                    Generative AI Host Core v2
                </span>
                <h1 className="text-4xl md:text-5xl font-light tracking-tight text-white/95 font-serif">
                    Vivid{" "}
                    <span className="italic text-[#d4af37] font-serif pr-1">
                        AI Trivia Arena
                    </span>
                </h1>
                <p className="mt-3 text-sm text-stone-300 max-w-xl mx-auto font-light leading-relaxed">
                    Select an intellectual opponent, choose a topic domain, and
                    play in real-time under the supervision of a specialized AI
                    Host.
                </p>
            </motion.div>

            {error && (
                <div className="mb-6 p-4 bg-red-950/40 border border-red-500/30 text-red-300 rounded-xl flex items-start gap-4">
                    <span className="text-xl">⚠️</span>
                    <div className="text-sm">
                        <p className="font-semibold text-white">
                            Initialization Error
                        </p>
                        <p className="opacity-90">{error}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Select AI Host Personality */}
                <div className="bg-white/[0.01] p-6 rounded-xl border border-white/10">
                    <div className="flex items-center gap-2 mb-6">
                        <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-md text-[#d4af37] font-bold">
                            1
                        </span>
                        <div>
                            <h2 className="text-base font-serif font-light text-white/95">
                                Select Your Show Host Personality
                            </h2>
                            <p className="text-xs text-stone-400">
                                Each persona responds with original witty
                                remarks, hints, and custom summary analysis.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        {HOST_PERSONALITIES.map((personality) => {
                            const isSelected =
                                selectedPersonality === personality.id;
                            return (
                                <button
                                    type="button"
                                    key={personality.id}
                                    onClick={() =>
                                        setSelectedPersonality(personality.id)
                                    }
                                    className={`text-left p-4 rounded-md border transition-all duration-200 relative flex flex-col justify-between shrink-0 cursor-pointer ${
                                        isSelected
                                            ? "border-[#d4af37] bg-white/[0.03]/80 ring-2 ring-[#d4af37]/15"
                                            : "border-white/5 bg-white/[0.005] hover:border-white/20 hover:bg-white/[0.015]"
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span
                                                className="text-3xl select-none"
                                                role="img"
                                                aria-label={personality.name}
                                            >
                                                {personality.emoji}
                                            </span>
                                            {isSelected && (
                                                <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-[#d4af37] text-black flex items-center gap-1">
                                                    ACTIVE
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-xs leading-snug line-clamp-1">
                                                {personality.name}
                                            </h3>
                                            <p className="text-[10px] font-mono tracking-tight text-[#d4af37]/80 line-clamp-1">
                                                {personality.title}
                                            </p>
                                        </div>
                                        <p className="text-[11px] text-stone-400 line-clamp-3 leading-normal font-light">
                                            {personality.description}
                                        </p>
                                    </div>

                                    <div className="mt-4 pt-2.5 border-t border-white/5 text-[10px] italic text-stone-500 line-clamp-2">
                                        "{personality.catchphrase}"
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Special Preview of the chosen dynamic persona */}
                    <motion.div
                        layout
                        className="mt-6 p-4 rounded-xl border border-dashed border-white/5 bg-stone-900/40 flex flex-col sm:flex-row items-center gap-4"
                    >
                        <div className="text-3xl bg-white/5 p-2 rounded-full border border-white/10 shrink-0">
                            {currentHost.emoji}
                        </div>
                        <div className="space-y-1 text-center sm:text-left flex-grow">
                            <span className="text-[9px] font-mono font-bold text-[#d4af37] uppercase tracking-wider">
                                Dynamic Host Intro Hook
                            </span>
                            <p className="text-xs text-white font-serif italic">
                                "{currentHost.catchphrase}"
                            </p>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Step 2: Choose Category */}
                    <div className="bg-white/[0.01] p-6 rounded-xl border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-md text-[#d4af37] font-bold">
                                    2
                                </span>
                                <div>
                                    <h2 className="text-base font-serif font-light text-white/95">
                                        Choose Trivia Domain
                                    </h2>
                                    <p className="text-xs text-stone-400">
                                        Select a topic containing high depth
                                        intelligence vectors.
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {TRIVIA_CATEGORIES.map((cat) => {
                                    const isSelected =
                                        selectedCategory === cat.id;
                                    return (
                                        <button
                                            type="button"
                                            key={cat.id}
                                            onClick={() =>
                                                setSelectedCategory(cat.id)
                                            }
                                            className={`flex flex-col items-center justify-center p-4 rounded-md border transition-all text-center gap-2 cursor-pointer ${
                                                isSelected
                                                    ? "border-[#d4af37] bg-white/[0.03]/80 text-[#d4af37] font-semibold"
                                                    : "border-white/5 bg-white/[0.005] text-stone-300 hover:border-white/20 hover:bg-white/[0.012]"
                                            }`}
                                        >
                                            <span className="text-xl select-none">
                                                {cat.icon}
                                            </span>
                                            <span className="text-xs">
                                                {cat.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Game Parameters */}
                    <div className="bg-white/[0.01] p-6 rounded-xl border border-white/10 space-y-6">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-mono bg-white/5 border border-white/10 px-2.5 py-1.5 rounded-md text-[#d4af37] font-bold">
                                3
                            </span>
                            <div>
                                <h2 className="text-base font-serif font-light text-white/95">
                                    Set the Match Stakes
                                </h2>
                                <p className="text-xs text-stone-400">
                                    Configure round depth, complexity matrices,
                                    and variables.
                                </p>
                            </div>
                        </div>

                        {/* Difficulty chosen */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono tracking-wider font-bold text-stone-400 uppercase">
                                Difficulty Matrix Rank
                            </label>
                            <div className="flex bg-stone-900/60 p-1 rounded-lg border border-white/5">
                                {(["easy", "medium", "hard"] as const).map(
                                    (level) => (
                                        <button
                                            type="button"
                                            key={level}
                                            onClick={() =>
                                                setSelectedDifficulty(level)
                                            }
                                            className={`flex-1 py-1.5 text-[11px] font-bold text-center rounded-md transition-all uppercase cursor-pointer ${
                                                selectedDifficulty === level
                                                    ? "bg-white/10 text-[#d4af37] border border-[#d4af37]/20"
                                                    : "text-stone-400 hover:text-white/90"
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ),
                                )}
                            </div>
                        </div>

                        {/* Questions count choosing */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono tracking-wider font-bold text-stone-400 uppercase">
                                Round Question Count
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {[5, 10, 15].map((count) => (
                                    <button
                                        type="button"
                                        key={count}
                                        onClick={() => setQuestionCount(count)}
                                        className={`py-1.5 text-xs font-bold rounded-md border text-center transition-all cursor-pointer ${
                                            questionCount === count
                                                ? "border-[#d4af37] bg-white/[0.02]/80 text-[#d4af37]"
                                                : "border-white/5 text-stone-400 hover:bg-white/[0.01]"
                                        }`}
                                    >
                                        {count} Questions
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected variables recap footer */}
                        <div className="bg-stone-950 p-4 rounded-lg text-[11px] space-y-1.5 text-stone-400 border border-white/5 font-mono">
                            <div className="flex justify-between">
                                <span>ACTIVE HOST</span>
                                <span className="font-bold text-white">
                                    {currentHost.name}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>TOPIC DOMAIN</span>
                                <span className="font-bold text-white">
                                    {
                                        TRIVIA_CATEGORIES.find(
                                            (c) => c.id === selectedCategory,
                                        )?.name
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>COMPLEX LEVEL</span>
                                <span className="font-bold text-[#d4af37] uppercase">
                                    {selectedDifficulty}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Start Match Trigger Button */}
                <div className="pt-4 text-center">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto md:min-w-xs px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:border-stone-700 text-white font-bold text-sm lg:text-base rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 mx-auto cursor-pointer"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin h-5 w-5 text-indigo-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                <span>
                                    AI Host is Priming Arena Database...
                                </span>
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                <span>Enter Game Arena</span>
                            </>
                        )}
                    </button>

                    {isLoading && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="text-[11px] text-[#d4af37] font-mono mt-3 animate-pulse"
                        >
                            [LOG: GENERATION SIGNAL ACTIVE] Gemini is
                            orchestrating unique questions. Please stand by...
                        </motion.p>
                    )}
                </div>
            </form>
        </div>
    );
}
