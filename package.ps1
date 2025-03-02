# PowerShell script to package the Link Fetch extension
# Run this script to create a ZIP file for submission to the Chrome Web Store

# Set variables
$extensionName = "Link-Fetch"
$version = (Get-Content -Raw -Path manifest.json | ConvertFrom-Json).version
$outputFileName = "${extensionName}-v${version}.zip"

# Ensure we're in the correct directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Define files to include/exclude
$filesToInclude = @(
    "manifest.json",
    "background.js",
    "content.js",
    "popup.html",
    "popup.js",
    "sidepanel.html",
    "sidepanel.js",
    "styles.css",
    "README.md",
    "icons/*"
)

$filesToExclude = @(
    "*.zip",
    "*.bak",
    "*.ps1",
    "screenshots/*",
    ".git/*",
    "*.md"
)

# Create temporary directory
$tempDir = New-Item -ItemType Directory -Path "$scriptPath\temp_packaging" -Force

# Copy files to temp directory
foreach ($filePattern in $filesToInclude) {
    # Check if it's a directory with wildcard
    if ($filePattern -like "*/*") {
        $directory = $filePattern.Split('/')[0]
        $pattern = $filePattern.Split('/')[1]
        
        # Create directory in temp if needed
        New-Item -ItemType Directory -Path "$tempDir\$directory" -Force | Out-Null
        
        # Copy files
        if ($pattern -eq "*") {
            Copy-Item "$scriptPath\$directory\*" "$tempDir\$directory\" -Recurse
        } else {
            Copy-Item "$scriptPath\$directory\$pattern" "$tempDir\$directory\" -Recurse
        }
    } else {
        # It's a regular file
        Copy-Item "$scriptPath\$filePattern" "$tempDir\" -Recurse
    }
}

# Remove files that should be excluded
foreach ($excludePattern in $filesToExclude) {
    Get-ChildItem -Path $tempDir -Recurse -Include $excludePattern | Remove-Item -Force -Recurse
}

# Create zip file
if (Test-Path $outputFileName) {
    Remove-Item $outputFileName -Force
}

Add-Type -Assembly System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, "$scriptPath\$outputFileName")

# Cleanup
Remove-Item -Path $tempDir -Recurse -Force

Write-Host "Package created: $outputFileName" -ForegroundColor Green
Write-Host "Ready for submission to Chrome Web Store." 