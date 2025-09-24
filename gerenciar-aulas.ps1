# Script PowerShell para gerenciar o curso Vue.js
# Uso: .\gerenciar-aulas.ps1 -acao <acao> [-aula <numero>]

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("listar", "checkout", "criar", "comparar", "info")]
    [string]$acao,
    
    [Parameter(Mandatory=$false)]
    [int]$aula,
    
    [Parameter(Mandatory=$false)]
    [int]$aulaComparar
)

# Cores para output
function Write-ColorOutput {
    param(
        [string]$message,
        [string]$color = "White"
    )
    
    $colors = @{
        "Red" = [System.ConsoleColor]::Red
        "Green" = [System.ConsoleColor]::Green
        "Yellow" = [System.ConsoleColor]::Yellow
        "Blue" = [System.ConsoleColor]::Blue
        "Cyan" = [System.ConsoleColor]::Cyan
        "White" = [System.ConsoleColor]::White
    }
    
    Write-Host $message -ForegroundColor $colors[$color]
}

# Lista de aulas disponíveis
$aulas = @{
    1 = @{ nome = "aula-01-introducao"; titulo = "Introdução ao Vue.js" }
    2 = @{ nome = "aula-02-componentes"; titulo = "Componentes e Diretivas" }
    3 = @{ nome = "aula-03-api"; titulo = "Comunicação com API" }
    4 = @{ nome = "aula-04-roteamento"; titulo = "Roteamento" }
    5 = @{ nome = "aula-05-formularios"; titulo = "Formulários e Validação" }
    6 = @{ nome = "aula-06-crud"; titulo = "CRUD de Produtos" }
    7 = @{ nome = "aula-07-auth"; titulo = "Autenticação" }
    8 = @{ nome = "aula-08-estado"; titulo = "Estado Global (Pinia)" }
    9 = @{ nome = "aula-09-componentes-avancados"; titulo = "Componentes Avançados" }
    10 = @{ nome = "aula-10-estilizacao"; titulo = "Estilização" }
    11 = @{ nome = "aula-11-deploy"; titulo = "Deploy e Build" }
    12 = @{ nome = "aula-12-projeto-final"; titulo = "Revisão e Projeto Final" }
}

function Show-Header {
    Write-ColorOutput "========================================" "Cyan"
    Write-ColorOutput "   CURSO VUE.JS - GERENCIADOR DE AULAS   " "Cyan"
    Write-ColorOutput "========================================" "Cyan"
    Write-Host ""
}

function Show-AulasList {
    Write-ColorOutput "📚 AULAS DISPONÍVEIS:" "Yellow"
    Write-Host ""
    
    foreach ($num in 1..12) {
        $aulaInfo = $aulas[$num]
        $branchExists = git branch -a | Select-String $aulaInfo.nome
        $status = if ($branchExists) { "✅" } else { "🔴" }
        
        Write-Host "  $status Aula $num - $($aulaInfo.titulo)" -ForegroundColor $(if ($branchExists) { "Green" } else { "Red" })
        Write-Host "     Branch: $($aulaInfo.nome)" -ForegroundColor "Gray"
    }
    Write-Host ""
}

function Switch-ToAula {
    param([int]$aulaNum)
    
    if (-not $aulas.ContainsKey($aulaNum)) {
        Write-ColorOutput "❌ Aula $aulaNum não existe!" "Red"
        return
    }
    
    $aulaInfo = $aulas[$aulaNum]
    $branchName = $aulaInfo.nome
    
    Write-ColorOutput "🔄 Mudando para Aula $aulaNum - $($aulaInfo.titulo)" "Blue"
    
    # Verificar se a branch existe
    $branchExists = git branch -a | Select-String $branchName
    
    if ($branchExists) {
        git checkout $branchName
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Sucesso! Você está na Aula $aulaNum" "Green"
            Write-ColorOutput "📖 Leia o material em: aulas/Aula$aulaNum.md" "Yellow"
            Write-Host ""
            Write-ColorOutput "🚀 Para rodar o projeto:" "Cyan"
            Write-Host "   npm install  (se for a primeira vez)" -ForegroundColor "Gray"
            Write-Host "   npm run dev" -ForegroundColor "Gray"
        } else {
            Write-ColorOutput "❌ Erro ao fazer checkout da branch" "Red"
        }
    } else {
        Write-ColorOutput "❌ Branch da Aula $aulaNum ainda não foi criada" "Red"
        Write-ColorOutput "💡 Use: .\gerenciar-aulas.ps1 -acao criar -aula $aulaNum" "Yellow"
    }
}

function Create-AulaBranch {
    param([int]$aulaNum)
    
    if (-not $aulas.ContainsKey($aulaNum)) {
        Write-ColorOutput "❌ Aula $aulaNum não existe!" "Red"
        return
    }
    
    $aulaInfo = $aulas[$aulaNum]
    $branchName = $aulaInfo.nome
    
    Write-ColorOutput "🆕 Criando branch para Aula $aulaNum - $($aulaInfo.titulo)" "Blue"
    
    # Verificar se já existe
    $branchExists = git branch -a | Select-String $branchName
    
    if ($branchExists) {
        Write-ColorOutput "⚠️  Branch já existe! Use checkout em vez de criar." "Yellow"
        return
    }
    
    # Criar nova branch a partir da master
    git checkout master
    git checkout -b $branchName
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Branch criada com sucesso!" "Green"
        Write-ColorOutput "📝 Agora você pode implementar os exercícios da Aula $aulaNum" "Cyan"
    } else {
        Write-ColorOutput "❌ Erro ao criar branch" "Red"
    }
}

function Compare-Aulas {
    param([int]$aula1, [int]$aula2)
    
    if (-not $aulas.ContainsKey($aula1) -or -not $aulas.ContainsKey($aula2)) {
        Write-ColorOutput "❌ Uma das aulas não existe!" "Red"
        return
    }
    
    $branch1 = $aulas[$aula1].nome
    $branch2 = $aulas[$aula2].nome
    
    Write-ColorOutput "🔍 Comparando diferenças entre:" "Blue"
    Write-Host "   Aula $aula1 ($branch1)" -ForegroundColor "Cyan"
    Write-Host "   Aula $aula2 ($branch2)" -ForegroundColor "Cyan"
    Write-Host ""
    
    git --no-pager diff $branch1..$branch2 --name-status
}

function Show-Info {
    Write-ColorOutput "ℹ️  INFORMAÇÕES DO REPOSITÓRIO:" "Blue"
    Write-Host ""
    
    # Branch atual
    $currentBranch = git branch --show-current
    Write-Host "📍 Branch atual: " -NoNewline -ForegroundColor "Yellow"
    Write-Host $currentBranch -ForegroundColor "Green"
    
    # Status do git
    Write-Host ""
    Write-ColorOutput "📊 Status do repositório:" "Yellow"
    git status --short
    
    # Branches remotas
    Write-Host ""
    Write-ColorOutput "🌐 Branches disponíveis:" "Yellow"
    git branch -a
    
    Write-Host ""
    Write-ColorOutput "🎯 Para instalar dependências:" "Cyan"
    Write-Host "   npm install" -ForegroundColor "Gray"
    Write-Host ""
    Write-ColorOutput "🚀 Para rodar o projeto:" "Cyan"
    Write-Host "   npm run dev" -ForegroundColor "Gray"
}

# Função principal
function Main {
    Show-Header
    
    switch ($acao) {
        "listar" {
            Show-AulasList
        }
        "checkout" {
            if (-not $aula) {
                Write-ColorOutput "❌ Especifique o número da aula: -aula <numero>" "Red"
                return
            }
            Switch-ToAula $aula
        }
        "criar" {
            if (-not $aula) {
                Write-ColorOutput "❌ Especifique o número da aula: -aula <numero>" "Red"
                return
            }
            Create-AulaBranch $aula
        }
        "comparar" {
            if (-not $aula -or -not $aulaComparar) {
                Write-ColorOutput "❌ Especifique duas aulas: -aula <num1> -aulaComparar <num2>" "Red"
                return
            }
            Compare-Aulas $aula $aulaComparar
        }
        "info" {
            Show-Info
        }
    }
}

# Executar
Main