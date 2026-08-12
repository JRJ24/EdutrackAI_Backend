# EduTrack Student Copilot Architecture

## Product boundary

EduTrack is an adaptive academic companion. It uses institutional context, the student's current subjects, academic events and learning activity to decide what is useful to do next.

It is not intended to replace a university ERP. Enrollment payments, official transcripts, institutional attendance control and administrative workflows stay outside this student experience.

## Student flow

Institution / program / reference period
→ current subjects confirmed by the student (including mixed periods when necessary)
→ grades, quizzes, deadlines, class materials, evaluations and study activity
→ adaptive analysis
→ one student-facing next action (`EduTrack Pulse`)
→ focused learning activity
→ result / study session
→ recalculation.

## Academic context

`StudentContext` stores the student's current institution, program and reference period. `UserSubject` remains the operational link to the subjects the student is actually taking and includes curriculum/source metadata.

The reference period is not an enrollment boundary. A student can be in period 6 while taking subjects from periods 5 and 6. The final active `UserSubject` set is the source of truth for the real semester.

Institutional catalogs are explicit, versionable data with a public source URL. The ITLA catalog currently includes official plans for Desarrollo de Software, Redes de Información, Inteligencia Artificial and Seguridad Informática. Students can still use manual setup when their institution/program is not cataloged.

## Copilot

The current copilot is contextual and deterministic. It does not pretend to be a generative LLM. It combines the existing adaptive engine, nearest evaluation/deadline, active subjects, recent study metrics and intent parsing to answer practical questions such as:

- What should I study now?
- I have 30 minutes; what should I do?
- What is pending?
- I do not understand this topic.

When a student asks for help with a subject but does not provide a concrete topic, the copilot does not turn the whole sentence into an external search. It asks for the missing topic or uses a recent topic already grounded in the student's academic context.

The frontend does not expose raw risk scoring as the primary student experience. Scores and components remain useful internally and for administrative/explainability views.

## Learning resources

Resource discovery follows a grounding order:

1. Student/professor class materials with real URLs.
2. Existing course resources with real URLs; placeholder `example.com` links are excluded.
3. Transparent external providers selected according to subject domain and concrete topic.

External provider selection is contextual rather than universal. Examples include Microsoft Learn for .NET/mobile topics, MDN for web technologies, PostgreSQL for database topics, Khan Academy for mathematics/science, OWASP/PortSwigger for security, Cisco for networks, Kaggle/Microsoft Learn for AI, and British Council for English.

A provider search is not presented as a hand-curated article. The provider and source kind are returned explicitly so the UI can show where a result comes from.

## Practice fallback

A student-facing practice screen must not be empty merely because the adaptive engine has not generated a plan yet or because no quiz exists. Active subjects remain actionable entry points for review/resources while EduTrack gathers enough context for a stronger recommendation.

## Focus mode

A plan activity can be opened as a Focus session. The student sees one objective, relevant resources, an optional quiz and a short self-evaluation. Completing the session records real study activity, after which the adaptive engine can recalculate the next action.

## Outbound communication

Email/push communication is intentionally treated as an adapter outside the adaptive decision engine. The engine should produce academic notifications; delivery channels can be added through configured providers without making the student experience depend on a specific email vendor. No email provider credentials are embedded in the repository.

## Migration

The redesign adds `20260811090000_student_context`. The migration has been applied to the current demo Neon environment. Future environments still need to run the repository migrations before runtime testing.
