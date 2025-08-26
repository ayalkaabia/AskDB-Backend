# Product Requirements Document (PRD)

**Project Name:** Dell – Tsofen Data Exploration Assistant  
**Version:** 1.0  
**Authors:** Omar Ryyan & Ayal Kaabia & Soha Hassan & Haya Gharra
**Date:** 25/08/2025  

---

## 1. Overview

### 1.1 Problem Statement
Exploring data in relational databases often requires SQL expertise or waiting for DB administrators/analysts to prepare queries. This creates bottlenecks, slows down decision-making, and makes it difficult for non-technical users to explore data relationships and trends.

### 1.2 Goals & Objectives
- Enable users to query and analyze database content using natural language.  
- Provide a friendly, easy-to-use interface accessible via Linux terminal.  
- Allow users to view, edit, and safely execute generated SQL.  
- Reduce dependence on DB admins and analysts.  
- Provide a standardized interface that can be reused across different Dell products.  

### 1.3 Out of Scope
- Support for non-SQL databases (e.g., NoSQL, graph databases).  
- Advanced visualization dashboards (initial release is text + tabular outputs only).  
- Multi-user collaboration in real-time.  

---

## 2. Users & Use Cases

### 2.1 User Personas
- **Business Analysts / Managers** – Want quick insights without SQL knowledge.  
- **Engineers / Developers** – Want to speed up query writing and testing.  
- **Data Scientists** – Want to iterate quickly on data exploration before modeling.  

### 2.2 Key Use Cases
1. Upload a database file and explore its schema.  
2. Ask natural language questions to retrieve data (e.g., “Show top 5 customers by revenue”).  
3. Request data analysis (aggregations, sorting, filtering).  
4. View/edit generated SQL queries before execution.  
5. Export query results into CSV/JSON for reporting.  
6. Maintain a history of executed queries for reference.  
7. Handle errors gracefully (e.g., invalid SQL, empty results).  

---

## 3. Functional Requirements

1. **Database Input**  
   - Users can upload or select a `.db` file.  
   - The system validates file type and structure.  

2. **Natural Language to SQL**  
   - Converts user prompts into SQL queries using GPT-based API.  
   - Validates queries against schema (table/column names, relationships).  
   - Ensures SQL safety (no injections or destructive operations unless explicitly requested).  

3. **Interface**  
   - Accessible via Linux terminal.  
   - Input field (prompt) + “Run” button.  
   - Preview of generated SQL before execution.  
   - Option to edit SQL before running.  
   - Tabular display of results.  

4. **Error Handling**  
   - Show clear messages when:  
     - Prompt cannot be converted to SQL.  
     - SQL fails to run.  
     - Query returns empty results.  

5. **Additional Features**  
   - Query history (list of past prompts + SQL).  
   - Export results to CSV or JSON.  
   - Tooltips or example prompts to guide users.  
   - Allow database modification commands with reasoning displayed.  

---

## 4. Non-Functional Requirements

- **Usability:** Simple and intuitive interface; minimal learning curve.  
- **Performance:** Average query processing + execution time < 3 seconds for small/medium datasets.  
- **Security:** Queries must be sanitized; database modifications must require explicit confirmation.  
- **Compatibility:** Linux terminal support (initial release).  
- **Scalability:** Should support small to medium datasets initially; extensible for larger datasets later.  

---

## 5. Nice-to-Have Features (Future Scope)

- Live auto-suggestions while typing prompts.  
- Ability to explain the SQL in plain English.  
- Conversational chat-style interface with follow-up queries (e.g., “Now sort by date”).  

---

## 6. Success Metrics

- **Translation Accuracy:** ≥ 80% of natural language prompts converted to valid SQL.  
- **Execution Success Rate:** ≥ 90% of queries run without errors.  
- **Response Time:** ≤ 3 seconds average latency for typical queries.  
- **User Satisfaction:** ≥ 4/5 average rating in user feedback surveys.  

---

## 7. Constraints & Risks

- **Dependencies:** Reliance on GPT/OpenAI API (availability, pricing).  
- **Security Risks:** Potential SQL injection if not validated properly.  
- **Complexity Limits:** Very complex queries (nested joins, advanced analytics) may not be translated correctly.  
- **Timeline/Resources:** To be determined.  

---

## 8. Stakeholders

- **Product Owner:** Dell / Tsofen program lead.  
- **Development Team:** Backend engineers, frontend engineers (terminal interface), AI integration team.  
- **QA/Testers:** Validate functional & non-functional requirements.  
- **End Users:** Analysts, managers, engineers, data scientists.  
