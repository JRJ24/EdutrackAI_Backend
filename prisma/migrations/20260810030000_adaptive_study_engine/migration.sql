-- Adaptive study engine: evaluations, generated plan activities and explainable risk history.

CREATE TABLE "academics"."Evaluation" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "subject_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "evaluation_type" TEXT NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "weight" DECIMAL(65,30),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academics"."StudyPlanActivity" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "engine_key" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "evaluation_id" TEXT,
    "recommendation_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "activity_type" TEXT NOT NULL,
    "topic" TEXT,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "priority_score" INTEGER NOT NULL,
    "priority_level" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "source" TEXT NOT NULL DEFAULT 'adaptive_engine',
    "reason" TEXT NOT NULL,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyPlanActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "academics"."RiskSnapshot" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "level" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "reasons" JSONB NOT NULL,
    "trigger" TEXT NOT NULL,
    "evaluated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudyPlanActivity_engine_key_key"
ON "academics"."StudyPlanActivity"("engine_key");

CREATE INDEX "Evaluation_subject_id_scheduled_at_idx"
ON "academics"."Evaluation"("subject_id", "scheduled_at");

CREATE INDEX "StudyPlanActivity_user_id_scheduled_for_idx"
ON "academics"."StudyPlanActivity"("user_id", "scheduled_for");

CREATE INDEX "StudyPlanActivity_user_id_status_idx"
ON "academics"."StudyPlanActivity"("user_id", "status");

CREATE INDEX "RiskSnapshot_user_id_evaluated_at_idx"
ON "academics"."RiskSnapshot"("user_id", "evaluated_at");

CREATE INDEX "RiskSnapshot_user_id_subject_id_evaluated_at_idx"
ON "academics"."RiskSnapshot"("user_id", "subject_id", "evaluated_at");

ALTER TABLE "academics"."Evaluation"
ADD CONSTRAINT "Evaluation_subject_id_fkey"
FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academics"."Evaluation"
ADD CONSTRAINT "Evaluation_created_by_fkey"
FOREIGN KEY ("created_by") REFERENCES "users"."User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academics"."StudyPlanActivity"
ADD CONSTRAINT "StudyPlanActivity_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"."User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academics"."StudyPlanActivity"
ADD CONSTRAINT "StudyPlanActivity_subject_id_fkey"
FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academics"."StudyPlanActivity"
ADD CONSTRAINT "StudyPlanActivity_evaluation_id_fkey"
FOREIGN KEY ("evaluation_id") REFERENCES "academics"."Evaluation"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "academics"."StudyPlanActivity"
ADD CONSTRAINT "StudyPlanActivity_recommendation_id_fkey"
FOREIGN KEY ("recommendation_id") REFERENCES "academics"."Recommendations"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "academics"."RiskSnapshot"
ADD CONSTRAINT "RiskSnapshot_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"."User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "academics"."RiskSnapshot"
ADD CONSTRAINT "RiskSnapshot_subject_id_fkey"
FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
