export interface Player {
    id: number;
    number: string;
    firstName: string;
    lastName: string;
    role: string;
    tags: string[];
    isCaptain?: boolean;
    image: string;
    actionImage?: string;
    stats: {
        iplMatches?: number;
        totalRuns?: number;
        totalWickets?: number;
        economy?: number;
        bestFigure?: string;
        strikeRate?: number;
        hundreds?: number;
        fifties?: number;
    };
}

export const players: Player[] = [
    {
        id: 1,
        number: "18",
        firstName: "Virat",
        lastName: "Kohli",
        role: "Batsman",
        tags: ["Right-Hand Bat", "Top Order Batter", "Icon"],
        image: "/Player-18-Virat-Kohli.avif",
        stats: {
            iplMatches: 237,
            totalRuns: 7263,
            strikeRate: 130.0,
            hundreds: 7,
            fifties: 50,
        },
    },
    {
        id: 2,
        number: "21",
        firstName: "Rajat",
        lastName: "Patidar",
        role: "Batsman",
        tags: ["Right-Hand Bat", "Top Order Batter", "Captain"],
        image: "/Player-21-Rajat-Patidar.avif",
        stats: {
            iplMatches: 54,
            totalRuns: 1448,
            strikeRate: 161.79,
            hundreds: 1,
            fifties: 12,
        },
    },
    {
        id: 3,
        number: "85",
        firstName: "Tim",
        lastName: "David",
        role: "All-Rounder",
        tags: ["Right-Hand Bat", "Right-Arm-Off-Break Bowler", "All-Rounder"],
        image: "/Player-85-Tim-David.avif",
        stats: {
            iplMatches: 63,
            totalRuns: 1108,
            strikeRate: 178.42,
            hundreds: 0,
            fifties: 2,
        },
    },
    {
        id: 4,
        number: "37",
        firstName: "Devdutt",
        lastName: "Paddikal",
        role: "All-Rounder",
        tags: ["Left-Hand Bat", "Right-Arm-Off-Break Bowler", "All-Rounder"],
        image: "/Player-37-Devdutt-Paddikal.avif",
        stats: {
            iplMatches: 87,
            totalRuns: 2218,
            strikeRate: 132.98,
            hundreds: 1,
            fifties: 14,
        },
    },
    {
        id: 5,
        number: "82",
        firstName: "Jacob",
        lastName: "Bethell",
        role: "All-Rounder",
        tags: ["Left-Hand Bat", "Left-Arm-Orthodox", "All-Rounder"],
        image: "/Player-82-Jacob-Bethell.avif",
        stats: {
            iplMatches: 9,
            totalRuns: 163,
            strikeRate: 140.52,
            hundreds: 0,
            fifties: 1,
        },
    },
    {
        id: 6,
        number: "6",
        firstName: "Krunal",
        lastName: "Pandya",
        role: "All-Rounder",
        tags: ["Left-Hand Bat", "Left-Arm-Orthodox", "All-Rounder"],
        image: "/Player-6-Krunal-Pandya.avif",
        stats: {
            iplMatches: 87,
            totalRuns: 2218,
            strikeRate: 132.98,
            hundreds: 1,
            fifties: 14,
        },
    },
    {
        id: 7,
        number: "61",
        firstName: "Phil",
        lastName: "Salt",
        role: "Wicketkeeper",
        tags: ["Right-Hand Bat", "Wicketkeeper", "Finisher"],
        image: "/Player-61-Phil-Salt.avif",
        stats: {
            iplMatches: 40,
            totalRuns: 1258,
            strikeRate: 174.48,
            hundreds: 0,
            fifties: 12,
        },
    },
    {
        id: 8,
        number: "99",
        firstName: "Jitesh",
        lastName: "Sharma",
        role: "Wicketkeeper",
        isCaptain: true,
        tags: ["Right-Hand Bat", "Wicketkeeper", "Finisher"],
        image: "/Player-99-Jitesh-Sharma.avif",
        stats: {
            iplMatches: 68,
            totalRuns: 1081,
            strikeRate: 152.9,
            hundreds: 0,
            fifties: 1,
        },
    },
    {
        id: 9,
        number: "25",
        firstName: "Venkatesh",
        lastName: "Iyer",
        role: "All-Rounder",
        tags: ["Left-Hand Bat", "Right-Arm-Medium", "All-Rounder"],
        image: "/Player-25-Venkatesh-Iyer.avif",
        stats: {
            iplMatches: 65,
            totalRuns: 1582,
            strikeRate: 138.9,
            hundreds: 1,
            fifties: 13,
        },
    },
    {
        id: 10,
        number: "15",
        firstName: "Bhuvneshwar",
        lastName: "Kumar",
        role: "Bowler",
        tags: ["Right-Arm-Medium-Fast", "Bowler"],
        image: "/Player-15-Bhuvi.avif",
        stats: {
            iplMatches: 203,
            totalWickets: 222,
            economy: 7.56,
            bestFigure: "5/19",
            strikeRate: 20.4,
        },
    },
    {
        id: 11,
        number: "38",
        firstName: "Josh",
        lastName: "Hazlewood",
        role: "Bowler",
        tags: ["Right-Arm-Medium-Fast", "Bowler"],
        image: "/Player-38-Josh-Hazlewood.avif",
        stats: {
            iplMatches: 49,
            totalWickets: 69,
            economy: 8.47,
            bestFigure: "4/12",
            strikeRate: 16.0,
        },
    },
    {
        id: 12,
        number: "16",
        firstName: "Romario",
        lastName: "Shepherd",
        role: "Bowling-All-Rounder",
        tags: ["Right-Hand Bat", "Right-Arm-Fast", "Bowling-All-Rounder"],
        image: "/Player-16-Romario-Shepherd.avif",
        stats: {
            iplMatches: 30,
            totalWickets: 17,
            economy: 11.68,
            bestFigure: "3/54",
            strikeRate: 19.76,
        },
    },
];

export const teamStats = {
    winProbability: 68,
    powerplayRunRate: 9.2,
};
