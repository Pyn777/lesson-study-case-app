# Interdisciplinary Case Study App

Next.js application for a longitudinal interdisciplinary biology Lesson Study built around a shared summer-camp gastrointestinal outbreak case.

## Current capabilities
- General Biology / A&P I, Microbiology, and A&P II case modules
- Integrated assessment
- Persistent Neon/Postgres response storage
- Anonymous Study IDs and session metadata
- Longitudinal anchor questions and item metadata
- Response-time, retake, and duplicate-submission tracking
- Accumulating case record across disciplines
- Instructor controls for active modules and anchor questions
- Protected instructor dashboard with filters, trends, repeated-measures views, and CSV export
- Privacy/data-use notice and downloadable data dictionary

## Privacy and data use
Participants should use only assigned anonymous Study IDs. Names, email addresses, college IDs, phone numbers, or other directly identifying information should not be entered into study fields.

The study database is designed for instructional metadata, assessment responses, timing measures, and technical submission identifiers. See:
- `/privacy` in the deployed app
- `docs/research-readiness.md`
- `docs/data-dictionary.md`

These safeguards support instructional Lesson Study and data quality but do not replace applicable institutional review, consent, privacy, records-retention, or data-governance procedures for formal research or publication.

## Run locally
```bash
npm install
npm run dev
```

Required environment variables:
- `DATABASE_URL`
- `INSTRUCTOR_KEY`

## Deployment
Designed for GitHub + Vercel with Neon/Postgres.
