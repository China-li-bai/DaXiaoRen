// Follow this setup guide to deploy: https://supabase.com/docs/guides/functions/deploy
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

declare const Deno: any;

const ZHIPU_API_KEY = Deno.env.get('ZHIPU_API_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function callZhipuAI(messages: any[], webSearch = false) {
  if (!ZHIPU_API_KEY) throw new Error("Server missing ZHIPU_API_KEY");

  const payload: any = {
    model: "glm-4-flash",
    messages: messages,
    temperature: 0.7,
    top_p: 0.9,
    stream: false,
  };

  if (webSearch) {
    payload.tools = [{
      type: "web_search",
      web_search: { enable: true, search_result: true }
    }];
  }

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ZHIPU_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(`Zhipu API Error: ${txt}`);
  }

  const data = await response.json();
  let content = data.choices[0]?.message?.content || "{}";
  
  // JSON Cleanup
  content = content.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBracket = content.indexOf('{');
  const lastBracket = content.lastIndexOf('}');
  if (firstBracket !== -1 && lastBracket !== -1) {
    content = content.substring(firstBracket, lastBracket + 1);
  }
  
  return JSON.parse(content);
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, lang, data } = await req.json();
    let result;

    if (action === 'identify') {
      const { query } = data;
      const systemPrompt = lang === 'en'
        ? "You are an intelligent assistant. You MUST use the 'web_search' tool. Return strictly JSON with keys: 'name', 'titleOrRole', 'reason'."
        : "你是一个智能助手。你必须使用联网搜索(web_search)功能来查找用户询问的人物或实体的实时信息。请查找该人物的具体身份、职位和近期争议。最后，请务必只以JSON格式返回结果，包含字段：'name'(人名), 'titleOrRole'(职位/头衔), 'reason'(一句话简介或争议点)。";
      
      const userPrompt = lang === 'en'
        ? `Who is: "${query}"? Return JSON object.`
        : `请搜索并回答："${query}" 是谁？请返回一个JSON对象，包含 'name', 'titleOrRole', 'reason'。`;

      result = await callZhipuAI(
        [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        true // Enable Web Search
      );
    } 
    
    else if (action === 'chant') {
      const { name, type, reason } = data;
      const systemPrompt = lang === 'en' 
        ? "You are a professional 'Villain Hitter'. Generate a rhyming chant (4 lines) and a ritual instruction. Return JSON."
        : "你是一位香港'打小人'神婆。创作4句押韵口诀和一句击打指导。返回JSON格式。";

      const userPrompt = lang === 'en'
        ? `Target: '${name}' (${type}). Grievance: ${reason}. Return JSON with 'chantLines' and 'ritualInstruction'.`
        : `对象：'${name}' (${type})。原因：${reason}。请返回JSON对象，包含 'chantLines' (4句押韵口诀数组) 和 'ritualInstruction' (击打指导)。`;

      result = await callZhipuAI(
        [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
      );
    } 
    
    else if (action === 'resolve') {
      const { name } = data;
      const systemPrompt = lang === 'en'
        ? "You are a spiritual guide. Provide a blessing FOR THE USER (not the villain) and advice FOR THE USER. Return JSON."
        : "你是一位精通'打小人'仪式的转运大师。你的祝福对象是'用户'（操作者），而不是那个'小人'。请赐予用户转运、招贵人、防小人的祝福。返回JSON格式。";

      const userPrompt = lang === 'en'
        ? `The user banished '${name}'. Return JSON with 'blessing' (for user) and 'advice'.`
        : `用户刚刚痛打了小人：'${name}'。请返回JSON对象：'blessing' (给用户的转运祝福)，'advice' (给用户的防小人处世建议)。严禁祝福小人！`;

      result = await callZhipuAI(
        [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }]
      );
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});