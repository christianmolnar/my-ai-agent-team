import { Agent, AgentTask, AgentTaskResult } from './agent';

/**
 * Music Coach Agent - Specialized Music Education Agent
 * 
 * Provides personalized music education, theory instruction, and practice guidance
 * across multiple instruments with emphasis on piano and guitar instruction.
 * Uses Claude Sonnet 4 for specialized educational content generation.
 */
export class MusicCoachAgent implements Agent {
  id = 'music-coach';
  name = 'Music Coach Agent';
  description = 'Music theory education and instruction specialist';
  abilities = [
    'Music theory instruction',
    'Chord progression analysis',
    'Piano and guitar instruction',
    'Personalized practice session creation',
    'Song composition guidance',
    'Music notation and reading',
    'Skill level assessment',
    'Progress tracking'
  ];

  // Configuration
  private readonly claudeModel = 'claude-3-sonnet-20240229';
  private claudeSonnetClient: any;

  constructor() {
    this.initializeMusicCoach();
  }

  private async initializeMusicCoach(): Promise<void> {
    // Initialize Claude Sonnet client for music education
    this.claudeSonnetClient = await this.createClaudeClient();
    console.log('🎵 Music Coach Agent initialized');
  }

  /**
   * Agent interface implementation
   */
  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    try {
      switch (task.type) {
        case 'execute-task':
          const executionResult = await this.executeMusicCoachingTask(task.payload);
          return { success: true, result: executionResult };

        case 'teach-chords':
          const chordLesson = await this.teachChords(task.payload);
          return { success: true, result: chordLesson };

        case 'analyze-progression':
          const analysis = await this.analyzeChordProgression(task.payload);
          return { success: true, result: analysis };

        case 'create-practice-session':
          const session = await this.createPracticeSession(task.payload);
          return { success: true, result: session };

        case 'theory-lesson':
          const lesson = await this.generateTheoryLesson(task.payload);
          return { success: true, result: lesson };

        case 'assess-skill-level':
          const assessment = await this.assessSkillLevel(task.payload);
          return { success: true, result: assessment };

        default:
          throw new Error(`Unknown music coach task type: ${task.type}`);
      }
    } catch (error) {
      return {
        success: false,
        result: null,
        error: `Music Coach error: ${error}`
      };
    }
  }

  /**
   * Teach chord fundamentals and progressions
   */
  private async teachChords(payload: any): Promise<any> {
    const { instrument = 'piano', level = 'beginner', key = 'C', style = 'pop' } = payload;

    const chordPrompt = `# Music Theory Lesson: Chord Instruction

## Student Profile
- Instrument: ${instrument}
- Skill Level: ${level}
- Focus Key: ${key} major
- Musical Style: ${style}

## Lesson Objectives
1. Teach fundamental chord construction in ${key} major
2. Provide ${instrument}-specific chord diagrams and fingerings
3. Create a simple chord progression for practice
4. Explain the theory behind chord relationships

## Teaching Guidelines
- Use clear, encouraging language appropriate for ${level} level
- Include practical exercises and practice tips
- Provide both theoretical understanding and practical application
- Suggest practice routine and progression timeline

Generate a comprehensive chord lesson with:
1. Basic chord theory explanation
2. ${instrument}-specific chord diagrams for ${key} major scale chords
3. A simple 4-chord progression to practice
4. Practice exercises and techniques
5. Next steps for advancement`;

    try {
      const response = await this.claudeSonnetClient.messages.create({
        messages: [{ role: 'user', content: chordPrompt }],
        max_tokens: 3000,
        model: this.claudeModel
      });

      return {
        lesson_type: 'chord_instruction',
        instrument,
        level,
        key,
        content: response.content[0].text,
        practice_exercises: this.generateChordExercises(key, level),
        next_lesson: this.suggestNextLesson('chords', level)
      };
    } catch (error) {
      return this.generateMockChordLesson(instrument, level, key, style);
    }
  }

  /**
   * Analyze chord progressions and provide feedback
   */
  private async analyzeChordProgression(payload: any): Promise<any> {
    const { chords, key = 'C' } = payload;
    
    if (!chords || !Array.isArray(chords)) {
      throw new Error('Invalid chord progression provided');
    }

    const analysisPrompt = `# Chord Progression Analysis

## Progression to Analyze
Chords: ${chords.join(' - ')}
Key Context: ${key} major

## Analysis Requirements
1. **Roman Numeral Analysis**: Identify the function of each chord (I, ii, V, etc.)
2. **Harmonic Function**: Explain the role of each chord (tonic, subdominant, dominant)
3. **Voice Leading**: Comment on chord transitions and movement
4. **Style Assessment**: What musical styles commonly use this progression?
5. **Improvement Suggestions**: How could this progression be enhanced or varied?
6. **Practice Recommendations**: Specific exercises for mastering this progression

Provide a detailed but accessible analysis suitable for music education.`;

    try {
      const response = await this.claudeSonnetClient.messages.create({
        messages: [{ role: 'user', content: analysisPrompt }],
        max_tokens: 2000,
        model: this.claudeModel
      });

      return {
        analysis_type: 'chord_progression',
        original_progression: chords,
        key,
        analysis: response.content[0].text,
        roman_numerals: this.generateRomanNumerals(chords, key),
        variations: this.suggestProgressionVariations(chords, key),
        practice_tempo: 60 // BPM
      };
    } catch (error) {
      return this.generateMockProgressionAnalysis(chords, key);
    }
  }

  /**
   * Create personalized practice sessions
   */
  private async createPracticeSession(payload: any): Promise<any> {
    const { 
      level = 'beginner', 
      instrument = 'piano', 
      duration = 30, // minutes
      focus_area = 'general'
    } = payload;

    const sessionPrompt = `# Personalized Music Practice Session

## Student Profile
- Skill Level: ${level}
- Instrument: ${instrument}
- Session Duration: ${duration} minutes
- Focus Area: ${focus_area}

## Session Structure Requirements
1. **Warm-up (5-10 minutes)**: Technical exercises appropriate for level
2. **Theory Work (10-15 minutes)**: Relevant music theory concepts
3. **Skill Practice (15-20 minutes)**: Core technique and repertoire
4. **Application/Fun (5-10 minutes)**: Putting it all together

## Customization Guidelines
- Tailor exercises to ${level} skill level
- Include both technical and creative elements
- Provide clear time estimates for each activity
- Suggest modifications for shorter/longer sessions
- Include progress tracking suggestions

Create a detailed, structured practice session that's engaging and educational.`;

    try {
      const response = await this.claudeSonnetClient.messages.create({
        messages: [{ role: 'user', content: sessionPrompt }],
        max_tokens: 2500,
        model: this.claudeModel
      });

      return {
        session_type: 'practice_session',
        level,
        instrument,
        duration,
        focus_area,
        structure: response.content[0].text,
        exercises: this.generatePracticeExercises(level, instrument),
        assessment: this.createSessionAssessment(),
        next_session: this.planNextSession(level, focus_area)
      };
    } catch (error) {
      return this.generateMockPracticeSession(level, instrument, duration);
    }
  }

  /**
   * Generate music theory lessons
   */
  private async generateTheoryLesson(payload: any): Promise<any> {
    const { topic, level = 'beginner', context = 'general' } = payload;

    const theoryPrompt = `# Music Theory Lesson: ${topic}

## Learning Context
- Topic: ${topic}
- Student Level: ${level}
- Context: ${context}

## Lesson Objectives
Provide a comprehensive yet accessible explanation of ${topic} that includes:
1. Clear definition and explanation
2. Practical examples and applications
3. Visual representations where helpful
4. Connection to practical music making
5. Progressive exercises from simple to more complex

## Teaching Approach
- Use clear, non-intimidating language
- Include multiple examples
- Connect theory to practical application
- Provide memory aids and mnemonics where applicable
- Suggest ways to practice and reinforce the concept

Create an engaging theory lesson that makes ${topic} understandable and applicable.`;

    try {
      const response = await this.claudeSonnetClient.messages.create({
        messages: [{ role: 'user', content: theoryPrompt }],
        max_tokens: 3000,
        model: this.claudeModel
      });

      return {
        lesson_type: 'theory',
        topic,
        level,
        content: response.content[0].text,
        key_concepts: this.extractKeyConcepts(topic),
        exercises: this.generateTheoryExercises(topic, level),
        quiz_questions: this.generateQuizQuestions(topic, level)
      };
    } catch (error) {
      return this.generateMockTheoryLesson(topic, level);
    }
  }

  /**
   * Assess student skill level
   */
  private async assessSkillLevel(payload: any): Promise<any> {
    const { instrument = 'piano', responses = [] } = payload;

    // Mock skill assessment for now
    return {
      assessment_type: 'skill_level',
      instrument,
      assessed_level: 'intermediate-beginner',
      strengths: ['rhythm', 'chord recognition'],
      areas_for_improvement: ['sight reading', 'improvisation'],
      recommended_focus: 'chord progressions and basic improvisation',
      next_steps: [
        'Practice major scale chord progressions',
        'Work on simple improvisation exercises',
        'Develop sight reading skills with simple melodies'
      ]
    };
  }

  // Helper Methods

  private async createClaudeClient(): Promise<any> {
    // Mock client for development
    return {
      messages: {
        create: async (params: any) => ({
          content: [{ text: this.generateMockResponse(params.messages[0].content) }]
        })
      }
    };
  }

  private generateMockResponse(prompt: string): string {
    if (prompt.includes('Chord Instruction')) {
      return `# Chord Fundamentals Lesson

## Basic Chord Theory
A chord is three or more notes played simultaneously. In major keys, we build chords using the 1st, 3rd, and 5th notes of the scale.

## C Major Scale Chords
- **C Major** (C-E-G): The tonic chord, feels like "home"
- **D Minor** (D-F-A): The ii chord, often used for smooth transitions
- **E Minor** (E-G-B): The iii chord, adds emotional depth
- **F Major** (F-A-C): The IV chord, strong and stable
- **G Major** (G-B-D): The V chord, creates tension that wants to resolve
- **A Minor** (A-C-E): The vi chord, popular in modern music
- **B Diminished** (B-D-F): The vii chord, rarely used in basic progressions

## Practice Progression: C - F - G - C
This is the most fundamental progression in music. Practice playing these chords slowly, focusing on clean finger placement and smooth transitions.

## Practice Tips
1. Start slowly - accuracy before speed
2. Use a metronome once comfortable
3. Practice transitions between each pair of chords
4. Listen to songs that use these progressions

## Next Steps
Once comfortable with these basic triads, we'll explore 7th chords and more complex progressions.`;
    }
    
    return "Mock music lesson response - Claude Sonnet integration would provide detailed, personalized music instruction here.";
  }

  private generateChordExercises(key: string, level: string): any[] {
    return [
      {
        exercise: 'Basic Triad Practice',
        description: `Practice all triads in ${key} major scale`,
        duration: '5 minutes',
        tempo: '60 BPM'
      },
      {
        exercise: 'Chord Progression Practice',
        description: 'I-vi-IV-V progression',
        duration: '10 minutes',
        tempo: '80 BPM'
      }
    ];
  }

  private suggestNextLesson(topic: string, level: string): any {
    return {
      topic: 'Chord Inversions',
      description: 'Learn to play chords in different positions',
      estimated_time: '2 weeks'
    };
  }

  private generateRomanNumerals(chords: string[], key: string): string[] {
    // Simplified roman numeral analysis
    const romanMap: { [key: string]: string } = {
      'C': 'I', 'Dm': 'ii', 'Em': 'iii', 'F': 'IV', 'G': 'V', 'Am': 'vi', 'Bdim': 'vii°'
    };
    return chords.map(chord => romanMap[chord] || '?');
  }

  private suggestProgressionVariations(chords: string[], key: string): any[] {
    return [
      {
        variation: 'Add 7th chords',
        example: chords.map(c => c + '7'),
        description: 'Adds jazz flavor and sophistication'
      }
    ];
  }

  private generateMockChordLesson(instrument: string, level: string, key: string, style: string): any {
    return {
      lesson_type: 'chord_instruction',
      instrument,
      level,
      key,
      content: `Mock chord lesson for ${instrument} in ${key} ${style} style at ${level} level`,
      practice_exercises: this.generateChordExercises(key, level),
      next_lesson: this.suggestNextLesson('chords', level)
    };
  }

  private generateMockProgressionAnalysis(chords: string[], key: string): any {
    return {
      analysis_type: 'chord_progression',
      original_progression: chords,
      key,
      analysis: `Mock analysis of ${chords.join(' - ')} progression in ${key} major`,
      roman_numerals: this.generateRomanNumerals(chords, key),
      variations: this.suggestProgressionVariations(chords, key),
      practice_tempo: 60
    };
  }

  private generatePracticeExercises(level: string, instrument: string): any[] {
    return [
      {
        name: 'Scale Practice',
        duration: '5 minutes',
        description: `${instrument} scales appropriate for ${level} level`
      }
    ];
  }

  private createSessionAssessment(): any {
    return {
      self_assessment: 'Rate your comfort level with today\'s exercises',
      goals: 'What would you like to focus on next session?'
    };
  }

  private planNextSession(level: string, focus_area: string): any {
    return {
      suggested_date: 'In 2-3 days',
      focus: `Continue with ${focus_area} and introduce new concepts`
    };
  }

  private generateMockPracticeSession(level: string, instrument: string, duration: number): any {
    return {
      session_type: 'practice_session',
      level,
      instrument,
      duration,
      structure: `Mock ${duration}-minute practice session for ${level} ${instrument}`,
      exercises: this.generatePracticeExercises(level, instrument),
      assessment: this.createSessionAssessment(),
      next_session: this.planNextSession(level, 'general')
    };
  }

  private extractKeyConcepts(topic: string): string[] {
    return [`Key concept 1 for ${topic}`, `Key concept 2 for ${topic}`];
  }

  private generateTheoryExercises(topic: string, level: string): any[] {
    return [{
      exercise: `${topic} practice`,
      level,
      description: `Practice exercises for ${topic}`
    }];
  }

  private generateQuizQuestions(topic: string, level: string): any[] {
    return [{
      question: `What is the main principle of ${topic}?`,
      type: 'multiple_choice',
      options: ['A', 'B', 'C', 'D']
    }];
  }

  private generateMockTheoryLesson(topic: string, level: string): any {
    return {
      lesson_type: 'theory',
      topic,
      level,
      content: `Mock theory lesson about ${topic} for ${level} students`,
      key_concepts: this.extractKeyConcepts(topic),
      exercises: this.generateTheoryExercises(topic, level),
      quiz_questions: this.generateQuizQuestions(topic, level)
    };
  }

  /**
   * Execute a music coaching task from orchestration
   */
  private async executeMusicCoachingTask(payload: any): Promise<string> {
    try {
      const userRequest = payload?.userRequest || 'Unknown music coaching task';
      console.log(`🎵 MusicCoachAgent executing: ${userRequest}`);
      
      // Perform music coaching for the user's request
      const coachingResults = await this.performMusicCoaching(userRequest, payload);
      
      return coachingResults;
    } catch (error) {
      throw new Error(`Music coaching execution failed: ${error.message}`);
    }
  }

  /**
   * Perform music coaching based on user request using AI reasoning
   */
  private async performMusicCoaching(userRequest: string, payload: any): Promise<string> {
    try {
      console.log(`🎼 Providing music coaching for: "${userRequest}"`);
      
      // Use AI to understand the request and determine the best approach
      const analysisPrompt = `As an expert music coach, analyze this request and determine the best way to help:

REQUEST: "${userRequest}"

ANALYSIS REQUIRED:
1. What type of musical assistance is being requested?
2. What would be the most helpful response for this user?
3. Should I:
   - Provide music theory education?
   - Create original music content (songs, compositions)?
   - Give instrument-specific instruction?
   - Analyze existing music?
   - Provide practice guidance?
   - Something else entirely?

4. What additional information might I need from the user?
5. What would be the ideal outcome for this request?

Provide a clear analysis and then the most helpful response possible.`;

      try {
        const analysisResponse = await this.claudeSonnetClient.messages.create({
          model: this.claudeModel,
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: analysisPrompt
          }]
        });

        const analysis = analysisResponse.content[0].text;
        
        // Now use the analysis to provide the actual helpful response
        const responsePrompt = `Based on your analysis, now provide the most helpful response to this user request:

REQUEST: "${userRequest}"

CONTEXT: ${JSON.stringify(payload, null, 2)}

INSTRUCTIONS:
- Be practical and actionable
- If they want music created, create it
- If they want instruction, provide clear lessons
- If they want analysis, give detailed analysis
- If you need more information, ask specific questions
- Always aim to be maximally helpful

Provide your response now:`;

        const finalResponse = await this.claudeSonnetClient.messages.create({
          model: this.claudeModel,
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: responsePrompt
          }]
        });

        return `🎵 **Music Coach Response**

${finalResponse.content[0].text}

---
*Analysis: ${analysis.substring(0, 200)}...*`;

      } catch (error) {
        console.error('[MusicCoach] AI reasoning failed, providing fallback response:', error);
        return await this.provideFallbackResponse(userRequest, payload);
      }

    } catch (error) {
      throw new Error(`Music coaching failed: ${error.message}`);
    }
  }

  /**
   * Fallback response when AI reasoning fails
   */
  private async provideFallbackResponse(userRequest: string, payload: any): Promise<string> {
    return `🎵 **Music Coach Available**

I'm here to help with your music request: "${userRequest}"

I can assist with:
- Creating original songs and compositions
- Music theory instruction and analysis
- Instrument-specific guidance (piano, guitar, etc.)
- Practice session planning
- Chord progression analysis
- Performance coaching

To give you the best help, could you tell me more about:
- What specific aspect of music you'd like to work on?
- Your current skill level and experience?
- Any particular style or genre you're interested in?

Let me know how I can best support your musical journey!`;
  }

  /**
   * Create a music coaching plan for the given request
   */
  private createMusicCoachingPlan(request: string, payload: any): string {
    const instrument = payload?.instrument || 'general music';
    const level = payload?.level || 'intermediate';
    
    return `1. SKILL ASSESSMENT
   - Current ability level: ${level}
   - Primary instrument: ${instrument}
   - Learning goals and musical interests
   - Strengths and areas for improvement

2. CURRICULUM DEVELOPMENT
   - Progressive lesson structure
   - Theory integration with practical application
   - Technique exercises and skill builders
   - Repertoire selection and performance preparation

3. PRACTICE METHODOLOGY
   - Structured practice routines
   - Goal-oriented exercise selection
   - Progress tracking and milestone recognition
   - Motivation and consistency strategies

4. PERFORMANCE DEVELOPMENT
   - Confidence building and stage presence
   - Creative expression and improvisation
   - Collaboration and ensemble skills
   - Recording and self-evaluation techniques

COACHING METHODOLOGY: Personalized instruction with theory-practice integration and creative development`;
  }
}
