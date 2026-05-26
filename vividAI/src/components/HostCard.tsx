import React, { useState, useEffect, useRef } from "react";
import { HostPersonality, TriviaQuestion, ChatMessage } from "../types";
import { Lightbulb, Send, MessageCircle, Brain, Radio } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HostCardProps {
    personality: HostPersonality;
    currentQuestion: TriviaQuestion | null;
    hasAnswered: boolean;
    isLastAnswerCorrect: boolean | null;
    stats: {
        score: number;
        streak: number;
        totalCount: number;
        currentIndex: number;
    };
}

export default function HostCard({
    personality,
    currentQuestion,
    hasAnswered,
    isLastAnswerCorrect,
    stats,
}: HostCardProps) {
    const [expression, setExpression] = useState<string>(personality.emoji);
    const [speechText, setSpeechText] = useState<string>("");
    const [isSpeechLoading, setIsSpeechLoading] = useState<boolean>(false);

    // Interactive Chat State
    const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState<string>("");
    const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Sync personality avatar and starter remarks
    useEffect(() => {
        setExpression(personality.emoji);
        if (currentQuestion) {
            setSpeechText(currentQuestion.hostIntroComment);
        } else {
            setSpeechText(personality.catchphrase);
        }
    }, [personality, currentQuestion]);

    // Handle reaction updates when user answers
    useEffect(() => {
        if (hasAnswered && isLastAnswerCorrect !== null && currentQuestion) {
            setIsSpeechLoading(true);
            const timer = setTimeout(() => {
                setIsSpeechLoading(false);
                if (isLastAnswerCorrect) {
                    // Success expression states
                    const successEmojis: Record<string, string> = {
                        critic: "😏", // Smug smile
                        cheerleader: "🎉", // Sparkle joy
                        sage: "✨", // Cosmic harmony
                        announcer: "🤩", // Fanfare face
                        cyberpunk: "🟢", // System operational
                    };
                    setExpression(successEmojis[personality.id] || "🥳");
                    setSpeechText(currentQuestion.hostCorrectComment);
                } else {
                    // Error expression states
                    const failEmojis: Record<string, string> = {
                        critic: "🤦", // Disappointed facepalm
                        cheerleader: "🥺", // Encouraging tear
                        sage: "🌌", // Quiet void
                        announcer: "💥", // Dramatic explosion
                        cyberpunk: "🔴", // System fault state
                    };
                    setExpression(failEmojis[personality.id] || "🤔");
                    setSpeechText(currentQuestion.hostIncorrectComment);
                }
            }, 350);
            return () => clearTimeout(timer);
        }
    }, [hasAnswered, isLastAnswerCorrect, currentQuestion, personality]);

    // Scroll to bottom of chat session
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatMessages, isChatOpen]);

    // Fetch hint in Host's persona
    const handleGetHint = async () => {
        if (!currentQuestion) return;
        setIsSpeechLoading(true);
        setExpression("🤔");
        setSpeechText(
            "Consulting standard archival database logic structures...",
        );

        try {
            const response = await fetch("/api/trivia/hint", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: currentQuestion.question,
                    options: currentQuestion.options,
                    correctAnswer: currentQuestion.correctAnswer,
                    personalityId: personality.id,
                }),
            });
            const data = await response.json();
            if (response.ok && data.hint) {
                setSpeechText(data.hint);
                setExpression("💡");
            } else {
                setSpeechText(
                    `[DIAGNOSTICS_ERROR: ${data.error || "Cannot retrieve data vector hint"}]`,
                );
                setExpression("👾");
            }
        } catch (err) {
            setSpeechText(
                "Universal frequency interference spotted... Hint unavailable.",
            );
            setExpression("⚠️");
        } finally {
            setIsSpeechLoading(false);
        }
    };

    // Chat with the Host Handler
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isChatLoading) return;

        const userMsg: ChatMessage = {
            id: Math.random().toString(36).substring(7),
            sender: "user",
            text: inputValue.trim(),
            timestamp: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            }),
        };

        setChatMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsChatLoading(true);

        // AI thinking state
        setExpression("💭");

        try {
            const chatContext = currentQuestion
                ? `The current question is: "${currentQuestion.question}". Options: ${currentQuestion.options.join(", ")}.`
                : "The user has completed or is setting up the trivia match.";

            const formattedHistory = [...chatMessages, userMsg].slice(-6);

            const response = await fetch("/api/trivia/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: formattedHistory,
                    questionContext: chatContext,
                    personalityId: personality.id,
                }),
            });

            const data = await response.json();
            if (response.ok && data.text) {
                const hostMsg: ChatMessage = {
                    id: Math.random().toString(36).substring(7),
                    sender: "host",
                    text: data.text,
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
                setChatMessages((prev) => [...prev, hostMsg]);
                setSpeechText(data.text);
                setExpression(personality.emoji);
            } else {
                throw new Error(data.error || "Void response");
            }
        } catch (err: any) {
            const errorMsg: ChatMessage = {
                id: Math.random().toString(36).substring(7),
                sender: "host",
                text: `[SYSTEM: Telemetry link failure. ${err.message || "Please check connection params."}]`,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setChatMessages((prev) => [...prev, errorMsg]);
            setExpression("⚠️");
        } finally {
            setIsChatLoading(false);
        }
    };

    return (
        <div id="ai-host-card" className="space-y-4">
            {/* Visual Host Box */}
            <div className="bg-white/[0.01] rounded-xl border border-white/10 overflow-hidden shadow-xs">
                {/* Subtle decorative accent color strip */}
                <div className="h-1 bg-[#d4af37]" />

                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-3">
                        {/* Dynamic Interactive Avatar */}
                        <motion.div
                            key={expression}
                            initial={{ scale: 0.9, rotate: -3 }}
                            animate={{ scale: 1, rotate: 0 }}
                            className="w-14 h-14 bg-white/5 border border-white/15 rounded-xl flex items-center justify-center text-3xl shadow-inner relative select-none shrink-0"
                        >
                            {expression}

                            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#d4af37] border border-[#0a0a0c]"></span>
                            </span>
                        </motion.div>

                        <div>
                            <div className="flex items-center gap-1">
                                <Brain className="w-3 h-3 text-[#d4af37]" />
                                <span className="text-[10px] font-mono text-[#d4af37] tracking-wider uppercase">
                                    Active Arena Presenter
                                </span>
                            </div>
                            <h3 className="font-bold text-white text-base leading-tight mt-0.5">
                                {personality.name}
                            </h3>
                            <p className="text-[10px] text-stone-400 font-mono font-medium">
                                {personality.title}
                            </p>
                        </div>
                    </div>

                    {/* Speech dialogue container */}
                    <div className="relative">
                        <div className="absolute top-3 -left-1 w-2.5 h-2.5 bg-[#0e0e12] border-l border-b border-white/10 rotate-45" />
                        <div className="bg-[#0e0e12] border border-white/10 rounded-xl p-3.5 text-stone-300 text-xs min-h-[60px] flex items-center justify-start relative select-text">
                            {isSpeechLoading ? (
                                <div className="flex items-center gap-1.5 text-stone-500 font-mono">
                                    <span className="animate-pulse">●</span>
                                    <span className="animate-pulse delay-150">
                                        ●
                                    </span>
                                    <span className="animate-pulse delay-300">
                                        ●
                                    </span>
                                </div>
                            ) : (
                                <p className="leading-relaxed italic font-light font-serif">
                                    "{speechText}"
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Controls triggers */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        <button
                            onClick={handleGetHint}
                            disabled={
                                !currentQuestion ||
                                hasAnswered ||
                                isSpeechLoading
                            }
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:bg-white/[0.002] disabled:text-stone-600 disabled:border-white/5 border border-amber-500/20 font-bold text-[#d4af37] rounded-md transition-all cursor-pointer"
                        >
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Ask for Hint</span>
                        </button>

                        <button
                            onClick={() => {
                                setIsChatOpen(!isChatOpen);
                                if (chatMessages.length === 0) {
                                    setChatMessages([
                                        {
                                            id: "welcome",
                                            sender: "host",
                                            text: `Greetings, carbon lifeform! I am ${personality.name}. Let's discuss this trivia category or standard cosmos alignments. Banter away!`,
                                            timestamp:
                                                new Date().toLocaleTimeString(
                                                    [],
                                                    {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    },
                                                ),
                                        },
                                    ]);
                                }
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 font-bold text-indigo-300 rounded-md transition-all cursor-pointer"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>Banter Thread</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Dynamic Slide-Down Terminal Banter Deck */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#0e0e12] border border-white/10 rounded-xl overflow-hidden shadow-xl flex flex-col max-h-[350px]"
                    >
                        {/* Header console */}
                        <div className="bg-stone-950 px-4 py-2 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-1.5">
                                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                                <span className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-wider">
                                    Dialogue Thread ({personality.name})
                                </span>
                            </div>
                            <button
                                onClick={() => setIsChatOpen(false)}
                                className="text-stone-500 hover:text-white text-[9px] font-mono cursor-pointer"
                            >
                                [EXIT_FEED]
                            </button>
                        </div>

                        {/* Chat list messages window */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-3 min-h-[140px] max-h-[190px] select-text">
                            {chatMessages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex flex-col max-w-[85%] ${
                                        msg.sender === "user"
                                            ? "ml-auto items-end"
                                            : "mr-auto items-start"
                                    }`}
                                >
                                    <div
                                        className={`p-2.5 rounded-lg text-xs leading-relaxed ${
                                            msg.sender === "user"
                                                ? "bg-indigo-600/90 text-white"
                                                : "bg-white/[0.02] text-stone-200 border border-white/5"
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    <span className="text-[8px] text-stone-500 mt-1 font-mono px-1">
                                        {msg.sender === "user"
                                            ? "Player"
                                            : personality.name}{" "}
                                        • {msg.timestamp}
                                    </span>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono italic">
                                    <span className="animate-spin w-2.5 h-2.5 border border-stone-500 border-t-white rounded-full"></span>
                                    <span>Formulating host critique...</span>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Interactive feedback inputs */}
                        <form
                            onSubmit={handleSendMessage}
                            className="bg-stone-950 p-2 border-t border-white/5 flex gap-2"
                        >
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder={`Talk back to ${personality.name}...`}
                                className="flex-grow bg-white/[0.02] border border-white/5 text-white placeholder-stone-600 rounded-md px-3 py-1.5 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#d4af37]"
                            />
                            <button
                                type="submit"
                                disabled={!inputValue.trim() || isChatLoading}
                                className="px-3 bg-white/5 hover:bg-[#d4af37] disabled:bg-white/[0.001] disabled:text-stone-700 text-[#d4af37] hover:text-black hover:border-[#d4af37] rounded-md text-xs font-bold font-mono transition-all flex items-center justify-center cursor-pointer border border-white/5"
                            >
                                <Send className="w-3 h-3" />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
