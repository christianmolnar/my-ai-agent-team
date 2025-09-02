# OpenInStackEdit.ps1

<##>
# PowerShell script to convert a Markdown file to Word (.docx) using Pandoc.
# Usage: .\OpenInStackEdit.ps1 -FilePath <path-to-markdown-file>
<##>

param(
    [Parameter(Mandatory=$true)]
    [string]$FilePath
)

if (-Not (Test-Path $FilePath)) {
    Write-Error "File not found: $FilePath"
    exit 1
}

# Set output path to same directory as input, with .docx extension
$outputPath = [System.IO.Path]::ChangeExtension($FilePath, ".docx")

# Run Pandoc to convert Markdown to Word
pandoc $FilePath -o $outputPath

Write-Host "Word document generated at: $outputPath"
