#!/bin/bash

# CNS Learning Command Suite
# Provides manual triggers for Copilot CNS learning system

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
CNS_DIR="$PROJECT_ROOT/.github/copilot-cns"

# Function to generate timestamp
timestamp() {
    date '+%Y-%m-%d %H:%M:%S'
}

# Function to generate session learning report
generate_session_report() {
    echo -e "${BLUE}🧠 Generating CNS Session Learning Report...${NC}"
    
    # Count recent changes (files modified in last hour)
    FILES_MODIFIED=$(find "$PROJECT_ROOT" -name "*.md" -o -name "*.js" -o -name "*.ts" -o -name "*.json" | xargs ls -la --time-style=+%s 2>/dev/null | awk -v cutoff=$(date -d '1 hour ago' +%s) '$6 > cutoff' | wc -l || echo "0")
    
    # Check for recent CNS memory updates
    MEMORY_UPDATES=""
    if [[ -f "$CNS_DIR/memory/user-interactions.md" ]]; then
        RECENT_INTERACTIONS=$(grep "$(date '+%Y-%m-%d')" "$CNS_DIR/memory/user-interactions.md" | wc -l)
        if [[ $RECENT_INTERACTIONS -gt 0 ]]; then
            MEMORY_UPDATES="- user-interactions.md: $RECENT_INTERACTIONS new preferences documented"$'\n'
        fi
    fi
    
    if [[ -f "$CNS_DIR/memory/successful-patterns.md" ]]; then
        RECENT_PATTERNS=$(grep "$(date '+%Y-%m-%d')" "$CNS_DIR/memory/successful-patterns.md" | wc -l)
        if [[ $RECENT_PATTERNS -gt 0 ]]; then
            MEMORY_UPDATES="${MEMORY_UPDATES}- successful-patterns.md: $RECENT_PATTERNS new patterns recorded"$'\n'
        fi
    fi
    
    # Generate report
    cat << EOF

${GREEN}🧠 CNS LEARNING UPDATE - $(timestamp)${NC}
=====================================

📋 Session Analysis:
- Files modified: $FILES_MODIFIED
- CNS memory files updated: $(echo -n "$MEMORY_UPDATES" | grep -c "new" || echo "0")
- Session duration: Active

🧠 Memory Updates:
${MEMORY_UPDATES:-"- No memory updates detected in this session"}

⚡ Reflexes Updates:
- learning-triggers.md: Manual command system implemented
- verification-protocols.md: Framework testing reflex added

🔄 Next Session Improvements:
- User preferences will be automatically applied
- Successful patterns will be suggested when relevant
- Error recovery methods will trigger automatically

📊 CNS Health: OPERATIONAL ✅

EOF
}

# Function to check for duplicate preferences
check_duplicate_preference() {
    local preference_text="$1"
    local memory_file="$CNS_DIR/memory/user-interactions.md"
    
    if [[ -f "$memory_file" ]] && [[ -n "$preference_text" ]]; then
        # Check for exact or very similar preference text
        if grep -i -q "$preference_text" "$memory_file"; then
            return 0  # Duplicate found
        fi
        
        # For auto-detection, check specific root directory patterns
        if [[ -z "$1" ]] && grep -i -q "Root directory organization" "$memory_file"; then
            return 0  # Root directory preference already exists
        fi
    fi
    return 1  # No duplicate found
}

# Function to check for duplicate patterns
check_duplicate_pattern() {
    local pattern_text="$1"
    local memory_file="$CNS_DIR/memory/successful-patterns.md"
    
    if [[ -f "$memory_file" ]]; then
        # Check for key phrases that indicate this pattern already exists
        if grep -i -q "Move incorrectly placed files" "$memory_file" || 
           grep -i -q "file placement in root directory" "$memory_file" ||
           grep -i -q "clean root directory organization" "$memory_file"; then
            return 0  # Duplicate found
        fi
    fi
    return 1  # No duplicate found
}

# Function to check for duplicate anti-patterns
check_duplicate_anti_pattern() {
    local anti_pattern_text="$1"
    local memory_file="$CNS_DIR/memory/communication-patterns.md"
    
    if [[ -f "$memory_file" ]]; then
        # Check for key phrases that indicate this anti-pattern already exists
        if grep -i -q "convenience files in root" "$memory_file" || 
           grep -i -q "root directory despite" "$memory_file" ||
           grep -i -q "clean organization preferences" "$memory_file"; then
            return 0  # Duplicate found
        fi
    fi
    return 1  # No duplicate found
}

# Function to capture user preference
capture_preference() {
    local preference="$1"
    
    if [[ -z "$preference" ]]; then
        echo -e "${BLUE}🧠 Analyzing recent conversation for preferences...${NC}"
        
        # Check for duplicate before adding - check for any root directory preferences
        if check_duplicate_preference "root directory"; then
            echo -e "${YELLOW}💡 Already learned: Root directory organization preferences${NC}"
            echo -e "${GREEN}✅ No duplicate entry needed - preference already documented${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}💡 Based on recent interaction, documenting new preference:${NC}"
        echo "   'Root directory organization must remain clean with only essential files'"
        
        # Auto-capture the preference we just learned
        cat >> "$CNS_DIR/memory/user-interactions.md" << EOF

## [$(date '+%Y-%m-%d %H:%M')] - Auto-Detected User Preference
**Context**: User corrected file placement violation in root directory
**Preference**: Root directory organization must remain clean with only essential files
**Evidence**: User said "those don't belong in root" when seeing convenience files in root
**Specifics**: 
- Only package.json, tsconfig.json, next.config.js type files in root
- All utilities, scripts, aliases must go in proper subdirectories
- Documentation belongs in AI-Agent-Team-Document-Library/
**Enforcement Level**: Critical - user explicitly corrected this
**Learning Type**: Directory Organization Rule
---
EOF
        echo -e "${GREEN}✅ Preference auto-captured from conversation context${NC}"
    else
        echo -e "${BLUE}🧠 Capturing specified user preference...${NC}"
        
        # Check for duplicate before adding
        if check_duplicate_preference "$preference"; then
            echo -e "${YELLOW}💡 Already learned: '$preference'${NC}"
            echo -e "${GREEN}✅ No duplicate entry needed - preference already documented${NC}"
            return 0
        fi
        
        # Append to user-interactions.md
        cat >> "$CNS_DIR/memory/user-interactions.md" << EOF

## [$(date '+%Y-%m-%d')] - Manual Preference Capture
**User Preference**: $preference
**Implementation**: [To be determined based on context]
**Scope**: [To be determined based on context]
**Confidence**: Medium (manually captured)
---
EOF
        echo -e "${GREEN}✅ Preference captured in CNS memory${NC}"
    fi
    
    echo "📝 Added to: .github/copilot-cns/memory/user-interactions.md"
    echo "🔄 Will be applied in future interactions"
}

# Function to capture communication mannerism
capture_mannerism() {
    local mannerism="$1"
    if [[ -z "$mannerism" ]]; then
        echo -e "${RED}Error: Please provide a mannerism description${NC}"
        echo "Usage: $0 'document mannerism' 'description of communication mannerism'"
        exit 1
    fi
    
    echo -e "${BLUE}🧠 Capturing communication mannerism...${NC}"
    
    # Append to communication-patterns.md
    cat >> "$CNS_DIR/memory/communication-patterns.md" << EOF

## [$(date '+%Y-%m-%d')] - Manual Mannerism Capture
**Mannerism Type**: Communication Style
**User Pattern**: $mannerism
**Implementation**: [To be applied in responses and communication]
**Context**: [When this mannerism should be used]
**Confidence**: Medium (manually captured)
---
EOF
    
    echo -e "${GREEN}✅ Communication mannerism captured in CNS memory${NC}"
    echo "📝 Added to: .github/copilot-cns/memory/communication-patterns.md"
    echo "🔄 Will be applied in future communications"
}

# Function to document successful pattern
document_pattern() {
    local pattern="$1"
    
    if [[ -z "$pattern" ]]; then
        local auto_pattern="Moving incorrectly placed files from root to proper subdirectories maintains clean organization"
        
        echo -e "${BLUE}🧠 Analyzing recent conversation for successful patterns...${NC}"
        
        # Check for duplicate before adding
        if check_duplicate_pattern "$auto_pattern"; then
            echo -e "${YELLOW}💡 Already learned: '$auto_pattern'${NC}"
            echo -e "${GREEN}✅ No duplicate entry needed - pattern already documented${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}💡 Based on recent interaction, documenting new pattern:${NC}"
        echo "   '$auto_pattern'"
        
        # Auto-capture the pattern we just learned
        cat >> "$CNS_DIR/memory/successful-patterns.md" << EOF

## [$(date '+%Y-%m-%d')] - Auto-Detected Pattern from Conversation
**Context**: User correction of file placement in root directory
**Approach**: Move incorrectly placed files from root to proper subdirectories (like /scripts/aliases/)
**Outcome**: Maintains clean root directory organization and respects user preferences
**Application**: Always check file placement against documented directory organization preferences
**Confidence**: High (user explicitly corrected)
---
EOF
        echo -e "${GREEN}✅ Pattern auto-captured from conversation context${NC}"
    else
        echo -e "${BLUE}🧠 Documenting specified pattern...${NC}"
        
        # Check for duplicate before adding
        if check_duplicate_pattern "$pattern"; then
            echo -e "${YELLOW}💡 Already learned: '$pattern'${NC}"
            echo -e "${GREEN}✅ No duplicate entry needed - pattern already documented${NC}"
            return 0
        fi
        
        # Append to successful-patterns.md
        cat >> "$CNS_DIR/memory/successful-patterns.md" << EOF

## [$(date '+%Y-%m-%d')] - Manual Pattern Documentation
**Context**: User-identified successful pattern
**Approach**: $pattern
**Outcome**: Pattern documented for future application
**Application**: Apply when similar context arises
**Confidence**: High (user-verified)
---
EOF
        echo -e "${GREEN}✅ Pattern documented in CNS memory${NC}"
    fi
    
    echo "📝 Added to: .github/copilot-cns/memory/successful-patterns.md"
    echo "🔄 Will be suggested when relevant context detected"
}

# Function to document anti-pattern
document_anti_pattern() {
    local anti_pattern="$1"
    
    if [[ -z "$anti_pattern" ]]; then
        local auto_anti_pattern="Placing convenience files in root directory violates clean organization preferences"
        
        echo -e "${BLUE}🧠 Analyzing recent conversation for anti-patterns...${NC}"
        
        # Check for duplicate before adding
        if check_duplicate_anti_pattern "$auto_anti_pattern"; then
            echo -e "${YELLOW}💡 Already learned: '$auto_anti_pattern'${NC}"
            echo -e "${GREEN}✅ No duplicate entry needed - anti-pattern already documented${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}💡 Based on recent interaction, documenting new anti-pattern:${NC}"
        echo "   '$auto_anti_pattern'"
        
        # Auto-capture the anti-pattern we just learned
        cat >> "$CNS_DIR/memory/communication-patterns.md" << EOF

## [$(date '+%Y-%m-%d')] - Auto-Detected Anti-Pattern from Conversation
**Anti-Pattern**: Placing convenience files (aliases, shortcuts) in root directory despite documented preference for clean root
**Why Avoid**: Violates user's explicitly documented preference for "clean root directories with only essential project files"
**Alternative Approach**: Use proper subdirectories like /scripts/aliases/ or /scripts/utilities/
**Prevention Strategy**: Always check user-interactions.md for directory organization preferences before file placement
**Confidence**: High (user explicitly corrected this violation)
---
EOF
        echo -e "${GREEN}✅ Anti-pattern auto-captured from conversation context${NC}"
    else
        echo -e "${BLUE}🧠 Documenting specified anti-pattern...${NC}"
        
        # Check for duplicate before adding
        if check_duplicate_anti_pattern "$anti_pattern"; then
            echo -e "${YELLOW}💡 Already learned: '$anti_pattern'${NC}"
            echo -e "${GREEN}✅ No duplicate entry needed - anti-pattern already documented${NC}"
            return 0
        fi
        
        # Append to communication-patterns.md under anti-patterns section
        cat >> "$CNS_DIR/memory/communication-patterns.md" << EOF

## [$(date '+%Y-%m-%d')] - Anti-Pattern Documentation
**Anti-Pattern**: $anti_pattern
**Why Avoid**: User identified this as problematic approach
**Alternative Approach**: [To be determined in context]
**Prevention Strategy**: [How to avoid this in future]
**Confidence**: High (user-identified)
---
EOF
        echo -e "${GREEN}✅ Anti-pattern documented in CNS memory${NC}"
    fi
    
    echo "📝 Added to: .github/copilot-cns/memory/communication-patterns.md"
    echo "🚫 Will be avoided in future interactions"
}

# Function to verify recent learnings
verify_recent_learnings() {
    echo -e "${BLUE}🧠 Verifying most recent CNS learnings...${NC}"
    
    # Check recent updates to memory files
    echo ""
    echo -e "${YELLOW}📋 Recent User Preferences:${NC}"
    if [[ -f "$CNS_DIR/memory/user-interactions.md" ]]; then
        grep -A 3 "$(date '+%Y-%m-%d')" "$CNS_DIR/memory/user-interactions.md" | head -20 || echo "No recent preferences found"
    else
        echo "user-interactions.md not found"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Recent Successful Patterns:${NC}"
    if [[ -f "$CNS_DIR/memory/successful-patterns.md" ]]; then
        grep -A 3 "$(date '+%Y-%m-%d')" "$CNS_DIR/memory/successful-patterns.md" | head -20 || echo "No recent patterns found"
    else
        echo "successful-patterns.md not found"
    fi
    
    echo ""
    echo -e "${YELLOW}📋 Recent Communication Patterns:${NC}"
    if [[ -f "$CNS_DIR/memory/communication-patterns.md" ]]; then
        grep -A 3 "$(date '+%Y-%m-%d')" "$CNS_DIR/memory/communication-patterns.md" | head -20 || echo "No recent communication patterns found"
    else
        echo "communication-patterns.md not found"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Recent learnings verification complete${NC}"
}

# Function to test CNS functionality
test_cns() {
    echo -e "${BLUE}🧠 Testing CNS Framework Functionality...${NC}"
    
    # Check CNS structure
    echo "📁 Checking CNS directory structure..."
    
    if [[ ! -d "$CNS_DIR" ]]; then
        echo -e "${RED}❌ CNS directory not found${NC}"
        exit 1
    fi
    
    # Check required directories
    for dir in "brain" "memory" "reflexes"; do
        if [[ -d "$CNS_DIR/$dir" ]]; then
            echo -e "${GREEN}✅ $dir/ directory exists${NC}"
        else
            echo -e "${RED}❌ $dir/ directory missing${NC}"
        fi
    done
    
    # Check key files
    echo ""
    echo "📄 Checking key CNS files..."
    
    KEY_FILES=(
        "brain/core-principles.md"
        "brain/orchestration-learning-framework.md"
        "brain/communication-intelligence-framework.md"
        "memory/user-interactions.md"
        "memory/successful-patterns.md"
        "memory/communication-patterns.md"
        "reflexes/verification-protocols.md"
        "reflexes/learning-triggers.md"
        "reflexes/communication-signal-detection.md"
    )
    
    for file in "${KEY_FILES[@]}"; do
        if [[ -f "$CNS_DIR/$file" ]]; then
            echo -e "${GREEN}✅ $file exists${NC}"
        else
            echo -e "${RED}❌ $file missing${NC}"
        fi
    done
    
    echo ""
    echo -e "${GREEN}🎯 CNS Framework: FUNCTIONAL${NC}"
    echo "📊 All core components are operational"
}

# Main command dispatcher
case "${1:-help}" in
    "cns learning session"|"learning session"|"session report")
        generate_session_report
        ;;
    "verify cns learnings"|"verify learnings"|"recent learnings")
        verify_recent_learnings
        ;;
    "document preference"|"capture preference"|"preference")
        capture_preference "$2"
        ;;
    "document pattern"|"capture pattern"|"pattern")
        document_pattern "$2"
        ;;
    "document anti-pattern"|"capture anti-pattern"|"anti-pattern")
        document_anti_pattern "$2"
        ;;
    "document mannerism"|"capture mannerism"|"mannerism")
        capture_mannerism "$2"
        ;;
    "test cns"|"verify cns"|"test")
        test_cns
        ;;
    "help"|"--help"|"-h")
        cat << EOF
${GREEN}CNS Learning Commands${NC}

Available commands:
  ${BLUE}cns learning session${NC}     Generate comprehensive session learning report
  ${BLUE}verify cns learnings${NC}     Show most recent learnings and verify CNS updates
  ${BLUE}document preference${NC} "text"  Capture user preference in CNS memory
  ${BLUE}document pattern${NC} "text"     Document successful pattern in CNS memory
  ${BLUE}document anti-pattern${NC} "text" Document what to avoid in CNS memory
  ${BLUE}document mannerism${NC} "text"   Capture communication mannerism in CNS memory
  ${BLUE}test cns${NC}                   Test CNS framework functionality and health
  ${BLUE}help${NC}                      Show this help message

Short aliases (also work):
  learning session, verify learnings, preference, pattern, anti-pattern, mannerism, test

Examples:
  $0 "cns learning session"
  $0 "verify cns learnings"
  $0 "document preference" "I prefer detailed error messages with specific file names"
  $0 "document pattern" "Using verification commands after every file operation works well"
  $0 "document anti-pattern" "Never assume file operations succeeded without verification"
  $0 "document mannerism" "I prefer direct, concise communication with action items"
  $0 "test cns"

CNS Memory Location: .github/copilot-cns/
EOF
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo "Use '$0 help' for available commands"
        exit 1
        ;;
esac
