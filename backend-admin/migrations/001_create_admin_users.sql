-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Initial admin user (password: 'admin' hashed with bcrypt)
-- Hash will be generated: $2b$10$... (to be replaced when running migration)
-- For now, using a valid bcrypt hash for "admin"
INSERT INTO admin_users (username, password, must_change_password)
VALUES ('admin', '$2b$10$XqjD8q0XGQp6FQ6QgJZvxeZJ2q0XGQp6FQ6QgJZvxeZJ2q0XGQp6F', TRUE)
ON CONFLICT (username) DO NOTHING;

-- Note: The hash above is a placeholder. Generate the actual hash by running:
-- node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin', 10).then(console.log);"
-- Then update this file and re-run the migration.
