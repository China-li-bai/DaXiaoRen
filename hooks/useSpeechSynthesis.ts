import { useState, useEffect, useRef } from 'react';

interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useEdgeTTS?: boolean;
  edgeVoice?: string;
  workerUrl?: string;
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

    utterance.lang = options.lang || 'zh-HK';
    utterance.rate = options.rate || 0.95;
    utterance.pitch = options.pitch || 1.05;
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

    setIsSpeaking(true);

    const baseUrl = options.workerUrl || 'https://shu.66666618.xyz';
    const workerApiUrl = baseUrl.endsWith('/') 
      ? `${baseUrl}v1/audio/speech` 
      : `${baseUrl}/v1/audio/speech`;

    fetch(workerApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'microsoft-tts',
        input: text,
        voice: options.edgeVoice || 'zh-HK-HiuMaanNeural',
        speed: options.rate || 0.95,
        pitch: options.pitch || 1.05
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Worker TTS 请求失败: ${response.status}`);
      }
      return response.blob();
    })
    .then(audioBlob => {
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
    })
    .catch(error => {
      console.error('Worker TTS error:', error);
      setIsSpeaking(false);
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
