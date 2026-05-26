import React, { useState, useEffect } from "react";
import {
    GameSettings,
    TriviaQuestion,
    GameStats,
    HOST_PERSONALITIES,
    HostPersonality,
} from "./types";
import GameSetup from "./components/GameSetup";
import HostCard from "./components/HostCard";
import {
    Flame,
    Timer,
    Sparkles,
    RefreshCw,
    ArrowRight,
    CheckCircle2,
    XCircle,
    BookOpen,
    Volume2,
    VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { gameAudio } from "./utils/audio";

export default function App() {
    const [gameStage, setGameStage] = useState<"setup" | "playing" | "summary">(
        "setup",
    );
    const [settings, setSettings] = useState<GameSettings | null>(null);
    const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
    const [stats, setStats] = useState<GameStats>({
        score: 0,
        currentQuestionIndex: 0,
        streak: 0,
        maxStreak: 0,
        answers: [],
        elapsedTime: 0,
    });

    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [hasAnswered, setHasAnswered] = useState<boolean>(false);
    const [isLastAnswerCorrect, setIsLastAnswerCorrect] = useState<
        boolean | null
    >(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Timers
    const [questionTimer, setQuestionTimer] = useState<number>(30); // 30 seconds per question
    const [totalTimer, setTotalTimer] = useState<number>(0);
    const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

    // Dynamic host evaluation for the finale
    const [hostFinaleReview, setHostFinaleReview] = useState<string>("");
    const [isGeneratingFinale, setIsGeneratingFinale] =
        useState<boolean>(false);

    // Global Audio Preference
    const [isMuted, setIsMuted] = useState<boolean>(() =>
        gameAudio.getMutedState(),
    );

    const toggleMuteState = () => {
        const newState = gameAudio.toggleMute();
        setIsMuted(newState);
    };

    const currentHost: HostPersonality = settings
        ? HOST_PERSONALITIES.find((h) => h.id === settings.personalityId) ||
          HOST_PERSONALITIES[0]
        : HOST_PERSONALITIES[0];

    const currentQuestion: TriviaQuestion | null =
        questions.length > 0 && stats.currentQuestionIndex < questions.length
            ? questions[stats.currentQuestionIndex]
            : null;

    // Track global elapsed game time
    useEffect(() => {
        let interval: any = null;
        if (isTimerActive && gameStage === "playing") {
            interval = setInterval(() => {
                setTotalTimer((prev) => prev + 1);
                setQuestionTimer((prev) => {
                    if (prev <= 1) {
                        // Time out handler
                        handleAnswer(""); // Treat empty as incorrect / skip
                        return 30;
                    }
                    if (prev <= 8) {
                        gameAudio.playWarningTick();
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerActive, gameStage, stats.currentQuestionIndex]);

    // Start a new game lobby
    const handleStartGame = async (gameSettings: GameSettings) => {
        setIsLoading(true);
        setError(null);
        setSettings(gameSettings);
        setTotalTimer(0);
        setQuestionTimer(30);

        try {
            const response = await fetch("/api/trivia/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(gameSettings),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(
                    data.error || "Failed to trigger AI host game parameters.",
                );
            }

            if (data.questions && data.questions.length > 0) {
                setQuestions(data.questions);
                setStats({
                    score: 0,
                    currentQuestionIndex: 0,
                    streak: 0,
                    maxStreak: 0,
                    answers: [],
                    elapsedTime: 0,
                });
                setGameStage("playing");
                setIsTimerActive(true);
            } else {
                throw new Error(
                    "No trivia questions received from host generator.",
                );
            }
        } catch (err: any) {
            console.error(err);
            setError(
                err.message ||
                    "Unable to synthesize questions. Please check backing systems.",
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Submit answer choice
    const handleAnswer = (option: string) => {
        if (hasAnswered || !currentQuestion) return;

        // Pause timer
        setIsTimerActive(false);

        const isCorrect =
            option.toLowerCase() ===
            currentQuestion.correctAnswer.toLowerCase();

        if (isCorrect) {
            gameAudio.playCorrect();
        } else {
            gameAudio.playIncorrect();
        }

        // Points logic: base rate (1000) + speed multiplier
        // Max 1000 additional points for answering instantly
        const speedBonus = isCorrect
            ? Math.round((questionTimer / 30) * 1000)
            : 0;
        const increment = isCorrect ? 1000 + speedBonus : 0;

        const newStreak = isCorrect ? stats.streak + 1 : 0;
        const newMaxStreak = Math.max(stats.maxStreak, newStreak);

        setSelectedAnswer(option || "(Timed Out)");
        setHasAnswered(true);
        setIsLastAnswerCorrect(isCorrect);

        setStats((prev) => ({
            ...prev,
            score: prev.score + increment,
            streak: newStreak,
            maxStreak: newMaxStreak,
            answers: [
                ...prev.answers,
                {
                    questionId: currentQuestion.id,
                    selectedAnswer: option,
                    isCorrect,
                    timeSpent: 30 - questionTimer,
                },
            ],
        }));
    };

    // Skip the current question (labeled as a tactical sacrifice)
    const handleSkipQuestion = () => {
        if (hasAnswered) return;
        handleAnswer("");
    };

    // Proceed to next trivia card or compile wrap-up remarks
    const handleNextQuestion = async () => {
        if (!settings) return;

        const isLast = stats.currentQuestionIndex + 1 >= questions.length;

        if (isLast) {
            setGameStage("summary");
            setIsTimerActive(false);
            gameAudio.playCompletionFanfare();
            await generateFinaleCommentary();
        } else {
            setStats((prev) => ({
                ...prev,
                currentQuestionIndex: prev.currentQuestionIndex + 1,
            }));
            // Reset temporary round states
            setSelectedAnswer(null);
            setHasAnswered(false);
            setIsLastAnswerCorrect(null);
            setQuestionTimer(30);
            setIsTimerActive(true);
        }
    };

    // Query AI custom summation remarks on completion
    const generateFinaleCommentary = async () => {
        if (!settings) return;
        setIsGeneratingFinale(true);
        setHostFinaleReview(
            "Calculating high-entropy brain cell score metrics...",
        );

        try {
            const summaryContext = `The user has completed the trivia game hosted by you. Here are the stats:
Questions Count: ${questions.length}
Score Reached: ${stats.score}
Correct Ratio: ${stats.answers.filter((a) => a.isCorrect).length}/${questions.length}
Max Streak: ${stats.maxStreak}
Total Time: ${formatTime(totalTimer)}`;

            const response = await fetch("/api/trivia/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [
                        {
                            id: "summary-prompt",
                            sender: "user",
                            text: "The trivia is complete! Pitch a descriptive summary evaluation of my intelligence based on my results.",
                        },
                    ],
                    questionContext: summaryContext,
                    personalityId: settings.personalityId,
                }),
            });

            const data = await response.json();
            if (response.ok && data.text) {
                setHostFinaleReview(data.text);
            } else {
                setHostFinaleReview(
                    "An incredible mental performance! You have conquered the AI Arena.",
                );
            }
        } catch {
            setHostFinaleReview(
                "Superb academic fortitude demonstrated! Proceed to review detailed telemetry metrics below.",
            );
        } finally {
            setIsGeneratingFinale(false);
        }
    };

    // Utilities: Format seconds into mm:ss
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    // Reset to game configuration lobby
    const handleReset = () => {
        setGameStage("setup");
        setSettings(null);
        setQuestions([]);
        setSelectedAnswer(null);
        setHasAnswered(false);
        setIsLastAnswerCorrect(null);
        setHostFinaleReview("");
    };

    return (
        <div className="relative min-h-screen bg-[#0a0a0c] text-[#e0e0e0] flex flex-col overflow-x-hidden font-sans select-none">
            {/* Sophisticated Dark Ambient atmospheric backing */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1a1a3a] rounded-full blur-[120px] opacity-25"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#2a1a10] rounded-full blur-[150px] opacity-25"></div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header Block with elegant metrics */}
                <header className="border-b border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md px-6 md:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col items-center sm:items-start">
                        <span className="text-[10px] uppercase tracking-[0.3em] text-[#d4af37]/60 mb-0.5 font-bold">
                            AI Trivia Arena
                        </span>
                        <span
                            className="text-xl font-light tracking-tight italic font-serif text-white/95 cursor-pointer"
                            onClick={handleReset}
                        >
                            {gameStage === "playing" && settings
                                ? `${settings.category.toUpperCase()} • ${settings.difficulty.toUpperCase()}`
                                : "Grand Archive: Premium Quiz Terminal"}
                        </span>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-10">
                        {gameStage === "playing" && (
                            <div className="flex items-center gap-6 md:gap-10 font-mono">
                                <div className="text-center">
                                    <span className="block text-[9px] uppercase tracking-[0.2em] text-white/40">
                                        Points
                                    </span>
                                    <span className="text-2xl font-light text-amber-500 font-serif">
                                        {stats.score.toLocaleString()}
                                    </span>
                                </div>

                                <div className="text-center border-l border-white/5 pl-6 md:pl-10">
                                    <span className="block text-[9px] uppercase tracking-[0.2em] text-white/40">
                                        Streak
                                    </span>
                                    <span className="text-2xl font-light text-[#d4af37] font-serif flex items-center justify-center gap-1">
                                        <Flame className="w-4.5 h-4.5 text-amber-500 fill-amber-500 animate-pulse" />
                                        x{stats.streak}
                                    </span>
                                </div>

                                <div className="text-center border-l border-white/5 pl-6 md:pl-10">
                                    <span className="block text-[9px] uppercase tracking-[0.2em] text-white/40">
                                        Time
                                    </span>
                                    <span
                                        className={`text-2xl font-light font-serif flex items-center justify-center gap-1 ${questionTimer <= 8 ? "text-red-400 animate-pulse" : "text-emerald-400/85"}`}
                                    >
                                        <Timer className="w-4.5 h-4.5" />
                                        {formatTime(totalTimer)}
                                    </span>
                                </div>
                            </div>
                        )}

                        {gameStage !== "playing" && (
                            <div className="text-stone-500 text-xs font-mono">
                                [SYSTEM ONLINE • V1.4]
                            </div>
                        )}

                        {/* Global Audio Controller */}
                        <button
                            onClick={toggleMuteState}
                            className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/5 text-stone-400 hover:text-[#d4af37] transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-mono"
                            title={
                                isMuted
                                    ? "Unmute all sound effects"
                                    : "Mute all sound effects"
                            }
                        >
                            {isMuted ? (
                                <>
                                    <VolumeX className="w-4 h-4 text-red-500" />
                                    <span className="hidden xs:inline">
                                        MUTED
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-4 h-4 text-[#d4af37]" />
                                    <span className="hidden xs:inline">
                                        SOUND ON
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </header>

                {/* Core Game Body */}
                <main className="flex-grow flex flex-col justify-center py-8">
                    <AnimatePresence mode="wait">
                        {/* STAGE A: SETUP */}
                        {gameStage === "setup" && (
                            <motion.div
                                key="setup"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="w-full"
                            >
                                {/* Embedded Setup with refined custom parameters */}
                                <div className="max-w-5xl mx-auto px-4">
                                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4 md:p-8 backdrop-blur-xl shadow-2xl">
                                        <GameSetup
                                            onStartGame={handleStartGame}
                                            isLoading={isLoading}
                                            error={error}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STAGE B: GAMEPLAY */}
                        {gameStage === "playing" &&
                            currentQuestion &&
                            settings && (
                                <motion.div
                                    key="playing"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    className="max-w-6xl mx-auto px-4 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                                >
                                    {/* Left Section: AI Host Avatar & Interactive Chat Frame */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-5 backdrop-blur-md">
                                            <HostCard
                                                personality={currentHost}
                                                currentQuestion={
                                                    currentQuestion
                                                }
                                                hasAnswered={hasAnswered}
                                                isLastAnswerCorrect={
                                                    isLastAnswerCorrect
                                                }
                                                stats={{
                                                    score: stats.score,
                                                    streak: stats.streak,
                                                    totalCount:
                                                        questions.length,
                                                    currentIndex:
                                                        stats.currentQuestionIndex,
                                                }}
                                            />
                                        </div>

                                        {/* Progressive Round Tracker Indicator */}
                                        <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex justify-between items-center text-xs font-mono text-stone-400">
                                            <span>PROGRESS BAR</span>
                                            <span>
                                                Q
                                                {stats.currentQuestionIndex + 1}{" "}
                                                of {questions.length}
                                            </span>
                                        </div>

                                        {/* Progress Dot Array */}
                                        <div className="flex gap-1.5 justify-center">
                                            {questions.map((_, idx) => {
                                                const isPast =
                                                    idx <
                                                    stats.currentQuestionIndex;
                                                const isCurrent =
                                                    idx ===
                                                    stats.currentQuestionIndex;
                                                let dotColor = "bg-white/10";
                                                if (isPast) {
                                                    const scoreItem =
                                                        stats.answers[idx];
                                                    dotColor =
                                                        scoreItem &&
                                                        scoreItem.isCorrect
                                                            ? "bg-emerald-500"
                                                            : "bg-red-500/80";
                                                } else if (isCurrent) {
                                                    dotColor =
                                                        "bg-[#d4af37] ring-4 ring-[#d4af37]/20";
                                                }
                                                return (
                                                    <div
                                                        key={idx}
                                                        className={`h-2 rounded-full transition-all duration-300 ${isCurrent ? "w-8" : "w-2.5"} ${dotColor}`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Right Section: Question Deck and Answers */}
                                    <div className="lg:col-span-8 space-y-6">
                                        {/* Dynamic Timer Countdown Bar */}
                                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${questionTimer <= 8 ? "bg-red-500" : "bg-emerald-400"}`}
                                                style={{
                                                    width: `${((questionTimer / 30) * 1000) / 10}%`,
                                                }}
                                            />
                                        </div>

                                        {/* Question Display Card */}
                                        <div className="bg-white/[0.01] border border-white/10 rounded-2xl p-6 md:p-10 backdrop-blur-lg relative overflow-hidden">
                                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#d4af37] font-bold block mb-4">
                                                Question{" "}
                                                {stats.currentQuestionIndex + 1}{" "}
                                                ({settings.difficulty})
                                            </span>

                                            <h2 className="text-2xl md:text-3xl font-serif text-white/95 leading-relaxed font-light italic">
                                                "{currentQuestion.question}"
                                            </h2>
                                        </div>

                                        {/* Answer Options Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentQuestion.options.map(
                                                (option, index) => {
                                                    const letter = [
                                                        "A",
                                                        "B",
                                                        "C",
                                                        "D",
                                                    ][index];
                                                    const isSelected =
                                                        selectedAnswer ===
                                                        option;
                                                    const isCorrectChoice =
                                                        option.toLowerCase() ===
                                                        currentQuestion.correctAnswer.toLowerCase();

                                                    let cardStyle =
                                                        "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-[#d4af37]/45 text-white/90";
                                                    let badgeStyle =
                                                        "text-white/20 group-hover:text-[#d4af37]/60";

                                                    if (hasAnswered) {
                                                        if (isCorrectChoice) {
                                                            // Correct Answer highlighted beautifully in gold/emerald style
                                                            cardStyle =
                                                                "bg-emerald-950/40 border-emerald-500/60 text-emerald-300 ring-2 ring-emerald-500/20";
                                                            badgeStyle =
                                                                "text-emerald-400 font-bold";
                                                        } else if (isSelected) {
                                                            // Confirmed false response
                                                            cardStyle =
                                                                "bg-red-950/40 border-red-500/60 text-red-300 ring-2 ring-red-500/20";
                                                            badgeStyle =
                                                                "text-red-400 font-bold";
                                                        } else {
                                                            // Non-selected wrong options
                                                            cardStyle =
                                                                "bg-white/[0.005] border-white/5 text-stone-500 cursor-not-allowed opacity-50";
                                                            badgeStyle =
                                                                "text-stone-700";
                                                        }
                                                    }

                                                    return (
                                                        <button
                                                            key={index}
                                                            disabled={
                                                                hasAnswered
                                                            }
                                                            onClick={() =>
                                                                handleAnswer(
                                                                    option,
                                                                )
                                                            }
                                                            className={`group relative p-6 rounded-md text-left transition-all duration-200 border flex items-center justify-between min-h-[85px] cursor-pointer ${cardStyle}`}
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-xs font-mono uppercase tracking-widest text-[#d4af37] mr-2">
                                                                    [{letter}]
                                                                </span>
                                                                <span className="text-base font-light tracking-wide">
                                                                    {option}
                                                                </span>
                                                            </div>

                                                            {/* Reveal tick or cross markers */}
                                                            {hasAnswered &&
                                                                isCorrectChoice && (
                                                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 ml-2" />
                                                                )}
                                                            {hasAnswered &&
                                                                isSelected &&
                                                                !isCorrectChoice && (
                                                                    <XCircle className="w-5 h-5 text-red-400 shrink-0 ml-2" />
                                                                )}
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </div>

                                        {/* Actions / Skip / Explanation Deck */}
                                        <div className="flex flex-col gap-4">
                                            {/* Active Review Panel */}
                                            <AnimatePresence>
                                                {hasAnswered && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        className="bg-white/[0.02] border border-white/10 rounded-xl p-6 space-y-3"
                                                    >
                                                        <div className="flex items-center gap-2 text-stone-400 text-xs font-mono uppercase tracking-wider">
                                                            <BookOpen className="w-4 h-4 text-[#d4af37]" />
                                                            <span>
                                                                Host Explanation
                                                                & Analysis
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-stone-200 leading-relaxed italic font-light">
                                                            {
                                                                currentQuestion.explanation
                                                            }
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            {/* Footer gameplay triggers */}
                                            <div className="flex justify-between items-center pt-2">
                                                {!hasAnswered ? (
                                                    <button
                                                        onClick={
                                                            handleSkipQuestion
                                                        }
                                                        className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-stone-300 font-mono text-xs uppercase tracking-wider rounded-lg transition-all"
                                                    >
                                                        Strategic Skip (0
                                                        points)
                                                    </button>
                                                ) : (
                                                    <div />
                                                )}

                                                <button
                                                    onClick={
                                                        hasAnswered
                                                            ? handleNextQuestion
                                                            : undefined
                                                    }
                                                    disabled={!hasAnswered}
                                                    className={`px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-stone-800 disabled:text-stone-500 disabled:border-stone-700 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2`}
                                                >
                                                    <span>
                                                        {stats.currentQuestionIndex +
                                                            1 ===
                                                        questions.length
                                                            ? "Compile Arena Feedback"
                                                            : "Proceed to Next Round"}
                                                    </span>
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                        {/* STAGE C: ARENA FINALE SUMMARY */}
                        {gameStage === "summary" && settings && (
                            <motion.div
                                key="summary"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                className="max-w-4xl mx-auto px-4 w-full space-y-8"
                            >
                                {/* Visual Trophy Splash Card */}
                                <div className="bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/10 rounded-2xl p-8 backdrop-blur-md relative overflow-hidden text-center space-y-6">
                                    {/* Absolute subtle background sparkles */}
                                    <div className="absolute top-6 left-6 text-yellow-500/20 text-3xl">
                                        ✨
                                    </div>
                                    <div className="absolute bottom-6 right-6 text-[#d4af37]/20 text-4xl">
                                        🔮
                                    </div>

                                    <div className="w-20 h-20 bg-white/5 border-2 border-[#d4af37]/30 rounded-full flex items-center justify-center mx-auto text-4xl shadow-lg">
                                        🏆
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-[10px] tracking-[0.3em] uppercase text-[#d4af37] font-bold block">
                                            Trivia Run Completed
                                        </span>
                                        <h2 className="text-3xl font-serif text-white/95 italic font-light">
                                            The Verdict is in...
                                        </h2>
                                    </div>

                                    {/* AI Evaluation Speech bubble */}
                                    <div className="max-w-2xl mx-auto bg-stone-900/60 border border-white/5 rounded-2xl p-5 text-sm text-stone-200 leading-relaxed text-left relative">
                                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/5">
                                            <span className="text-3xl">
                                                {currentHost.emoji}
                                            </span>
                                            <div>
                                                <h4 className="font-bold text-white">
                                                    {currentHost.name}
                                                </h4>
                                                <p className="text-[10px] text-stone-400 uppercase font-mono">
                                                    {currentHost.title}
                                                </p>
                                            </div>
                                        </div>

                                        {isGeneratingFinale ? (
                                            <div className="flex items-center gap-2 text-stone-400 font-mono italic">
                                                <span className="animate-spin w-3 h-3 border-2 border-stone-500 border-t-white rounded-full"></span>
                                                <span>
                                                    Compiling custom neural
                                                    appraisal feedback...
                                                </span>
                                            </div>
                                        ) : (
                                            <p className="italic font-light leading-relaxed">
                                                "{hostFinaleReview}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Scoreboard Metrics */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <span className="block text-[10px] uppercase text-stone-400 font-mono mb-1">
                                                Final Score
                                            </span>
                                            <span className="text-2xl font-serif text-amber-500 font-bold">
                                                {stats.score.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <span className="block text-[10px] uppercase text-stone-400 font-mono mb-1">
                                                Accuracy
                                            </span>
                                            <span className="text-2xl font-serif text-emerald-400 font-bold">
                                                {Math.round(
                                                    (stats.answers.filter(
                                                        (a) => a.isCorrect,
                                                    ).length /
                                                        questions.length) *
                                                        100,
                                                )}
                                                %
                                            </span>
                                        </div>

                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <span className="block text-[10px] uppercase text-stone-400 font-mono mb-1">
                                                Best Streak
                                            </span>
                                            <span className="text-2xl font-serif text-[#d4af37] font-bold">
                                                x{stats.maxStreak}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                                            <span className="block text-[10px] uppercase text-stone-400 font-mono mb-1">
                                                Total Time
                                            </span>
                                            <span className="text-2xl font-serif text-[#e0e0e0] font-bold">
                                                {formatTime(totalTimer)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Primary Playback buttons */}
                                    <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                                        <button
                                            onClick={handleReset}
                                            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-md transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <RefreshCw className="w-4 h-4 animate-spin-slow" />
                                            <span>
                                                Configure New Arena Lobby
                                            </span>
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleStartGame(settings)
                                            }
                                            className="px-6 py-3.5 bg-white/5 border border-white/10 hover:bg-white/10 text-stone-200 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            <Sparkles className="w-4 h-4 text-amber-300" />
                                            <span>Replay Same Settings</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Historical Question-Answer Review Telemetry */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-serif italic text-white/90 font-light border-b border-white/5 pb-2">
                                        Round Telemetry & Diagnostics
                                    </h3>

                                    <div className="space-y-3">
                                        {questions.map((q, idx) => {
                                            const ansItem = stats.answers.find(
                                                (a) => a.questionId === q.id,
                                            );
                                            const isCorrect =
                                                ansItem?.isCorrect;

                                            return (
                                                <div
                                                    key={q.id}
                                                    className="bg-white/[0.01] border border-white/5 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm"
                                                >
                                                    <div className="space-y-1 max-w-2xl">
                                                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#d4af37]">
                                                            Round {idx + 1}
                                                        </span>
                                                        <p className="font-semibold text-white/95">
                                                            "{q.question}"
                                                        </p>
                                                        <p className="text-xs text-stone-400">
                                                            Correct answer:{" "}
                                                            <span className="font-bold text-emerald-400">
                                                                {
                                                                    q.correctAnswer
                                                                }
                                                            </span>
                                                            {ansItem &&
                                                                ansItem.selectedAnswer && (
                                                                    <>
                                                                        {" "}
                                                                        •
                                                                        Played:{" "}
                                                                        <span
                                                                            className={`font-bold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}
                                                                        >
                                                                            {
                                                                                ansItem.selectedAnswer
                                                                            }
                                                                        </span>
                                                                    </>
                                                                )}
                                                        </p>
                                                    </div>

                                                    <div className="shrink-0 flex items-center gap-2 font-mono text-xs">
                                                        <span className="text-stone-500">
                                                            ⏱️{" "}
                                                            {ansItem
                                                                ? ansItem.timeSpent
                                                                : 0}
                                                            s
                                                        </span>
                                                        {isCorrect ? (
                                                            <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-md font-bold uppercase">
                                                                CORRECT
                                                            </span>
                                                        ) : (
                                                            <span className="px-2 py-1 bg-red-500/10 border border-red-500/30 text-red-400 rounded-md font-bold uppercase">
                                                                INCORRECT
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>

                {/* Footer Accent switcher & credentials */}
                <footer className="border-t border-white/5 bg-[#0a0a0c]/80 backdrop-blur-md px-6 md:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
                    <div className="flex items-center gap-2.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                        <span>AI ENGINE INTEGRITY ACTIVE</span>
                    </div>

                    <div className="text-center md:text-right">
                        <span>
                            &copy; Copyright {new Date().getFullYear()}{" "}
                            itzzSVRtech
                        </span>
                    </div>
                </footer>
            </div>
        </div>
    );
}
