const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing AskDB API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    console.log('');

    // Test history endpoint (should be empty initially)
    console.log('2. Testing history endpoint...');
    const historyResponse = await axios.get(`${BASE_URL}/api/history`);
    console.log('✅ History endpoint working:', historyResponse.data);
    console.log('');

    // Test query endpoint (will fail without database, but should handle error gracefully)
    console.log('3. Testing query endpoint...');
    try {
      const queryResponse = await axios.post(`${BASE_URL}/api/query`, {
        prompt: 'Get top 5 selling products this year'
      });
      console.log('✅ Query endpoint working:', queryResponse.data);
    } catch (error) {
      console.log('⚠️  Query endpoint error (expected without database):', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test SQL endpoint (will fail without database, but should handle error gracefully)
    console.log('4. Testing SQL endpoint...');
    try {
      const sqlResponse = await axios.post(`${BASE_URL}/api/run-sql`, {
        sql: 'SELECT 1 as test;'
      });
      console.log('✅ SQL endpoint working:', sqlResponse.data);
    } catch (error) {
      console.log('⚠️  SQL endpoint error (expected without database):', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test export endpoint
    console.log('5. Testing export endpoint...');
    try {
      const exportResponse = await axios.get(`${BASE_URL}/api/export?format=json&query_id=test`);
      console.log('✅ Export endpoint working:', exportResponse.data);
    } catch (error) {
      console.log('⚠️  Export endpoint error (expected without query_id):', error.response?.data?.message || error.message);
    }
    console.log('');

    console.log('🎉 API testing completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Upload a SQLite database file using POST /api/upload-db');
    console.log('2. Test natural language queries using POST /api/query');
    console.log('3. Test raw SQL execution using POST /api/run-sql');

  } catch (error) {
    console.error('❌ API test failed:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
}

// Run the test
testAPI();
