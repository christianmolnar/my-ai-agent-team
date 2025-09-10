#!/bin/bash

# The 21 official agents according to AGENT-ROSTER-SPECIFICATION.md
official_agents=(
    "master-orchestrator"
    "project-coordinator"
    "communications-agent"
    "researcher-agent"
    "image-video-generator"
    "personal-assistant-agent"
    "personal-assistant-bridge"
    "product-manager"
    "data-scientist"
    "dev-design-doc-creator"
    "experience-designer"
    "full-stack-developer"
    "back-end-developer"
    "front-end-developer"
    "test-expert"
    "monitoring-expert"
    "availability-reliability-expert"
    "performance-expert"
    "security-expert"
    "privacy-guardian"
    "music-coach"
)

# Get current agent folders
agents_dir="/Users/christian/Repos/My-AI-Agent-Team/app/agents"
cd "$agents_dir"

echo "=== AGENT FOLDER CLEANUP ==="
echo "Checking against AGENT-ROSTER-SPECIFICATION.md..."
echo

# Check each folder
for folder in */; do
    # Remove trailing slash
    folder_name="${folder%/}"
    
    # Skip special folders
    if [[ "$folder_name" == "[agentId]" ]] || [[ "$folder_name" == "ai-config" ]]; then
        echo "✅ KEEPING: $folder_name (special folder)"
        continue
    fi
    
    # Check if it's in the official list
    found=false
    for official in "${official_agents[@]}"; do
        if [[ "$folder_name" == "$official" ]]; then
            found=true
            break
        fi
    done
    
    if $found; then
        echo "✅ KEEPING: $folder_name (official agent)"
    else
        echo "❌ REMOVING: $folder_name (NOT in specification)"
        rm -rf "$folder_name"
    fi
done

echo
echo "=== CLEANUP COMPLETE ==="
echo "Remaining agent folders:"
ls -1 | sort
