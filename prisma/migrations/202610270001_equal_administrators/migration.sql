-- All authenticated administrators now share the same access level.
-- Accounts, password hashes and sessions are preserved.
DROP INDEX IF EXISTS "AdminUser_active_role_idx";
ALTER TABLE "AdminUser" DROP COLUMN "role";
DROP TYPE "AdminRole";
CREATE INDEX "AdminUser_active_idx" ON "AdminUser"("active");
