Dell – Tsofen Data Exploration Interface
Overview
This project implements a conversational interface for exploring and analysing tabular data. Instead of writing SQL or depending on a database administrator, users can ask questions in plain language and get answers immediately. The system translates natural‑language prompts into safe SQL, runs them against a local database and presents the results in a friendly table. It can ingest raw data (e.g. CSV or JSON) or connect to an existing database, allowing the same interface to be reused across multiple Dell products.
Key goals of the project include:
Speed – reduce the wait time for data insights by eliminating the need for SQL experts.
Usability – enable natural‑language interaction and provide helpful guidance, examples and clear error messages.
Safety – ensure all generated SQL statements are validated against the database schema and do not perform destructive operations.
Extensibility – support optional features such as auto‑suggestions, SQL explanations and chat‑style follow‑ups.
Features
Convert plain‑language questions into SQL using a GPT‑based model and database schema awareness.
Validate generated SQL for syntax and safety before execution.
Support uploading data files or selecting existing databases.
Display results in a tabular format with options to export to CSV or JSON.
Maintain a history of past prompts and queries.
Offer examples and tooltips to guide users.
Optional enhancements such as live auto‑suggestions, SQL explanations and chat‑style interaction.
Prerequisites
Node.js 16+ and npm – The backend is built with Express and the frontend uses React. Ensure Node.js and the Node package manager (npm) are installed.
MySQL Server – A running MySQL instance to store imported data and execute queries. Create a database and a user with the necessary privileges.
OpenAI API key – The system relies on the OpenAI API for natural‑language processing. Set an environment variable OPENAI_API_KEY with your API key.
Installation
Clone the repository:
git clone https://github.com/your‑organisation/dell‑tsofen‑nl‑sql.git
cd dell‑tsofen‑nl‑sql
Configure environment variables:
Create a file named .env in the project root and define your MySQL and OpenAI credentials:
OPENAI_API_KEY=your-openai-api-key
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=your_database
MYSQL_USER=your_user
MYSQL_PASSWORD=your_password
Install backend dependencies:
cd server
npm install
Install frontend dependencies:
cd ../client
npm install
Build the frontend:
npm run build
Start the backend:
cd ../server
npm start
The API will be available at http://localhost:8000/ by default.
Serve the frontend: You can serve the built React application using any static file server. During development, you may run npm start inside the client directory to start a development server at http://localhost:3000/.
Usage
Prepare your data – Import your CSV or JSON data into the MySQL database configured above, or point the application to an existing database. The server component exposes endpoints to upload data and create tables automatically.
Start both services – In separate terminals, run npm start in the server directory (to start the Express API) and npm start in the client directory (to start the React development server). Make sure the .env file is configured correctly.
Interact via the web UI – Open http://localhost:3000/ in your browser. You can upload data, ask questions in natural language, view/edit the generated SQL, run queries and export results. Errors and history will be displayed in the interface.
Project structure
server/ – The Express backend. Contains route definitions (routes/), business logic (controllers/), database models (models/) and entry point (server.js).
client/ – The React frontend. Contains components, pages, state management and assets.
.env – Environment variables for database and API credentials.
README.md – This document.
Contributing
Contributions are welcome! Please open issues or pull requests on GitHub. When contributing code, ensure it is well‑documented and accompanied by relevant tests.
License
This project is released under the MIT License. See LICENSE for details.
