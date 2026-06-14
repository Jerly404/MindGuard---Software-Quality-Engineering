#!/usr/bin/env python3
"""
Script para ejecutar pruebas unitarias y funcionales con pytest y pytest-html
Genera reportes HTML detallados y cobertura de código
"""

import os
import subprocess
import sys
from pathlib import Path
from datetime import datetime

def run_tests():
    """Ejecutar pruebas con pytest y generar reporte HTML"""
    
    # Directorio del backend
    backend_dir = Path(__file__).parent
    
    # Crear directorio de reportes si no existe
    reports_dir = backend_dir / "test_reports"
    reports_dir.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    html_report = reports_dir / f"report_{timestamp}.html"
    coverage_report = reports_dir / f"coverage_{timestamp}"
    
    print("\n" + "="*70)
    print("INICIANDO EJECUCIÓN DE PRUEBAS - MindGuard")
    print("="*70)
    print(f"📁 Directorio: {backend_dir}")
    print(f"📊 Reporte HTML: {html_report}")
    print(f"📈 Cobertura: {coverage_report}")
    print("="*70 + "\n")
    
    # Comandos de prueba
    commands = [
        # Pruebas unitarias básicas
        {
            "name": "Pruebas Unitarias",
            "cmd": [
                sys.executable, "-m", "pytest",
                str(backend_dir / "tests" / "test_unit_logic.py"),
                str(backend_dir / "tests" / "test_unit_extended.py"),
                "-v",
                "--tb=short",
                f"--html={html_report}",
                "--self-contained-html",
                "-q"
            ]
        },
        # Pruebas de autenticación
        {
            "name": "Pruebas de Autenticación",
            "cmd": [
                sys.executable, "-m", "pytest",
                str(backend_dir / "tests" / "test_auth.py"),
                "-v",
                "--tb=short",
                f"--html={html_report}",
                "--self-contained-html",
                "-q"
            ]
        },
        # Pruebas de funcionalidad
        {
            "name": "Pruebas de Funcionalidad",
            "cmd": [
                sys.executable, "-m", "pytest",
                str(backend_dir / "tests" / "test_functional.py"),
                "-v",
                "--tb=short",
                f"--html={html_report}",
                "--self-contained-html",
                "-q"
            ]
        },
        # Pruebas de flujo
        {
            "name": "Pruebas de Flujo Completo",
            "cmd": [
                sys.executable, "-m", "pytest",
                str(backend_dir / "tests" / "test_flow.py"),
                "-v",
                "--tb=short",
                f"--html={html_report}",
                "--self-contained-html",
                "-q"
            ]
        },
    ]
    
    # Ejecutar todos los tests con cobertura
    all_tests_cmd = [
        sys.executable, "-m", "pytest",
        str(backend_dir / "tests"),
        "-v",
        "--tb=short",
        f"--html={html_report}",
        "--self-contained-html",
        f"--cov={backend_dir / 'app'}",
        f"--cov-report=html:{coverage_report}",
        f"--cov-report=term",
        "-x",  # Parar en el primer error (opcional)
    ]
    
    print("▶️  Ejecutando TODOS los tests con cobertura...\n")
    
    try:
        # Cambiar al directorio del backend
        os.chdir(backend_dir)
        
        result = subprocess.run(all_tests_cmd, capture_output=False)
        
        if result.returncode == 0:
            print("\n" + "="*70)
            print("✅ PRUEBAS EXITOSAS")
            print("="*70)
            print(f"📊 Reporte HTML: {html_report}")
            print(f"📈 Cobertura: {coverage_report / 'index.html'}")
            print("="*70 + "\n")
        else:
            print("\n" + "="*70)
            print("❌ ALGUNAS PRUEBAS FALLARON")
            print("="*70)
            print(f"📊 Reporte HTML: {html_report}")
            print("="*70 + "\n")
            return result.returncode
            
    except Exception as e:
        print(f"\n❌ Error ejecutando pruebas: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(run_tests())
