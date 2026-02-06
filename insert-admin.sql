-- Buat akun admin
-- Email: adminsisfor@uisi.ac.id
-- Password: sisfor123

INSERT INTO "Admin" (email, password, name, role, "createdAt", "updatedAt")
VALUES (
  'adminsisfor@uisi.ac.id',
  '$2b$10$MuPnQE2e9Gs0ekbMNYTQA.ZB4ZwEbOJ5ISv4z0SXIC/tbkkNMaWPe',
  'Admin Sisfor UISI',
  'admin',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
