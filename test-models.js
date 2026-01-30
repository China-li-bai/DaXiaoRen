const API_KEY = process.env.API_KEY || '';

const MODELS = [
  {
    name: 'GLM-4.7-Flash',
    modelId: 'glm-4-flash',
    description: '30B混合思考模型，2026年1月发布，完全免费'
  },
  {
    name: 'GLM-4-Flash-250414',
    modelId: 'glm-4-flash-250414',
    description: '首个免费模型，支持实时网页检索'
  }
];

const TEST_QUERIES = [
  '2025年2026年广州禁止电动车的专家是谁？',
  '2026年最新的AI大模型有哪些？',
  'DeepSeek V3.2有什么新特性？'
];

async function testModel(model, query) {
  const startTime = Date.now();
  
  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: model.modelId,
        messages: [
          {
            role: "system",
            content: "你是一个搜索助手，请准确回答问题。"
          },
          {
            role: "user",
            content: `请搜索并回答：${query}`
          }
        ],
        temperature: 0.3,
        top_p: 0.9,
        thinking: { type: "disabled" },
        tools: [{ type: "web_search", web_search: { enable: true } }]
      })
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
        duration
      };
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || '';

    return {
      success: true,
      result,
      duration,
      model: model.name
    };
  } catch (error) {
    const endTime = Date.now();
    return {
      success: false,
      error: error.message,
      duration: endTime - startTime
    };
  }
}

async function runTests() {
  console.log('🧪 开始测试免费LLM模型...\n');

  for (const model of MODELS) {
    console.log(`\n📊 测试模型: ${model.name}`);
    console.log(`📝 描述: ${model.description}\n`);

    for (const query of TEST_QUERIES) {
      console.log(`❓ 问题: ${query}`);
      
      const result = await testModel(model, query);
      
      if (result.success) {
        console.log(`✅ 成功 (${result.duration}ms)`);
        console.log(`💡 回答: ${result.result.substring(0, 200)}...`);
      } else {
        console.log(`❌ 失败 (${result.duration}ms)`);
        console.log(`🚨 错误: ${result.error}`);
      }
      
      console.log('---');
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n✅ 测试完成！');
}

runTests().catch(console.error);
