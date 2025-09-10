#!/bin/bash

# Guitar Tab Service Setup Script
# Sets up dependencies for guitar tablature search and download

echo "🎸 Setting up Guitar Tab Service..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the My-AI-Agent-Team directory"
    exit 1
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "📦 Installing Node.js dependencies..."
npm install

echo "🐍 Checking Python dependencies for Guitar Pro conversion..."

# Check if Python 3 is available
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+"
    exit 1
fi

# Install Python dependencies for Guitar Pro conversion
echo "Installing Python packages for Guitar Pro processing..."
pip3 install guitarpro pretty_midi mido

# Check if TuxGuitar CLI is available (optional)
if command_exists tuxguitar-cli; then
    echo "✅ TuxGuitar CLI found - will use for GP5 conversion"
else
    echo "⚠️  TuxGuitar CLI not found - will use Python fallback"
    echo "   To install TuxGuitar: https://tuxguitar.app/"
fi

# Create temp directory for tabs
mkdir -p /tmp/guitar-tabs

echo "🔍 Testing Songsterr API connectivity..."
curl -s "https://www.songsterr.com/a/ra/songs.json?pattern=test" > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Songsterr API is accessible"
else
    echo "⚠️  Songsterr API test failed - might be rate limited"
fi

echo "✅ Guitar Tab Service setup complete!"
echo ""
echo "🚀 You can now:"
echo "   • Visit http://localhost:3002/guitar-tabs to search and download tabs"
echo "   • POST to /api/guitar-tabs to use the API directly"
echo ""
echo "📚 Supported formats:"
echo "   • Guitar Pro (.gp5) - Professional tablature files"
echo "   • MIDI (.mid) - Compatible with music software"
echo "   • ASCII tabs - Simple text-based tablature"
echo ""
echo "🎵 Features:"
echo "   • Search Songsterr's database of 500,000+ tabs"
echo "   • Download in multiple formats"
echo "   • Extract drum tracks to MIDI"
echo "   • Browse popular and trending tabs"
echo ""
echo "💡 No API keys required - Songsterr provides free public access!"
