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
Python 3.8+ – The reference implementation uses Python. Ensure Python 3.8 or later is installed.
OpenAI API key – The system relies on the OpenAI API for natural‑language processing. Set an environment variable OPENAI_API_KEY with your API key.
pip – Python package installer to install dependencies.
Installation
Clone the repository:
git clone https://github.com/your‑organisation/dell‑tsofen‑nl‑sql.git
cd dell‑tsofen‑nl‑sql
Create and activate a virtual environment (optional but recommended):
python3 -m venv venv
source venv/bin/activate
Install required packages:
pip install -r requirements.txt
Export your OpenAI API key (replace your-key accordingly):
export OPENAI_API_KEY=your-key
Usage
Prepare your data – Place your CSV or JSON file in the data/ directory, or identify an existing SQLite database you want to query.
Run the application:
python main.py --data-file data/your_file.csv
Alternatively, provide a path to an existing database:
python main.py --db-file path/to/database.db
Interact via the CLI – Once started, the program will prompt you to enter natural‑language questions. Type your question and press Enter. The system will show a preview of the generated SQL; you can accept, edit or cancel the query. Results will then be displayed in a table. Use commands like history, export, help or exit to access additional functionality.
Export results – After running a query, use the export command and specify the desired format (csv or json) to save the results.
Project structure
main.py – Entry point for the command‑line interface.
nl2sql.py – Module responsible for prompt processing and SQL generation.
db.py – Database management and validation functions.
history.py – Stores and retrieves query history.
requirements.txt – Python dependencies.
README.md and readme.md – Project documentation.
Contributing
Contributions are welcome! Please open issues or pull requests on GitHub. When contributing code, ensure it is well‑documented and accompanied by relevant tests.
License
This project is released under the MIT License. See LICENSE for details.
