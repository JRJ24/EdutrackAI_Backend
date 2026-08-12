# EduTrack AI — final presentation readiness

The presentation branch is considered technically ready only when these rules hold together:

1. Registration can preserve institution/program context and onboarding completes the student's real subject list.
2. A period is a reference, not an enrollment boundary; mixed-period course selections remain valid.
3. EduTrack Pulse and the copilot use actual student context. A deadline or activity title must never replace a topic explicitly written by the student.
4. Explicit topics can infer an appropriate active subject when there is a strong domain match. In particular, `MAUI`, XAML and mobile-app terms resolve to an active mobile-applications subject instead of inheriting an unrelated priority subject. If no reliable match exists, EduTrack asks for the subject rather than guessing.
5. Resource discovery receives a concrete academic topic and keeps provider/source transparency.
6. The reusable demo student is bootstrapped on login only when its academic context is missing/incomplete; an already configured demo is not reset on every login.
7. Admin can synchronize official catalog subjects, then manage evaluations, resources, recommendations, notifications and quizzes from operational records.
8. Quizzes are draft-first. Students only receive active quizzes whose questions have enough options and a correct answer.
9. Quiz attempt scores are persisted on a 0–100 scale so dashboard/adaptive signals share one semantic scale.
10. Student grade ownership remains enforced and Admin retains the global academic-management path.
11. The existing `20260811090000_student_context` migration is sufficient for this set of changes; no additional database migration is required.
12. No automatic merge is performed. The previous adaptive branch remains the frozen reference base.

Final browser verification should cover: demo login without onboarding → `No entiendo MAUI` → contextual resources → Admin catalog/content authoring → publish a complete quiz → student attempt → progress/Pulse update.
