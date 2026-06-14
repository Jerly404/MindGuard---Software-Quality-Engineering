# Script de Setup para Testing en Windows PowerShell
# Uso: .\setup_testing.ps1

param(
    [switch]$SkipInstall = $false,
    [switch]$RunTests = $false
)

Write-Host "`n$('='*80)" -ForegroundColor Cyan
Write-Host "🔧 CONFIGURACIÓN DE AMBIENTE DE TESTING - MindGuard" -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Cyan

# Obtener directorio backend
$backendDir = Get-Location
Write-Host "📁 Directorio: $backendDir" -ForegroundColor Yellow

# Paso 1: Actualizar pip
if (-not $SkipInstall) {
    Write-Host "`n▶️  Actualizando pip..." -ForegroundColor Green
    & python.exe -m pip install --upgrade pip --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ pip actualizado" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Error actualizando pip" -ForegroundColor Yellow
    }
}

# Paso 2: Instalar dependencias
if (-not $SkipInstall) {
    Write-Host "`n▶️  Instalando dependencias..." -ForegroundColor Green
    & python.exe -m pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
    } else {
        Write-Host "❌ Error instalando dependencias" -ForegroundColor Red
        exit 1
    }
}

# Paso 3: Verificar pytest
Write-Host "`n▶️  Verificando pytest..." -ForegroundColor Green
$pytest = & python.exe -m pytest --version 2>$null
if ($?) {
    Write-Host "✅ pytest disponible: $pytest" -ForegroundColor Green
} else {
    Write-Host "❌ pytest no disponible" -ForegroundColor Red
    exit 1
}

# Paso 4: Crear directorios
Write-Host "`n▶️  Creando directorios..." -ForegroundColor Green
$dirs = @("test_reports", "htmlcov")
foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Directorio creado: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Directorio existe: $dir" -ForegroundColor Green
    }
}

# Resumen
Write-Host "`n$('='*80)" -ForegroundColor Green
Write-Host "✅ SETUP COMPLETADO EXITOSAMENTE" -ForegroundColor Green
Write-Host "$('='*80)" -ForegroundColor Green

Write-Host "`n📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Ejecutar pruebas unitarias:"
Write-Host "   python -m pytest tests/test_unit_logic.py -v" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Ejecutar todas las pruebas:"
Write-Host "   python run_all_tests.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Ejecutar con reporte HTML:"
Write-Host "   python -m pytest tests -v --html=test_reports/report.html --self-contained-html" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Ejecutar pruebas funcionales (necesita admin en BD):"
Write-Host "   python -m pytest tests/test_functional.py -v" -ForegroundColor Cyan
Write-Host "$('='*80)`n" -ForegroundColor Green

if ($RunTests) {
    Write-Host "▶️  Ejecutando pruebas unitarias..." -ForegroundColor Cyan
    & python.exe -m pytest tests/test_unit_logic.py -v --tb=short
}
