import { GoogleGenAI, Type } from "@google/genai";
import { VillainData, Language, ChantResponse, ResolutionResponse, IdentifyResponse } from '../types';

const API_KEY = process.env.API_KEY || '';

// Determine provider based on API Key format
// Google keys usually start with "AIza"
// Zhipu keys are usually "id.secret" format containing a dot
const getProvider = (): 'ZHIPU' | 'GEMINI' => {
  if (API_KEY && API_KEY.includes('.') && !API_KEY.startsWith('AIza')) {
    return 'ZHIPU';
  }
  return 'GEMINI';
};

const getAiClient = () => {
  if (!API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey: API_KEY });
};

// --- Zhipu AI Helper ---
async function callZhipuAI(
  messages: { role: string; content: string }[],
  jsonMode: boolean = false,
  webSearch: boolean = false
): Promise<string> {
  if (!API_KEY) throw new Error("API Key missing");

  const payload: any = {
    model: "glm-4-flash", // Using GLM-4-Flash as requested (interpreting "4.7" as the latest flash)
    messages: messages,
    temperature: 0.7,
    top_p: 0.9,
  };

  if (webSearch) {
    payload.tools = [{ type: "web_search", web_search: { enable: true } }];
  }
  
  // Note: Zhipu's strict JSON mode might vary, but instruction following is usually good enough with glm-4
  if (jsonMode) {
     // GLM-4 supports implicit JSON following via prompt, but we can also check for response_format support if needed.
     // For now, we rely on system prompt instructions.
  }

  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Zhipu API Error: ${err}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "{}";
  } catch (error) {
    console.error("Zhipu/GLM Request Failed:", error);
    throw error;
  }
}

// --- Main Service Functions ---

export const identifyVillain = async (
  query: string,
  lang: Language
): Promise<IdentifyResponse> => {
  const provider = getProvider();

  const systemPromptText = lang === 'en'
    ? "You are a helpful assistant that identifies public figures, roles, or entities based on a user's search query for the purpose of a 'Villain Hitting' game. Be precise with names. Return purely JSON."
    : "你是一个通过搜索帮助用户识别人物、职位或实体的助手，用于'打小人'游戏。请准确提取人名或称谓。请只返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Who is the person or entity described by: "${query}"? Use search if needed. Return a JSON object with 'name' (the person's name), 'titleOrRole' (their official title), and 'reason' (a 1-sentence summary of why someone might be frustrated with them). If not known, provide a likely answer.`
    : `请搜索并回答："${query}" 是谁？请返回一个JSON对象，包含 'name' (具体人名), 'titleOrRole' (头衔或身份), 'reason' (一句话简介，或者说明为什么可能有人对他们不满)。`;

  try {
    if (provider === 'ZHIPU') {
      const content = await callZhipuAI(
        [
          { role: "system", content: systemPromptText },
          { role: "user", content: userPromptText }
        ],
        true, // JSON intent
        true  // Web Search
      );
      // Clean up markdown code blocks if present
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as IdentifyResponse;
    } else {
      // GEMINI Implementation
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPromptText, // Gemini system instruction is in config
        config: {
            systemInstruction: systemPromptText,
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
            type: Type.OBJECT,
            properties: {
                name: { type: Type.STRING },
                titleOrRole: { type: Type.STRING },
                reason: { type: Type.STRING }
            },
            required: ["name", "titleOrRole", "reason"]
            }
        }
      });
      return JSON.parse(response.text || '{}') as IdentifyResponse;
    }
  } catch (error) {
    console.error("Identify Villain Error:", error);
    return {
      name: lang === 'en' ? "Unknown Villain" : "未知小人",
      titleOrRole: "N/A",
      reason: lang === 'en' ? "Could not identify." : "无法识别。"
    };
  }
};

export const generateRitualChant = async (
  villain: VillainData, 
  lang: Language
): Promise<ChantResponse> => {
  const provider = getProvider();

  const systemPromptText = lang === 'en' 
    ? "You are a professional 'Villain Hitter' (Da Xiao Ren) practitioner. Generate a rhyming chant (4 lines) and a ritual instruction. Return JSON."
    : "你是一位香港'打小人'神婆。创作4句押韵口诀和一句击打指导。返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Target: '${villain.name}' (${villain.type}). Grievance: ${villain.reason || 'General annoyance'}. Return JSON with 'chantLines' (array of strings) and 'ritualInstruction' (string).`
    : `对象：'${villain.name}' (${villain.type})。原因：${villain.reason || '诸事不顺'}。请返回JSON对象，包含 'chantLines' (4句押韵口诀数组) 和 'ritualInstruction' (击打指导)。`;

  try {
    if (provider === 'ZHIPU') {
      const content = await callZhipuAI(
        [
          { role: "system", content: systemPromptText },
          { role: "user", content: userPromptText }
        ],
        true,
        false
      );
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as ChantResponse;
    } else {
      // GEMINI
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPromptText,
        config: {
          systemInstruction: systemPromptText,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chantLines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              ritualInstruction: {
                type: Type.STRING,
              }
            },
            required: ["chantLines", "ritualInstruction"]
          }
        }
      });
      return JSON.parse(response.text || '{}') as ChantResponse;
    }
  } catch (error) {
    console.error("Ritual Chant Error:", error);
    return {
      chantLines: lang === 'en' 
        ? ["Beat the villain!", "Bad luck be gone!", "Strike with power!", "New day is born!"]
        : ["打你个小人头！", "霉运通通走！", "打你个小人脚！", "好运自然有！"],
      ritualInstruction: lang === 'en' ? "Hit hard!" : "用力打！"
    };
  }
};

export const generateResolution = async (
  villain: VillainData,
  lang: Language
): Promise<ResolutionResponse> => {
  const provider = getProvider();

  const systemPromptText = lang === 'en'
    ? "You are a wise life coach. Provide a blessing and advice after the ritual. Return JSON."
    : "你是一位智慧的心理疗愈师。仪式结束后给出祝福和建议。返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Target: '${villain.name}'. Return JSON with 'blessing' (string) and 'advice' (string).`
    : `对象：'${villain.name}'。返回JSON对象，包含 'blessing' (祝福语) 和 'advice' (建议)。`;

  try {
    if (provider === 'ZHIPU') {
       const content = await callZhipuAI(
        [
          { role: "system", content: systemPromptText },
          { role: "user", content: userPromptText }
        ],
        true,
        false
      );
      const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as ResolutionResponse;
    } else {
      // GEMINI
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPromptText,
        config: {
          systemInstruction: systemPromptText,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              blessing: { type: Type.STRING },
              advice: { type: Type.STRING }
            },
            required: ["blessing", "advice"]
          }
        }
      });
      return JSON.parse(response.text || '{}') as ResolutionResponse;
    }
  } catch (error) {
    console.error("Resolution Error:", error);
    return {
      blessing: lang === 'en' ? "Peace be with you." : "心安即是归处。",
      advice: lang === 'en' ? "Move forward with confidence." : "放下过去，重新出发。"
    };
  }
};