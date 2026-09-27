import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../agents/PersonalAssistantAgent';

export async function POST(req: NextRequest) {
  try {
    const { message, context, userName } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Transform context if provided
    let conversationContext;
    if (context && Array.isArray(context)) {
      conversationContext = {
        history: context.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date()
        })),
        currentContext: 'continuing-conversation'
      };
      console.log(`🔍 Context provided: ${context.length} messages, transformed to conversationContext`);
    } else {
      console.log(`🔍 No context provided or invalid format`);
    }
    
        // Process the conversation with context if provided
    const response = await assistant.handleUserConversation(message, conversationContext, userName);
    
    return NextResponse.json({
      success: true,
      response: response.response,
      conversationType: response.conversationType,
      suggestedFollowUps: response.suggestedFollowUps,
      involvedAgents: response.involvedAgents,
      deliverables: response.deliverables
    });
    
  } catch (error) {
    console.error('Personal Assistant API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message', details: error.message }, 
      { status: 500 }
    );
  }
}
