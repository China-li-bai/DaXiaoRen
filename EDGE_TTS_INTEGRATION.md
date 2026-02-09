# Edge TTS 集成说明

## 概述

本项目集成了 Microsoft Edge TTS（文本转语音）服务，提供高质量的语音合成功能。

## 中国区访问问题

由于 `speech.platform.bing.com` 在中国区可能被屏蔽或返回 404 错误，我们提供了 Cloudflare Worker 代理方案来解决这个问题。

## 技术架构

### 1. Web Worker 实现
- 使用 Web Worker 在后台线程中处理 TTS 请求
- 避免阻塞主线程，提升用户体验
- 动态创建 Worker，无需额外文件

### 2. Cloudflare Worker 代理
- 部署 Cloudflare Worker 作为反向代理
- 绕过中国区访问限制
- 提供 CORS 支持和缓存功能

### 3. API 端点
```
原始端点：https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1
代理端点：https://dadaxiaoren.com/tts
```

### 4. 支持的格式
- 输出格式：`audio-24khz-48kbitrate-mono-mp3`
- 编码：MP3
- 采样率：24kHz
- 比特率：48kbps

## 使用方法

### 基本配置

```typescript
const { speak, isSupported } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)',
  edgeTTSProxy: 'https://dadaxiaoren.com/tts',
  rate: 0.85,
  pitch: 1.0,
  volume: 1.0
});
```

### 使用代理（推荐）

```typescript
const { speak } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)',
  edgeTTSProxy: 'https://dadaxiaoren.com/tts'
});
```

### 不使用代理（可能在中国区无法访问）

```typescript
const { speak } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)'
  // 不设置 edgeTTSProxy，直接访问原始端点
});
```

### 参数说明

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `useEdgeTTS` | boolean | false | 是否使用 Edge TTS |
| `edgeVoice` | string | - | Edge TTS 语音名称 |
| `edgeTTSProxy` | string | - | Cloudflare Worker 代理 URL（推荐使用） |
| `rate` | number | 1.0 | 语速（0.5-2.0） |
| `pitch` | number | 1.0 | 音调（0.5-2.0） |
| `volume` | number | 1.0 | 音量（0.0-1.0） |

## 可用语音列表

### 中文语音

#### 粤语（香港）
- `Microsoft Yating (zh-HK)` - 女声，标准粤语
- `Microsoft Danny (zh-HK)` - 男声，标准粤语

#### 普通话（大陆）
- `Microsoft Xiaoxiao (zh-CN)` - 女声，标准普通话
- `Microsoft Yunjian (zh-CN)` - 男声，标准普通话
- `Microsoft Yunxi (zh-CN)` - 男声，标准普通话
- `Microsoft Xiaoyi (zh-CN)` - 女声，标准普通话
- `Microsoft Yunyang (zh-CN)` - 男声，标准普通话
- `Microsoft Xiaohan (zh-CN)` - 女声，标准普通话
- `Microsoft Xiaomeng (zh-CN)` - 女声，标准普通话
- `Microsoft Xiaoxuan (zh-CN)` - 女声，标准普通话
- `Microsoft Xiaofei (zh-CN)` - 女声，标准普通话
- `Microsoft Xiaoyoung (zh-CN)` - 女声，标准普通话

#### 普通话（台湾）
- `Microsoft HsiaoChen (zh-TW)` - 女声，标准国语
- `Microsoft HsiaoYu (zh-TW)` - 女声，标准国语
- `Microsoft Yating (zh-TW)` - 女声，标准国语

### 英文语音

#### 美式英语
- `Microsoft Jenny (en-US)` - 女声，标准美式
- `Microsoft Guy (en-US)` - 男声，标准美式
- `Microsoft Aria (en-US)` - 女声，标准美式
- `Microsoft Davis (en-US)` - 男声，标准美式
- `Microsoft Jane (en-US)` - 女声，标准美式

#### 英式英语
- `Microsoft Sonia (en-GB)` - 女声，标准英式
- `Microsoft Ryan (en-GB)` - 男声，标准英式

#### 澳大利亚英语
- `Microsoft Natasha (en-AU)` - 女声，标准澳式
- `Microsoft William (en-AU)` - 男声，标准澳式

### 其他语言

#### 日语
- `Microsoft Nanami (ja-JP)` - 女声，标准日语
- `Microsoft Keita (ja-JP)` - 男声，标准日语

#### 韩语
- `Microsoft SunHi (ko-KR)` - 女声，标准韩语
- `Microsoft InJoon (ko-KR)` - 男声，标准韩语

#### 西班牙语
- `Microsoft Elvira (es-ES)` - 女声，标准西班牙语
- `Microsoft Alvaro (es-ES)` - 男声，标准西班牙语

#### 法语
- `Microsoft Denice (fr-FR)` - 女声，标准法语
- `Microsoft Paul (fr-FR)` - 男声，标准法语

#### 德语
- `Microsoft Katja (de-DE)` - 女声，标准德语
- `Microsoft Conrad (de-DE)` - 男声，标准德语

## 降级策略

当 Edge TTS 不可用时，系统会自动降级到浏览器原生的 Web Speech API：

```typescript
const { speak } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)',
  lang: 'zh-HK'
});

// 如果 Edge TTS 失败，会自动使用 Web Speech API
```

## 降级顺序

1. **Edge TTS**（如果 `useEdgeTTS: true` 且 `edgeVoice` 已设置）
2. **Web Speech API**（浏览器原生支持）
3. **静默失败**（如果两者都不可用）

## 注意事项

### CORS 限制
Edge TTS API 可能会受到 CORS 限制。如果遇到跨域问题，可以考虑：
1. 使用代理服务器
2. 降级到 Web Speech API
3. 使用 Cloudflare Worker 中转请求

### 速率限制
Microsoft 可能会对 Edge TTS API 实施速率限制。建议：
- 控制请求频率
- 缓存常用语音
- 实现重试机制

### 浏览器兼容性
- ✅ Chrome/Edge：完全支持
- ✅ Firefox：支持（可能需要配置）
- ⚠️ Safari：部分支持（Web Worker 限制）
- ❌ IE：不支持

## 示例代码

### 播放单句文本
```typescript
const { speak } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)'
});

speak('你好，世界！');
```

### 播放多句文本
```typescript
const { speak } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)'
});

const chants = ['打小人，打小人', '打得小人不敢再欺人', '平安顺遂，万事如意'];
speak(chants.join('，'));
```

### 取消播放
```typescript
const { speak, cancel } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)'
});

speak('正在播放...');
setTimeout(() => {
  cancel();
}, 3000);
```

## 故障排除

### 问题：语音无法播放
**解决方案：**
1. 检查 `isSupported` 状态
2. 确认网络连接正常
3. 检查浏览器控制台错误信息
4. 尝试降级到 Web Speech API

### 问题：语音质量不佳
**解决方案：**
1. 尝试不同的语音名称
2. 调整 `rate` 和 `pitch` 参数
3. 确保文本格式正确（使用 SSML）

### 问题：播放中断
**解决方案：**
1. 检查是否有其他音频播放
2. 确认浏览器允许音频自动播放
3. 检查网络连接稳定性

## Cloudflare Worker 部署指南

### 1. 创建 Worker

在 Cloudflare Dashboard 中创建新的 Worker：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages**
3. 点击 **Create Application**
4. 选择 **Create Worker**
5. 给 Worker 命名（例如：`edge-tts-proxy`）

### 2. 部署 Worker 代码

将以下代码复制到 Worker 编辑器中：

```javascript
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
```

### 3. 部署 Worker

1. 点击 **Deploy** 按钮
2. 等待部署完成
3. 记录 Worker 的 URL（例如：`https://edge-tts-proxy.your-subdomain.workers.dev`）

### 4. 绑定自定义域名（可选）

1. 在 Worker 设置中，点击 **Triggers** → **Custom Domains**
2. 点击 **Set up a custom domain**
3. 输入你的域名（例如：`tts.yourdomain.com`）
4. 按照提示配置 DNS 记录

### 5. 使用代理 URL

将 Worker URL 配置到你的应用中：

```typescript
const { speak } = useSpeechSynthesis({
  useEdgeTTS: true,
  edgeVoice: 'Microsoft Yating (zh-HK)',
  edgeTTSProxy: 'https://tts.yourdomain.com/tts'
});
```

### 6. 测试代理

使用 curl 测试代理是否正常工作：

```bash
curl "https://tts.yourdomain.com/tts?text=你好&voice=Microsoft%20Yating%20(zh-HK)&rate=1.0&pitch=1.0" \
  --output test.mp3
```

如果成功，会下载一个 MP3 文件。

## 参考资源

- [Edge TTS GitHub](https://github.com/rany2/edge-tts)
- [Microsoft Azure TTS 文档](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
- [Web Speech API 规范](https://w3c.github.io/speech-api/)
- [SSML 参考](https://www.w3.org/TR/speech-synthesis11/)

## 更新日志

### 2026-02-09
- ✅ 添加 Edge TTS 支持
- ✅ 实现 Web Worker 集成
- ✅ 添加降级策略
- ✅ 支持多语言和多语音
- ✅ 集成到打小人游戏
