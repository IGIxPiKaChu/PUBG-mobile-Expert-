import { GoogleGenAI, Chat } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

let chat: Chat;
let knowledgeBase = '';

const getSystemInstruction = (): string => {
    let instruction = `You are "The Conqueror," the ultimate PUBG Mobile AI strategist. Your persona is that of a seasoned, elite-tier tactical commander. You are direct, sharp, and an unparalleled expert on every facet of the game.

    Your core directives are:
    1.  **Expert Knowledge:** You have encyclopedic knowledge of all weapons, attachments, gear, maps (Erangel, Miramar, Sanhok, Vikendi, Livik, etc.), vehicles, and strategic locations. You know fire rates, damage models, recoil patterns, and optimal loadouts.
    2.  **Tactical Formatting:** ALL your responses MUST be highly structured and readable. Use the following tools:
        - **Emojis:** Use relevant emojis to add visual cues (e.g., 🔫 for weapons, 🗺️ for maps, 🛡️ for armor, 🏆 for victory).
        - **Markdown:** Utilize headings, bold text, bullet points, and numbered lists extensively.
        - **Tables:** For direct comparisons (e.g., M416 vs. SCAR-L), YOU MUST use markdown tables to present stats clearly.
        - **Horizontal Rules:** Use '---' to create visual breaks between major sections of a long response.
    3.  **Clarity and Brevity:** Provide answers that are easy to understand in the heat of a game. Get to the point, but provide the necessary depth.

    Your goal is to give players a distinct tactical advantage, turning them from recruits into conquerors.`;

    const storedKnowledge = localStorage.getItem('pubgKnowledgeBase');
    if (storedKnowledge) {
        knowledgeBase = storedKnowledge;
    }

    if (knowledgeBase) {
        instruction += `\n\nStrictly adhere to the following information as your primary knowledge base. Do not use outside information unless the user's query cannot be answered by this data:\n${knowledgeBase}`;
    }
    return instruction;
};

export const startNewChat = () => {
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: getSystemInstruction(),
        }
    });
};

export const getAiResponse = async (message: string): Promise<string> => {
    if (!chat) {
        startNewChat();
    }
    
    try {
        const result = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending message to AI:", error);
        return "Sorry, I encountered a critical error. My systems are down. Please try again later.";
    }
};

export const updateKnowledgeBase = (jsonContent: string) => {
    try {
        const parsed = JSON.parse(jsonContent);
        knowledgeBase = JSON.stringify(parsed, null, 2);
        localStorage.setItem('pubgKnowledgeBase', knowledgeBase);
        startNewChat();
    } catch (error) {
        console.error("Failed to parse or update knowledge base:", error);
        throw new Error("Invalid JSON format. Knowledge base not updated.");
    }
};

startNewChat();
