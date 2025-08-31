const readline = require('readline');
const { testWithYourDatabase, uploadDatabase, testCustomQuery } = require('./test-your-db');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}

async function interactiveTest() {
  console.log('🤖 AskDB AI Interactive Test\n');
  console.log('This will help you test the AI with your own database.\n');

  try {
    // First, run the basic test
    await testWithYourDatabase();

    console.log('\n' + '='.repeat(50));
    console.log('INTERACTIVE TESTING');
    console.log('='.repeat(50));

    while (true) {
      console.log('\nChoose an option:');
      console.log('1. Upload a database file (.sql)');
      console.log('2. Test a custom natural language query');
      console.log('3. View current database schema');
      console.log('4. Test AI connection');
      console.log('5. Exit');

      const choice = await askQuestion('\nEnter your choice (1-5): ');

      switch (choice) {
        case '1':
          const filePath = await askQuestion('Enter the path to your .sql file: ');
          await uploadDatabase(filePath);
          break;

        case '2':
          const prompt = await askQuestion('Enter your natural language query: ');
          await testCustomQuery(prompt);
          break;

        case '3':
          console.log('\n📊 Getting current database schema...');
          try {
            const axios = require('axios');
            const response = await axios.get('http://localhost:3000/api/schema');
            console.log('✅ Database:', response.data.schema.database_name);
            response.data.schema.tables.forEach((table, index) => {
              console.log(`   Table ${index + 1}: ${table.name}`);
              table.columns.forEach(col => {
                console.log(`     - ${col.name} (${col.type})`);
              });
            });
          } catch (error) {
            console.log('❌ No database schema found or error occurred');
          }
          break;

        case '4':
          console.log('\n🔗 Testing AI connection...');
          try {
            const axios = require('axios');
            const response = await axios.get('http://localhost:3000/api/test-ai');
            console.log('✅ AI Connected:', response.data.ai_connected);
            console.log('   Model:', response.data.model_info.model);
          } catch (error) {
            console.log('❌ AI connection test failed');
          }
          break;

        case '5':
          console.log('\n👋 Goodbye!');
          rl.close();
          return;

        default:
          console.log('❌ Invalid choice. Please enter 1-5.');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

// Run the interactive test
interactiveTest();
