-- Student academic context for institution/program onboarding.
CREATE TABLE users."StudentContext" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "institution_key" TEXT NOT NULL,
    "institution_name" TEXT NOT NULL,
    "program_key" TEXT NOT NULL,
    "program_name" TEXT NOT NULL,
    "current_period" INTEGER NOT NULL,
    "source_url" TEXT,
    "onboarding_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentContext_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentContext_user_id_key"
ON users."StudentContext"("user_id");

ALTER TABLE users."StudentContext"
ADD CONSTRAINT "StudentContext_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES users."User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE users."UserSubject"
ADD COLUMN "curriculum_code" TEXT,
ADD COLUMN "curriculum_period" INTEGER,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual';

CREATE INDEX "UserSubject_user_id_status_idx"
ON users."UserSubject"("user_id", "status");
