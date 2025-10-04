#!/bin/bash

# 🚀 AI Agent Team - Master Setup Script
# Complete guided setup for the AI Agent Team ecosystem

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${PURPLE}===========================================${NC}"
    echo -e "${PURPLE}$1${NC}"
    echo -e "${PURPLE}===========================================${NC}\n"
}

print_step() {
    echo -e "${BLUE}➤ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

ask_yes_no() {
    local question="$1"
    local default="${2:-y}"
    local response
    
    if [[ "$default" == "y" ]]; then
        echo -e "${YELLOW}$question [Y/n]:${NC} "
    else
        echo -e "${YELLOW}$question [y/N]:${NC} "
    fi
    
    read -r response
    response=${response:-$default}
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

check_prerequisites() {
    print_header "🔍 CHECKING PREREQUISITES"
    
    local missing_deps=()
    
    # Check Node.js
    if command -v node &> /dev/null; then
        local node_version=$(node --version | cut -d 'v' -f 2)
        local major_version=$(echo $node_version | cut -d '.' -f 1)
        
        if [[ $major_version -ge 18 ]]; then
            print_success "Node.js $node_version (✅ Compatible)"
        else
            print_error "Node.js $node_version (❌ Need 18+)"
            missing_deps+=("node")
        fi
    else
        print_error "Node.js not found (❌ Required)"
        missing_deps+=("node")
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version)
        print_success "npm $npm_version"
    else
        print_error "npm not found (❌ Required)"
        missing_deps+=("npm")
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        local git_version=$(git --version | cut -d ' ' -f 3)
        print_success "Git $git_version"
    else
        print_error "Git not found (❌ Required)"
        missing_deps+=("git")
    fi
    
    # Check VS Code (optional)
    if command -v code &> /dev/null; then
        print_success "VS Code (✅ Recommended)"
    else
        print_warning "VS Code not found (⚠️  Recommended for full experience)"
    fi
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        echo -e "\n${YELLOW}Please install missing dependencies and run this script again.${NC}"
        echo -e "${CYAN}Node.js 18+: https://nodejs.org/${NC}"
        echo -e "${CYAN}Git: https://git-scm.com/${NC}"
        echo -e "${CYAN}VS Code: https://code.visualstudio.com/${NC}"
        exit 1
    fi
    
    print_success "All prerequisites met!"
}

install_dependencies() {
    print_header "📦 INSTALLING DEPENDENCIES"
    
    if [[ -f "package-lock.json" ]]; then
        print_step "Installing npm dependencies..."
        npm ci
    else
        print_step "Installing npm dependencies..."
        npm install
    fi
    
    print_success "Dependencies installed successfully!"
}

setup_environment() {
    print_header "🔧 ENVIRONMENT CONFIGURATION"
    
    if [[ ! -f ".env.local" ]]; then
        if [[ -f ".env.example" ]]; then
            print_step "Creating .env.local from template..."
            cp .env.example .env.local
            print_warning "Please edit .env.local with your API keys before starting development"
            print_info "See AI-Agent-Team-Document-Library/implementation-guides/api-keys-setup.md for details"
        else
            print_step "Creating basic .env.local..."
            cat > .env.local << 'EOF'
# AI Agent Team - Environment Configuration
# See AI-Agent-Team-Document-Library/implementation-guides/api-keys-setup.md for setup guide

# Claude API (Required for Personal Assistant)
ANTHROPIC_API_KEY=your_claude_api_key_here

# Optional AI Services
OPENAI_API_KEY=your_openai_api_key_here
HUGGINGFACE_API_KEY=your_huggingface_api_key_here

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
            print_warning "Created .env.local - please add your API keys before development"
        fi
    else
        print_success ".env.local already exists"
    fi
}

setup_github_copilot() {
    print_header "🤖 GITHUB COPILOT CNS SETUP"
    
    if ask_yes_no "Set up personalized GitHub Copilot CNS?" "y"; then
        if [[ -f ".github/setup/personalize.sh" ]]; then
            print_step "Running GitHub Copilot personalization setup..."
            bash .github/setup/personalize.sh
        else
            print_warning "GitHub Copilot setup script not found"
            print_info "Manual setup: Edit .github/about-me/user-profile.md"
        fi
        
        if ask_yes_no "Configure AI model preference (Claude/GPT/Gemini)?" "y"; then
            if [[ -f ".github/setup/llm-selector.sh" ]]; then
                bash .github/setup/llm-selector.sh
            else
                print_warning "LLM selector script not found"
            fi
        fi
    else
        print_info "Skipping GitHub Copilot setup - you can run .github/setup/personalize.sh later"
    fi
}

verify_build() {
    print_header "🏗️ BUILD VERIFICATION"
    
    if ask_yes_no "Run build verification test?" "y"; then
        print_step "Testing TypeScript compilation..."
        if npm run build > /dev/null 2>&1; then
            print_success "Build successful!"
        else
            print_error "Build failed - please check for TypeScript errors"
            return 1
        fi
    else
        print_info "Skipping build verification"
        print_warning "Consequence: Unknown if project will compile successfully"
    fi
}

run_tests() {
    print_header "🧪 TEST SUITE"
    
    if ask_yes_no "Run test suite to verify setup?" "y"; then
        print_step "Running tests..."
        if npm test > /dev/null 2>&1; then
            print_success "All tests passed!"
        else
            print_warning "Some tests failed - this may be normal for development setup"
            print_info "Check npm test output for details"
        fi
    else
        print_info "Skipping tests"
        print_warning "Consequence: Unknown if core functionality is working"
    fi
}

setup_development_tools() {
    print_header "🛠️ DEVELOPMENT TOOLS"
    
    if ask_yes_no "Set up additional development tools?" "y"; then
        # Git hooks
        if ask_yes_no "Install Git hooks for code quality?" "y"; then
            if [[ -f "scripts/setup/install-git-hooks.sh" ]]; then
                bash scripts/setup/install-git-hooks.sh
                print_success "Git hooks installed"
            else
                print_info "Git hooks script not found - creating basic pre-commit hook"
                mkdir -p .git/hooks
                cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Basic pre-commit hook
npm run lint --silent
EOF
                chmod +x .git/hooks/pre-commit
                print_success "Basic pre-commit hook installed"
            fi
        fi
        
        # VS Code extensions
        if command -v code &> /dev/null; then
            if ask_yes_no "Install recommended VS Code extensions?" "y"; then
                print_step "Installing VS Code extensions..."
                code --install-extension ms-vscode.vscode-typescript-next
                code --install-extension GitHub.copilot
                code --install-extension GitHub.copilot-chat
                code --install-extension bradlc.vscode-tailwindcss
                code --install-extension esbenp.prettier-vscode
                print_success "VS Code extensions installed"
            fi
        fi
    else
        print_info "Skipping development tools"
        print_warning "Consequence: Manual setup of Git hooks and VS Code extensions needed"
    fi
}

setup_path_configuration() {
    print_header "⚙️ PATH CONFIGURATION"
    
    local project_scripts="$PWD/scripts"
    local shell_config=""
    
    # Detect shell and config file
    if [[ "$SHELL" == *"bash"* ]]; then
        shell_config="$HOME/.bashrc"
    elif [[ "$SHELL" == *"zsh"* ]]; then
        shell_config="$HOME/.zshrc"
    else
        shell_config="$HOME/.profile"
    fi
    
    print_info "Detected shell: $SHELL"
    print_info "Config file: $shell_config"
    
    if ask_yes_no "Add CNS commands to PATH for easy access (enables 'cns' command)?" "y"; then
        # Check if already in PATH config
        if [[ -f "$shell_config" ]] && grep -q "$project_scripts" "$shell_config"; then
            print_success "CNS scripts already in PATH configuration"
        else
            print_step "Adding scripts to PATH in $shell_config..."
            
            # Create config file if it doesn't exist
            touch "$shell_config"
            
            # Add PATH configuration
            echo "" >> "$shell_config"
            echo "# AI Agent Team CNS Commands" >> "$shell_config"
            echo "export PATH=\"\$PATH:$project_scripts\"" >> "$shell_config"
            
            print_success "CNS scripts added to PATH"
            print_info "Restart your terminal or run: source $shell_config"
        fi
        
        # Set PATH for current session
        export PATH="$PATH:$project_scripts"
        print_success "CNS commands available in current session"
        
        # Test the command
        if command -v cns &> /dev/null; then
            print_success "✅ CNS command test: 'cns' works!"
        else
            print_warning "CNS command not immediately available - restart terminal"
        fi
    else
        print_info "Skipping PATH setup"
        print_warning "Consequence: You'll need to use './scripts/cns' instead of just 'cns'"
    fi
}

start_development_server() {
    print_header "🚀 STARTING DEVELOPMENT"
    
    if ask_yes_no "Start the development server now?" "y"; then
        print_step "Starting development server..."
        print_info "Server will start at http://localhost:3000"
        print_info "Personal Assistant UI: http://localhost:3000/personal-assistant"
        print_info "Press Ctrl+C to stop the server"
        echo -e "\n${GREEN}🎉 Setup complete! Starting development server...${NC}\n"
        npm run dev
    else
        print_info "Skipping development server start"
        echo -e "\n${GREEN}🎉 Setup complete!${NC}"
        echo -e "\n${CYAN}To start development:${NC}"
        echo -e "  ${YELLOW}npm run dev${NC}"
        echo -e "\n${CYAN}To access the system:${NC}"
        echo -e "  ${YELLOW}http://localhost:3000${NC}"
        echo -e "  ${YELLOW}http://localhost:3000/personal-assistant${NC}"
    fi
}

display_next_steps() {
    print_header "📋 NEXT STEPS"
    
    echo -e "${CYAN}Essential Next Steps:${NC}"
    echo -e "1. ${YELLOW}Edit .env.local${NC} - Add your API keys (especially Claude for Personal Assistant)"
    echo -e "2. ${YELLOW}Review API setup guide${NC} - AI-Agent-Team-Document-Library/implementation-guides/api-keys-setup.md"
    echo -e "3. ${YELLOW}Explore the Personal Assistant${NC} - http://localhost:3000/personal-assistant"
    
    echo -e "\n${CYAN}CNS Commands:${NC}"
    echo -e "• ${GREEN}cns \"help\"${NC} - Show all CNS commands"
    echo -e "• ${GREEN}cns \"document my preference\"${NC} - CNS learning commands"
    echo -e "• ${GREEN}cns \"do CNS learning session\"${NC} - Generate learning reports"
    echo -e "• ${GREEN}cns \"verify your learnings\"${NC} - Check recent learnings"
    
    echo -e "\n${CYAN}Optional Enhancements:${NC}"
    echo -e "4. ${YELLOW}Customize GitHub Copilot${NC} - Edit .github/about-me/user-profile.md"
    echo -e "5. ${YELLOW}Review documentation${NC} - AI-Agent-Team-Document-Library/"
    echo -e "6. ${YELLOW}Explore agent capabilities${NC} - agents/ directory"
    
    echo -e "\n${CYAN}Need Help?${NC}"
    echo -e "• ${YELLOW}Documentation${NC}: AI-Agent-Team-Document-Library/"
    echo -e "• ${YELLOW}Quick troubleshooting${NC}: .github/setup/verify-setup.sh"
    echo -e "• ${YELLOW}Architecture overview${NC}: START-HERE.md"
}

# Main execution
main() {
    echo -e "${PURPLE}"
    echo "  ╔═══════════════════════════════════════════════════════════╗"
    echo "  ║                                                           ║"
    echo "  ║           🚀 AI AGENT TEAM MASTER SETUP 🚀               ║"
    echo "  ║                                                           ║"
    echo "  ║     Complete guided setup for your AI agent ecosystem     ║"
    echo "  ║                                                           ║"
    echo "  ╚═══════════════════════════════════════════════════════════╝"
    echo -e "${NC}\n"
    
    print_info "This script will guide you through the complete setup process"
    print_info "You can skip any step - we'll explain the consequences"
    
    if ! ask_yes_no "Continue with setup?" "y"; then
        echo -e "\n${YELLOW}Setup cancelled. Run './scripts/setup/master-setup.sh' anytime to start over.${NC}"
        exit 0
    fi
    
    # Execute setup steps
    check_prerequisites
    install_dependencies
    setup_environment
    setup_github_copilot
    setup_path_configuration
    verify_build
    run_tests
    setup_development_tools
    start_development_server
    
    # Show next steps
    display_next_steps
}

# Run main function
main "$@"
