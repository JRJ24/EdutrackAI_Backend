-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "academics";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "quizz";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "system";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "users";

-- CreateTable
CREATE TABLE "users"."User" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "student_code" TEXT NOT NULL,
    "career" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "lastLogin" TIMESTAMP(3),
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."Roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."AcademicProfile" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "academic_level" TEXT NOT NULL,
    "learning_style" TEXT NOT NULL,
    "preferred_study_time" TEXT NOT NULL,
    "weekly_study_goal_hours" INTEGER NOT NULL,
    "main_difficulties" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Subject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users"."UserSubject" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "current_average" TEXT NOT NULL,
    "difficulty_level" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "UserSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizz"."Quizzies" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "time_limit_minutes" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "create_by" TEXT NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quizzies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizz"."QuizAttempts" (
    "id" TEXT NOT NULL,
    "quizz_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "score" DECIMAL(65,30) NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "correct_answers" INTEGER NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "finished_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizAttempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizz"."Questions" (
    "id" TEXT NOT NULL,
    "quizz_id" TEXT NOT NULL,
    "question_text" TEXT NOT NULL,
    "question_type" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "topic" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,

    CONSTRAINT "Questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizz"."QuestionOptions" (
    "id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "option_text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "QuestionOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizz"."StudenAnswers" (
    "id" TEXT NOT NULL,
    "quiz_attempt_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "selected_option_id" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,

    CONSTRAINT "StudenAnswers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academics"."Grades" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "grade_value" DECIMAL(65,30) NOT NULL,
    "grade_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academics"."StudySessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "ended_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "study_method" TEXT NOT NULL,
    "productivity_rating" INTEGER NOT NULL,

    CONSTRAINT "StudySessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Resouces" (
    "id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "resource_type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resouces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academics"."Recommendations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subject_id" TEXT NOT NULL,
    "resource_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."Notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL,
    "schedule_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system"."AuditLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_name" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academics"."GradeChange" (
    "id" TEXT NOT NULL,
    "grade_id" TEXT NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "old_value" DECIMAL(65,30) NOT NULL,
    "new_value" DECIMAL(65,30) NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GradeChange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."LoginHistory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "email" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "failure_reason" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_student_code_key" ON "users"."User"("student_code");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "users"."User"("email");

-- AddForeignKey
ALTER TABLE "users"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "auth"."Roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."AcademicProfile" ADD CONSTRAINT "AcademicProfile_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."UserSubject" ADD CONSTRAINT "UserSubject_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users"."UserSubject" ADD CONSTRAINT "UserSubject_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."Quizzies" ADD CONSTRAINT "Quizzies_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."Quizzies" ADD CONSTRAINT "Quizzies_create_by_fkey" FOREIGN KEY ("create_by") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."QuizAttempts" ADD CONSTRAINT "QuizAttempts_quizz_id_fkey" FOREIGN KEY ("quizz_id") REFERENCES "quizz"."Quizzies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."QuizAttempts" ADD CONSTRAINT "QuizAttempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."Questions" ADD CONSTRAINT "Questions_quizz_id_fkey" FOREIGN KEY ("quizz_id") REFERENCES "quizz"."Quizzies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."QuestionOptions" ADD CONSTRAINT "QuestionOptions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quizz"."Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."StudenAnswers" ADD CONSTRAINT "StudenAnswers_quiz_attempt_id_fkey" FOREIGN KEY ("quiz_attempt_id") REFERENCES "quizz"."QuizAttempts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."StudenAnswers" ADD CONSTRAINT "StudenAnswers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "quizz"."Questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizz"."StudenAnswers" ADD CONSTRAINT "StudenAnswers_selected_option_id_fkey" FOREIGN KEY ("selected_option_id") REFERENCES "quizz"."QuestionOptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."Grades" ADD CONSTRAINT "Grades_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."Grades" ADD CONSTRAINT "Grades_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."StudySessions" ADD CONSTRAINT "StudySessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."StudySessions" ADD CONSTRAINT "StudySessions_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Resouces" ADD CONSTRAINT "Resouces_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."Recommendations" ADD CONSTRAINT "Recommendations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."Recommendations" ADD CONSTRAINT "Recommendations_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "system"."Subject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."Recommendations" ADD CONSTRAINT "Recommendations_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "system"."Resouces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."Notifications" ADD CONSTRAINT "Notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system"."AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."GradeChange" ADD CONSTRAINT "GradeChange_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "academics"."Grades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academics"."GradeChange" ADD CONSTRAINT "GradeChange_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "users"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."LoginHistory" ADD CONSTRAINT "LoginHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
