# AskDB API Setup Instructions

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- MySQL Server (v8.0 or higher)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up MySQL database:
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE askdb;"

# Create user (optional)
mysql -u root -p -e "CREATE USER 'askdb_user'@'localhost' IDENTIFIED BY 'your_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON askdb.* TO 'askdb_user'@'localhost';"
mysql -u root -p -e "FLUSH PRIVILEGES;"
```

3. Create environment file:
```bash
# Copy the example environment file
cp .env.example .env
```

4. Update .env file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=askdb_user
DB_PASSWORD=your_password
DB_NAME=askdb
DB_PORT=3306
```

5. Create necessary directories:
```bash
mkdir uploads
mkdir data
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Available Endpoints

1. **POST /upload-db** - Upload a SQLite database file
2. **POST /query** - Submit natural language query
3. **POST /run-sql** - Execute raw SQL query
4. **GET /history** - Get query history
5. **GET /export** - Export query results

### Health Check
```
GET http://localhost:3000/health
```

## Testing the API

### 1. Upload a Database
```bash
curl -X POST http://localhost:3000/api/upload-db \
  -F "file=@your_database.db"
```

### 2. Submit a Natural Language Query
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Get top 5 selling products this year"}'
```

### 3. Run Raw SQL
```bash
curl -X POST http://localhost:3000/api/run-sql \
  -H "Content-Type: application/json" \
  -d '{"sql": "SELECT * FROM customers LIMIT 5;"}'
```

### 4. Get History
```bash
curl http://localhost:3000/api/history
```

### 5. Export Results
```bash
curl "http://localhost:3000/api/export?format=csv&query_id=YOUR_QUERY_ID"
```

## Notes

- The current implementation uses MySQL for persistent storage
- Natural language to SQL conversion is basic - in production, use AI/ML models
- File uploads are limited to 50MB
- Rate limiting is set to 100 requests per 15 minutes
- Only SELECT queries are allowed for security
- Follows repository pattern for clean separation of concerns

## Production Considerations

1. Use a proper database (PostgreSQL, MySQL) instead of in-memory storage
2. Implement proper authentication and authorization
3. Use a production-grade NLP service for natural language to SQL conversion
4. Add comprehensive logging and monitoring
5. Implement proper error handling and validation
6. Use HTTPS in production
7. Add API documentation (Swagger/OpenAPI)
