import { GoogleGenAI, Type } from "@google/genai";
import { VillainData, Language, ChantResponse, ResolutionResponse, IdentifyResponse } from '../types';

const API_KEY = process.env.API_KEY || '';

// Determine provider based on API Key format
// Google keys usually start with "AIza"
// Zhipu keys are usually "id.secret" format containing a dot
const getProvider = (): 'ZHIPU' | 'GEMINI' => {
  // Explicitly prioritize Zhipu if the key structure matches (contains dot, doesn't look like Google)
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
    model: "glm-4-flash", 
    messages: messages,
    temperature: 0.7,
    top_p: 0.9,
    stream: false
  };

  if (webSearch) {
    // Explicitly enable web_search tool for GLM-4
    payload.tools = [{ 
      type: "web_search", 
      web_search: { 
        enable: true,
        search_result: true // Request search results in response (optional but good for context)
      } 
    }];
  }
  
  try {
    console.log(`[ZhipuAI] Calling GLM-4-Flash (Search: ${webSearch})...`);
    
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
      console.error("[ZhipuAI] API Error Details:", err);
      throw new Error(`Zhipu API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";
    
    console.log("[ZhipuAI] Response received.");
    return content;
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

  // Optimized System Prompt for Zhipu to ensure it uses the search tool and formats correctly
  const zhipuSystemPrompt = lang === 'en'
    ? "You are an intelligent assistant. You MUST use the 'web_search' tool to find real-time information about the person or entity the user asks about. After finding the information, summarize the person's identity and official role. Return the result STRICTLY as a JSON object with keys: 'name', 'titleOrRole', 'reason'."
    : "你是一个智能助手。你必须使用联网搜索(web_search)功能来查找用户询问的人物或实体的实时信息。请查找该人物的具体身份、职位和近期争议。最后，请务必只以JSON格式返回结果，包含字段：'name'(人名), 'titleOrRole'(职位/头衔), 'reason'(一句话简介或争议点)。";

  const googleSystemPrompt = lang === 'en'
    ? "You are a helpful assistant that identifies public figures, roles, or entities based on a user's search query for the purpose of a 'Villain Hitting' game. Be precise with names. Return purely JSON."
    : "你是一个通过搜索帮助用户识别人物、职位或实体的助手，用于'打小人'游戏。请准确提取人名或称谓。请只返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Who is the person or entity described by: "${query}"? Return a JSON object with 'name', 'titleOrRole', and 'reason'.`
    : `请搜索并回答："${query}" 是谁？请返回一个JSON对象，包含 'name', 'titleOrRole', 'reason'。`;

  try {
    if (provider === 'ZHIPU') {
      const content = await callZhipuAI(
        [
          { role: "system", content: zhipuSystemPrompt },
          { role: "user", content: userPromptText }
        ],
        true, // JSON intent
        true  // Web Search ENABLED
      );
      
      // Robust JSON cleaning
      let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      // Sometimes models add text before/after, try to extract JSON object
      const firstBracket = cleanJson.indexOf('{');
      const lastBracket = cleanJson.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
          cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
      }

      return JSON.parse(cleanJson) as IdentifyResponse;
    } else {
      // GEMINI Implementation
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userPromptText,
        config: {
            systemInstruction: googleSystemPrompt,
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
      reason: lang === 'en' ? "Could not identify due to network error." : "网络错误，无法识别。"
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
      let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
       const firstBracket = cleanJson.indexOf('{');
      const lastBracket = cleanJson.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
          cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
      }
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

  // Updated Prompt: Explicitly instruct to bless the USER, not the villain.
  const systemPromptText = lang === 'en'
    ? "You are a spiritual guide. The user has just performed a ritual to banish a bad person or bad luck. You must provide a blessing FOR THE USER (not the villain) and advice FOR THE USER to maintain good fortune. Return JSON."
    : "你是一位精通'打小人'仪式的转运大师。用户刚刚打完了小人，驱散了霉运。请务必注意：你的祝福对象是'用户'（操作者），而不是那个'小人'。请赐予用户转运、招贵人、防小人的祝福。返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `The user has banished the villain: '${villain.name}'. Return JSON with 'blessing' (positive affirmation for the user to have good luck and avoid this person) and 'advice' (how the user can protect themselves).`
    : `用户刚刚痛打了小人：'${villain.name}'。请返回JSON对象：'blessing' (给用户的转运祝福，例如祝用户事业顺利、不再受此人困扰)，'advice' (给用户的防小人处世建议)。严禁祝福小人！`;

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
      let cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const firstBracket = cleanJson.indexOf('{');
      const lastBracket = cleanJson.lastIndexOf('}');
      if (firstBracket !== -1 && lastBracket !== -1) {
          cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
      }
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
      blessing: lang === 'en' ? "May you be free from negativity." : "愿君从此远离小人，事事顺遂。",
      advice: lang === 'en' ? "Focus on your own path." : "莫与小人论长短，专注自身修福报。"
    };
  }
};