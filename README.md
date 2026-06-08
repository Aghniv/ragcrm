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