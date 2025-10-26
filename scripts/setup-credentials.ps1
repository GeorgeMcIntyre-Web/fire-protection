# Setup Script for Fire Protection App
# This helps you configure all necessary API keys

Write-Host "🔥 Fire Protection App - Credentials Setup" -ForegroundColor Cyan
Write-Host ""

# Check for existing .env
if (Test-Path ".env") {
    Write-Host "✓ .env file found" -ForegroundColor Green
} else {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item ".env.template" ".env"
}

# Get Supabase credentials
Write-Host ""
Write-Host "📝 SUPABASE SETUP" -ForegroundColor Cyan
Write-Host "-------------------"
Write-Host ""
Write-Host "To get your Supabase credentials:"
Write-Host "1. Go to: https://supabase.com/dashboard"
Write-Host "2. Select your project"
Write-Host "3. Click 'Settings' (gear icon)"
Write-Host "4. Click 'API' in the left menu"
Write-Host "5. Copy your Project URL and anon key"
Write-Host ""

$supabaseUrl = Read-Host "Enter your Supabase URL (or press Enter to skip)"
$supabaseKey = Read-Host "Enter your Supabase anon key (or press Enter to skip)"

if ($supabaseUrl -and $supabaseKey) {
    # Update .env file
    $envContent = Get-Content ".env" -Raw
    
    $envContent = $envContent -replace "VITE_SUPABASE_URL=.*", "VITE_SUPABASE_URL=$supabaseUrl"
    $envContent = $envContent -replace "VITE_SUPABASE_ANON_KEY=.*", "VITE_SUPABASE_ANON_KEY=$supabaseKey"
    
    Set-Content ".env" -Value $envContent
    
    Write-Host ""
    Write-Host "✓ Credentials saved to .env" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⚠ Skipping credentials setup" -ForegroundColor Yellow
    Write-Host "You can add them manually to .env file" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Add Supabase credentials to Cloudflare:" -ForegroundColor Yellow
Write-Host "   - Go to: https://dash.cloudflare.com"
Write-Host "   - Pages → fire-protection-tracker → Settings"
Write-Host "   - Add environment variables"
Write-Host ""
Write-Host "2. Run SQL migration in Supabase:" -ForegroundColor Yellow
Write-Host "   - Open COPY_PASTE_READY.md"
Write-Host "   - Copy the SQL code"
Write-Host "   - Paste in Supabase SQL Editor and run"
Write-Host ""
Write-Host "3. Upload documents:" -ForegroundColor Yellow
Write-Host "   npm run upload-docs"
Write-Host ""

Write-Host "✅ Setup complete!" -ForegroundColor Green

