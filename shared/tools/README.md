# StackEdit Integration Tool

This tool helps you prepare Markdown documents for pasting into Microsoft Word with formatting (bold, headings, lists) preserved.

## Usage

1. Open PowerShell in your workspace.
2. Run the script with your Markdown file:

```powershell
cd <your workspace root>
.\shared\tools\OpenInStackEdit.ps1 -FilePath "<path-to-your-markdown-file>"
```

Example:
```powershell
.\shared\tools\OpenInStackEdit.ps1 -FilePath "shared\tasks\ResumeWriting\copilot_area_docs\samples\functional_resume_sample_christian_molnar_20250514_copy.md"
```

3. The script will:
   - Copy the Markdown file content to your clipboard.
   - Open StackEdit (https://stackedit.io/app#) in your default browser.
4. Paste the content into StackEdit, then use StackEdit's export or "Copy to clipboard as rich text" feature.
5. Paste into MS Word. Formatting will be preserved.

## Why use this?
- Markdown editors like StackEdit allow you to convert Markdown to rich text or HTML, which Word can interpret, preserving formatting.
- This script makes the process quick and repeatable for anyone in the repo.

---

For more details, see StackEdit's documentation: https://stackedit.io/app#
