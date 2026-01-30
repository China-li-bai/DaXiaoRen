const API_KEY = "d946d990667549baba87595dadb30b42.5r3iUUtIbhPQ5kwA";

const PROMPTS = {
  identify: {
    en: "You are a helpful assistant that identifies public figures, roles, or entities based on a user's search query for purpose of a 'Villain Hitting' game. Be precise with names. Return purely JSON.",
    zh: "你是一个通过搜索帮助用户识别人物、职位或实体的助手，用于'打小人'游戏。请准确提取人名或称谓。请只返回JSON格式。"
  },
  ritual: {
    en: "You are a professional 'Villain Hitter' (Da Xiao Ren) practitioner. Generate a rhyming chant (4 lines) and a ritual instruction. Return JSON.",
    zh: "你是一位香港'打小人'神婆。创作4句押韵口诀和一句击打指导。返回JSON格式。"
  },
  resolution: {
    en: "You are a wise life coach. Provide a blessing and advice after the ritual. Return JSON.",
    zh: "你是一位智慧的心理疗愈师。仪式结束后给出祝福和建议。返回JSON格式。"
  }
};

async function callZhipuAI(messages, webSearch = false) {
  const payload = {
    model: "glm-4.7-flash",
    messages: messages,
    temperature: 0.7,
    top_p: 0.9,
    thinking: { type: "enabled", clear_thinking: true },
    response_format: { type: "json_object" }
  };

  if (webSearch) {
    payload.tools = [{ type: "web_search", web_search: { enable: true } }];
  }

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
    throw new Error(`Zhipu API Error: ${response.status} ${response.statusText} - ${err}`);
  }

  const data = await response.json();
  
  const message = data.choices[0]?.message;
  let result = message?.content || "{}";
  
  if (message && message.reasoning_content) {
    console.log('[Thinking] Reasoning content filtered out');
    result = message.content || "{}";
  }

  return result;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      const path = url.pathname;

      if (path === '/api/identify') {
        const { query, lang } = await request.json();
        const systemPrompt = PROMPTS.identify[lang] || PROMPTS.identify.zh;
        
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: lang === 'en' ? `Who is: "${query}"? Return JSON with 'name', 'titleOrRole', 'reason'.` : `请搜索并回答："${query}" 是谁？请返回JSON对象，包含 'name', 'titleOrRole', 'reason'。` }
        ];

        const result = await callZhipuAI(messages, true);
        
        return new Response(result, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (path === '/api/ritual') {
        const { villain, lang } = await request.json();
        const systemPrompt = PROMPTS.ritual[lang] || PROMPTS.ritual.zh;
        
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: lang === 'en' ? `Target: '${villain.name}' (${villain.type}). Grievance: ${villain.reason || 'General annoyance'}. Return JSON with 'chantLines' (array) and 'ritualInstruction' (string).` : `对象：'${villain.name}' (${villain.type})。原因：${villain.reason || '诸事不顺'}。请返回JSON对象，包含 'chantLines' (4句押韵口诀数组) 和 'ritualInstruction' (击打指导)。` }
        ];

        const result = await callZhipuAI(messages, false);
        
        return new Response(result, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (path === '/api/resolution') {
        const { villain, lang } = await request.json();
        const systemPrompt = PROMPTS.resolution[lang] || PROMPTS.resolution.zh;
        
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: lang === 'en' ? `The user has banished the villain: '${villain.name}'. Return JSON with 'blessing' (positive affirmation for the user) and 'advice' (how the user can protect themselves).` : `用户刚刚痛打了小人：'${villain.name}'。请返回JSON对象：'blessing' (给用户的转运祝福)，'advice' (给用户的防小人处世建议)。严禁祝福小人！` }
        ];

        const result = await callZhipuAI(messages, false);
        
        return new Response(result, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
      console.error('Worker Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  }
};
