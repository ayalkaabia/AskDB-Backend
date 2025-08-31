# AskDB AI Integration

## Overview

AskDB now includes AI-powered natural language to SQL conversion using OpenAI's GPT-3.5-turbo model. The AI understands your database schema and converts natural language queries into accurate MySQL SQL statements.

## Features

### 🤖 AI-Powered Query Conversion
- **Natural Language Processing**: Convert questions like "Show me the top 10 customers by order value" into SQL
- **Schema-Aware**: AI understands your database structure, relationships, and data types
- **Safe Queries**: Only generates SELECT queries with built-in security validation
- **Fallback System**: Falls back to pattern matching if AI is unavailable

### 📊 Dynamic Schema Discovery
- **Automatic Schema Fetching**: Retrieves complete database structure including:
  - Table names and column definitions
  - Data types and constraints
  - Foreign key relationships
  - Sample data for context
- **Real-time Updates**: Schema is fetched fresh for each query

### 🔒 Security Features
- **Query Validation**: Prevents dangerous operations (INSERT, UPDATE, DELETE, etc.)
- **SQL Injection Protection**: Validates generated queries for suspicious patterns
- **Read-Only Operations**: Only allows SELECT queries

## Setup

### 1. Environment Variables
Add these to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
```

### 2. Install Dependencies
```bash
npm install openai
```

### 3. Test AI Integration
```bash
npm run test-ai
```

## API Endpoints

### New AI-Related Endpoints

#### `GET /api/schema`
Get the complete schema of the current database.

**Response:**
```json
{
  "schema": {
    "database_name": "example_db",
    "tables": [
      {
        "name": "customers",
        "columns": [
          {
            "name": "id",
            "type": "int(11)",
            "key": "PRI",
            "null": "NO"
          }
        ],
        "relationships": [],
        "sample_data": [...]
      }
    ]
  }
}
```

#### `GET /api/test-ai`
Test the AI connection and get model information.

**Response:**
```json
{
  "ai_connected": true,
  "model_info": {
    "model": "gpt-3.5-turbo",
    "maxTokens": 1000,
    "temperature": 0.1
  }
}
```

### Enhanced Query Endpoint

#### `POST /api/query`
Now uses AI for natural language to SQL conversion.

**Request:**
```json
{
  "prompt": "Show me customers who spent more than $1000"
}
```

**Response:**
```json
{
  "sql": "SELECT * FROM `customers` WHERE total_spent > 1000 LIMIT 100",
  "results": [...]
}
```

## How It Works

### 1. Schema Discovery
When a query is submitted:
1. System fetches the current active database
2. Retrieves all table names using `SHOW TABLES`
3. Gets detailed schema for each table using `DESCRIBE`
4. Fetches foreign key relationships from `INFORMATION_SCHEMA`
5. Gets sample data (first 3 rows) for context

### 2. AI Prompt Construction
The system builds an intelligent prompt including:
- Complete database schema with column types
- Table relationships and constraints
- Sample data for context
- User's natural language query

### 3. SQL Generation
OpenAI generates SQL based on:
- Database schema context
- Natural language query
- Security constraints (SELECT only)
- MySQL syntax requirements

### 4. Validation & Execution
Generated SQL is validated for:
- Security (no dangerous operations)
- Syntax (proper MySQL format)
- Safety (no injection patterns)

## Example Queries

The AI can handle complex queries like:

- **"Show me the top 5 customers by total order value"**
- **"Find products that haven't been ordered in the last 30 days"**
- **"Calculate the average order value by month"**
- **"List customers with more than 10 orders"**
- **"Show me sales data for the current year"**

## Error Handling

### AI Service Errors
- **API Key Issues**: Clear error messages for missing/invalid API keys
- **Rate Limiting**: Handles OpenAI API rate limits gracefully
- **Network Issues**: Fallback to pattern matching if AI is unavailable

### Schema Errors
- **No Database**: Clear message when no database is uploaded
- **Schema Issues**: Graceful handling of schema retrieval errors
- **Connection Problems**: Proper error handling for database connection issues

## Configuration

### AI Model Settings
```javascript
// In aiService.js
this.model = 'gpt-3.5-turbo';        // AI model to use
this.maxTokens = 1000;               // Maximum response length
this.temperature = 0.1;              // Response creativity (0.0 = deterministic)
```

### Schema Settings
```javascript
// In schemaService.js
const sampleDataLimit = 3;           // Number of sample rows to include
const maxTables = 50;                // Maximum tables to process
```

## Troubleshooting

### Common Issues

1. **"No active database found"**
   - Upload a database file first using `POST /api/upload-db`

2. **"AI connection failed"**
   - Check your OpenAI API key in `.env`
   - Verify internet connection
   - Check OpenAI service status

3. **"SQL validation failed"**
   - The AI generated an unsafe query
   - Check the error message for details
   - Try rephrasing your question

4. **"Schema retrieval error"**
   - Database connection issues
   - Insufficient permissions
   - Corrupted database file

### Testing
Run the AI test suite:
```bash
npm run test-ai
```

This will test:
- Server connectivity
- AI API connection
- Schema retrieval
- Query processing

## Performance Considerations

- **Schema Caching**: Consider implementing schema caching for large databases
- **Query Optimization**: AI generates basic queries; consider query optimization for production
- **Rate Limiting**: Implement rate limiting for AI API calls
- **Response Time**: AI queries may take 1-3 seconds depending on complexity

## Future Enhancements

- **Query Explanation**: AI explanations of generated SQL
- **Query Suggestions**: AI-powered query suggestions
- **Multi-Database Support**: AI context switching between databases
- **Advanced Analytics**: AI-powered data insights and recommendations
- **Query Optimization**: AI suggestions for query performance improvements
