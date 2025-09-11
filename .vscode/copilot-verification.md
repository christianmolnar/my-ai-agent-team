# GitHub Copilot Task Verification Protocol

**Location:** `.vscode/copilot-verification.md`  
**Purpose:** Mandatory verification steps to prevent false completion claims and ensure reliable task execution.

## **The Problem**
Copilot has been claiming task completion without verifying actual results, leading to:
- Empty files reported as "created"
- Failed operations reported as "successful" 
- Broken trust and wasted time
- Inconsistent and unreliable outcomes

## **Mandatory Verification Protocol**

### **For EVERY task completion claim, Copilot MUST:**

1. **Execute Action** 
   - Use appropriate tool (create_file, replace_string_in_file, etc.)
   - Record the tool response

2. **Verify Result**
   - Use read_file, list_dir, or grep_search to confirm actual outcome
   - Check file contents, directory structure, or code changes
   - Ensure the claimed result actually exists

3. **Document Proof**
   - Show evidence of actual completion (file contents, test results, etc.)
   - Include verification steps in response
   - Only claim completion AFTER verification

4. **Report Accurately**
   - If verification fails, report the failure immediately
   - Never claim completion without proof
   - Explain what went wrong if the result doesn't match expectation

## **Verification Checklist**

**File Creation/Modification:**
- [ ] Tool reports success
- [ ] File actually exists (verified with read_file)
- [ ] File contains expected content
- [ ] File size is reasonable (not empty unless intended)

**Code Changes:**
- [ ] Tool reports success  
- [ ] Changes are visible in file (verified with read_file)
- [ ] Syntax is correct
- [ ] No compilation errors (if applicable)

**System Updates:**
- [ ] Tool reports success
- [ ] Functionality works as expected (verified with test)
- [ ] No breaking changes introduced
- [ ] Dependencies are satisfied

## **Accountability Measures**

**For the User:**
- Reference this document: "Follow the Verification Protocol from `.vscode/copilot-verification.md`"
- Demand proof before accepting completion claims
- Call out violations immediately

**For Copilot:**
- This document serves as a behavioral contract
- Violations indicate process failure requiring immediate correction
- Each task must include verification steps in the response

## **Example of Proper Completion Report:**

❌ **WRONG:**
```
✅ Task completed! File created successfully.
```

✅ **CORRECT:**
```
1. **Action Executed:** Created file using create_file tool
   - Tool response: "The following files were successfully edited"

2. **Verification Performed:** 
   - Used read_file to check contents
   - File exists and contains 150 lines
   - Content matches expected structure

3. **Proof of Completion:**
   - File: /path/to/file.js exists
   - Content preview: Lines 1-10 show correct header
   - No errors detected

✅ **VERIFIED COMPLETION:** Task actually completed as claimed
```

## **Integration with Workspace**

This protocol integrates with:
- **Main behavioral guidelines:** `.vscode/copilot-behavior.md`
- **Project documentation:** `README.md`
- **Learning system:** `docs/learning-management.md`

**Status:** Active - Must be followed in all conversations  
**Updated:** September 11, 2025
