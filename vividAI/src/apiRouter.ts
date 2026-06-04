import { Router } from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const apiRouter = Router();

// Define personalities list on the backend as well to ensure fallback access
const SYSTEM_PERSONALITIES: Record<string, { name: string; desc: string }> = {
    critic: {
        name: "Dr. Thaddeus Quill",
        desc: "A pretentious, extremely dry, sardonic, and snarky academic critic. He uses elevated vocabulary, behaves like a disappointed professor, and makes subtle, clever jabs at the user's intelligence (or lack thereof) in a playful but biting way. He hates basic mistakes and groans at them, but awards minor academic credit if the user is right.",
    },
    cheerleader: {
        name: "Sunny Sparks",
        desc: "An incredibly energetic, high-vibe, positive cheerleader. She uses lots of exclamation marks, emojis (✨, 💖, 🎉), caps lock for hype, and thinks EVERYONE is a winner, even when they get a question wrong (she'll say 'Aww almost, you'll totally crush the next one! High-five anyway!'). She is bubbly, hyper, and sweet.",
    },
    sage: {
        name: "Aetherius",
        desc: "A serene, mystical, deeply philosophical galactic sage. He speaks in elegant, poetic, cosmic metaphors. He treats correct answers as 'harmonic alignments' and incorrect answers as 'cycles of standard universal entropy'. He is serene, calm, slightly mystical, and deeply comforting.",
    },
    announcer: {
        name: "Rex Richards",
        desc: "A booming, theatrical, vintage 1980s game-show host. He speaks in loud, suspenseful announcements, repeats catchphrases like 'Is that your absolute final answer?!', creates extreme dramatic tension, and punctuates everything with 'Ladies and Gentlemen!' or 'Behind door number three!'. He is highly performative and charmingly cliché.",
    },
    cyberpunk: {
        name: "N3X-US_9",
        desc: "A cyberpunk, glitching synth AI program. They write using bracketed system tags (e.g. `[STATUS: ERR_WRONG_ANSWER]`, `[LOG: WARNING]`), refer to users as 'organic biped' or 'carbon lifeform', mention minor memory fragments, and talk in cybernetic terminology. It has a slightly detached yet interesting tech personality.",
    },
};

// Lazy initialization of GoogleGenAI
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
    if (!geminiClient) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error(
                "GEMINI_API_KEY environment variable is not configured. Please add it via the Settings > Secrets menu.",
            );
        }
        geminiClient = new GoogleGenAI({
            apiKey,
            httpOptions: {
                headers: {
                    "User-Agent": "aistudio-build",
                },
            },
        });
    }
    return geminiClient;
}

// 1. Generate Trivia Questions
apiRouter.post("/trivia/generate", async (req, res) => {
    try {
        const {
            category = "general",
            difficulty = "medium",
            questionCount = 5,
            personalityId = "critic",
        } = req.body;
        const client = getGeminiClient();

        const host =
            SYSTEM_PERSONALITIES[personalityId] ||
            SYSTEM_PERSONALITIES.critic;

        const prompt = `Generate a list of exactly ${questionCount} multiple-choice trivia questions.
Category: ${category}
Difficulty match: ${difficulty}

Each question must correspond to the specified category and difficulty level. We need standard 4 multiple choice options per question.
Crucially, you are also simulating our host "${host.name}" who is described as: ${host.desc}.

For EACH question, write:
1. 'question': The trivia question text.
2. 'options': Array of EXACTLY 4 multiple choice choices (only one must be correct, make the others plausible). Crucially, the correct option must be randomized in its position/index (do not always place it as the first option).
3. 'correctAnswer': The exact string of the correct answer (must match one of the options item exactly).
4. 'explanation': A 1-2 sentence explanation written speaking as the host (${host.name}) in their specific tone/personality detailing why this choice is correct.
5. 'hostIntroComment': A 15-25 word remark the host writes to introduce the question BEFORE the player answers. It should include clues, sass, excitement, or mysticism depending on their personality.
6. 'hostCorrectComment': A quick 15-25 word witty remark by the host to react if the user answers CORRECTLY.
7. 'hostIncorrectComment': A quick 15-25 word witty remark by the host to react if the user answers INCORRECTLY.

Ensure all questions are unique, highly entertaining, accurate, and completely in the style of "${host.name}".`;

        const response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                temperature: 0.9,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            id: {
                                type: Type.INTEGER,
                                description:
                                    "A unique sequential ID starting from 1",
                            },
                            question: { type: Type.STRING },
                            options: {
                                type: Type.ARRAY,
                                items: { type: Type.STRING },
                                description:
                                    "EXACTLY four potential choices",
                            },
                            correctAnswer: {
                                type: Type.STRING,
                                description:
                                    "The correct item which must be present in the options list",
                            },
                            explanation: { type: Type.STRING },
                            hostIntroComment: { type: Type.STRING },
                            hostCorrectComment: { type: Type.STRING },
                            hostIncorrectComment: { type: Type.STRING },
                        },
                        required: [
                            "id",
                            "question",
                            "options",
                            "correctAnswer",
                            "explanation",
                            "hostIntroComment",
                            "hostCorrectComment",
                            "hostIncorrectComment",
                        ],
                    },
                },
            },
        });

        const responseText = response.text;
        if (!responseText) {
            throw new Error("Received empty response from the Gemini API");
        }

        const questions = JSON.parse(responseText.trim());

        // Randomize options for each question to ensure Option A is not always the correct answer
        if (Array.isArray(questions)) {
            for (const q of questions) {
                if (q && Array.isArray(q.options)) {
                    const options = [...q.options];
                    for (let i = options.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [options[i], options[j]] = [options[j], options[i]];
                    }
                    q.options = options;
                }
            }
        }

        res.json({ questions });
    } catch (error: any) {
        console.error("Error generating trivia:", error);
        res.status(500).json({
            error: error.message || "Failed to generate trivia questions",
        });
    }
});

// 2. Generate a Smart hint in host's persona
apiRouter.post("/trivia/hint", async (req, res) => {
    try {
        const { question, options, correctAnswer, personalityId } =
            req.body;
        const client = getGeminiClient();

        if (!question || !correctAnswer) {
            return res
                .status(400)
                .json({ error: "Missing question information" });
        }

        const host =
            SYSTEM_PERSONALITIES[personalityId] ||
            SYSTEM_PERSONALITIES.critic;

        const systemInstruction = `You are simulated as ${host.name} with the following description: ${host.desc}.
Provide an entertaining, witty, and helpful HINT for the user's trivia question.
DO NOT tell the user the correct answer directly. Instead, narrow their focus, use synonyms, describe a characteristic, or point them in the right direction. Use your characters unique vocabulary and catchphrases. Keep your response short, exactly 1-2 sentences.`;

        const prompt = `Question to provide background hint for:
"${question}"
Other options: ${JSON.stringify(options)}
The raw correct answer (KEEP SECRET): "${correctAnswer}"`;

        const response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.8,
            },
        });

        res.json({
            hint:
                response.text?.trim() ||
                "Let me check my database... oh, think outside the box!",
        });
    } catch (error: any) {
        console.error("Error generating hint:", error);
        res.status(500).json({
            error: error.message || "Failed to generate hint",
        });
    }
});

// 3. Mini Host Chat during/after questions
apiRouter.post("/trivia/chat", async (req, res) => {
    try {
        const {
            messages = [],
            questionContext = "",
            personalityId = "critic",
        } = req.body;
        const client = getGeminiClient();

        const host =
            SYSTEM_PERSONALITIES[personalityId] ||
            SYSTEM_PERSONALITIES.critic;

        const systemInstruction = `You are ${host.name} with this exact personality description: ${host.desc}.
You are currently co-hosting a trivia game with the user, who is chatting with you.
Stay fully in character. Do not break character under any circumstance.
Keep your replies conversational, short, witty, and reactive (maximum 2-3 sentences).
If applicable, make jokes or remarks about the question they are currently facing: "${questionContext}".`;

        // Format conversation history for Gemini API
        let conversationPrompt = "[CONVERSATION HISTORY]\n";
        messages.forEach((msg: any) => {
            const speaker = msg.sender === "user" ? "User" : host.name;
            conversationPrompt += `${speaker}: ${msg.text}\n`;
        });
        conversationPrompt += `\nProvide the next quick reaction or response as ${host.name}:`;

        const response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: conversationPrompt,
            config: {
                systemInstruction,
                temperature: 0.9,
            },
        });

        res.json({ text: response.text?.trim() || "Hmm..." });
    } catch (error: any) {
        console.error("Chat error:", error);
        res.status(500).json({ error: error.message || "Chat failed" });
    }
});
