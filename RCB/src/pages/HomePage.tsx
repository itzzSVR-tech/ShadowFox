import {
    ArrowRight,
    Play,
    ChartBar as BarChart2,
    Star,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { players, teamStats } from "@/data/players";

interface HomePageProps {
    onNavigate: (page: string, playerId?: number) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
    return (
        <div
            className="min-h-screen"
            style={{ background: "var(--rcb-darker)" }}
        >
            {/* Hero Section */}
            <section
                className="relative min-h-screen flex items-center justify-center overflow-hidden"
                style={{
                    background: `linear-gradient(to bottom, rgba(8,2,2,0.3) 0%, rgba(8,2,2,0.7) 60%, var(--rcb-darker) 100%), url('/stadium-bg.webp') center/cover no-repeat`,
                }}
            >
                {/* Stadium light glow effects */}
                <div
                    className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
                    style={{
                        background:
                            "radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)",
                    }}
                />

                <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
                    {/* Live Badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 border border-white/20"
                        style={{
                            background: "rgba(30,8,8,0.7)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <span
                            className="w-2 h-2 rounded-full animate-pulse"
                            style={{ background: "var(--rcb-red)" }}
                        />
                        <span className="text-xs font-semibold tracking-widest text-white uppercase">
                            Live Match Day
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1
                        className="text-7xl md:text-9xl font-black uppercase tracking-tight mb-6 leading-none"
                        style={{
                            fontFamily: "'Bebas Neue', sans-serif",
                            fontStyle: "italic",
                            color: "white",
                            textShadow: "0 0 80px rgba(180,30,30,0.5)",
                        }}
                    >
                        Play Bold
                    </h1>

                    <p className="text-white/70 text-base md:text-lg mb-10 max-w-lg mx-auto leading-relaxed">
                        The spirit of elite cricket. High-octane energy, premium
                        performance.
                    </p>

                    <div className="flex items-center justify-center gap-4 flex-wrap">
                        <Button
                            className="flex items-center gap-2 font-bold tracking-widest uppercase px-8 py-6 text-sm"
                            style={{
                                background: "var(--rcb-red)",
                                color: "white",
                                borderRadius: "2px",
                                fontFamily: "'Bebas Neue', sans-serif",
                                letterSpacing: "0.1em",
                            }}
                        >
                            <Play size={16} fill="white" />
                            Watch Live
                        </Button>
                        <Button
                            variant="outline"
                            className="font-bold tracking-widest uppercase px-8 py-6 text-sm border-white/40 hover:bg-white/10"
                            style={{
                                color: "white",
                                borderRadius: "2px",
                                fontFamily: "'Bebas Neue', sans-serif",
                                letterSpacing: "0.1em",
                                background: "transparent",
                            }}
                        >
                            Match Center
                        </Button>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
                    <div
                        className="w-px h-12"
                        style={{
                            background:
                                "linear-gradient(to bottom, white, transparent)",
                        }}
                    />
                </div>
            </section>

            {/* The Squad Section */}
            <section className="px-6 py-16 max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h2
                            className="text-3xl md:text-4xl font-black uppercase tracking-wide mb-2"
                            style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                color: "white",
                            }}
                        >
                            <span style={{ color: "var(--rcb-red)" }}>\</span>{" "}
                            The Squad
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Elite performers driving the bold narrative.
                        </p>
                    </div>
                    <button
                        onClick={() => onNavigate("roster")}
                        className="hidden md:flex items-center gap-2 text-sm font-semibold tracking-widest uppercase hover:text-white transition-colors"
                        style={{
                            color: "var(--rcb-gold)",
                            fontFamily: "'Bebas Neue', sans-serif",
                        }}
                    >
                        View Full Roster <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Player Cards */}
                    {players.slice(0, 3).map((player) => (
                        <button
                            key={player.id}
                            onClick={() => onNavigate("player", player.id)}
                            className="relative overflow-hidden rounded-sm group cursor-pointer text-left"
                            style={{
                                aspectRatio: "3/4",
                                background: "var(--rcb-dark)",
                            }}
                        >
                            {/* Player Image */}
                            <img
                                src={player.image}
                                alt={`${player.firstName} ${player.lastName}`}
                                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />

                            {/* Gradient overlay */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(to top, rgba(8,2,2,0.95) 0%, rgba(8,2,2,0.4) 40%, transparent 70%)",
                                }}
                            />

                            {/* Number badge */}
                            <div className="absolute top-4 left-4 z-10">
                                <span
                                    className="text-sm font-bold text-white/80"
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                    }}
                                >
                                    {player.number}
                                </span>
                                {player.isCaptain && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <Star
                                            size={10}
                                            className="fill-current"
                                            style={{ color: "var(--rcb-gold)" }}
                                        />
                                        <span
                                            className="text-xs font-bold uppercase tracking-wider"
                                            style={{
                                                color: "var(--rcb-gold)",
                                                fontFamily:
                                                    "'Bebas Neue', sans-serif",
                                            }}
                                        >
                                            Captain
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Player name */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                <div
                                    className="text-2xl font-black uppercase leading-none"
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        color: "white",
                                    }}
                                >
                                    {player.firstName}
                                </div>
                                <div
                                    className="text-2xl font-black uppercase leading-none"
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        color: "var(--rcb-gold)",
                                    }}
                                >
                                    {player.lastName}
                                </div>
                                <div
                                    className="text-xs uppercase tracking-widest text-white/60 mt-1"
                                    style={{
                                        fontFamily: "'Montserrat', sans-serif",
                                    }}
                                >
                                    {player.role}
                                </div>
                            </div>
                        </button>
                    ))}

                    {/* Team Stats Card */}
                    <div
                        className="rounded-sm p-6 flex flex-col justify-between"
                        style={{
                            background: "var(--rcb-dark)",
                            border: "1px solid var(--border)",
                        }}
                    >
                        <div>
                            <div className="mb-4">
                                <Zap
                                    size={28}
                                    style={{ color: "var(--rcb-gold)" }}
                                />
                            </div>
                            <h3
                                className="text-xl font-black uppercase tracking-wide mb-3"
                                style={{
                                    fontFamily: "'Bebas Neue', sans-serif",
                                    color: "white",
                                }}
                            >
                                Team Stats
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Dominating the pitch with high-octane
                                performance metrics.
                            </p>
                        </div>

                        <div className="space-y-4 mt-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Win Probability
                                    </span>
                                    <span
                                        className="text-sm font-bold"
                                        style={{ color: "var(--rcb-gold)" }}
                                    >
                                        {teamStats.winProbability}%
                                    </span>
                                </div>
                                <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ background: "var(--border)" }}
                                >
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            width: `${teamStats.winProbability}%`,
                                            background: "var(--rcb-red)",
                                        }}
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Powerplay Run Rate
                                    </span>
                                    <span
                                        className="text-sm font-bold"
                                        style={{ color: "var(--rcb-gold)" }}
                                    >
                                        {teamStats.powerplayRunRate}
                                    </span>
                                </div>
                                <div
                                    className="h-1.5 rounded-full overflow-hidden"
                                    style={{ background: "var(--border)" }}
                                >
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${(teamStats.powerplayRunRate / 12) * 100}%`,
                                            background: "var(--rcb-gold)",
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="mt-6 w-full flex items-center justify-center gap-2 font-bold tracking-widest uppercase text-xs py-5"
                            variant="outline"
                            style={{
                                borderColor: "var(--border)",
                                color: "white",
                                borderRadius: "2px",
                                fontFamily: "'Bebas Neue', sans-serif",
                                background: "transparent",
                            }}
                        >
                            View Analytics <BarChart2 size={14} />
                        </Button>
                    </div>
                </div>

                <div className="mt-6 md:hidden text-center">
                    <button
                        onClick={() => onNavigate("roster")}
                        className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase mx-auto"
                        style={{
                            color: "var(--rcb-gold)",
                            fontFamily: "'Bebas Neue', sans-serif",
                        }}
                    >
                        View Full Roster <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
