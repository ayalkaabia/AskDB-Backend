# Business Requirements Document (BRD)

## Document Control

* **Project Name:** Natural Language → SQL Assistant (Dell–Tsofen)
* **Document Owner:** Ayal Kaabia - Team  AskDB
* **Version:** 1.0
* **Status:** Draft
* **Last Updated:** 2025-08-25

---

## 1. Executive Summary

### Problem & Need

Business users and product teams need to explore data quickly without waiting for DB admins or analysts to write queries. They want to ask questions in natural language, get valid, **safe** SQL, and see results immediately in a user‑friendly format. The same interface should be usable across different Dell products and also from a Linux terminal.

### Proposed Solution

Build an assistant that:

* Accepts a data file; builds/loads a database file.
* Converts natural‑language prompts to **schema‑aware** SQL.
* Validates and safely executes SQL against the selected DB.
* Returns data and optional analyses in clear tables, with export and history.

---

## 2. Goals, Outcomes & KPIs

### Business Goals

* Reduce time‑to‑insight for non‑SQL users.
* Increase self‑serve analytics adoption across teams.
* Standardize a single interface to query different product datasets.

### Success Metrics (Targets)

* **Prompt→SQL success rate:** ≥ 90% of prompts produce executable SQL without manual edits.
* **Query execution success:** ≥ 95% of generated SQL runs without runtime errors on a valid schema.
* **Median time to answer:** ≤ 5 seconds for typical prompts on datasets ≤ 1M rows.
* **User satisfaction (CSAT):** ≥ 4.5/5 after 2 weeks of use.
* **Reduction in analyst tickets:** ≥ 40% for routine data questions within 1 quarter of rollout.

---

## 3. Scope

### In Scope (MVP)

1. Upload/select a **.db** database file; validate file type.
2. Natural‑language prompt input; synonyms and simple context (e.g., “clients” = “customers”).
3. Generate **preview** of SQL with option to **Edit SQL** before execution.
4. Execute SQL safely against the selected database; enforce read‑only for SELECT by default.
5. Display results in a **tabular** UI; allow **export** to CSV and JSON.
6. Clear error messaging for: cannot convert prompt to SQL, SQL fails to run, empty results.
7. Maintain a history of prompts and executed SQL.
8. **Linux terminal interface** for power users.
9. Optional commands to **amend** the database (INSERT/UPDATE/DDL) with visible reasoning and explicit user confirmation.

### Out of Scope (Phase 1)

* Cross‑database joins across multiple connections simultaneously.
* Real‑time streaming analytics / dashboards.
* Automated schema migration management.
* Enterprise RBAC/SSO and audit trails (targeted for a later phase).
* Multilingual prompts beyond English (Phase 2+).

---

## 4. Stakeholders & Users

* **Executive Sponsor / Product Owner:** Ensures alignment with Dell product needs.
* **Data Consumers (Primary Personas):**

  * **Product Manager**: needs KPIs and quick slice‑and‑dice.
  * **Business Analyst (non‑SQL)**: asks ad‑hoc questions; exports to CSV.
  * **Operations / Support**: looks up records quickly.
* **Data Engineer / DBA:** validates schema mapping and safe‑execution policies.
* **Security & Compliance:** reviews data access and logging controls.

---

## 5. Assumptions & Dependencies

* A valid database (SQLite .db for MVP) is provided or can be built from supplied data.
* Access to an LLM provider for NL→SQL (e.g., OpenAI API) with appropriate quotas.
* Schema metadata (tables, columns, foreign keys) is discoverable for grounding.
* Linux environments are available for the terminal interface.

---

## 6. Solution Overview

### Capabilities

1. **Prompt to SQL**: Use schema‑aware prompting to create syntactically correct queries.
2. **Safety Layer**: SQL validation and sanitization; configurable read/write policies.
3. **Schema Validation**: Verify table/column names and relationships before execution.
4. **Execution & Results**: Run queries; show paginated table; export as CSV/JSON.
5. **History & Explainability**: Store prompts/SQL; optional “Explain this SQL”.
6. **Terminal UI**: A CLI supporting the same capabilities (with text tables).
7. **Amend Commands (Guarded)**: Support INSERT/UPDATE/DDL with explicit rationale and confirmation.

### High‑Level Architecture (MVP)

* **Frontend**: Web UI (optional if CLI‑first), prompt editor, SQL preview, results grid, history panel.
* **Backend**: API for LLM NL→SQL, schema introspection, SQL safety validator, query executor.
* **DB Layer**: SQLite driver; file upload/validation; result pagination; export service.
* **Security**: Input sanitization, SQL allow/deny‑lists, configurable read/write modes, logging.

---

## 7. User Journeys

### A. Load DB & Ask a Question

1. User uploads/selects a `.db` file.
2. System validates type and introspects schema.
3. User types: “Top 5 selling products this year”.
4. System generates SQL preview; user reviews/edits.
5. User runs the query; table appears; user exports CSV.

### B. Lookup by Synonym

1. User: “List clients in New York with their last order date.”
2. System maps **clients→customers** and joins via `orders.customer_id`.

### C. Error Path: Ambiguous Prompt

1. User: “Show top items.”
2. System: asks clarifying question or shows error with suggestions/examples.

### D. CLI Flow (Linux Terminal)

* `nl2sql load mydata.db`
* `nl2sql ask "top 5 selling products this year" --preview`
* `nl2sql run`
* `nl2sql export --format csv`

---

## 8. Functional Requirements

1. **Natural‑Language Input**

   * Free‑text prompt box; basic prompt examples and tooltips.
   * Maintain conversational context within a session (simple follow‑ups like “now sort by date”).

2. **NL→SQL Generation**

   * LLM prompt grounding with live schema (tables, columns, FKs).
   * Synonym mapping (configurable glossary).
   * Provide SQL **preview** with **Edit** option.

3. **SQL Safety & Validation**

   * Validate table/column names.
   * Enforce read‑only mode by default; flag write operations.
   * Detect dangerous statements; show warnings and require explicit confirmation.

4. **Execution & Results**

   * Run validated SQL; handle parameterization.
   * Display paginated results; copy to clipboard; **export CSV/JSON**.
   * Handle empty results with helpful guidance.

5. **Error Handling**

   * Clear messages for: conversion failure, syntax/runtime errors, empty result sets.

6. **Database Handling**

   * Upload/select `.db`; validate type; show basic metadata (tables, columns, row counts).

7. **History**

   * Store prompt, SQL, timestamp, and execution status; enable rerun.

8. **CLI (Linux)**

   * Parity with core features: ask, preview, run, export, history.

9. **Amend Commands (Optional in MVP)**

   * Allow INSERT/UPDATE/DDL with rationale display and confirmation.

---

## 9. Non‑Functional Requirements

* **Performance:** Generate SQL ≤ 2s p50; execute typical queries ≤ 3s p50.
* **Reliability:** 99.5% uptime for backend services.
* **Security:** SQL injection protections; least‑privilege DB access; logging.
* **Usability:** Clear examples, tooltips; accessible (keyboard navigation; ARIA labels).
* **Portability:** Linux CLI; web app runs in modern browsers (Chrome/Edge/Firefox).
* **Scalability:** Support datasets up to 1M rows (MVP), with pagination.
* **Observability:** Metrics for generation success, error types, latency; centralized logs.

---

## 10. Data, Privacy & Compliance

* Process only datasets users upload or select; no persistent storage of data beyond session history unless explicitly configured.
* Mask PII fields in previews where applicable; configurable field‑level policies.
* Log prompts and SQL; redact sensitive values.

---

## 11. Constraints

* LLM API quotas and latency; offline fallback shows guidance but not generation.
* SQLite focus in MVP; future support for Postgres/MySQL.
* Limited multilingual support in MVP (English only).

---

## 12. Acceptance Criteria (Samples)

* **AC‑1:** Given a valid `.db`, when a user asks a factual question about existing tables, the system generates executable SQL with correct table/column names **≥ 90%** of the time on test set.
* **AC‑2:** Users can view **and** edit the generated SQL before execution.
* **AC‑3:** On executing valid SQL, results render in a paginated table and can be exported to **CSV** and **JSON**.
* **AC‑4:** Clear error messages appear for conversion failure, SQL runtime errors, and empty results.
* **AC‑5:** Users can upload/select a `.db`; invalid file types are rejected with a helpful message.
* **AC‑6:** History view lists past prompts/queries; users can rerun from history.
* **AC‑7 (CLI):** Linux terminal flow supports ask → preview → run → export.
* **AC‑8 (Safety):** Write operations require explicit confirmation and display rationale.

---

## 13. Risks & Mitigations

* **Incorrect SQL / Hallucinations:**

  * *Mitigation:* schema‑grounding; validation against metadata; safe‑list of tables; user preview/edits.
* **SQL Injection / Dangerous Writes:**

  * *Mitigation:* read‑only by default; deny‑list; confirmation gates; parameterization.
* **Schema Drift:**

  * *Mitigation:* re‑introspect on DB load; cache invalidation; versioned histories.
* **Latency / Cost:**

  * *Mitigation:* lightweight model for simple prompts; caching; streaming partial SQL.
* **Privacy:**

  * *Mitigation:* PII masking in results; redaction of logs.

---

## 14. Release Plan (High‑Level)

* **MVP (4–6 weeks):** Upload `.db`, NL→SQL, preview/edit, execute, table results, export, errors, history, CLI.
* **v1.1:** Explain SQL, chat‑style follow‑ups, synonyms editor, basic user settings.
* **v1.2:** Role‑based access, multi‑DB (Postgres), multilingual prompts, enterprise logging.

---

## 15. Open Questions

* Priority of CLI vs. Web UI for the first release?
* Target datasets and typical sizes per product team?
* Required compliance frameworks (e.g., SOC2) for enterprise rollout?
* Who owns synonym dictionary per product domain?

---

## 16. Glossary

* **NL→SQL:** Natural Language to SQL conversion.
* **Schema Grounding:** Using actual DB schema to constrain generation.
* **Read‑Only Mode:** Only SELECT statements are allowed without elevated permissions.
* **History:** Stored prompts and SQL for auditability and reuse.

