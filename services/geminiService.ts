import { GoogleGenAI, Type } from "@google/genai";
import { VillainData, Language, ChantResponse, ResolutionResponse, IdentifyResponse } from '../types';

const CLIENT_API_KEY = process.env.API_KEY || '';

// --- HELPER: Client-Side Fallback (INSECURE - FOR DEV ONLY) ---
const getClientProvider = (): 'ZHIPU' | 'GEMINI' => {
  if (CLIENT_API_KEY && CLIENT_API_KEY.includes('.') && !CLIENT_API_KEY.startsWith('AIza')) {
    return 'ZHIPU';
  }
  return 'GEMINI';
};

const getAiClient = () => {
  if (!CLIENT_API_KEY) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey: CLIENT_API_KEY });
};

async function clientSideZhipuCall(messages: any[], webSearch = false): Promise<any> {
  const payload: any = {
    model: "glm-4-flash", messages: messages, temperature: 0.7, top_p: 0.9, stream: false
  };
  if (webSearch) {
    payload.tools = [{ type: "web_search", web_search: { enable: true, search_result: true } }];
  }
  
  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${CLIENT_API_KEY}` },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  let content = data.choices[0]?.message?.content || "{}";
  content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  const first = content.indexOf('{'), last = content.lastIndexOf('}');
  if (first !== -1 && last !== -1) content = content.substring(first, last + 1);
  return JSON.parse(content);
}

// --- MAIN FUNCTIONS ---

export const identifyVillain = async (query: string, lang: Language): Promise<IdentifyResponse> => {
  try {
    if (getClientProvider() === 'ZHIPU') {
      const prompt = lang === 'en' 
        ? "You are an intelligent assistant. Use web_search. Return JSON with 'name', 'titleOrRole', 'reason'."
        : "你是一个智能助手。请使用联网搜索查找此人。只返回JSON，包含：'name', 'titleOrRole', 'reason'。";
      return await clientSideZhipuCall(
        [{ role: "system", content: prompt }, { role: "user", content: `Who is "${query}"?` }], 
        true
      );
    } else {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Who is "${query}"?`,
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, titleOrRole: { type: Type.STRING }, reason: { type: Type.STRING } },
            required: ["name", "titleOrRole", "reason"]
            }
        }
      });
      return JSON.parse(response.text || '{}') as IdentifyResponse;
    }
  } catch (e) {
    console.error(e);
    return { name: "Unknown", titleOrRole: "N/A", reason: "Network Error" };
  }
};

export const generateRitualChant = async (villain: VillainData, lang: Language): Promise<ChantResponse> => {
  try {
    if (getClientProvider() === 'ZHIPU') {
      const sys = lang === 'en' ? "Generate ritual chant. Return JSON." : "你是打小人神婆。生成口诀和指导。返回JSON。";
      const usr = `Target: ${villain.name}. Reason: ${villain.reason}`;
      return await clientSideZhipuCall([{ role: "system", content: sys }, { role: "user", content: usr }]);
    } else {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Target: ${villain.name}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { chantLines: { type: Type.ARRAY, items: { type: Type.STRING } }, ritualInstruction: { type: Type.STRING } },
          }
        }
      });
      return JSON.parse(response.text || '{}') as ChantResponse;
    }
  } catch (e) {
    return { chantLines: ["Error generating chant"], ritualInstruction: "Hit hard!" };
  }
};

export const generateResolution = async (villain: VillainData, lang: Language): Promise<ResolutionResponse> => {
  try {
    if (getClientProvider() === 'ZHIPU') {
      const sys = lang === 'en' ? "Blessing for USER not villain. Return JSON." : "你是转运大师。请祝福用户（操作者），不要祝福小人。返回JSON。";
      const usr = `User banished ${villain.name}.`;
      return await clientSideZhipuCall([{ role: "system", content: sys }, { role: "user", content: usr }]);
    } else {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `User banished ${villain.name}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: { blessing: { type: Type.STRING }, advice: { type: Type.STRING } },
          }
        }
      });
      return JSON.parse(response.text || '{}') as ResolutionResponse;
    }
  } catch (e) {
    return { blessing: "Peace be with you.", advice: "Move on." };
  }
};