const GEMINI_API_KEY = "YOUR_GEMINI_API_KEY";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    try {
      const path = url.pathname;

      if (path === '/v1/chat/completions') {
        const body = await request.json();
        const { model, messages, temperature, top_p, response_format, tools, stream } = body;

        const geminiModel = model.replace('gemini-', '');

        const payload = {
          contents: messages.map(msg => ({
            role: msg.role === 'system' ? 'user' : msg.role,
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: temperature || 0.7,
            topP: top_p || 0.9,
            response_mime_type: response_format?.type === 'json_object' ? 'application/json' : 'text/plain'
          }
        };

        if (tools && tools.some(t => t.type === 'web_search')) {
          payload.tools = [{
            function_declarations: [{
              name: 'google_search',
              description: 'Search the web for current information'
            }]
          }];
        }

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${env.GEMINI_API_KEY || GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Gemini API Error: ${response.status} ${error}`);
        }

        const data = await response.json();
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

        return new Response(JSON.stringify({
          id: 'chatcmpl-' + Date.now(),
          object: 'chat.completion',
          created: Math.floor(Date.now() / 1000),
          model: model,
          choices: [{
            index: 0,
            message: {
              role: 'assistant',
              content: content
            },
            finish_reason: 'stop'
          }],
          usage: {
            prompt_tokens: data.usageMetadata?.totalTokenCount || 0,
            completion_tokens: 0,
            total_tokens: data.usageMetadata?.totalTokenCount || 0
          }
        }), {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (path === '/v1/models') {
        return new Response(JSON.stringify({
          object: 'list',
          data: [
            { id: 'gemini-2.0-flash', object: 'model', created: 1700000000, owned_by: 'google' },
            { id: 'gemini-2.5-flash', object: 'model', created: 1700000000, owned_by: 'google' },
            { id: 'gemini-1.5-flash', object: 'model', created: 1700000000, owned_by: 'google' },
            { id: 'gemini-2.0-flash-exp', object: 'model', created: 1700000000, owned_by: 'google' },
            { id: 'gemini-2.0-flash-thinking', object: 'model', created: 1700000000, owned_by: 'google' },
            { id: 'gemini-2.0-flash-thinking:search', object: 'model', created: 1700000000, owned_by: 'google' }
          ]
        }), {
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
