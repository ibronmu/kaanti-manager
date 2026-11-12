# fix-phase1.ps1 — run from repo root
$ErrorActionPreference = "Stop"
Write-Host "== Fixing API filenames ==" -ForegroundColor Cyan

# Rename folder: controller -> controllers
if (Test-Path "apps\api\src\controller") {
  if (Test-Path "apps\api\src\controllers") { Remove-Item "apps\api\src\controllers" -Recurse -Force }
  Rename-Item "apps\api\src\controller" "controllers"
}

# Rename misnamed files inside
$renames = @(
  @("apps\api\src\controllers\bussiness.contoller.ts",  "apps\api\src\controllers\business.controller.ts"),
  @("apps\api\src\middleware\bussinessAcess.ts",       "apps\api\src\middleware\businessAccess.ts"),
  @("apps\api\src\routes\bussiness.route.ts",          "apps\api\src\routes\business.routes.ts"),
  @("apps\api\src\services\auth.services.ts",          "apps\api\src\services\auth.service.ts"),
  @("apps\api\src\services\bussiness.services.ts",     "apps\api\src\services\business.service.ts"),
  @("apps\api\src\utils\error.ts",                     "apps\api\src\utils\errors.ts"),
  @("apps\api\src\utils\token.ts",                     "apps\api\src\utils\tokens.ts")
)
foreach ($pair in $renames) {
  if (Test-Path $pair[0]) {
    if (Test-Path $pair[1]) { Remove-Item $pair[1] -Force }
    Rename-Item $pair[0] $pair[1]
    Write-Host "  $($pair[0]) -> $($pair[1])"
  }
}

# Remove the stray unused config/config.ts
if (Test-Path "apps\api\src\config\config.ts") {
  Remove-Item "apps\api\src\config\config.ts" -Force
  Write-Host "  removed unused config/config.ts"
}

# Create the one truly missing file
if (-not (Test-Path "apps\api\src\utils\prisma.ts")) {
  @'
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();
'@ | Set-Content "apps\api\src\utils\prisma.ts" -Encoding ASCII
  Write-Host "  created utils/prisma.ts"
}

# Now fix any imports that still reference old names
Write-Host "`n== Scanning for broken imports ==" -ForegroundColor Cyan
$bad = Get-ChildItem -Recurse apps\api\src -Include *.ts -File |
  Select-String -Pattern 'bussiness|contoller|Acess|auth\.services|/error"|/token"|config/config'

if ($bad) {
  Write-Host "FOUND broken imports — do NOT proceed until fixed:" -ForegroundColor Red
  $bad | ForEach-Object { Write-Host "  $($_.Path):$($_.LineNumber)  $($_.Line.Trim())" }
} else {
  Write-Host "  No broken imports found. OK." -ForegroundColor Green
}

Write-Host "`n== Done. Now run: pnpm dev ==" -ForegroundColor Cyan