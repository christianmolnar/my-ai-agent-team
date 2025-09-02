# Memorias AI State Management Architecture

## Overview

This document analyzes the current useState-based state management in the Memorias AI component and proposes a migration to a useReducer pattern for better state management, predictable state transitions, and improved maintainability.

## Current State Analysis

The current implementation uses **24 individual useState hooks** to manage component state, which creates several challenges:

- **State Synchronization Issues**: Multiple state variables need to be updated together
- **Complex State Logic**: State transitions involve multiple setState calls
- **Debugging Difficulty**: Hard to track state changes across multiple hooks
- **Race Conditions**: Async operations can cause inconsistent state
- **Maintainability**: Adding new features requires touching multiple state variables

## Proposed Reducer Architecture

### State Categories

The 24 state variables can be logically grouped into 5 main categories:

1. **Recording State** - Audio recording and processing
2. **Agent Interaction State** - Voice assistant and conversation flow
3. **User Profile State** - User information and preferences  
4. **Story State** - Story content and transcription
5. **UI State** - User interface and feedback states

### State Variables Inventory

| **State Variable** | **Type** | **Category** | **Description** | **Current Default** | **Proposed Action Type** |
|-------------------|----------|--------------|-----------------|-------------------|------------------------|
| `recording` | `boolean` | Recording | Whether recording is active | `false` | `START_RECORDING`, `STOP_RECORDING` |
| `audioURL` | `string \| null` | Recording | URL for playback of recorded audio | `null` | `SET_AUDIO_URL`, `CLEAR_AUDIO` |
| `currentStoryText` | `string` | Story | Live editable story text displayed to user | `''` | `UPDATE_STORY_TEXT`, `APPEND_STORY_TEXT`, `CLEAR_STORY_TEXT` |
| `lastTranscription` | `string \| null` | Story | Most recent transcription from audio | `null` | `SET_LAST_TRANSCRIPTION`, `CLEAR_LAST_TRANSCRIPTION` |
| `storyIsVisible` | `boolean` | Story | Whether story text area is displayed | `false` | `SHOW_STORY`, `HIDE_STORY` |
| `storyHasBeenEdited` | `boolean` | Story | Whether user has manually edited the story text | `false` | `MARK_STORY_EDITED`, `RESET_STORY_EDITED` |
| `mediaRecorder` | `MediaRecorder \| null` | Recording | MediaRecorder instance | `null` | `SET_MEDIA_RECORDER`, `CLEAR_MEDIA_RECORDER` |
| `audioChunks` | `Blob[]` | Recording | Array of audio data chunks | `[]` | `ADD_AUDIO_CHUNK`, `CLEAR_AUDIO_CHUNKS` |
| `isEmailSending` | `boolean` | UI | Email sending status | `false` | `START_EMAIL_SEND`, `COMPLETE_EMAIL_SEND` |
| `audioMimeType` | `string` | Recording | Audio format for recording | `'audio/webm'` | `SET_AUDIO_MIME_TYPE` |
| `selectedVoice` | `string` | Agent | Selected TTS voice ID | `'alloy'` | `SELECT_VOICE` |
| `agentQuestion` | `string \| null` | Agent | Current agent question | `null` | `SET_AGENT_QUESTION`, `CLEAR_AGENT_QUESTION` |
| `agentAudio` | `string \| null` | Agent | Agent speech audio URL | `null` | `SET_AGENT_AUDIO`, `CLEAR_AGENT_AUDIO` |
| `isGeneratingQuestion` | `boolean` | Agent | Agent question generation status | `false` | `START_QUESTION_GENERATION`, `COMPLETE_QUESTION_GENERATION` |
| `questionsAsked` | `string[]` | Agent | History of agent questions | `[]` | `ADD_QUESTION`, `RESET_QUESTIONS` |
| `conversationPhase` | `ConversationPhase` | Agent | Current conversation phase | `'setup'` | `SET_CONVERSATION_PHASE` |
| `currentAgentMessage` | `string` | Agent | Current agent message text | `''` | `SET_AGENT_MESSAGE`, `CLEAR_AGENT_MESSAGE` |
| `agentSpeechState` | `AgentSpeechState` | Agent | Agent speech preparation and playback status | `'idle'` | `PREPARE_AGENT_SPEECH`, `START_AGENT_SPEAKING`, `STOP_AGENT_SPEAKING`, `COMPLETE_AGENT_SPEECH` |
| `awaitingUserResponse` | `boolean` | Agent | Waiting for user input | `false` | `AWAIT_USER_RESPONSE`, `RECEIVE_USER_RESPONSE` |
| `userCanInterrupt` | `boolean` | Agent | Whether user can interrupt current agent speech | `false` | `ENABLE_INTERRUPT`, `DISABLE_INTERRUPT` |
| `pendingAgentAudio` | `string \| null` | Agent | Pre-generated agent speech audio URL | `null` | `SET_PENDING_AUDIO`, `CLEAR_PENDING_AUDIO` |
| `voicePreviewInProgress` | `boolean` | Agent | Whether voice preview is currently playing (prevents double-clicks) | `false` | `START_VOICE_PREVIEW`, `COMPLETE_VOICE_PREVIEW` |
| `hasAutoStarted` | `boolean` | Agent | Whether Carmen has automatically started the conversation | `false` | `SET_AUTO_STARTED` |
| `storySegments` | `string[]` | Story | Array of story text segments | `[]` | `ADD_STORY_SEGMENT`, `RESET_STORY_SEGMENTS` |
| `infoGatheringStep` | `InfoStep` | Agent | Current info gathering step | `'name'` | `SET_INFO_STEP` |
| `lastTranscriptionTime` | `number` | Recording | Timestamp of last transcription | `0` | `SET_TRANSCRIPTION_TIME` |
| `storytellerName` | `string` | User Profile | User's full name (editable) | `''` | `SET_STORYTELLER_NAME`, `UPDATE_STORYTELLER_NAME` |
| `storytellerEmail` | `string` | User Profile | User's email address (editable) | `''` | `SET_STORYTELLER_EMAIL`, `UPDATE_STORYTELLER_EMAIL` |
| `ageAtEvents` | `string` | User Profile | User's age during story events (editable) | `''` | `SET_AGE_AT_EVENTS`, `UPDATE_AGE_AT_EVENTS` |
| `eventLocation` | `string` | User Profile | Location where story occurred (editable) | `''` | `SET_EVENT_LOCATION`, `UPDATE_EVENT_LOCATION` |
| `profileHasBeenEdited` | `boolean` | User Profile | Whether user has manually edited profile fields | `false` | `MARK_PROFILE_EDITED`, `RESET_PROFILE_EDITED` |
| `storyAudioSegments` | `Blob[]` | Story | Audio segments for story only | `[]` | `ADD_STORY_AUDIO`, `RESET_STORY_AUDIO` |
| `storyEmailSent` | `boolean` | UI | Whether story email was sent | `false` | `EMAIL_SENT`, `RESET_EMAIL_STATUS` |
| `showDownloadOffer` | `boolean` | UI | Show audio download option | `false` | `SHOW_DOWNLOAD_OFFER`, `HIDE_DOWNLOAD_OFFER` |
| `currentLanguage` | `string` | UI | Current interface language code | `'es'` | `SET_LANGUAGE` |
| `isReturningUser` | `boolean` | User Profile | Whether user is returning | `false` | `SET_RETURNING_USER` |

### Type Definitions

```typescript
type ConversationPhase = 'setup' | 'info_gathering' | 'storytelling' | 'completed';
type InfoGatheringStep = 'name' | 'age' | 'location' | 'returning_user_check' | 'completed';
type AgentSpeechState = 'idle' | 'preparing' | 'speaking' | 'completed' | 'interrupted' | 'awaiting_user_response';
type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko' | 'ar';

interface RecordingState {
  recording: boolean;
  audioURL: string | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  audioMimeType: string;
  lastTranscriptionTime: number;
}

interface AgentState {
  selectedVoice: string;
  agentQuestion: string | null;
  agentAudio: string | null;
  isGeneratingQuestion: boolean;
  questionsAsked: string[];
  conversationPhase: ConversationPhase;
  currentAgentMessage: string;
  agentSpeechState: AgentSpeechState;
  awaitingUserResponse: boolean;
  userCanInterrupt: boolean;
  pendingAgentAudio: string | null;
  infoGatheringStep: InfoGatheringStep;
  voicePreviewInProgress: boolean;
  hasAutoStarted: boolean;
}

interface UserProfileState {
  storytellerName: string;
  storytellerEmail: string;
  ageAtEvents: string;
  eventLocation: string;
  isReturningUser: boolean;
  profileHasBeenEdited: boolean;
}

interface StoryState {
  currentStoryText: string;
  lastTranscription: string | null;
  storySegments: string[];
  storyAudioSegments: Blob[];
  storyIsVisible: boolean;
  storyHasBeenEdited: boolean;
}

interface UIState {
  isEmailSending: boolean;
  storyEmailSent: boolean;
  showDownloadOffer: boolean;
  currentLanguage: SupportedLanguage;
}

interface MemoriasAIState {
  recording: RecordingState;
  agent: AgentState;
  userProfile: UserProfileState;
  story: StoryState;
  ui: UIState;
}
```

### Action Types

```typescript
// Recording Actions
type RecordingAction = 
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'SET_AUDIO_URL'; payload: string | null }
  | { type: 'SET_MEDIA_RECORDER'; payload: MediaRecorder | null }
  | { type: 'ADD_AUDIO_CHUNK'; payload: Blob }
  | { type: 'CLEAR_AUDIO_CHUNKS' }
  | { type: 'SET_AUDIO_MIME_TYPE'; payload: string }
  | { type: 'SET_TRANSCRIPTION_TIME'; payload: number }
  | { type: 'RESET_RECORDING' };

// Agent Actions  
type AgentAction =
  | { type: 'SELECT_VOICE'; payload: string }
  | { type: 'SET_AGENT_QUESTION'; payload: string | null }
  | { type: 'SET_AGENT_AUDIO'; payload: string | null }
  | { type: 'START_QUESTION_GENERATION' }
  | { type: 'COMPLETE_QUESTION_GENERATION' }
  | { type: 'ADD_QUESTION'; payload: string }
  | { type: 'RESET_QUESTIONS' }
  | { type: 'SET_CONVERSATION_PHASE'; payload: ConversationPhase }
  | { type: 'SET_AGENT_MESSAGE'; payload: string }
  | { type: 'CLEAR_AGENT_MESSAGE' }
  | { type: 'PREPARE_AGENT_SPEECH'; payload: { message: string; audioUrl?: string } }
  | { type: 'START_AGENT_SPEAKING' }
  | { type: 'STOP_AGENT_SPEAKING' }
  | { type: 'COMPLETE_AGENT_SPEECH' }
  | { type: 'INTERRUPT_AGENT_SPEECH' }
  | { type: 'AWAIT_USER_RESPONSE' }
  | { type: 'RECEIVE_USER_RESPONSE' }
  | { type: 'ENABLE_INTERRUPT' }
  | { type: 'DISABLE_INTERRUPT' }
  | { type: 'SET_PENDING_AUDIO'; payload: string | null }
  | { type: 'CLEAR_PENDING_AUDIO' }
  | { type: 'SET_INFO_STEP'; payload: InfoGatheringStep }
  | { type: 'START_VOICE_PREVIEW' }
  | { type: 'COMPLETE_VOICE_PREVIEW' }
  | { type: 'SET_AUTO_STARTED' }
  | { type: 'RESET_CONVERSATION' };

// User Profile Actions
type UserProfileAction =
  | { type: 'SET_STORYTELLER_NAME'; payload: string }
  | { type: 'UPDATE_STORYTELLER_NAME'; payload: string }
  | { type: 'SET_STORYTELLER_EMAIL'; payload: string }
  | { type: 'UPDATE_STORYTELLER_EMAIL'; payload: string }
  | { type: 'SET_AGE_AT_EVENTS'; payload: string }
  | { type: 'UPDATE_AGE_AT_EVENTS'; payload: string }
  | { type: 'SET_EVENT_LOCATION'; payload: string }
  | { type: 'UPDATE_EVENT_LOCATION'; payload: string }
  | { type: 'SET_RETURNING_USER'; payload: boolean }
  | { type: 'MARK_PROFILE_EDITED' }
  | { type: 'RESET_PROFILE_EDITED' }
  | { type: 'RESET_USER_PROFILE' };

// Story Actions
type StoryAction =
  | { type: 'SET_LAST_TRANSCRIPTION'; payload: string | null }
  | { type: 'CLEAR_LAST_TRANSCRIPTION' }
  | { type: 'UPDATE_STORY_TEXT'; payload: string }
  | { type: 'APPEND_STORY_TEXT'; payload: string }
  | { type: 'CLEAR_STORY_TEXT' }
  | { type: 'ADD_STORY_SEGMENT'; payload: string }
  | { type: 'RESET_STORY_SEGMENTS' }
  | { type: 'ADD_STORY_AUDIO'; payload: Blob }
  | { type: 'RESET_STORY_AUDIO' }
  | { type: 'SHOW_STORY' }
  | { type: 'HIDE_STORY' }
  | { type: 'MARK_STORY_EDITED' }
  | { type: 'RESET_STORY_EDITED' }
  | { type: 'COMMIT_CURRENT_STORY_STATE' }
  | { type: 'RESET_STORY' };

// UI Actions
type UIAction =
  | { type: 'START_EMAIL_SEND' }
  | { type: 'COMPLETE_EMAIL_SEND' }
  | { type: 'EMAIL_SENT' }
  | { type: 'RESET_EMAIL_STATUS' }
  | { type: 'SHOW_DOWNLOAD_OFFER' }
  | { type: 'HIDE_DOWNLOAD_OFFER' }
  | { type: 'SET_LANGUAGE'; payload: SupportedLanguage }
  | { type: 'RESET_UI' };

// Combined Action Type
type MemoriasAIAction = RecordingAction | AgentAction | UserProfileAction | StoryAction | UIAction;
```

## Implementation Benefits

### 1. **Predictable State Updates**
- All state changes go through the reducer
- Single source of truth for state transitions
- Easier to reason about state changes

### 2. **Better Organization**
- Related state variables grouped together
- Clear separation of concerns
- Modular reducer functions

### 3. **Improved Debugging**
- Action types provide clear intent
- Easy to log state changes
- Time-travel debugging possible

### 4. **Complex State Logic**
- Handle multi-step workflows better
- Atomic state updates
- Prevent inconsistent intermediate states

### 5. **Enhanced Maintainability**
- Adding new features requires defining new actions
- Clear contract for state modifications
- Easier to test state logic

## Key Design Updates

### 🎯 **Immediate Issues Addressed**

1. **Double-Click Prevention**: Added `voicePreviewInProgress` state to prevent multiple voice previews from playing simultaneously
2. **Carmen as Default**: Changed default voice from `'nova'` (Valentina) to `'alloy'` (Carmen)
3. **Auto-Start Conversation**: Carmen automatically greets users when the application loads
4. **Internationalization Ready**: Added `currentLanguage` state and centralized text management system
5. **Enhanced Button Labels**: Proper "Interrupt Agent" / "Hablar con el agente" button behavior with localization
6. **Agent State Flow**: Fixed state transitions to preserve conversation context after interruption

### 🌐 **Internationalization System**

- **Centralized Text Management**: All UI strings stored in `localizedStrings` object
- **Fallback Support**: Spanish as default with English fallback
- **Variable Interpolation**: Support for dynamic text with variables (e.g., `{voiceName}`)
- **10 Language Support**: Ready for Spanish, English, Portuguese, French, German, Italian, Chinese, Japanese, Korean, Arabic
- **Real-time Language Switching**: Language changes apply immediately to all interface elements

### 🗣️ **Enhanced Voice Management**

- **Carmen Auto-Start**: Automatic welcome message when app loads (`hasAutoStarted` prevents repeat)
- **Voice Preview Protection**: `voicePreviewInProgress` state prevents double-clicking issues
- **Memory Cleanup**: Proper disposal of audio URLs to prevent memory leaks
- **Smooth Transitions**: Voice changes preserve conversation context
- **User Choice Respect**: User can interrupt Carmen's welcome to select different voice immediately

### 🔄 **Improved State Architecture**

- **6-State Agent System**: `idle` → `preparing` → `speaking` → `completed`/`interrupted` → `awaiting_user_response` → `idle`
- **Context Preservation**: Agent remembers what question was being asked during interruptions
- **Validation Rules**: Comprehensive state transition validation including voice preview conflicts
- **Audio Resource Management**: Proper cleanup for all audio resources during state changes

### 📱 **User Experience Priorities**

1. **Immediate Response**: Carmen starts speaking as soon as page loads
2. **Clear Choice**: User can immediately interrupt to choose different voice
3. **Prevent Confusion**: No double-clicking issues with voice previews
4. **Seamless Flow**: Interruptions feel natural and preserve conversation context
5. **Accessibility Ready**: Foundation for screen readers and keyboard navigation

---

**Implementation Priority**: Phase 1 focuses entirely on fixing the immediate issues (double-click prevention, Carmen auto-start, proper button labels, internationalization foundation) before moving to story composition features.

## Migration Strategy

### Phase 1: Create Reducer Structure
1. Define all TypeScript interfaces and types
2. Create the main reducer function
3. Create sub-reducers for each state category
4. Implement initial state

### Phase 2: Replace useState Hooks
1. Replace useState with useReducer
2. Update all setState calls to dispatch actions
3. Create action creator functions for common operations

### Phase 3: Add Enhanced Features
1. Add state validation
2. Implement undo/redo functionality
3. Add state persistence
4. Create development tools integration

### Phase 4: Testing & Optimization
1. Add comprehensive tests for reducer logic
2. Performance optimization
3. Error handling improvements

## Complex State Scenarios

### Story Composition and Real-time Editing

The enhanced story management system supports real-time story composition with user editing:

```typescript
// Story Composition Workflow
1. User starts first recording -> `SHOW_STORY` -> story textarea becomes visible
2. Audio transcription received -> `SET_LAST_TRANSCRIPTION` + `APPEND_STORY_TEXT`
3. User can edit story text -> `UPDATE_STORY_TEXT` + `MARK_STORY_EDITED`
4. User starts next recording -> `COMMIT_CURRENT_STORY_STATE` (saves canonical version)
5. Next transcription appends to existing story -> `APPEND_STORY_TEXT`
6. Process repeats for subsequent recordings
```

**Key Story State Management Rules:**
- **Live Display**: Story text is always visible once first recording starts
- **Real-time Updates**: New transcriptions append to existing story text
- **User Edits**: User can modify any part of the story at any time
- **Canonical State**: When user starts new recording, current text becomes canonical
- **Profile Editing**: User can edit name, age, location fields at any time

### Story and Profile Data Persistence

```typescript
// When user starts a new recording, commit current UI state as canonical
const handleStartRecording = () => {
  // Commit current story text as canonical (regardless of source)
  dispatch({ 
    type: 'COMMIT_CURRENT_STORY_STATE',
    payload: {
      storyText: currentStoryTextFromUI,
      storytellerName: nameFieldValue,
      ageAtEvents: ageFieldValue,
      eventLocation: locationFieldValue
    }
  });
  
  // Then start recording
  dispatch({ type: 'START_RECORDING' });
};

// When transcription is received, append to current story
const handleTranscriptionReceived = (transcription: string) => {
  dispatch({ type: 'SET_LAST_TRANSCRIPTION', payload: transcription });
  
  // Add spacing if story already has content
  const separator = state.story.currentStoryText.trim() ? '\n\n' : '';
  dispatch({ 
    type: 'APPEND_STORY_TEXT', 
    payload: separator + transcription 
  });
  
  // Show story if not already visible
  if (!state.story.storyIsVisible) {
    dispatch({ type: 'SHOW_STORY' });
  }
};

// When user manually edits story text
const handleStoryTextChange = (newText: string) => {
  dispatch({ type: 'UPDATE_STORY_TEXT', payload: newText });
  dispatch({ type: 'MARK_STORY_EDITED' });
};

// When user edits profile fields
const handleProfileFieldChange = (field: string, value: string) => {
  switch (field) {
    case 'name':
      dispatch({ type: 'UPDATE_STORYTELLER_NAME', payload: value });
      break;
    case 'age':
      dispatch({ type: 'UPDATE_AGE_AT_EVENTS', payload: value });
      break;
    case 'location':
      dispatch({ type: 'UPDATE_EVENT_LOCATION', payload: value });
      break;
  }
  dispatch({ type: 'MARK_PROFILE_EDITED' });
};
```

### Agent Speech Interruption Flow

The enhanced agent interaction system supports user interruption with the following state machine:

```typescript
// Agent Speech State Transitions
'idle' -> 'preparing' -> 'speaking' -> 'completed' -> 'idle'
                    \-> 'interrupted' -> 'idle'
```

**State Definitions:**
- **idle**: Agent is not speaking, ready for new messages
- **preparing**: Agent is generating speech audio (TTS processing)
- **speaking**: Agent audio is currently playing
- **completed**: Agent finished speaking normally
- **interrupted**: User interrupted agent speech

### Multi-Recording Story Assembly

```typescript
// Complete story assembly workflow
const storyAssemblyExample = {
  // Recording 1: User tells first part
  recording1: {
    transcription: "Cuando tenía 15 años, vivía en Buenos Aires con mi familia.",
    userEdited: "Cuando tenía 15 años, vivía en Buenos Aires con mi familia. Era una época muy especial.",
    canonicalText: "Cuando tenía 15 años, vivía en Buenos Aires con mi familia. Era una época muy especial."
  },
  
  // Recording 2: User continues story
  recording2: {
    transcription: "Un día de verano decidimos ir a la playa.",
    userEdited: "Un día de verano decidimos ir a la playa de Mar del Plata.",
    canonicalText: "Cuando tenía 15 años, vivía en Buenos Aires con mi familia. Era una época muy especial.\n\nUn día de verano decidimos ir a la playa de Mar del Plata."
  },
  
  // Recording 3: Story conclusion
  recording3: {
    transcription: "Fue el mejor día de mi infancia.",
    userEdited: "Fue definitivamente el mejor día de mi infancia.",
    finalStory: "Cuando tenía 15 años, vivía en Buenos Aires con mi familia. Era una época muy especial.\n\nUn día de verano decidimos ir a la playa de Mar del Plata.\n\nFue definitivamente el mejor día de mi infancia."
  }
};

// Implementation
const handleMultiRecordingFlow = () => {
  // Before each new recording, commit current state
  dispatch({ type: 'COMMIT_CURRENT_STORY_STATE' });
  
  // Start recording
  dispatch({ type: 'START_RECORDING' });
  
  // When transcription received
  dispatch({ type: 'SET_LAST_TRANSCRIPTION', payload: newTranscription });
  dispatch({ type: 'APPEND_STORY_TEXT', payload: '\n\n' + newTranscription });
  
  // User can immediately edit in textarea
  // When they start next recording, their edits become canonical
};
```

**Interruption Workflow:**
1. Agent prepares speech (`agentSpeechState: 'preparing'`)
2. TTS audio generation begins
3. User can interrupt during 'preparing' or 'speaking' states
4. On interrupt: immediately transition to 'interrupted' state
5. Stop any playing audio and clear pending audio
6. Process user's response and determine next conversation step
7. Agent continues conversation flow based on user input

### Agent Interruption Implementation

```typescript
// When agent starts to speak
dispatch({ 
  type: 'PREPARE_AGENT_SPEECH', 
  payload: { 
    message: "¿Podrías decirme tu nombre completo?",
    audioUrl: null // Will be set when TTS completes
  } 
});

// Enable interruption once speech preparation begins
dispatch({ type: 'ENABLE_INTERRUPT' });

// When user interrupts (clicks record while agent is preparing/speaking)
if (state.agent.userCanInterrupt && 
    (state.agent.agentSpeechState === 'preparing' || 
     state.agent.agentSpeechState === 'speaking')) {
  
  dispatch({ type: 'INTERRUPT_AGENT_SPEECH' });
  // Process user's immediate response
  startRecording(); 
}

// When agent speech completes naturally
audio.onended = () => {
  dispatch({ type: 'COMPLETE_AGENT_SPEECH' });
  dispatch({ type: 'AWAIT_USER_RESPONSE' });
};
```

The enhanced agent interaction system supports user interruption with the following state machine:

```typescript
// Agent Speech State Transitions
'idle' -> 'preparing' -> 'speaking' -> 'completed' -> 'awaiting_user_response' -> 'idle'
                    \-> 'interrupted' -> 'awaiting_user_response' -> 'idle'
```

**State Definitions:**
- **idle**: Agent is not speaking, ready for new messages
- **preparing**: Agent is generating speech audio (TTS processing)
- **speaking**: Agent audio is currently playing
- **completed**: Agent finished speaking normally
- **interrupted**: User interrupted agent speech, speech stopped immediately
- **awaiting_user_response**: Agent is waiting for user's response (after completed or interrupted speech)

**Interruption Workflow:**
1. Agent prepares speech (`agentSpeechState: 'preparing'`)
2. TTS audio generation begins
3. User can interrupt during 'preparing' or 'speaking' states
4. On interrupt: immediately transition to 'interrupted' state
5. Stop any playing audio and clear pending audio
6. Transition to 'awaiting_user_response' state (preserving conversation context)
7. User provides response to the original question/context
8. Agent processes response (expected or unexpected) and continues conversation flow

### Agent Interruption Implementation

```typescript
// When agent starts to speak
dispatch({ 
  type: 'PREPARE_AGENT_SPEECH', 
  payload: { 
    message: "¿Podrías decirme tu nombre completo?",
    audioUrl: null // Will be set when TTS completes
  } 
});

// Enable interruption once speech preparation begins
dispatch({ type: 'ENABLE_INTERRUPT' });

// When user interrupts (clicks button while agent is preparing/speaking)
if (state.agent.userCanInterrupt && 
    (state.agent.agentSpeechState === 'preparing' || 
     state.agent.agentSpeechState === 'speaking')) {
  
  // Stop agent speech immediately and preserve context
  dispatch({ type: 'INTERRUPT_AGENT_SPEECH' });
  
  // Agent now waits for user response to the original question
  dispatch({ type: 'AWAIT_USER_RESPONSE' });
  
  // Start recording user's response
  startRecording(); 
}

// When agent speech completes naturally
audio.onended = () => {
  dispatch({ type: 'COMPLETE_AGENT_SPEECH' });
  dispatch({ type: 'AWAIT_USER_RESPONSE' });
};

// When user provides response (after interruption or completion)
const handleUserResponse = (transcription: string) => {
  // Mark that we received response
  dispatch({ type: 'RECEIVE_USER_RESPONSE' });
  
  // Process response based on current conversation context
  // Handle both expected and unexpected responses
  if (isExpectedResponse(transcription, state.agent.infoGatheringStep)) {
    processExpectedResponse(transcription);
  } else {
    // Agent handles unexpected response gracefully
    processUnexpectedResponse(transcription);
  }
};

// Helper function to handle unexpected responses
const processUnexpectedResponse = (transcription: string) => {
  // Agent acknowledges the response and tries to guide back to expected flow
  const clarificationMessage = generateClarificationMessage(
    transcription, 
    state.agent.infoGatheringStep,
    state.agent.currentAgentMessage
  );
  
  dispatch({ 
    type: 'PREPARE_AGENT_SPEECH',
    payload: { 
      message: clarificationMessage
    }
  });
};
```

## Enhanced Initial Experience & Voice Selection

### Carmen Auto-Start Flow
The application now starts with Carmen (alloy voice) as the default agent and automatically begins the conversation:

```typescript
// Initial state setup with Carmen as default
const initialState: MemoriasAIState = {
  agent: {
    selectedVoice: 'alloy', // Carmen is the default
    conversationPhase: 'setup', // Start in setup phase
    agentSpeechState: 'idle',
    hasAutoStarted: false,
    voicePreviewInProgress: false,
    // ... other agent properties
  },
  // ... other state categories
};

// Auto-start conversation when component mounts
useEffect(() => {
  if (!state.agent.hasAutoStarted) {
    dispatch({ type: 'SET_AUTO_STARTED' });
    dispatch({ 
      type: 'PREPARE_AGENT_SPEECH',
      payload: { 
        message: getLocalizedText('WELCOME_MESSAGE', state.ui.currentLanguage)
      }
    });
  }
}, []);

// Example welcome message
const welcomeMessage = {
  es: "¡Hola! Soy Carmen, tu asistente personal para crear memorias. Estoy aquí para ayudarte a contar tu historia. Si prefieres escuchar otra voz, puedes hacer clic en cualquier agente para cambiar. ¿Empezamos?",
  en: "Hello! I'm Carmen, your personal assistant for creating memories. I'm here to help you tell your story. If you'd prefer to hear another voice, you can click on any agent to change. Shall we begin?"
};
```

### Anti-Double-Click Voice Preview System

```typescript
// Enhanced voice preview with double-click prevention
const handleVoicePreview = (voice: VoiceOption) => {
  // Prevent multiple clicks during preview
  if (state.agent.voicePreviewInProgress) {
    return; // Ignore additional clicks
  }
  
  dispatch({ type: 'START_VOICE_PREVIEW' });
  
  const previewMessage = getLocalizedText('VOICE_PREVIEW_MESSAGE', state.ui.currentLanguage, {
    voiceName: voice.name,
    description: voice.description
  });
  
  try {
    // Generate and play preview
    const audioResponse = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: previewMessage,
        voice: voice.id,
        speed: 0.9
      }),
    });
    
    const audioBlob = await audioResponse.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    // Set up completion handler
    audio.onended = () => {
      dispatch({ type: 'COMPLETE_VOICE_PREVIEW' });
      URL.revokeObjectURL(audioUrl); // Clean up memory
    };
    
    audio.onerror = () => {
      dispatch({ type: 'COMPLETE_VOICE_PREVIEW' });
      URL.revokeObjectURL(audioUrl);
    };
    
    audio.play();
    
    // Select this voice as the new agent
    dispatch({ type: 'SELECT_VOICE', payload: voice.id });
    
  } catch (error) {
    console.error('Voice preview failed:', error);
    dispatch({ type: 'COMPLETE_VOICE_PREVIEW' });
    
    // Still select the voice even if preview fails
    dispatch({ type: 'SELECT_VOICE', payload: voice.id });
  }
};

// Voice selection state management for UI feedback
const getVoiceButtonState = (voice: VoiceOption, state: MemoriasAIState) => {
  const isSelected = state.agent.selectedVoice === voice.id;
  const isPreviewInProgress = state.agent.voicePreviewInProgress;
  
  return {
    disabled: isPreviewInProgress && !isSelected,
    className: `voice-button ${isSelected ? 'selected' : ''} ${isPreviewInProgress && !isSelected ? 'disabled' : ''}`,
    text: isPreviewInProgress && isSelected ? 
      getLocalizedText('VOICE_PLAYING', state.ui.currentLanguage) : 
      voice.name
  };
};
```

### Internationalization System

```typescript
// Centralized text management for all UI strings
interface LocalizedStrings {
  VOICE_SELECTION_INSTRUCTION: string;
  VOICE_PREVIEW_MESSAGE: string;
  VOICE_PLAYING: string;
  WELCOME_MESSAGE: string;
  INTERRUPT_AGENT_BUTTON: string;
  SPEAK_TO_AGENT_BUTTON: string;
  STOP_RECORDING_BUTTON: string;
  // Add more strings as needed
}

const localizedStrings: Record<SupportedLanguage, LocalizedStrings> = {
  es: {
    VOICE_SELECTION_INSTRUCTION: "Haz clic en un agente para escuchar su voz y seleccionarlo",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy Carmen, tu asistente personal para crear memorias. Estoy aquí para ayudarte a contar tu historia. Si prefieres escuchar otra voz, puedes hacer clic en cualquier agente para cambiar. ¿Empezamos?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación"
  },
  en: {
    VOICE_SELECTION_INSTRUCTION: "Click on an agent to hear their voice and select them",
    VOICE_PREVIEW_MESSAGE: "Hello, I'm {voiceName}. {description}",
    VOICE_PLAYING: "Playing...",
    WELCOME_MESSAGE: "Hello! I'm Carmen, your personal assistant for creating memories. I'm here to help you tell your story. If you'd prefer to hear another voice, you can click on any agent to change. Shall we begin?",
    INTERRUPT_AGENT_BUTTON: "Interrupt Agent",
    SPEAK_TO_AGENT_BUTTON: "Speak to Agent",
    STOP_RECORDING_BUTTON: "⏹️ Stop Recording"
  },
  // Add more languages: pt, fr, de, it, zh, ja, ko, ar
};

// Helper function to get localized text with interpolation
const getLocalizedText = (
  key: keyof LocalizedStrings, 
  language: SupportedLanguage, 
  variables?: Record<string, string>
): string => {
  let text = localizedStrings[language][key] || localizedStrings['es'][key]; // Fallback to Spanish
  
  if (variables) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text.replace(`{${varKey}}`, value);
    });
  }
  
  return text;
};

// Enhanced button state management with internationalization
const getRecordingButtonState = (state: MemoriasAIState) => {
  const { recording, agent, ui } = state;
  
  if (recording.recording) {
    return {
      text: getLocalizedText('STOP_RECORDING_BUTTON', ui.currentLanguage),
      disabled: false,
      variant: 'stop'
    };
  }
  
  if (agent.agentSpeechState === 'speaking' && agent.userCanInterrupt) {
    return {
      text: getLocalizedText('INTERRUPT_AGENT_BUTTON', ui.currentLanguage),
      disabled: false,
      variant: 'interrupt',
      highlight: true
    };
  }
  
  if (agent.agentSpeechState === 'preparing' && agent.userCanInterrupt) {
    return {
      text: getLocalizedText('INTERRUPT_AGENT_BUTTON', ui.currentLanguage),
      disabled: false,
      variant: 'interrupt'
    };
  }
  
  if (agent.agentSpeechState === 'awaiting_user_response' || 
      agent.agentSpeechState === 'interrupted' ||
      agent.agentSpeechState === 'completed') {
    return {
      text: getLocalizedText('SPEAK_TO_AGENT_BUTTON', ui.currentLanguage),
      disabled: false,
      variant: 'response'
    };
  }
  
  // Default state
  return {
    text: '🎙️ ' + getLocalizedText('SPEAK_TO_AGENT_BUTTON', ui.currentLanguage),
    disabled: false,
    variant: 'normal'
  };
};
```

### Agent State Validation with Voice Preview

```typescript
const validateAgentAction = (state: MemoriasAIState, action: AgentAction): boolean => {
  if (action.type === 'START_VOICE_PREVIEW') {
    // Can't start preview if one is already in progress
    return !state.agent.voicePreviewInProgress;
  }
  
  if (action.type === 'SELECT_VOICE') {
    // Can always select voice, but should complete preview first for UX
    return true;
  }
  
  if (action.type === 'PREPARE_AGENT_SPEECH') {
    // Can't prepare speech if voice preview is in progress
    return !state.agent.voicePreviewInProgress;
  }
  
  return true;
};
```

## Enhanced Interruption Flow Explanation

### Button Label Behavior
1. **When agent is speaking**: Button shows "Interrupt Agent" 
2. **When agent is interrupted**: Agent stops immediately, button changes to "Hablar con el agente"
3. **When user clicks "Hablar con el agente"**: User can respond to the original question or say something unexpected

### State Transitions After Interruption
- Agent does NOT go back to `idle` state after interruption
- Agent transitions: `speaking` → `interrupted` → `awaiting_user_response`
- This preserves the conversation context and expected response flow
- User can provide the expected response or say something unexpected

### Unexpected Response Handling
When user provides an unexpected response, the agent:
1. Acknowledges the user's input
2. Tries to gently guide back to the expected conversation flow
3. Provides clarification or rephrases the original question
4. Maintains conversation context and progress

### Example Interruption Scenario
```typescript
// Scenario: Agent asking for user's name
// Agent state: 'speaking', asking "¿Podrías decirme tu nombre completo?"
// User clicks "Interrupt Agent" while agent is speaking

// 1. Agent state transitions
'speaking' → 'interrupted' → 'awaiting_user_response'

// 2. Button label changes
'Interrupt Agent' → 'Hablar con el agente'

// 3. User clicks "Hablar con el agente" and says something unexpected
// Expected: Name response
// Actual: "¿Qué tipo de historias puedo contar?"

// 4. Agent handles unexpected response gracefully
const clarificationMessage = `Entiendo que quieres saber sobre los tipos de historias. 
Puedes contar cualquier historia personal que sea importante para ti. 
Pero primero, ¿podrías decirme tu nombre completo para personalizar tu experiencia?`;

// 5. Agent prepares clarification speech and continues flow
dispatch({ 
  type: 'PREPARE_AGENT_SPEECH',
  payload: { message: clarificationMessage }
});
```

### Starting New Story
```typescript
// Current: Multiple setState calls
setConversationPhase('info_gathering');
setCurrentAgentMessage('');
setIsAgentSpeaking(false);
setAwaitingUserResponse(false);
setInfoGatheringStep('returning_user_check');
setIsReturningUser(true);
setTranscribedText(null);
setStorySegments([]);
setStoryAudioSegments([]);
// ... 15 more setState calls

// Proposed: Single action
dispatch({ type: 'START_NEW_STORY' });
```

### Recording Workflow with Interruption Support
```typescript
// Current: Multiple state updates across different functions
setRecording(true);
setAudioChunks([]);
setAudioURL(null);
setMediaRecorder(recorder);
setAudioMimeType(recorder.mimeType);

// Proposed: Atomic operation with interruption handling
dispatch({ 
  type: 'START_RECORDING_SESSION', 
  payload: { 
    recorder, 
    mimeType: recorder.mimeType,
    isInterruption: state.agent.agentSpeechState === 'speaking'
  } 
});

// If this was an interruption, handle agent speech state
if (isInterruption) {
  dispatch({ type: 'INTERRUPT_AGENT_SPEECH' });
}
```

### Conversation Flow State Management

```typescript
// Enhanced conversation flow with interruption support
const handleUserResponse = (transcription: string) => {
  // Mark that we received user response
  dispatch({ type: 'RECEIVE_USER_RESPONSE' });
  
  // Process the response based on current conversation context
  switch (state.agent.infoGatheringStep) {
    case 'name':
      dispatch({ type: 'SET_STORYTELLER_NAME', payload: transcription });
      dispatch({ type: 'SET_INFO_STEP', payload: 'age' });
      
      // Prepare next agent message
      dispatch({ 
        type: 'PREPARE_AGENT_SPEECH',
        payload: { 
          message: `Perfecto, ${transcription}. ¿Qué edad tenías cuando ocurrieron los eventos?`
        }
      });
      break;
    
    case 'age':
      dispatch({ type: 'SET_AGE_AT_EVENTS', payload: transcription });
      // Continue conversation flow...
      break;
  }
};
```

## State Validation & Middleware

### Validation Rules
- **Conversation phase transitions** must follow valid flow: `setup` → `info_gathering` → `storytelling` → `completed`
- **Recording state** must be consistent: cannot start recording if already recording
- **Agent speech interruption** rules:
  - User can only interrupt during `'preparing'` or `'speaking'` states
  - Interruption automatically transitions agent to `'interrupted'` state
  - Pending audio must be cleared on interruption
  - Speech state must return to `'awaiting_user_response'` after interruption handling
- **Voice preview anti-double-click** rules:
  - Only one voice preview can be active at a time
  - Voice selection is allowed during preview but should complete current preview first
  - Agent speech preparation is blocked during voice preview
- **Auto-start conversation** rules:
  - Carmen (alloy) starts speaking automatically when application loads
  - Auto-start only happens once per session
  - User can interrupt auto-start speech to select different voice
- **Internationalization** rules:
  - All user-facing text must use localized strings
  - Language changes apply immediately to all interface elements
  - Default language is Spanish ('es') with English fallback
- **User profile fields** must meet validation requirements before proceeding to storytelling
- **Story state composition** rules:
  - Story text area must be visible once first recording starts
  - New transcriptions append to existing story text with proper spacing
  - User edits to story text take precedence over transcriptions
  - Current UI state becomes canonical when new recording starts
  - Audio segments must match the number of recording sessions
- **Profile field editing** rules:
  - All profile fields remain editable throughout the session
  - Profile changes are committed when new recording starts
  - Name is required before storytelling phase
  - Age and location required during storytelling phase
  - Email is optional but recommended for story delivery

### Story and Profile Data Validation
```typescript
const validateStoryState = (state: MemoriasAIState, action: StoryAction): boolean => {
  if (action.type === 'APPEND_STORY_TEXT') {
    // Cannot append to story if story area is not visible
    return state.story.storyIsVisible;
  }
  
  if (action.type === 'COMMIT_CURRENT_STORY_STATE') {
    // Ensure we have minimum required data
    return state.userProfile.storytellerName.trim().length > 0;
  }
  
  return true;
};

const validateProfileEdit = (state: MemoriasAIState, field: string, value: string): boolean => {
  switch (field) {
    case 'storytellerName':
      // Name must be at least 2 characters
      return value.trim().length >= 2;
    case 'ageAtEvents':
      // Age must be a reasonable number
      const age = parseInt(value);
      return !isNaN(age) && age >= 0 && age <= 120;
    case 'storytellerEmail':
      // Email must be valid format if provided
      return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    case 'eventLocation':
      // Location must be at least 2 characters if provided
      return value === '' || value.trim().length >= 2;
    default:
      return true;
  }
};
```

### Agent Interruption State Validation
```typescript
const validateInterruption = (state: MemoriasAIState, action: AgentAction): boolean => {
  if (action.type === 'INTERRUPT_AGENT_SPEECH') {
    // Can only interrupt if agent is preparing or speaking
    return state.agent.agentSpeechState === 'preparing' || 
           state.agent.agentSpeechState === 'speaking';
  }
  
  if (action.type === 'START_RECORDING') {
    // If agent is speaking and interruption is enabled, allow recording
    if (state.agent.agentSpeechState === 'speaking' && state.agent.userCanInterrupt) {
      return true;
    }
    // Allow recording if agent is awaiting user response
    if (state.agent.agentSpeechState === 'awaiting_user_response') {
      return true;
    }
    // Otherwise, only allow if agent is idle or completed
    return state.agent.agentSpeechState === 'idle' || 
           state.agent.agentSpeechState === 'completed';
  }
  
  return true;
};
```

### Middleware Options
- **Logging middleware** for debugging state transitions
- **Persistence middleware** for local storage of conversation state
- **Validation middleware** for state integrity and interruption rules
- **Analytics middleware** for usage tracking and interruption patterns
- **Audio cleanup middleware** for managing audio resources during interruptions

## User Interface Considerations

### Visual Feedback for Agent Speech States

The UI should provide clear visual feedback for each agent speech state:

```typescript
// Visual indicators based on agent speech state
const getAgentStatusDisplay = (agentSpeechState: AgentSpeechState) => {
  switch (agentSpeechState) {
    case 'idle':
      return { icon: '💬', text: 'Listo para conversar', color: '#ccc' };
    case 'preparing':
      return { icon: '⏳', text: 'Preparando respuesta...', color: '#ffb347' };
    case 'speaking':
      return { icon: '🎵', text: 'Hablando... (puedes interrumpir)', color: '#27ae60' };
    case 'completed':
      return { icon: '✅', text: 'Terminé de hablar', color: '#3498db' };
    case 'interrupted':
      return { icon: '⏸️', text: 'Interrumpido', color: '#e74c3c' };
    case 'awaiting_user_response':
      return { icon: '👂', text: 'Esperando tu respuesta', color: '#3498db' };
  }
};
```

### Recording Button State Management

```typescript
// Recording button behavior based on context
const getRecordingButtonState = (state: MemoriasAIState) => {
  const { recording, agent } = state;
  
  if (recording.recording) {
    return {
      text: '⏹️ Detener Grabación',
      disabled: false,
      variant: 'stop'
    };
  }
  
  // If agent is speaking and interruption is enabled
  if (agent.agentSpeechState === 'speaking' && agent.userCanInterrupt) {
    return {
      text: 'Interrupt Agent',
      disabled: false,
      variant: 'interrupt',
      highlight: true
    };
  }
  
  // If agent is preparing speech
  if (agent.agentSpeechState === 'preparing' && agent.userCanInterrupt) {
    return {
      text: 'Interrupt Agent',
      disabled: false,
      variant: 'interrupt'
    };
  }
  
  // If agent was interrupted or completed speaking, waiting for user response
  if (agent.agentSpeechState === 'awaiting_user_response' || 
      agent.agentSpeechState === 'interrupted' ||
      agent.agentSpeechState === 'completed') {
    return {
      text: 'Hablar con el agente',
      disabled: false,
      variant: 'response'
    };
  }
  
  // Agent is idle, normal conversation flow
  if (agent.agentSpeechState === 'idle' && !agent.awaitingUserResponse) {
    return {
      text: '🎙️ Responder',
      disabled: false,
      variant: 'normal'
    };
  }
  
  // Disabled state (should rarely happen)
  return {
    text: '🎙️ Esperar...',
    disabled: true,
    variant: 'disabled'
  };
};
```

### Story Text Area Management

```typescript
// Story textarea behavior and state
const getStoryDisplayState = (state: MemoriasAIState) => {
  const { story, agent } = state;
  
  return {
    isVisible: story.storyIsVisible,
    currentText: story.currentStoryText,
    lastTranscription: story.lastTranscription,
    hasBeenEdited: story.storyHasBeenEdited,
    placeholder: agent.conversationPhase === 'storytelling' 
      ? "Tu historia aparecerá aquí. Puedes editarla en tiempo real..."
      : "Completa la información personal para comenzar tu historia",
    isEditable: agent.conversationPhase === 'storytelling',
    showLastTranscription: story.lastTranscription && !story.storyHasBeenEdited,
    highlightNewContent: story.lastTranscription && !story.storyHasBeenEdited
  };
};

// Profile fields state management
const getProfileFieldsState = (state: MemoriasAIState) => {
  const { userProfile, agent } = state;
  
  return {
    name: {
      value: userProfile.storytellerName,
      isEditable: true,
      hasBeenEdited: userProfile.profileHasBeenEdited,
      required: agent.conversationPhase !== 'setup'
    },
    email: {
      value: userProfile.storytellerEmail,
      isEditable: true,
      hasBeenEdited: userProfile.profileHasBeenEdited,
      required: false
    },
    age: {
      value: userProfile.ageAtEvents,
      isEditable: true,
      hasBeenEdited: userProfile.profileHasBeenEdited,
      required: agent.conversationPhase === 'storytelling'
    },
    location: {
      value: userProfile.eventLocation,
      isEditable: true,
      hasBeenEdited: userProfile.profileHasBeenEdited,
      required: agent.conversationPhase === 'storytelling'
    }
  };
};
```

## Development Tools

### Redux DevTools Integration
- Time-travel debugging
- Action replay
- State inspection
- Performance monitoring

### Custom Debugging
- State change notifications
- Invalid transition detection
- Performance profiling
- Error boundary integration

## Next Steps

### Phase 1: Enhanced Initial Experience & Core Interruption (Priority)
1. **Internationalization System**: Implement centralized text management with Spanish/English support
2. **Carmen Auto-Start**: Set alloy (Carmen) as default agent with automatic welcome speech
3. **Voice Preview Anti-Double-Click**: Prevent multiple voice previews from playing simultaneously
4. **Enhanced Button States**: Implement proper "Interrupt Agent" / "Hablar con el agente" button behavior
5. **Agent Speech State Machine**: Create the 6-state system for agent speech (idle, preparing, speaking, completed, interrupted, awaiting_user_response)
6. **Voice Selection UI**: Update "Toca un agente" to "Haz clic en un agente" with proper internationalization
7. **Audio Resource Management**: Implement proper cleanup for interrupted speech and voice previews
8. **Conversation Context Preservation**: Maintain question context after interruptions
9. **Initial Experience Flow**: Seamless transition from Carmen's welcome to voice selection to conversation start

### Phase 2: Story Composition & Real-time Editing
1. **Implement Story Real-time Display**: Show story textarea after first recording
2. **Add Story Text Management**: Append transcriptions, handle user edits
3. **Profile Field Editing**: Allow real-time editing of all profile fields
4. **Canonical State Commits**: Save current UI state when starting new recordings
5. **Story Edit Indicators**: Show when text has been manually edited vs. transcribed
6. **Smart Spacing**: Intelligent paragraph breaks and formatting in story text
7. **Live Character Count**: Show story length and estimated reading time
8. **Auto-save**: Periodically save story and profile state to prevent data loss

### Phase 3: Advanced User Experience
1. **Undo/Redo**: Allow users to undo recent edits to story text
2. **Unexpected Response Handling**: Agent gracefully handles off-topic responses and guides back to expected flow
3. **Multi-language Support**: Add Portuguese, French, German, Italian, Chinese, Japanese, Korean, Arabic
4. **Voice Customization**: Allow users to adjust speech speed and tone preferences
5. **Accessibility Features**: Keyboard shortcuts, screen reader support, high contrast mode
### Phase 4: Core Reducer Implementation
1. **Complete Reducer Migration**: Replace all remaining useState hooks with reducer pattern
2. **State Validation**: Implement comprehensive validation rules for all state transitions
3. **Action Creators**: Build helper functions for common state operations
4. **Performance Optimization**: Optimize reducer performance and prevent unnecessary re-renders
5. **Error Handling**: Robust error recovery for all state transitions

### Phase 5: Advanced Features & Analytics
1. **Audio Pre-generation**: Pre-generate agent speech during conversation gaps
2. **Interruption Analytics**: Track user interruption patterns for UX improvements
3. **Smart Interruption**: Allow interruption only at natural speech breaks
4. **Context Preservation**: Enhanced conversation context across complex interruption scenarios
5. **Usage Analytics**: Track conversation flow patterns and completion rates

### Phase 6: Testing & Production Polish
1. **Interruption Edge Cases**: Test all interruption scenarios thoroughly
2. **Performance Optimization**: Ensure smooth audio transitions
3. **Accessibility**: Add keyboard shortcuts for interruption
4. **Error Recovery**: Handle audio failures and interruption errors gracefully

## Critical Implementation Notes

### Audio Resource Management
- **Immediate Cleanup**: When user interrupts, immediately stop audio playback and clean up resources
- **Pending Audio Handling**: Clear any pending TTS audio generation on interruption
- **Memory Management**: Properly dispose of audio URLs to prevent memory leaks

### Story Data Management
- **Real-time Composition**: Story builds progressively with each recording session
- **User Edit Priority**: Manual user edits always take precedence over transcriptions
- **Canonical Commits**: Current UI state becomes authoritative when starting new recordings
- **Live Display**: Story and profile fields visible and editable at all times after first recording
- **Data Persistence**: Story and profile state preserved across sessions

### Conversation Context Preservation
- **State Recovery**: After interruption, agent must know the next expected response
- **Flow Continuation**: Conversation should continue naturally from where it was interrupted
- **Question Tracking**: Track which questions were interrupted vs. completed

### User Experience Priorities
1. **Responsive Interruption**: User should be able to interrupt immediately without delay
2. **Clear Visual Feedback**: User must understand when interruption is possible
3. **Seamless Flow**: Interruption should feel natural, not jarring
4. **Error Forgiveness**: If user interrupts accidentally, provide easy recovery

---

**Note**: This document serves as the foundation for implementing a robust state management solution. The proposed reducer architecture will significantly improve code maintainability, debugging capabilities, and feature development velocity.
