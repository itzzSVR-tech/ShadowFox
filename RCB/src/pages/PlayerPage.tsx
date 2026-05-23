import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";
import { players } from "@/data/players";

interface PlayerPageProps {
    playerId: number;
    onNavigate: (page: string, playerId?: number) => void;
}

export function PlayerPage({ playerId, onNavigate }: PlayerPageProps) {
    const player = players.find((p) => p.id === playerId) ?? players[0];

    return (
        <div
            className="min-h-screen"
            style={{ background: "var(--rcb-darker)" }}
        >
            {/* Hero with background */}
            <div
                className="relative min-h-screen flex flex-col"
                style={{
                    background: `linear-gradient(to right, rgba(8,2,2,0.98) 30%, rgba(8,2,2,0.5) 70%, rgba(8,2,2,0.2) 100%), url('${player.actionImage ?? player.image}') right center/cover no-repeat`,
                }}
            >
                {/* Top glow effect */}
                <div
                    className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full opacity-30 blur-3xl pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(180,30,30,0.6) 0%, transparent 70%)",
                    }}
                />

                {/* Back navigation */}
                <div className="pt-24 px-6 md:px-16">
                    <button
                        onClick={() => onNavigate("roster")}
                        className="flex items-center gap-2 text-xs font-bold tracking-widest uppercase text-white/60 hover:text-white transition-colors group"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                        <ArrowLeft
                            size={14}
                            className="group-hover:-translate-x-1 transition-transform"
                        />
                        Back to Roster
                    </button>
                </div>

                {/* Player info */}
                <div className="flex-1 flex items-center px-6 md:px-16 py-16">
                    <div className="max-w-lg">
                        {/* Jersey number */}
                        <div
                            className="text-6xl md:text-8xl font-black leading-none mb-2"
                            style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                color: "var(--rcb-gold)",
                            }}
                        >
                            {player.number}
                        </div>

                        {/* Name */}
                        <h1 className="leading-none mb-1">
                            <div
                                className="text-6xl md:text-8xl font-black uppercase"
                                style={{
                                    fontFamily:
                                        "'Bebas Neue', sans-serif",
                                    color: "white",
                                    lineHeight: "0.9",
                                }}
                            >
                                {player.firstName}
                            </div>
                            <div
                                className="text-6xl md:text-8xl font-black uppercase"
                                style={{
                                    fontFamily:
                                        "'Bebas Neue', sans-serif",
                                    color: "var(--rcb-red)",
                                    lineHeight: "0.9",
                                }}
                            >
                                {player.lastName}
                            </div>
                        </h1>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mt-6">
                            {player.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider border"
                                    style={{
                                        fontFamily:
                                            "'Montserrat', sans-serif",
                                        borderColor:
                                            tag === "Icon" || tag === "Captain"
                                                ? "var(--rcb-gold)"
                                                : "rgba(255,255,255,0.3)",
                                        color:
                                            tag === "Icon" || tag === "Captain"
                                                ? "var(--rcb-gold)"
                                                : "white",
                                        background: "transparent",
                                        borderRadius: "2px",
                                        letterSpacing: "0.08em",
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Stats bar */}
                <div
                    className="relative z-10 mx-6 md:mx-16 mb-16 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-sm"
                    style={{ background: "var(--border)" }}
                >
                    {[
                        {
                            label: "IPL Matches",
                            value: player.stats.iplMatches.toString(),
                        },
                        {
                            label: "Total Runs",
                            value: player.stats.totalRuns.toLocaleString(),
                        },
                        {
                            label: "Strike Rate",
                            value: player.stats.strikeRate.toFixed(1),
                        },
                        {
                            label: "100s / 50s",
                            value: player.stats.hundreds.toString(),
                            suffix: `/ ${player.stats.fifties}`,
                        },
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="px-6 py-6"
                            style={{ background: "var(--rcb-dark)" }}
                        >
                            <div
                                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2"
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                            >
                                {stat.label}
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span
                                    className="text-4xl md:text-5xl font-black"
                                    style={{
                                        fontFamily:
                                            "'Bebas Neue', sans-serif",
                                        color: "white",
                                    }}
                                >
                                    {stat.value}
                                </span>
                                {stat.suffix && (
                                    <span
                                        className="text-xl font-bold text-muted-foreground"
                                        style={{
                                            fontFamily:
                                                "'Bebas Neue', sans-serif",
                                        }}
                                    >
                                        {stat.suffix}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer minimal />
        </div>
    );
}
