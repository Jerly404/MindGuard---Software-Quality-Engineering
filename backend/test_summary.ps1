#!/usr/bin/env powershell
# Script para mostrar resumen rápido de tests fallidos

param(
    [switch]$OpenReport
)

$ErrorActionPreference = "Continue"

Write-Host "`n" -ForegroundColor Cyan

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "        📊 RESUMEN RÁPIDO DE TESTS - MINDGUARD BACKEND        " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Ejecutar tests silenciosamente y capturar output
$output = python -m pytest tests/ --tb=no -q 2>&1

# Mostrar output
Write-Host $output

# Contar resultados
$lines = $output | Out-String
$summary = if ($lines -match "(\d+) failed.*?(\d+) passed") {
    $failed = $Matches[1]
    $passed = $Matches[2]
    $total = [int]$failed + [int]$passed
    $percentage = [math]::Round(($passed / $total) * 100, 1)
    
    @{
        Total = $total
        Passed = $passed
        Failed = $failed
        Percentage = $percentage
    }
}

if ($summary) {
    Write-Host "`n" -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "                      📈 ESTADÍSTICAS                        " -ForegroundColor Cyan
    Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Total:     $($summary.Total) tests" -ForegroundColor White
    Write-Host "Pasados:   $($summary.Passed) ✅" -ForegroundColor Green
    Write-Host "Fallidos:  $($summary.Failed) ❌" -ForegroundColor Red
    Write-Host "Éxito:     $($summary.Percentage)%" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
}

# Mostrar problemas encontrados
Write-Host "`n🔍 PROBLEMAS PRINCIPALES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. ❌ Endpoint /signup retorna 400" -ForegroundColor Red
Write-Host "   Archivos: app/api/auth.py" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ❌ Endpoint /login retorna 400 (debe 401)" -ForegroundColor Red
Write-Host "   Archivos: app/api/auth.py" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ❌ Response sin access_token" -ForegroundColor Red
Write-Host "   Archivos: app/api/auth.py" -ForegroundColor Gray
Write-Host ""
Write-Host "4. ❌ Token inválido retorna 403 (debe 401)" -ForegroundColor Red
Write-Host "   Archivos: app/api/deps.py" -ForegroundColor Gray
Write-Host ""
Write-Host "5. ⚠️  Validación de contraseña larga" -ForegroundColor Yellow
Write-Host "   Archivos: app/core/security.py" -ForegroundColor Gray
Write-Host ""

# Mostrar documentación disponible
Write-Host "`n📚 DOCUMENTACIÓN:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📖 TESTING_GUIDE_COMPLETE.md    - Guía completa" -ForegroundColor Green
Write-Host "  📊 REPORTE_TESTS_RESUMEN.md     - Resumen detallado" -ForegroundColor Green
Write-Host "  ✅ CHECKLIST_PROBLEMAS.md        - Checklist de corrección" -ForegroundColor Green
Write-Host ""

# Mostrar reportes disponibles
Write-Host "`n📁 REPORTES HTML:" -ForegroundColor Cyan
Write-Host ""

$reports = @(
    @{Name = "reporte_completo.html"; Desc = "Todos los tests" },
    @{Name = "reporte_tests.html"; Desc = "Unit + Functional" },
    @{Name = "reporte_backend.html"; Desc = "Histórico" }
)

foreach ($report in $reports) {
    if (Test-Path $report.Name) {
        $size = [math]::Round((Get-Item $report.Name).Length / 1024, 2)
        Write-Host "  📄 $($report.Name) ($($size) KB)" -ForegroundColor Green
        Write-Host "     └─ $($report.Desc)" -ForegroundColor Gray
    }
}

Write-Host ""

# Opciones
Write-Host "`n⌨️  COMANDOS RÁPIDOS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Ver todos los tests fallidos" -ForegroundColor Gray
Write-Host "  python -m pytest tests/ --tb=short -v" -ForegroundColor White
Write-Host ""
Write-Host "  # Ver solo autenticación" -ForegroundColor Gray
Write-Host "  python -m pytest tests/test_auth.py -v" -ForegroundColor White
Write-Host ""
Write-Host "  # Ver cobertura" -ForegroundColor Gray
Write-Host "  python -m pytest tests/ --cov=app --cov-report=term" -ForegroundColor White
Write-Host ""

if ($OpenReport) {
    if (Test-Path "reporte_completo.html") {
        Write-Host "Abriendo reporte..." -ForegroundColor Cyan
        Start-Process "reporte_completo.html"
    }
}

Write-Host "`n════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan
