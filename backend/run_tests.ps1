# Script para ejecutar pruebas con pytest y pytest-html en Windows

param(
    [string]$ReportDir = "test_reports",
    [switch]$Coverage = $false,
    [switch]$OpenReport = $false
)

function Run-Tests {
    $backendDir = Get-Location
    $reportDirPath = Join-Path $backendDir $ReportDir
    
    # Crear directorio de reportes
    if (-not (Test-Path $reportDirPath)) {
        New-Item -ItemType Directory -Path $reportDirPath | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $htmlReport = Join-Path $reportDirPath "report_$timestamp.html"
    $coverageReport = Join-Path $reportDirPath "coverage_$timestamp"
    
    Write-Host "`n$('='*70)" -ForegroundColor Cyan
    Write-Host "INICIANDO EJECUCIÓN DE PRUEBAS - MindGuard" -ForegroundColor Cyan
    Write-Host "$('='*70)" -ForegroundColor Cyan
    Write-Host "📁 Directorio: $backendDir" -ForegroundColor Yellow
    Write-Host "📊 Reporte HTML: $htmlReport" -ForegroundColor Yellow
    Write-Host "📈 Cobertura: $coverageReport" -ForegroundColor Yellow
    Write-Host "$('='*70)`n" -ForegroundColor Cyan
    
    # Comando base
    $args = @(
        "-m", "pytest",
        "tests",
        "-v",
        "--tb=short",
        "--html=$htmlReport",
        "--self-contained-html"
    )
    
    # Agregar cobertura si se especifica
    if ($Coverage) {
        $args += @(
            "--cov=app",
            "--cov-report=html:$coverageReport",
            "--cov-report=term"
        )
    }
    
    # Ejecutar pytest
    Write-Host "▶️  Ejecutando pruebas..." -ForegroundColor Green
    & python.exe $args
    
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host "`n$('='*70)" -ForegroundColor Green
        Write-Host "✅ PRUEBAS EXITOSAS" -ForegroundColor Green
        Write-Host "$('='*70)" -ForegroundColor Green
        Write-Host "📊 Reporte HTML: $htmlReport" -ForegroundColor Yellow
        if ($Coverage) {
            Write-Host "📈 Cobertura: $(Join-Path $coverageReport 'index.html')" -ForegroundColor Yellow
        }
        Write-Host "$('='*70)`n" -ForegroundColor Green
        
        if ($OpenReport) {
            Write-Host "Abriendo reporte..." -ForegroundColor Cyan
            Start-Process $htmlReport
        }
    } else {
        Write-Host "`n$('='*70)" -ForegroundColor Red
        Write-Host "❌ ALGUNAS PRUEBAS FALLARON" -ForegroundColor Red
        Write-Host "$('='*70)" -ForegroundColor Red
        Write-Host "📊 Reporte HTML: $htmlReport" -ForegroundColor Yellow
        Write-Host "$('='*70)`n" -ForegroundColor Red
    }
    
    return $exitCode
}

# Ejecutar
exit Run-Tests
