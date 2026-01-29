import { GoogleGenAI, Type } from "@google/genai";
import { VillainData, Language, ChantResponse, ResolutionResponse, IdentifyResponse } from '../types';

const getAiClient = () => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const identifyVillain = async (
  query: string,
  lang: Language
): Promise<IdentifyResponse> => {
  const ai = getAiClient();
  
  const systemPrompt = lang === 'en'
    ? "You are a helpful assistant that identifies public figures, roles, or entities based on a user's search query for the purpose of a 'Villain Hitting' game. Be precise with names."
    : "你是一个通过搜索帮助用户识别人物、职位或实体的助手，用于'打小人'游戏。请准确提取人名或称谓。";

  const userPrompt = lang === 'en'
    ? `Who is the person or entity described by: "${query}"? Use Google Search to find the answer. Return a JSON object with 'name' (the person's name), 'titleOrRole' (their official title), and 'reason' (a 1-sentence summary of why someone might be frustrated with them or just their current status). If the person is not yet known (e.g. future date), provide the most likely answer or 'Unknown'.`
    : `请搜索并回答："${query}" 是谁？请返回一个JSON对象，包含 'name' (具体人名), 'titleOrRole' (头衔或身份), 'reason' (一句话简介，或者说明为什么可能有人对他们不满，如果是未来职位，说明当前情况或预测)。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
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

    const result = JSON.parse(response.text || '{}');
    return result as IdentifyResponse;
  } catch (error) {
    console.error("Gemini Search Error:", error);
    return {
      name: lang === 'en' ? "Unknown Villain" : "未知小人",
      titleOrRole: "N/A",
      reason: lang === 'en' ? "Could not identify specific person." : "无法识别具体人物。"
    };
  }
};

export const generateRitualChant = async (
  villain: VillainData, 
  lang: Language
): Promise<ChantResponse> => {
  const ai = getAiClient();
  
  const systemPrompt = lang === 'en' 
    ? "You are a professional 'Villain Hitter' (Da Xiao Ren) practitioner from Hong Kong, modernized for a digital app. You are witty, fierce, but ultimately protective of the user."
    : "你是一位来自香港鹅颈桥的专业'打小人'神婆，通过APP为现代年轻人服务。你的语言风格犀利、押韵、地道，既有传统仪式感，又结合现代生活梗。";

  const userPrompt = lang === 'en'
    ? `Generate a rhyming chant (4 lines) to curse/scold '${villain.name}' who is a ${villain.type}. The user's specific grievance: ${villain.reason || 'General annoyance'}. The tone should be cathartic and funny, not genuinely hateful. Also provide a 1-sentence instruction on how to hit.`
    : `请创作一段打小人的口诀（4句押韵），对象是 '${villain.name}'，类型是 ${villain.type}。用户的具体怨气：${villain.reason || '诸事不顺'}。语气要解气、好笑、押韵（广东话风格最好，但书面语也要通顺），不要过于恶毒，主要是心理宣泄。并提供一句简单的击打指导。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            chantLines: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "An array of 4 rhyming sentences."
            },
            ritualInstruction: {
              type: Type.STRING,
              description: "A short instruction for the ritual."
            }
          },
          required: ["chantLines", "ritualInstruction"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as ChantResponse;
  } catch (error) {
    console.error("Gemini Chant Error:", error);
    // Fallback if API fails
    return {
      chantLines: lang === 'en' 
        ? ["Beat the villain, beat the head!", "Your bad luck is finally dead!", "Hit the hand and hit the feet!", "Victory is super sweet!"]
        : ["打你个小人头，打到你有气无定透！", "打你个小人手，等你有手无得郁！", "打你个小人脚，打到你走都无路走！", "打你个死人头，以后唔好再发愁！"],
      ritualInstruction: lang === 'en' ? "Smack with the shoe!" : "用力打！绝不手软！"
    };
  }
};

export const generateResolution = async (
  villain: VillainData,
  lang: Language
): Promise<ResolutionResponse> => {
  const ai = getAiClient();

  const systemPrompt = lang === 'en'
    ? "You are a wise, supportive life coach utilizing the 'Da Xiao Ren' ritual metaphor for psychological closure."
    : "你是一位充满智慧的心理疗愈师，借用'打小人'的仪式隐喻，为用户提供心理上的'完结'和祝福。";

  const userPrompt = lang === 'en'
    ? `The user has finished beating the villain '${villain.name}'. Provide a 'Blessing' (positive affirmation) and a short piece of 'Advice' (actionable, stoic, or comforting) to help them move forward.`
    : `用户已经打完了小人 '${villain.name}'。请给出一个'贵人指引'（正面祝福）和一条'化解建议'（具有行动导向或安慰性质），帮助他们放下包袱，重新出发。`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            blessing: {
              type: Type.STRING,
              description: "A positive blessing/affirmation."
            },
            advice: {
              type: Type.STRING,
              description: "Practical or philosophical advice."
            }
          },
          required: ["blessing", "advice"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as ResolutionResponse;
  } catch (error) {
    console.error("Gemini Resolution Error:", error);
    return {
      blessing: lang === 'en' ? "The negative energy has dissipated." : "霉运已随风而去，贵人即将来到。",
      advice: lang === 'en' ? "Take a deep breath and focus on yourself." : "深呼吸，把注意力放回自己身上。"
    };
  }
};
