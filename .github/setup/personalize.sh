#!/bin/bash

echo "👤 Repository Personalization Setup"
echo "This will help you customize the repository for personal use."
echo ""

# Check if templates exist
if [ ! -f ".github/about-me/user-profile.template.md" ]; then
    echo "❌ Error: Template files not found. Run from repository root."
    exit 1
fi

echo "📋 Setting up personal profile templates..."

cd .github/about-me/

# Copy templates to personal files
cp user-profile.template.md user-profile.md

echo "✅ Personal profile files created:"
echo "   - user-profile.md"
echo ""

echo "📝 Next steps:"
echo "1. Edit .github/about-me/user-profile.md with your information"
echo "2. Replace all [placeholders] with your actual details"
echo "3. Consider privacy settings for public vs private repositories"
echo ""

# Ask about privacy
read -p "🔒 Add personal files to .gitignore for privacy? (y/n): " privacy_choice

if [ "$privacy_choice" = "y" ] || [ "$privacy_choice" = "Y" ]; then
    echo "✅ Personal files already configured in .gitignore"
else
    echo "ℹ️  Personal files will be included in repository commits"
    echo "# Personal data override" >> .gitignore
    echo "!user-profile.md" >> .gitignore
fi

echo ""
echo "🎉 Personalization setup complete!"
echo "💡 You can run this script again anytime to reset templates"
