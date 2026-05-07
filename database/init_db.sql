-- Database Schema for MindGuard IA
-- Translated to Standard SQL (SQLite compatible)

-- 1. Table Usuario
CREATE TABLE Usuario (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Added for security
    rol VARCHAR(50),
    twoFactorEnabled BOOLEAN DEFAULT 0
);

-- 2. Table Recurso
CREATE TABLE Recurso (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT,
    id_usuario_administrador INTEGER,
    FOREIGN KEY (id_usuario_administrador) REFERENCES Usuario(id)
);

-- 3. Table Cuestionario
CREATE TABLE Cuestionario (
    id VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo_cuestionario VARCHAR(20) -- PHQ9 or GAD7
);

-- 4. Table Evaluacion
CREATE TABLE Evaluacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    phq9Score INTEGER,
    gad7Score INTEGER,
    nivelRiesgo VARCHAR(50),
    resultadoIA TEXT,
    id_usuario INTEGER NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id) ON DELETE CASCADE
);

-- 5. Table Evaluacion_Cuestionario
CREATE TABLE Evaluacion_Cuestionario (
    id_evaluacion INTEGER,
    id_cuestionario VARCHAR(50),
    PRIMARY KEY (id_evaluacion, id_cuestionario),
    FOREIGN KEY (id_evaluacion) REFERENCES Evaluacion(id),
    FOREIGN KEY (id_cuestionario) REFERENCES Cuestionario(id)
);

-- 6. Table ModeloIA
CREATE TABLE ModeloIA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombreModelo VARCHAR(100),
    version VARCHAR(20)
);

-- 7. Table ResultadoIA
CREATE TABLE ResultadoIA (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nivel VARCHAR(10) CHECK (nivel IN ('BAJO', 'MEDIO', 'ALTO')),
    scoreConfianza FLOAT,
    id_evaluacion INTEGER UNIQUE,
    FOREIGN KEY (id_evaluacion) REFERENCES Evaluacion(id)
);

-- 8. Table Recomendacion
CREATE TABLE Recomendacion (
    id VARCHAR(50) PRIMARY KEY,
    descripcion TEXT,
    nivelRiesgo VARCHAR(50),
    id_evaluacion INTEGER,
    FOREIGN KEY (id_evaluacion) REFERENCES Evaluacion(id)
);
