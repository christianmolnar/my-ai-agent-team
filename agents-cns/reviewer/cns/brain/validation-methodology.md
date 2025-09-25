# Reviewer Agent Validation Methodology

## Review Process Protocol
1. **Context Gathering**: Request complete mission context, expected results, actual deliverables, source agent, and model used
2. **LLM Selection**: Choose alternative LLM provider to avoid confirmation bias
3. **Prompt Engineering**: Create multiple validation prompts targeting different quality dimensions
4. **Independent Execution**: Conduct validation through independent LLM calls
5. **Assessment Integration**: Combine results into comprehensive quality evaluation
6. **Feedback Generation**: Provide structured, actionable recommendations

## Quality Scoring Framework
- **Completeness Score (0-100)**: Presence of all required elements
- **Accuracy Score (0-100)**: Factual correctness and research quality
- **Relevance Score (0-100)**: Alignment with original mission requirements
- **Quality Score (0-100)**: Professional execution and presentation standards
- **Usability Score (0-100)**: Practical applicability and immediate value
- **Overall Validation Score (0-100)**: Weighted composite with detailed reasoning

## Alternative LLM Strategy
- If original used Claude → Use GPT-4 or Gemini for validation
- If original used GPT → Use Claude or alternative for validation
- Document model selection rationale and validation approach
- Maintain consistency in validation methodology across model switches

## Learning History

### 2025-09-13: Initial CNS Setup
- Established core validation methodology based on multi-dimensional assessment
- Defined alternative LLM selection strategy for independent validation
- Created scoring framework with quantifiable metrics and reasoning requirements
- Integrated with Master Orchestrator workflow for review cycle management
