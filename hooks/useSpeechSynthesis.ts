import { useState, useEffect, useRef } from 'react';

interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useEdgeTTS?: boolean;
  edgeVoice?: string;
  edgeTTSProxy?: string;
}

export const useSpeechSynthesis = (options: SpeechSynthesisOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const getCantoneseVoice = (): SpeechSynthesisVoice | undefined => {
    return voices.find(voice => 
      voice.lang.includes('zh-HK') || 
      voice.lang.includes('zh-yue') ||
      voice.lang.includes('yue')
    );
  };

  const getChineseVoice = (): SpeechSynthesisVoice | undefined => {
    return voices.find(voice => 
      voice.lang.includes('zh') || 
      voice.lang.includes('CN')
    );
  };

  const getBestVoice = (): SpeechSynthesisVoice | undefined => {
    return getCantoneseVoice() || getChineseVoice();
  };

  const speak = (text: string) => {
    if (!isSupported || !text) return;

    if (options.useEdgeTTS && options.edgeVoice) {
      speakWithEdgeTTS(text);
    } else {
      speakWithWebSpeechAPI(text);
    }
  };

  const speakWithWebSpeechAPI = (text: string) => {
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    utterance.lang = options.lang || 'zh-CN';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;

    const bestVoice = getBestVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const speakWithEdgeTTS = (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
    }

    setIsSpeaking(true);

    const proxyUrl = options.edgeTTSProxy || 'https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1';

    const workerBlob = new Blob([`
      const EDGE_TTS_URL = '${proxyUrl}';

      self.onmessage = async (e) => {
        const { text, voice, rate, pitch, useProxy } = e.data;

        try {
          const audioData = await fetchEdgeTTS(text, voice, rate, pitch, useProxy);
          self.postMessage({ success: true, audioData }, [audioData]);
        } catch (error) {
          self.postMessage({ success: false, error: error.message });
        }
      };

      async function fetchEdgeTTS(text, voice, rate, pitch, useProxy) {
        const ssml = generateSSML(text, voice, rate, pitch);
        
        const url = useProxy ? 
          'https://dadaxiaoren.com/tts?' + new URLSearchParams({
            text: text,
            voice: voice,
            rate: rate,
            pitch: pitch
          }) :
          EDGE_TTS_URL;
        
        const response = await fetch(url, {
          method: useProxy ? 'GET' : 'POST',
          headers: useProxy ? {} : {
            'Content-Type': 'application/ssml+xml',
            'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0'
          },
          body: useProxy ? undefined : ssml
        });

        if (!response.ok) {
          throw new Error('Edge TTS request failed: ' + response.status);
        }

        return await response.arrayBuffer();
      }

      function generateSSML(text, voice, rate, pitch) {
        const rateValue = (rate * 100).toFixed(0);
        const pitchValue = (pitch * 100).toFixed(0);
        
        return '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">' +
          '<voice name="' + voice + '">' +
          '<prosody rate="' + rateValue + '%" pitch="' + pitchValue + '%">' +
          text +
          '</prosody>' +
          '</voice>' +
          '</speak>';
      }
    `], { type: 'application/javascript' });

    const workerUrl = URL.createObjectURL(workerBlob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent) => {
      if (e.data.success) {
        const audioBlob = new Blob([e.data.audioData], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.play();
      } else {
        console.error('Edge TTS error:', e.data.error);
        setIsSpeaking(false);
      }

      worker.terminate();
      URL.revokeObjectURL(workerUrl);
    };

    worker.postMessage({
      text,
      voice: options.edgeVoice,
      rate: options.rate || 1,
      pitch: options.pitch || 1,
      useProxy: !!options.edgeTTSProxy
    });
  };

  const cancel = () => {
    if (isSupported) {
      window.speechSynthesis.cancel();
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setIsSpeaking(false);
  };

  const pause = () => {
    if (isSupported) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if (isSupported) {
      window.speechSynthesis.resume();
    }
  };

  return {
    isSpeaking,
    isSupported,
    voices,
    speak,
    cancel,
    pause,
    resume,
    getChineseVoice,
    getCantoneseVoice,
    getBestVoice
  };
};
