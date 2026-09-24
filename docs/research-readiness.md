# Research and Privacy Readiness

This app is designed for instructional Lesson Study and longitudinal classroom analysis using anonymous Study IDs.

## Data minimization

The study database is designed to store anonymous Study IDs, instructional metadata, assessment responses, timing measures, and technical submission identifiers. Students should not enter names, email addresses, college IDs, phone numbers, or other directly identifying information.

The application does not intentionally add names, email addresses, college IDs, or IP addresses as study-database fields.

## Privacy notice

A public Privacy & Data Use page describes the data fields and interpretation limits. The session form requires a privacy acknowledgment reminding participants to use only an anonymous study code. This acknowledgment is not a research-consent form.

## Data quality

- Unique submission IDs prevent the same network submission from being stored twice.
- Retakes receive server-assigned canonical attempt numbers.
- Submission audit records preserve the sequence of accepted submissions.
- Existing responses are not silently overwritten when instructor settings change.

## Research use

These controls improve data quality and documentation, but they do not determine whether a project is human-subjects research and they do not replace institution-approved consent, IRB, privacy, records-retention, or data-governance procedures. The research team should follow applicable institutional requirements before formal research, publication, or external dissemination.

## Exports

The instructor dashboard provides:
1. filtered question-level CSV,
2. longitudinal Study-ID/module summary CSV, and
3. a downloadable data dictionary CSV.

See `docs/data-dictionary.md` for field definitions.
