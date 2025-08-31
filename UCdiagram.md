User story and use case diagram
PlantUML code:
@startuml
left to right direction
skinparam packageStyle rectangle

actor User
actor Admin
actor Database

rectangle "ASKDB Interface System" {

  User --> (Upload/Select Database File)
  (Upload/Select Database File) .> (Validate File Type) : <<include>>
  User --> (Ask Question in Natural Language)
  (Ask Question in Natural Language) .> (Convert Prompt to SQL) : <<include>>
  (Convert Prompt to SQL) .> (Validate SQL against Schema) : <<include>>
  (Convert Prompt to SQL) .> (Ensure SQL Safety) : <<include>>
  User --> (Run SQL Query)
  (Run SQL Query) --> Database
  Database --> (Return Results)
  User --> (Edit SQL)
  (Edit SQL) .> (Run SQL Query) : <<extend>>

  User --> (Export Results)
  (Export Results) --> (CSV/JSON)
  User --> (View Query History)
  (Handle Errors) <.. (Ask Question in Natural Language) : <<extend>>
  (Handle Errors) <.. (Run SQL Query) : <<extend>>

  Admin --> (Manage Database Files)
}

@enduml
Use case diagram:
 


User story :
User Stories for ASKDB Interface System
As a user:
1.	I want to upload a database file, so that I can start exploring data.
2.	I want the system to validate the database file type, so that I don’t upload unsupported files.
3.	I want to ask questions in natural language, so that I can get insights without writing SQL manually.
4.	I want the system to translate my question into SQL, so that I can retrieve the correct data.
5.	I want the system to ensure SQL queries are safe, so that no harmful queries are executed.
6.	I want the system to validate queries against the database schema, so that I get reliable results.
7.	I want to see the generated SQL, so that I can understand and optionally edit it.
8.	I want to execute the SQL query on the database, so that I can retrieve results.
9.	I want to see results in a user-friendly table format, so that I can easily interpret the data.
10.	I want to export results to CSV or JSON, so that I can share or reuse the data.
11.	I want to view my query history, so that I can repeat or refine past queries.
12.	I want to receive clear error messages when something goes wrong, so that I understand what to fix.
13.	(Nice-to-have) I want auto-suggestions while typing, so that I can write prompts faster.
14.	(Nice-to-have) I want the system to explain the generated SQL, so that I learn how queries are formed.
15.	(Nice-to-have) I want a chat-style interface with follow-ups, so that I can refine my queries naturally.

