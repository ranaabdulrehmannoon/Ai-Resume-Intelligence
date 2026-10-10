# AI Resume Intelligence

An AI-powered resume analysis platform that helps candidates understand how well their resume matches a job description, identify skill gaps, improve resume content, and prepare for interviews.

## Overview

AI Resume Intelligence turns a resume and a job posting into a practical, explainable report. The platform combines structured document extraction, deterministic scoring, semantic skill matching, and AI-generated guidance in one workflow.

### What it does

- Upload and manage resumes in PDF or DOCX format
- Save and manage job descriptions
- Compare a resume against a specific role
- Generate an explainable ATS-style score
- Show matched, missing, and contextual skills
- Analyze resume bullets and suggest improvements
- Produce prioritized recommendations
- Generate interview preparation questions
- Preserve resume versions and analysis history
- Support mock AI responses for local development without API costs

## How It Works

```text
Resume + job description
          |
          v
  Document text extraction
          |
          v
 Structured AI extraction + validation
          |
          v
 Exact and semantic skill matching
          |
          v
 Deterministic scoring engine
          |
          v
 Grounded recommendations and interview preparation
```

The score is calculated by application code from structured data. AI is used for extraction and explanation, while the scoring engine keeps the final result repeatable and auditable.

## Core Scoring Dimensions

| Dimension | Weight |
| --- | ---: |
| Skill match | 30 |
| Experience | 20 |
| Keywords | 15 |
| Projects | 10 |
| Education | 10 |
| Structure | 10 |
| Formatting proxy | 5 |

The formatting category evaluates extracted structure, such as bullet consistency. It does not inspect the original visual layout of a PDF or DOCX file.

## Technology

- **Framework:** Next.js 16 App Router
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS, Radix UI, Framer Motion
- **Authentication:** NextAuth.js with credentials support
- **Database:** PostgreSQL with Prisma ORM
- **AI:** Google Gemini through an internal provider abstraction
- **Validation:** Zod
- **Document parsing:** `pdf-parse` and `mammoth`

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL
- A Gemini API key when using the real AI provider

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the safe template:

   ```bash
   cp .env.example .env
   ```

   Then configure `.env`:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/resume_intelligence?schema=public"
   AUTH_SECRET="generate-a-long-random-secret"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   AI_PROVIDER="mock"
   GEMINI_API_KEY="your-gemini-api-key"
   MAX_FILE_SIZE_MB=5
   ```

   Set `AI_PROVIDER="gemini"` when you want to use Gemini. The API key is only required for that provider. Keep `.env` private and never commit it.

3. Generate the Prisma client and apply migrations:

   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000).

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Generate the Prisma client |
| `npx prisma migrate deploy` | Apply production-safe migrations |

## Application Areas

- `/` - Product landing page
- `/login` - Sign in
- `/register` - Create an account
- `/resumes` - Manage uploaded resumes
- `/jobs` - Manage saved job descriptions
- `/analysis/new` - Start a new comparison
- `/analysis` - Review analysis history
- `/interview` - Review interview preparation
- `/settings` - Manage account settings

## Project Structure

```text
src/
  app/          Next.js routes, layouts, and API handlers
  components/   Reusable UI and feature components
  lib/          Authentication, database, AI, scoring, and parsing logic
  types/        Shared TypeScript types
prisma/
  schema.prisma Database schema
  migrations/   Database migrations
public/         Static assets and favicon
```

## AI Provider Modes

### Mock mode

Use `AI_PROVIDER="mock"` for local development. It provides deterministic, realistic responses without calling Gemini or consuming API credits.

### Gemini mode

Use `AI_PROVIDER="gemini"` with a valid `GEMINI_API_KEY` for real extraction, matching, and recommendations. Monitor API usage and latency before deploying to production.

## Deployment

The application can be deployed as a standard Next.js application, including on Vercel.

1. Provision a PostgreSQL database.
2. Configure the environment variables in the hosting provider.
3. Set `AI_PROVIDER="gemini"` and provide `GEMINI_API_KEY` for production AI analysis.
4. Run the database migration during deployment:

   ```bash
   npx prisma migrate deploy
   ```

5. Build and start the application:

   ```bash
   npm run build
   npm start
   ```

Password reset links are logged to the server console in development because no email delivery provider is configured by default.


