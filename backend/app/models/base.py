from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class Usuario(Base):
    __tablename__ = "Usuario"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    rol = Column(String(50))
    twoFactorEnabled = Column(Boolean, default=False)
    colegiatura = Column(String(50), nullable=True)
    especialidad = Column(String(100), nullable=True)

    evaluaciones = relationship("Evaluacion", back_populates="usuario", cascade="all, delete-orphan")
    registros_emocionales = relationship("RegistroEmocional", back_populates="usuario", cascade="all, delete-orphan")
    transacciones = relationship(
        "TransaccionMock",
        back_populates="usuario",
        cascade="all, delete-orphan",
        foreign_keys="TransaccionMock.id_usuario",
    )
    citas_como_paciente = relationship(
        "Cita", back_populates="paciente", cascade="all, delete-orphan", foreign_keys="Cita.id_paciente"
    )
    citas_como_profesional = relationship(
        "Cita", back_populates="profesional", cascade="all, delete-orphan", foreign_keys="Cita.id_profesional"
    )


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
    has_high_risk = Column(Boolean, default=False)
    id_usuario = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)

    usuario = relationship("Usuario", back_populates="evaluaciones")
    resultado_ia_detail = relationship(
        "ResultadoIA", back_populates="evaluacion", uselist=False, cascade="all, delete-orphan"
    )


class RegistroEmocional(Base):
    __tablename__ = "RegistroEmocional"
    id = Column(Integer, primary_key=True, index=True)
    fecha = Column(DateTime, default=datetime.utcnow)
    emocion_principal = Column(String(50))
    intensidad = Column(Integer)
    disparador = Column(String(200), nullable=True)
    id_usuario = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)

    usuario = relationship("Usuario", back_populates="registros_emocionales")


class ResultadoIA(Base):
    __tablename__ = "ResultadoIA"
    id = Column(Integer, primary_key=True, index=True)
    nivel = Column(String(10))
    scoreConfianza = Column(Float)
    id_evaluacion = Column(Integer, ForeignKey("Evaluacion.id", ondelete="CASCADE"), unique=True)

    evaluacion = relationship("Evaluacion", back_populates="resultado_ia_detail")
    __table_args__ = (CheckConstraint(nivel.in_(["BAJO", "MEDIO", "ALTO"]), name="check_nivel"),)


class Recurso(Base):
    __tablename__ = "Recurso"
    id = Column(String(50), primary_key=True)
    titulo = Column(String(200), nullable=False)
    contenido = Column(Text)
    id_usuario_administrador = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"))


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
    id_profesional = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=True)
    monto = Column(Float, nullable=False)
    metodo_pago = Column(String(50), default="tarjeta")
    fecha = Column(DateTime, default=datetime.utcnow)
    estado = Column(String(50), default="completado")

    usuario = relationship("Usuario", back_populates="transacciones", foreign_keys=[id_usuario])


class Cita(Base):
    __tablename__ = "Cita"
    id = Column(Integer, primary_key=True, index=True)
    id_paciente = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    id_profesional = Column(Integer, ForeignKey("Usuario.id", ondelete="CASCADE"), nullable=False)
    fecha_cita = Column(DateTime, nullable=False)
    link_reunion = Column(String(255), nullable=True)
    mensaje_seguimiento = Column(Text, nullable=True)
    estado = Column(String(20), default="programada")
    fecha_creacion = Column(DateTime, default=datetime.utcnow)

    paciente = relationship("Usuario", foreign_keys=[id_paciente], back_populates="citas_como_paciente")
    profesional = relationship("Usuario", foreign_keys=[id_profesional], back_populates="citas_como_profesional")
