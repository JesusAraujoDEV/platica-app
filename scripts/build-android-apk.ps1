param(
  [string]$WorktreePath = "C:\platica-apk-build",
  [string]$ApiUrl = "https://wallets.irissoftware.lat/api",
  [string]$JavaHome = "$env:ProgramFiles\Android\Android Studio\jbr",
  [string]$AndroidSdk = "$env:LOCALAPPDATA\Android\Sdk"
)

$ErrorActionPreference = "Stop"
$repoRoot = (git rev-parse --show-toplevel).Trim()
if ($LASTEXITCODE -ne 0) { throw "Ejecuta este script dentro del repositorio platica-app." }
if (git status --porcelain) { throw "El repositorio debe estar limpio para que el APK corresponda exactamente a un commit." }
if (Test-Path $WorktreePath) { throw "La ruta temporal ya existe: $WorktreePath. Elimínala o usa -WorktreePath con otra ruta corta." }
if (-not (Test-Path "$JavaHome\bin\java.exe")) { throw "No se encontró un JDK compatible en $JavaHome." }
if (-not (Test-Path $AndroidSdk)) { throw "No se encontró Android SDK en $AndroidSdk." }

$version = (Get-Content "$repoRoot\package.json" | ConvertFrom-Json).version
$artifactDirectory = "$repoRoot\artifacts"
$artifactPath = "$artifactDirectory\platica-v$version.apk"

$buildSucceeded = $false

try {
  git worktree add --detach $WorktreePath HEAD
  if ($LASTEXITCODE -ne 0) { throw "No se pudo crear el worktree temporal." }

  Push-Location $WorktreePath
  npm ci --include=dev
  if ($LASTEXITCODE -ne 0) { throw "npm ci falló." }

  $env:JAVA_HOME = $JavaHome
  $env:ANDROID_HOME = $AndroidSdk
  $env:ANDROID_SDK_ROOT = $AndroidSdk
  $env:NODE_ENV = "production"
  $env:EXPO_PUBLIC_API_URL = $ApiUrl
  $env:Path = "$JavaHome\bin;$AndroidSdk\platform-tools;$env:Path"

  npx expo install --check --npm
  if ($LASTEXITCODE -ne 0) { throw "Las dependencias Expo no están alineadas." }
  npx tsc --noEmit
  if ($LASTEXITCODE -ne 0) { throw "TypeScript falló." }
  npx expo prebuild --platform android --clean --no-install
  if ($LASTEXITCODE -ne 0) { throw "Expo prebuild falló." }

  Push-Location "$WorktreePath\android"
  .\gradlew.bat :app:assembleRelease --no-daemon --console=plain
  if ($LASTEXITCODE -ne 0) { throw "Gradle assembleRelease falló." }
  Pop-Location

  New-Item -ItemType Directory -Path $artifactDirectory -Force | Out-Null
  Copy-Item "$WorktreePath\android\app\build\outputs\apk\release\app-release.apk" $artifactPath -Force
  $hash = Get-FileHash $artifactPath -Algorithm SHA256
  Write-Host "APK listo: $artifactPath"
  Write-Host "SHA256: $($hash.Hash)"
  $buildSucceeded = $true
}
finally {
  while ((Get-Location).Path.StartsWith($WorktreePath, [System.StringComparison]::OrdinalIgnoreCase)) { Pop-Location }
  if ($buildSucceeded) {
    git worktree remove --force $WorktreePath 2>$null
  } elseif (Test-Path $WorktreePath) {
    Write-Warning "El build falló. Se conserva el worktree para diagnóstico: $WorktreePath"
  }
}
