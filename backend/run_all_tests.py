"""
Script para ejecutar todos los tests y generar reporte integrado
Uso: python run_all_tests.py
"""

import subprocess
import sys
import os
from pathlib import Path
from datetime import datetime

def run_all_tests():
    """Ejecutar todos los tests y generar reportes"""
    
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    reports_dir = backend_dir / "test_reports"
    reports_dir.mkdir(exist_ok=True)
    
    html_report = reports_dir / f"report_{timestamp}.html"
    coverage_report = reports_dir / f"coverage_{timestamp}"
    
    print("\n" + "="*80)
    print("🚀 EJECUCIÓN COMPLETA DE PRUEBAS - MindGuard Backend")
    print("="*80)
    print(f"📁 Workspace: {backend_dir}")
    print(f"📊 Reporte HTML: {html_report}")
    print(f"📈 Cobertura: {coverage_report}")
    print("="*80 + "\n")
    
    # Comando completo con cobertura y reporte HTML
    cmd = [
        sys.executable, "-m", "pytest",
        "tests",
        "-v",
        "--tb=short",
        "--color=yes",
        f"--html={html_report}",
        "--self-contained-html",
        f"--cov=app",
        f"--cov-report=html:{coverage_report}",
        f"--cov-report=term-missing",
        "--cov-report=term",
        "-ra",  # Show extra summary info
        "--capture=no",  # Show print statements
    ]
    
    print("▶️  Ejecutando pytest...\n")
    
    try:
        result = subprocess.run(cmd, cwd=backend_dir)
        
        if result.returncode == 0:
            print("\n" + "="*80)
            print("✅ TODAS LAS PRUEBAS PASARON EXITOSAMENTE")
            print("="*80)
            print(f"\n📊 Reportes generados:")
            print(f"   • HTML: {html_report}")
            print(f"   • Cobertura: {coverage_report / 'index.html'}")
            print(f"\n💡 Para ver los reportes:")
            print(f"   • Abre {html_report} en el navegador")
            print(f"   • Abre {coverage_report / 'index.html'} para cobertura")
            print("="*80 + "\n")
        else:
            print("\n" + "="*80)
            print("❌ ALGUNAS PRUEBAS FALLARON")
            print("="*80)
            print(f"\n📊 Ver reporte en: {html_report}")
            print("="*80 + "\n")
            return result.returncode
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        return 1
    
    return 0

if __name__ == "__main__":
    sys.exit(run_all_tests())
