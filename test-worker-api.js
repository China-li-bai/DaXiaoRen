const WORKER_URL = 'https://daxiaoren-api.1272679088.workers.dev';

async function testWorkerAPI() {
  console.log('🧪 测试 Cloudflare Worker API...\n');

  // 测试 identify API
  console.log('📋 测试 1: identify API');
  try {
    const response = await fetch(`${WORKER_URL}/api/identify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: '特朗普',
        lang: 'zh'
      })
    });

    const data = await response.json();
    console.log('✅ identify API 成功');
    console.log('📝 响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ identify API 失败:', error.message);
  }

  console.log('\n---\n');

  // 测试 ritual API
  console.log('📋 测试 2: ritual API');
  try {
    const response = await fetch(`${WORKER_URL}/api/ritual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        villain: {
          name: '特朗普',
          type: '政治人物',
          reason: '政策争议'
        },
        lang: 'zh'
      })
    });

    const data = await response.json();
    console.log('✅ ritual API 成功');
    console.log('📝 响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ ritual API 失败:', error.message);
  }

  console.log('\n---\n');

  // 测试 resolution API
  console.log('📋 测试 3: resolution API');
  try {
    const response = await fetch(`${WORKER_URL}/api/resolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        villain: {
          name: '特朗普',
          type: '政治人物',
          reason: '政策争议'
        },
        lang: 'zh'
      })
    });

    const data = await response.json();
    console.log('✅ resolution API 成功');
    console.log('📝 响应:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.log('❌ resolution API 失败:', error.message);
  }

  console.log('\n✅ 测试完成！');
  console.log(`\n🌐 Worker URL: ${WORKER_URL}`);
}

testWorkerAPI();
