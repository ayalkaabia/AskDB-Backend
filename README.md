# AskDB - Natural Language to SQL Query System

AskDB is a powerful natural language to SQL query system that allows users to interact with databases using plain English. The system uses AI to convert natural language prompts into SQL queries and execute them against your database.

## 🚀 Features

### Core Functionality
- **Natural Language to SQL**: Convert plain English to SQL queries using AI
- **Multiple Database Support**: Support for MySQL, PostgreSQL, and Oracle
- **Query Execution**: Execute both AI-generated and raw SQL queries
- **Result Export**: Export results in CSV or JSON format

### Chat System (NEW!)
- **User-Specific Conversations**: Each user has isolated chat sessions
- **Auto-Generated Titles**: Conversation titles generated from first message
- **Conversation Management**: Create, update, delete, and list conversations
- **Message History**: Complete conversation history with timestamps
- **File Upload Support**: Upload database files through chat interface

### Enhanced History System
- **Query History**: Track all queries with timestamps and results
- **User-specific History**: View history by specific user
- **Search History**: Search through history by keywords
- **History Management**: Update, delete, and manage history entries
- **Advanced Statistics**: Get comprehensive usage statistics

### User Management System
- **User Registration**: Secure user registration with email verification
- **Authentication**: JWT-based authentication system
- **Role-based Access**: Admin, moderator, and user roles
- **User Profiles**: Manage user information and preferences
- **Password Security**: Secure password hashing with bcrypt

### Database Management
- **Multiple Databases**: Manage multiple database connections
- **Database Upload**: Upload SQL and database files
- **Schema Extraction**: Extract and view database schemas
- **Backup System**: Create and manage database backups
- **Database Statistics**: Monitor database usage and performance

### Permission System
- **Granular Permissions**: Fine-grained permission control
- **Resource-based Access**: Control access to databases, queries, and users
- **Permission Assignment**: Assign and revoke user permissions
- **Permission Templates**: Predefined permission sets for common roles

## 🏗️ Architecture

The system follows a clean, layered architecture:

```
┌─────────────────┐
│   Controllers   │  ← Request handling and validation
├─────────────────┤
│    Services     │  ← Business logic and orchestration
├─────────────────┤
│   Repositories  │  ← Data access and persistence
├─────────────────┤
│   Database      │  ← MySQL database storage
└─────────────────┘
```

## 📁 Project Structure

```
AskDB/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── chatController.js
│   │   ├── conversationController.js
│   │   ├── databaseController.js
│   │   ├── historyController.js
│   │   ├── queryController.js
│   │   └── userController.js
│   ├── services/            # Business logic
│   │   ├── aiService.js
│   │   ├── conversationService.js
│   │   ├── databaseService.js
│   │   ├── historyService.js
│   │   └── userService.js
│   ├── repos/              # Data access
│   │   ├── conversationRepo.js
│   │   ├── databaseRepo.js
│   │   ├── historyRepo.js
│   │   └── userRepo.js
│   ├── router/             # Route definitions
│   │   └── AskRouter.js
│   ├── middleware/         # Request processing
│   │   ├── auth.js
│   │   ├── validation.js
│   │   └── upload.js
│   └── utils/             # Utilities
│       └── database.js
├── docs/                  # Documentation
├── uploads/              # File uploads directory
├── database_schema.sql   # Complete database schema
├── simple_seed.js        # Database setup script
├── server.js            # Main server file
└── package.json         # Dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/askdb.git
   cd askdb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   npm run seed
   ```

5. **Start the server**
   ```bash
   npm start
   ```
   
   Edit `.env` file:
   ```env
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=askdb
   OPENAI_API_KEY=your_openai_api_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Set up database**
   ```bash
   mysql -u your_username -p your_database < database_schema.sql
   ```

5. **Start the server**
   ```bash
   npm start
   ```

## 📚 API Endpoints


### Database Management
- `POST /upload-db` - Upload database file
- `GET /databases` - List all databases
- `POST /databases` - Create new database
- `GET /databases/:id` - Get database details
- `GET /databases/:id/schema` - Get database schema
- `DELETE /databases/:id` - Delete database
- `POST /databases/:id/backup` - Create backup

### Query Operations
- `POST /query` - Submit natural language query
- `POST /run-sql` - Execute raw SQL
- `GET /schema` - Get current schema
- `GET /test-ai` - Test AI connection

### History Management
- `GET /history` - Get query history
- `GET /history/:id` - Get specific history item
- `GET /history/user/:userId` - Get user history
- `GET /history/search` - Search history
- `DELETE /history/:id` - Delete history item
- `PUT /history/:id` - Update history item
- `GET /history/stats` - Get history statistics


### Export
- `GET /export` - Export query results

## 🔐 Security Features

- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API abuse prevention
- **SQL Injection Protection**: Parameterized queries

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Test database connection:
```bash
npm run test-db
```

Interactive testing:
```bash
npm run interactive
```

## 📊 Database Schema

The system uses the following main tables:
- `databases` - Database connections and files
- `database_backups` - Database backup records
- `query_history` - Query execution history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [API_DOCS.md](API_DOCS.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Setup Guide**: [SETUP.md](SETUP.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/askdb/issues)

## 🔮 Roadmap

- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] Machine learning query optimization
- [ ] Multi-language support
- [ ] Cloud deployment automation
- [ ] Advanced backup and recovery
- [ ] Performance monitoring
- [ ] API versioning
- [ ] Webhook support
- [ ] GraphQL API

## 🙏 Acknowledgments

- OpenAI for providing the AI capabilities
- Express.js community for the web framework
- MySQL community for the database system
- All contributors and users of AskDB
