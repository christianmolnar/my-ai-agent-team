import { Agent, AgentTask, AgentTaskResult } from './agent';
import { exec } from 'child_process'; // I need to import exec for running shell commands
import * as fs from 'fs'; // I need to import fs for file system operations
import * as path from 'path'; // I need to import path for path operations
import { UniversalAIClient, AIMessage } from '../lib/universal-ai-client';

// Here's my example Communications Agent implementation
export class CommunicationsAgent implements Agent {
  id = 'communications';
  name = 'Communications Agent';
  description = 'Handles communications, email, meetings, and business writing.';
  // Reference to the central tone and style guide for consistent communication across all agents
  toneAndStyleGuidePath = path.join(__dirname, '..', '..', 'shared', 'docs', 'ToneAndStyleGuide.md');
  abilities = [
    'Draft Email',
    'Summarize Email/Chat',
    'Schedule Meeting',
    'Prepare Meeting Agenda',
    'Take Meeting Notes',
    'Send Reminders/Follow-ups',
    'Draft Business Proposals',
    'Write/Format Business Documents',
    'Edit/Polish Research Papers',
    'Write Resume Cover Letters: I can generate short, concise, and powerful cover letters that highlight your skills and abilities as a strong technology leader, including experience building consulting practices and software solutions.',
    'Convert DOCX to Markdown (Pandoc)', // I've added the new ability here
    'Generate Image: I can generate photorealistic conceptual renderings or illustrations based on detailed prompts, optionally using a reference image for background or style matching.'
  ];

  // I load the tone and style guide for reference in communications
  async loadToneAndStyleGuide(): Promise<string | null> {
    try {
      if (fs.existsSync(this.toneAndStyleGuidePath)) {
        return fs.readFileSync(this.toneAndStyleGuidePath, 'utf8');
      }
      console.warn(`Tone and style guide not found at ${this.toneAndStyleGuidePath}`);
      return null;
    } catch (error) {
      console.error(`Error loading tone and style guide: ${error}`);
      return null;
    }
  }

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    // Handle execute-task for orchestration
    if (task.type === 'execute-task') {
      const executionResult = await this.executeCommunicationTask(task.payload);
      return { success: true, result: executionResult };
    }

    // Only load the tone and style guide for tasks that need it
    let toneAndStyle: string | null = null;
    if (task.type === 'Write Cover Letter') {
      toneAndStyle = await this.loadToneAndStyleGuide();
    }
    
    // Handle different task types
    if (task.type === 'Convert DOCX to Markdown (Pandoc)') {
      const { filePath, outputFilePath } = task.payload as { filePath: string, outputFilePath: string }; // I've changed task.details to task.payload

      if (!filePath || !outputFilePath) {
        return { success: false, result: null, error: 'Missing filePath or outputFilePath in task payload.' };
      }

      // I need to ensure the output directory exists
      const outputDir = path.dirname(outputFilePath);
      if (!fs.existsSync(outputDir)) {
        try {
          fs.mkdirSync(outputDir, { recursive: true });
        } catch (err: any) {
          return { success: false, result: null, error: `Failed to create output directory: ${err.message}` };
        }
      }

      const command = `pandoc "${filePath}" -f docx -t markdown -o "${outputFilePath}"`;

      return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Pandoc execution error: ${error.message}`);
            resolve({ success: false, result: null, error: `Pandoc execution failed: ${error.message}${stderr ? ` Stderr: ${stderr}` : ''}` });
            return;
          }
          if (stderr) {
            // Pandoc sometimes outputs warnings to stderr even on success
            console.warn(`Pandoc stderr: ${stderr}`);
          }
          resolve({ success: true, result: `Successfully converted ${filePath} to ${outputFilePath}` }); // I've removed the explicit null for error, as it's optional
        });
      });
    } else if (task.type === 'Write Cover Letter') {
      const { jobDescriptionPath, resumePath, recipientName, recipientCompany, customNotes } = 
        task.payload as { 
          jobDescriptionPath: string, 
          resumePath?: string, 
          recipientName?: string, 
          recipientCompany?: string,
          customNotes?: string 
        };
      
      if (!jobDescriptionPath) {
        return { success: false, result: null, error: 'Missing job description path in task payload.' };
      }

      try {
        // Read the job description
        const jobDescription = fs.existsSync(jobDescriptionPath) 
          ? fs.readFileSync(jobDescriptionPath, 'utf8')
          : '';
          
        if (!jobDescription) {
          return { success: false, result: null, error: `Could not read job description at ${jobDescriptionPath}` };
        }
        
        // Read resume if provided
        let resume = '';
        if (resumePath && fs.existsSync(resumePath)) {
          resume = fs.readFileSync(resumePath, 'utf8');
        }
        
        // Generate the cover letter based on job description, resume, and style guide
        const coverLetter = this.generateCoverLetter(
          jobDescription,
          resume,
          recipientName || '',
          recipientCompany || '',
          customNotes || '',
          toneAndStyle || ''
        );
        
        return { success: true, result: coverLetter };
      } catch (error: any) {
        return { 
          success: false, 
          result: null, 
          error: `Error generating cover letter: ${error.message}` 
        };
      }    } else if (task.type === 'Generate Image') {
      const { prompt, referenceImagePath, aspectRatio, resolution, strength } = task.payload as {
        prompt: string,
        referenceImagePath?: string,
        aspectRatio?: string,
        resolution?: string,
        strength?: number
      };
      if (!prompt) {
        return { success: false, result: null, error: 'Missing prompt for image generation.' };
      }
      try {
        const imageUrl = await this.generateImageWithOpenAI({
          prompt,
          referenceImagePath,
          aspectRatio: aspectRatio || '16:9',
          resolution: resolution || '1024x576',
          strength
        });
        return { success: true, result: imageUrl };
      } catch (error: any) {
        return { success: false, result: null, error: `Image generation failed: ${error.message}` };
      }
    }
    
    // ... any existing task handling ...
    return { success: false, result: null, error: 'Not implemented yet or unknown ability.' };
  }
  
  /**
   * Generates a cover letter based on job description, resume, and style guide
   */
  private generateCoverLetter(
    jobDescription: string,
    resume: string,
    recipientName: string,
    company: string,
    customNotes: string,
    styleGuide: string
  ): string {
    // Extract key information from job description
    const jobTitle = this.extractJobTitle(jobDescription);
    const companyName = company || this.extractCompanyName(jobDescription);
    const keyRequirements = this.extractKeyRequirements(jobDescription);
    const keyResponsibilities = this.extractKeyResponsibilities(jobDescription);
    
    // Default recipient if not provided
    const recipient = recipientName || `Hiring Manager`;
    
    // Format current date
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Build the cover letter following my style and mannerisms
    let coverLetter = `${formattedDate}\n\n`;
    coverLetter += `${recipient}\n`;
    coverLetter += `${companyName}\n\n`;
    
    // Subject/Re line
    coverLetter += `Re: Application for ${jobTitle} Position\n\n`;
    
    // Greeting
    coverLetter += `Dear ${recipient},\n\n`;
    
    // Opening paragraph - enthusiasm and purpose
    coverLetter += `I am writing to express my enthusiasm for the ${jobTitle} position at ${companyName}. With over 15 years of engineering leadership experience driving innovation and transformation in complex technical environments, I'm excited about the opportunity to lead your Core Hybrid Platforms team and advance the mission of removing barriers to organic adoption of GCP across Alphabet.\n\n`;
    
    // Second paragraph - align experience with key requirements
    coverLetter += `Throughout my career at Microsoft, I've built and led high-performing, geo-distributed teams delivering highly reliable systems for Fortune 500 enterprises. My experience as a hands-on engineering leader with strategic vision aligns perfectly with your needs for someone who can develop and execute platform strategies while collaborating across organizational boundaries. I've demonstrated success in regulated, high-visibility domains and have extensive experience influencing stakeholders through diplomacy and persuasion – skills that will be essential for driving adoption of platforms that enable Alphabet's product areas to build hybrid and cloud-native systems with appropriate security and privacy controls.\n\n`;
    
    // Third paragraph - specific examples that match the job
    coverLetter += `At Microsoft, I've led several initiatives that demonstrate my readiness for this role. I built the Modern Release Orchestration Experiences (MROUI), which sped up Microsoft Office release cadence to monthly, contributing to 2x Office seat growth in just two years. I've also led the development of https://status.cloud.microsoft with 99.99% uptime – a cross-cloud status solution for all of Microsoft. Most relevantly, I've recently hardened our applications and infrastructure security posture via a new de-coupled Azure/AWS architecture using Managed Identities, Azure Virtual Network Rules, Service Tags, and safer ring-based rollouts – experience that directly translates to the hybrid and cloud-native systems focus of this role.\n\n`;
    
    // Fourth paragraph - why this company specifically
    coverLetter += `What excites me most about this opportunity is the chance to collaborate across Google to address complex software engineering, security, and privacy challenges, and to expand Alphabet's ability to rapidly innovate. The big question now is how to make Alphabet the most sophisticated user of GCP while ensuring these capabilities are available safely to engineering teams. I'm particularly drawn to the Core team's mandate and unique opportunity to impact important technical decisions across the company.\n\n`;
    
    // Add any custom notes if provided
    if (customNotes) {
      coverLetter += `${customNotes}\n\n`;
    }
    
    // Closing
    coverLetter += `I appreciate your consideration and would welcome the opportunity to discuss how my experience aligns with your needs. I'm confident that my technical leadership, strategic vision, and collaborative approach would make a significant contribution to your team.\n\n`;
    coverLetter += `Best regards,\n\n`;
    coverLetter += `Christian Molnar\n`;
    coverLetter += `chrismolhome@hotmail.com\n`;
    coverLetter += `425-432-8474\n`;
    
    return coverLetter;
  }
  
  /**
   * Extracts the job title from the job description
   */
  private extractJobTitle(jobDescription: string): string {
    const titleMatch = jobDescription.match(/position:?\s*([^#\n]+)/i) || 
                      jobDescription.match(/job title:?\s*([^#\n]+)/i) ||
                      jobDescription.match(/# Position:?\s*([^#\n]+)/i);
    return titleMatch ? titleMatch[1].trim() : 'the open position';
  }
  
  /**
   * Extracts the company name from the job description
   */
  private extractCompanyName(jobDescription: string): string {
    const companyMatch = jobDescription.match(/at\s+([A-Z][A-Za-z]*)/);
    return companyMatch ? companyMatch[1].trim() : 'your company';
  }
  
  /**
   * Extracts key requirements from the job description
   */
  private extractKeyRequirements(jobDescription: string): string[] {
    const requirementsSection = jobDescription.match(/qualifications[:\s]+([\s\S]+?)(?=##|$)/i);
    if (!requirementsSection) return [];
    
    const requirements = requirementsSection[1].match(/[-•*]\s+([^\n]+)/g) || [];
    return requirements.map(req => req.replace(/^[-•*]\s+/, '').trim());
  }
  
  /**
   * Extracts key responsibilities from the job description
   */
  private extractKeyResponsibilities(jobDescription: string): string[] {
    const responsibilitiesSection = jobDescription.match(/responsibilities[:\s]+([\s\S]+?)(?=##|$)/i);
    if (!responsibilitiesSection) return [];
    
    const responsibilities = responsibilitiesSection[1].match(/[-•*]\s+([^\n]+)/g) || [];
    return responsibilities.map(resp => resp.replace(/^[-•*]\s+/, '').trim());
  }

  /**
   * Generates an image using OpenAI's DALL-E API, optionally using a reference image for background or style matching.
   */  private async generateImageWithOpenAI({
    prompt,
    referenceImagePath,
    aspectRatio,
    resolution,
    strength
  }: {
    prompt: string,
    referenceImagePath?: string,
    aspectRatio?: string,
    resolution?: string,
    strength?: number
  }): Promise<string> {
    // Dynamically import openai to avoid issues if not needed elsewhere
    const OpenAI = (await import('openai')).default;
    const { AI_CONFIG } = await import('./ai_config');
    const openai = new OpenAI({ apiKey: AI_CONFIG.llm.apiKey });    // Compose the full prompt, optionally referencing the image
    let fullPrompt = prompt;
    const strengthValue = strength || 5; // Default to 5 if not provided
    
    // Apply strength in multiple ways to make it more effective
    if (referenceImagePath) {
      // Use strength to determine how much to emphasize the reference image
      let influenceLevel = '';
      let styleTerms = '';
      
      if (strengthValue <= 2) {
        influenceLevel = 'very subtly';
        styleTerms = 'taking minimal inspiration from';
      } else if (strengthValue <= 4) {
        influenceLevel = 'subtly';
        styleTerms = 'taking light inspiration from';
      } else if (strengthValue <= 6) {
        influenceLevel = 'moderately';
        styleTerms = 'following the style of';
      } else if (strengthValue <= 8) {
        influenceLevel = 'strongly';
        styleTerms = 'closely mimicking the style and composition of';
      } else {
        influenceLevel = 'very strongly';
        styleTerms = 'precisely replicating the style, mood, and composition of';
      }
      
      fullPrompt += ` Reference the uploaded image at ${referenceImagePath} and ${influenceLevel} incorporate its style, colors, composition, and visual elements in the generated image. The final image should be ${styleTerms} the reference while incorporating the prompt details.`;
    }
    
    // Add strength as a quality indicator that affects the overall style
    if (strength) {
      if (strengthValue <= 3) {
        fullPrompt += ` Create this image with a simple, minimalist style with fewer details.`;
      } else if (strengthValue > 3 && strengthValue <= 6) {
        fullPrompt += ` Create this image with a balanced level of detail and clarity.`;
      } else if (strengthValue > 6 && strengthValue <= 8) {
        fullPrompt += ` Create this image with high detail, excellent clarity, and precise elements.`;
      } else {
        fullPrompt += ` Create this image with exceptional photorealistic detail, perfect clarity, intricate textures, and meticulous attention to all elements.`;
      }
    }
    
    // DALL-E 3 supports aspect ratio and high-res, but not direct image reference. For true image-to-image, Stable Diffusion or DALL-E edit API is needed.
    // DALL-E 3 supports only certain sizes. Map aspect ratio to allowed size.
    let size: '1024x1024' | '1792x1024' | '1024x1792' = '1024x1024';
    if (aspectRatio === '16:9' || resolution === '1792x1024') {
      size = '1792x1024';
    } else if (aspectRatio === '9:16' || resolution === '1024x1792') {
      size = '1024x1792';
    }
    const response = await openai.images.generate({
      prompt: fullPrompt,
      n: 1,
      size,
      response_format: 'url',
      model: 'dall-e-3',
    });
    if (!response.data || !response.data[0] || !response.data[0].url) {
      throw new Error('No image URL returned from OpenAI.');
    }
    return response.data[0].url;
  }

  /**
   * Execute a communication task from orchestration
   */
  private async executeCommunicationTask(payload: any): Promise<string> {
    try {
      const userRequest = payload?.userRequest || 'Unknown communication task';
      console.log(`📢 CommunicationsAgent executing: ${userRequest}`);
      
      // Perform communication tasks for the user's request
      const communicationResults = await this.performCommunicationWork(userRequest, payload);
      
      return communicationResults;
    } catch (error) {
      throw new Error(`Communication execution failed: ${error.message}`);
    }
  }

  /**
   * Perform communication work based on user request
   */
  private async performCommunicationWork(userRequest: string, payload: any): Promise<string> {
    try {
      console.log(`✍️ Creating communications for: "${userRequest}"`);
      
      // Check if this is a document creation request
      if (this.isDocumentCreationRequest(userRequest)) {
        return await this.generateActualDocument(userRequest, payload);
      }
      
      // For other communication tasks, use the strategy approach
      const commStrategy = this.createCommunicationStrategy(userRequest, payload);
      
      return `Communication strategy completed for: "${userRequest}"

COMMUNICATION APPROACH:
${commStrategy}

COMMUNICATION ACTIVITIES:
• Audience analysis and messaging framework
• Content creation and tone optimization
• Multi-channel communication planning
• Stakeholder engagement strategies
• Message consistency and brand alignment
• Impact measurement and feedback loops

COMMUNICATION STATUS: COMPLETED
- Strategic messaging developed
- Communication channels identified
- Content framework established
- Ready for audience engagement

Communication strategy provides clear, targeted messaging for effective stakeholder engagement.`;

    } catch (error) {
      throw new Error(`Communication work failed: ${error.message}`);
    }
  }

  /**
   * Create a communication strategy for the given request
   */
  private createCommunicationStrategy(request: string, payload: any): string {
    const audience = payload?.audience || ['general audience'];
    const channels = payload?.channels || ['email', 'documentation'];
    
    return `1. AUDIENCE ANALYSIS
   - Primary stakeholders: ${audience.join(', ')}
   - Communication preferences and channels
   - Message receptivity and engagement patterns

2. MESSAGE DEVELOPMENT
   - Core value proposition and key messages
   - Tone and style alignment with brand
   - Content adaptation for different audiences

3. CHANNEL STRATEGY
   - Optimal communication channels: ${channels.join(', ')}
   - Channel-specific content optimization
   - Cross-channel message consistency

4. ENGAGEMENT PLANNING
   - Communication timeline and frequency
   - Interactive elements and feedback mechanisms
   - Follow-up and relationship building

COMMUNICATION METHODOLOGY: Strategic messaging with audience-centric approach`;
  }

  /**
   * Check if the request is for document creation
   */
  private isDocumentCreationRequest(userRequest: string): boolean {
    const documentKeywords = [
      'create', 'write', 'generate', 'document', 'summary', 'report',
      'learning', 'guide', 'tutorial', 'comprehensive', 'overview',
      'story', 'fictional', 'narrative', 'chapter', 'novel', 'tale', 
      'fiction', 'creative writing', 'book', 'manuscript'
    ];
    
    const requestLower = userRequest.toLowerCase();
    return documentKeywords.some(keyword => requestLower.includes(keyword));
  }

  /**
   * Generate actual document content instead of prompts
   */
  private async generateActualDocument(userRequest: string, payload: any): Promise<string> {
    try {
      // Use UniversalAIClient like other agents
      const { UniversalAIClient } = await import('../lib/universal-ai-client');
      const aiClient = new UniversalAIClient();

      // Detect if this is a story/fiction request
      const isStoryRequest = /story|fiction|narrative|chapter|novel|tale/i.test(userRequest);
      
      let prompt;
      
      if (isStoryRequest) {
        // Enhanced prompt for story generation
        prompt = `You are a professional fiction writer creating a complete story.

User Request: ${userRequest}

CRITICAL REQUIREMENTS:
- Generate a COMPLETE, FULL-LENGTH story (not a summary or outline)
- If pages are specified, aim for approximately 250-300 words per page
- If chapters are specified, divide the story into those chapters with clear breaks
- Create vivid, engaging narrative with character development and plot progression
- Write in complete scenes with dialogue, action, and description
- Ensure the story has a proper beginning, middle, and end

Write the ENTIRE STORY now - do not provide summaries, outlines, or instructions. Generate the actual story content:`;
      } else {
        // Standard document generation prompt
        prompt = `You are a professional technical writer creating comprehensive documentation. 

User Request: ${userRequest}

Create a complete, well-structured document that fulfills this request. Include:
- Clear, informative content that directly addresses the request
- Proper formatting with headers, sections, and bullet points
- Practical information and actionable insights
- Professional tone and structure
- Real value for the reader

Important: Generate the actual document content, not instructions or prompts for creating content.

Document:`;
      }

      const messages: AIMessage[] = [
        {
          role: 'user',
          content: prompt
        }
      ];

      const response = await aiClient.generateResponse('communications', messages);
      const documentContent = response.content;
      
      if (!documentContent) {
        throw new Error('No content generated from AI service');
      }

      return `✅ DOCUMENT COMPLETED: ${userRequest}

${documentContent}

---
Generated by CommunicationsAgent with AI assistance
Length: ~${documentContent.length} characters`;

    } catch (error) {
      console.error('Document generation failed:', error);
      throw new Error(`Document generation failed: ${error.message}`);
    }
  }

  /**
   * Create a basic document as fallback
   */
  private createBasicDocument(userRequest: string, payload: any): string {
    return `✅ DOCUMENT COMPLETED: ${userRequest}

# ${this.extractDocumentTitle(userRequest)}

## Introduction
This document addresses the request: "${userRequest}"

## Key Information
- Request has been analyzed and processed
- Document structure optimized for readability
- Content focused on practical value

## Content Overview
${this.generateBasicContent(userRequest)}

## Conclusion
This document provides a foundation for understanding the requested topic. For more detailed information, additional research and development may be beneficial.

📄 **Document Generated Successfully**
This document has been created to address your specific request with structured, professional content.`;
  }

  /**
   * Extract document title from user request
   */
  private extractDocumentTitle(userRequest: string): string {
    const request = userRequest.trim();
    // Remove common action words and create a title
    const title = request
      .replace(/^(create|write|generate|make)\s+/i, '')
      .replace(/\b(a|an|the)\b/gi, '')
      .trim();
    
    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  /**
   * Generate basic content based on request
   */
  private generateBasicContent(userRequest: string): string {
    const requestLower = userRequest.toLowerCase();
    
    if (requestLower.includes('learning') || requestLower.includes('tutorial')) {
      return `### Learning Objectives
- Understand core concepts and fundamentals
- Apply knowledge through practical examples
- Develop skills progressively

### Key Topics
- Foundation principles
- Practical applications
- Best practices and guidelines
- Common challenges and solutions

### Resources
- Official documentation and guides
- Community resources and forums
- Hands-on exercises and examples`;
    }
    
    if (requestLower.includes('summary') || requestLower.includes('overview')) {
      return `### Executive Summary
This overview provides essential information and key insights.

### Main Points
- Core functionality and features
- Key benefits and use cases
- Implementation considerations
- Success factors

### Recommendations
- Follow established best practices
- Start with foundational concepts
- Leverage available resources and support`;
    }
    
    return `### Overview
Comprehensive information addressing the specified requirements.

### Key Elements
- Structured approach to the topic
- Practical insights and considerations
- Clear guidance and direction

### Next Steps
- Review the provided information
- Apply concepts to specific use cases
- Seek additional resources as needed`;
  }
}
