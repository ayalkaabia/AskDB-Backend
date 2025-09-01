const OpenAI = require('openai');
const schemaService = require('./schemaService');
require('dotenv').config();


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
1. Only generate SELECT queries - no INSERT, UPDATE, DELETE, DROP, or other destructive operations
2. Use proper MySQL syntax with backticks for table and column names
3. Always include LIMIT clauses for large result sets (default LIMIT 100)
4. Use appropriate JOINs when querying related tables
5. Include proper WHERE clauses for filtering
6. Use aggregate functions (COUNT, SUM, AVG, etc.) when appropriate
7. Order results logically (ORDER BY) when relevant
8. Handle NULL values appropriately
9. Use proper date/time functions for date comparisons
10. Return only the SQL query, no explanations or markdown formatting

The user will provide a database schema and a natural language query. Generate the most appropriate SQL query based on the schema provided.`;
  }

  /**
   * Build user prompt with schema and query
   */
  buildUserPrompt(schemaPrompt, naturalLanguageQuery) {
    return `${schemaPrompt}

User Query: "${naturalLanguageQuery}"

Generate a MySQL SELECT query that answers this question. Return only the SQL query, no explanations.`;
  }

  /**
   * Extract SQL from OpenAI response
   */
  extractSQLFromResponse(response) {
    // Remove markdown code blocks if present
    let sql = response.replace(/```sql\s*/gi, '').replace(/```\s*$/gi, '');
    
    // Remove any leading/trailing whitespace
    sql = sql.trim();
    
    // Ensure it starts with SELECT
    if (!sql.toUpperCase().startsWith('SELECT')) {
      throw new Error('Generated query does not start with SELECT');
    }
    
    return sql;
  }

  /**
   * Validate generated SQL for safety
   */
  validateGeneratedSQL(sqlQuery) {
    const upperSQL = sqlQuery.toUpperCase();
    
    // Check for forbidden operations
    const forbiddenKeywords = [
      'INSERT', 'UPDATE', 'DELETE', 'DROP', 'TRUNCATE', 'ALTER', 
      'CREATE', 'GRANT', 'REVOKE', 'EXECUTE', 'EXEC'
    ];
    
    for (const keyword of forbiddenKeywords) {
      if (upperSQL.includes(keyword)) {
        return {
          isValid: false,
          error: `Forbidden operation detected: ${keyword}`
        };
      }
    }
    
    // Ensure it's a SELECT query
    if (!upperSQL.startsWith('SELECT')) {
      return {
        isValid: false,
        error: 'Query must start with SELECT'
      };
    }
    
    // Check for potential SQL injection patterns
    const suspiciousPatterns = [
      'UNION SELECT',
      'INTO OUTFILE',
      'INTO DUMPFILE',
      'LOAD_FILE',
      'BENCHMARK',
      'SLEEP'
    ];
    
    for (const pattern of suspiciousPatterns) {
      if (upperSQL.includes(pattern)) {
        return {
          isValid: false,
          error: `Suspicious pattern detected: ${pattern}`
        };
      }
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
      return completion.choices[0]?.message?.content ? true : false;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
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
}

module.exports = new AIService();
