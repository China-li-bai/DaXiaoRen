export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/tts') {
      const text = url.searchParams.get('text');
      const voice = url.searchParams.get('voice') || 'Microsoft Yating (zh-HK)';
      const rate = parseFloat(url.searchParams.get('rate') || '1.0');
      const pitch = parseFloat(url.searchParams.get('pitch') || '1.0');

      if (!text) {
        return new Response('Missing text parameter', { status: 400 });
      }

      try {
        const audioData = await fetchEdgeTTS(text, voice, rate, pitch);
        return new Response(audioData, {
          headers: {
            'Content-Type': 'audio/mpeg',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          }
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }

    return new Response('Edge TTS Proxy Worker', { status: 200 });
  }
};

async function fetchEdgeTTS(text, voice, rate, pitch) {
  const ssml = generateSSML(text, voice, rate, pitch);
  
  const response = await fetch('https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ssml+xml',
      'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
    },
    body: ssml
  });

  if (!response.ok) {
    throw new Error(`Edge TTS request failed: ${response.status}`);
  }

  return await response.arrayBuffer();
}

function generateSSML(text, voice, rate, pitch) {
  const rateValue = (rate * 100).toFixed(0);
  const pitchValue = (pitch * 100).toFixed(0);
  
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
    <voice name="${voice}">
      <prosody rate="${rateValue}%" pitch="${pitchValue}%">
        ${text}
      </prosody>
    </voice>
  </speak>`;
}
