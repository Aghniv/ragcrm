# AuraCRM - AI Sales Copilot CRM

A modern AI-powered Customer Relationship Management system for managing sales leads with intelligent analysis and tracking.

## Overview

AuraCRM helps sales teams manage leads through an AI-powered system that analyzes lead quality, urgency, and provides actionable insights. Built with React (frontend) and Spring Boot (backend).

## Tech Stack

- **Frontend**: React 18, React Bootstrap, Lucide Icons, Recharts
- **Backend**: Spring Boot 3, Java 17, PostgreSQL
- **Authentication**: JWT-based auth
- **AI Integration**: Lead scoring and urgency analysis

## Project Structure

```
aicrm/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── context/     # React contexts
│   │   └── styles/      # CSS styles
│   └── public/
├── src/                   # Spring Boot backend
├── API_DOCUMENTATION.md  # Full API reference
└── POSTMAN_COLLECTION.json # Postman API tests
```

## Features

- User authentication (register, login, password reset)
- Lead management (CRUD operations)
- AI-powered lead scoring and urgency analysis
- Lead status tracking (NEW, CONTACTED, QUALIFIED, PROPOSAL, WON, LOST)
- Dashboard with statistics and insights
- Activity logging
- CSV export
- Bulk operations

## Getting Started

### Prerequisites

- Node.js 18+
- Java 17+
- PostgreSQL 14+
- Docker (optional)

### Backend Setup

1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```

2. Run the backend:
   ```bash
   ./mvnw spring-boot:run
   ```

3. Backend runs on: `http://localhost:8090`

### Frontend Setup

1. Navigate to frontend:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Frontend runs on: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Leads (requires JWT)
- `POST /api/leads` - Create lead
- `GET /api/leads` - Get all leads (paginated)
- `GET /api/leads/{id}` - Get lead by ID
- `PUT /api/leads/{id}` - Update lead
- `DELETE /api/leads/{id}` - Delete lead
- `POST /api/leads/{id}/analyze` - AI analyze lead
- `GET /api/leads/status/{status}` - Get leads by status
- `DELETE /api/leads/bulk` - Bulk delete
- `PUT /api/leads/bulk/status` - Bulk update status
- `GET /api/leads/export` - Export to CSV

## Lead Status Flow

```
NEW → CONTACTED → QUALIFIED → PROPOSAL → WON
                   ↓                    ↓
                 LOST ←──────────────┘
```

## Environment Variables

### Backend
- `DB_URL` - PostgreSQL connection URL
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing secret

### Frontend
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:8090)

## License

Private - All rights reserved

On /setup:
1. Name = "Acme Corp" (or whatever your company is called).
2. Slug auto-fills from the name (e.g. acme-corp) — leave it or edit it. This becomes part of your tenant URL and your data isolation key.
3. Click Create Workspace.
4. You land on the Dashboard.

2. The dashboard (your home)

The dashboard shows stats: total leads, customers, opportunities by stage, open tasks, and a small "Ask AI" search box at the bottom.

It's mostly empty on day one. The next step is to start adding data.

3. Leads — your starting point

Go to Leads in the top nav.

Create a lead

1. Click + New Lead (top-right).
2. Fill in at minimum:
  - Name — the prospect's name
  - Email — required, must be valid
  - Status — defaults to NEW
3. Optional but useful: Phone, Company, Source (e.g. "Website", "Referral"), Notes.
4. Click Create.

You can also use the search box at the top of the list page to filter later.

Lead detail page

Click any lead to open /leads/:id. It has 4 tabs:

- Overview — contact info, status badge, edit/delete buttons.
- 🤖 AI Tools — the main AI button:
  - Click Analyze Lead → the LLM scores the lead (0–100), assigns urgency (LOW/MED/HIGH), and writes a summary back into the lead. The score/urgency/summary appear below the button.
- 📝 Notes — internal notes about the lead. Type, click Add Note.
- ✅ Tasks — todo items tied to this lead. Title + Due date + Priority.

Convert a lead to a customer

When a lead is qualified:
1. Open the lead → 🤖 AI Tools tab → click Convert to Customer → (link at the bottom of the tab).
2. This moves the lead into the Customers list as a real customer.

4. Customers

Go to Customers in the nav.

- List page: shows all your customers. Search box at top.
- Create: + New Customer → name + contact info + status.
- Detail page: contact info, a list of contacts (people at the customer), a list of opportunities tied to this customer, notes, tasks.

Add contacts to a customer

On a customer's detail page:
1. Find the Contacts section.
2. + Add Contact → name, email, phone, role/title → save.

5. Opportunities (your pipeline)

Go to Pipeline in the nav.

Create an opportunity

1. + New Opportunity.
2. Required fields:
  - Title — e.g. "Q3 license expansion"
  - Customer — pick from the dropdown (this is why customers must exist first)
  - Stage — PROSPECTING / QUALIFICATION / PROPOSAL / NEGOTIATION / WON / LOST
  - Amount — estimated value
3. Save.

AI proposal

Open an opportunity → 🤖 AI Proposal button (on the detail page).
- The LLM reads the opportunity's title, customer info, stage, and amount, then drafts a proposal paragraph you can copy into an email.

6. Tasks

Go to Tasks in the nav.

- List of every task across all entities (leads, customers, opportunities).
- + New Task → title, due date, priority, optional related type (lead/customer/opportunity) + related id.
- Or create tasks directly from inside a lead/customer/opportunity detail page.

7. Ask AI (RAG-powered search)

Go to Ask AI in the nav.

1. Type a natural-language question, e.g.:
  - "Which leads from Acme Corp contacted us this month?"
  - "Summarize all opportunities in the PROPOSAL stage."
  - "What's our biggest deal right now?"
2. The system searches your tenant's data via vector similarity (pgvector) and the LLM writes an answer grounded in what it found.
3. The answer shows the sources it pulled from below — click them to jump to the underlying record.

The more notes, leads, opportunities, and customers you have, the better the answers get. Sparse data = sparse answers.

8. Tenancy (workspaces)

You can belong to multiple workspaces:
- Top-right has the 🏢 workspace switcher dropdown.
- Click it to switch between workspaces you've created or been invited to.
- + New workspace at the bottom of the menu takes you back to /setup.

Important: all data is scoped per workspace. The same email in two workspaces sees two completely separate lead/customer/opportunity sets.

9. Recommended first-day path

If you just want to see the app light up end-to-end:

1. Register → create workspace "Test Co".
2. Create a lead: Jane Doe, jane@testco.com, Company "Test Co", Notes "Wants a demo next week".
3. Open the lead → 🤖 AI Tools → Analyze Lead. You should see a score/urgency/summary appear within ~10–30 sec (depends on your Ollama model).
4. Convert to Customer → it appears in Customers.
5. Open the customer → add a contact John Smith.
6. Go to Pipeline → + New Opportunity → title "Pilot deployment", customer = Test Co, stage PROPOSAL, amount $10,000.
7. Open the opportunity → click 🤖 AI Proposal → read the draft.
8. Add a task "Follow up with Jane" due tomorrow.
9. Go to Ask AI → type "What deals do we have in PROPOSAL?" → see the answer cite your opportunity.

10. Gotchas


10. Gotchas

- AI features feel slow the first time — Ollama is loading the model into memory. After that it's fast.
- If Analyze/Proposal never returns — Ollama isn't reachable. Check that OLLAMA_BASE_URL is correct and the model is pulled (ollama pull llama3.2, ollama pull nomic-embed-text).
- "No workspace" after login — register didn't complete tenant setup, or your JWT expired. Log out and back in.
- You can only see data from your active workspace — switch via the top-right dropdown if a record seems missing.
8. Add a task "Follow up with Jane" due tomorrow.
9. Go to Ask AI → type "What deals do we have in PROPOSAL?" → see the answer cite your opportunity.

10. Gotchas

- AI features feel slow the first time — Ollama is loading the model into memory. After that it's fast.
- If Analyze/Proposal never returns — Ollama isn't reachable. Check that OLLAMA_BASE_URL is correct and the model is pulled (ollama pull llama3.2, ollama pull nomic-embed-text).
- "No workspace" after login — register didn't complete tenant setup, or your JWT expired. Log out and back in.
- You can only see data from your active workspace — switch via the top-right dropdown if a record seems missing. search, multi-tenant switching) hangs off that loop.
3. LEADS — /api/leads

3.1 Create lead

POST {{baseUrl}}/api/leads

{
  "name": "Jane Doe",
  "email": "jane@prospect.test",
  "phone": "+1-555-0100",
  "company": "Globex Inc",
  "source": "Website",
  "status": "NEW",
  "notes": "Inbound from contact form."
}

Tests:
pm.collectionVariables.set("leadId", pm.response.json().id);

3.2 Create lead — invalid email (expect 400)

{ "name": "X", "email": "not-an-email", "phone": "" }
Expects 400 with errors.email = "Invalid email format".

3.3 Create lead — missing name (expect 400)

{ "email": "x@y.com" }

3.4 List leads (paginated, with search + status)

GET {{baseUrl}}/api/leads?page=0&size=20&search=jane&status=NEW&sortBy=createdAt&sortDirection=DESC

3.5 List leads — invalid status (expect 400)

GET {{baseUrl}}/api/leads?status=BOGUS

3.6 Get lead by id

GET {{baseUrl}}/api/leads/{{leadId}}

3.7 Get lead — not found (expect 404)

GET {{baseUrl}}/api/leads/999999

3.8 Update lead

PUT {{baseUrl}}/api/leads/{{leadId}}
{
  "name": "Jane Doe",
  "email": "jane@prospect.test",
  "phone": "+1-555-0100",
  "company": "Globex Inc",
  "source": "Referral",
  "status": "QUALIFIED",
  "notes": "BANT qualified, ready for demo."
}

3.9 AI — Analyze lead

POST {{baseUrl}}/api/leads/{{leadId}}/analyze

Tests:
pm.test("lead has score", () => pm.expect(pm.response.json().score).to.exist);

3.10 Delete lead

DELETE {{baseUrl}}/api/leads/{{leadId}}

Expects 204. Re-run 3.6 → 404.

---
4. CUSTOMERS — /api/customers

4.1 Create customer

POST {{baseUrl}}/api/customers
{
  "name": "Globex Inc",
  "industry": "Manufacturing",
  "size": "1000-5000",
  "website": "https://globex.test",
  "billingAddress": "100 Industrial Way, Detroit, MI"
}
Tests: pm.collectionVariables.set("customerId", pm.response.json().id);

4.2 Create customer — missing name (expect 400)

{ "industry": "X" }

4.3 List customers

GET {{baseUrl}}/api/customers?page=0&size=20&search=globex

4.4 Get customer

GET {{baseUrl}}/api/customers/{{customerId}}

4.5 Update customer

PUT {{baseUrl}}/api/customers/{{customerId}}
{
  "name": "Globex Inc",
  "industry": "Manufacturing",
  "size": "5000+",
  "website": "https://globex.test",
  "billingAddress": "100 Industrial Way, Detroit, MI"
}

4.6 Delete customer

DELETE {{baseUrl}}/api/customers/{{customerId}} → 204

---
5. CONTACTS — /api/contacts

5.1 Create contact (linked to customer)

POST {{baseUrl}}/api/contacts
{
  "name": "Jane Doe",
  "email": "jane@globex.test",
  "phone": "+1-555-0100",
  "title": "VP Engineering",
  "linkedin": "https://linkedin.com/in/jane",
  "customerId": 1
}
Tests: pm.collectionVariables.set("contactId", pm.response.json().id);

5.2 List contacts

GET {{baseUrl}}/api/contacts?page=0&size=20

5.3 List contacts by customer

GET {{baseUrl}}/api/contacts/by-customer/{{customerId}}

5.4 Get contact

GET {{baseUrl}}/api/contacts/{{contactId}}

5.5 Update contact

PUT {{baseUrl}}/api/contacts/{{contactId}}
{
  "name": "Jane Doe",
  "email": "jane@globex.test",
  "phone": "+1-555-0100",
  "title": "CTO",
  "linkedin": "https://linkedin.com/in/jane",
  "customerId": 1
}

5.6 Delete contact

DELETE {{baseUrl}}/api/contacts/{{contactId}} → 204

---
6. OPPORTUNITIES — /api/opportunities

6.1 Create opportunity

POST {{baseUrl}}/api/opportunities
{
  "name": "Globex — Enterprise Pilot",
  "customerId": 1,
  "contactId": 1,
  "amount": 75000.00,
  "currency": "USD",
  "expectedCloseDate": "2026-09-30",
  "probabilityPct": 40,
  "stage": "QUALIFICATION",
  "description": "50-seat pilot for ML feature."
}
Tests: pm.collectionVariables.set("opportunityId", pm.response.json().id);

6.2 Create opportunity — missing name (expect 400)

{ "amount": 100 }

6.3 List opportunities

GET {{baseUrl}}/api/opportunities?page=0&size=20

6.4 List by stage

GET {{baseUrl}}/api/opportunities?stage=PROPOSAL

6.5 Get opportunity

GET {{baseUrl}}/api/opportunities/{{opportunityId}}

6.6 List by customer

GET {{baseUrl}}/api/opportunities/by-customer/{{customerId}}

6.7 Update opportunity — move to WON

PUT {{baseUrl}}/api/opportunities/{{opportunityId}}
{
  "name": "Globex — Enterprise Pilot",
  "customerId": 1,
  "contactId": 1,
  "amount": 75000.00,
  "currency": "USD",
  "expectedCloseDate": "2026-09-30",
  "probabilityPct": 100,
  "stage": "WON",
  "description": "Contract signed."
}

6.8 Delete opportunity

DELETE {{baseUrl}}/api/opportunities/{{opportunityId}} → 204

---
7. TASKS — /api/tasks

7.1 Create task

POST {{baseUrl}}/api/tasks
{
  "title": "Send Globex proposal",
  "description": "Email the proposal draft and book demo.",
  "assigneeId": 1,
  "relatedType": "OPPORTUNITY",
  "relatedId": 1,
  "dueAt": "2026-08-10T17:00:00",
  "priority": "HIGH",
  "status": "OPEN",
  "aiGenerated": false
}
Tests: pm.collectionVariables.set("taskId", pm.response.json().id);

7.2 List my tasks

GET {{baseUrl}}/api/tasks?page=0&size=20&status=OPEN

7.3 Tasks for an entity

GET {{baseUrl}}/api/tasks/for/OPPORTUNITY/{{opportunityId}}

7.4 Get task

GET {{baseUrl}}/api/tasks/{{taskId}}

7.5 Update task — mark DONE

PUT {{baseUrl}}/api/tasks/{{taskId}}
{
  "title": "Send Globex proposal",
  "description": "Email the proposal draft and book demo.",
  "assigneeId": 1,
  "dueAt": "2026-08-10T17:00:00",
  "priority": "HIGH",
  "status": "DONE"
}

7.6 Delete task

DELETE {{baseUrl}}/api/tasks/{{taskId}} → 204

---
8. NOTES — /api/notes

8.1 Create note on a lead

POST {{baseUrl}}/api/notes
{
  "entityType": "LEAD",
  "entityId": 1,
  "body": "Discovery call on 2026-08-04. Strong fit for Tier 1 plan."
}
Tests: pm.collectionVariables.set("noteId", pm.response.json().id);

8.2 Notes for an entity

GET {{baseUrl}}/api/notes/for/LEAD/1

8.3 List all notes

GET {{baseUrl}}/api/notes?page=0&size=20

8.4 Update note

PUT {{baseUrl}}/api/notes/{{noteId}}
{
  "entityType": "LEAD",
  "entityId": 1,
  "body": "Updated: discovery call moved to 2026-08-06."
}

8.5 Delete note

DELETE {{baseUrl}}/api/notes/{{noteId}} → 204

---
9. AI — /api/ai

▎ ⚠️ Requires OLLAMA_BASE_URL reachable and minimax-m3 + nomic-embed-text models pulled. Calls can take 5–30s.

9.1 AI summary for a lead

POST {{baseUrl}}/api/ai/leads/{{leadId}}/summary

Response:
{ "summary": "Jane Doe at Globex Inc is a qualified inbound lead..." }

9.2 AI proposal for an opportunity

POST {{baseUrl}}/api/ai/opportunities/{{opportunityId}}/proposal

{ "proposal": "Dear Jane,\n\nWe are pleased to propose..." }

▎ Both endpoints auto-write a note of the form "AI summary: ..." / "AI drafted proposal (N chars)." on the entity — verify with GET /api/notes/for/LEAD/{id} or …/OPPORTUNITY/{id}.

---
10. RAG SEARCH — /api/search

10.1 Vector search (no LLM)

GET {{baseUrl}}/api/search?q=enterprise+pricing&topK=5

Returns [{ "content": "...", "metadata": {...}, "score": 0.81 }, ...].

10.2 RAG answer (LLM with retrieved context)

POST {{baseUrl}}/api/search/answer
{
  "question": "Which customers are evaluating our Tier 1 plan?",
  "topK": 5
}
Response:
{ "answer": "Based on your CRM data, the following customers..." }

10.3 Answer — empty question (expect 400)

{ "question": "" }
Returns 400 { "error": "question is required" }.

---
11. DASHBOARD — /api/dashboard

11.1 Overview

GET {{baseUrl}}/api/dashboard

{
  "leadsTotal": 12,
  "leadsByStatus": { "NEW": 3, "CONTACTED": 2, "QUALIFIED": 1, "PROPOSAL": 1, "WON": 0, "LOST": 0 },
  "customersTotal": 4,
  "contactsTotal": 7,
  "opportunitiesTotal": 3,
  "opportunitiesByStage": { "PROSPECTING": 1, "QUALIFICATION": 1, "PROPOSAL": 1, "NEGOTIATION": 0, "WON": 0, "LOST": 0 },
  "openPipelineAmount": 125000.00,
  "wonRevenueAmount": 0.00,
  "tasksOpen": 5,
  "notesTotal": 18
}

11.2 Health

GET {{baseUrl}}/api/dashboard/health

{ "status": "ok", "tenantId": "1" }

---
12. AUTH GUARD — Regression checks

┌──────┬───────────────────────────────────────────────────────────────────────────────┬───────────────────────────┐
  "notesTotal": 18
}

11.2 Health

GET {{baseUrl}}/api/dashboard/health

{ "status": "ok", "tenantId": "1" }

---
12. AUTH GUARD — Regression checks

┌──────┬───────────────────────────────────────────────────────────────────────────────┬───────────────────────────┐
│  #   │                                    Request                                    │         Expected          │
├──────┼───────────────────────────────────────────────────────────────────────────────┼───────────────────────────┤
│ 12.1 │ GET /api/leads with no Authorization header                                   │ 401/403                   │
├──────┼───────────────────────────────────────────────────────────────────────────────┼───────────────────────────┤
│ 12.2 │ GET /api/leads with garbage Bearer foo                                        │ 401/403                   │
├──────┼───────────────────────────────────────────────────────────────────────────────┼───────────────────────────┤
│ 12.3 │ GET /api/leads with valid token, no X-Tenant-Id and JWT has no tenantId claim │ 400/403 (tenant required) │
├──────┼───────────────────────────────────────────────────────────────────────────────┼───────────────────────────┤
│ 12.4 │ GET /api/leads with X-Tenant-Id: 9999 (user not a member)                     │ 403                       │
└──────┴───────────────────────────────────────────────────────────────────────────────┴───────────────────────────┘

---
13. CORS Preflight — sanity check

OPTIONS {{baseUrl}}/api/leads
Headers:
- Origin: http://localhost:3000
- Access-Control-Request-Method: POST
- Access-Control-Request-Headers: authorization,content-type,x-tenant-id

Expected: 200 with Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers echoed.

---
Recommended execution order in Postman (Run Order)

1. 1.1 Register → captures token
2. 1.2 Login (re-issues token)
3. 2.1 Create tenant → captures tenantId + new token
4. 2.4 My tenants
5. 4.1 Create customer → captures customerId
6. 5.1 Create contact → captures contactId
7. 3.1 Create lead → captures leadId
8. 6.1 Create opportunity → captures opportunityId
9. 7.1 Create task → captures taskId
10. 8.1 Create note → captures noteId
11. 3.9 Analyze lead
12. 9.1 AI summary
13. 9.2 AI proposal
14. 10.1 Vector search
15. 10.2 RAG answer
16. 11.1 Dashboard overview
17. Deletion sweeps (3.10, 4.6, 5.6, 6.8, 7.6, 8.5) — verify 204 then 404 on re-GET

Pro tip: Postman Runner

Drop all of the above into a folder, click Run, and store pass/fail counts per request. The pm.collectionVariables.set(...) calls in Tests tabs let the next request pick up the ids automatically — no manual copy-paste.
11. 3.9 Analyze lead
12. 9.1 AI summary
13. 9.2 AI proposal
14. 10.1 Vector search
15. 10.2 RAG answer
16. 11.1 Dashboard overview
17. Deletion sweeps (3.10, 4.6, 5.6, 6.8, 7.6, 8.5) — verify 204 then 404 on re-GET
│ 12.1 │ GET /api/leads with no Authorization header                                   │ 401/403                   │
├──────┼──────