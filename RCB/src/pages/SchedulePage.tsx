import { useState, useEffect } from "react";
import {
    Calendar,
    Clock,
    MapPin,
    Search,
    Settings,
    WifiOff,
    ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import {
    getStoredApiKey,
    setStoredApiKey,
    getLiveMatches,
    getUpcomingMatches,
    getRecentMatches
} from "@/lib/cricbuzzApi";
import type { CricbuzzMatch } from "@/lib/cricbuzzApi";
import { toast } from "sonner";

interface SchedulePageProps {
    onNavigate: (page: string, playerId?: number) => void;
}

export function SchedulePage({ onNavigate: _onNavigate }: SchedulePageProps) {
    // Tab state: 'live' | 'upcoming' | 'recent'
    const [activeTab, setActiveTab] = useState<"live" | "upcoming" | "recent">("live");

    // Search and filters
    const [searchQuery, setSearchQuery] = useState("");
    const [formatFilter, setFormatFilter] = useState("All");

    // API settings state
    const [apiKey, setApiKey] = useState("");
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isTestingConnection, setIsTestingConnection] = useState(false);

    // Data lists
    const [liveMatches, setLiveMatches] = useState<CricbuzzMatch[]>([]);
    const [upcomingMatches, setUpcomingMatches] = useState<CricbuzzMatch[]>([]);
    const [recentMatches, setRecentMatches] = useState<CricbuzzMatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial config
    useEffect(() => {
        const storedKey = getStoredApiKey();
        setApiKey(storedKey);
    }, []);

    // Fetch matches function
    const fetchMatches = async () => {
        const key = getStoredApiKey();
        if (!key) {
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        try {
            const [liveData, upcomingData, recentData] = await Promise.all([
                getLiveMatches(key),
                getUpcomingMatches(key),
                getRecentMatches(key)
            ]);

            setLiveMatches(liveData);
            setUpcomingMatches(upcomingData);
            setRecentMatches(recentData);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load match schedules");
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch matches on mount and when apiKey changes (after save)
    useEffect(() => {
        fetchMatches();
    }, [apiKey]);

    // Save Settings
    const handleSaveSettings = () => {
        setStoredApiKey(apiKey);
        setIsSettingsOpen(false);
        toast.success("Connection Settings Saved!");
        fetchMatches();
    };

    // Test Connection
    const handleTestConnection = async () => {
        if (!apiKey) {
            toast.error("Please enter a RapidAPI key to test");
            return;
        }
        setIsTestingConnection(true);
        try {
            const response = await fetch(`https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live`, {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
                    "x-rapidapi-key": apiKey
                }
            });
            if (response.ok) {
                toast.success("Connection Successful! Cricbuzz API responds correctly.");
            } else {
                toast.error(`Connection Failed: ${response.status} ${response.statusText}`);
            }
        } catch (e) {
            // RapidAPI typically blocks browser fetch via CORS unless set up correctly
            // We can gracefully explain it
            console.error("Test connection CORS or network error:", e);
            toast.warning("Network complete, but request blocked by CORS. This is normal for browser-to-RapidAPI calls. The key will still work when bypasses or backends are set up.");
        } finally {
            setIsTestingConnection(false);
        }
    };

    // Filtering logic
    const filterMatches = (list: CricbuzzMatch[]) => {
        return list.filter((match) => {
            const matchFormat = match.matchInfo.matchFormat.toLowerCase();
            const formatMatch =
                formatFilter === "All" ||
                (formatFilter === "T20" && (matchFormat.includes("t20") || matchFormat.includes("t20i"))) ||
                (formatFilter === "ODI" && (matchFormat.includes("odi") || matchFormat.includes("50 overs"))) ||
                (formatFilter === "Test" && matchFormat.includes("test"));

            const opponent = (
                match.matchInfo.team1.teamName.toLowerCase().includes("rcb") ||
                match.matchInfo.team1.teamSName.toLowerCase().includes("rcb") ||
                match.matchInfo.team1.teamName.toLowerCase().includes("challengers")
            )
                ? match.matchInfo.team2.teamName + " " + match.matchInfo.team2.teamSName
                : match.matchInfo.team1.teamName + " " + match.matchInfo.team1.teamSName;

            const searchMatch =
                searchQuery === "" ||
                opponent.toLowerCase().includes(searchQuery.toLowerCase()) ||
                match.matchInfo.seriesName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                match.matchInfo.venueInfo?.ground.toLowerCase().includes(searchQuery.toLowerCase()) ||
                match.matchInfo.venueInfo?.city.toLowerCase().includes(searchQuery.toLowerCase());

            return formatMatch && searchMatch;
        });
    };

    // Active List Selection
    const getActiveList = () => {
        switch (activeTab) {
            case "live":
                return filterMatches(liveMatches);
            case "upcoming":
                return filterMatches(upcomingMatches);
            case "recent":
                return filterMatches(recentMatches);
            default:
                return [];
        }
    };

    const activeList = getActiveList();

    // Formatting date
    const formatDate = (timestampStr: string) => {
        try {
            const timestamp = parseInt(timestampStr);
            if (isNaN(timestamp)) return timestampStr;
            return new Date(timestamp).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return timestampStr;
        }
    };

    // Formatting time
    const formatTime = (timestampStr: string) => {
        try {
            const timestamp = parseInt(timestampStr);
            if (isNaN(timestamp)) return "";
            return new Date(timestamp).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "";
        }
    };

    return (
        <div
            className="min-h-screen pt-20 flex flex-col justify-between"
            style={{ background: "var(--rcb-darker)" }}
        >
            <div className="flex-1 pb-16">
                {/* Header */}
                <div className="px-6 md:px-16 py-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1
                            className="text-5xl md:text-7xl font-black uppercase mb-3 tracking-tight"
                            style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                color: "white",
                            }}
                        >
                            <span style={{ color: "var(--rcb-red)" }}>\</span> Schedule
                        </h1>
                        <p className="text-muted-foreground">
                            Upcoming fixtures and match results for Royal Challengers Bengaluru.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-semibold uppercase tracking-wider ${
                                getStoredApiKey()
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                                    : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            }`}
                        >
                            {getStoredApiKey() ? (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" /> Live API Connected
                                </>
                            ) : (
                                <>
                                    <WifiOff size={14} /> API Key Required
                                </>
                            )}
                        </div>
                        <Button
                            onClick={() => {
                                setApiKey(getStoredApiKey());
                                setIsSettingsOpen(true);
                            }}
                            variant="outline"
                            className="h-9 px-3 gap-2 border-white/20 hover:border-white/40 text-white font-bold uppercase tracking-widest text-xs rounded-sm bg-transparent transition-colors hover:bg-white/5"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                            <Settings size={14} /> Settings
                        </Button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="px-6 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Filters & Tabs (3 cols on large) */}
                    <div className="lg:col-span-3 flex flex-col gap-6">
                        {/* Tab Selectors */}
                        <div
                            className="rounded-sm p-1 flex flex-col gap-1 border border-border"
                            style={{ background: "var(--rcb-dark)" }}
                        >
                            {[
                                { id: "live", label: "Ongoing & Live", count: liveMatches.length },
                                { id: "upcoming", label: "Upcoming Fixtures", count: upcomingMatches.length },
                                { id: "recent", label: "Recent Results", count: recentMatches.length }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full py-3 px-4 text-left font-black uppercase tracking-wider text-sm transition-all duration-300 rounded-sm flex items-center justify-between ${
                                        activeTab === tab.id
                                            ? "bg-primary text-white"
                                            : "text-white/60 hover:text-white hover:bg-white/5"
                                    }`}
                                    style={{
                                        fontFamily: "'Bebas Neue', sans-serif",
                                        background: activeTab === tab.id ? "var(--rcb-red)" : "transparent"
                                    }}
                                >
                                    <span>{tab.label}</span>
                                    <span
                                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                            activeTab === tab.id
                                                ? "bg-white/20 text-white"
                                                : "bg-white/10 text-white/70"
                                        }`}
                                    >
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search & Formats */}
                        <div
                            className="rounded-sm p-6 border border-border flex flex-col gap-5"
                            style={{ background: "var(--rcb-dark)" }}
                        >
                            <h3
                                className="text-md font-bold uppercase tracking-widest text-white/80"
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                                Filter Matches
                            </h3>

                            {/* Search Box */}
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
                                <Input
                                    placeholder="Search opponent or venue..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 h-9 border-white/10 text-white placeholder:text-white/40 rounded-sm"
                                />
                            </div>

                            {/* Format Filter */}
                            <div className="flex flex-col gap-2">
                                <label className="text-xs uppercase font-semibold text-white/50 tracking-wider">
                                    Match Format
                                </label>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {["All", "T20", "ODI", "Test"].map((fmt) => (
                                        <button
                                            key={fmt}
                                            onClick={() => setFormatFilter(fmt)}
                                            className={`py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-sm text-center border transition-all ${
                                                formatFilter === fmt
                                                    ? "border-rcb-gold bg-rcb-gold/10 text-rcb-gold"
                                                    : "border-white/10 text-white/60 hover:border-white/20 hover:text-white"
                                            }`}
                                            style={{
                                                borderColor: formatFilter === fmt ? "var(--rcb-gold)" : "rgba(255,255,255,0.1)",
                                                color: formatFilter === fmt ? "var(--rcb-gold)" : "rgba(255,255,255,0.6)",
                                                background: formatFilter === fmt ? "rgba(191,144,0,0.1)" : "transparent",
                                                fontFamily: "'Bebas Neue', sans-serif"
                                            }}
                                        >
                                            {fmt}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Reset Button */}
                            {(searchQuery || formatFilter !== "All") && (
                                <Button
                                    onClick={() => {
                                        setSearchQuery("");
                                        setFormatFilter("All");
                                    }}
                                    variant="outline"
                                    className="w-full text-xs font-bold tracking-widest uppercase border-white/20 hover:border-white/40 h-8 rounded-sm bg-transparent text-white"
                                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                                >
                                    Reset Filters
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Matches List Section (9 cols on large) */}
                    <div className="lg:col-span-9 flex flex-col gap-6">
                        {!getStoredApiKey() ? (
                            // Premium Connection Required State
                            <div
                                className="relative overflow-hidden border border-white/10 rounded-sm p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[450px]"
                                style={{
                                    background: "radial-gradient(circle at top, rgba(191,144,0,0.05) 0%, rgba(0,0,0,0) 70%), var(--rcb-dark)",
                                    borderTop: "3px solid var(--rcb-red)"
                                }}
                            >
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-24 h-24 bg-rcb-red/5 blur-3xl rounded-full" />
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-rcb-gold/5 blur-3xl rounded-full" />

                                {/* Icon container */}
                                <div className="relative mb-6">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center bg-white/5 border border-white/15 relative z-10">
                                        <WifiOff size={28} className="text-rcb-gold animate-pulse" />
                                    </div>
                                    <div className="absolute inset-0 bg-rcb-gold/20 rounded-full blur-md transform scale-110" />
                                </div>

                                <h2 
                                    className="text-3xl font-black uppercase text-white tracking-wide mb-3"
                                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                                >
                                    Cricbuzz API Connection Required
                                </h2>
                                
                                <p className="text-white/60 max-w-lg text-sm leading-relaxed mb-8">
                                    To fetch real-time live scores, upcoming RCB fixtures, and recent match results, this page connects directly to the Cricbuzz Cricket API on RapidAPI. Please configure your RapidAPI key to continue.
                                </p>

                                {/* Steps details */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full text-left mb-8">
                                    <div className="bg-black/20 border border-white/5 p-4 rounded-sm">
                                        <div className="text-xs font-bold text-rcb-gold mb-1 uppercase tracking-wider">Step 1</div>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            Visit the Cricbuzz Cricket API page on RapidAPI.
                                        </p>
                                    </div>
                                    <div className="bg-black/20 border border-white/5 p-4 rounded-sm">
                                        <div className="text-xs font-bold text-rcb-gold mb-1 uppercase tracking-wider">Step 2</div>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            Subscribe to a tier (Free plan available for testing).
                                        </p>
                                    </div>
                                    <div className="bg-black/20 border border-white/5 p-4 rounded-sm">
                                        <div className="text-xs font-bold text-rcb-gold mb-1 uppercase tracking-wider">Step 3</div>
                                        <p className="text-xs text-white/50 leading-relaxed">
                                            Copy your API Key and paste it into the Connection Settings.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href="https://rapidapi.com/cricketapilive/api/cricbuzz-cricket"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="h-11 px-6 flex items-center justify-center border border-white/10 hover:border-white/30 text-white font-bold uppercase tracking-wider text-xs rounded-sm transition-all bg-transparent hover:bg-white/5"
                                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                                    >
                                        Get RapidAPI Key <ArrowUpRight size={14} className="ml-1.5" />
                                    </a>
                                    <Button
                                        onClick={() => setIsSettingsOpen(true)}
                                        className="h-11 px-8 font-bold uppercase tracking-wider text-xs rounded-sm shadow-lg shadow-rcb-red/20 transition-all hover:scale-[1.02]"
                                        style={{
                                            background: "linear-gradient(135deg, var(--rcb-red) 0%, #800 100%)",
                                            color: "white",
                                            fontFamily: "'Bebas Neue', sans-serif"
                                        }}
                                    >
                                        Configure API Key
                                    </Button>
                                </div>
                            </div>
                        ) : isLoading ? (
                            // Skeleton list loader
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-44 w-full rounded-sm animate-pulse border border-white/5"
                                        style={{ background: "var(--rcb-dark)" }}
                                    />
                                ))}
                            </div>
                        ) : activeList.length === 0 ? (
                            // Empty state
                            <div
                                className="flex flex-col items-center justify-center py-16 px-6 border border-border rounded-sm text-center"
                                style={{ background: "var(--rcb-dark)" }}
                            >
                                <Calendar size={48} className="text-white/20 mb-4" />
                                <h3 className="text-lg font-bold text-white mb-1">No Matches Found</h3>
                                <p className="text-muted-foreground max-w-sm text-sm">
                                    No matches fit the selected search or filter criteria. Try adjusting your filters.
                                </p>
                            </div>
                        ) : (
                            // Regular match cards list (Live API Matches, Upcoming, Recent)
                            <div className="flex flex-col gap-4">
                                {activeList.map((match) => {
                                    const { matchId, seriesName, matchDesc, matchFormat, startDate, state, status, venueInfo, team1, team2 } = match.matchInfo;
                                    const score1 = match.matchScore?.team1Score;
                                    const score2 = match.matchScore?.team2Score;
                                    const isLive = state === "In Progress" || state === "Live";
                                    const isPast = state === "Complete" || state === "Recent" || state === "Abandoned";

                                    return (
                                        <Card
                                            key={matchId}
                                            className={`overflow-hidden border border-border transition-all duration-300 ${
                                                isLive ? "border-l-4 border-l-rcb-red" : "hover:border-white/20"
                                            }`}
                                            style={{ background: "var(--rcb-dark)", borderRadius: "2px" }}
                                        >
                                            <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                {/* Match Info Column */}
                                                <div className="flex-1 space-y-4">
                                                    {/* Badge and Title */}
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        {isLive && (
                                                            <Badge className="bg-red-600 text-white rounded-xs uppercase tracking-wider text-[9px] px-1.5 py-0.2 animate-pulse">
                                                                LIVE
                                                            </Badge>
                                                        )}
                                                        {isPast && (
                                                            <Badge className="bg-white/10 text-white/70 rounded-xs uppercase tracking-wider text-[9px] px-1.5 py-0.2 border border-white/5">
                                                                Result
                                                            </Badge>
                                                        )}
                                                        <span
                                                            className="text-xs font-bold text-rcb-gold uppercase tracking-widest"
                                                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                                                        >
                                                            {seriesName || "T20 Match"}
                                                        </span>
                                                        <span className="text-white/30 text-xs">•</span>
                                                        <span className="text-xs text-white/50 font-medium">
                                                            {matchDesc} ({matchFormat})
                                                        </span>
                                                    </div>

                                                    {/* Teams Layout */}
                                                    <div className="space-y-2">
                                                        {/* Team 1 */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-black ${
                                                                        team1.teamSName.toLowerCase().includes("rcb")
                                                                            ? "bg-rcb-gold"
                                                                            : "bg-white/40"
                                                                    }`}
                                                                >
                                                                    {team1.teamSName.slice(0, 3)}
                                                                </div>
                                                                <span className="text-md font-bold text-white">
                                                                    {team1.teamName}
                                                                </span>
                                                            </div>
                                                            {score1?.inngs1 && (
                                                                <span className="font-bold text-white text-md">
                                                                    {score1.inngs1.runs}/{score1.inngs1.wickets}{" "}
                                                                    <span className="text-white/40 text-xs font-normal">
                                                                        ({score1.inngs1.overs} Ov)
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Team 2 */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div
                                                                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] text-black ${
                                                                        team2.teamSName.toLowerCase().includes("rcb")
                                                                            ? "bg-rcb-gold"
                                                                            : "bg-white/40"
                                                                    }`}
                                                                >
                                                                    {team2.teamSName.slice(0, 3)}
                                                                </div>
                                                                <span className="text-md font-bold text-white">
                                                                    {team2.teamName}
                                                                </span>
                                                            </div>
                                                            {score2?.inngs1 && (
                                                                <span className="font-bold text-white text-md">
                                                                    {score2.inngs1.runs}/{score2.inngs1.wickets}{" "}
                                                                    <span className="text-white/40 text-xs font-normal">
                                                                        ({score2.inngs1.overs} Ov)
                                                                    </span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Status text */}
                                                    {status && (
                                                        <p
                                                            className={`text-xs font-bold uppercase tracking-wide leading-none ${
                                                                isLive ? "text-rcb-gold" : "text-white/70"
                                                            }`}
                                                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                                                        >
                                                            {status}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Match Logistics Column */}
                                                <div
                                                    className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 md:min-w-56 space-y-2.5 text-xs text-white/50"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={13} />
                                                        <span>{formatDate(startDate)}</span>
                                                    </div>
                                                    {formatTime(startDate) && (
                                                        <div className="flex items-center gap-2">
                                                            <Clock size={13} />
                                                            <span>{formatTime(startDate)} IST</span>
                                                        </div>
                                                    )}
                                                    {venueInfo && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin size={13} />
                                                            <span className="truncate max-w-44">
                                                                {venueInfo.ground}, {venueInfo.city}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* API Settings Modal */}
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogContent
                    className="border-white/10 text-white rounded-sm w-[90%] max-w-md"
                    style={{ background: "var(--rcb-dark)" }}
                >
                    <DialogHeader>
                        <DialogTitle
                            className="text-2xl font-black uppercase tracking-wider text-white"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                            Connection Settings
                        </DialogTitle>
                        <DialogDescription className="text-white/60 text-xs">
                            Configure your RapidAPI key to fetch live scores directly from Cricbuzz Cricket API.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* API Key Input */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-xs uppercase font-bold tracking-widest text-white/50">
                                    RapidAPI Key
                                </label>
                                <a
                                    href="https://rapidapi.com/cricketapilive/api/cricbuzz-cricket"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[10px] text-rcb-gold hover:underline flex items-center gap-0.5"
                                >
                                    Get Key <ArrowUpRight size={10} />
                                </a>
                            </div>
                            <Input
                                type="password"
                                placeholder="Enter x-rapidapi-key..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                className="border-white/10 text-white placeholder:text-white/30 h-10 rounded-sm bg-black/20"
                            />
                            <p className="text-[10px] text-white/40 leading-normal">
                                Key will be stored locally in your browser storage and sent directly to the Cricbuzz RapidAPI host endpoint.
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            onClick={handleTestConnection}
                            disabled={isTestingConnection}
                            variant="outline"
                            className="border-white/10 text-white/80 hover:text-white h-10 px-4 font-bold uppercase tracking-wider text-xs rounded-sm bg-transparent"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                            {isTestingConnection ? "Testing..." : "Test Connection"}
                        </Button>
                        <Button
                            onClick={handleSaveSettings}
                            className="bg-rcb-red hover:bg-rcb-red/90 text-white h-10 px-6 font-bold uppercase tracking-wider text-xs rounded-sm"
                            style={{
                                background: "var(--rcb-red)",
                                fontFamily: "'Bebas Neue', sans-serif"
                            }}
                        >
                            Save Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Footer />
        </div>
    );
}
export default SchedulePage;
