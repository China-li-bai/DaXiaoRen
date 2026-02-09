# Microsoft SSML 语音合成标记语言文档总结

## 核心概念

SSML (Speech Synthesis Markup Language) 是 W3C 标准的语音合成标记语言。Microsoft 在此基础上扩展了 `mstts` 命名空间，提供了更多高级功能。

**基本结构**：
```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="语音名称">
    文本内容
  </voice>
</speak>
```

## voice 元素 - 语音选择

**必需属性**：
- `name`: 语音名称（如 `zh-CN-XiaoxiaoNeural`）

**可选属性**：
- `effect`: 音频效果处理器

**支持的 effect 值**：
- `eq_car`: 汽车、公共汽车等封闭车辆场景优化
- `eq_telecomhp8k`: 电信或电话场景优化（需 8 kHz 采样率）

**示例**：
```xml
<voice name="zh-CN-XiaoxiaoNeural" effect="eq_car">
  这是在汽车场景中优化的语音。
</voice>
```

## 多重语音支持

可以在单个 SSML 文档中使用多个 `voice` 元素，实现不同语音的切换。

**示例**：
```xml
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
  <voice name="en-US-Ava:DragonHDLatestNeural">
    Good morning!
  </voice>
  <voice name="en-US-Andrew:DragonHDLatestNeural">
    Good morning to you too Ava!
  </voice>
</speak>
```

## 自定义语音

使用自定义语音时，直接将模型名称作为语音名称。

**示例**：
```xml
<voice name="my-custom-voice">
  This is the text that is spoken.
</voice>
```

## 多重发言者语音

**核心功能**：
- 实现多个不同说话者之间的自然动态对话
- 保留上下文流、情感一致性和自然语音模式
- 适用于播客风格、对话交流等场景

**使用方式**：
使用 `mstts:dialog` 和 `mstts:turn` 元素。

**示例**：
```xml
<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xmlns:mstts='https://www.w3.org/2001/mstts' xml:lang='en-US'>
  <voice name='en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural'>
    <mstts:dialog>
      <mstts:turn speaker="ava">Hello, Andrew! How's your day going?</mstts:turn>
      <mstts:turn speaker="andrew">Hey Ava! It's been great, just exploring some AI advancements.</mstts:turn>
      <mstts:turn speaker="ava">That sounds interesting! What kind of projects are you working on?</mstts:turn>
      <mstts:turn speaker="andrew">Well, we've been experimenting with text-to-speech applications.</mstts:turn>
    </mstts:dialog>
  </voice>
</speak>
```

**关键点**：
- 使用特定的多重发言者语音（如 `en-US-MultiTalker-Ava-Andrew:DragonHDLatestNeural`）
- 每个 `mstts:turn` 指定说话者（`speaker` 属性）
- 模型会自动保持对话的连贯性和情感一致性

## 功能对比表

| 功能 | 元素/属性 | 用途 | 复杂度 |
|------|----------|------|--------|
| 语音选择 | `voice name` | 选择语音角色 | ⭐ |
| 音频效果 | `voice effect` | 优化特定场景音质 | ⭐⭐ |
| 多重语音 | 多个 `voice` 元素 | 切换不同语音 | ⭐⭐ |
| 多重发言者 | `mstts:dialog` + `mstts:turn` | 自然对话生成 | ⭐⭐⭐ |

## 总结

**Microsoft SSML 的核心价值**：
1. **标准化**：基于 W3C 标准，兼容性好
2. **扩展性**：通过 `mstts` 命名空间提供高级功能
3. **灵活性**：支持从简单到复杂的各种场景

**使用建议**：
- 简单场景：使用单个 `voice` 元素
- 对话场景：使用多重发言者功能
- 特定场景：使用 `effect` 优化音质
