const queryRepo = require('../repos/queryRepo');
const databaseRepo = require('../repos/databaseRepo');

class SchemaService {
  /**
   * Get complete database schema for AI context
   */
  async getCompleteSchema() {
    try {
      const currentDb = await databaseRepo.getCurrentDatabase();
      if (!currentDb) {
        throw new Error('No active database found');
      }

      const tables = await queryRepo.getTableNames();
      const schema = {
        database_name: currentDb.name,
        tables: []
      };

      for (const tableName of tables) {
        const tableSchema = await this.getTableSchema(tableName);
        const sampleData = await this.getSampleData(tableName);
        const relationships = await this.getTableRelationships(tableName);

        schema.tables.push({
          name: tableName,
          columns: tableSchema,
          relationships: relationships,
          sample_data: sampleData
        });
      }

      return schema;
    } catch (error) {
      console.error('Error fetching complete schema:', error);
      throw error;
    }
  }

  /**
   * Get detailed table schema
   */
  async getTableSchema(tableName) {
    try {
      const columns = await queryRepo.getTableSchema(tableName);
      return columns.map(col => ({
        name: col.Field,
        type: col.Type,
        null: col.Null,
        key: col.Key,
        default: col.Default,
        extra: col.Extra
      }));
    } catch (error) {
      console.error(`Error fetching schema for table ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Get sample data from table (first 3 rows)
   */
  async getSampleData(tableName) {
    try {
      const sampleQuery = `SELECT * FROM \`${tableName}\` LIMIT 3`;
      const data = await queryRepo.executeQuery(sampleQuery);
      return data;
    } catch (error) {
      console.error(`Error fetching sample data for table ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Get table relationships (foreign keys)
   */
  async getTableRelationships(tableName) {
    try {
      const query = `
        SELECT 
          COLUMN_NAME,
          REFERENCED_TABLE_NAME,
          REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
        WHERE TABLE_NAME = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
      `;
      
      const relationships = await queryRepo.executeQuery(query, [tableName]);
      return relationships.map(rel => ({
        column: rel.COLUMN_NAME,
        references_table: rel.REFERENCED_TABLE_NAME,
        references_column: rel.REFERENCED_COLUMN_NAME
      }));
    } catch (error) {
      console.error(`Error fetching relationships for table ${tableName}:`, error);
      return [];
    }
  }

  /**
   * Format schema for AI prompt
   */
  formatSchemaForAI(schema) {
    let prompt = `Database Schema for: ${schema.database_name}\n\n`;
    
    schema.tables.forEach(table => {
      prompt += `Table: ${table.name}\n`;
      
      // Add columns
      table.columns.forEach(col => {
        let colDesc = `- ${col.name} (${col.type})`;
        if (col.key === 'PRI') colDesc += ' [PRIMARY KEY]';
        if (col.key === 'MUL') colDesc += ' [INDEX]';
        if (col.null === 'NO') colDesc += ' [NOT NULL]';
        if (col.extra) colDesc += ` [${col.extra}]`;
        prompt += colDesc + '\n';
      });

      // Add relationships
      if (table.relationships.length > 0) {
        prompt += 'Relationships:\n';
        table.relationships.forEach(rel => {
          prompt += `- ${rel.column} -> ${rel.references_table}.${rel.references_column}\n`;
        });
      }

      // Add sample data
      if (table.sample_data.length > 0) {
        prompt += 'Sample data:\n';
        table.sample_data.forEach(row => {
          prompt += `  ${JSON.stringify(row)}\n`;
        });
      }
      
      prompt += '\n';
    });

    return prompt;
  }

  /**
   * Get current database info
   */
  async getCurrentDatabaseInfo() {
    return await databaseRepo.getCurrentDatabase();
  }
}

module.exports = new SchemaService();
