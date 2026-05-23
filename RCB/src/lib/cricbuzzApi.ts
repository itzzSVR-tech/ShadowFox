export interface Team {
    teamId?: number;
    teamName: string;
    teamSName: string;
    imageId?: number;
}

export interface MatchInfo {
    matchId: number;
    seriesId?: number;
    seriesName?: string;
    matchDesc: string;
    matchFormat: string;
    startDate: string; // milliseconds timestamp
    state: "In Progress" | "Preview" | "Complete" | "Abandoned" | string;
    status: string;
    venueInfo?: {
        ground: string;
        city: string;
    };
    team1: Team;
    team2: Team;
}

export interface Innings {
    runs: number;
    wickets: number;
    overs: number;
}

export interface TeamScore {
    inngs1?: Innings;
    inngs2?: Innings;
}

export interface MatchScore {
    team1Score?: TeamScore;
    team2Score?: TeamScore;
}

export interface CricbuzzMatch {
    matchInfo: MatchInfo;
    matchScore?: MatchScore;
}

// Local storage key for RapidAPI key
const API_KEY_STORAGE_KEY = "rcb_rapidapi_key";

export function getStoredApiKey(): string {
    return localStorage.getItem(API_KEY_STORAGE_KEY) || "";
}

export function setStoredApiKey(key: string): void {
    localStorage.setItem(API_KEY_STORAGE_KEY, key);
}

/**
 * Normalizes and extracts matches from a raw Cricbuzz API response.
 * Safely navigates potential differences in the JSON structure.
 */
export function extractMatchesFromResponse(data: any): CricbuzzMatch[] {
    const list: CricbuzzMatch[] = [];
    if (!data || !Array.isArray(data.typeMatches)) return list;

    for (const typeMatch of data.typeMatches) {
        if (!typeMatch.seriesMatches || !Array.isArray(typeMatch.seriesMatches)) continue;
        for (const seriesMatch of typeMatch.seriesMatches) {
            // Check for seriesAdWrapper structure
            if (seriesMatch.seriesAdWrapper && Array.isArray(seriesMatch.seriesAdWrapper.matches)) {
                for (const match of seriesMatch.seriesAdWrapper.matches) {
                    if (match.matchInfo) {
                        list.push({
                            matchInfo: {
                                ...match.matchInfo,
                                seriesName: match.matchInfo.seriesName || seriesMatch.seriesAdWrapper.seriesName
                            },
                            matchScore: match.matchScore
                        });
                    }
                }
            } else if (Array.isArray(seriesMatch.matches)) {
                for (const match of seriesMatch.matches) {
                    if (match.matchInfo) {
                        list.push({
                            matchInfo: {
                                ...match.matchInfo,
                                seriesName: match.matchInfo.seriesName || seriesMatch.seriesName
                            },
                            matchScore: match.matchScore
                        });
                    }
                }
            }
        }
    }
    return list;
}

/**
 * Checks if the match belongs to Team RCB
 */
export function isRcbMatch(match: CricbuzzMatch): boolean {
    const rcbKeywords = ["rcb", "royal challengers", "bengaluru", "bangalore"];
    const t1Name = match.matchInfo.team1.teamName.toLowerCase();
    const t1SName = match.matchInfo.team1.teamSName.toLowerCase();
    const t2Name = match.matchInfo.team2.teamName.toLowerCase();
    const t2SName = match.matchInfo.team2.teamSName.toLowerCase();

    return rcbKeywords.some(keyword =>
        t1Name.includes(keyword) ||
        t1SName.includes(keyword) ||
        t2Name.includes(keyword) ||
        t2SName.includes(keyword)
    );
}

/**
 * Fetches data from RapidAPI Cricbuzz API
 */
async function fetchFromApi(endpoint: string, apiKey: string): Promise<any> {
    const response = await fetch(`https://cricbuzz-cricket.p.rapidapi.com/matches/v1/${endpoint}`, {
        method: "GET",
        headers: {
            "x-rapidapi-host": "cricbuzz-cricket.p.rapidapi.com",
            "x-rapidapi-key": apiKey
        }
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Main query functions
 */
export async function getLiveMatches(apiKey: string): Promise<CricbuzzMatch[]> {
    if (!apiKey) {
        return [];
    }
    try {
        const data = await fetchFromApi("live", apiKey);
        const allMatches = extractMatchesFromResponse(data);
        return allMatches.filter(isRcbMatch);
    } catch (e) {
        console.error("Live API fetch failed:", e);
        return [];
    }
}

export async function getUpcomingMatches(apiKey: string): Promise<CricbuzzMatch[]> {
    if (!apiKey) {
        return [];
    }
    try {
        const data = await fetchFromApi("upcoming", apiKey);
        const allMatches = extractMatchesFromResponse(data);
        return allMatches.filter(isRcbMatch);
    } catch (e) {
        console.error("Upcoming API fetch failed:", e);
        return [];
    }
}

export async function getRecentMatches(apiKey: string): Promise<CricbuzzMatch[]> {
    if (!apiKey) {
        return [];
    }
    try {
        const data = await fetchFromApi("recent", apiKey);
        const allMatches = extractMatchesFromResponse(data);
        return allMatches.filter(isRcbMatch);
    } catch (e) {
        console.error("Recent API fetch failed:", e);
        return [];
    }
}
