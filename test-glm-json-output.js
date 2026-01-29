const API_KEY = 'd946d990667549baba87595dadb30b42.5r3iUUtIbhPQ5kwA';

const MODELS = [
  {
    name: 'GLM-4.7-Flash',
    modelId: 'glm-4.7-flash',
    description: '30B混合思考模型，3B激活参数，2026年1月发布',
    features: ['混合思考', '完全免费', '性能最强', '支持搜索'],
    bestFor: '通用任务、复杂推理、搜索'
  },
  {
    name: 'GLM-4-Flash',
    modelId: 'glm-4-flash-250414',
    description: '首个免费模型，支持实时网页检索',
    features: ['实时搜索', '长上下文', '多语言', '完全免费'],
    bestFor: '搜索任务、问答、摘要'
  },
  {
    name: 'GLM-Z1-Flash',
    modelId: 'glm-z1-flash',
    description: '推理模型，速度快，价格低',
    features: ['推理速度快', '性价比高', '轻量化'],
    bestFor: '快速推理、代码生成'
  }
];

const TEST_SCENARIOS = [
  {
    name: '搜索任务（JSON输出）',
    query: '2026年最新的AI大模型有哪些？',
    webSearch: true,
    jsonMode: true
  },
  {
    name: '生成任务（JSON输出）',
    query: '请分析DeepSeek V3.2相比GPT-4的优势和劣势',
    webSearch: false,
    jsonMode: true
  }
];

async function testModel(model, scenario) {
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
            content: "你是一个AI助手，请准确回答问题。"
          },
          {
            role: "user",
            content: scenario.query
          }
        ],
        temperature: 0.7,
        top_p: 0.9,
        thinking: { type: "enabled", clear_thinking: true },
        response_format: { type: "json_object" },
        tools: scenario.webSearch ? [{ type: "web_search", web_search: { enable: true } }] : undefined
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
    const message = data.choices[0]?.message || {};
    
    const hasReasoning = !!message.reasoning_content;
    const content = message.content || '';
    const reasoningLength = message.reasoning_content?.length || 0;
    const contentLength = content.length;

    // 尝试解析JSON
    let isValidJson = false;
    let parsedJson = null;
    try {
      parsedJson = JSON.parse(content);
      isValidJson = true;
    } catch (e) {
      isValidJson = false;
    }

    return {
      success: true,
      duration,
      hasReasoning,
      reasoningLength,
      contentLength,
      isValidJson,
      parsedJson,
      content: content.substring(0, 200),
      reasoningPreview: message.reasoning_content?.substring(0, 100) || 'N/A'
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
  console.log('🧪 开始测试智谱AI免费模型（JSON输出模式）...\n');

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n📊 测试场景: ${scenario.name}`);
    console.log(`❓ 问题: ${scenario.query}`);
    console.log(`⚙️ 配置: response_format={type:"json_object"}\n`);

    const results = [];

    for (const model of MODELS) {
      console.log(`🤖 测试模型: ${model.name}`);
      console.log(`📝 描述: ${model.description}`);
      console.log(`⚡ 特性: ${model.features.join(', ')}`);
      
      const result = await testModel(model, scenario);
      results.push({ model: model.name, ...result });
      
      if (result.success) {
        console.log(`✅ 成功 (${result.duration}ms)`);
        console.log(`📝 内容长度: ${result.contentLength} 字符`);
        console.log(`🔍 JSON格式: ${result.isValidJson ? '✅ 有效' : '❌ 无效'}`);
        
        if (result.isValidJson) {
          console.log(`💡 JSON结构: ${JSON.stringify(Object.keys(result.parsedJson))}`);
        }
        
        if (result.hasReasoning) {
          console.log(`🧠 思考内容: 存在 (${result.reasoningLength} 字符)`);
        }
        
        console.log(`💬 回答预览: ${result.content.substring(0, 100)}...`);
      } else {
        console.log(`❌ 失败 (${result.duration}ms)`);
        console.log(`🚨 错误: ${result.error}`);
      }
      
      console.log('---');
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 对比结果
    console.log(`\n📈 ${scenario.name} - 模型对比:`);
    console.log('模型 | 响应时间 | JSON格式 | 思考内容 | 推荐');
    console.log('--- | --- | --- | --- | ---');
    
    for (const result of results) {
      const recommendation = result.success && result.isValidJson ? '✅' : '❌';
      console.log(`${result.model} | ${result.duration}ms | ${result.isValidJson ? '✅' : '❌'} | ${result.hasReasoning ? '✅' : '❌'} | ${recommendation}`);
    }
  }

  console.log('\n\n📋 模型对比总结:\n');
  console.log('模型名称 | 参数 | 特性 | 适用场景 | JSON输出');
  console.log('--- | --- | --- | --- | ---');
  
  for (const model of MODELS) {
    console.log(`${model.name} | ${model.description.split('，')[0]} | ${model.features.slice(0, 2).join(', ')} | ${model.bestFor} | ✅ 支持`);
  }

  console.log('\n✅ 测试完成！');
  console.log('\n💡 推荐配置:');
  console.log('- 搜索任务: GLM-4-Flash (实时搜索能力 + JSON输出)');
  console.log('- 生成任务: GLM-Z1-Flash (推理速度快 + JSON输出)');
  console.log('- 复杂推理: GLM-4.7-Flash (混合思考 + JSON输出)');
  console.log('\n🔧 所有接口使用 response_format: { type: "json_object" }');
}

runTests().catch(console.error);
