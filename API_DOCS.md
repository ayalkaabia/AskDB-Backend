# API Documentation

## Table of Contents
- [Base URL](#base-url)
- [Authentication](#authentication)
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

## Authentication

### **POST /auth/register**
- **Description:** Register a new user
- **Request:**
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
  ```
- **Response (201):**
  ```json
  {
    "message": "User registered successfully",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
  ```

### **POST /auth/login**
- **Description:** Authenticate user and get JWT token
- **Request:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```
- **Response (200):**
  ```json
  {
    "message": "Login successful",
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
  ```

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

## User Management

### **GET /users**
- **Description:** Get all users with pagination
- **Query Params:** `limit`, `offset`, `role`
- **Response (200):** Array of user objects (passwords excluded)

### **GET /users/:id**
- **Description:** Get specific user by ID
- **Response (200):** User object (password excluded)

### **PUT /users/:id**
- **Description:** Update specific user
- **Request:**
  ```json
  {
    "firstName": "John",
    "lastName": "Smith",
    "role": "moderator"
  }
  ```

### **DELETE /users/:id**
- **Description:** Delete specific user
- **Response (200):**
  ```json
  {
    "message": "User deleted successfully",
    "id": "uuid"
  }
  ```

---

## Permission Management

### **GET /permissions**
- **Description:** Get all permissions with pagination
- **Query Params:** `limit`, `offset`, `resource_type`
- **Response (200):** Array of permission objects

### **POST /permissions**
- **Description:** Create new permission
- **Request:**
  ```json
  {
    "name": "database_backup",
    "description": "Create database backups",
    "resource_type": "database",
    "action": "create"
  }
  ```

### **GET /permissions/:id**
- **Description:** Get specific permission by ID
- **Response (200):** Permission object

### **PUT /permissions/:id**
- **Description:** Update specific permission
- **Request:**
  ```json
  {
    "description": "Updated description",
    "is_active": false
  }
  ```

### **DELETE /permissions/:id**
- **Description:** Delete specific permission
- **Response (200):**
  ```json
  {
    "message": "Permission deleted successfully",
    "id": "uuid"
  }
  ```

### **GET /users/:userId/permissions**
- **Description:** Get permissions for specific user
- **Response (200):** Array of permission objects

### **POST /users/permissions**
- **Description:** Assign permission to user
- **Request:**
  ```json
  {
    "userId": "user_uuid",
    "permissionId": "permission_uuid"
  }
  ```

### **DELETE /users/:userId/permissions/:permissionId**
- **Description:** Remove permission from user
- **Response (200):**
  ```json
  {
    "message": "Permission removed successfully",
    "user_id": "user_uuid",
    "permission_id": "permission_uuid"
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
