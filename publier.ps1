# Vérifie le projet Posemetre puis l'envoie sur GitHub. Double-cliquer sur publier.cmd.
# Le site (GitHub Pages) est ensuite reconstruit automatiquement par GitHub (onglet Actions).
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
$depot = 'https://github.com/karimbel/Posemetre.git'

# Trouver git (parfois absent du PATH de PowerShell)
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    $pistes = @(
        "$env:ProgramFiles\Git\cmd",
        "${env:ProgramFiles(x86)}\Git\cmd",
        "$env:LocalAppData\Programs\Git\cmd",
        "$env:LocalAppData\GitHubDesktop\app-*\resources\app\git\cmd"
    )
    foreach ($p in $pistes) {
        $trouve = Get-Item $p -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($trouve) { $env:Path = "$($trouve.FullName);$env:Path"; break }
    }
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Host "`nGit n'est pas installé sur ce PC, ou pas trouvable." -ForegroundColor Red
        Write-Host "Télécharge-le ici : https://git-scm.com/download/win" -ForegroundColor Yellow
        exit 1
    }
}

function Etape($n, $txt) { Write-Host "`n[$n/5] $txt" -ForegroundColor Cyan }
function Echec($txt) { Write-Host "`nÉCHEC : $txt. Rien n'a été envoyé." -ForegroundColor Red; exit 1 }

Etape 1 "Dépôt Git"
if (-not (Test-Path "$PSScriptRoot\.git")) {
    git init -b main | Out-Null
    git remote add origin $depot
    Write-Host "Dépôt créé et relié à $depot" -ForegroundColor Yellow
    Write-Host "Récupération de l'historique GitHub..."
    git fetch origin
    if ($LASTEXITCODE -ne 0) {
        Remove-Item -Recurse -Force "$PSScriptRoot\.git"
        Echec "impossible de joindre GitHub (connexion ou identifiants)"
    }
    # Aligne l'historique sur GitHub SANS toucher à tes fichiers (reset "mixed").
    git reset -q origin/main
    git branch --set-upstream-to=origin/main main | Out-Null
    # Fichiers présents sur GitHub mais absents du dossier : on les restaure pour ne pas les supprimer.
    git checkout -- .gitattributes .github/workflows/deploy.yml
    Write-Host "Historique GitHub récupéré, fichiers locaux conservés." -ForegroundColor Yellow
} else {
    Write-Host "Dépôt existant : $(git remote get-url origin)"
}

Etape 2 "Vérification du code (via Docker)"
$service = $null
if (Get-Command docker -ErrorAction SilentlyContinue) {
    $service = docker compose ps --status running --services 2>$null | Select-Object -First 1
}
if ($service) {
    docker compose exec -T $service npm run check
    if ($LASTEXITCODE -ne 0) { Echec "svelte-check signale des erreurs" }
} else {
    Write-Host "Docker n'est pas lancé : vérification locale ignorée (GitHub construira le site de toute façon)." -ForegroundColor Yellow
}

Etape 3 "Contrôle de sécurité (aucun secret ni dossier généré)"
git add -A
$interdits = git diff --cached --name-only | Where-Object {
    ($_ -match '(^|/)\.env($|\.)') -and ($_ -notmatch '\.env\.example$') -or
    ($_ -match '^node_modules/') -or ($_ -match '^dist/') -or ($_ -match '^\.npm-cache/') -or ($_ -match '^\.vite/')
}
if ($interdits) {
    git reset -q
    Write-Host ($interdits -join "`n") -ForegroundColor Red
    Echec "ces fichiers ne doivent pas partir sur GitHub (vérifier .gitignore)"
}
Write-Host "OK"

Etape 4 "Fichiers modifiés"
git status --short
if (-not (git diff --cached --name-only)) {
    # Rien de nouveau : on renvoie quand même les commits pas encore partis (ex. push précédent échoué)
    git push -u origin main
    if ($LASTEXITCODE -ne 0) { Echec "l'envoi a échoué" }
    Write-Host "`nTerminé : GitHub est à jour." -ForegroundColor Green; exit 0
}

Etape 5 "Envoi sur GitHub"
$msg = Read-Host "Message du commit (Entrée = 'Mise à jour')"
if ([string]::IsNullOrWhiteSpace($msg)) { $msg = 'Mise à jour' }
$ok = Read-Host "Envoyer sur GitHub ? (o/n)"
if ($ok -ne 'o') { git reset -q; Write-Host "Annulé, rien n'a été envoyé."; exit 0 }
git commit -m $msg
if ($LASTEXITCODE -ne 0) { Echec "le commit a échoué" }
git push -u origin main
if ($LASTEXITCODE -ne 0) { Echec "l'envoi a échoué" }

Write-Host "`nTerminé : tout est sur GitHub. Le site sera mis à jour d'ici quelques minutes (onglet Actions)." -ForegroundColor Green
