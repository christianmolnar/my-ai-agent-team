"use client";

import { useState, useEffect, useRef, useReducer } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { transcribeAudio } from '../../agents/whisper_transcribe';
import { getArgentineVoices, getVoiceGender, applyGenderGrammar } from '../../agents/tts';
import { MemoryManager } from '../../lib/AgentMemory';
import { formatStoryText } from '../../lib/utils';
import { 
  memoriasReducer, 
  initialState, 
  agentActions, 
  recordingActions, 
  uiActions,
  userProfileActions,
  type MemoriasAIState,
  type SupportedLanguage 
} from '../../lib/memoriasReducer';

// Internationalization system for 99-language strategy
interface LocalizedStrings {
  VOICE_SELECTION_TITLE: string;
  VOICE_SELECTION_INSTRUCTION: string;
  VOICE_PREVIEW_MESSAGE: string;
  VOICE_PLAYING: string;
  WELCOME_MESSAGE: string;
  INTERRUPT_AGENT_BUTTON: string;
  SPEAK_TO_AGENT_BUTTON: string;
  STOP_RECORDING_BUTTON: string;
  INFO_FORM_TITLE: string;
  NAME_LABEL: string;
  AGE_LABEL: string;
  LOCATION_LABEL: string;
  STORY_TITLE_LABEL?: string;
  NAME_PLACEHOLDER: string;
  AGE_PLACEHOLDER: string;
  LOCATION_PLACEHOLDER: string;
  STORY_TITLE_PLACEHOLDER?: string;
  TELL_STORY_BUTTON?: string;
  CONTINUE_BUTTON: string;
  EDIT_INFO_BUTTON: string;
  DISCARD_LAST_BUTTON?: string;
}

const localizedStrings: Record<SupportedLanguage, LocalizedStrings> = {
  es: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    STORY_TITLE_LABEL: "Título de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    STORY_TITLE_PLACEHOLDER: "Dale un título a tu historia...",
    TELL_STORY_BUTTON: "🎙️ Contar mi Historia",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información",
    DISCARD_LAST_BUTTON: "🗑️ Descartar Última"
  },
  en: {
    VOICE_SELECTION_TITLE: "Choose your guide to begin...",
    VOICE_SELECTION_INSTRUCTION: "Choose your guide to begin...",
    VOICE_PREVIEW_MESSAGE: "Hello, I'm {voiceName}. {description}",
    VOICE_PLAYING: "Playing...",
    WELCOME_MESSAGE: "Hello! I'm {voiceName}, your personal assistant for creating memories. To help you better, I'd like to get to know you. Could you tell me your name?",
    INTERRUPT_AGENT_BUTTON: "Interrupt Agent",
    SPEAK_TO_AGENT_BUTTON: "Speak to Agent",
    STOP_RECORDING_BUTTON: "⏹️ Stop Recording",
    INFO_FORM_TITLE: "Your Personal Information",
    NAME_LABEL: "Name",
    AGE_LABEL: "Age during events",
    LOCATION_LABEL: "Story location",
    NAME_PLACEHOLDER: "Tell me your name...",
    AGE_PLACEHOLDER: "How old were you when these events happened?",
    LOCATION_PLACEHOLDER: "Where did this story take place?",
    CONTINUE_BUTTON: "Continue with the story",
    EDIT_INFO_BUTTON: "Edit information"
  },
  // For now, use Spanish as fallback for other languages  
  pt: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  fr: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  de: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  it: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  zh: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  ja: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  ko: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  ar: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  hi: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  },
  ru: {
    VOICE_SELECTION_TITLE: "Selecciona tu guía para comenzar...",
    VOICE_SELECTION_INSTRUCTION: "Selecciona tu guía para comenzar...",
    VOICE_PREVIEW_MESSAGE: "Hola, soy {voiceName}. {description}",
    VOICE_PLAYING: "Reproduciendo...",
    WELCOME_MESSAGE: "¡Hola! Soy {voiceName}, tu asistente personal para crear memorias. Para poder ayudarte, me gustaría conocerte mejor. ¿Podrías decirme tu nombre?",
    INTERRUPT_AGENT_BUTTON: "Interrumpir Agente",
    SPEAK_TO_AGENT_BUTTON: "Hablar con el agente",
    STOP_RECORDING_BUTTON: "⏹️ Detener Grabación",
    INFO_FORM_TITLE: "Tu Información Personal",
    NAME_LABEL: "Nombre",
    AGE_LABEL: "Edad en los eventos",
    LOCATION_LABEL: "Lugar de la historia",
    NAME_PLACEHOLDER: "Dime tu nombre...",
    AGE_PLACEHOLDER: "¿Qué edad tenías cuando ocurrieron estos eventos?",
    LOCATION_PLACEHOLDER: "¿Dónde ocurrió esta historia?",
    CONTINUE_BUTTON: "Continuar con la historia",
    EDIT_INFO_BUTTON: "Editar información"
  }
};

// Helper function to get localized text with variable interpolation
const getLocalizedText = (
  key: keyof LocalizedStrings, 
  language: SupportedLanguage, 
  variables?: Record<string, string>
): string => {
  let text = localizedStrings[language]?.[key] || localizedStrings['es'][key] || key; // Fallback to Spanish or key name
  
  if (variables && text) {
    Object.entries(variables).forEach(([varKey, value]) => {
      text = text!.replace(`{${varKey}}`, value);
    });
  }
  
  return text || key;
};

export default function MemoriasAIPage() {
  // 🚀 STEP 1: REDUCER FOUNDATION
  // Replace useState with useReducer for better state management
  const [state, dispatch] = useReducer(memoriasReducer, initialState);

  // Audio reference for proper interruption control
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // ⚠️ TEMPORARY: Legacy useState hooks (will be migrated progressively)
  // These will be moved to reducer in subsequent steps
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const [questionsAsked, setQuestionsAsked] = useState<string[]>([]);
  const silenceTimer = useRef<NodeJS.Timeout | null>(null);
  const [lastTranscriptionTime, setLastTranscriptionTime] = useState<number>(0);
  const [storySegments, setStorySegments] = useState<string[]>([]);
  const [editableStoryContent, setEditableStoryContent] = useState<string>('');
  const [storytellerName, setStorytellerName] = useState('');
  const [storytellerEmail, setStorytellerEmail] = useState('');
  const [ageAtEvents, setAgeAtEvents] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [storyAudioSegments, setStoryAudioSegments] = useState<Blob[]>([]);
  const [storyEmailSent, setStoryEmailSent] = useState(false);
  const [lastSentToEmail, setLastSentToEmail] = useState(''); // Track which email was actually sent to
  const [showDownloadOffer, setShowDownloadOffer] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);

  // Initialize agent memory with best practices
  useEffect(() => {
    const initializeAgent = async () => {
      try {
        await MemoryManager.initializeAgentBestPractices('MemoriasAI');
        console.log('Agent best practices initialized');
      } catch (error) {
        console.error('Error initializing agent:', error);
      }
    };
    
    initializeAgent();
  }, []);

  // 🎯 CORE FLOW: Welcome message when voice is selected
  useEffect(() => {
    const triggerWelcomeMessage = async () => {
      // Only trigger when voice is selected and not already started
      if (state.agent.selectedVoice && !state.agent.hasAutoStarted && state.agent.agentSpeechState === 'idle') {
        console.log('🎤 Voice selected, triggering welcome message...');
        
        // Mark as auto-started to prevent re-triggering
        dispatch(agentActions.setHasAutoStarted(true));
        
        // Start the info gathering process
        await startInfoGathering();
      }
    };
    
    triggerWelcomeMessage();
  }, [state.agent.selectedVoice, state.agent.hasAutoStarted, state.agent.agentSpeechState]);

  // Helper function to get correct file extension based on MIME type
  const getFileExtension = (mimeType: string): string => {
    const mimeToExt: { [key: string]: string } = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/ogg': 'ogg',
      'audio/wav': 'wav',
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3'
    };
    
    // Extract base mime type (remove codec info)
    const baseMimeType = mimeType.split(';')[0];
    return mimeToExt[baseMimeType] || 'webm'; // default to webm
  };

  // Function to concatenate story audio segments
  const createCombinedStoryAudio = (): Blob | null => {
    if (storyAudioSegments.length === 0) return null;
    
    // Combine all story audio segments
    const combinedBlob = new Blob(storyAudioSegments, { type: state.recording.audioMimeType });
    console.log(`Combined audio: ${storyAudioSegments.length} segments, total size: ${combinedBlob.size} bytes`);
    return combinedBlob;
  };

  // Set body styles when component mounts
  useEffect(() => {
    document.body.style.background = 
      "linear-gradient(135deg, #181a1b 0%, #232526 100%)";
    document.body.style.color = "#f3f3f3";
    document.body.style.fontFamily = "Segoe UI, Arial, sans-serif";

    // Clean up body styles when component unmounts
    return () => {
      document.body.style.background = "";
      document.body.style.color = "";
      document.body.style.fontFamily = "";
    };
  }, []);

  // Automatic transition to storytelling when all profile fields are filled with minimum requirements
  useEffect(() => {
    const nameValid = state.userProfile.storytellerName.trim().length >= 3;
    const ageValid = state.userProfile.ageAtEvents.trim().length >= 1; 
    const locationValid = state.userProfile.eventLocation.trim().length >= 3; // Reduced from 6 to 3
    const titleValid = (state.userProfile.storyTitle?.trim().length || 0) >= 3; // Reduced from 6 to 3
    const hasAllInfo = nameValid && ageValid && locationValid && titleValid;
    
    console.log('🔍 Form validation check:', {
      name: state.userProfile.storytellerName.trim(),
      nameValid,
      age: state.userProfile.ageAtEvents.trim(),
      ageValid,
      location: state.userProfile.eventLocation.trim(),
      locationValid,
      title: state.userProfile.storyTitle?.trim() || '',
      titleValid,
      hasAllInfo,
      phase: state.agent.conversationPhase
    });
    
    if (hasAllInfo && state.agent.conversationPhase === 'info_gathering') {
      console.log('✅ All fields valid, starting transition timer...');
      // Add a small delay to prevent premature transition while typing
      const transitionTimer = setTimeout(() => {
        console.log('🚀 Transitioning to storytelling phase...');
        // Mark as returning user
        dispatch(userProfileActions.setIsReturningUser(true));
        
        // Move to storytelling phase
        dispatch(agentActions.setConversationPhase('storytelling'));
        
        // Agent confirms the information and asks to begin story
        const confirmationMessage = `Perfecto, ${state.userProfile.storytellerName}. Tienes ${state.userProfile.ageAtEvents} años en esta historia "${state.userProfile.storyTitle}" que ocurrió en ${state.userProfile.eventLocation}. Ahora puedes grabar tu historia usando los botones de abajo.`;
        speakAgentMessage(confirmationMessage);
      }, 1500); // Wait 1.5 seconds before transitioning
      
      // Cleanup function to cancel the timer if component unmounts or dependencies change
      return () => {
        console.log('🔄 Clearing transition timer');
        clearTimeout(transitionTimer);
      };
    }
  }, [state.userProfile.storytellerName, state.userProfile.ageAtEvents, state.userProfile.eventLocation, state.userProfile.storyTitle, state.agent.conversationPhase]);

  // Compute the full story content from all segments or use editable version
  const fullStoryContent = editableStoryContent || (storySegments.length > 0 ? storySegments.join('\n\n') : transcribedText);

  // Sync editable content with transcribed segments when they change
  useEffect(() => {
    const transcribedContent = storySegments.length > 0 ? storySegments.join('\n\n') : transcribedText;
    // Always update with the latest transcribed content, even if empty (to clear the textarea)
    setEditableStoryContent(transcribedContent || '');
  }, [storySegments, transcribedText]);

  // Smart agent state management - detect manual form completion during conversation
  useEffect(() => {
    // Only apply this logic during info gathering phase
    if (state.agent.conversationPhase !== 'info_gathering') return;
    
    const currentStep = state.agent.infoGatheringStep;
    const isAwaitingResponse = state.agent.awaitingUserResponse;
    const lastInputMethod = state.agent.lastInputMethod;
    
    // Check if the current step's field has been manually filled
    let fieldCompleted = false;
    let nextStep: any = null;
    
    switch (currentStep) {
      case 'name':
        fieldCompleted = state.userProfile.storytellerName.trim().length >= 3;
        nextStep = 'age';
        break;
      case 'age':
        fieldCompleted = state.userProfile.ageAtEvents.trim().length >= 1;
        nextStep = 'location';
        break;
      case 'location':
        fieldCompleted = state.userProfile.eventLocation.trim().length >= 3; // Reduced from 6 to 3
        nextStep = 'title';
        break;
      case 'title':
        fieldCompleted = (state.userProfile.storyTitle?.trim().length || 0) >= 3; // Reduced from 6 to 3
        nextStep = 'completed';
        break;
    }
    
    // If the agent is waiting for a response but the user has manually filled the current field
    if (isAwaitingResponse && fieldCompleted && currentStep !== 'completed' && currentStep !== 'returning_user_check') {
      console.log(`🤖 Smart detection: User filled ${currentStep} field via ${lastInputMethod}, advancing to ${nextStep}`);
      
      // Stop waiting for user response
      dispatch(agentActions.receiveUserResponse());
      
      // Advance to next step or complete
      if (nextStep === 'completed') {
        // All fields are done, move to storytelling
        dispatch(agentActions.setInfoGatheringStep('completed'));
        dispatch(agentActions.setConversationPhase('storytelling'));
        
        // Only speak confirmation if the last input was NOT manual typing
        if (lastInputMethod !== 'manual') {
          const confirmationMessage = `Perfecto, ${state.userProfile.storytellerName}. Ya tengo toda la información. Tienes ${state.userProfile.ageAtEvents} años en esta historia "${state.userProfile.storyTitle}" que ocurrió en ${state.userProfile.eventLocation}. Ahora puedes grabar tu historia usando los botones de abajo.`;
          speakAgentMessage(confirmationMessage);
        }
      } else {
        // Move to next step and ask next question
        dispatch(agentActions.setInfoGatheringStep(nextStep));
        
        // Only ask next question if the last input was NOT manual typing
        if (lastInputMethod !== 'manual') {
          let nextQuestion = '';
          switch (nextStep) {
            case 'age':
              nextQuestion = `Perfecto, ${state.userProfile.storytellerName}. Ahora, ¿qué edad tenías cuando ocurrieron los eventos de esta historia que me vas a contar?`;
              break;
            case 'location':
              nextQuestion = `Muy bien. ¿En qué lugar ocurrieron estos eventos que me vas a narrar?`;
              break;
            case 'title':
              nextQuestion = `Muy bien. Ahora, ¿qué título le darías a esta historia que me vas a contar?`;
              break;
          }
          
          if (nextQuestion) {
            speakAgentMessage(nextQuestion);
          }
        }
      }
    }
  }, [
    state.agent.conversationPhase,
    state.agent.infoGatheringStep,
    state.agent.awaitingUserResponse,
    state.agent.lastInputMethod,
    state.userProfile.storytellerName,
    state.userProfile.ageAtEvents,
    state.userProfile.eventLocation,
    state.userProfile.storyTitle
  ]);

  // Enhanced button state management with internationalization
  const getRecordingButtonState = () => {
    if (state.recording.recording) {
      return {
        text: getLocalizedText('STOP_RECORDING_BUTTON', state.ui.currentLanguage),
        disabled: false,
        variant: 'stop'
      };
    }
    
    // Special handling for storytelling transition - when agent is speaking confirmation message
    if (state.agent.conversationPhase === 'storytelling' && 
        (state.agent.agentSpeechState === 'speaking' || state.agent.agentSpeechState === 'preparing') && 
        state.agent.userCanInterrupt) {
      return {
        text: '⏸️ Interrumpir',
        disabled: false,
        variant: 'interrupt',
        highlight: true
      };
    }
    
    // If agent is speaking and user can interrupt (info gathering phase)
    if (state.agent.agentSpeechState === 'speaking' && state.agent.userCanInterrupt) {
      return {
        text: getLocalizedText('INTERRUPT_AGENT_BUTTON', state.ui.currentLanguage),
        disabled: false,
        variant: 'interrupt',
        highlight: true
      };
    }
    
    // If agent is preparing speech and user can interrupt
    if (state.agent.agentSpeechState === 'preparing' && state.agent.userCanInterrupt) {
      return {
        text: getLocalizedText('INTERRUPT_AGENT_BUTTON', state.ui.currentLanguage),
        disabled: false,
        variant: 'interrupt'
      };
    }
    
    // If agent was interrupted or completed speaking, or awaiting user response
    if (state.agent.agentSpeechState === 'awaiting_user_response' || 
        state.agent.agentSpeechState === 'interrupted' ||
        state.agent.agentSpeechState === 'completed' ||
        state.agent.awaitingUserResponse) {
      return {
        text: getLocalizedText('SPEAK_TO_AGENT_BUTTON', state.ui.currentLanguage),
        disabled: false,
        variant: 'response'
      };
    }
    
    // Default conversation flow
    if (state.agent.conversationPhase === 'info_gathering') {
      return {
        text: '🎙️ ' + getLocalizedText('SPEAK_TO_AGENT_BUTTON', state.ui.currentLanguage),
        disabled: false,
        variant: 'normal'
      };
    }
    
    // Storytelling phase
    if (state.agent.conversationPhase === 'storytelling') {
      return {
        text: '🎙️ Grabar Historia',
        disabled: false,
        variant: 'normal'
      };
    }

    // Default fallback
    return {
      text: '🎙️ ' + getLocalizedText('SPEAK_TO_AGENT_BUTTON', state.ui.currentLanguage),
      disabled: false,
      variant: 'normal'
    };
  };

  const startRecording = async () => {
    // For storytelling phase, ensure we have all required info with minimum lengths
    if (state.agent.conversationPhase === 'storytelling') {
      const nameValid = state.userProfile.storytellerName.trim().length >= 3;
      const ageValid = state.userProfile.ageAtEvents.trim().length >= 1;
      const locationValid = state.userProfile.eventLocation.trim().length >= 3; // Reduced from 6 to 3
      const titleValid = (state.userProfile.storyTitle?.trim().length || 0) >= 3; // Reduced from 6 to 3
      
      if (!nameValid || !ageValid || !locationValid || !titleValid) {
        alert('Por favor complete toda la información requerida:\n- Nombre (mínimo 3 caracteres)\n- Edad (al menos 1 dígito)\n- Lugar (mínimo 3 caracteres)\n- Título (mínimo 3 caracteres)');
        return;
      }
    }

    // 🚨 ENHANCED ERROR HANDLING: Track recording start time
    const recordingStartTime = Date.now();

    // Reset states
    dispatch(recordingActions.clearAudioChunks());
    dispatch(recordingActions.setAudioURL(null));
    // Note: Don't reset transcribedText during storytelling to preserve accumulated content
    
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create a local array to store audio chunks without relying on React state
      let localAudioChunks: Blob[] = [];
      
      // Specify audio MIME type options that are compatible with Whisper API
      let options = {};
      
      // Try different MIME types that are supported by both the browser and Whisper API
      // Prioritize MP3 as it's more compressed than WAV
      const mimeTypes = [
        'audio/mp3',
        'audio/mpeg', 
        'audio/ogg',
        'audio/wav',  // WAV is less compressed but widely supported
        'audio/webm'  // Often supported but with codec issues
      ];
      
      // Find the first supported MIME type
      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          options = { mimeType };
          selectedMimeType = mimeType;
          console.log(`Using MIME type: ${mimeType}`);
          break;
        }
      }
      
      // Fallback if none of our preferred types are supported
      if (!selectedMimeType) {
        console.log("No preferred MIME types supported, using browser default");
        selectedMimeType = 'audio/webm'; // reasonable default
      }
      
      const recorder = new MediaRecorder(stream, options);
      
      // Store the actual MIME type for proper file naming
      dispatch(recordingActions.setAudioMimeType(recorder.mimeType || selectedMimeType));
      
      // Set up event handlers to collect audio data
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          console.log(`Received audio chunk: ${event.data.size} bytes`);
          localAudioChunks.push(event.data);
          // Also update React state for UI updates
          dispatch(recordingActions.addAudioChunk(event.data));
        }
      };
      
      recorder.onstop = async () => {
        // Get the recorder's mime type but clean it from codec info
        let mimeType = recorder.mimeType || 'audio/mp3';
        
        // If the mime type has codec information, extract just the base type
        if (mimeType.includes(';')) {
          mimeType = mimeType.split(';')[0];
        }
        
        console.log(`Recording stopped, collected ${localAudioChunks.length} chunks`);
        
        // Make sure we have data - use local array instead of state
        if (localAudioChunks.length === 0) {
          console.error("No audio data captured!");
          setTranscribedText("No recorded narration");
          return;
        }
        
        // Check total audio size - if too small, likely just silence
        const totalSize = localAudioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log("Audio chunks captured:", localAudioChunks.length, 
          "Total size:", totalSize, "bytes");
          
        if (totalSize < 1000) { // Less than 1KB is likely just headers/silence
          console.warn("Audio data too small, likely silence or no meaningful content");
          setTranscribedText("No recorded narration");
          return;
        }
        
        // Create the audio blob with the actual type from the recorder
        // Use localAudioChunks instead of state variable
        const audioBlob = new Blob(localAudioChunks, { type: mimeType });
        console.log(`Creating audio blob with type: ${mimeType}, size: ${audioBlob.size} bytes`);
        
        // Save audio segment if this is story content (not info gathering)
        if (state.agent.conversationPhase === 'storytelling') {
          setStoryAudioSegments(prev => [...prev, audioBlob]);
          console.log('Saved story audio segment');
        }
        
        // Create URL for playback
        const url = URL.createObjectURL(audioBlob);
        dispatch(recordingActions.setAudioURL(url));
        
        try {
          // Log the audio details before sending
          console.log("Audio details:", {
            type: audioBlob.type,
            size: audioBlob.size,
            chunks: localAudioChunks.length
          });
          
          // 🚨 ENHANCED ERROR HANDLING: Pass recording start time for validation
          await processTranscription(audioBlob, recordingStartTime);
        } catch (error) {
          console.error("Error in transcription process:", error);
          setTranscribedText("Error al transcribir. Por favor, intente nuevamente.");
        }
      };
      
      // Start recording with smaller time slices for more frequent data capture
      console.log("Starting MediaRecorder...");
      try {
        // Use a shorter time slice (200ms) to capture more chunks and ensure we get data
        recorder.start(200);
        console.log("MediaRecorder successfully started");
        
        dispatch(recordingActions.setMediaRecorder(recorder));
        dispatch(recordingActions.startRecording());
        
        console.log("Recording started with MediaRecorder:", {
          state: recorder.state,
          mimeType: recorder.mimeType
        });
        
        // Force an additional data capture after a brief delay
        setTimeout(() => {
          if (recorder.state === 'recording') {
            console.log('Requesting additional data capture');
            recorder.requestData();
          }
        }, 500);
      } catch (recorderError) {
        console.error("Error starting MediaRecorder:", recorderError);
        alert("Error al iniciar la grabación. Por favor, intente nuevamente.");
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("No se pudo acceder al micrófono. Por favor, asegúrese de que está conectado y que ha dado permiso para usarlo.");
    }
  };

  const stopRecording = () => {
    if (state.recording.mediaRecorder) {
      console.log(`Stopping recording. Current state: ${state.recording.mediaRecorder.state}`);
      
      try {
        // Request a final data chunk before stopping
        if (state.recording.mediaRecorder.state === 'recording') {
          console.log('Requesting final data chunk before stopping');
          state.recording.mediaRecorder.requestData();
          
          // Small delay to ensure the data is processed
          setTimeout(() => {
            state.recording.mediaRecorder?.stop();
            console.log('MediaRecorder stopped');
            
            // Stop all audio tracks
            state.recording.mediaRecorder?.stream.getTracks().forEach(track => {
              track.stop();
              console.log('Audio track stopped');
            });
            
            dispatch(recordingActions.stopRecording());
          }, 200);
        } else {
          console.log('MediaRecorder not in recording state, cannot stop');
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
        dispatch(recordingActions.stopRecording());
      }
    } else {
      console.error('No MediaRecorder instance found');
    }
  };

  const processTranscription = async (audioBlob: Blob, recordingStartTime?: number) => {
    try {
      console.log("Processing audio blob:", audioBlob.size, "bytes", "type:", audioBlob.type);
      
      // 🚨 ENHANCED ERROR HANDLING: Check for short/empty recordings
      const recordingDuration = recordingStartTime ? Date.now() - recordingStartTime : 0;
      
      if (!audioBlob || audioBlob.size === 0) {
        console.log("No audio data captured");
        setTranscribedText("No se pudo capturar audio");
        await handleTranscriptionRetry(state.agent.conversationPhase as 'info_gathering' | 'storytelling');
        return;
      }
      
      if (isRecordingTooShort(audioBlob, recordingDuration)) {
        console.log("Recording too short:", { size: audioBlob.size, duration: recordingDuration });
        setTranscribedText("Grabación muy corta");
        await handleTranscriptionRetry(state.agent.conversationPhase as 'info_gathering' | 'storytelling');
        return;
      }
      
      setTranscribedText("Transcribiendo audio...");
      
      // Add timeout wrapper for all transcription attempts
      const timeoutMs = 30000; // 30 seconds timeout
      
      try {
        console.log("Attempting server-side transcription with timeout...");
        
        // Create a File object for more reliable server handling
        const timestamp = Date.now();
        const audioFile = new File(
          [audioBlob], 
          `recording-${timestamp}.mp3`, 
          { type: 'audio/mp3', lastModified: timestamp }
        );
        
        console.log("Created audio file for server API:", {
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type
        });
        
        // Set up form data with the File object
        const formData = new FormData();
        formData.append('audio', audioFile);
        
        console.log("Sending audio to server-side API endpoint");
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Transcription timeout')), timeoutMs);
        });
        
        // Wrap fetch in timeout
        const fetchPromise = fetch('/api/transcribe-audio', {
          method: 'POST',
          body: formData,
        });
        
        const response = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
          console.error("Server returned error:", errorData);
          throw new Error(`Server error: ${errorData.error || 'Unknown error'}`);
        }
        
        const transcriptionResult = await response.json();
        const transcription = transcriptionResult.text;
        
        console.log("Received server transcription:", transcription);
        
        // 🚨 ENHANCED ERROR HANDLING: Validate transcription result
        if (isTranscriptionInvalid(transcription)) {
          console.log("Invalid transcription result:", transcription);
          setTranscribedText("No se pudo entender el audio");
          await handleTranscriptionRetry(state.agent.conversationPhase as 'info_gathering' | 'storytelling');
          return;
        }
        
        const formattedTranscription = formatStoryText(transcription);
        setTranscribedText(formattedTranscription);
        
        // Track the last recording for discard functionality
        console.log('🎯 SETTING lastRecordingText:', JSON.stringify(formattedTranscription));
        dispatch(recordingActions.setLastRecordingText(formattedTranscription));
        
        // Handle conversation flow based on current phase
        if (state.agent.conversationPhase === 'info_gathering') {
          await processInfoGatheringResponse(transcription);
        } else if (state.agent.conversationPhase === 'storytelling') {
          await analyzeStoryAndRespond(transcription);
        }
        
        return; // Exit early since server transcription worked
      } catch (serverError) {
        console.warn("Server API transcription failed:", serverError);
        
        // Check if it was a timeout
        if (serverError instanceof Error && serverError.message === 'Transcription timeout') {
          console.error("Transcription timed out after 30 seconds");
          setTranscribedText("La transcripción tardó demasiado. Intenta de nuevo.");
          await handleTranscriptionRetry(state.agent.conversationPhase as 'info_gathering' | 'storytelling');
          return;
        }
        
        // For other server errors, show generic error and allow retry
        console.error("Server transcription failed:", serverError);
        setTranscribedText("Error en la transcripción. Intenta de nuevo.");
        await handleTranscriptionRetry(state.agent.conversationPhase as 'info_gathering' | 'storytelling');
        return;
      }
      
    } catch (error) {
      console.error("Transcription process error:", error);
      setTranscribedText("Error en la transcripción. Intenta de nuevo.");
      await handleTranscriptionRetry(state.agent.conversationPhase as 'info_gathering' | 'storytelling');
    }
  };

  // 🚨 ERROR HANDLING UTILITIES
  // Check if audio recording is too short or empty
  const isRecordingTooShort = (audioBlob: Blob, recordingDuration: number): boolean => {
    const minDurationMs = 500; // Minimum 0.5 seconds
    const minSizeBytes = 1000; // Minimum 1KB
    
    return recordingDuration < minDurationMs || audioBlob.size < minSizeBytes;
  };

  // Check if transcription result looks like a sample/test response
  const isTranscriptionInvalid = (text: string): boolean => {
    const cleanText = text.toLowerCase().trim();
    
    // Check for empty or very short responses
    if (cleanText.length < 3) return true;
    
    // Check for common API sample responses
    const sampleResponses = [
      'thank you for using whisper',
      'this is a test',
      'test recording',
      'sample audio',
      'hello world',
      'testing testing',
      'you',
      'i',
      'the',
      'a',
      'an'
    ];
    
    return sampleResponses.includes(cleanText);
  };

  // Handle retry with "I didn't get that" message
  const handleTranscriptionRetry = async (phase: 'info_gathering' | 'storytelling') => {
    let retryMessage = '';
    
    if (phase === 'info_gathering') {
      // Get the current question being asked in info gathering
      switch (state.agent.infoGatheringStep) {
        case 'name':
          retryMessage = 'No pude escucharte bien. ¿Podrías decirme tu nombre de nuevo?';
          break;
        case 'age':
          retryMessage = 'No pude escucharte bien. ¿Qué edad tenías cuando ocurrieron estos eventos?';
          break;
        case 'location':
          retryMessage = 'No pude escucharte bien. ¿En qué lugar ocurrieron estos eventos?';
          break;
        case 'returning_user_check':
          retryMessage = 'No pude escucharte bien. ¿Qué información te gustaría cambiar para esta nueva historia?';
          break;
        default:
          retryMessage = 'No pude escucharte bien. ¿Podrías repetir lo que dijiste?';
      }
    } else {
      retryMessage = 'No pude escuchar tu historia claramente. ¿Podrías contarme esa parte de nuevo?';
    }
    
    await speakAgentMessage(retryMessage);
  };

  // Enhanced voice preview with double-click prevention
  const previewVoice = async (voice: any) => {
    // Prevent multiple voice previews from playing simultaneously
    if (state.agent.voicePreviewInProgress) {
      console.log('Voice preview already in progress, ignoring click');
      return;
    }

    // If voice is already selected, play preview (user wants to hear it again)
    if (state.agent.selectedVoice === voice.id) {
      dispatch(agentActions.startVoicePreview());
      
      try {
        const previewText = getLocalizedText('VOICE_PREVIEW_MESSAGE', state.ui.currentLanguage, {
          voiceName: voice.name,
          description: voice.description
        });
        
        // Call the API route instead of client-side function
        const response = await fetch('/api/text-to-speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: previewText,
            voice: voice.id,
            speed: 0.9
          }),
        });

        if (!response.ok) {
          throw new Error(`TTS API failed: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        
        // Set up completion handlers
        audio.onended = () => {
          dispatch(agentActions.completeVoicePreview());
          URL.revokeObjectURL(audioUrl); // Clean up memory
        };
        
        audio.onerror = () => {
          dispatch(agentActions.completeVoicePreview());
          URL.revokeObjectURL(audioUrl);
        };
        
        audio.play();
        
      } catch (error) {
        console.error('Error previewing voice:', error);
        dispatch(agentActions.completeVoicePreview());
      }
      return; // Exit early, don't change voice selection
    }
    
    // First time selecting this voice - just select it without preview
    dispatch(agentActions.selectVoice(voice.id));
    
    // If this interrupts any agent speech, stop it
    if (state.agent.agentSpeechState === 'speaking' || state.agent.agentSpeechState === 'preparing') {
      dispatch(agentActions.interruptAgentSpeech());
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    }
  };

  // Agent conversation functions
  const speakAgentMessage = async (message: string) => {
    // Apply gender-aware Spanish grammar based on selected voice
    const voiceGender = getVoiceGender(state.agent.selectedVoice || 'nova'); // Default to nova (Valentina) if no voice selected
    const correctedMessage = applyGenderGrammar(message, voiceGender);
    
    console.log('🗣️ Gender-aware speech:', {
      originalMessage: message,
      correctedMessage: correctedMessage,
      voiceId: state.agent.selectedVoice,
      voiceGender: voiceGender,
      grammarChanged: message !== correctedMessage
    });
    
    // Dispatch agent speech preparation with corrected message
    dispatch(agentActions.prepareAgentSpeech(correctedMessage));
    
    try {
      // Call the API route instead of client-side function
      const response = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: correctedMessage,
          voice: state.agent.selectedVoice,
          speed: 0.9
        }),
      });

      if (!response.ok) {
        throw new Error(`TTS API failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Store reference for interruption
      currentAudioRef.current = audio;
      
      // Set state to speaking when audio starts playing
      audio.onloadeddata = () => {
        dispatch(agentActions.startAgentSpeaking());
      };
      
      audio.onended = () => {
        dispatch(agentActions.completeAgentSpeech());
        dispatch(agentActions.awaitUserResponse());
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.onerror = () => {
        dispatch(agentActions.stopAgentSpeaking());
        dispatch(agentActions.awaitUserResponse());
        currentAudioRef.current = null;
        URL.revokeObjectURL(audioUrl);
      };
      
      audio.play();
    } catch (error) {
      console.error('Error generating agent speech:', error);
      dispatch(agentActions.stopAgentSpeaking());
      dispatch(agentActions.awaitUserResponse());
      currentAudioRef.current = null;
    }
  };

  const startInfoGathering = async () => {
    dispatch(agentActions.setConversationPhase('info_gathering'));
    dispatch(agentActions.setInfoGatheringStep('name'));
    
    const welcomeMessage = "¡Hola! Soy tu asistente de Memorias AI. Te voy a ayudar a grabar tu historia. Primero necesito conocerte mejor. ¿Podrías decirme tu nombre?";
    await speakAgentMessage(welcomeMessage);
  };

  // Function to extract age number from Spanish text
  const extractAgeFromText = (text: string): string => {
    const lowerText = text.toLowerCase().trim();
    
    // First try to find actual numbers
    const numberMatch = lowerText.match(/\d+/);
    if (numberMatch) {
      return numberMatch[0];
    }
    
    // Spanish number words to digits mapping
    const spanishNumbers: { [key: string]: string } = {
      'cero': '0', 'uno': '1', 'una': '1', 'dos': '2', 'tres': '3', 'cuatro': '4', 'cinco': '5',
      'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9', 'diez': '10',
      'once': '11', 'doce': '12', 'trece': '13', 'catorce': '14', 'quince': '15',
      'dieciséis': '16', 'diecisiete': '17', 'dieciocho': '18', 'diecinueve': '19', 'veinte': '20',
      'veintiuno': '21', 'veintidós': '22', 'veintitrés': '23', 'veinticuatro': '24', 'veinticinco': '25',
      'veintiséis': '26', 'veintisiete': '27', 'veintiocho': '28', 'veintinueve': '29', 'treinta': '30',
      'treinta y uno': '31', 'treinta y dos': '32', 'treinta y tres': '33', 'treinta y cuatro': '34', 'treinta y cinco': '35',
      'cuarenta': '40', 'cincuenta': '50', 'sesenta': '60', 'setenta': '70', 'ochenta': '80', 'noventa': '90'
    };
    
    // Check for direct matches
    for (const [word, number] of Object.entries(spanishNumbers)) {
      if (lowerText.includes(word)) {
        return number;
      }
    }
    
    // Check for compound numbers like "treinta y cinco"
    const compoundMatch = lowerText.match(/(treinta|cuarenta|cincuenta|sesenta|setenta|ochenta|noventa)\s*y\s*(uno|dos|tres|cuatro|cinco|seis|siete|ocho|nueve)/);
    if (compoundMatch) {
      const tens = spanishNumbers[compoundMatch[1]];
      const units = spanishNumbers[compoundMatch[2]];
      if (tens && units) {
        return (parseInt(tens) + parseInt(units)).toString();
      }
    }
    
    // If no number found, return the original text
    return text.trim();
  };

  const processInfoGatheringResponse = async (transcription: string) => {
    const lowerTranscription = transcription.toLowerCase().trim();
    
    switch (state.agent.infoGatheringStep) {
      case 'returning_user_check':
        // Handle returning user response about what they want to change
        if (lowerTranscription.includes('edad') || lowerTranscription.includes('cambiar edad')) {
          dispatch(agentActions.setInfoGatheringStep('age'));
          const ageMessage = `Perfecto. ¿Qué edad tenías cuando ocurrieron los eventos de esta nueva historia?`;
          await speakAgentMessage(ageMessage);
        } else if (lowerTranscription.includes('lugar') || lowerTranscription.includes('cambiar lugar')) {
          dispatch(agentActions.setInfoGatheringStep('location'));
          const locationMessage = `Perfecto. ¿En qué lugar ocurrieron los eventos de esta nueva historia?`;
          await speakAgentMessage(locationMessage);
        } else if (lowerTranscription.includes('título') || lowerTranscription.includes('cambiar título') || lowerTranscription.includes('titulo')) {
          dispatch(agentActions.setInfoGatheringStep('title'));
          const titleMessage = `Perfecto. ¿Qué título le darías a esta nueva historia?`;
          await speakAgentMessage(titleMessage);
        } else if (lowerTranscription.includes('ambos') || lowerTranscription.includes('los dos') || lowerTranscription.includes('todo')) {
          dispatch(agentActions.setInfoGatheringStep('age'));
          const allMessage = `Perfecto. Vamos a actualizar toda la información. Primero, ¿qué edad tenías cuando ocurrieron los eventos de esta nueva historia?`;
          await speakAgentMessage(allMessage);
        } else {
          // User wants to keep the same data but we need a title for new stories
          if (!state.userProfile.storyTitle) {
            dispatch(agentActions.setInfoGatheringStep('title'));
            const titleMessage = `Perfecto, mantenemos tu información. Solo necesito que me digas el título de esta nueva historia.`;
            await speakAgentMessage(titleMessage);
          } else {
            dispatch(agentActions.setInfoGatheringStep('completed'));
            dispatch(agentActions.setConversationPhase('storytelling'));
            const readyMessage = `Perfecto, ${state.userProfile.storytellerName}. Mantenemos tu edad de ${state.userProfile.ageAtEvents} años y el lugar ${state.userProfile.eventLocation}. Ahora estoy listo para escuchar tu nueva historia. Cuando estés listo, presiona 'Grabar Historia' y comienza a contarme.`;
            await speakAgentMessage(readyMessage);
            dispatch(agentActions.receiveUserResponse());
          }
        }
        break;
        
      case 'name':
        // Extract name from transcription (simple approach)
        dispatch(userProfileActions.setStorytellerName(transcription.trim()));
        dispatch(agentActions.setLastInputMethod('voice'));
        dispatch(agentActions.setInfoGatheringStep('age'));
        
        const ageMessage = `Perfecto, ${transcription.trim()}. Ahora, ¿qué edad tenías cuando ocurrieron los eventos de esta historia que me vas a contar?`;
        await speakAgentMessage(ageMessage);
        break;
        
      case 'age':
        // Extract numeric age from transcription
        const extractedAge = extractAgeFromText(transcription);
        dispatch(userProfileActions.setAgeAtEvents(extractedAge));
        dispatch(agentActions.setLastInputMethod('voice'));
        
        // Always continue to location step regardless of returning user status
        dispatch(agentActions.setInfoGatheringStep('location'));
        const locationMessage = `Muy bien. ¿En qué lugar ocurrieron estos eventos que me vas a narrar?`;
        await speakAgentMessage(locationMessage);
        break;
        
      case 'location':
        dispatch(userProfileActions.setEventLocation(transcription.trim()));
        dispatch(agentActions.setLastInputMethod('voice'));
        dispatch(agentActions.setInfoGatheringStep('title'));
        
        const titleMessage = `Muy bien. Ahora, ¿qué título le darías a esta historia que me vas a contar?`;
        await speakAgentMessage(titleMessage);
        break;
        
      case 'title':
        dispatch(userProfileActions.setStoryTitle(transcription.trim()));
        dispatch(agentActions.setLastInputMethod('voice'));
        dispatch(agentActions.setInfoGatheringStep('completed'));
        dispatch(agentActions.setConversationPhase('storytelling'));
        
        const readyMessage = `Perfecto, ${state.userProfile.storytellerName}. Ya tengo toda la información. Tienes ${state.userProfile.ageAtEvents} años en esta historia "${transcription.trim()}" que ocurrió en ${state.userProfile.eventLocation}. Ahora estoy listo para escuchar tu historia. Cuando estés listo, presiona 'Grabar Historia' y comienza a contarme.`;
        await speakAgentMessage(readyMessage);
        dispatch(agentActions.receiveUserResponse());
        break;
    }
  };

  const analyzeStoryAndRespond = async (storyText: string) => {
    if (state.agent.conversationPhase !== 'storytelling') return;
    
    // Add this segment to story segments
    setStorySegments(prev => [...prev, storyText]);
    
    // 🚫 TEMPORARILY DISABLED: Agent asking questions (not ready yet)
    // Use a simple timer to detect when user has paused
    // if (silenceTimer.current) {
    //   clearTimeout(silenceTimer.current);
    // }
    // 
    // silenceTimer.current = setTimeout(async () => {
    //   await generateContextualQuestion(storyText);
    // }, 3000); // Wait 3 seconds after transcription before asking question
  };

  const generateContextualQuestion = async (currentStory: string) => {
    if (state.agent.agentSpeechState === 'speaking' || state.agent.awaitingUserResponse) return;
    
    try {
      // Get memory context for better questioning
      const memoryContext = MemoryManager.generateContextForAgent('MemoriasAI');
      
      const response = await fetch('/api/agents/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story: currentStory,
          type: 'encouragement',
          questionsAsked: state.agent.questionsAsked,
          memoryContext: memoryContext
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          setQuestionsAsked(prev => [...prev, data.message]);
          await speakAgentMessage(data.message);
        }
      }
    } catch (error) {
      console.error('Error generating contextual question:', error);
    }
  };

  const sendStoryByEmail = async () => {
    // Validate required fields
    if (!fullStoryContent) {
      alert('No hay historia transcrita para enviar.');
      return;
    }
    
    if (!state.userProfile.storytellerName) {
      alert('Falta el nombre del narrador. Por favor complete la información primero.');
      return;
    }
    
    if (!storytellerEmail) {
      alert('Por favor, ingrese su dirección de email.');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(storytellerEmail)) {
      alert('Por favor, ingrese una dirección de email válida.');
      return;
    }
    
    dispatch(uiActions.setIsEmailSending(true));
    
    try {
      // Create HTML email content with proper formatting
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Georgia, serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #8B4513; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { color: #8B4513; font-size: 28px; font-weight: bold; margin-bottom: 10px; }
            .subtitle { color: #666; font-style: italic; }
            .story-title { background: linear-gradient(135deg, #8B4513, #A0522D); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
            .story-content { background: #f9f7f4; padding: 25px; border-left: 4px solid #8B4513; margin: 20px 0; border-radius: 4px; white-space: pre-wrap; }
            .metadata { background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .metadata h3 { color: #8B4513; margin-top: 0; }
            .metadata ul { list-style: none; padding: 0; }
            .metadata li { padding: 5px 0; border-bottom: 1px solid #ddd; }
            .metadata li:last-child { border-bottom: none; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Memorias AI</div>
            <div class="subtitle">Preservando historias, conectando generaciones</div>
          </div>
          
          <p>Hola <strong>${state.userProfile.storytellerName}</strong>,</p>
          
          <p>Aquí está tu historia transcrita, cuidadosamente capturada y preservada:</p>
          
          ${state.userProfile.storyTitle ? `<div class="story-title">${state.userProfile.storyTitle}</div>` : ''}
          
          <div class="story-content">${formatStoryText(fullStoryContent)}</div>
          
          <div class="metadata">
            <h3>Contexto de la Historia</h3>
            <ul>
              <li><strong>Narrador:</strong> ${state.userProfile.storytellerName}</li>
              <li><strong>Email:</strong> ${storytellerEmail}</li>
              ${state.userProfile.storyTitle ? `<li><strong>Título:</strong> ${state.userProfile.storyTitle}</li>` : ''}
              <li><strong>Edad durante los eventos:</strong> ${state.userProfile.ageAtEvents}</li>
              <li><strong>Lugar donde ocurrieron:</strong> ${state.userProfile.eventLocation}</li>
              <li><strong>Fecha de grabación:</strong> ${new Date().toLocaleDateString('es-ES')}</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Esta historia fue capturada y transcrita usando <strong>Memorias AI</strong>.</p>
            <p>Gracias por confiar en nosotros para preservar tus recuerdos.</p>
            <p style="margin-top: 20px;"><em>El equipo de Memorias AI</em></p>
          </div>
        </body>
        </html>
      `;

      // Use our new Resend API endpoint instead of Formspree
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: storytellerEmail,
          subject: 'Tu Historia de Memorias AI',
          html: htmlContent
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Email sent successfully via Resend:', result);
        
        setStoryEmailSent(true);
        setLastSentToEmail(storytellerEmail); // Track which email was sent to
        setShowDownloadOffer(true);
        
        // Don't alert immediately, let the agent speak
        if (storyAudioSegments.length > 0) {
          speakAgentMessage(`Te envié la historia por email a ${storytellerEmail}. ¿Te gustaría descargar tu audio, o puedes hacer clic en 'Nueva Historia' para empezar una nueva?`);
        } else {
          alert(`¡Historia enviada exitosamente a ${storytellerEmail}!`);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Email API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData: errorData,
          email: storytellerEmail
        });
        throw new Error(errorData.error || `Error del servidor: ${response.status}`);
      }
      
    } catch (error) {
      console.error('Error sending email:', error);
      
      // Check if it's the Resend testing restriction error
      if (error instanceof Error && error.message.includes('Email restricted: Can only send to verified')) {
        alert(`No se puede enviar email a ${storytellerEmail}.\n\nLa cuenta de email está en modo de prueba y solo puede enviar a direcciones verificadas.\n\nPor favor use chrismolhome@hotmail.com para pruebas, o contacte al administrador para verificar su dominio.`);
      } else {
        alert('Error al enviar el email. Por favor, intente nuevamente.');
      }
    } finally {
      dispatch(uiActions.setIsEmailSending(false));
    }
  };

  // Function to create a safe filename from story title
  const createSafeFilename = (title, maxLength = 10) => {
    if (!title || title.trim() === '') {
      return 'historia';
    }
    
    return title
      .trim()
      .slice(0, maxLength) // Limit to maxLength characters
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove invalid filename characters
      .replace(/[\s]+/g, '-') // Replace spaces with hyphens
      .replace(/[^\w\-]/g, '') // Remove any remaining non-alphanumeric chars except hyphens
      .toLowerCase()
      || 'historia'; // Fallback if everything gets removed
  };

  const downloadStoryAudio = () => {
    const combinedAudio = createCombinedStoryAudio();
    if (!combinedAudio) {
      alert('No hay audio de historia disponible para descargar.');
      return;
    }
    
    // Create filename: [story-title]-[date].[extension]
    const safeTitle = createSafeFilename(state.userProfile.storyTitle);
    const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const extension = getFileExtension(state.recording.audioMimeType);
    const filename = `${safeTitle}-${dateStr}.${extension}`;
    
    const url = URL.createObjectURL(combinedAudio);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    dispatch(uiActions.setShowDownloadOffer(false));
    alert('¡Audio descargado exitosamente!');
  };

  const generateAgentQuestion = async () => {
    if (!fullStoryContent) return;
    
    dispatch(agentActions.setIsGeneratingQuestion(true));
    
    try {
      // Call the feedback API to get a question
      const response = await fetch('/api/agents/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          story: fullStoryContent,
          type: 'encouragement',
          questionsAsked: state.agent.questionsAsked
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message) {
          dispatch(agentActions.setAgentQuestion(data.message));
          setQuestionsAsked(prev => [...prev, data.message]);
          
          // Generate audio for the question using selected voice
          try {
            // Call the API route instead of client-side function
            const ttsResponse = await fetch('/api/text-to-speech', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                text: data.message,
                voice: state.agent.selectedVoice,
                speed: 0.9
              }),
            });

            if (ttsResponse.ok) {
              const audioBlob = await ttsResponse.blob();
              const audioUrl = URL.createObjectURL(audioBlob);
              dispatch(agentActions.setAgentAudio(audioUrl));
            } else {
              throw new Error(`TTS API failed: ${ttsResponse.status}`);
            }
          } catch (audioError) {
            console.error('Error generating speech:', audioError);
            // Question will still be displayed as text
          }
        }
      }
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      dispatch(agentActions.setIsGeneratingQuestion(false));
    }
  };

  // Function to reset conversation for a new story
  const startNewStory = async () => {
    // Reset conversation states
    dispatch(agentActions.setConversationPhase('info_gathering'));
    dispatch(agentActions.clearAgentMessage());
    dispatch(agentActions.receiveUserResponse());
    dispatch(agentActions.setInfoGatheringStep('returning_user_check'));
    dispatch(userProfileActions.setIsReturningUser(true));
    
    // Reset story data
    setTranscribedText(null);
    setStorySegments([]);
    setStoryAudioSegments([]);
    setQuestionsAsked([]);
    dispatch(agentActions.setAgentQuestion(null));
    
    // Reset recording states
    dispatch(recordingActions.stopRecording());
    dispatch(recordingActions.setAudioURL(null));
    dispatch(recordingActions.clearAudioChunks());
    
    // Reset email states but keep email and user info (we'll ask what to change)
    dispatch(uiActions.setStoryEmailSent(false));
    setStoryEmailSent(false);
    setLastSentToEmail('');
    dispatch(uiActions.setShowDownloadOffer(false));
    dispatch(uiActions.setIsEmailSending(false));
    
    // Clear any existing timers
    if (silenceTimer.current) {
      clearTimeout(silenceTimer.current);
      silenceTimer.current = null;
    }
    
    console.log('Conversation reset for new story');
    
    // Start the returning user flow
    const returningMessage = `Estoy listo para grabar otra historia, así que mantengo tu nombre ${state.userProfile.storytellerName}. En la historia que me vas a contar, ¿quieres cambiar tu edad o el lugar, o mantener los mismos datos?`;
    await speakAgentMessage(returningMessage);
  };

  return (
    <div className={styles.container} style={{
      background: 'rgba(34, 40, 49, 0.98)',
      borderRadius: '15px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      maxWidth: '900px',
      width: '95%',
      margin: '1rem auto',
      padding: '1.5rem',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <header style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
        <h1 style={{ 
          color: '#ffb347', 
          fontSize: 'clamp(1.8rem, 5vw, 2.5rem)',
          marginBottom: '0.5rem',
          lineHeight: '1.2'
        }}>Memorias-AI</h1>
        <p style={{ 
          color: '#ccc', 
          marginBottom: '1rem',
          fontSize: 'clamp(0.9rem, 3vw, 1rem)',
          padding: '0 1rem'
        }}>
          Capturando historias en el acento español argentino
        </p>
      </header>

      {/* Voice Selection - Core Entry Point */}
      <section className={styles.section} style={{ marginBottom: '1.5rem' }}>
        <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)' }}>
          {getLocalizedText('VOICE_SELECTION_TITLE', state.ui.currentLanguage)}
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem', 
          marginBottom: '1rem',
          padding: '0 0.5rem'
        }}>
          {getArgentineVoices().map((voice) => (
            <button
              key={voice.id}
              onClick={() => previewVoice(voice)}
              className={`${styles.voiceButtonSmall} ${state.agent.selectedVoice === voice.id ? styles.voiceSelected : ''}`}
              disabled={state.agent.voicePreviewInProgress && state.agent.selectedVoice !== voice.id}
              style={{
                backgroundColor: state.agent.selectedVoice === voice.id ? '#ffb347' : 'rgba(255, 255, 255, 0.1)',
                color: state.agent.selectedVoice === voice.id ? '#000' : '#fff',
                border: `2px solid ${state.agent.selectedVoice === voice.id ? '#ffb347' : 'rgba(255, 255, 255, 0.2)'}`,
                borderRadius: '15px',
                padding: '0.75rem 0.5rem',
                cursor: state.agent.voicePreviewInProgress && state.agent.selectedVoice !== voice.id ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                fontSize: 'clamp(0.8rem, 3vw, 0.9rem)',
                minHeight: '60px',
                display: 'flex',
                opacity: state.agent.voicePreviewInProgress && state.agent.selectedVoice !== voice.id ? 0.5 : 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}
            >
              <span style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>
                {voice.gender === 'male' ? '♂️' : '♀️'}
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {state.agent.voicePreviewInProgress && state.agent.selectedVoice === voice.id 
                  ? getLocalizedText('VOICE_PLAYING', state.ui.currentLanguage)
                  : voice.name
                }
              </span>
            </button>
          ))}
        </div>
        <p style={{ 
          textAlign: 'center', 
          fontSize: 'clamp(0.7rem, 2.5vw, 0.8rem)', 
          color: '#ccc',
          padding: '0 1rem'
        }}>
          {getLocalizedText('VOICE_SELECTION_INSTRUCTION', state.ui.currentLanguage)}
        </p>
      </section>

      {/* Show full interface only after voice selection */}
      {state.agent.selectedVoice && (
        <>
          {/* Conversation Module */}
      {(state.agent.conversationPhase !== 'setup' || state.agent.currentAgentMessage) && (
        <section className={styles.section} style={{ marginBottom: '2rem' }}>
          <h2 className={styles.sectionTitle}>Conversación con tu Asistente</h2>
          
          {/* Current Agent Message */}
          {state.agent.currentAgentMessage && (
            <div style={{ 
              backgroundColor: 'rgba(255, 179, 71, 0.1)', 
              border: '1px solid #ffb347',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                <strong style={{ color: '#ffb347' }}>
                  {getArgentineVoices().find(v => v.id === state.agent.selectedVoice)?.name}:
                </strong>{' '}
                <span style={{ color: '#fff' }}>{state.agent.currentAgentMessage}</span>
              </div>
              
              {state.agent.agentSpeechState === 'speaking' && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  fontSize: '0.9rem',
                  color: '#ffb347'
                }}>
                  <div className={styles.speakingIndicator}>🎵</div>
                  <span>Hablando...</span>
                </div>
              )}
              
              {state.agent.awaitingUserResponse && state.agent.agentSpeechState !== 'speaking' && (
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#ccc',
                  fontStyle: 'italic'
                }}>
                  Esperando tu respuesta...
                </div>
              )}
            </div>
          )}
          
          {/* Dynamic Button Layout Based on Conversation Phase */}
          
          {/* Single Recording Button - Show during info gathering */}
          {state.agent.conversationPhase === 'info_gathering' && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '1rem'
            }}>
              <button 
                onClick={() => {
                  // Handle agent speech interruption
                  if (state.agent.agentSpeechState === 'speaking' || state.agent.agentSpeechState === 'preparing') {
                    console.log('🛑 Interrupting agent speech...');
                    dispatch(agentActions.interruptAgentSpeech());
                    
                    if (currentAudioRef.current) {
                      currentAudioRef.current.pause();
                      currentAudioRef.current = null;
                    }
                    return;
                  }
                  
                  // Recording logic
                  if (state.recording.recording) {
                    console.log('🛑 Stopping recording...');
                    stopRecording();
                  } else {
                    console.log('🎤 Starting recording...');
                    startRecording();
                  }
                }}
                className={`${styles.button} ${state.recording.recording ? styles.recording : ''}`}
                disabled={getRecordingButtonState().disabled}
                style={{
                  backgroundColor: getRecordingButtonState().highlight ? '#e74c3c' : '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                  padding: '0.75rem 1.5rem',
                  fontWeight: 'bold',
                  cursor: getRecordingButtonState().disabled ? 'not-allowed' : 'pointer',
                  animation: getRecordingButtonState().highlight ? 'pulse 1.5s infinite' : undefined,
                  opacity: getRecordingButtonState().disabled ? 0.6 : 1,
                  transition: 'all 0.3s ease'
                }}
              >
                {getRecordingButtonState().text}
              </button>
            </div>
          )}
          
          {/* Three-Button Layout - Only show during storytelling */}
          {state.agent.conversationPhase === 'storytelling' && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '1rem', 
              marginBottom: '1rem',
              flexWrap: 'wrap' 
            }}>
            {/* Left: Grabar Historia (Green - Primary Action) */}
            <button 
              onClick={() => {
                // 🎯 ENHANCED INTERRUPTION LOGIC: Handle agent speech interruption during transition
                if (state.agent.agentSpeechState === 'speaking' || state.agent.agentSpeechState === 'preparing') {
                  console.log('🛑 Interrupting agent speech during storytelling transition...');
                  dispatch(agentActions.interruptAgentSpeech());
                  
                  // Stop the actual audio playback
                  if (currentAudioRef.current) {
                    currentAudioRef.current.pause();
                    currentAudioRef.current = null;
                  }
                  
                  // If we're in storytelling phase and interrupting the transition message,
                  // automatically start recording since user wants to skip to recording
                  if (state.agent.conversationPhase === 'storytelling') {
                    console.log('🎤 Auto-starting recording after transition interruption...');
                    setTimeout(() => {
                      startRecording();
                    }, 100); // Small delay to ensure state updates complete
                  }
                  return; // Exit early
                }
                
                // Recording logic - call the actual functions
                if (state.recording.recording) {
                  console.log('🛑 Stopping recording...');
                  stopRecording();
                } else {
                  console.log('🎤 Starting recording...');
                  startRecording();
                }
              }}
              className={`${styles.button} ${state.recording.recording ? styles.recording : ''}`}
              disabled={getRecordingButtonState().disabled}
              style={{
                backgroundColor: getRecordingButtonState().highlight ? '#e74c3c' : '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                padding: '0.75rem 1.25rem',
                fontWeight: 'bold',
                cursor: getRecordingButtonState().disabled ? 'not-allowed' : 'pointer',
                animation: getRecordingButtonState().highlight ? 'pulse 1.5s infinite' : undefined,
                opacity: getRecordingButtonState().disabled ? 0.6 : 1,
                transition: 'all 0.3s ease'
              }}
            >
              {getRecordingButtonState().text}
            </button>

            {/* Descartar Última Button - Only show if there's a last recording */}
            {(() => {
              const shouldShowButton = !!state.recording.lastRecordingText;
              console.log('🔍 DISCARD BUTTON VISIBILITY CHECK:');
              console.log('  - state.recording.lastRecordingText:', JSON.stringify(state.recording.lastRecordingText));
              console.log('  - shouldShowButton:', shouldShowButton);
              console.log('  - storySegments:', JSON.stringify(storySegments));
              console.log('  - storySegments.length:', storySegments.length);
              
              return shouldShowButton;
            })() && (
              <button 
                onClick={() => {
                  console.log('🗑️ DISCARD LAST - Starting debug analysis...');
                  
                  // Find and remove the last recording from story segments
                  const lastRecordingText = state.recording.lastRecordingText;
                  
                  console.log('🔍 Current state analysis:');
                  console.log('  - lastRecordingText:', JSON.stringify(lastRecordingText));
                  console.log('  - storySegments:', JSON.stringify(storySegments));
                  console.log('  - storySegments.length:', storySegments.length);
                  console.log('  - transcribedText:', JSON.stringify(transcribedText));
                  console.log('  - editableStoryContent:', JSON.stringify(editableStoryContent));
                  console.log('  - fullStoryContent:', JSON.stringify(fullStoryContent));
                  
                  if (lastRecordingText && storySegments.length > 0) {
                    // Find the last occurrence of the lastRecordingText in storySegments
                    const lastIndex = storySegments.lastIndexOf(lastRecordingText);
                    console.log('  - lastIndex found:', lastIndex);
                    console.log('  - Looking for text:', JSON.stringify(lastRecordingText));
                    console.log('  - In array:', JSON.stringify(storySegments));
                    
                    if (lastIndex !== -1) {
                      console.log('✅ Found segment to remove at index:', lastIndex);
                      console.log('  - Segment to remove:', JSON.stringify(storySegments[lastIndex]));
                      
                      // Remove only that specific segment
                      setStorySegments(prev => {
                        const newSegments = [...prev];
                        console.log('  - Before removal:', JSON.stringify(prev));
                        newSegments.splice(lastIndex, 1);
                        console.log('  - After removal:', JSON.stringify(newSegments));
                        return newSegments;
                      });
                      
                      // Remove the corresponding audio segment
                      if (storyAudioSegments.length > lastIndex) {
                        console.log('  - Removing corresponding audio segment at index:', lastIndex);
                        setStoryAudioSegments(prev => {
                          const newAudioSegments = [...prev];
                          newAudioSegments.splice(lastIndex, 1);
                          return newAudioSegments;
                        });
                      } else {
                        console.log('  - No audio segment to remove (index out of bounds)');
                      }
                    } else {
                      console.log('❌ Could not find lastRecordingText in storySegments');
                      console.log('  - Exact match search failed for:', JSON.stringify(lastRecordingText));
                      console.log('  - Available segments:');
                      storySegments.forEach((segment, index) => {
                        console.log(`    [${index}]: ${JSON.stringify(segment)}`);
                        console.log(`    Match check: ${segment === lastRecordingText ? 'YES' : 'NO'}`);
                      });
                    }
                  } else {
                    console.log('❌ Conditions not met for removal:');
                    console.log('  - lastRecordingText exists:', !!lastRecordingText);
                    console.log('  - storySegments.length > 0:', storySegments.length > 0);
                  }
                  
                  // Clear the last recording tracking
                  console.log('🧹 Clearing lastRecordingText and audioURL');
                  dispatch(recordingActions.setLastRecordingText(null));
                  dispatch(recordingActions.setAudioURL(null));
                  
                  // Clear transcribed text if it matches the last recording
                  if (transcribedText === lastRecordingText) {
                    console.log('🧹 Clearing transcribedText (matched lastRecordingText)');
                    setTranscribedText(null);
                  } else {
                    console.log('ℹ️ Not clearing transcribedText (different from lastRecordingText)');
                    console.log('  - transcribedText:', JSON.stringify(transcribedText));
                    console.log('  - lastRecordingText:', JSON.stringify(lastRecordingText));
                  }
                  
                  console.log('🗑️ Last recording discard attempt completed');
                }}
                style={{
                  backgroundColor: '#f39c12',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                  padding: '0.75rem 1.25rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#e67e22'}
                onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#f39c12'}
              >
                {getLocalizedText('DISCARD_LAST_BUTTON', state.ui.currentLanguage) || '🗑️ Descartar Última'}
              </button>
            )}

            {/* Center: Nueva Historia (Red - Reset Action) */}
            <button 
              onClick={() => {
                // Reset to setup phase
                dispatch(agentActions.setConversationPhase('setup'));
                
                // Reset user profile data
                dispatch(userProfileActions.setStorytellerName(''));
                dispatch(userProfileActions.setStorytellerEmail(''));
                dispatch(userProfileActions.setAgeAtEvents(''));
                dispatch(userProfileActions.setEventLocation(''));
                dispatch(userProfileActions.setIsReturningUser(false));
                
                dispatch(agentActions.clearAgentMessage());
                
                // Clear story data
                if (state.story.currentStoryText) {
                  // Confirm before clearing
                  if (window.confirm('¿Estás seguro de que quieres empezar una nueva historia? Se perderá la historia actual.')) {
                    // Reset story state - you'll need to implement this action
                    window.location.reload(); // Simple reset for now
                  }
                } else {
                  window.location.reload(); // Simple reset for now
                }
              }}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                padding: '0.75rem 1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c82333'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc3545'}
            >
              🔄 Nueva Historia
            </button>

            {/* Right: Historia Completa (Red - View Action) */}
            <button 
              onClick={() => {
                if (state.story.currentStoryText) {
                  alert(`Historia Completa:\n\n${state.story.currentStoryText}`);
                } else {
                  alert('Aún no hay una historia completa. Graba tu historia primero.');
                }
              }}
              style={{
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
                padding: '0.75rem 1.25rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#c82333'}
              onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#dc3545'}
            >
              📖 Historia Completa
            </button>
            </div>
          )}
        </section>
      )}

      {/* User Information Form - Clean 3-line design */}
      {state.agent.selectedVoice && (
        <section style={{ 
          marginBottom: '2rem',
          maxWidth: '600px', 
          margin: '0 auto'
        }}>
          <div style={{ 
            padding: '1.5rem',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            
            {/* Clean 3-line format - editable during info gathering, display during storytelling */}
            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              
              {/* Name Line */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ 
                  color: '#ffb347', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  minWidth: '80px'
                }}>
                  {getLocalizedText('NAME_LABEL', state.ui.currentLanguage)}:
                </span>
                {state.agent.conversationPhase === 'info_gathering' ? (
                  <input
                    type="text"
                    value={state.userProfile.storytellerName}
                    onChange={(e) => {
                      dispatch(userProfileActions.setStorytellerName(e.target.value));
                      dispatch(agentActions.setLastInputMethod('manual'));
                    }}
                    placeholder={getLocalizedText('NAME_PLACEHOLDER', state.ui.currentLanguage)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#ffb347'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                ) : (
                  <div style={{ 
                    flex: 1,
                    borderBottom: state.userProfile.storytellerName ? '1px solid #ffb347' : '1px dotted rgba(255, 255, 255, 0.3)',
                    paddingBottom: '4px',
                    color: state.userProfile.storytellerName ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    minHeight: '20px',
                    fontStyle: state.userProfile.storytellerName ? 'normal' : 'italic'
                  }}>
                    {state.userProfile.storytellerName || getLocalizedText('NAME_PLACEHOLDER', state.ui.currentLanguage)}
                  </div>
                )}
              </div>

              {/* Age Line */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ 
                  color: '#ffb347', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  minWidth: '80px'
                }}>
                  {getLocalizedText('AGE_LABEL', state.ui.currentLanguage)}:
                </span>
                {state.agent.conversationPhase === 'info_gathering' ? (
                  <input
                    type="text"
                    value={state.userProfile.ageAtEvents}
                    onChange={(e) => {
                      dispatch(userProfileActions.setAgeAtEvents(e.target.value));
                      dispatch(agentActions.setLastInputMethod('manual'));
                    }}
                    placeholder={getLocalizedText('AGE_PLACEHOLDER', state.ui.currentLanguage)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#ffb347'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                ) : (
                  <div style={{ 
                    flex: 1,
                    borderBottom: state.userProfile.ageAtEvents ? '1px solid #ffb347' : '1px dotted rgba(255, 255, 255, 0.3)',
                    paddingBottom: '4px',
                    color: state.userProfile.ageAtEvents ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    minHeight: '20px',
                    fontStyle: state.userProfile.ageAtEvents ? 'normal' : 'italic'
                  }}>
                    {state.userProfile.ageAtEvents || getLocalizedText('AGE_PLACEHOLDER', state.ui.currentLanguage)}
                  </div>
                )}
              </div>

              {/* Location Line */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ 
                  color: '#ffb347', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  minWidth: '80px'
                }}>
                  {getLocalizedText('LOCATION_LABEL', state.ui.currentLanguage)}:
                </span>
                {state.agent.conversationPhase === 'info_gathering' ? (
                  <input
                    type="text"
                    value={state.userProfile.eventLocation}
                    onChange={(e) => {
                      dispatch(userProfileActions.setEventLocation(e.target.value));
                      dispatch(agentActions.setLastInputMethod('manual'));
                    }}
                    placeholder={getLocalizedText('LOCATION_PLACEHOLDER', state.ui.currentLanguage)}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#ffb347'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                ) : (
                  <div style={{ 
                    flex: 1,
                    borderBottom: state.userProfile.eventLocation ? '1px solid #ffb347' : '1px dotted rgba(255, 255, 255, 0.3)',
                    paddingBottom: '4px',
                    color: state.userProfile.eventLocation ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    minHeight: '20px',
                    fontStyle: state.userProfile.eventLocation ? 'normal' : 'italic'
                  }}>
                    {state.userProfile.eventLocation || getLocalizedText('LOCATION_PLACEHOLDER', state.ui.currentLanguage)}
                  </div>
                )}
              </div>

              {/* Story Title Line */}
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ 
                  color: '#ffb347', 
                  fontSize: '0.9rem', 
                  fontWeight: '500',
                  minWidth: '80px'
                }}>
                  {getLocalizedText('STORY_TITLE_LABEL', state.ui.currentLanguage) || 'Título'}:
                </span>
                {state.agent.conversationPhase === 'info_gathering' ? (
                  <input
                    type="text"
                    value={state.userProfile.storyTitle || ''}
                    onChange={(e) => {
                      dispatch(userProfileActions.setStoryTitle(e.target.value));
                      dispatch(agentActions.setLastInputMethod('manual'));
                    }}
                    placeholder={getLocalizedText('STORY_TITLE_PLACEHOLDER', state.ui.currentLanguage) || 'Dale un título a tu historia...'}
                    style={{
                      flex: 1,
                      padding: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '4px',
                      color: '#fff',
                      fontSize: '0.9rem',
                      outline: 'none',
                      transition: 'border-color 0.3s ease'
                    }}
                    onFocus={(e) => (e.target as HTMLInputElement).style.borderColor = '#ffb347'}
                    onBlur={(e) => (e.target as HTMLInputElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                  />
                ) : (
                  <div style={{ 
                    flex: 1,
                    borderBottom: state.userProfile.storyTitle ? '1px solid #ffb347' : '1px dotted rgba(255, 255, 255, 0.3)',
                    paddingBottom: '4px',
                    color: state.userProfile.storyTitle ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                    fontSize: '0.9rem',
                    minHeight: '20px',
                    fontStyle: state.userProfile.storyTitle ? 'normal' : 'italic'
                  }}>
                    {state.userProfile.storyTitle || getLocalizedText('STORY_TITLE_PLACEHOLDER', state.ui.currentLanguage) || 'Dale un título a tu historia...'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tell my Story button - appears when all fields are valid during info gathering */}
      {state.agent.conversationPhase === 'info_gathering' && (() => {
        const nameValid = state.userProfile.storytellerName.trim().length >= 3;
        const ageValid = state.userProfile.ageAtEvents.trim().length >= 1;
        const locationValid = state.userProfile.eventLocation.trim().length >= 3; // Reduced from 6 to 3
        const titleValid = (state.userProfile.storyTitle?.trim().length || 0) >= 3; // Reduced from 6 to 3
        const allFieldsValid = nameValid && ageValid && locationValid && titleValid;
        
        // Debug logging for button visibility
        console.log('🔍 Button validation check:', {
          name: `"${state.userProfile.storytellerName.trim()}" (${state.userProfile.storytellerName.trim().length}) - Valid: ${nameValid}`,
          age: `"${state.userProfile.ageAtEvents.trim()}" (${state.userProfile.ageAtEvents.trim().length}) - Valid: ${ageValid}`,
          location: `"${state.userProfile.eventLocation.trim()}" (${state.userProfile.eventLocation.trim().length}) - Valid: ${locationValid}`,
          title: `"${state.userProfile.storyTitle?.trim() || ''}" (${(state.userProfile.storyTitle?.trim().length || 0)}) - Valid: ${titleValid}`,
          allFieldsValid,
          conversationPhase: state.agent.conversationPhase
        });
        
        // Show button debug info always during info_gathering phase
        return (
          <section style={{
            padding: '1rem',
            margin: '1rem 0',
            textAlign: 'center'
          }}>
            {allFieldsValid ? (
              <button
                onClick={async () => {
                  console.log('🎯 Tell my Story button clicked - transitioning to storytelling');
                  dispatch(agentActions.setInfoGatheringStep('completed'));
                  dispatch(agentActions.setConversationPhase('storytelling'));
                  
                  const confirmationMessage = `Perfecto, ${state.userProfile.storytellerName}. Ya tengo toda la información. Tienes ${state.userProfile.ageAtEvents} años en esta historia "${state.userProfile.storyTitle}" que ocurrió en ${state.userProfile.eventLocation}. Ahora puedes grabar tu historia usando los botones de abajo.`;
                  await speakAgentMessage(confirmationMessage);
                }}
                style={{
                  background: 'linear-gradient(135deg, #ff6b6b, #ff8e53)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 107, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 107, 107, 0.3)';
                }}
              >
                {getLocalizedText('TELL_STORY_BUTTON', state.ui.currentLanguage) || '🎙️ Contar mi Historia'}
              </button>
            ) : (
              <div style={{ 
                color: 'rgba(255, 255, 255, 0.6)', 
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                📝 Complete todos los campos para continuar
              </div>
            )}
          </section>
        );
      })()}

      <main style={{ width: '100%' }}>
        {/* Story content section - only show after we have story content */}
        {fullStoryContent && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              {state.userProfile.storyTitle || 'Tu Historia'}
            </h2>
            
            {/* Editable story content area */}
            <div style={{ 
              position: 'relative',
              marginBottom: '1rem'
            }}>
              <textarea
                value={fullStoryContent}
                onChange={(e) => setEditableStoryContent(e.target.value)}
                placeholder="Aquí aparecerá tu historia conforme la vayas narrando..."
                style={{
                  width: '100%',
                  minHeight: '300px',
                  padding: '1rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '1rem',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none',
                  whiteSpace: 'pre-line',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => (e.target as HTMLTextAreaElement).style.borderColor = '#ffb347'}
                onBlur={(e) => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255, 255, 255, 0.2)'}
              />
            </div>
            
            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              {/* Email input field moved here, compact design */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '1rem', 
                marginBottom: '1rem',
                flexWrap: 'wrap'
              }}>
                <label style={{ 
                  fontSize: '0.9rem', 
                  color: '#ccc',
                  minWidth: 'fit-content'
                }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={storytellerEmail}
                  onChange={(e) => {
                    const newEmail = e.target.value;
                    setStorytellerEmail(newEmail);
                    
                    // Reset "sent" status if user changes the email address
                    if (storyEmailSent && newEmail !== lastSentToEmail) {
                      setStoryEmailSent(false);
                    }
                  }}
                  placeholder="tu@email.com"
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    backgroundColor: '#2a2a2a',
                    color: '#fff',
                    fontSize: '0.9rem',
                    maxWidth: '200px'
                  }}
                  required
                />
              </div>

              {!storyEmailSent ? (
                <button 
                  onClick={sendStoryByEmail}
                  disabled={state.ui.isEmailSending || !fullStoryContent}
                  className={styles.button}
                  style={{ 
                    backgroundColor: (state.ui.isEmailSending || !fullStoryContent) ? '#95a5a6' : '#27ae60',
                    cursor: (state.ui.isEmailSending || !fullStoryContent) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {state.ui.isEmailSending ? '📧 Enviando...' : '📧 Enviame Mi Historia'}
                </button>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  gap: '1rem', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  flexWrap: 'wrap' 
                }}>
                  <div style={{ color: '#27ae60', fontWeight: 'bold' }}>
                    ✅ Historia enviada exitosamente a {lastSentToEmail}
                  </div>
                  <button 
                    onClick={sendStoryByEmail}
                    className={styles.button}
                    style={{ 
                      backgroundColor: '#27ae60',
                      fontSize: '0.8rem'
                    }}
                  >
                    📧 Enviar vía Email
                  </button>
                </div>
              )}
              
              {showDownloadOffer && (
                <div style={{ marginTop: '1rem' }}>
                  <button 
                    onClick={downloadStoryAudio}
                    className={styles.button}
                    style={{ 
                      backgroundColor: '#e67e22',
                      marginRight: '0.5rem'
                    }}
                  >
                    🎵 Descargar Audio
                  </button>
                  <button 
                    onClick={() => setShowDownloadOffer(false)}
                    className={styles.button}
                    style={{ 
                      backgroundColor: '#95a5a6',
                      fontSize: '0.8rem'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
      
      <footer style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link 
          href="/"
          className={styles.backButton}
        >
          ← Regresar a Mission Control
        </Link>
      </footer>
      </>
      )}
    </div>
  );
}
