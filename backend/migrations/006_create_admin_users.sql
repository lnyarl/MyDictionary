DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role') THEN
        CREATE TYPE admin_role AS ENUM ('super_admin', 'developer', 'operator');
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role admin_role NOT NULL DEFAULT 'operator',
  must_change_password BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

INSERT INTO admin_users (username, password, role, must_change_password)
VALUES ('admin', '$2b$10$HlgRj4yUJJhCcVeUQr0i8e.9Ed6V1yWBY8g3pu9i25/DpxxglExEq', 'super_admin', TRUE)
ON CONFLICT (username) DO NOTHING;
