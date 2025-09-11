const OpenAI = require('openai');
const schemaService = require('./schemaService');


// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  constructor() {
    this.model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    this.maxTokens = 1000;
    this.temperature = 0.1; // Low temperature for more consistent SQL generation
  }

  /**
   * Convert natural language to SQL using OpenAI
   */
  async convertToSQL(naturalLanguageQuery) {
    try {
      // Get current database schema
      const schema = await schemaService.getCompleteSchema();
      const schemaPrompt = schemaService.formatSchemaForAI(schema);

      // Construct the AI prompt
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(schemaPrompt, naturalLanguageQuery);

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      // Extract SQL from response
      const sqlQuery = this.extractSQLFromResponse(response);
      
      // Validate the generated SQL
      const validationResult = this.validateGeneratedSQL(sqlQuery);
      if (!validationResult.isValid) {
        throw new Error(`SQL validation failed: ${validationResult.error}`);
      }

      return sqlQuery;

    } catch (error) {
      console.error('AI conversion error:', error);
      throw new Error(`Failed to convert query to SQL: ${error.message}`);
    }
  }

  /**
   * Build system prompt for OpenAI
   */
  buildSystemPrompt() {
    return `You are an expert SQL developer specializing in MySQL. Your task is to convert natural language queries into accurate, safe, and efficient MySQL SQL queries.

IMPORTANT RULES:
1. Generate any type of MySQL query based on user request (SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, etc.)
2. Use proper MySQL syntax with backticks for table and column names
3. For SELECT queries, always include LIMIT clauses for large result sets (default LIMIT 100)
4. Use appropriate JOINs when querying related tables
5. Include proper WHERE clauses for filtering
6. Use aggregate functions (COUNT, SUM, AVG, etc.) when appropriate
7. Order results logically (ORDER BY) when relevant
8. Handle NULL values appropriately
9. Use proper date/time functions for date comparisons
10. For CREATE DATABASE statements, use proper naming conventions
11. For CREATE TABLE statements, include appropriate data types, constraints, and indexes
12. For INSERT/UPDATE/DELETE operations, ensure data integrity and proper WHERE clauses
13. Return only the SQL query, no explanations or markdown formatting

The user will provide a database schema and a natural language query. Generate the most appropriate SQL query based on the schema provided and user requirements.`;
  }

  /**
   * Build user prompt with schema and query
   */
  buildUserPrompt(schemaPrompt, naturalLanguageQuery) {
    return `${schemaPrompt}

User Query: "${naturalLanguageQuery}"

Generate the appropriate MySQL query to fulfill this request. Return only the SQL query, no explanations.`;
  }

  /**
   * Extract SQL from OpenAI response
   */
  extractSQLFromResponse(response) {
    // Remove markdown code blocks if present
    let sql = response.replace(/```sql\s*/gi, '').replace(/```\s*$/gi, '');
    
    // Remove any leading/trailing whitespace
    sql = sql.trim();
    
    // Ensure it starts with a valid SQL statement
    const validStarters = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 
      'ALTER', 'TRUNCATE', 'SHOW', 'DESCRIBE', 'EXPLAIN'
    ];
    
    const startsWithValid = validStarters.some(starter => 
      sql.toUpperCase().startsWith(starter)
    );
    
    if (!startsWithValid) {
      throw new Error('Generated query does not start with a valid SQL statement');
    }
    
    return sql;
  }

  /**
   * Validate generated SQL for safety
   */
  validateGeneratedSQL(sqlQuery) {
    const upperSQL = sqlQuery.toUpperCase();
    
    // Check for potentially dangerous operations (but allow them with proper context)
    const dangerousKeywords = [
      'GRANT', 'REVOKE', 'EXECUTE', 'EXEC', 'INTO OUTFILE', 
      'INTO DUMPFILE', 'LOAD_FILE', 'BENCHMARK', 'SLEEP'
    ];
    
    for (const keyword of dangerousKeywords) {
      if (upperSQL.includes(keyword)) {
        return {
          isValid: false,
          error: `Potentially dangerous operation detected: ${keyword}`
        };
      }
    }
    
    // Check for potential SQL injection patterns
    const suspiciousPatterns = [
      'UNION SELECT',
      '--',
      '/*',
      '*/',
      'XP_',
      'SP_'
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (upperSQL.includes(pattern)) {
        return {
          isValid: false,
          error: `Suspicious pattern detected: ${pattern}`
        };
      }
    }
    
    // Ensure it's a valid SQL statement
    const validStarters = [
      'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 
      'ALTER', 'TRUNCATE', 'SHOW', 'DESCRIBE', 'EXPLAIN'
    ];
    
    const startsWithValid = validStarters.some(starter => 
      upperSQL.startsWith(starter)
    );
    
    if (!startsWithValid) {
      return {
        isValid: false,
        error: 'Query must start with a valid SQL statement'
      };
    }
    
    return { isValid: true };
  }

  /**
   * Test OpenAI connection
   */
  async testConnection() {
    try {
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10,
      });
      if (!completion.choices[0]?.message?.content) {
        throw new Error('No response from OpenAI API');
      }
      return true;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      throw new Error(`AI connection test failed: ${error.message}`);
    }
  }

  /**
   * Get AI model information
   */
  getModelInfo() {
    return {
      model: this.model,
      maxTokens: this.maxTokens,
      temperature: this.temperature
    };
  }

  /**
   * Process chat requests with function calling
   */
  async processChatRequest(chatRequest) {
    try {
      const { message, file, conversation_id, user_id, conversation_history } = chatRequest;
      
      const systemPrompt = this.buildChatSystemPrompt(conversation_history);
      
      let userMessage = message;
      if (file) {
        userMessage += `\n\n[File attached: ${file.originalname}]`;
      }

      const functions = this.getAvailableFunctions();
      const completion = await openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        functions: functions,
        function_call: 'auto',
        max_tokens: this.maxTokens,
        temperature: this.temperature,
      });

      const response = completion.choices[0]?.message;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      if (response.function_call) {
        return await this.handleFunctionCall(response.function_call, file, conversation_id, user_id, conversation_history);
      }
      
      // If AI responds with text but user is asking about previous context, be more proactive
      if (this.shouldCallListDatabases(userMessage, conversation_history)) {
        return await this.handleFunctionCall({
          name: 'list_databases',
          arguments: '{}'
        }, file, conversation_id, user_id, conversation_history);
      }
      
      return {
        message: response.content,
        action_type: 'chat',
        sql: null,
        results: null,
        database_id: null,
        query_type: 'OTHER'
      };

    } catch (error) {
      console.error('Chat processing error:', error);
      throw error;
    }
  }

  /**
   * Build system prompt for chat with conversation context
   */
  buildChatSystemPrompt(conversation_history = []) {
    let contextInfo = '';
    
    if (conversation_history && conversation_history.length > 0) {
      contextInfo = '\n\nCONVERSATION CONTEXT:\n';
      contextInfo += 'Recent conversation history:\n';
      
      // Get last 5 messages for context
      const recentHistory = conversation_history.slice(-5);
      recentHistory.forEach((entry, index) => {
        contextInfo += `${index + 1}. User: "${entry.prompt}"\n`;
        if (entry.sql) {
          contextInfo += `   SQL: ${entry.sql}\n`;
        }
        if (entry.database_id) {
          contextInfo += `   Database ID: ${entry.database_id}\n`;
        }
        contextInfo += '\n';
      });
      
      // Extract database information from history
      const databasesInConversation = this.extractDatabasesFromHistory(conversation_history);
      if (databasesInConversation.length > 0) {
        contextInfo += 'DATABASES CREATED/REFERENCED IN THIS CONVERSATION:\n';
        databasesInConversation.forEach(db => {
          contextInfo += `- ${db.name} (ID: ${db.database_id})\n`;
        });
        contextInfo += '\n';
      }
    }

    return `You are AskDB, an AI assistant that helps users manage MySQL databases through natural language.

You can help users with:
1. Creating new databases and tables
2. Querying existing data
3. Managing database schemas
4. Processing uploaded database files

Available functions:
- create_database: Create a new MySQL database
- execute_query: Run SQL queries on existing databases
- get_schema: Get database schema information
- list_databases: List all available databases
- create_database_from_file: Create database from uploaded file

Guidelines:
- Always be helpful and conversational
- Explain what you're doing in plain language
- When creating databases, suggest meaningful names and structures
- For queries, always show the SQL and results
- If a user uploads a file, offer to create a database from it
- Be proactive in suggesting next steps
- Use conversation context to make smart decisions about which database to work with
- If the user refers to a database without specifying which one, use the most recently created/referenced database from the conversation
- If multiple databases exist in the conversation, ask for clarification

FUNCTION USAGE RULES:
- Use 'create_database' ONLY when user explicitly wants to create a NEW database
- Use 'execute_query' for ALL other database operations: creating tables, inserting data, selecting data, updating data, etc.
- When user says "create table" or "add table", use 'execute_query' with CREATE TABLE SQL
- When user says "add [data]" or "insert [data]", use 'execute_query' with INSERT SQL
- When user refers to an existing database (like "customers database"), use 'execute_query' with that database

${contextInfo}

Respond naturally and call functions when needed to help the user.`;
  }

  /**
   * Get available functions
   */
  getAvailableFunctions() {
    return [
      {
        name: 'create_database',
        description: 'Create a completely new MySQL database. Only use this when the user explicitly wants to create a NEW database. Do NOT use this for creating tables in existing databases.',
        parameters: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the database to create'
            },
            description: {
              type: 'string',
              description: 'Description of the database'
            },
            tables: {
              type: 'array',
              description: 'Array of table definitions',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  columns: { 
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        name: { type: 'string' },
                        type: { type: 'string' },
                        constraints: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          },
          required: ['name']
        }
      },
      {
        name: 'execute_query',
        description: 'Execute SQL queries on a database. Use this for creating tables, inserting data, selecting data, updating data, or any other SQL operations. This is the primary function for database operations.',
        parameters: {
          type: 'object',
          properties: {
            sql: {
              type: 'string',
              description: 'SQL query to execute (CREATE TABLE, INSERT, SELECT, UPDATE, DELETE, etc.)'
            },
            database_id: {
              type: 'string',
              description: 'ID of the database to query (optional - will use conversation context if not provided)'
            }
          },
          required: ['sql']
        }
      },
      {
        name: 'get_schema',
        description: 'Get schema information for a database',
        parameters: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'ID of the database'
            }
          },
          required: ['database_id']
        }
      },
      {
        name: 'list_databases',
        description: 'List all available databases',
        parameters: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'create_database_from_file',
        description: 'Create a database from an uploaded file',
        parameters: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Name of the uploaded file'
            },
            file_content: {
              type: 'string',
              description: 'Content of the file (if available)'
            }
          },
          required: ['filename']
        }
      }
    ];
  }

  /**
   * Handle function calls
   */
  async handleFunctionCall(functionCall, file, conversation_id, user_id, conversation_history) {
    const { name, arguments: argsString } = functionCall;
    
    let args;
    if (typeof argsString === 'string') {
      try {
        args = JSON.parse(argsString);
      } catch (error) {
        console.error('JSON parse error:', error.message, 'String:', argsString);
        throw new Error(`Invalid JSON in function arguments: ${error.message}`);
      }
    } else if (typeof argsString === 'object' && argsString !== null) {
      args = argsString;
    } else {
      args = {};
    }
    
    try {
      let result;
      let message;

      switch (name) {
        case 'create_database':
          result = await this.executeCreateDatabase(args, user_id, conversation_history);
          message = `✅ Database "${args.name}" created successfully!`;
          break;

        case 'execute_query':
          result = await this.executeQuery(args, user_id, conversation_history);
          message = `📊 Query executed successfully. Found ${result.results?.length || 0} results.`;
          break;

        case 'get_schema':
          result = await this.executeGetSchema(args, user_id, conversation_history);
          message = `📋 Here's the schema for database ${args.database_id}:`;
          break;

        case 'list_databases':
          result = await this.executeListDatabases(user_id);
          message = `📁 Here are all available databases:`;
          break;

        case 'create_database_from_file':
          result = await this.executeCreateDatabaseFromFile(args, file);
          message = `✅ Database created from file "${args.filename}" successfully!`;
          break;

        default:
          throw new Error(`Unknown function: ${name}`);
      }

      return {
        message,
        action_type: name,
        sql: result.sql || null,
        results: result.results || null,
        database_id: result.database_id || null,
        query_type: this.determineQueryType(result.sql)
      };

    } catch (error) {
      console.error(`Function call error (${name}):`, error);
      return {
        message: `❌ Error executing ${name}: ${error.message}`,
        action_type: 'error',
        sql: null,
        results: null,
        database_id: null,
        query_type: 'OTHER'
      };
    }
  }

  /**
   * Execute create_database
   */
  async executeCreateDatabase(args, user_id, conversation_history) {
    const databaseService = require('./databaseService');
    
    // Check if database with same name already exists in conversation
    const existingDatabases = this.extractDatabasesFromHistory(conversation_history);
    const existingDb = existingDatabases.find(db => 
      db.name.toLowerCase() === args.name.toLowerCase()
    );
    
    if (existingDb) {
      throw new Error(`Database "${args.name}" already exists in this conversation. Use database ID: ${existingDb.database_id}`);
    }
    
    // Also check if database exists in user's databases
    const userDatabases = await databaseService.getAllDatabases(user_id);
    const existingUserDb = userDatabases.find(db => 
      db.name.toLowerCase() === args.name.toLowerCase()
    );
    
    if (existingUserDb) {
      throw new Error(`Database "${args.name}" already exists. Use database ID: ${existingUserDb.id}`);
    }
    
    const dbData = {
      name: args.name,
      description: args.description || `Database created via chat: ${args.name}`,
      type: 'mysql',
      user_id: user_id
    };

    const database = await databaseService.createDatabase(dbData);
    
    if (args.tables && args.tables.length > 0) {
      const connectionManager = require('./databaseConnectionManager');
      
      for (const table of args.tables) {
        const createTableSQL = this.generateCreateTableSQL(table);
        await connectionManager.executeQuery(args.name, createTableSQL);
      }
    }

    return {
      database_id: database.id,
      sql: `CREATE DATABASE ${args.name}`,
      results: { database_created: true, database_id: database.id }
    };
  }

  /**
   * Execute query
   */
  async executeQuery(args, user_id, conversation_history) {
    const databaseService = require('./databaseService');
    
    let databaseId = args.database_id;
    
    // If no database_id specified, try to resolve from conversation context
    if (!databaseId) {
      const databasesInConversation = this.extractDatabasesFromHistory(conversation_history);
      
      if (databasesInConversation.length === 1) {
        // Use the only database in conversation
        databaseId = databasesInConversation[0].database_id;
      } else if (databasesInConversation.length > 1) {
        // Multiple databases - ask for clarification
        const dbNames = databasesInConversation.map(db => db.name).join(', ');
        throw new Error(`Multiple databases found in this conversation: ${dbNames}. Please specify which database to use.`);
      } else {
        // No databases in conversation - use default behavior
        const queryService = require('./queryService');
        const results = await queryService.executeQuery(args.sql);
        return {
          sql: args.sql,
          results: results,
          database_id: null
        };
      }
    }
    
    // Resolve database name to ID if needed
    if (!this.isUUID(databaseId)) {
      const databasesInConversation = this.extractDatabasesFromHistory(conversation_history);
      const foundDb = databasesInConversation.find(db => 
        db.name.toLowerCase() === databaseId.toLowerCase()
      );
      
      if (foundDb) {
        databaseId = foundDb.database_id;
      } else {
        // Try to find in all user databases
        const allDatabases = await databaseService.getAllDatabases(user_id);
        const foundDb = allDatabases.find(db => 
          db.name.toLowerCase() === databaseId.toLowerCase()
        );
        
        if (foundDb) {
          databaseId = foundDb.id;
        } else {
          throw new Error(`Database "${databaseId}" not found. Available databases: ${allDatabases.map(db => db.name).join(', ')}`);
        }
      }
    }
    
    const results = await databaseService.executeQuery(databaseId, args.sql, [], user_id);
    return {
      sql: args.sql,
      results: results,
      database_id: databaseId
    };
  }

  /**
   * Execute get_schema
   */
  async executeGetSchema(args, user_id, conversation_history) {
    const databaseService = require('./databaseService');
    
    let databaseId = args.database_id;
    
    // If no database_id specified, try to resolve from conversation context
    if (!databaseId) {
      const databasesInConversation = this.extractDatabasesFromHistory(conversation_history);
      
      if (databasesInConversation.length === 1) {
        // Use the only database in conversation
        databaseId = databasesInConversation[0].database_id;
      } else if (databasesInConversation.length > 1) {
        // Multiple databases - ask for clarification
        const dbNames = databasesInConversation.map(db => db.name).join(', ');
        throw new Error(`Multiple databases found in this conversation: ${dbNames}. Please specify which database to get the schema for.`);
      } else {
        throw new Error('No database specified and no databases found in this conversation. Please specify which database to get the schema for.');
      }
    }
    
    // If database_id looks like a name (not a UUID), find the database by name
    if (!this.isUUID(databaseId)) {
      // First check conversation context
      const databasesInConversation = this.extractDatabasesFromHistory(conversation_history);
      const foundDb = databasesInConversation.find(db => 
        db.name.toLowerCase() === databaseId.toLowerCase()
      );
      
      if (foundDb) {
        databaseId = foundDb.database_id;
      } else {
        // Try to find in all user databases
        const databases = await databaseService.getAllDatabases(user_id);
        const database = databases.find(db => db.name === databaseId);
        if (!database) {
          throw new Error(`Database "${databaseId}" not found`);
        }
        databaseId = database.id;
      }
    }
    
    const schema = await databaseService.getDatabaseSchema(databaseId, user_id);
    
    return {
      results: schema,
      database_id: databaseId
    };
  }

  /**
   * Execute list_databases
   */
  async executeListDatabases(user_id) {
    const databaseService = require('./databaseService');
    const databases = await databaseService.getAllDatabases(user_id);
    
    return {
      results: databases,
      database_id: databases.length === 1 ? databases[0].id : null
    };
  }

  /**
   * Execute create_database_from_file
   */
  async executeCreateDatabaseFromFile(args, file) {
    const databaseService = require('./databaseService');
    
    const filename = args.filename || file?.originalname || 'uploaded_database';
    const dbData = {
      name: filename.replace(/\.[^/.]+$/, ""),
      description: `Database created from file: ${filename}`,
      type: 'mysql'
    };

    const database = await databaseService.createDatabase(dbData);
    
    if (file && file.buffer) {
      const connectionManager = require('./databaseConnectionManager');
      await connectionManager.importSQLFile(dbData.name, file.buffer.toString());
    }

    return {
      database_id: database.id,
      sql: `CREATE DATABASE FROM FILE: ${args.filename}`,
      results: { database_created: true, database_id: database.id }
    };
  }

  /**
   * Generate CREATE TABLE SQL
   */
  generateCreateTableSQL(table) {
    const columns = table.columns.map(col => 
      `${col.name} ${col.type}${col.primary ? ' PRIMARY KEY' : ''}${col.nullable === false ? ' NOT NULL' : ''}`
    ).join(', ');
    
    return `CREATE TABLE ${table.name} (${columns})`;
  }

  /**
   * Determine query type
   */
  determineQueryType(sql) {
    if (!sql) return 'OTHER';
    
    const upperSQL = sql.toUpperCase().trim();
    if (upperSQL.startsWith('SELECT')) return 'SELECT';
    if (upperSQL.startsWith('INSERT')) return 'INSERT';
    if (upperSQL.startsWith('UPDATE')) return 'UPDATE';
    if (upperSQL.startsWith('DELETE')) return 'DELETE';
    if (upperSQL.startsWith('CREATE')) return 'CREATE';
    if (upperSQL.startsWith('DROP')) return 'DROP';
    if (upperSQL.startsWith('ALTER')) return 'ALTER';
    return 'OTHER';
  }

  /**
   * Check if a string is a valid UUID
   */
  isUUID(str) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  }

  /**
   * Check if we should call list_databases when user asks about previous context
   */
  shouldCallListDatabases(userMessage, conversation_history) {
    const message = userMessage.toLowerCase();
    
    // Only trigger for questions about previous context when no useful history exists
    const askingAboutPrevious = (message.includes('previous') || 
                                message.includes('before') || 
                                message.includes('earlier') ||
                                message.includes('see my') ||
                                message.includes('specified')) &&
                               (message.includes('database') || message.includes('table') || message.includes('message'));
    
    const hasUsefulHistory = conversation_history.some(entry => 
      entry.sql_query && entry.sql_query.trim() !== '' && entry.database_id
    );
    
    return askingAboutPrevious && !hasUsefulHistory;
  }

  /**
   * Extract database information from conversation history
   */
  extractDatabasesFromHistory(conversation_history) {
    const databases = new Map();
    
    conversation_history.forEach(entry => {
      if (entry.database_id && entry.sql) {
        // Extract database name from SQL or prompt
        let dbName = 'Unknown Database';
        
        // Try to extract from SQL
        if (entry.sql.includes('CREATE DATABASE')) {
          const match = entry.sql.match(/CREATE DATABASE\s+([^\s;]+)/i);
          if (match) {
            dbName = match[1].replace(/`/g, '');
          }
        }
        
        // Try to extract from prompt
        if (entry.prompt && entry.prompt.toLowerCase().includes('database')) {
          const match = entry.prompt.match(/database\s+(?:called\s+)?([^\s,]+)/i);
          if (match) {
            dbName = match[1];
          }
        }
        
        databases.set(entry.database_id, {
          database_id: entry.database_id,
          name: dbName,
          last_referenced: entry.created_at
        });
      }
    });
    
    return Array.from(databases.values()).sort((a, b) => 
      new Date(b.last_referenced) - new Date(a.last_referenced)
    );
  }
}

module.exports = new AIService();
