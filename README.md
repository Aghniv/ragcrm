 AI Sales Copilot CRM

A modern, multi-tenant AI-powered CRM for sales teams. AuraCRM helps you manage leads, customers, opportunities, and tasks, with AI-driven lead scoring, proposal drafting, and natural-language RAG search across your workspace.

> **Live demo:** *add your Render URL here*
> **Backend API docs:** see [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)
> **Postman collection:** [`POSTMAN_COLLECTION.json`](./POSTMAN_COLLECTION.json)

---

## Screenshots

![image alt](https://github.com/Aghniv/ragcrm/blob/c66edf3612e673f7c2f9064761d78b7d89f113bc/docs/screenshots/ragdash.png)
![image alt](https://github.com/Aghniv/ragcrm/blob/c66edf3612e673f7c2f9064761d78b7d89f113bc/docs/screenshots/ragreg.png)

---

## Highlights

- **Multi-tenant** — each workspace's data is fully isolated; switch workspaces from the top-right dropdown.
- **JWT auth** — register → setup workspace → log in; auth tokens are 24h, refreshed on login.
- **AI lead analysis** — score (0–100), urgency (LOW/MED/HIGH), and a natural-language summary, written back onto the lead.
- **AI proposal drafting** — opens an opportunity, reads the deal context, drafts a proposal paragraph you can copy into an email.
- **RAG search** — natural-language questions answered by your own tenant data via pgvector + Ollama embeddings.
- **Tasks & notes** — attach to leads, customers, or opportunities; AI can also auto-generate notes when it analyzes/proposes.
- **CSV export & bulk ops** — bulk status changes, bulk delete.

---

## Tech stack

| Layer | Stack |
|---|---|
| Frontend | React 19, React Router 7, React Bootstrap 2, Recharts, Tailwind, Axios |
| Backend | Spring Boot 3, Java 21, Spring Security (JWT), Spring AI |
| Database | PostgreSQL 16 + pgvector extension |
| AI runtime | Ollama (`minimax-m3` chat, `nomic-embed-text` embeddings) |
| Auth | JWT (HS256, 24h expiry) |
| Packaging | Docker (multi-stage), Vercel (frontend), Render (backend + Postgres) |

---

## Project layout

```
ragcrm/
├── frontend/                 # React SPA (Vercel)
│   ├── src/
│   │   ├── components/       # Reusable UI
│   │   ├── pages/            # Route-level views
│   │   ├── services/         # axios API client
│   │   ├── context/          # Auth + tenant context
│   │   └── styles/
│   └── Dockerfile
├── src/                      # Spring Boot backend (Render)
│   └── main/
│       ├── java/com/project/aicrm/
│       └── resources/
│           ├── application.properties
│           └── application-prod.properties
├── compose.yaml              # Local dev stack
├── Dockerfile                # Backend image
└── README.md
```

---

## Quick start (local Docker)

Prereqs: Docker + Docker Compose.

```bash
# 1. Clone & enter
git clone <your-repo-url> ragcrm && cd ragcrm

# 2. Copy env templates
cp .env.example .env
cp frontend/.env.example frontend/.env

# 3. Start the stack (backend + frontend + postgres)
docker compose up -d

# 4. Open
#    Frontend → http://localhost:3000
#    Backend  → http://localhost:8086
#    Postgres → localhost:5432 (db=aicrm, user=postgres, pw=root)
```

To run the backend without Docker (needs a local Postgres + Ollama):

```bash
./mvnw spring-boot:run
```

To run the frontend standalone:

```bash
cd frontend
npm install
npm start
```

---

## Environment variables

### Backend — Spring Boot (`src/main/resources/application.properties`)

All variables have dev defaults baked in; **production MUST override JWT_SECRET and the database values at minimum**.

| Variable | Required | Description |
|---|---|---|
| `PORT` | no (default `8086`) | HTTP port. Render injects this automatically. |
| `JWT_SECRET` | **yes** | HS256 signing key, ≥32 bytes. Generate with `openssl rand -hex 32`. |
| `DATABASE_URL` | yes | JDBC URL, e.g. `jdbc:postgresql://host:5432/aicrm`. |
| `DATABASE_USERNAME` | yes | |
| `DATABASE_PASSWORD` | yes | |
| `CORS_ORIGINS` | yes | Comma-separated frontend origin(s). No trailing slash. |
| `OLLAMA_BASE_URL` | yes | e.g. `http://localhost:11434` or your hosted Ollama. |
| `OLLAMA_MODEL` | no (default `minimax-m3`) | Chat model. |
| `OLLAMA_EMBEDDING_MODEL` | no (default `nomic-embed-text`) | Embedding model. |
| `VECTOR_DIMENSIONS` | no (default `768`) | Must match the embedding model. |
| `INITIALIZE_SCHEMA` | no (default `true`) | Auto-create pgvector tables on first boot. |
| `APP_DEMO_ENABLED` | no (default `true`) | Set `false` in prod to skip demo seeder. |
| `APP_MAIL_FROM` | no | `From:` address for outbound mail. |
| `APP_MAIL_REPLY_TO` | no | `Reply-To:` address. |
| `MAIL_HOST` / `MAIL_PORT` / `MAIL_USERNAME` / `MAIL_PASSWORD` | no | SMTP creds if sending mail. |
| `JPA_DDL_AUTO` | no (default `update`) | Hibernate DDL mode. |
| `SHOW_SQL` | no (default `false`) | SQL logging. |
| `SPRING_PROFILES_ACTIVE` | no | Set to `prod` for `application-prod.properties`. |

### Frontend — React (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_API_URL` | **yes (prod)** | Absolute URL to the backend, no trailing slash. Must be set **at build time**. |

---

## Deployment

### Backend → Render (Docker Web Service)

The repo's `Dockerfile` produces a runnable image (`eclipse-temurin:21-jdk-alpine` + fat jar). Push the repo, Render detects the Dockerfile, builds, and runs `java -jar app.jar`.

Set the env vars from the table above in **Render → Service → Environment**.

The DB is a separate Render **Postgres** service — Render creates the `DATABASE_URL` (use the **Internal** URL and prefix it with `jdbc:postgresql://`).

### Frontend → Vercel

Import the repo, set **Root Directory** to `frontend`, framework = Create React App. Add `REACT_APP_API_URL` under **Settings → Environment Variables** for Production / Preview / Development, then trigger a build.

`frontend/.npmrc` includes `legacy-peer-deps=true` to bypass CRA 5's stale peer-dep tree on modern npm.

---

## Workflow tour

1. **Register** an account.
2. **Set up your workspace** on `/setup` — pick a name, slug auto-fills.
3. **Land on the Dashboard** — empty on day one, fills up as you add data.
4. **Create a lead** under *Leads* → `+ New Lead` (name + email at minimum).
5. **Open the lead** → 🤖 *AI Tools* tab → **Analyze Lead** → score/urgency/summary appear within ~10–30s (first call is slowest while Ollama loads the model).
6. **Convert to customer** when qualified — the lead moves to *Customers* automatically.
7. **Add contacts** to the customer → open the customer and use the *Contacts* section.
8. **Create an opportunity** under *Pipeline* → pick the customer, set stage + amount.
9. **AI proposal** on the opportunity → drafts a paragraph you can copy.
10. **Add tasks** anywhere — title, due date, priority, optional link to a lead/customer/opportunity.
11. **Ask AI** (top nav) — natural-language questions answered from your workspace data via RAG.

For the full endpoint reference, see [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

---

## Troubleshooting

- **AI features feel slow / time out** — Ollama is loading the model into memory on first call; subsequent calls are fast. Verify `OLLAMA_BASE_URL` is reachable and the models are pulled (`ollama pull llama3.2 && ollama pull nomic-embed-text`).
- **"No workspace" after login** — register didn't finish tenant setup, or your JWT expired. Log out and back in.
- **Records seem to disappear** — workspace switcher (top-right) may be set to a different tenant; data is fully isolated per workspace.
- **CORS errors in the browser** — make sure the backend's `CORS_ORIGINS` exactly matches the frontend origin (scheme + host + port, no trailing slash).

---

## License

Private — all rights reserved.
