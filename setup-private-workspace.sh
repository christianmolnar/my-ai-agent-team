#!/bin/bash

# AI Agent Team - Private Workspace Setup Script
# This script helps new users set up their private data repository
# for use with the AI Agent Team framework

echo "🚀 AI Agent Team - Private Workspace Setup"
echo "=========================================="
echo ""
echo "This script will help you set up a private repository for your personal"
echo "data, identity information, and private operations to work with the"
echo "AI Agent Team framework."
echo ""
echo "Choose your setup option:"
echo ""
echo "1. 📁 Create separate private repository (RECOMMENDED)"
echo "   - Keeps private data in separate Git repository"
echo "   - Best security and organization"
echo "   - Allows private GitHub repository or local-only"
echo ""
echo "2. 🔀 Add private folder to this repository"
echo "   - Adds private data to current repository"
echo "   - Uses .gitignore to exclude from public commits"
echo "   - Good for simple local development"
echo ""
echo "3. 💻 Local-only private data (no version control)"
echo "   - Creates private folder structure locally"
echo "   - No version control for private data"
echo "   - Simplest setup but no backup/sync"
echo ""

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Setting up separate private repository..."
        echo ""
        echo "Please provide the following information:"
        read -p "📁 Private repository path (e.g., /Users/yourname/Repos/my-ai-private): " private_path
        read -p "👤 Your name for templates: " user_name
        read -p "📧 Your email for templates: " user_email
        
        echo ""
        echo "Creating private repository structure..."
        
        # Create the directory structure
        mkdir -p "$private_path"/{identity/{about-me,communications-agent,researcher-agent,project-coordinator,shared},business-operations,team-data/people,working/{drafts,temp,projects-in-progress,archive},resources/{templates,scripts,documentation},config}
        
        # Create template files
        echo "# About Me - AI Agent Identity Context" > "$private_path/identity/about-me/about_me.md"
        echo "# Tone and Style Guide for Communications Agent" > "$private_path/identity/communications-agent/tone-and-style-guide.md"
        echo "# AI Interaction Guidelines" > "$private_path/identity/shared/ai-interaction-guidelines.md"
        
        # Create VS Code workspace
        cat > "$private_path/../ai-agent-workspace.code-workspace" << WORKSPACE_EOF
{
    "folders": [
        {
            "name": "🤖 AI Agent Team (Public)",
            "path": "./My-AI-Agent-Team"
        },
        {
            "name": "🔒 Private Data",
            "path": "./$(basename "$private_path")"
        }
    ],
    "settings": {
        "files.exclude": {
            "**/node_modules": true,
            "**/.git": true,
            "**/dist": true,
            "**/build": true
        }
    }
}
WORKSPACE_EOF
        
        echo "✅ Private repository structure created!"
        echo "📁 Location: $private_path"
        echo "⚙️  VS Code workspace created: $(dirname "$private_path")/ai-agent-workspace.code-workspace"
        echo ""
        echo "Next steps:"
        echo "1. 📝 Fill in your personal information in the identity/ folder"
        echo "2. 🔧 Configure agent-specific settings"
        echo "3. 🚀 Open the workspace file in VS Code"
        echo "4. 📚 Read the integration documentation"
        ;;
    2)
        echo "🔀 Adding private folder to current repository..."
        # Implementation for option 2
        echo "⚠️  This option is coming soon!"
        ;;
    3)
        echo "💻 Creating local-only private data structure..."
        # Implementation for option 3
        echo "⚠️  This option is coming soon!"
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1, 2, or 3."
        exit 1
        ;;
esac

echo ""
echo "🎉 Setup complete! Your AI Agent Team is ready to use."
echo "📖 Check the documentation for next steps and integration guides."
