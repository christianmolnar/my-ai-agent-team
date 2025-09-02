/**
 * Agent Memory System
 * 
 * Provides persistent memory for AI agents to learn and improve their interactions
 */

export interface MemoryEntry {
  id: string;
  agentId: string;
  type: 'interaction' | 'preference' | 'success' | 'failure' | 'feedback' | 'best_practice';
  content: string;
  metadata: Record<string, any>;
  timestamp: Date;
  importance: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface AgentMemory {
  agentId: string;
  memories: MemoryEntry[];
  patterns: Record<string, any>;
  preferences: Record<string, any>;
  successes: MemoryEntry[];
  failures: MemoryEntry[];
}

export class MemoryManager {
  private static memories: Map<string, AgentMemory> = new Map();

  /**
   * Initialize agent with best practices for questioning
   */
  static async initializeAgentBestPractices(agentId: string): Promise<void> {
    const bestPractices = [
      {
        content: "Once you transcribe a portion of the story, analyze it and come up with the best question you can think of that could be answered about it.",
        importance: 'high' as const,
        tags: ['questioning', 'analysis', 'story_improvement']
      },
      {
        content: "If you feel there are no questions to ask, tell the user something encouraging about how great it is to have this story told.",
        importance: 'high' as const,
        tags: ['encouragement', 'positive_feedback']
      },
      {
        content: "If the story has been compiled and seems complete, acknowledge it and ask the user if they are ready to send it to themselves and download the audio.",
        importance: 'high' as const,
        tags: ['completion', 'finalization']
      },
      {
        content: "Analyze the segments users record based on your questions and add to your memory any good best practices about how to ask better questions, what questions not to ask, etc.",
        importance: 'high' as const,
        tags: ['learning', 'self_improvement', 'pattern_recognition']
      },
      {
        content: "Ask for specific details like names of people, exact locations, approximate dates or ages, and emotional context to make stories more vivid.",
        importance: 'medium' as const,
        tags: ['detail_gathering', 'story_enhancement']
      },
      {
        content: "Don't repeat similar questions that have already been asked. Keep track of what information has been gathered.",
        importance: 'high' as const,
        tags: ['conversation_flow', 'efficiency']
      },
      {
        content: "When asking for personal information (name, age, location), be conversational and natural rather than formal.",
        importance: 'medium' as const,
        tags: ['information_gathering', 'conversational_style']
      },
      {
        content: "If the transcription returns 'Gracias por ver el video' or similar phrases, ignore this text as it's likely background noise or interference, and do not respond to it or include it in the story.",
        importance: 'high' as const,
        tags: ['noise_filtering', 'transcription_cleanup', 'interference_handling']
      },
      {
        content: "Before finalizing a story, apply proper punctuation best practices: add periods at the end of sentences, commas for natural pauses, and ensure proper capitalization. Split long continuous text into paragraphs at natural break points for better readability.",
        importance: 'high' as const,
        tags: ['story_formatting', 'punctuation', 'readability', 'text_processing']
      },
      {
        content: "When formatting stories, look for natural paragraph breaks like topic changes, time shifts, or new events. Each paragraph should focus on a single idea or moment in the story.",
        importance: 'medium' as const,
        tags: ['paragraph_structure', 'story_organization', 'text_formatting']
      }
    ];

    for (const practice of bestPractices) {
      await this.storeMemory({
        agentId,
        type: 'best_practice',
        content: practice.content,
        metadata: { category: 'questioning_guidelines' },
        importance: practice.importance,
        tags: practice.tags
      });
    }

    console.log(`Initialized ${bestPractices.length} best practices for agent ${agentId}`);
  }

  /**
   * Store a memory entry for an agent
   */
  static async storeMemory(memory: Omit<MemoryEntry, 'id' | 'timestamp'>): Promise<string> {
    const memoryId = `${memory.agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullMemory: MemoryEntry = {
      ...memory,
      id: memoryId,
      timestamp: new Date()
    };

    // Get or create agent memory
    let agentMemory = this.memories.get(memory.agentId);
    if (!agentMemory) {
      agentMemory = {
        agentId: memory.agentId,
        memories: [],
        patterns: {},
        preferences: {},
        successes: [],
        failures: []
      };
      this.memories.set(memory.agentId, agentMemory);
    }

    // Add memory to agent
    agentMemory.memories.push(fullMemory);

    // Categorize by type for quick access
    if (memory.type === 'success') {
      agentMemory.successes.push(fullMemory);
    } else if (memory.type === 'failure') {
      agentMemory.failures.push(fullMemory);
    }

    // Update patterns and preferences
    this.updatePatterns(agentMemory, fullMemory);

    // Keep only last 100 memories per agent to prevent memory bloat
    if (agentMemory.memories.length > 100) {
      agentMemory.memories = agentMemory.memories
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 100);
    }

    console.log(`Memory stored for agent ${memory.agentId}:`, memoryId);
    return memoryId;
  }

  /**
   * Retrieve memories for an agent
   */
  static getMemories(agentId: string, filters?: {
    type?: string;
    tags?: string[];
    importance?: 'low' | 'medium' | 'high';
    limit?: number;
  }): MemoryEntry[] {
    const agentMemory = this.memories.get(agentId);
    if (!agentMemory) return [];

    let memories = [...agentMemory.memories];

    // Apply filters
    if (filters?.type) {
      memories = memories.filter(m => m.type === filters.type);
    }
    if (filters?.tags) {
      memories = memories.filter(m => 
        filters.tags!.some(tag => m.tags.includes(tag))
      );
    }
    if (filters?.importance) {
      memories = memories.filter(m => m.importance === filters.importance);
    }

    // Sort by timestamp (most recent first)
    memories.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (filters?.limit) {
      memories = memories.slice(0, filters.limit);
    }

    return memories;
  }

  /**
   * Learn from interaction patterns and update best practices
   */
  static async learnFromInteraction(
    agentId: string,
    interaction: {
      question: string;
      userResponse: string;
      effectiveness: 'high' | 'medium' | 'low';
      context: Record<string, any>;
    }
  ): Promise<void> {
    // Store the interaction
    await this.storeMemory({
      agentId,
      type: interaction.effectiveness === 'high' ? 'success' : 'failure',
      content: `Question: "${interaction.question}" | Response: "${interaction.userResponse}"`,
      metadata: {
        effectiveness: interaction.effectiveness,
        questionType: interaction.context.questionType || 'unknown',
        storyLength: interaction.context.storyLength || 0,
        responseLength: interaction.userResponse.length
      },
      importance: interaction.effectiveness === 'high' ? 'high' : 'medium',
      tags: ['learning', 'interaction_pattern', interaction.effectiveness]
    });

    // If it was a highly effective interaction, extract lessons
    if (interaction.effectiveness === 'high') {
      const lesson = this.extractLessonFromSuccessfulInteraction(interaction);
      if (lesson) {
        await this.storeMemory({
          agentId,
          type: 'best_practice',
          content: lesson,
          metadata: { 
            category: 'learned_practice',
            derivedFrom: 'successful_interaction'
          },
          importance: 'medium',
          tags: ['learned_practice', 'pattern_derived']
        });
      }
    }
  }

  /**
   * Extract lessons from successful interactions
   */
  private static extractLessonFromSuccessfulInteraction(interaction: {
    question: string;
    userResponse: string;
    context: Record<string, any>;
  }): string | null {
    const { question, userResponse, context } = interaction;
    
    // Simple pattern recognition - in a real implementation this could be more sophisticated
    if (userResponse.length > 100 && question.includes('¿')) {
      return `Questions that ask about specific details (like "${question}") tend to generate rich, detailed responses.`;
    }
    
    if (question.toLowerCase().includes('sentías') || question.toLowerCase().includes('emoción')) {
      return `Asking about emotions and feelings helps users connect more deeply with their memories.`;
    }
    
    if (question.toLowerCase().includes('exactamente') || question.toLowerCase().includes('específicamente')) {
      return `Asking for specific details helps users provide more concrete information.`;
    }
    
    return null;
  }

  /**
   * Update agent patterns based on new memory
   */
  private static updatePatterns(agentMemory: AgentMemory, memory: MemoryEntry): void {
    // Update patterns based on memory type and tags
    for (const tag of memory.tags) {
      if (!agentMemory.patterns[tag]) {
        agentMemory.patterns[tag] = { count: 0, lastSeen: memory.timestamp };
      }
      agentMemory.patterns[tag].count++;
      agentMemory.patterns[tag].lastSeen = memory.timestamp;
    }

    // Update preferences based on successful interactions
    if (memory.type === 'success' && memory.metadata) {
      for (const [key, value] of Object.entries(memory.metadata)) {
        if (!agentMemory.preferences[key]) {
          agentMemory.preferences[key] = {};
        }
        if (!agentMemory.preferences[key][value]) {
          agentMemory.preferences[key][value] = 0;
        }
        agentMemory.preferences[key][value]++;
      }
    }
  }

  /**
   * Generate context from memories for better decision making
   */
  static generateContextForAgent(agentId: string): string {
    const agentMemory = this.memories.get(agentId);
    if (!agentMemory) return '';

    const recentSuccesses = agentMemory.successes.slice(-3);
    const recentFailures = agentMemory.failures.slice(-2);
    const bestPractices = agentMemory.memories
      .filter(m => m.type === 'best_practice')
      .slice(-5);

    let context = '';

    if (bestPractices.length > 0) {
      context += 'Best Practices:\n';
      bestPractices.forEach(bp => {
        context += `- ${bp.content}\n`;
      });
    }

    if (recentSuccesses.length > 0) {
      context += '\nRecent Successful Interactions:\n';
      recentSuccesses.forEach(success => {
        context += `- ${success.content}\n`;
      });
    }

    if (recentFailures.length > 0) {
      context += '\nWhat to Avoid (Recent Failures):\n';
      recentFailures.forEach(failure => {
        context += `- ${failure.content}\n`;
      });
    }

    return context;
  }
}
