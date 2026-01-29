import { VillainData, Language, ChantResponse, ResolutionResponse, IdentifyResponse } from '../types';

const API_KEY = process.env.API_KEY || '';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class APICache {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly CACHE_TTL = 30 * 60 * 1000; // 30 minutes

  private generateKey(prefix: string, params: any): string {
    return `${prefix}:${JSON.stringify(params)}`;
  }

  get<T>(prefix: string, params: any): T | null {
    const key = this.generateKey(prefix, params);
    
    // Check memory cache first
    const memEntry = this.memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < this.CACHE_TTL) {
      console.log('[Cache] Memory hit:', key);
      return memEntry.data;
    }

    // Check localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const entry: CacheEntry<T> = JSON.parse(stored);
        if (Date.now() - entry.timestamp < this.CACHE_TTL) {
          console.log('[Cache] localStorage hit:', key);
          // Update memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(key);
        }
      }
    } catch (e) {
      console.warn('[Cache] localStorage error:', e);
    }

    return null;
  }

  set<T>(prefix: string, params: any, data: T): void {
    const key = this.generateKey(prefix, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };

    // Update memory cache
    this.memoryCache.set(key, entry);

    // Update localStorage
    try {
      localStorage.setItem(key, JSON.stringify(entry));
    } catch (e) {
      console.warn('[Cache] localStorage quota exceeded:', e);
    }
  }

  clear(): void {
    this.memoryCache.clear();
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('zhipu:') || key.startsWith('gemini:')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.warn('[Cache] Clear error:', e);
    }
  }
}

const cache = new APICache();

const pendingRequests = new Map<string, Promise<any>>();

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function selectModel(webSearch: boolean, retryCount: number): string {
  if (retryCount === 0) {
    if (webSearch) {
      return "glm-4-flash-250414";
    } else {
      return "glm-z1-flash";
    }
  } else if (retryCount === 1) {
    if (webSearch) {
      return "glm-4.7-flash";
    } else {
      return "glm-4-flash-250414";
    }
  } else {
    return "glm-4.7-flash";
  }
}

async function callZhipuAI(
  messages: { role: string; content: string }[],
  jsonMode: boolean = false,
  webSearch: boolean = false,
  retryCount: number = 0
): Promise<string> {
  if (!API_KEY) throw new Error("API Key missing");

  const cacheKey = JSON.stringify({ messages, jsonMode, webSearch });
  
  const cached = cache.get<string>('zhipu', { messages, jsonMode, webSearch });
  if (cached) {
    return cached;
  }

  if (pendingRequests.has(cacheKey)) {
    console.log('[Dedup] Reusing pending request:', cacheKey);
    return pendingRequests.get(cacheKey)!;
  }

  const model = selectModel(webSearch, retryCount);
  
  const payload: any = {
    model: model,
    messages: messages,
    temperature: webSearch ? 0.3 : 0.7,
    top_p: 0.9,
    thinking: { type: "disabled" }
  };

  if (webSearch) {
    payload.tools = [{ type: "web_search", web_search: { enable: true } }];
  }

  const requestPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const err = await response.text();
        const errorData = JSON.parse(err);
        
        // Retry on 429 (rate limit) or 5xx errors
        if ((response.status === 429 || response.status >= 500) && retryCount < MAX_RETRIES) {
          const nextModel = selectModel(webSearch, retryCount + 1);
          console.log(`[Retry] ${response.status} error, retrying (${retryCount + 1}/${MAX_RETRIES}) with ${nextModel}...`);
          await sleep(RETRY_DELAY * (retryCount + 1));
          return callZhipuAI(messages, jsonMode, webSearch, retryCount + 1);
        }
        
        throw new Error(`Zhipu API Error: ${response.status} - ${errorData.error?.message || err}`);
      }

      const data = await response.json();
      const result = data.choices[0]?.message?.content || "{}";
      
      // Cache the result
      cache.set('zhipu', { messages, jsonMode, webSearch }, result);
      
      return result;
    } catch (error) {
      console.error("Zhipu/GLM Request Failed:", error);
      
      // Retry on network errors
      if (retryCount < MAX_RETRIES && error.name !== 'AbortError') {
        console.log(`[Retry] Network error, retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        await sleep(RETRY_DELAY * (retryCount + 1));
        return callZhipuAI(messages, jsonMode, webSearch, retryCount + 1);
      }
      
      throw error;
    }
  })();

  pendingRequests.set(cacheKey, requestPromise);
  
  try {
    const result = await requestPromise;
    return result;
  } finally {
    pendingRequests.delete(cacheKey);
  }
}

export const identifyVillain = async (
  query: string,
  lang: Language
): Promise<IdentifyResponse> => {
  const systemPromptText = lang === 'en'
    ? "You are a helpful assistant that identifies public figures, roles, or entities based on a user's search query for purpose of a 'Villain Hitting' game. Be precise with names. Return purely JSON."
    : "你是一个通过搜索帮助用户识别人物、职位或实体的助手，用于'打小人'游戏。请准确提取人名或称谓。请只返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Who is the person or entity described by: "${query}"? Use search if needed. Return a JSON object with 'name' (the person's name), 'titleOrRole' (their official title), and 'reason' (a 1-sentence summary of why someone might be frustrated with them). If not known, provide a likely answer.`
    : `请搜索并回答："${query}" 是谁？请返回一个JSON对象，包含 'name' (具体人名), 'titleOrRole' (头衔或身份), 'reason' (一句话简介，或者说明为什么可能有人对他们不满)。`;

  try {
    const content = await callZhipuAI(
      [
        { role: "system", content: systemPromptText },
        { role: "user", content: userPromptText }
      ],
      true,
      true
    );
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as IdentifyResponse;
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
  const systemPromptText = lang === 'en' 
    ? "You are a professional 'Villain Hitter' (Da Xiao Ren) practitioner. Generate a rhyming chant (4 lines) and a ritual instruction. Return JSON."
    : "你是一位香港'打小人'神婆。创作4句押韵口诀和一句击打指导。返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Target: '${villain.name}' (${villain.type}). Grievance: ${villain.reason || 'General annoyance'}. Return JSON with 'chantLines' (array of strings) and 'ritualInstruction' (string).`
    : `对象：'${villain.name}' (${villain.type})。原因：${villain.reason || '诸事不顺'}。请返回JSON对象，包含 'chantLines' (4句押韵口诀数组) 和 'ritualInstruction' (击打指导)。`;

  try {
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
  const systemPromptText = lang === 'en'
    ? "You are a wise life coach. Provide a blessing and advice after the ritual. Return JSON."
    : "你是一位智慧的心理疗愈师。仪式结束后给出祝福和建议。返回JSON格式。";

  const userPromptText = lang === 'en'
    ? `Target: '${villain.name}'. Return JSON with 'blessing' (string) and 'advice' (string).`
    : `对象：'${villain.name}'。返回JSON对象，包含 'blessing' (祝福语) 和 'advice' (建议)。`;

  try {
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
  } catch (error) {
    console.error("Resolution Error:", error);
    return {
      blessing: lang === 'en' ? "Peace be with you." : "心安即是归处。",
      advice: lang === 'en' ? "Move forward with confidence." : "放下过去，重新出发。"
    };
  }
};

export const clearCache = () => cache.clear();
