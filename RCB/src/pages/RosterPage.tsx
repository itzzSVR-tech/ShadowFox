import { Star } from "lucide-react";
import { Footer } from "@/components/Footer";
import { players } from "@/data/players";

interface RosterPageProps {
    onNavigate: (page: string, playerId?: number) => void;
}

export function RosterPage({ onNavigate }: RosterPageProps) {
    return (
        <div
            className="min-h-screen pt-20"
            style={{ background: "var(--rcb-darker)" }}
        >
            {/* Header */}
            <div className="px-6 md:px-16 py-12">
                <h1
                    className="text-5xl md:text-7xl font-black uppercase mb-3"
                    style={{
                        fontFamily: "'Bebas Neue', sans-serif",
                        color: "white",
                    }}
                >
                    <span style={{ color: "var(--rcb-red)" }}>\</span> The
                    Roster
                </h1>
                <p className="text-muted-foreground">
                    Meet the warriors of Royal Challengers Bangalore.
                </p>
            </div>

            {/* Player Grid */}
            <div className="px-6 md:px-16 pb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {players.map((player) => (
                        <button
                            key={player.id}
                            onClick={() => onNavigate("player", player.id)}
                            className="relative overflow-hidden rounded-sm group cursor-pointer text-left"
                            style={{
                                aspectRatio: "3/4",
                                background: "var(--rcb-dark)",
                            }}
                        >
                            <img
                                src={player.image}
                                alt={`${player.firstName} ${player.lastName}`}
                                className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background:
                                        "linear-gradient(to top, rgba(8,2,2,0.95) 0%, rgba(8,2,2,0.3) 50%, transparent 80%)",
                                }}
                            />

                            <div className="absolute top-4 left-4 z-10">
                                <span
                                    className="text-sm font-bold text-white/80"
                                    style={{
                                        fontFamily:
                                            "'Bebas Neue', sans-serif",
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

                            {/* Hover overlay */}
                            <div
                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                    background: "rgba(180,30,30,0.1)",
                                    borderBottom: "3px solid var(--rcb-red)",
                                }}
                            />

                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                                <div
                                    className="text-2xl font-black uppercase leading-none"
                                    style={{
                                        fontFamily:
                                            "'Bebas Neue', sans-serif",
                                        color: "white",
                                    }}
                                >
                                    {player.firstName}
                                </div>
                                <div
                                    className="text-2xl font-black uppercase leading-none"
                                    style={{
                                        fontFamily:
                                            "'Bebas Neue', sans-serif",
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
                </div>
            </div>

            <Footer />
        </div>
    );
}
