# Lesson Study Data Dictionary

The application exports one row per question response. Study IDs are intended to be anonymous participant codes, not names or institutional identifiers.

| Field | Meaning |
| --- | --- |
| studyId | Anonymous longitudinal participant code |
| submissionId | Unique checkpoint submission identifier used for duplicate protection |
| sessionId | Browser study-session identifier |
| semester | Academic term |
| cohort | Optional instructor-defined cohort |
| course | Course associated with the session |
| section | Optional course section |
| instructor | Optional instructor label |
| deliveryMode | Online, On-ground, or Hybrid |
| module | Case-study module identifier |
| questionId | Stable item identifier |
| conceptTag | Fine-grained content tag |
| anchorId | Longitudinal anchor family; blank for non-anchor responses |
| construct | Broader construct associated with the item |
| cognitiveLevel | Intended cognitive level |
| itemRole | Discipline, anchor, or transfer role |
| discipline | Disciplinary lens |
| transferType | Foundational, near-transfer, cross-disciplinary, or far-transfer |
| choiceIndex | Zero-based selected answer index |
| correct | Keyed correctness |
| attempt | Server-assigned canonical attempt number |
| clientAttempt | Browser-side attempt counter; diagnostic only |
| attemptType | Initial or retake |
| firstAnswerMs | Time from question-set load to first selection |
| decisionMs | Interval between successive first selections |
| moduleElapsedMs | Total time from question-set load to submission |
| answerChanges | Number of answer changes for the item |
| rapidResponseFlag | Review flag for a very short decision interval |
| submittedAt | Client-side submission timestamp |
| receivedAt | Database receipt timestamp |

## Interpretation cautions

- Rapid-response flags are review signals, not proof of guessing or misconduct.
- Response-time variables should be interpreted with accuracy rather than as standalone measures of learning.
- Group-level trends are not automatically matched pre/post effects.
- Retakes are preserved and labeled rather than overwritten.
