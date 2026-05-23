import { useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
    currentPage: "home" | "roster" | "player" | "schedule";
    onNavigate: (page: string, playerId?: number) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
            style={{
                background:
                    "linear-gradient(to bottom, rgba(10,2,2,0.95) 0%, rgba(10,2,2,0.7) 100%)",
            }}
        >
            <button
                onClick={() => onNavigate("home")}
                className="font-condensed text-2xl font-black tracking-widest"
                style={{
                    color: "var(--rcb-gold)",
                    fontFamily: "'Bebas Neue', sans-serif",
                }}
            >
                <img src="/rcb-logo.png" alt="RCB Logo" className="h-8" />
            </button>

            <div className="hidden md:flex items-center gap-8">
                {["Roster", "Schedule", "Fan Zone"].map((item) => {
                    const key = item.toLowerCase().replace(" ", "-");
                    const isActive =
                        (key === "roster" &&
                            (currentPage === "roster" ||
                                currentPage === "player")) ||
                        (key === "schedule" && currentPage === "schedule") ||
                        (key === "home" && currentPage === "home");
                    return (
                        <button
                            key={item}
                            onClick={() =>
                                onNavigate(key === "fan-zone" ? "home" : key)
                            }
                            className={`text-sm font-medium tracking-wide transition-colors hover:text-white ${isActive ? "text-white border-b-2 border-white pb-0.5" : "text-white/70"}`}
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                            {item}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center gap-3">
                <button className="text-white/70 hover:text-white transition-colors p-2">
                    <Search size={18} />
                </button>
                <Button
                    onClick={() => onNavigate("home")}
                    className="hidden md:flex font-bold tracking-widest text-xs px-5 py-2 uppercase"
                    style={{
                        background: "var(--rcb-red)",
                        color: "white",
                        borderRadius: "2px",
                        fontFamily: "'Bebas Neue', sans-serif",
                        letterSpacing: "0.1em",
                    }}
                >
                    Play Bold
                </Button>
                <button
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="absolute top-full left-0 right-0 bg-rcb-darker border-t border-border py-4 px-6 flex flex-col gap-4 md:hidden">
                    {["Roster", "Schedule", "Fan Zone"].map((item) => (
                        <button
                            key={item}
                            onClick={() => {
                                setMobileOpen(false);
                                onNavigate(
                                    item.toLowerCase().replace(" ", "-") ===
                                        "fan-zone"
                                        ? "home"
                                        : item.toLowerCase(),
                                );
                            }}
                            className="text-white/80 hover:text-white text-left text-sm font-medium tracking-wide"
                        >
                            {item}
                        </button>
                    ))}
                    <Button
                        className="font-bold tracking-widest text-xs px-5 py-2 uppercase w-fit"
                        style={{
                            background: "var(--rcb-red)",
                            color: "white",
                            borderRadius: "2px",
                            fontFamily: "'Bebas Neue', sans-serif",
                        }}
                    >
                        Play Bold
                    </Button>
                </div>
            )}
        </nav>
    );
}
