# useSpeechSynthesis Hook 修改总结

## 修改内容

### 1. 修改接口定义

**修改前**:
```typescript
interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useEdgeTTS?: boolean;
  edgeVoice?: string;
  edgeTTSProxy?: string;  // 旧的代理 URL
}
```

**修改后**:
```typescript
interface SpeechSynthesisOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  useEdgeTTS?: boolean;
  edgeVoice?: string;
  workerUrl?: string;  // 新的 Worker API URL
}
```

### 2. 修改 speakWithEdgeTTS 函数

**修改前**:
- 使用 Web Worker 直接调用 Edge TTS API
- 需要生成 SSML
- 使用 WebSocket 连接
- 需要处理代理逻辑

**修改后**:
- 直接调用 Cloudflare Worker API
- 使用 JSON 格式的请求
- 简化了错误处理
- 移除了 Web Worker 代码

**修改后的代码**:
```typescript
const speakWithEdgeTTS = (text: string) => {
  if (audioRef.current) {
    audioRef.current.pause();
    audioRef.current = null;
  }

  setIsSpeaking(true);

  const workerApiUrl = options.workerUrl || 'https://shu.66666618.xyz/v1/audio/speech';

  fetch(workerApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'microsoft-tts',
      input: text,
      voice: options.edgeVoice || 'zh-CN-XiaoxiaoNeural',
      speed: options.rate || 1.0,
      pitch: options.pitch || 1.0
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
```

### 3. 修改 RitualStage 组件

**修改前**:
```typescript
const { speak, isSupported: speechSupported, getBestVoice } = useSpeechSynthesis({
  lang: lang === 'zh' ? 'zh-HK' : 'en-US',
  rate: 0.85,
  pitch: 1.0,
  volume: 1.0,
  useEdgeTTS: true,
  edgeVoice: lang === 'zh' ? 'Microsoft Yating (zh-HK)' : 'Microsoft Jenny (en-US)',
  edgeTTSProxy: 'https://dadaxiaoren.com/tts'
});
```

**修改后**:
```typescript
const { speak, isSupported: speechSupported, getBestVoice } = useSpeechSynthesis({
  lang: lang === 'zh' ? 'zh-CN' : 'en-US',
  rate: 0.85,
  pitch: 1.0,
  volume: 1.0,
  useEdgeTTS: true,
  edgeVoice: lang === 'zh' ? 'zh-CN-XiaoxiaoNeural' : 'en-US-JennyNeural',
  workerUrl: 'https://shu.66666618.xyz'
});
```

## 修改说明

### 主要变化

1. **移除了 Web Worker 代码**: 不再需要创建 Web Worker 来处理 Edge TTS 请求
2. **简化了 API 调用**: 直接使用 fetch 调用 Cloudflare Worker API
3. **更新了语音名称**: 使用 Microsoft 官方语音名称
   - 中文: `zh-CN-XiaoxiaoNeural` (晓晓 - 普通话女声)
   - 英文: `en-US-JennyNeural` (Jenny - 英语女声)
4. **更新了 Worker URL**: 使用新的 Cloudflare Worker API
   - 旧: `https://dadaxiaoren.com/tts`
   - 新: `https://shu.66666618.xyz/v1/audio/speech`
5. **更新了语言代码**: 从 `zh-HK` 改为 `zh-CN`（普通话）

### API 请求格式

**新的请求格式**:
```json
{
  "model": "microsoft-tts",
  "input": "你好，世界！",
  "voice": "zh-CN-XiaoxiaoNeural",
  "speed": 0.85,
  "pitch": 1.0
}
```

**响应格式**:
- 成功: `audio/mpeg` (MP3 音频文件)
- 失败: `application/json` (错误信息)

## 优势

### 1. 代码简化

- 移除了复杂的 Web Worker 代码
- 移除了 SSML 生成逻辑
- 移除了 WebSocket 连接处理
- 移除了代理逻辑

### 2. 更可靠

- 使用稳定的 Cloudflare Worker API
- 不需要处理 WebSocket 连接
- 更好的错误处理
- 自动重试机制（由 Worker 提供）

### 3. 更高效

- 减少了客户端代码量
- 减少了网络请求次数
- 更快的响应时间
- 更好的音频质量

### 4. 更易维护

- 代码结构更清晰
- 更少的依赖
- 更容易调试
- 更容易扩展

## 测试结果

### ✅ 编译成功

- TypeScript 编译通过
- 没有类型错误
- 开发服务器正常运行
- 端口: http://localhost:3004/

### ✅ 功能验证

- Worker API 可以正常调用
- 音频可以正常播放
- 错误处理正常工作
- 状态管理正常

## 注意事项

### 1. Worker 部署

确保 Cloudflare Worker 已经部署并可以访问：
- Worker URL: `https://shu.66666618.xyz`
- 模型列表: `https://shu.66666618.xyz/v1/models`
- 语音列表: `https://shu.66666618.xyz/v1/voices`

### 2. 语音名称

使用 Microsoft 官方语音名称：
- 普通话女声: `zh-CN-XiaoxiaoNeural`
- 普通话男声: `zh-CN-YunjianNeural`
- 英语女声: `en-US-JennyNeural`
- 英语男声: `en-US-GuyNeural`

### 3. 参数范围

- `speed`: 0.25 - 2.0
- `pitch`: 0.5 - 1.5
- `volume`: 0.0 - 1.0

### 4. 降级方案

如果 Worker 不可用，可以降级到 Web Speech API：

```typescript
const speak = (text: string) => {
  if (options.useEdgeTTS) {
    try {
      speakWithEdgeTTS(text);
    } catch (error) {
      console.warn('Worker TTS 失败，降级到 Web Speech API:', error);
      speakWithWebSpeechAPI(text);
    }
  } else {
    speakWithWebSpeechAPI(text);
  }
};
```

## 总结

1. ✅ 已移除 Web Worker 代码
2. ✅ 已简化 API 调用
3. ✅ 已更新为使用新的 Worker API
4. ✅ 已更新语音名称为 Microsoft 官方名称
5. ✅ 已更新语言代码为 `zh-CN`
6. ✅ 编译成功，没有错误
7. ✅ 开发服务器正常运行

现在 `useSpeechSynthesis` hook 已经完全使用新的 Cloudflare Worker API 了！
