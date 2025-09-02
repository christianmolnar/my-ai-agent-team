# ConvertCSV-ToJSON.ps1
# PowerShell script to convert CSV files to JSON format
# Created: April 9, 2025

param(
    [Parameter(Mandatory=$true)]
    [string]$InputCSVFile,
    
    [Parameter(Mandatory=$false)]
    [string]$OutputJSONFile
)

function Convert-CSVToJSON {
    param (
        [string]$csvPath,
        [string]$jsonPath
    )
    
    # Check if input file exists
    if (-not (Test-Path -Path $csvPath)) {
        Write-Error "Input CSV file not found: $csvPath"
        return $false
    }
    
    # If output file not specified, create one based on input filename
    if (-not $jsonPath) {
        $jsonPath = [System.IO.Path]::ChangeExtension($csvPath, "json")
    }
    
    Write-Host "Converting $csvPath to $jsonPath..."
    
    try {
        # Import CSV content
        $csvData = Import-Csv -Path $csvPath
        
        # Convert to JSON with nice formatting
        $jsonData = $csvData | ConvertTo-Json -Depth 10
        
        # Write to output file
        $jsonData | Out-File -FilePath $jsonPath -Encoding UTF8
        
        Write-Host "Conversion completed successfully."
        Write-Host "JSON file saved to: $jsonPath"
        return $true
    }
    catch {
        Write-Error "Error occurred during conversion: $_"
        return $false
    }
}

# Execute the conversion function
$result = Convert-CSVToJSON -csvPath $InputCSVFile -jsonPath $OutputJSONFile

# Return success/failure status
exit [int](-not $result)