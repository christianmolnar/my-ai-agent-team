# 🎵 Music Coach Setup Guide
*Complete setup instructions for Piano Transcription and Guitar Tab services*

## 🚀 **Quick Start (5 Minutes)**

### **What You Get**
- **Piano Transcription**: YouTube videos → Sheet music (ABC notation, MIDI)
- **Guitar Tab Search**: 500,000+ tabs from Songsterr database  
- **Multiple Formats**: Guitar Pro (.gp5), MIDI (.mid), ASCII tabs
- **Cost**: FREE (no API keys required for basic functionality)

## 📍 **Access Points**

### **Web Interfaces**
- **Piano Transcription**: http://localhost:3002/piano-transcription
- **Guitar Tab Search**: http://localhost:3002/guitar-tabs

### **API Endpoints**
- **Piano API**: `/api/transcribe-piano`
- **Guitar API**: `/api/guitar-tabs`

## 🔧 **Setup Instructions**

### **Basic Setup (Works Immediately)**
Both services work immediately without additional setup:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Piano Transcription**:
   - Go to: http://localhost:3002/piano-transcription
   - Paste a YouTube URL (e.g., `https://www.youtube.com/watch?v=4Tr0otuiQuU`)
   - Click "Transcribe"

3. **Test Guitar Tab Search**:
   - Go to: http://localhost:3002/guitar-tabs
   - Search for "stairway to heaven" or any song
   - Download tabs in your preferred format

## 🎯 **API Usage Examples**

### **Piano Transcription**
```bash
curl -X POST http://localhost:3002/api/transcribe-piano \
  -H "Content-Type: application/json" \
  -d '{"youtubeUrl": "https://www.youtube.com/watch?v=4Tr0otuiQuU"}'
```

### **Guitar Tab Search**
```bash
curl -X POST http://localhost:3002/api/guitar-tabs \
  -H "Content-Type: application/json" \
  -d '{"action": "search", "query": "stairway to heaven", "limit": 5}'
```

### **Guitar Tab Download**
```bash
curl -X POST http://localhost:3002/api/guitar-tabs \
  -H "Content-Type: application/json" \
  -d '{"action": "download", "url": "https://www.songsterr.com/a/wsa/led-zeppelin-stairway-to-heaven-tab-s27", "format": "gp5"}'
```

## 🔑 **Optional Enhancements**

### **Enhanced Piano Transcription (AI-Powered)**

For improved accuracy, you can add a free Hugging Face token:

1. **Get Free Token**:
   - Go to: https://huggingface.co/settings/tokens
   - Click "New token"
   - Name: "Piano Transcription"
   - Copy the token

2. **Add to Environment**:
   ```bash
   echo "HUGGINGFACE_API_KEY=your_token_here" >> .env.local
   ```

3. **Install Enhanced Dependencies**:
   ```bash
   ./scripts/features/setup-piano-transcription.sh
   ```

### **Guitar Pro File Conversion**

For advanced Guitar Pro file handling:

```bash
./scripts/features/setup-guitar-tabs.sh
```

## 🛠 **Setup Scripts**

All setup scripts are available in `/scripts/features/`:

```bash
# Enhanced piano transcription with AI
./scripts/features/setup-piano-transcription.sh

# Guitar Pro file conversion capabilities
./scripts/features/setup-guitar-tabs.sh

# Check what dependencies are installed
./scripts/features/check-piano-deps.sh
```

## 📁 **System Architecture**

The music coach system includes:

```
lib/
├── simple-piano-transcription.ts    # Basic piano transcription
├── piano-transcription.ts           # Enhanced AI transcription  
└── guitar-tab-service.ts            # Guitar tab search & download

app/
├── piano-transcription/
│   └── page.tsx                     # Piano transcription UI
├── guitar-tabs/
│   └── page.tsx                     # Guitar tab search UI
└── api/
    ├── transcribe-piano/
    │   └── route.ts                 # Piano API endpoint
    └── guitar-tabs/
        └── route.ts                 # Guitar API endpoint
```

## 🎯 **Next Steps**

### **Immediate Actions**
1. Test both services with sample content
2. Try different YouTube videos for piano transcription
3. Search for various songs in guitar tab database

### **Integration Opportunities**
1. Connect to Personal Assistant for voice commands
2. Add to agent workflows for music education
3. Integrate with existing music coaching processes

### **Advanced Features**
1. Add AI-enhanced transcription with Hugging Face
2. Enable Guitar Pro file conversion
3. Implement custom output formatting

## 🎉 **What You Have Now**

A complete, professional music transcription system that provides:

- **Free YouTube → Sheet Music conversion**
- **Access to 500,000+ guitar tabs**  
- **Multiple output formats** (GP5, MIDI, ASCII, ABC)
- **Professional quality** alternatives to expensive services
- **No API costs** for basic functionality
- **Extensible architecture** for future enhancements

The system is ready for immediate use and can be enhanced with optional AI features when you want even better accuracy! 🎵🚀
