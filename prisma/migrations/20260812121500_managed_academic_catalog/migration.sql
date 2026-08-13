-- Admin-managed academic catalog. Official code-curated catalogs remain intact;
-- these tables allow administrators to add institutions, programs and subjects
-- without a code deployment.
CREATE TABLE academics."ManagedInstitution" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "short_name" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'República Dominicana',
    "website_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManagedInstitution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManagedInstitution_key_key"
ON academics."ManagedInstitution"("key");

CREATE TABLE academics."ManagedProgram" (
    "id" TEXT NOT NULL,
    "institution_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "degree_type" TEXT NOT NULL DEFAULT 'Programa académico',
    "total_credits" INTEGER NOT NULL DEFAULT 0,
    "periods" INTEGER NOT NULL DEFAULT 1,
    "source_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManagedProgram_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManagedProgram_institution_id_key_key"
ON academics."ManagedProgram"("institution_id", "key");
CREATE UNIQUE INDEX "ManagedProgram_institution_id_name_key"
ON academics."ManagedProgram"("institution_id", "name");

ALTER TABLE academics."ManagedProgram"
ADD CONSTRAINT "ManagedProgram_institution_id_fkey"
FOREIGN KEY ("institution_id") REFERENCES academics."ManagedInstitution"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE academics."ManagedCatalogSubject" (
    "id" TEXT NOT NULL,
    "program_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "period" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManagedCatalogSubject_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ManagedCatalogSubject_program_id_key_key"
ON academics."ManagedCatalogSubject"("program_id", "key");
CREATE UNIQUE INDEX "ManagedCatalogSubject_program_id_name_key"
ON academics."ManagedCatalogSubject"("program_id", "name");

ALTER TABLE academics."ManagedCatalogSubject"
ADD CONSTRAINT "ManagedCatalogSubject_program_id_fkey"
FOREIGN KEY ("program_id") REFERENCES academics."ManagedProgram"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
