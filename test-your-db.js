const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api';

async function testWithYourDatabase() {
  console.log('🤖 Testing AskDB AI with Your Database...\n');

  try {
    // Test 1: Check if server is running
    console.log('1. Testing server connection...');
    const rootResponse = await axios.get(`${API_BASE}/`);
    console.log('✅ Server is running:', rootResponse.data.message);

    // Test 2: Test AI connection
    console.log('\n2. Testing AI connection...');
    const aiResponse = await axios.get(`${API_BASE}/test-ai`);
    console.log('✅ AI Connection:', aiResponse.data.ai_connected ? 'Connected' : 'Failed');
    console.log('   Model:', aiResponse.data.model_info.model);

    if (!aiResponse.data.ai_connected) {
      console.log('\n❌ AI is not connected. Please check your OpenAI API key in .env file');
      return;
    }

    // Test 3: Check if you have an active database
    console.log('\n3. Checking for active database...');
    try {
      const schemaResponse = await axios.get(`${API_BASE}/schema`);
      console.log('✅ Database found:', schemaResponse.data.schema.database_name);
      console.log('   Tables:', schemaResponse.data.schema.tables.length);
      
      // Show table names
      schemaResponse.data.schema.tables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.name} (${table.columns.length} columns)`);
      });

      // Test 4: Try some natural language queries
      console.log('\n4. Testing natural language queries...');
      
      const testQueries = [
        'Show me all data from the first table',
        'Count the number of records',
        'Show me the first 5 records',
        'List all columns from the first table'
      ];

      for (const query of testQueries) {
        try {
          console.log(`\n   Testing: "${query}"`);
          const queryResponse = await axios.post(`${API_BASE}/query`, {
            prompt: query
          });
          console.log(`   ✅ Generated SQL: ${queryResponse.data.sql}`);
          console.log(`   📊 Results: ${queryResponse.data.results.length} rows`);
          
          // Show first few results
          if (queryResponse.data.results.length > 0) {
            console.log('   Sample data:', JSON.stringify(queryResponse.data.results[0], null, 2));
          }
        } catch (error) {
          console.log(`   ❌ Failed: ${error.response?.data?.message || error.message}`);
        }
      }

    } catch (error) {
      console.log('⚠️  No active database found');
      console.log('\n📋 To upload your database:');
      console.log('   1. Create a .sql file with your database dump');
      console.log('   2. Use: curl -X POST -F "file=@your_database.sql" http://localhost:3000/api/upload-db');
      console.log('   3. Or use the upload script below');
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the server is running:');
      console.log('   npm start');
    }
  }
}

// Function to upload a database file
async function uploadDatabase(filePath) {
  console.log(`📤 Uploading database: ${filePath}`);
  
  try {
    const FormData = require('form-data');
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const response = await axios.post(`${API_BASE}/upload-db`, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    console.log('✅ Database uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    return null;
  }
}

// Function to test custom queries
async function testCustomQuery(prompt) {
  console.log(`\n🔍 Testing custom query: "${prompt}"`);
  
  try {
    const response = await axios.post(`${API_BASE}/query`, { prompt });
    console.log('✅ Generated SQL:', response.data.sql);
    console.log('📊 Results count:', response.data.results.length);
    
    if (response.data.results.length > 0) {
      console.log('📋 First result:', JSON.stringify(response.data.results[0], null, 2));
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Query failed:', error.response?.data || error.message);
    return null;
  }
}

// Export functions for manual testing
module.exports = {
  testWithYourDatabase,
  uploadDatabase,
  testCustomQuery
};

// Run the test if this file is executed directly
if (require.main === module) {
  testWithYourDatabase();
}
