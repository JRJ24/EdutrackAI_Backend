# EduTrack AI — final presentation readiness

The presentation branch is considered technically ready only when these rules hold together:

1. Registration can preserve institution/program context and onboarding completes the student's real subject list.
2. A period is a reference, not an enrollment boundary; mixed-period course selections remain valid.
3. EduTrack Pulse and the copilot use actual student context. A deadline or activity title must never replace a topic explicitly written by the student.
4. Resource discovery receives a concrete academic topic and keeps provider/source transparency.
5. Admin can synchronize official catalog subjects, then manage evaluations, resources, recommendations, notifications and quizzes from operational records.
6. Quizzes are draft-first. Students only receive active quizzes whose questions have enough options and a correct answer.
7. Quiz attempt scores are persisted on a 0–100 scale so dashboard/adaptive signals share one semantic scale.
8. Student grade ownership remains enforced and Admin retains the global academic-management path.
9. The existing `20260811090000_student_context` migration is sufficient for this set of changes; no additional database migration is required.
10. No automatic merge is performed. The previous adaptive branch remains the frozen reference base.

Final browser verification should cover: new registration → onboarding → Home/Pulse → explicit-topic copilot query → resources → Admin catalog sync/content authoring → publish a complete quiz → student attempt → progress/Pulse update.
