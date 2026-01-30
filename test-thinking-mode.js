const API_KEY = 'd946d990667549baba87595dadb30b42.5r3iUUtIbhPQ5kwA';

const TEST_SCENARIOS = [
  {
    name: '搜索任务（启用深度思考）',
    query: '2026年最新的AI大模型有哪些？',
    webSearch: true,
    thinking: { type: "enabled", clear_thinking: true }
  },
  {
    name: '生成任务（启用深度思考）',
    query: '请分析DeepSeek V3.2相比GPT-4的优势和劣势',
    webSearch: false,
    thinking: { type: "enabled", clear_thinking: true }
  }
];

async function testScenario(scenario) {
  const startTime = Date.now();
  
  try {
    const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "glm-4-flash",
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
        thinking: scenario.thinking,
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

    return {
      success: true,
      duration,
      hasReasoning,
      reasoningLength,
      contentLength,
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
  console.log('🧪 测试深度思考模式（不输出思考文本）...\n');

  for (const scenario of TEST_SCENARIOS) {
    console.log(`\n📊 测试场景: ${scenario.name}`);
    console.log(`❓ 问题: ${scenario.query}`);
    console.log(`⚙️ 配置: thinking=${JSON.stringify(scenario.thinking)}\n`);

    const result = await testScenario(scenario);
    
    if (result.success) {
      console.log(`✅ 成功 (${result.duration}ms)`);
      console.log(`📝 内容长度: ${result.contentLength} 字符`);
      console.log(`💡 回答预览: ${result.content}...`);
      
      if (result.hasReasoning) {
        console.log(`🧠 思考内容存在: 是 (${result.reasoningLength} 字符)`);
        console.log(`🔍 思考预览: ${result.reasoningPreview}...`);
        console.log(`⚠️ 注意: 思考内容在API响应中，但应该被过滤掉`);
      } else {
        console.log(`🧠 思考内容存在: 否`);
      }
    } else {
      console.log(`❌ 失败 (${result.duration}ms)`);
      console.log(`🚨 错误: ${result.error}`);
    }
    
    console.log('---');
    
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n\n📋 配置说明:\n');
  console.log('```typescript');
  console.log('thinking: { type: "enabled", clear_thinking: true }');
  console.log('```');
  console.log('');
  console.log('参数说明:');
  console.log('- type: "enabled" - 启用深度思考模式');
  console.log('- clear_thinking: true - 清除历史对话中的思考内容');
  console.log('');
  console.log('⚠️ 注意:');
  console.log('- clear_thinking 只影响历史对话中的思考内容');
  console.log('- 当前请求的思考内容仍然会在API响应中返回');
  console.log('- 需要在代码中过滤掉 reasoning_content 字段');
  console.log('');
  console.log('✅ 测试完成！');
}

runTests().catch(console.error);
