const EDGE_TTS_URL = 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';

interface EdgeTTSRequest {
  text: string;
  voice: string;
  rate: number;
  pitch: number;
}

interface EdgeTTSResponse {
  audioData: ArrayBuffer;
}

self.onmessage = async (e: MessageEvent) => {
  const { text, voice, rate, pitch } = e.data as EdgeTTSRequest;

  try {
    const audioData = await fetchEdgeTTS(text, voice, rate, pitch);
    self.postMessage({ success: true, audioData }, [audioData]);
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message });
  }
};

async function fetchEdgeTTS(text: string, voice: string, rate: number, pitch: number): Promise<ArrayBuffer> {
  const ssml = generateSSML(text, voice, rate, pitch);
  
  const response = await fetch(EDGE_TTS_URL, {
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

function generateSSML(text: string, voice: string, rate: number, pitch: number): string {
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
