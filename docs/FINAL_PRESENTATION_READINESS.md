# EduTrack AI — final presentation readiness

The presentation branch is considered technically ready only when these rules hold together:

1. Registration can preserve institution/program context and onboarding completes the student's real subject list.
2. A period is a reference, not an enrollment boundary; mixed-period course selections remain valid.
3. EduTrack Pulse and the copilot use actual student context. A deadline or activity title must never replace a topic explicitly written by the student.
4. Resource discovery receives a concrete academic topic and keeps provider/source transparency.
5. Admin can inspect official catalogs and can also create persistent institutions, programs/careers and curriculum subjects from the UI. Once a managed program has subjects, it becomes available to registration/onboarding.
6. Admin can synchronize catalog subjects into operational subjects, then manage evaluations, resources, recommendations, notifications and quizzes.
7. Quizzes are draft-first. Students only receive active quizzes whose questions have enough options and a correct answer.
8. Quiz attempt scores are persisted on a 0–100 scale so dashboard/adaptive signals share one semantic scale.
9. Email alerts are proactive rather than Admin-dependent: near evaluations, student deadlines, inactivity, weak recent quizzes and high adaptive priority can create notifications automatically.
10. Academic emails use a branded HTML template and are sent only to verified student addresses. Registration/login can issue a verification email without adding a new database migration.
11. The proactive scheduler runs shortly after backend startup and then hourly by default, while event changes can trigger checks immediately and dedupe prevents same-day spam.
12. Student grade ownership remains enforced and Admin retains the global academic-management path.
13. The managed-catalog feature adds migration `20260812121500_managed_academic_catalog`; it must be applied after pulling this head.
14. No automatic merge is performed. The previous adaptive branch remains the frozen reference base.

Final browser verification should cover: email verification → automatic evaluation/deadline alert → branded Gmail delivery → Admin creates institution → career → subject → student registration sees that managed catalog → onboarding → Home/Pulse → explicit-topic copilot query → resources → Modo concentración → Admin content/quiz authoring → student attempt → progress/Pulse update.

This document also triggers the final backend quality run for the proactive-notification hardening pass.
