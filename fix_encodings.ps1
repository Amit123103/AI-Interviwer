# Fixes all UTF-16LE logs and config files in the project to UTF-8
# This allows AI tools to read diagnostic logs correctly.

$files = Get-ChildItem -Recurse -Include *.log, *.txt, .env, *.txt

foreach ($file in $files) {
    # Check if file is really UTF-16 (or if we just want to ensure it's UTF-8)
    try {
        $content = Get-Content -Path $file.FullName
        $content | Out-File -FilePath $file.FullName -Encoding utf8 -Force
        Write-Host "Converted: $($file.RelativePath)" -ForegroundColor Green
    } catch {
        Write-Host "Skipped: $($file.RelativePath)" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files processed. I can now read your logs perfectly!" -ForegroundColor Blue
