"""
Script para instalar dependencias y preparar el ambiente de testing
Ejecutar: python setup_testing.py
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description):
    """Ejecutar comando y mostrar resultado"""
    print(f"\n{'='*70}")
    print(f"📦 {description}")
    print(f"{'='*70}")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} completado exitosamente")
            if result.stdout:
                print(result.stdout)
        else:
            print(f"❌ Error en {description}")
            print(f"Error: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Excepción en {description}: {e}")
        return False
    return True

def main():
    """Configurar ambiente de testing"""
    
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("\n" + "="*70)
    print("🔧 CONFIGURANDO AMBIENTE DE TESTING - MindGuard")
    print("="*70)
    
    commands = [
        {
            "cmd": f"{sys.executable} -m pip install --upgrade pip",
            "desc": "Actualizar pip"
        },
        {
            "cmd": f"{sys.executable} -m pip install -r requirements.txt",
            "desc": "Instalar dependencias del proyecto"
        },
        {
            "cmd": f"{sys.executable} -m pip install pytest-xdist",
            "desc": "Instalar pytest-xdist para ejecución paralela (opcional)"
        },
        {
            "cmd": f"{sys.executable} -m pip list | findstr pytest",
            "desc": "Verificar instalación de pytest"
        },
    ]
    
    success_count = 0
    for cmd_info in commands:
        if run_command(cmd_info["cmd"], cmd_info["desc"]):
            success_count += 1
    
    # Crear directorios necesarios
    print(f"\n{'='*70}")
    print("📁 Creando directorios")
    print(f"{'='*70}")
    
    dirs_to_create = [
        "test_reports",
        "htmlcov",
    ]
    
    for dir_name in dirs_to_create:
        dir_path = backend_dir / dir_name
        dir_path.mkdir(exist_ok=True)
        print(f"✅ Directorio creado/existe: {dir_path}")
    
    # Resumen
    print(f"\n{'='*70}")
    print("✅ CONFIGURACIÓN COMPLETADA")
    print(f"{'='*70}")
    print(f"Comandos ejecutados correctamente: {success_count}/{len(commands)}")
    print("\n📝 Próximos pasos:")
    print("1. Crear usuario admin en la BD:")
    print("   python seed_db.py")
    print("\n2. Ejecutar pruebas:")
    print("   python run_tests.py  (Linux/macOS)")
    print("   .\\run_tests.ps1 -Coverage -OpenReport  (Windows)")
    print("\n3. Ver reportes en:")
    print("   backend/test_reports/")
    print(f"{'='*70}\n")

if __name__ == "__main__":
    main()
