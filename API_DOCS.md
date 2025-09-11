# API Documentation

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Chat System](#chat-system)
- [Database Management](#database-management)
- [Query Operations](#query-operations)
- [History Management](#history-management)
- [User Management](#user-management)
- [Permission Management](#permission-management)
- [Export Operations](#export-operations)

---

## Base URL
```
TBD
```

---

## Chat System

The chat system allows users to have multiple conversations with the AI, where each conversation is isolated to the specific user. All chat endpoints require authentication.

### **POST /chat**
- **Description:** Send a message to the AI or create a new conversation
- **Authentication:** Required
- **Request:**
  ```json
  {
    "message": "Show me all users in the database",
    "conversation_id": "optional-conversation-id"
  }
  ```
- **File Upload:** You can also upload files using `multipart/form-data` (field: `file`, formats: `.db`, `.sql`)
- **Response (200):**
  ```json
  {
    "conversation_id": "uuid-of-conversation",
    "message": "AI response message",
    "data": {
      "sql": "SELECT * FROM users",
      "results": [...],
      "database_id": "database-id",
      "action_type": "chat"
    },
    "success": true,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

### **GET /chat/history/:conversation_id**
- **Description:** Get message history for a specific conversation
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "conversation_id": "uuid-of-conversation",
    "messages": [
      {
        "id": "message-id",
        "user_id": "user-id",
        "conversation_id": "conversation-id",
        "prompt": "User message",
        "sql_query": "SELECT * FROM users",
        "results": [...],
        "query_type": "SELECT",
        "timestamp": "2024-01-01T12:00:00.000Z"
      }
    ],
    "success": true
  }
  ```

### **GET /chat/conversations**
- **Description:** List all conversations for the authenticated user
- **Authentication:** Required
- **Query Params:** `limit` (default: 50), `offset` (default: 0)
- **Response (200):**
  ```json
  {
    "conversations": [
      {
        "id": "conversation-id",
        "user_id": "user-id",
        "title": "Database Analysis",
        "last_message_at": "2024-01-01T12:00:00.000Z",
        "created_at": "2024-01-01T10:00:00.000Z",
        "updated_at": "2024-01-01T12:00:00.000Z"
      }
    ],
    "success": true
  }
  ```

### **POST /conversations**
- **Description:** Create a new empty conversation
- **Authentication:** Required
- **Request:**
  ```json
  {
    "title": "Optional conversation title"
  }
  ```
- **Response (201):**
  ```json
  {
    "conversation": {
      "id": "conversation-id",
      "user_id": "user-id",
      "title": "New Chat",
      "created_at": "2024-01-01T12:00:00.000Z",
      "last_message_at": "2024-01-01T12:00:00.000Z"
    },
    "success": true
  }
  ```

### **GET /conversations**
- **Description:** Get user's conversations (same as `/chat/conversations`)
- **Authentication:** Required

### **GET /conversations/:id**
- **Description:** Get specific conversation details
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "conversation": {
      "id": "conversation-id",
      "user_id": "user-id",
      "title": "Database Analysis",
      "last_message_at": "2024-01-01T12:00:00.000Z",
      "created_at": "2024-01-01T10:00:00.000Z",
      "updated_at": "2024-01-01T12:00:00.000Z"
    },
    "success": true
  }
  ```

### **PUT /conversations/:id**
- **Description:** Update conversation title
- **Authentication:** Required
- **Request:**
  ```json
  {
    "title": "New conversation title"
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Conversation title updated successfully"
  }
  ```

### **DELETE /conversations/:id**
- **Description:** Delete a conversation and all its messages
- **Authentication:** Required
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Conversation deleted successfully"
  }
  ```

**Chat System Features:**
- User-specific conversations (each user sees only their own chats)
- Auto-generated titles from first message (50 character limit)
- Conversation limits: 50 conversations per user, 1000 messages per conversation
- File upload support maintained
- All operations are user-scoped and secure

---

## Database Management

### **POST /upload-db**
- **Description:** Upload a database file (.sql or .db)
- **Request:**  
  - **Headers:** `Content-Type: multipart/form-data`
  - **Body:** `{ "file": "<database_file>" }`
- **Response (200):**
  ```json
  {
    "message": "Database uploaded successfully",
    "db_name": "my_database.db",
    "db_id": "uuid",
    "file_size": 1024000,
    "upload_time": "2025-01-01T00:00:00Z"
  }
  ```

### **GET /databases**
- **Description:** Get all databases with pagination
- **Query Params:** `limit`, `offset`, `status`
- **Response (200):**
  ```json
  [
    {
      "id": "uuid",
      "name": "my_database.db",
      "description": "Sample database",
      "type": "sqlite",
      "status": "active",
      "file_size": 1024000,
      "uploaded_at": "2025-01-01T00:00:00Z"
    }
  ]
  ```

### **POST /databases**
- **Description:** Create a new database connection
- **Request:**
  ```json
  {
    "name": "production_db",
    "description": "Production database",
    "type": "mysql",
    "connection_string": "mysql://user:pass@host:3306/db"
  }
  ```

### **GET /databases/:id**
- **Description:** Get specific database by ID
- **Response (200):** Database object

### **GET /databases/:id/schema**
- **Description:** Get database schema
- **Response (200):**
  ```json
  {
    "database_id": "uuid",
    "database_name": "my_db",
    "tables": [
      {
        "name": "users",
        "columns": [
          {"name": "id", "type": "INTEGER", "primary_key": true}
        ]
      }
    ]
  }
  ```

### **DELETE /databases/:id**
- **Description:** Delete specific database
- **Response (200):**
  ```json
  {
    "message": "Database deleted successfully",
    "id": "uuid"
  }
  ```

### **POST /databases/:id/backup**
- **Description:** Create backup of specific database
- **Request:**
  ```json
  {
    "backup_name": "daily_backup",
    "description": "Daily backup"
  }
  ```

### **GET /databases/stats**
- **Description:** Get database statistics
- **Response (200):**
  ```json
  {
    "total_databases": 5,
    "active_databases": 3,
    "total_size": 5120000,
    "average_size": 1024000
  }
  ```

---

## Query Operations

### **POST /query**
- **Description:** Submit natural language prompt
- **Request:**
  ```json
  {
    "prompt": "Get top 5 selling products this year"
  }
  ```
- **Response (200):**
  ```json
  {
    "sql": "SELECT name, SUM(sales) FROM products WHERE year=2025 GROUP BY name ORDER BY SUM(sales) DESC LIMIT 5;",
    "results": [
      {"name": "Laptop X", "total_sales": 4500}
    ]
  }
  ```

### **POST /run-sql**
- **Description:** Execute raw SQL query
- **Request:**
  ```json
  {
    "sql": "SELECT * FROM customers LIMIT 5;"
  }
  ```

### **GET /schema**
- **Description:** Get current database schema

### **GET /test-ai**
- **Description:** Test AI connection

---

## History Management

### **GET /history**
- **Description:** Get query history with pagination
- **Query Params:** `limit`, `offset`
- **Response (200):**
  ```json
  [
    {
      "id": "uuid",
      "user_id": "user_uuid",
      "prompt": "List all customers",
      "sql_query": "SELECT * FROM customers;",
      "result_count": 150,
      "timestamp": "2025-01-01T00:00:00Z"
    }
  ]
  ```

### **GET /history/:id**
- **Description:** Get specific history item by ID
- **Response (200):** History item object

### **GET /history/user/:userId**
- **Description:** Get history by specific user
- **Query Params:** `limit`, `offset`
- **Response (200):** Array of history items

### **GET /history/search**
- **Description:** Search history by keyword
- **Query Params:** `q`, `limit`, `offset`
- **Response (200):** Array of matching history items

### **DELETE /history/:id**
- **Description:** Delete specific history item
- **Response (200):**
  ```json
  {
    "message": "History item deleted successfully",
    "id": "uuid"
  }
  ```

### **PUT /history/:id**
- **Description:** Update specific history item
- **Request:**
  ```json
  {
    "prompt": "Updated prompt",
    "result_count": 200
  }
  ```

### **GET /history/stats**
- **Description:** Get history statistics
- **Response (200):**
  ```json
  {
    "total_queries": 1000,
    "total_results": 50000,
    "average_results_per_query": 50,
    "unique_users": 25
  }
  ```

---



## Export Operations

### **GET /export**
- **Description:** Export query results
- **Query Params:** `format=csv` or `format=json`
- **Response (200):** CSV or JSON data

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Human readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse. Limits are applied per IP address.

---

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

Public endpoints (no authentication required):
- `POST /auth/register`
- `POST /auth/login`
- `GET /` (API info)
