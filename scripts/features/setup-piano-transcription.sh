#!/bin/bash

# Piano Transcription Service Setup Script
# This script installs the required dependencies for piano transcription

echo "🎹 Setting up Piano Transcription Service..."

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

echo "🐍 Checking Python dependencies..."

# Check if Python 3 is available
if ! command_exists python3; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.8+"
    exit 1
fi

# Install Python dependencies
echo "Installing Python packages for audio processing..."
pip3 install librosa numpy scipy pretty_midi aubio music21

# Check if yt-dlp is installed
if ! command_exists yt-dlp; then
    echo "📺 Installing yt-dlp for YouTube audio downloads..."
    
    # Try different installation methods
    if command_exists brew; then
        brew install yt-dlp
    elif command_exists pip3; then
        pip3 install yt-dlp
    else
        echo "❌ Could not install yt-dlp. Please install manually:"
        echo "   brew install yt-dlp  (on macOS)"
        echo "   pip3 install yt-dlp  (with pip)"
        exit 1
    fi
fi

# Check if ffmpeg is installed
if ! command_exists ffmpeg; then
    echo "🎵 Installing ffmpeg for audio processing..."
    
    if command_exists brew; then
        brew install ffmpeg
    else
        echo "❌ Could not install ffmpeg. Please install manually:"
        echo "   brew install ffmpeg  (on macOS)"
        echo "   sudo apt-get install ffmpeg  (on Ubuntu)"
        exit 1
    fi
fi

# Create temp directory
mkdir -p /tmp/piano-transcription

echo "🔑 Setting up API keys..."
echo ""
echo "To use Hugging Face models (free), you need an API key:"
echo "1. Go to https://huggingface.co/settings/tokens"
echo "2. Create a new token (read access is sufficient)"
echo "3. Add it to your .env.local file as MUSIC_COACH_HUGGINGFACE_API_KEY="
echo ""

echo "✅ Piano Transcription Service setup complete!"
echo ""
echo "🚀 You can now:"
echo "   • Visit http://localhost:3000/piano-transcription to test the interface"
echo "   • POST to /api/transcribe-piano with a YouTube URL"
echo ""
echo "📚 Supported formats:"
echo "   • MIDI files (.mid) - Compatible with most DAWs"
echo "   • MusicXML (.xml) - Compatible with MuseScore, Finale, Sibelius"  
echo "   • ABC notation - Text-based sheet music format"
echo ""
echo "💡 Pro tip: For best results, use YouTube videos with:"
echo "   • Clear, solo piano performances"
echo "   • Minimal background noise"
echo "   • Duration under 2 minutes"
