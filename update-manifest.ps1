# update-manifest.ps1
# Scannt alle Bildordner und aktualisiert assets/manifest.js automatisch.
# Ausfuehren: Rechtsklick -> "Mit PowerShell ausfuehren"

$extensions = @('.jpg', '.jpeg', '.png', '.gif', '.webp')
$folders = @('e-id', 'banking', 'ar', 'exchange', 'animation', 'brand', 'cube')
$entries = @()

foreach ($folder in $folders) {
    $path = Join-Path $PSScriptRoot "assets\$folder"
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -File |
                 Where-Object { $extensions -contains $_.Extension.ToLower() } |
                 Sort-Object Name |
                 Select-Object -ExpandProperty Name
        $fileList = ($files | ForEach-Object { '"' + $_ + '"' }) -join ', '
    } else {
        $files = @()
        $fileList = ''
    }
    $entries += '  "' + $folder + '": [' + $fileList + ']'
}

$js = "window.IMAGE_MANIFEST = {`n" + ($entries -join ",`n") + "`n};"
$outPath = Join-Path $PSScriptRoot "assets\manifest.js"
Set-Content -Path $outPath -Value $js -Encoding UTF8

# cat.js neu generieren (alle Katzenbilder als Base64 fuer den Rubik's Cube)
$cubePath = Join-Path $PSScriptRoot "assets\cube"
if (Test-Path $cubePath) {
    $catFiles = Get-ChildItem -Path $cubePath -File |
                Where-Object { $extensions -contains $_.Extension.ToLower() } |
                Sort-Object Name
    if ($catFiles) {
        $dataUrls = @()
        foreach ($catFile in $catFiles) {
            $bytes = [System.IO.File]::ReadAllBytes($catFile.FullName)
            $b64 = [Convert]::ToBase64String($bytes)
            $ext = $catFile.Extension.ToLower().TrimStart('.')
            if ($ext -eq 'jpg') { $ext = 'jpeg' }
            $dataUrls += '"data:image/' + $ext + ';base64,' + $b64 + '"'
        }
        $catJs = 'window.CAT_IMAGES = [' + ($dataUrls -join ',') + '];'
        [System.IO.File]::WriteAllText((Join-Path $cubePath 'cat.js'), $catJs)
        Write-Host "cat.js aktualisiert: $($catFiles.Count) Bild(er)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "manifest.js aktualisiert!" -ForegroundColor Green
foreach ($folder in $folders) {
    $path = Join-Path $PSScriptRoot "assets\$folder"
    if (Test-Path $path) {
        $files = Get-ChildItem -Path $path -File |
                 Where-Object { $extensions -contains $_.Extension.ToLower() }
        $count = $files.Count
    } else { $count = 0 }
    $label = if ($count -eq 0) { "(keine Bilder)" } else { "$count Bild(er)" }
    $color = if ($count -gt 0) { "Cyan" } else { "Gray" }
    Write-Host ("  " + $folder + ": " + $label) -ForegroundColor $color
}
Write-Host ""
Read-Host "Enter druecken zum Schliessen"
