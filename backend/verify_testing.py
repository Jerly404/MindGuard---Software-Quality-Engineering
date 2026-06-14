#!/usr/bin/env python3
"""
Script simple para verificar que pytest está configurado correctamente
Ejecuta: python verify_testing.py
"""

import subprocess
import sys
import os
from pathlib import Path

def main():
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("\n" + "="*70)
    print("🔍 VERIFICANDO CONFIGURACIÓN DE TESTING")
    print("="*70 + "\n")
    
    # Verificar Python
    print(f"✅ Python: {sys.version.split()[0]}")
    print(f"   Ejecutable: {sys.executable}\n")
    
    # Verificar pytest
    try:
        result = subprocess.run([sys.executable, "-m", "pytest", "--version"], capture_output=True, text=True)
        print(f"✅ pytest: {result.stdout.strip()}\n")
    except Exception as e:
        print(f"❌ pytest no disponible: {e}\n")
        return 1
    
    # Verificar archivos de test
    test_files = [
        "tests/test_unit_logic.py",
        "tests/test_unit_extended.py",
        "tests/test_auth.py",
        "tests/test_functional.py",
        "tests/test_flow.py",
        "tests/conftest.py",
    ]
    
    print("📝 Archivos de test:")
    for test_file in test_files:
        path = backend_dir / test_file
        if path.exists():
            print(f"   ✅ {test_file}")
        else:
            print(f"   ❌ {test_file} (NO ENCONTRADO)")
    
    # Verificar directorios
    print("\n📁 Directorios:")
    dirs = ["tests", "test_reports", "app"]
    for dir_name in dirs:
        path = backend_dir / dir_name
        if path.exists():
            print(f"   ✅ {dir_name}")
        else:
            print(f"   ❌ {dir_name} (NO ENCONTRADO)")
    
    # Ejecutar un test simple
    print("\n" + "="*70)
    print("🧪 EJECUTANDO TEST DE PRUEBA...")
    print("="*70 + "\n")
    
    cmd = [
        sys.executable, "-m", "pytest",
        "tests/test_unit_logic.py",
        "-v",
        "--tb=short",
        "-x"
    ]
    
    result = subprocess.run(cmd, cwd=backend_dir)
    
    if result.returncode == 0:
        print("\n" + "="*70)
        print("✅ TESTING ESTÁ CONFIGURADO CORRECTAMENTE")
        print("="*70)
        print("\n📝 Próximos pasos:")
        print("1. Ejecutar pruebas funcionales:")
        print("   python -m pytest tests/test_functional.py -v")
        print("\n2. Ejecutar con reporte HTML:")
        print("   python -m pytest tests -v --html=test_reports/report.html --self-contained-html")
        print("\n3. Ver toda la información en:")
        print("   TESTING_GUIDE.md")
        print("   TESTING_CONTRIBUTION_GUIDE.md")
        print("   TESTING_SETUP_SUMMARY.md")
        print("="*70 + "\n")
    else:
        print("\n" + "="*70)
        print("❌ HUBO ERRORES EN LOS TESTS")
        print("="*70 + "\n")
    
    return result.returncode

if __name__ == "__main__":
    sys.exit(main())
