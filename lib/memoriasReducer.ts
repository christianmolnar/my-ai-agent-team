// Memorias AI State Management Reducer
// Foundation implementation for useState → useReducer migration

// Type Definitions
export type ConversationPhase = 'setup' | 'info_gathering' | 'storytelling' | 'completed';
export type InfoGatheringStep = 'name' | 'age' | 'location' | 'title' | 'returning_user_check' | 'completed';
export type AgentSpeechState = 'idle' | 'preparing' | 'speaking' | 'completed' | 'interrupted' | 'awaiting_user_response';
export type SupportedLanguage = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ja' | 'ko' | 'ar' | 'hi' | 'ru';

// State Interfaces
export interface RecordingState {
  recording: boolean;
  audioURL: string | null;
  mediaRecorder: MediaRecorder | null;
  audioChunks: Blob[];
  audioMimeType: string;
  lastTranscriptionTime: number;
  detectedLanguage: SupportedLanguage | null;
  lastRecordingText: string | null;
}

export interface AgentState {
  selectedVoice: string | null;
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
  lastInputMethod: 'voice' | 'manual' | null;
}

export interface UserProfileState {
  storytellerName: string;
  storytellerEmail: string;
  ageAtEvents: string;
  eventLocation: string;
  storyTitle: string;
  isReturningUser: boolean;
  profileHasBeenEdited: boolean;
}

export interface StoryState {
  currentStoryText: string;
  lastTranscription: string | null;
  storySegments: string[];
  storyAudioSegments: Blob[];
  storyIsVisible: boolean;
  storyHasBeenEdited: boolean;
  storyCompleted: boolean;
  storySummary: string;
  showNewStoryConfirmation: boolean;
  questionsAsked: string[];
  storyEmailSent: boolean;
  showDownloadOffer: boolean;
}

export interface UIState {
  isEmailSending: boolean;
  storyEmailSent: boolean;
  showDownloadOffer: boolean;
  currentLanguage: SupportedLanguage;
  translationEnabled: boolean;
  targetLanguages: SupportedLanguage[];
}

export interface MemoriasAIState {
  recording: RecordingState;
  agent: AgentState;
  userProfile: UserProfileState;
  story: StoryState;
  ui: UIState;
}

// Action Types for Initial Flow (Agent Selection + Speaking)
export type RecordingAction = 
  | { type: 'START_RECORDING' }
  | { type: 'STOP_RECORDING' }
  | { type: 'SET_AUDIO_URL'; payload: string | null }
  | { type: 'SET_MEDIA_RECORDER'; payload: MediaRecorder | null }
  | { type: 'SET_AUDIO_MIME_TYPE'; payload: string }
  | { type: 'ADD_AUDIO_CHUNK'; payload: Blob }
  | { type: 'CLEAR_AUDIO_CHUNKS' }
  | { type: 'SET_LAST_RECORDING_TEXT'; payload: string | null }
  | { type: 'RESET_RECORDING' };

export type AgentAction =
  | { type: 'SELECT_VOICE'; payload: string }
  | { type: 'SET_HAS_AUTO_STARTED'; payload: boolean }
  | { type: 'SET_AGENT_QUESTION'; payload: string | null }
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
  | { type: 'START_VOICE_PREVIEW' }
  | { type: 'COMPLETE_VOICE_PREVIEW' }
  | { type: 'SET_CONVERSATION_PHASE'; payload: ConversationPhase }
  | { type: 'SET_INFO_GATHERING_STEP'; payload: InfoGatheringStep }
  | { type: 'SET_IS_GENERATING_QUESTION'; payload: boolean }
  | { type: 'SET_AGENT_AUDIO'; payload: string | null }
  | { type: 'SET_LAST_INPUT_METHOD'; payload: 'voice' | 'manual' | null };

export type UIAction =
  | { type: 'SET_LANGUAGE'; payload: SupportedLanguage }
  | { type: 'SET_IS_EMAIL_SENDING'; payload: boolean }
  | { type: 'SET_STORY_EMAIL_SENT'; payload: boolean }
  | { type: 'SET_SHOW_DOWNLOAD_OFFER'; payload: boolean };

export type UserProfileAction =
  | { type: 'SET_STORYTELLER_NAME'; payload: string }
  | { type: 'SET_STORYTELLER_EMAIL'; payload: string }
  | { type: 'SET_AGE_AT_EVENTS'; payload: string }
  | { type: 'SET_EVENT_LOCATION'; payload: string }
  | { type: 'SET_STORY_TITLE'; payload: string }
  | { type: 'SET_IS_RETURNING_USER'; payload: boolean }
  | { type: 'SET_PROFILE_EDITED'; payload: boolean };

export type StoryAction =
  | { type: 'SET_LAST_TRANSCRIPTION'; payload: string | null }
  | { type: 'SET_STORY_COMPLETED'; payload: boolean }
  | { type: 'SET_STORY_SUMMARY'; payload: string }
  | { type: 'SET_SHOW_NEW_STORY_CONFIRMATION'; payload: boolean }
  | { type: 'SET_CURRENT_STORY_TEXT'; payload: string }
  | { type: 'ADD_STORY_SEGMENT'; payload: string }
  | { type: 'CLEAR_STORY_SEGMENTS' }
  | { type: 'ADD_STORY_AUDIO_SEGMENT'; payload: Blob }
  | { type: 'CLEAR_STORY_AUDIO_SEGMENTS' }
  | { type: 'ADD_QUESTION_ASKED'; payload: string }
  | { type: 'CLEAR_QUESTIONS_ASKED' }
  | { type: 'SET_STORY_EMAIL_SENT'; payload: boolean }
  | { type: 'SET_SHOW_DOWNLOAD_OFFER'; payload: boolean };

export type MemoriasAIAction = RecordingAction | AgentAction | UIAction | UserProfileAction | StoryAction;

// Initial State
export const initialState: MemoriasAIState = {
  recording: {
    recording: false,
    audioURL: null,
    mediaRecorder: null,
    audioChunks: [],
    audioMimeType: 'audio/webm',
    lastTranscriptionTime: 0,
    detectedLanguage: null,
    lastRecordingText: null,
  },
  agent: {
    selectedVoice: null, // No pre-selection for guided experience
    agentQuestion: null,
    agentAudio: null,
    isGeneratingQuestion: false,
    questionsAsked: [],
    conversationPhase: 'setup',
    currentAgentMessage: '',
    agentSpeechState: 'idle',
    awaitingUserResponse: false,
    userCanInterrupt: false,
    pendingAgentAudio: null,
    infoGatheringStep: 'name',
    voicePreviewInProgress: false,
    hasAutoStarted: false,
    lastInputMethod: null,
  },
  userProfile: {
    storytellerName: '',
    storytellerEmail: '',
    ageAtEvents: '',
    eventLocation: '',
    storyTitle: '',
    isReturningUser: false,
    profileHasBeenEdited: false,
  },
  story: {
    currentStoryText: '',
    lastTranscription: null,
    storySegments: [],
    storyAudioSegments: [],
    storyIsVisible: false,
    storyHasBeenEdited: false,
    storyCompleted: false,
    storySummary: '',
    showNewStoryConfirmation: false,
    questionsAsked: [],
    storyEmailSent: false,
    showDownloadOffer: false,
  },
  ui: {
    isEmailSending: false,
    storyEmailSent: false,
    showDownloadOffer: false,
    currentLanguage: 'es',
    translationEnabled: false,
    targetLanguages: [],
  },
};

// Reducer Function
export function memoriasReducer(state: MemoriasAIState, action: MemoriasAIAction): MemoriasAIState {
  switch (action.type) {
    // Agent Actions (Critical for initial flow)
    case 'SELECT_VOICE':
      return {
        ...state,
        agent: {
          ...state.agent,
          selectedVoice: action.payload,
          // Reset states when voice changes
          agentSpeechState: 'idle',
          userCanInterrupt: false,
          voicePreviewInProgress: false,
          hasAutoStarted: false, // Reset auto-start when voice changes
        },
      };

    case 'SET_HAS_AUTO_STARTED':
      return {
        ...state,
        agent: {
          ...state.agent,
          hasAutoStarted: action.payload,
        },
      };

    case 'SET_AGENT_MESSAGE':
      return {
        ...state,
        agent: {
          ...state.agent,
          currentAgentMessage: action.payload,
        },
      };

    case 'CLEAR_AGENT_MESSAGE':
      return {
        ...state,
        agent: {
          ...state.agent,
          currentAgentMessage: '',
        },
      };

    case 'SET_AGENT_QUESTION':
      return {
        ...state,
        agent: {
          ...state.agent,
          agentQuestion: action.payload,
        },
      };

    case 'PREPARE_AGENT_SPEECH':
      return {
        ...state,
        agent: {
          ...state.agent,
          currentAgentMessage: action.payload.message,
          agentSpeechState: 'preparing',
          userCanInterrupt: false,
          ...(action.payload.audioUrl && { pendingAgentAudio: action.payload.audioUrl }),
        },
      };

    case 'START_AGENT_SPEAKING':
      return {
        ...state,
        agent: {
          ...state.agent,
          agentSpeechState: 'speaking',
          userCanInterrupt: true, // Allow interruption once speaking starts
        },
      };

    case 'STOP_AGENT_SPEAKING':
      return {
        ...state,
        agent: {
          ...state.agent,
          agentSpeechState: 'idle',
          userCanInterrupt: false,
        },
      };

    case 'COMPLETE_AGENT_SPEECH':
      return {
        ...state,
        agent: {
          ...state.agent,
          agentSpeechState: 'completed',
          awaitingUserResponse: true,
          userCanInterrupt: false,
        },
      };

    case 'INTERRUPT_AGENT_SPEECH':
      return {
        ...state,
        agent: {
          ...state.agent,
          agentSpeechState: 'interrupted',
          userCanInterrupt: false,
          awaitingUserResponse: true,
        },
      };

    case 'AWAIT_USER_RESPONSE':
      return {
        ...state,
        agent: {
          ...state.agent,
          awaitingUserResponse: true,
          agentSpeechState: 'awaiting_user_response',
        },
      };

    case 'RECEIVE_USER_RESPONSE':
      return {
        ...state,
        agent: {
          ...state.agent,
          awaitingUserResponse: false,
          agentSpeechState: 'idle',
        },
      };

    case 'START_VOICE_PREVIEW':
      return {
        ...state,
        agent: {
          ...state.agent,
          voicePreviewInProgress: true,
        },
      };

    case 'COMPLETE_VOICE_PREVIEW':
      return {
        ...state,
        agent: {
          ...state.agent,
          voicePreviewInProgress: false,
        },
      };

    case 'SET_CONVERSATION_PHASE':
      return {
        ...state,
        agent: {
          ...state.agent,
          conversationPhase: action.payload,
        },
      };

    case 'SET_INFO_GATHERING_STEP':
      return {
        ...state,
        agent: {
          ...state.agent,
          infoGatheringStep: action.payload,
        },
      };

    case 'SET_IS_GENERATING_QUESTION':
      return {
        ...state,
        agent: {
          ...state.agent,
          isGeneratingQuestion: action.payload,
        },
      };

    case 'SET_AGENT_AUDIO':
      return {
        ...state,
        agent: {
          ...state.agent,
          agentAudio: action.payload,
        },
      };

    case 'SET_LAST_INPUT_METHOD':
      return {
        ...state,
        agent: {
          ...state.agent,
          lastInputMethod: action.payload,
        },
      };

    // Recording Actions (Basic implementation)
    case 'START_RECORDING':
      return {
        ...state,
        recording: {
          ...state.recording,
          recording: true,
        },
      };

    case 'STOP_RECORDING':
      return {
        ...state,
        recording: {
          ...state.recording,
          recording: false,
        },
      };

    case 'SET_AUDIO_URL':
      return {
        ...state,
        recording: {
          ...state.recording,
          audioURL: action.payload,
        },
      };

    case 'SET_MEDIA_RECORDER':
      return {
        ...state,
        recording: {
          ...state.recording,
          mediaRecorder: action.payload,
        },
      };

    case 'SET_AUDIO_MIME_TYPE':
      return {
        ...state,
        recording: {
          ...state.recording,
          audioMimeType: action.payload,
        },
      };

    case 'ADD_AUDIO_CHUNK':
      return {
        ...state,
        recording: {
          ...state.recording,
          audioChunks: [...state.recording.audioChunks, action.payload],
        },
      };

    case 'CLEAR_AUDIO_CHUNKS':
      return {
        ...state,
        recording: {
          ...state.recording,
          audioChunks: [],
        },
      };

    case 'SET_LAST_RECORDING_TEXT':
      return {
        ...state,
        recording: {
          ...state.recording,
          lastRecordingText: action.payload,
        },
      };

    case 'RESET_RECORDING':
      return {
        ...state,
        recording: {
          ...initialState.recording,
        },
      };

    // UI Actions (Language support)
    case 'SET_LANGUAGE':
      return {
        ...state,
        ui: {
          ...state.ui,
          currentLanguage: action.payload,
        },
      };

    case 'SET_IS_EMAIL_SENDING':
      return {
        ...state,
        ui: {
          ...state.ui,
          isEmailSending: action.payload,
        },
      };

    case 'SET_STORY_EMAIL_SENT':
      return {
        ...state,
        ui: {
          ...state.ui,
          storyEmailSent: action.payload,
        },
      };

    case 'SET_SHOW_DOWNLOAD_OFFER':
      return {
        ...state,
        ui: {
          ...state.ui,
          showDownloadOffer: action.payload,
        },
      };

    // User Profile Actions
    case 'SET_STORYTELLER_NAME':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          storytellerName: action.payload,
        },
      };

    case 'SET_STORYTELLER_EMAIL':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          storytellerEmail: action.payload,
        },
      };

    case 'SET_AGE_AT_EVENTS':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          ageAtEvents: action.payload,
        },
      };

    case 'SET_EVENT_LOCATION':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          eventLocation: action.payload,
        },
      };

    case 'SET_STORY_TITLE':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          storyTitle: action.payload,
        },
      };

    case 'SET_IS_RETURNING_USER':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          isReturningUser: action.payload,
        },
      };

    case 'SET_PROFILE_EDITED':
      return {
        ...state,
        userProfile: {
          ...state.userProfile,
          profileHasBeenEdited: action.payload,
        },
      };

    // Story Actions
    case 'SET_LAST_TRANSCRIPTION':
      return {
        ...state,
        story: {
          ...state.story,
          lastTranscription: action.payload,
        },
      };

    case 'SET_STORY_COMPLETED':
      return {
        ...state,
        story: {
          ...state.story,
          storyCompleted: action.payload,
        },
      };

    case 'SET_STORY_SUMMARY':
      return {
        ...state,
        story: {
          ...state.story,
          storySummary: action.payload,
        },
      };

    case 'SET_SHOW_NEW_STORY_CONFIRMATION':
      return {
        ...state,
        story: {
          ...state.story,
          showNewStoryConfirmation: action.payload,
        },
      };

    case 'SET_CURRENT_STORY_TEXT':
      return {
        ...state,
        story: {
          ...state.story,
          currentStoryText: action.payload,
        },
      };

    case 'ADD_STORY_SEGMENT':
      return {
        ...state,
        story: {
          ...state.story,
          storySegments: [...state.story.storySegments, action.payload],
        },
      };

    case 'CLEAR_STORY_SEGMENTS':
      return {
        ...state,
        story: {
          ...state.story,
          storySegments: [],
        },
      };

    case 'ADD_STORY_AUDIO_SEGMENT':
      return {
        ...state,
        story: {
          ...state.story,
          storyAudioSegments: [...state.story.storyAudioSegments, action.payload],
        },
      };

    case 'CLEAR_STORY_AUDIO_SEGMENTS':
      return {
        ...state,
        story: {
          ...state.story,
          storyAudioSegments: [],
        },
      };

    case 'ADD_QUESTION_ASKED':
      return {
        ...state,
        story: {
          ...state.story,
          questionsAsked: [...state.story.questionsAsked, action.payload],
        },
      };

    case 'CLEAR_QUESTIONS_ASKED':
      return {
        ...state,
        story: {
          ...state.story,
          questionsAsked: [],
        },
      };

    case 'SET_STORY_EMAIL_SENT':
      return {
        ...state,
        story: {
          ...state.story,
          storyEmailSent: action.payload,
        },
      };

    case 'SET_SHOW_DOWNLOAD_OFFER':
      return {
        ...state,
        story: {
          ...state.story,
          showDownloadOffer: action.payload,
        },
      };

    default:
      return state;
  }
}

// Action Creators for Initial Flow
export const agentActions = {
  selectVoice: (voiceId: string): AgentAction => ({
    type: 'SELECT_VOICE',
    payload: voiceId,
  }),

  setHasAutoStarted: (hasStarted: boolean): AgentAction => ({
    type: 'SET_HAS_AUTO_STARTED',
    payload: hasStarted,
  }),

  setAgentMessage: (message: string): AgentAction => ({
    type: 'SET_AGENT_MESSAGE',
    payload: message,
  }),

  clearAgentMessage: (): AgentAction => ({
    type: 'CLEAR_AGENT_MESSAGE',
  }),

  setAgentQuestion: (question: string | null): AgentAction => ({
    type: 'SET_AGENT_QUESTION',
    payload: question,
  }),

  prepareAgentSpeech: (message: string, audioUrl?: string): AgentAction => ({
    type: 'PREPARE_AGENT_SPEECH',
    payload: { message, audioUrl },
  }),

  startAgentSpeaking: (): AgentAction => ({
    type: 'START_AGENT_SPEAKING',
  }),

  stopAgentSpeaking: (): AgentAction => ({
    type: 'STOP_AGENT_SPEAKING',
  }),

  completeAgentSpeech: (): AgentAction => ({
    type: 'COMPLETE_AGENT_SPEECH',
  }),

  interruptAgentSpeech: (): AgentAction => ({
    type: 'INTERRUPT_AGENT_SPEECH',
  }),

  awaitUserResponse: (): AgentAction => ({
    type: 'AWAIT_USER_RESPONSE',
  }),

  receiveUserResponse: (): AgentAction => ({
    type: 'RECEIVE_USER_RESPONSE',
  }),

  startVoicePreview: (): AgentAction => ({
    type: 'START_VOICE_PREVIEW',
  }),

  completeVoicePreview: (): AgentAction => ({
    type: 'COMPLETE_VOICE_PREVIEW',
  }),

  setConversationPhase: (phase: ConversationPhase): AgentAction => ({
    type: 'SET_CONVERSATION_PHASE',
    payload: phase,
  }),

  setInfoGatheringStep: (step: InfoGatheringStep): AgentAction => ({
    type: 'SET_INFO_GATHERING_STEP',
    payload: step,
  }),

  setIsGeneratingQuestion: (isGenerating: boolean): AgentAction => ({
    type: 'SET_IS_GENERATING_QUESTION',
    payload: isGenerating,
  }),

  setAgentAudio: (audioUrl: string | null): AgentAction => ({
    type: 'SET_AGENT_AUDIO',
    payload: audioUrl,
  }),

  setLastInputMethod: (method: 'voice' | 'manual' | null): AgentAction => ({
    type: 'SET_LAST_INPUT_METHOD',
    payload: method,
  }),
};

export const recordingActions = {
  startRecording: (): RecordingAction => ({
    type: 'START_RECORDING',
  }),

  stopRecording: (): RecordingAction => ({
    type: 'STOP_RECORDING',
  }),

  setAudioURL: (url: string | null): RecordingAction => ({
    type: 'SET_AUDIO_URL',
    payload: url,
  }),

  setMediaRecorder: (recorder: MediaRecorder | null): RecordingAction => ({
    type: 'SET_MEDIA_RECORDER',
    payload: recorder,
  }),

  setAudioMimeType: (mimeType: string): RecordingAction => ({
    type: 'SET_AUDIO_MIME_TYPE',
    payload: mimeType,
  }),

  addAudioChunk: (chunk: Blob): RecordingAction => ({
    type: 'ADD_AUDIO_CHUNK',
    payload: chunk,
  }),

  clearAudioChunks: (): RecordingAction => ({
    type: 'CLEAR_AUDIO_CHUNKS',
  }),

  setLastRecordingText: (text: string | null): RecordingAction => ({
    type: 'SET_LAST_RECORDING_TEXT',
    payload: text,
  }),

  resetRecording: (): RecordingAction => ({
    type: 'RESET_RECORDING',
  }),
};

export const uiActions = {
  setLanguage: (language: SupportedLanguage): UIAction => ({
    type: 'SET_LANGUAGE',
    payload: language,
  }),

  setIsEmailSending: (isEmailSending: boolean): UIAction => ({
    type: 'SET_IS_EMAIL_SENDING',
    payload: isEmailSending,
  }),

  setStoryEmailSent: (storyEmailSent: boolean): UIAction => ({
    type: 'SET_STORY_EMAIL_SENT',
    payload: storyEmailSent,
  }),

  setShowDownloadOffer: (showDownloadOffer: boolean): UIAction => ({
    type: 'SET_SHOW_DOWNLOAD_OFFER',
    payload: showDownloadOffer,
  }),
};

export const userProfileActions = {
  setStorytellerName: (name: string): UserProfileAction => ({
    type: 'SET_STORYTELLER_NAME',
    payload: name,
  }),

  setStorytellerEmail: (email: string): UserProfileAction => ({
    type: 'SET_STORYTELLER_EMAIL',
    payload: email,
  }),

  setAgeAtEvents: (age: string): UserProfileAction => ({
    type: 'SET_AGE_AT_EVENTS',
    payload: age,
  }),

  setEventLocation: (location: string): UserProfileAction => ({
    type: 'SET_EVENT_LOCATION',
    payload: location,
  }),

  setStoryTitle: (title: string): UserProfileAction => ({
    type: 'SET_STORY_TITLE',
    payload: title,
  }),

  setIsReturningUser: (isReturning: boolean): UserProfileAction => ({
    type: 'SET_IS_RETURNING_USER',
    payload: isReturning,
  }),

  setProfileEdited: (edited: boolean): UserProfileAction => ({
    type: 'SET_PROFILE_EDITED',
    payload: edited,
  }),
};

export const storyActions = {
  setLastTranscription: (transcription: string | null): StoryAction => ({
    type: 'SET_LAST_TRANSCRIPTION',
    payload: transcription,
  }),

  setStoryCompleted: (completed: boolean): StoryAction => ({
    type: 'SET_STORY_COMPLETED',
    payload: completed,
  }),

  setStorySummary: (summary: string): StoryAction => ({
    type: 'SET_STORY_SUMMARY',
    payload: summary,
  }),

  setShowNewStoryConfirmation: (show: boolean): StoryAction => ({
    type: 'SET_SHOW_NEW_STORY_CONFIRMATION',
    payload: show,
  }),

  setCurrentStoryText: (text: string): StoryAction => ({
    type: 'SET_CURRENT_STORY_TEXT',
    payload: text,
  }),

  addStorySegment: (segment: string): StoryAction => ({
    type: 'ADD_STORY_SEGMENT',
    payload: segment,
  }),

  clearStorySegments: (): StoryAction => ({
    type: 'CLEAR_STORY_SEGMENTS',
  }),

  addStoryAudioSegment: (audioBlob: Blob): StoryAction => ({
    type: 'ADD_STORY_AUDIO_SEGMENT',
    payload: audioBlob,
  }),

  clearStoryAudioSegments: (): StoryAction => ({
    type: 'CLEAR_STORY_AUDIO_SEGMENTS',
  }),

  addQuestionAsked: (question: string): StoryAction => ({
    type: 'ADD_QUESTION_ASKED',
    payload: question,
  }),

  clearQuestionsAsked: (): StoryAction => ({
    type: 'CLEAR_QUESTIONS_ASKED',
  }),

  setStoryEmailSent: (sent: boolean): StoryAction => ({
    type: 'SET_STORY_EMAIL_SENT',
    payload: sent,
  }),

  setShowDownloadOffer: (show: boolean): StoryAction => ({
    type: 'SET_SHOW_DOWNLOAD_OFFER',
    payload: show,
  }),
};