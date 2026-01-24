-- Crear tabla de sesiones de usuario
CREATE TABLE IF NOT EXISTS user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    "sessionToken" VARCHAR(255) NOT NULL UNIQUE,
    "userAgent" VARCHAR(255),
    "ipAddress" VARCHAR(45),
    "isActive" BOOLEAN DEFAULT true,
    "lastActivityAt" TIMESTAMP,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_active ON user_sessions("userId", "isActive");
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions("sessionToken");
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions("expiresAt");

-- Comentarios
COMMENT ON TABLE user_sessions IS 'Tabla de sesiones activas de usuarios para control de sesión única';
COMMENT ON COLUMN user_sessions."sessionToken" IS 'Token único de sesión (hash del JWT)';
COMMENT ON COLUMN user_sessions."isActive" IS 'Indica si la sesión está activa';
COMMENT ON COLUMN user_sessions."lastActivityAt" IS 'Última actividad registrada en esta sesión';
COMMENT ON COLUMN user_sessions."expiresAt" IS 'Fecha de expiración de la sesión';
