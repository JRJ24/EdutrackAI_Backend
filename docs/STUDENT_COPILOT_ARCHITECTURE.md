# EduTrack Student Copilot Architecture

## Product boundary

EduTrack is an adaptive academic companion. It uses institutional context, the student's current subjects, academic events and learning activity to decide what is useful to do next.

It is not intended to replace a university ERP. Enrollment payments, official transcripts, institutional attendance control and administrative workflows stay outside this student experience.

## Student flow

Institution / program / period
→ current subjects confirmed by the student
→ grades, quizzes, evaluations and study activity
→ adaptive analysis
→ one student-facing next action (`EduTrack Pulse`)
→ focused learning activity
→ result / study session
→ recalculation.

## Academic context

`StudentContext` stores the student's current institution, program and period. `UserSubject` remains the operational link to the subjects the student is actually taking and now includes curriculum/source metadata.

Institutional catalogs are explicit, versionable code data with a public source URL. The first catalog is ITLA's Tecnólogo en Desarrollo de Software plan of study. Students can still use manual setup when their institution is not cataloged.

## Copilot

The current copilot is contextual and deterministic. It does not pretend to be a generative LLM. It combines the existing adaptive engine, nearest evaluation, active subjects, recent study metrics and simple intent parsing to answer practical questions such as:

- What should I study now?
- I have 30 minutes; what should I do?
- What is pending?
- I do not understand this topic.

The frontend does not expose raw risk scoring as the primary student experience. Scores and components remain useful internally and for administrative/explainability views.

## Learning resources

Resource discovery follows two rules:

1. Existing course resources can be returned only when they have a real URL; placeholder `example.com` links are excluded.
2. External discovery points to transparent searches on real providers such as YouTube, MDN Web Docs, Microsoft Learn, PostgreSQL and Khan Academy depending on subject/topic.

A provider search is not presented as a hand-curated article. The provider and source kind are returned explicitly so the UI can show where a result comes from.

## Focus mode

A plan activity can be opened as a Focus session. The student sees one objective, relevant resources, an optional quiz and a short self-evaluation. Completing the session records real study activity, after which the adaptive engine can recalculate the next action.

## Migration

The redesign adds `20260811090000_student_context`. Apply it only after Prisma generation/build validation succeeds in the target branch and before runtime testing of the new onboarding.
