import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { HomePage } from "@/pages/HomePage";
import { RosterPage } from "@/pages/RosterPage";
import { PlayerPage } from "@/pages/PlayerPage";
import { SchedulePage } from "@/pages/SchedulePage";
import { Toaster } from "@/components/ui/sonner";

type Page = "home" | "roster" | "player" | "schedule";

export function App() {
    const [currentPage, setCurrentPage] = useState<Page>("home");
    const [selectedPlayerId, setSelectedPlayerId] = useState<number>(1);

    const handleNavigate = (page: string, playerId?: number) => {
        if (page === "player" && playerId !== undefined) {
            setSelectedPlayerId(playerId);
            setCurrentPage("player");
        } else if (page === "roster") {
            setCurrentPage("roster");
        } else if (page === "schedule") {
            setCurrentPage("schedule");
        } else {
            setCurrentPage("home");
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div className="relative">
            <Navbar currentPage={currentPage} onNavigate={handleNavigate} />
            {currentPage === "home" && <HomePage onNavigate={handleNavigate} />}
            {currentPage === "roster" && (
                <RosterPage onNavigate={handleNavigate} />
            )}
            {currentPage === "player" && (
                <PlayerPage
                    playerId={selectedPlayerId}
                    onNavigate={handleNavigate}
                />
            )}
            {currentPage === "schedule" && (
                <SchedulePage onNavigate={handleNavigate} />
            )}
            <Toaster />
        </div>
    );
}

export default App;
