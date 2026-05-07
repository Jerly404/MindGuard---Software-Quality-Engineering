from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, CheckConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "Usuario"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50))
    twoFactorEnabled = Column(Boolean, default=False)
    
    evaluaciones = relationship("Evaluacion", back_populates="usuario")

class Cuestionario(Base):
    __tablename__ = "Cuestionario"
    id = Column(String(50), primary_key=True)
    nombre = Column(String(100), nullable=False)
    tipo_cuestionario = Column(String(20))

class Evaluacion(Base):
    __tablename__ = "Evaluacion"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    phq9Score = Column(Integer)
    gad7Score = Column(Integer)
    nivelRiesgo = Column(String(50))
    resultadoIA = Column(Text)
    notas_personales = Column(Text, nullable=True)
    has_high_risk = Column(Boolean, default=False) # Nuevo campo de seguridad
    id_usuario = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    
    usuario = relationship("Usuario", back_populates="evaluaciones")
    resultado_ia_detail = relationship("ResultadoIA", back_populates="evaluacion", uselist=False)

class RegistroEmocional(Base):
    __tablename__ = "RegistroEmocional"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    emocion_principal = Column(String(50)) # ej: Feliz, Triste, Ansioso, Enojado
    intensidad = Column(Integer) # 1 al 10
    disparador = Column(String(200), nullable=True) # ¿Qué causó esto?
    id_usuario = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    
    usuario = relationship("Usuario")

class ResultadoIA(Base):
    __tablename__ = "ResultadoIA"
    id = Column(Integer, primary_key=True, index=True)
    nivel = Column(String(10))
    scoreConfianza = Column(Float)
    id_evaluacion = Column(Integer, ForeignKey("Evaluacion.id"), unique=True)
    
    evaluacion = relationship("Evaluacion", back_populates="resultado_ia_detail")
    __table_args__ = (CheckConstraint(nivel.in_(['BAJO', 'MEDIO', 'ALTO']), name='check_nivel'),)

class Recurso(Base):
    __tablename__ = "Recurso"
    id = Column(String(50), primary_key=True)
    titulo = Column(String(200), nullable=False)
    contenido = Column(Text)
    id_usuario_administrador = Column(Integer, ForeignKey("Usuario.id"))

class AsignacionProfesional(Base):
    __tablename__ = "AsignacionProfesional"
    id = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    id_profesional = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    fecha_inicio = Column(DateTime, default=datetime.utcnow)
    activa = Column(Boolean, default=True)

    paciente = relationship("Usuario", foreign_keys=[id_paciente])
    profesional = relationship("Usuario", foreign_keys=[id_profesional])

class TransaccionMock(Base):
    __tablename__ = "TransaccionMock"
    id = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    monto = Column(Float, nullable=False)
    fecha = Column(DateTime, default=datetime.utcnow)
    estado = Column(String(50), default="completado") # pendiente, completado, fallido
    
    usuario = relationship("Usuario")
