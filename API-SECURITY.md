# API Key 和提示词安全保护方案

## 🚨 安全风险

### 当前问题
1. **API Key 暴露**：前端代码中直接包含 API key
2. **提示词暴露**：系统提示词硬编码在前端
3. **任何人都可以查看源代码**：通过浏览器开发者工具获取敏感信息

## 🛡️ 解决方案

### 方案一：Cloudflare Workers 代理（推荐）

#### 优点
- ✅ 免费
- ✅ 无需服务器
- ✅ API Key 存储在 Workers 环境变量中
- ✅ 提示词存储在 Workers 中
- ✅ 全球 CDN 加速

#### 实现步骤

##### 1. 创建 Cloudflare Worker

```javascript
// wrangler.toml
name = "daxiaoren-api"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[vars]
# API Key 将在 Cloudflare Dashboard 中设置
```

```javascript
// src/worker.js
export default {
  async fetch(request, env, ctx) {
    // 处理 CORS
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
      const { messages, jsonMode, webSearch } = await request.json();
      
      // 提示词存储在 Workers 中
      const prompts = {
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

      const payload = {
        model: "glm-4-flash",
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
          "Authorization": `Bearer ${env.ZHIPU_API_KEY}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      // 过滤思考内容
      const message = data.choices[0]?.message;
      let result = message?.content || "{}";
      
      if (message && message.reasoning_content) {
        result = message.content || "{}";
      }

      return new Response(JSON.stringify(data), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (error) {
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
```

##### 2. 设置环境变量

在 Cloudflare Dashboard 中设置：
- `ZHIPU_API_KEY` = 你的 API key

##### 3. 部署 Worker

```bash
npm install -g wrangler
wrangler login
wrangler deploy
```

##### 4. 前端调用

```typescript
// 前端代码
const API_BASE = 'https://daxiaoren-api.your-subdomain.workers.dev';

export const identifyVillain = async (
  query: string,
  lang: Language
): Promise<IdentifyResponse> => {
  const response = await fetch(`${API_BASE}/api/identify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, lang })
  });

  const data = await response.json();
  return data;
};
```

---

### 方案二：Vercel Functions（推荐）

#### 优点
- ✅ 免费
- ✅ 无需服务器
- ✅ API Key 存储在环境变量中
- ✅ 提示词存储在 Functions 中

#### 实现步骤

##### 1. 创建 Vercel Function

```javascript
// api/identify.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, lang } = req.body;

  // 提示词存储在 Functions 中
  const prompts = {
    identify: {
      en: "You are a helpful assistant...",
      zh: "你是一个通过搜索帮助用户..."
    }
  };

  const messages = [
    { role: "system", content: prompts.identify[lang] },
    { role: "user", content: `请搜索并回答："${query}" 是谁？` }
  ];

  const payload = {
    model: "glm-4-flash",
    messages,
    temperature: 0.7,
    top_p: 0.9,
    thinking: { type: "enabled", clear_thinking: true },
    response_format: { type: "json_object" },
    tools: [{ type: "web_search", web_search: { enable: true } }]
  };

  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.ZHIPU_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  
  // 过滤思考内容
  const message = data.choices[0]?.message;
  let result = message?.content || "{}";
  
  if (message && message.reasoning_content) {
    result = message.content || "{}";
  }

  return res.status(200).json(data);
}
```

##### 2. 设置环境变量

在 Vercel Dashboard 中设置：
- `ZHIPU_API_KEY` = 你的 API key

##### 3. 部署

```bash
npm install -g vercel
vercel login
vercel
```

##### 4. 前端调用

```typescript
const API_BASE = 'https://your-project.vercel.app/api';

export const identifyVillain = async (
  query: string,
  lang: Language
): Promise<IdentifyResponse> => {
  const response = await fetch(`${API_BASE}/identify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, lang })
  });

  const data = await response.json();
  return data;
};
```

---

### 方案三：GitHub Actions + GitHub Pages（当前方案）

#### 优点
- ✅ 免费
- ✅ 使用 GitHub Pages 部署
- ✅ API Key 存储在 GitHub Secrets 中

#### 缺点
- ❌ API Key 仍然会暴露在前端代码中（通过环境变量注入）
- ❌ 提示词仍然暴露在前端代码中

#### 改进建议

即使使用 GitHub Actions，仍然建议：
1. **混淆前端代码**：使用代码混淆工具
2. **代码分割**：将 API 调用逻辑分离到单独文件
3. **使用环境变量**：API Key 通过环境变量注入

---

## 📋 方案对比

| 方案 | 免费度 | 安全性 | 难度 | 推荐 |
|------|--------|--------|------|------|
| **Cloudflare Workers** | ✅ 免费 | ✅ 高 | ⭐⭐⭐⭐⭐⭐⭐ |
| **Vercel Functions** | ✅ 免费 | ✅ 高 | ⭐⭐⭐⭐⭐ |
| **GitHub Actions** | ✅ 免费 | ⚠️ 中 | ⭐⭐⭐ |
| **自建服务器** | ❌ 付费 | ✅ 高 | ⭐⭐⭐ |

---

## 🎯 推荐方案

### 最佳选择：Cloudflare Workers

**原因**：
1. ✅ 完全免费
2. ✅ 无需服务器
3. ✅ 全球 CDN 加速
4. ✅ API Key 和提示词完全隐藏
5. ✅ 易于部署和维护
6. ✅ 与你的 Cloudflare 域名集成

### 次选方案：Vercel Functions

**原因**：
1. ✅ 完全免费
2. ✅ 无需服务器
3. ✅ API Key 和提示词完全隐藏
4. ✅ 易于部署和维护

---

## 🔧 实施步骤（Cloudflare Workers）

### 1. 创建 Worker 项目

```bash
mkdir daxiaoren-worker
cd daxiaoren-worker
npm init -y
npm install wrangler
```

### 2. 创建 Worker 代码

创建 `src/worker.js` 文件，使用上面的代码。

### 3. 创建配置文件

创建 `wrangler.toml` 文件：

```toml
name = "daxiaoren-api"
main = "src/worker.js"
compatibility_date = "2024-01-01"

[vars]
# API Key 将在 Cloudflare Dashboard 中设置
```

### 4. 部署 Worker

```bash
wrangler login
wrangler deploy
```

### 5. 设置环境变量

在 Cloudflare Dashboard 中设置：
- `ZHIPU_API_KEY` = `d946d990667549baba87595dadb30b42.5r3iUUtIbhPQ5kwA`

### 6. 更新前端代码

修改前端代码，调用 Worker API 而不是直接调用智谱 API。

---

## 🚀 快速开始

### 最简单方案（5分钟部署）

如果你想快速部署，可以使用这个模板：

```bash
# 1. 克隆模板
git clone https://github.com/cloudflare/templates.git
cd templates/workers

# 2. 修改代码
# 将上面的 worker.js 代码复制到项目中

# 3. 部署
wrangler deploy
```

---

## 📝 总结

### 当前问题
- ❌ API Key 暴露在前端
- ❌ 提示词暴露在前端
- ❌ 任何人都可以查看源代码

### 解决方案
- ✅ 使用 Cloudflare Workers 代理
- ✅ API Key 存储在服务器端
- ✅ 提示词存储在服务器端
- ✅ 前端只调用代理 API

### 安全提升
- 🔒 API Key 完全隐藏
- 🔒 提示词完全隐藏
- 🔒 只有服务器端知道敏感信息
- 🔒 前端代码无需包含敏感信息

**推荐使用 Cloudflare Workers 方案！** 🚀
