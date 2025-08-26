# Product Requirements Document (PRD)

**Project Name:** Dell – Tsofen Data Exploration Assistant  
**Version:** 1.0  
**Authors:** Omar Ryyan, Ayal Kaabia, Soha Hassan, Haya Gharra  
**Date:** 25/08/2025  

---

## Table of Contents
- [1. Overview](#1-overview)
  - [1.1 Problem Statement](#11-problem-statement)
  - [1.2 Goals & Objectives](#12-goals--objectives)
  - [1.3 Out of Scope](#13-out-of-scope)
- [2. Users & Use Cases](#2-users--use-cases)
  - [2.1 User Personas](#21-user-personas)
  - [2.2 Key Use Cases](#22-key-use-cases)
- [3. Functional Requirements](#3-functional-requirements)
- [4. Non-Functional Requirements](#4-non-functional-requirements)
- [5. Nice-to-Have Features](#5-nice-to-have-features-future-scope)
- [6. Success Metrics](#6-success-metrics)
- [7. Constraints & Risks](#7-constraints--risks)
- [8. Stakeholders](#8-stakeholders)

---

## 1. Overview

### 1.1 Problem Statement
Exploring relational database content requires SQL expertise or waiting for DB administrators. This creates bottlenecks and slows decision-making for non-technical users.

### 1.2 Goals & Objectives
- Enable natural language database queries.  
- Provide a simple terminal interface for exploration.  
- Allow safe editing and execution of SQL queries.  
- Reduce reliance on DB admins.  
- Create a standardized interface reusable across Dell products.

### 1.3 Out of Scope
- Non-SQL databases (NoSQL, graph).  
- Advanced dashboards (initial release = terminal, tabular results).  
- Multi-user real-time collaboration.

---

## 2. Users & Use Cases

### 2.1 User Personas

| Persona | Description | Needs |
|---------|-------------|-------|
| Business Analysts / Managers | Non-technical users needing insights | Quick answers without SQL |
| Engineers / Developers | Technical users writing queries | Faster query building & validation |
| Data Scientists | Iterative exploration before modeling | Rapid prototyping & filtering |

### 2.2 Key Use Cases
1. Upload database file & explore schema.  
2. Ask natural language questions → SQL → results.  
3. Perform aggregations, sorting, filtering.  
4. Preview & edit SQL before execution.  
5. Export results (CSV/JSON).  
6. Maintain query history.  
7. Error handling (invalid SQL, empty results).

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-1 | **Database Input** – Upload/select `.db` file, validate structure. |
| FR-2 | **Natural Language → SQL** – Use GPT-based API, validate schema, ensure safe SQL. |
| FR-3 | **Interface** – Linux terminal, input prompt, preview SQL, edit option, tabular results. |
| FR-4 | **Error Handling** – Friendly errors for invalid SQL, failed execution, empty results. |
| FR-5 | **History & Export** – Store executed queries, export results to CSV/JSON. |
| FR-6 | **Database Modifications** – Require explicit user confirmation with reasoning. |

---

## 4. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| Usability | Simple CLI interface, minimal learning curve |
| Performance | Query + execution < 3 seconds (small/medium datasets) |
| Security | Sanitized SQL, explicit confirmation for DB changes |
| Compatibility | Linux terminal support (initial release) |
| Scalability | Start with small/medium datasets; extensible later |

---

## 5. Nice-to-Have Features (Future Scope)
- Auto-suggestions while typing prompts.  
- SQL explanation in plain English.  
- Conversational chat-style follow-ups.

---

## 6. Success Metrics

| Metric | Target |
|--------|--------|
| Translation Accuracy | ≥ 80% valid SQL conversions |
| Execution Success | ≥ 90% queries run without errors |
| Response Time | ≤ 3 seconds avg latency |
| User Satisfaction | ≥ 4/5 in surveys |

---

## 7. Constraints & Risks
- **Dependencies:** Reliance on GPT/OpenAI API.  
- **Security Risks:** SQL injection if validation fails.  
- **Complexity Limits:** Very complex queries may fail.  
- **Timeline/Resources:** TBD.

---

## 8. Stakeholders

| Role | Stakeholder |
|------|-------------|
| Product Owner | Dell / Tsofen Program Lead |
| Development Team | Backend, terminal frontend, AI integration |
| QA/Testers | Requirement validation |
| End Users | Analysts, managers, engineers, data scientists |
