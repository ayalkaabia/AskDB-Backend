# AskDB Setup Instructions

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- OpenAI API Key

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd AskDB
npm install
```

### 2. Environment Configuration
Copy the example environment file and configure it:
```bash
cp env.example .env
```

Edit `.env` with your settings:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MySQL Database Configuration
DB_HOST=localhost
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_NAME=askdb
DB_PORT=3306

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

### 3. Database Setup
Run the database seeding script to create the database and tables:
```bash
npm run seed
```

This will:
- Create the `askdb` database if it doesn't exist
- Create all necessary tables (databases, query_history, database_backups)
- Create essential indexes for performance
- Verify the setup is working

### 4. Start the Application
```bash
npm start
```

The API will be available at `http://localhost:3000`

## 🧪 Testing the Setup

### Test Database Creation
Send a POST request to create a database:
```bash
curl -X POST http://localhost:3000/api/v2/query/create-database \
  -H "Content-Type: application/json" \
  -d '{"prompt": "create a database called testdb and add a table called users with id and name columns"}'
```

### Test Natural Language Query
```bash
curl -X POST http://localhost:3000/api/v2/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "show me all users", "database_id": "your-database-id"}'
```

## 🔧 Troubleshooting

### Database Connection Issues
- Ensure MySQL server is running
- Check your `.env` file credentials
- Verify the database user has proper permissions

### OpenAI API Issues
- Verify your API key is correct
- Check your OpenAI account has sufficient credits
- Ensure the model specified in `.env` is available

### Common Errors
- **"Unknown database 'askdb'"**: Run `npm run seed` to create the database
- **"AI conversion failed"**: Check your OpenAI API key and internet connection
- **"Database connection failed"**: Verify MySQL is running and credentials are correct

## 📚 API Documentation

See `API_DOCS.md` for complete API documentation.

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the logs for specific error messages
3. Ensure all prerequisites are installed and configured
4. Verify your `.env` file is properly set up
