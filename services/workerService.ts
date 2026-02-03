import { VillainData, Language, ChantResponse, ResolutionResponse, IdentifyResponse } from '../types';
import { debounce } from 'lodash';

const WORKER_URL = 'https://glm.api.66666618.xyz';

async function callWorkerAPI(endpoint: string, body: any): Promise<any> {
  try {
    console.log(`[Worker API] Calling ${endpoint}...`, body);
    
    const response = await fetch(`${WORKER_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Worker API] Error: ${response.status}`, errorText);
      throw new Error(`Worker API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[Worker API] Response received:`, data);
    return data;
  } catch (error) {
    console.error('[Worker API] Request failed:', error);
    throw error;
  }
}

export const identifyVillain = async (
  query: string,
  lang: Language
): Promise<IdentifyResponse> => {
  try {
    const data = await callWorkerAPI('/api/identify', { query, lang });
    return data;
  } catch (error) {
    console.error('Identify Villain Error:', error);
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
  try {
    const data = await callWorkerAPI('/api/ritual', { villain, lang });
    return data;
  } catch (error) {
    console.error('Ritual Chant Error:', error);
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
  try {
    const data = await callWorkerAPI('/api/resolution', { villain, lang });
    return data;
  } catch (error) {
    console.error('Resolution Error:', error);
    return {
      blessing: lang === 'en' ? "May you be free from negativity." : "愿君从此远离小人，事事顺遂。",
      advice: lang === 'en' ? "Focus on your own path." : "莫与小人论长短，专注自身修福报。"
    };
  }
};
