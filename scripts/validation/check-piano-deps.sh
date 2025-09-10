#!/bin/bash

# Check if all required dependencies are installed for piano transcription

echo "🔍 Checking Piano Transcription Dependencies..."
echo "================================================"

# Track if all dependencies are available
ALL_DEPS_OK=true

# Function to check command availability
check_command() {
    if command -v "$1" >/dev/null 2>&1; then
        echo "✅ $1 is installed"
        if [ "$1" = "yt-dlp" ]; then
            echo "   Version: $(yt-dlp --version)"
        elif [ "$1" = "ffmpeg" ]; then
            echo "   Version: $(ffmpeg -version | head -n1)"
        elif [ "$1" = "python3" ]; then
            echo "   Version: $(python3 --version)"
        fi
    else
        echo "❌ $1 is NOT installed"
        ALL_DEPS_OK=false
    fi
}

# Function to check Python package
check_python_package() {
    if python3 -c "import $1" 2>/dev/null; then
        echo "✅ Python package '$1' is installed"
    else
        echo "❌ Python package '$1' is NOT installed"
        ALL_DEPS_OK=false
    fi
}

echo "🐍 Core Dependencies:"
check_command "python3"
check_command "ffmpeg"
check_command "yt-dlp"

echo ""
echo "📦 Python Packages:"
check_python_package "librosa"
check_python_package "numpy" 
check_python_package "scipy"
check_python_package "pretty_midi"
check_python_package "aubio"

echo ""
echo "🔑 API Keys (optional):"
if [ -n "$MUSIC_COACH_HUGGINGFACE_API_KEY" ]; then
    echo "✅ Hugging Face API key is set"
else
    echo "⚠️  Hugging Face API key not set (optional but recommended)"
fi

echo ""
echo "📁 Directories:"
if [ -d "/tmp/piano-transcription" ]; then
    echo "✅ Temp directory exists"
else
    echo "⚠️  Creating temp directory..."
    mkdir -p /tmp/piano-transcription
    echo "✅ Temp directory created"
fi

echo ""
echo "================================================"

if [ "$ALL_DEPS_OK" = true ]; then
    echo "🎉 All required dependencies are installed!"
    echo "🚀 You can now use the Piano Transcription Service"
    echo ""
    echo "🧪 To test:"
    echo "   npm run dev  # Start development server"
    echo "   # Visit: http://localhost:3000/piano-transcription"
    echo ""
    echo "   # Or test via command line:"
    echo "   node test-piano-transcription.js 'https://youtube.com/watch?v=...'"
else
    echo "⚠️  Some dependencies are missing"
    echo "🔧 Run: ./setup-piano-transcription.sh"
    echo "   to install missing dependencies"
fi
