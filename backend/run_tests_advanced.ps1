# Script para ejecutar tests del backend MindGuard
# Uso: .\run_tests_advanced.ps1 -Type all|unit|functional|specific -Verbose

param(
    [ValidateSet('all', 'unit', 'functional', 'specific', 'coverage', 'admin')]
    [string]$Type = 'all',
    
    [string]$TestName,
    [switch]$Verbose,
    [switch]$OpenReport
)

# Colores para output
$GREEN = [System.ConsoleColor]::Green
$RED = [System.ConsoleColor]::Red
$YELLOW = [System.ConsoleColor]::Yellow
$CYAN = [System.ConsoleColor]::Cyan

function Write-Header {
    param([string]$Text)
    Write-Host "`n════════════════════════════════════════════" -ForegroundColor $CYAN
    Write-Host $Text -ForegroundColor $CYAN
    Write-Host "════════════════════════════════════════════`n" -ForegroundColor $CYAN
}

function Run-Tests {
    param(
        [string]$Type,
        [string]$Marker,
        [string]$ReportName
    )
    
    Write-Header "Ejecutando Tests: $Type"
    
    $cmd = "python -m pytest tests/ -v --html=$ReportName.html --self-contained-html"
    
    if ($Marker) {
        $cmd += " -m `"$Marker`""
    }
    
    if ($Verbose) {
        Write-Host "Comando: $cmd" -ForegroundColor $YELLOW
    }
    
    Invoke-Expression $cmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Tests completados exitosamente" -ForegroundColor $GREEN
    } else {
        Write-Host "`n❌ Algunos tests fallaron (exit code: $LASTEXITCODE)" -ForegroundColor $RED
    }
    
    if ($OpenReport) {
        Start-Process "$ReportName.html"
    }
}

# Cambiar a directorio backend
Set-Location -Path $PSScriptRoot
if (-not (Test-Path "pytest.ini")) {
    Write-Host "❌ Error: No se encuentra pytest.ini. Ejecutar desde el directorio backend." -ForegroundColor $RED
    exit 1
}

# Ejecutar según tipo seleccionado
switch ($Type) {
    'all' {
        Run-Tests "TODOS LOS TESTS" "" "reporte_completo"
    }
    'unit' {
        Run-Tests "UNITARIOS" "unit" "reporte_unitarios"
    }
    'functional' {
        Run-Tests "FUNCIONALES" "functional" "reporte_funcionales"
    }
    'admin' {
        Run-Tests "ADMIN" "admin" "reporte_admin"
    }
    'specific' {
        if ($TestName) {
            Write-Header "Ejecutando test específico: $TestName"
            python -m pytest tests/ -k "$TestName" -v --html=reporte_$TestName.html --self-contained-html
            if ($OpenReport) {
                Start-Process "reporte_$TestName.html"
            }
        } else {
            Write-Host "Error: Especifique -TestName para ejecutar un test específico" -ForegroundColor $RED
            exit 1
        }
    }
    'coverage' {
        Write-Header "Generando reporte de cobertura"
        python -m pytest tests/ --cov=app --cov-report=html --cov-report=term
        Write-Host "Reporte de cobertura: htmlcov/index.html" -ForegroundColor $GREEN
        if ($OpenReport) {
            Start-Process "htmlcov/index.html"
        }
    }
}

Write-Host "`n📁 Archivos de reporte generados:" -ForegroundColor $CYAN
Get-Item reporte_*.html -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "   - $($_.Name)" -ForegroundColor $GREEN
}

Write-Host "`n✨ Ejecución completada`n" -ForegroundColor $GREEN
