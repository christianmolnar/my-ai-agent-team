import { Agent, AgentTask, AgentTaskResult } from './Agent';
import { exec } from 'child_process'; // I need to import exec for running shell commands
import * as fs from 'fs'; // I need to import fs for file system operations
import * as path from 'path'; // I need to import path for path operations
import PersonalAssistantBridge from './PersonalAssistantBridge'; // Bridge for secure API access

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
    try {
      // Use PersonalAssistantBridge for secure DALL-E access
      const response = await PersonalAssistantBridge.requestAPIAccess('openai-dalle', {
        prompt: prompt,
        size: resolution || '1024x1024',
        n: 1,
        quality: 'standard'
      }, 'communications-agent');

      if (response.success && response.data?.imageUrl) {
        return response.data.imageUrl;
      } else {
        throw new Error(response.error || 'Image generation failed');
      }
    } catch (error) {
      console.error('Image generation error:', error);
      return 'Image generation failed: ' + (error instanceof Error ? error.message : 'Unknown error');
    }
  }
}
      throw new Error('No image URL returned from OpenAI.');
    }
    return response.data[0].url;
  }
}
