#!/bin/bash

echo "🤖 LLM Configuration Selector"
echo "Choose your preferred language model for optimization:"
echo ""
echo "1. Claude (Anthropic) - Advanced reasoning and analysis"
echo "2. GPT (OpenAI) - Versatile and widely compatible"
echo "3. Gemini (Google) - Multimodal and context-aware"
echo "4. Default (Generic) - Works with any LLM"
echo ""

read -p "Enter choice (1-4): " choice

case $choice in
    1)
        cd .github/llm-config/
        rm -f current.md
        ln -s claude.md current.md
        echo "✅ Configured for Claude (Anthropic)"
        echo "📋 Claude-specific optimizations:"
        echo "   - Enhanced analytical reasoning"
        echo "   - Large context window utilization"
        echo "   - Safety and helpfulness focus"
        ;;
    2)
        cd .github/llm-config/
        rm -f current.md
        ln -s gpt.md current.md
        echo "✅ Configured for GPT (OpenAI)"
        echo "📋 GPT-specific optimizations:"
        echo "   - Versatile task handling"
        echo "   - Code generation focus"
        echo "   - Broad compatibility"
        ;;
    3)
        cd .github/llm-config/
        rm -f current.md
        ln -s gemini.md current.md
        echo "✅ Configured for Gemini (Google)"
        echo "📋 Gemini-specific optimizations:"
        echo "   - Multimodal capabilities"
        echo "   - Context awareness"
        echo "   - Integration features"
        ;;
    4)
        cd .github/llm-config/
        rm -f current.md
        ln -s default.md current.md
        echo "✅ Configured for Default/Generic LLM"
        echo "📋 Generic optimizations:"
        echo "   - LLM-agnostic instructions"
        echo "   - Universal compatibility"
        echo "   - Basic functionality"
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📝 LLM configuration updated"
echo "💡 You can change this anytime by running this script again"
echo "🔗 Configuration file: .github/llm-config/current.md"
