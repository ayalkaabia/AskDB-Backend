# Contributing to Natural Language → SQL Assistant

First off, thank you for taking the time to contribute! 🎉  
This document outlines how to set up your environment, coding conventions, and how to propose changes.

---

## 🛠 Getting Started

### 1. Fork & Clone
```bash
git clone https://github.com/<your-org>/<your-repo>.git
cd <your-repo>
```

### 2. Install Dependencies
## Tech Stack
- **Backend:** Node.js (Express.js)
- **Database:** MySQL
- **Version Control:** Git & GitHub
- **API Integration:** OpenAI API

## Setting up the Database
1. Make sure you have MySQL installed locally or running in Docker.
2. Create a database for the project:
   ```sql
   CREATE DATABASE project_name;

```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=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
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=project_name
PORT=3000
```

> ⚠️ Never commit your `.env` file. It should be in `.gitignore`.

### 4. Run Locally 
```bash
npm run dev 
```

---

## 🌳 Branching Workflow

We follow a simple **GitHub Flow**:

- `main` → stable, production-ready code  
- `dev` → integration branch for ongoing development  
- `feature/<short-name>` → for new features  
- `fix/<short-name>` → for bug fixes  

Example:
```bash
git checkout -b feature/add-export-csv
```

When finished:
```bash
git push origin feature/add-export-csv
```
Then open a Pull Request (PR) against `dev`.

---

## 📝 Commit Messages



When you want to commit messages use github desktop

---

## ✅ Testing & Linting

Before submitting changes, please run:

```bash
npm test
npm run lint
```

All tests **must pass** before merging.

---

## 🔄 Pull Requests

- Open PRs against the `dev` branch, not `main`.  
- Keep PRs focused and small (1 feature/fix at a time).  
- Include a **clear description** of changes.  
- Add **screenshots** or **sample queries** if the change affects the UI or SQL generation.  
- Ensure all CI checks pass before requesting review.  
- At least **1 reviewer approval** required before merge.



---

## 🤝 Code of Conduct

By participating in this project, you agree to maintain a respectful and collaborative environment.  
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

---

## 🙏 Thank You

Your contributions make this project better for everyone! 🚀
