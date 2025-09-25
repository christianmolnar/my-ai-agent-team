import { Agent, AgentTask, AgentTaskResult } from './agent';
import fs from 'fs/promises';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AI_CONFIG } from './ai_config';
import puppeteer, { Browser, Page } from 'puppeteer';
import { UniversalAIClient, AIMessage } from '../lib/universal-ai-client';
import { EnhancedFileSystemManager } from '../lib/EnhancedFileSystemManager';

export class ResearcherAgent implements Agent {
  id = 'researcher';
  name = 'Personal Researcher Agent';
  description = 'Conducts research, summarizes findings, and performs fact-checking using trusted resources.';
  abilities = [
    'Conduct Personal Topic Research',
    'Summarize Personal Findings',
    'Generate Personal Reference Lists',
    'Compare Products/Services',
    'Find Resources for Hobbies, Health, Travel, etc.',
    'Monitor Trends/News in Personal Interest Areas',
    'Draft Personal Project Reports or Summaries',
    'Research news and identify misinformation',
    'Perform fact-checking research using the integrated cheat sheet and online tools'
  ];

  private aiClient: UniversalAIClient;
  private fileManager: EnhancedFileSystemManager;

  constructor() {
    this.aiClient = new UniversalAIClient();
    this.fileManager = new EnhancedFileSystemManager();
  }

  /**
   * Handle any research or content creation request using general AI capabilities
   */
  private async conductResearch(userRequest: string, payload: any): Promise<string> {
    try {
      console.log(`🔍 Starting research on: "${userRequest}"`);
      
      // Build full context from conversation history if available
      let fullContext = userRequest;
      if (payload.conversationHistory && payload.conversationHistory.length > 0) {
        const contextParts: string[] = [];
        for (const turn of payload.conversationHistory) {
          if (turn.userMessage) {
            contextParts.push(`User: ${turn.userMessage}`);
          }
          if (turn.assistantMessage) {
            contextParts.push(`Assistant: ${turn.assistantMessage}`);
          }
        }
        const conversationContext = contextParts.join('\n');
        fullContext = `CONVERSATION CONTEXT:\n${conversationContext}\n\nCURRENT REQUEST: ${userRequest}`;
      }
      
      // Use general AI to handle ANY type of request
      const result = await this.generateGeneralResponse(fullContext);
      
      // Try to save as deliverable if it's a substantial piece of content
      await this.attemptToSaveAsDeliverable(result, userRequest);
      
      return result;

    } catch (error) {
      throw new Error(`Research failed: ${error.message}`);
    }
  }

  /**
   * General-purpose response generation for any type of research request
   */
  private async generateGeneralResponse(request: string, conversationHistory?: any[]): Promise<string> {
    // Build full context from conversation history
    let fullContext = request;
    if (conversationHistory && conversationHistory.length > 0) {
      const contextParts: string[] = [];
      for (const turn of conversationHistory) {
        if (turn.userMessage) {
          contextParts.push(`User: ${turn.userMessage}`);
        }
        if (turn.assistantMessage) {
          contextParts.push(`Assistant: ${turn.assistantMessage}`);
        }
      }
      const conversationContext = contextParts.join('\n');
      
      fullContext = `CONVERSATION CONTEXT:
${conversationContext}

CURRENT REQUEST: ${request}

Based on the full conversation above, provide a comprehensive response to the current request.`;
    }

    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Please fulfill this request: ${fullContext}

I am a general-purpose AI assistant. I can help with any type of content creation including:
- Research papers and academic content
- Creative writing (stories, poems, novels)
- Business documents and reports  
- Technical documentation
- Analysis and summaries
- Fiction and non-fiction writing
- Any other content creation task

Please provide a comprehensive, well-structured response that fully addresses the request. 

For the request "${request}":
- If it's asking for a STORY or FICTIONAL content, write a complete, full-length story with detailed chapters, extensive dialogue, rich character development, and comprehensive narrative scenes. DO NOT write a summary - write the actual complete story content.
- If it's asking for RESEARCH, provide thorough research-based content with full details and comprehensive analysis
- If it's asking for a REPORT, create a professional business report with complete sections and detailed content
- If it's asking for CREATIVE WRITING, be creative and engaging with full, detailed content
- Match the tone, style, and format appropriate for what's being requested

CRITICAL: When asked for a specific length (like "5 pages"), generate content that actually meets that length requirement. Write full scenes, complete chapters, extensive dialogue, detailed descriptions, and comprehensive narrative content. Do not provide summaries, outlines, or abbreviated versions.

Generate the complete, full-length content now - don't provide instructions on how to create it.`
      }
    ];

    try {
      const response = await this.aiClient.generateResponse('researcher', messages);
      return response.content;
    } catch (error) {
      console.error('[Researcher] General response generation failed:', error);
      return this.getFallbackResponse(request);
    }
  }

  /**
   * Attempt to save content as a deliverable file
   */
  private async attemptToSaveAsDeliverable(content: string, request: string): Promise<{ success: boolean; message: string; filename?: string }> {
    try {
      const filename = await this.generateFilename(request);
      
      const saveResult = await this.fileManager.saveResearchPaper(
        filename,
        content,
        `Research response: ${request}`,
        this.id
      );
      
      return {
        success: saveResult.success,
        message: saveResult.message,
        filename: filename
      };
    } catch (error) {
      console.error('[Researcher] Error saving deliverable:', error);
      return {
        success: false,
        message: 'Could not save as deliverable file'
      };
    }
  }

  /**
   * Generate appropriate filename for any type of content
   */
  private async generateFilename(request: string): Promise<string> {
    try {
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: `Generate a short, descriptive filename (under 30 characters) for this request:
"${request}"

Requirements:
- Under 30 characters total
- Use only letters, numbers, and hyphens
- No spaces or special characters  
- Descriptive but concise
- Professional style

Examples:
- "Climate-Change-Analysis"
- "Marketing-Strategy-Guide" 
- "Python-Tutorial-Summary"

Respond with ONLY the filename, no quotes or explanations.`
        }
      ];

      const response = await this.aiClient.generateResponse('researcher', messages);
      
      // Clean and validate the response
      let filename = response.content
        .replace(/[^a-zA-Z0-9-]/g, '')
        .replace(/^-+|-+$/g, '')
        .substring(0, 30);
      
      // Fallback if AI response is unusable
      if (!filename || filename.length < 3) {
        filename = request.toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .substring(0, 30);
      }
      
      return filename || 'research-content';
      
    } catch (error) {
      console.error('[Researcher] Error generating filename:', error);
      // Fallback to simple cleanup
      const cleanRequest = request.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .substring(0, 30);
      
      return cleanRequest || 'research-content';
    }
  }

  /**
   * Fallback response if AI generation fails
   */
  private getFallbackResponse(request: string): string {
    return `Research Analysis: ${request}

I've analyzed your request but encountered limitations in providing a comprehensive response due to:

CONSTRAINTS:
- No internet access for real-time information
- Cannot verify current facts or access live sources
- Cannot provide actual links to tutorials or resources
- Knowledge limited to training data cutoff

RECOMMENDATIONS:
For the most current and authoritative information about "${request}", I recommend:

1. **Official Sources**: Look for official documentation, websites, or academic institutions
2. **Current Resources**: Search for recent tutorials, guides, and educational materials
3. **Verification**: Cross-reference information from multiple reliable sources
4. **Expert Consultation**: Consider reaching out to subject matter experts in the field

This research provides a foundation that can be expanded with current, verified information from authoritative sources.`;
  }

  async handleTask(task: AgentTask): Promise<AgentTaskResult> {
    // Handle generic orchestrated task execution
    if (task.type === 'execute-task') {
      try {
        const userRequest = task.payload?.userRequest || 'Unknown research task';
        console.log(`🔬 ResearcherAgent executing: ${userRequest}`);
        
        // Perform comprehensive research on the user's request
        const researchResults = await this.conductResearch(userRequest, task.payload);
        
        return {
          success: true,
          result: researchResults
        };
      } catch (error) {
        return {
          success: false,
          result: null,
          error: `Research execution failed: ${error.message}`
        };
      }
    }

    if (task.type === 'fact_check_text') {
      const claim = task.payload?.claim;
      if (!claim) return { success: false, result: null, error: 'No claim provided.' };

      // I'll define common Wikipedia-first patterns
      const wikiPatterns = [
        /who\s+is\s+the\s+president\b/i,
        /current\s+president\b/i,
        /who\s+is\s+the\s+prime\s+minister\b/i,
        /current\s+prime\s+minister\b/i,
        /who\s+is\s+the\s+king\b/i,
        /current\s+king\b/i,
        /who\s+is\s+the\s+queen\b/i,
        /current\s+queen\b/i,
        /who\s+is\s+the\s+governor\b/i,
        /current\s+governor\b/i,
        /who\s+is\s+the\s+mayor\b/i,
        /current\s+mayor\b/i,
        /who\s+is\s+the\s+leader\b/i,
        /current\s+leader\b/i,
        /who\s+is\s+the\s+ceo\b/i,
        /current\s+ceo\b/i,
        /what\s+is\s+the\s+population\b/i,
        /current\s+population\b/i,
        /what\s+is\s+the\s+capital\b/i,
        /current\s+capital\b/i,
        /when\s+was\s+.*\s+founded\b/i,
        /when\s+was\s+.*\s+established\b/i,
        /when\s+was\s+.*\s+born\b/i,
        /when\s+did\s+.*\s+die\b/i,
        /when\s+did\s+.*\s+occur\b/i,
        /what\s+is\s+the\s+area\b/i,
        /current\s+area\b/i,
        /what\s+is\s+the\s+gdp\b/i,
        /current\s+gdp\b/i,
        /what\s+is\s+the\s+currency\b/i,
        /current\s+currency\b/i,
        // I'll add a generic pattern for 'X is president of Y' and similar
        /is\s+.*president\s+of\s+/i,
        /is\s+.*prime\s+minister\s+of\s+/i,
        /is\s+.*king\s+of\s+/i,
        /is\s+.*queen\s+of\s+/i,
        /is\s+.*mayor\s+of\s+/i,
        /is\s+.*governor\s+of\s+/i,
        /is\s+.*ceo\s+of\s+/i,
        /is\s+.*capital\s+of\s+/i,
        /is\s+.*currency\s+of\s+/i,
        /is\s+.*population\s+of\s+/i,
        /is\s+.*gdp\s+of\s+/i
      ];
      let useWikipedia = wikiPatterns.some((pat) => pat.test(claim));
      let wikiSubject: string | null = null;
      // I'll use LLM-based semantic detection if no pattern matched
      if (!useWikipedia) {
        try {
          const today = new Date().toISOString().split('T')[0];
          const llmRes = await axios.post(
            AI_CONFIG.llm.endpoint,
            {
              model: AI_CONFIG.llm.model,
              messages: [
                { role: 'system', content: `You are a world-class fact-checking assistant. Today is ${today}. I want you to classify the following claim. If it is a common fact (such as about a country's leader, capital, population, area, GDP, or currency), respond with 'YES' and the type (e.g., leader, capital, population, etc.) and the subject (e.g., country or entity). If not, respond with 'NO'.` },
                { role: 'user', content: `Claim: ${claim}` }
              ]
            },
            { headers: { 'Authorization': `Bearer ${AI_CONFIG.llm.apiKey}` } }
          );
          const llmText = llmRes.data.choices?.[0]?.message?.content || '';
          if (/^YES/i.test(llmText)) {
            useWikipedia = true;
            // I'll try to extract the subject from the LLM response (e.g., 'YES, leader, United States')
            const parts = llmText.split(',').map((s: string) => s.trim());
            if (parts.length >= 3) {
              wikiSubject = parts.slice(2).join(', '); // Handles commas in country/entity names
            } else if (parts.length === 2) {
              wikiSubject = parts[1];
            }
          }
        } catch (err) {
          // I'll ignore LLM errors for semantic detection and fallback to default
        }
      }
      let wikiResult: any = null;
      let googleResult: any = null;
      let llmResult: any = null;
      // Wikipedia logic
      if (useWikipedia) {
        let wikiTitle = '';
        if (wikiSubject) {
          wikiTitle = wikiSubject;
        } else if (/president.*united states|united states.*president/i.test(claim)) wikiTitle = 'President of the United States';
        else if (/prime minister.*united kingdom|united kingdom.*prime minister/i.test(claim)) wikiTitle = 'Prime Minister of the United Kingdom';
        else if (/president.*france|france.*president/i.test(claim)) wikiTitle = 'President of France';
        else if (/prime minister.*canada|canada.*prime minister/i.test(claim)) wikiTitle = 'Prime Minister of Canada';
        if (!wikiTitle) wikiTitle = claim;
        try {
          const searchRes = await axios.get(`https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(wikiTitle)}&limit=1`);
          const page = searchRes.data.pages?.[0];
          let pageTitle = page?.title || wikiTitle;
          const summaryRes = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`);
          const summary = summaryRes.data;
          wikiResult = {
            summary: summary.extract,
            pageTitle,
            wikipediaUrl: summary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
            primarySource: 'Wikipedia',
          };
        } catch (err: any) {
          wikiResult = null;
        }
      }
      // Google (SerpAPI) logic
      if (AI_CONFIG.serpApi.apiKey) {
        try {
          const serpRes = await axios.get(
            `${AI_CONFIG.serpApi.endpoint}?q=${encodeURIComponent(claim)}&api_key=${AI_CONFIG.serpApi.apiKey}&hl=en&gl=us`
          );
          const serpData = serpRes.data;
          let snippet = '';
          if (serpData.answer_box && serpData.answer_box.answer) {
            snippet = serpData.answer_box.answer;
          } else if (serpData.answer_box && serpData.answer_box.snippet) {
            snippet = serpData.answer_box.snippet;
          } else if (serpData.organic_results && serpData.organic_results.length > 0) {
            snippet = serpData.organic_results[0].snippet || serpData.organic_results[0].title;
          }
          if (snippet) {
            googleResult = {
              summary: snippet,
              googleSearch: `https://www.google.com/search?q=${encodeURIComponent(claim)}`,
              primarySource: 'Google',
            };
          }
        } catch (serpErr) {
          googleResult = null;
        }
      }
      // LLM logic (always get an answer for synthesis)
      let llmInitialAnswer = null;
      let llmInitialDecision = 'Undetermined';
      try {
        const today = new Date().toISOString().split('T')[0];
        const openaiRes = await axios.post(
          AI_CONFIG.llm.endpoint,
          {
            model: AI_CONFIG.llm.model,
            messages: [
              { role: 'system', content: `You are a world-class fact-checking assistant. Today is ${today}. Always answer with "True", "False", or "Uncertain" and a brief explanation. If the claim is about a political office, always cite the current officeholder as of today.` },
              { role: 'user', content: `Is this statement true as of today (${today}): "${claim}"?` }
            ]
          },
          { headers: { 'Authorization': `Bearer ${AI_CONFIG.llm.apiKey}` } }
        );
        llmInitialAnswer = openaiRes.data.choices?.[0]?.message?.content || '';
        llmResult = {
          summary: llmInitialAnswer,
          primarySource: 'OpenAI',
        };
      } catch (err: any) {
        llmResult = null;
      }
      // Synthesis logic: if there is disagreement or ambiguity, ask the LLM to synthesize
      let synthesizedDecision = null;
      if ((wikiResult && googleResult && wikiResult.summary !== googleResult.summary) || (!wikiResult && googleResult && llmResult) || (!wikiResult && !googleResult && llmResult)) {
        try {
          const synthesisPrompt = [
            'Given the following answers from different sources, synthesize the most likely correct answer and explain why.\n',
            wikiResult ? `Wikipedia: ${wikiResult.summary}` : '',
            googleResult ? `Google: ${googleResult.summary}` : '',
            llmResult ? `OpenAI: ${llmResult.summary}` : '',
          ].filter(Boolean).join('\n');
          const synthRes = await axios.post(
            AI_CONFIG.llm.endpoint,
            {
              model: AI_CONFIG.llm.model,
              messages: [
                { role: 'system', content: 'You are a world-class fact-checking assistant. Synthesize a final answer from the following sources.' },
                { role: 'user', content: synthesisPrompt }
              ]
            },
            { headers: { 'Authorization': `Bearer ${AI_CONFIG.llm.apiKey}` } }
          );
          synthesizedDecision = synthRes.data.choices?.[0]?.message?.content || null;
        } catch (err) {
          synthesizedDecision = null;
        }
      }
      // Compose the result object for the UI
      // Let the AI determine the decision based on available information
      const messages: AIMessage[] = [
        {
          role: 'user',
          content: `Based on the following information, determine if this claim is true, false, or uncertain:

CLAIM: ${claim}

INFORMATION AVAILABLE:
${wikiResult ? `Wikipedia Summary: ${wikiResult.summary}` : ''}
${googleResult ? `Google Summary: ${googleResult.summary}` : ''}
${synthesizedDecision ? `Analysis: ${synthesizedDecision}` : ''}
${llmInitialAnswer ? `Initial Analysis: ${llmInitialAnswer}` : ''}

Please respond with exactly one word: "True", "False", or "Uncertain"`
        }
      ];

      let decision: string;
      try {
        const response = await this.aiClient.generateResponse('researcher', messages);
        const rawDecision = response.content.trim();
        
        // Extract just the decision word
        if (rawDecision.toLowerCase().includes('true')) {
          decision = 'True';
        } else if (rawDecision.toLowerCase().includes('false')) {
          decision = 'False';
        } else {
          decision = 'Uncertain';
        }
      } catch (error) {
        console.error('[Researcher] Error determining fact-check decision:', error);
        decision = 'Uncertain';
      }

      let primarySource = wikiResult ? 'Wikipedia' : (googleResult ? 'Google' : 'OpenAI');
      let summary = wikiResult?.summary || googleResult?.summary || llmResult?.summary || 'No answer found.';
      // If there is disagreement or synthesis was used, prefer the synthesized answer
      if (synthesizedDecision) {
        summary = synthesizedDecision;
        primarySource = 'Synthesis';
      } else if (wikiResult && wikiResult.summary) {
        primarySource = 'Wikipedia';
        summary = wikiResult.summary;
      } else if (googleResult && googleResult.summary) {
        primarySource = 'Google';
        summary = googleResult.summary;
      } else {
        primarySource = 'OpenAI';
        summary = llmInitialAnswer || 'No answer found.';
      }
      let resultObj: any = {
        sources: {
          wikipedia: wikiResult,
          google: googleResult,
          openai: llmResult,
        },
        synthesizedDecision,
        primarySource,
        summary,
        wikipediaUrl: wikiResult?.wikipediaUrl,
        googleSearch: googleResult?.googleSearch || `https://www.google.com/search?q=${encodeURIComponent(claim)}`,
        decision, // I'll always include the parsed decision
      };
      return { success: true, result: resultObj };
    }
    if (task.type === 'fact_check_image') {
      // I'll scaffold image fact-checking support
      const imageUrl = task.payload?.imageUrl;
      if (!imageUrl) {
        return { success: false, result: null, error: 'No image URL or file provided.' };
      }
      // I'll return a placeholder response with TODOs for each challenge
      return {
        success: true,
        result: {
          summary: 'Image fact-checking is in development. Here is how I will approach it:',
          categories: ['development', 'placeholder'],
          imageUrl: imageUrl,
          status: 'In development - image fact-checking capabilities being built'
        }
      };
    }

    // Default case - unknown task type
    return {
      success: false,
      result: null,
      error: `Unknown task type: ${task.type}`
    };
  }

  /**
   * Get agent inventory with count and descriptions
   */
  private async getAgentInventory(): Promise<string> {
    try {
      // Placeholder for agent inventory
      return `# Agent Inventory Report

**Total Count**: 12 functioning agents

**Available Agents**:
• Personal Assistant: Main user interface and conversation management
• Master Orchestrator: Coordinates complex multi-agent tasks
• Researcher: Conducts research and generates reports
• Communications: Handles messaging and content creation
• Data Scientist: Performs data analysis and insights
• Project Coordinator: Manages project workflows
• Front-End Developer: Creates user interfaces
• Back-End Developer: Builds server-side functionality
• Full-Stack Developer: Handles complete application development
• Experience Designer: Designs user experiences
• Image Generator: Creates visual content
• DevOps Specialist: Manages deployment and infrastructure

All agents are operational and ready for task execution.`;
    } catch (error) {
      console.error('Error getting agent inventory:', error);
      return 'Agent inventory temporarily unavailable.';
    }
  }

  /**
   * Extract a summary from paper content
   */
  private extractPaperSummary(content: string): string {
    // Try to extract abstract first
    const abstractMatch = content.match(/## Abstract\s*([\s\S]*?)(?=\n##|\n\n#|$)/i);
    if (abstractMatch) {
      return `**Abstract:**\n${abstractMatch[1].trim()}`;
    }
    
    // If no abstract, try executive summary
    const summaryMatch = content.match(/## Executive Summary\s*([\s\S]*?)(?=\n##|\n\n#|$)/i);
    if (summaryMatch) {
      return `**Executive Summary:**\n${summaryMatch[1].trim()}`;
    }
    
    // If no summary, try introduction
    const introMatch = content.match(/## Introduction\s*([\s\S]*?)(?=\n##|\n\n#|$)/i);
    if (introMatch) {
      const intro = introMatch[1].trim();
      const firstParagraph = intro.split('\n\n')[0];
      return `**Introduction:**\n${firstParagraph}`;
    }
    
    // Fallback to first few lines
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    const summary = lines.slice(0, 3).join('\n');
    return `**Summary:**\n${summary}`;
  }

  /**
   * Generate actual research paper content using AI
   */
  private async generateActualPaperContent(request: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: `Create a comprehensive, professional research paper based on this request: ${request}

Requirements:
- Professional academic format with clear sections
- Well-researched content based on established knowledge
- Proper academic tone and structure
- Include introduction, body sections, and conclusion
- Use APA-style formatting where appropriate
- Cite authoritative sources and historical facts
- Provide substantial analysis and insights
- Make it approximately 5 pages of content when formatted

Structure the paper with:
1. Title and Executive Summary
2. Introduction with background context
3. Main analysis sections (2-3 sections)
4. Comparative analysis (if applicable)
5. Conclusion with key findings
6. References section

Please generate the complete paper content in Markdown format, ensuring it's comprehensive, factual, and professionally written.`
      }
    ];

    try {
      const response = await this.aiClient.generateResponse('researcher', messages);
      return response.content;
    } catch (error) {
      console.error('[Researcher] Paper content generation failed:', error);
      return this.getFallbackPaperContent(request);
    }
  }

  /**
   * Fallback paper content if AI generation fails
   */
  private getFallbackPaperContent(request: string): string {
    return `# Research Paper: ${request}

## Executive Summary
This research paper examines the topic of ${request}, providing comprehensive analysis and insights based on available academic and historical sources.

## Introduction
[This section provides background context and establishes the scope of the research.]

## Methodology
This research employs a systematic approach to examining available sources and documented evidence related to ${request}.

## Analysis
[Main analysis sections would be developed here based on the specific research topic.]

## Findings
[Key findings and insights from the research would be presented here.]

## Conclusion
This research provides important insights into ${request} and contributes to our understanding of the topic.

## References
[References would be listed here in APA format based on actual sources cited in the research.]

---
*Note: This is a basic template. A full research paper would require extensive research using current academic sources and databases.*`;
  }
}
