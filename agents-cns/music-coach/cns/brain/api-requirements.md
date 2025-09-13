# API Requirements

## Core Music Education
- Access to music libraries
- Audio analysis tools
- Sheet music APIs
- Feedback and annotation tools

## Music Transcription Services

### Required APIs
- **Songsterr Public API**: Guitar tablature database
  - Status: ✅ Active (no key required)
  - Endpoint: `https://songsterr.com/api/songs`
  - Purpose: Guitar tab search and download
  - Rate Limits: None for public API

- **Hugging Face Inference API**: AI model access
  - Status: ⚠️ Limited (models not always available)
  - Token: `MUSIC_COACH_HUGGINGFACE_API_KEY`
  - Purpose: Audio-to-MIDI transcription
  - Models: Audio transcription, music analysis

### Optional Integrations
- YouTube Data API (future enhancement)
- MuseScore API (sheet music rendering)
- Spotify Web API (music metadata)

### Service Endpoints
- `/api/guitar-tabs` - Guitar tablature search and download
- `/api/transcribe-piano` - Piano transcription from YouTube videos

### Environment Variables
```
MUSIC_COACH_HUGGINGFACE_API_KEY=hf_your-huggingface-token-here
```

### Dependencies
- `ytdl-core` - YouTube video processing
- `node-fetch` - API request handling
- Custom guitar tab processing utilities
