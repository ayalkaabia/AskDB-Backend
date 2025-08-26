# API Documentation

## Table of Contents
- [Base URL](#base-url)
- [POST /upload-db](#post-upload-db)
- [POST /query](#post-query)
- [POST /run-sql](#post-run-sql)
- [GET /history](#get-history)
- [GET /export](#get-export)
- [Authentication (Optional / Future Scope)](#authentication-optional--future-scope)

---

## Base URL
```
TBD

```

---

### **POST /upload-db**
- **Description:** Upload a `.db` file to initialize the system.  
- **Request:**  
  - **Headers:**  
    `Content-Type: multipart/form-data`  
  - **Body:**  
    ```form-data
    {
      "file": "<your_database_file.db>"
    }
    ```  
- **Response (200):**  
  ```json
  {
    "message": "Database uploaded successfully",
    "db_name": "my_database.db"
  }
  ```  
- **Errors:**  
  - `400 Bad Request` → Invalid file type  
  - `500 Internal Server Error` → Upload failed  

---

### **POST /query**
- **Description:** Submit a natural language prompt and get generated SQL + results.  
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
      {"name": "Laptop X", "total_sales": 4500},
      {"name": "Monitor Y", "total_sales": 3200}
    ]
  }
  ```  
- **Errors:**  
  - `400 Bad Request` → Cannot convert prompt to SQL  
  - `500 Internal Server Error` → Query execution failed  

---

### **POST /run-sql**
- **Description:** Run a raw SQL query (optional, advanced users).  
- **Request:**  
  ```json
  {
    "sql": "SELECT * FROM customers LIMIT 5;"
  }
  ```  
- **Response (200):**  
  ```json
  {
    "results": [
      {"id": 1, "name": "John", "city": "New York"},
      {"id": 2, "name": "Mary", "city": "Boston"}
    ]
  }
  ```  

---

### **GET /history**
- **Description:** Retrieve past prompts and queries.  
- **Response (200):**  
  ```json
  [
    {
      "id": 1,
      "prompt": "List all customers",
      "sql": "SELECT * FROM customers;",
      "timestamp": "2025-08-25T17:30:00Z"
    }
  ]
  ```  

---

### **GET /export**
- **Description:** Export query results.  
- **Query Params:**  
  - `format=csv` or `format=json`  
- **Response (200, CSV example):**  
  ```
  id,name,city
  1,John,New York
  2,Mary,Boston
  ```  

---

## Authentication (Optional / Future Scope)
For now, the API can be **open** (local use). In production:  
- Add **API key authentication** (`Authorization: Bearer <token>`).  
- Support role-based access (admin vs user).
