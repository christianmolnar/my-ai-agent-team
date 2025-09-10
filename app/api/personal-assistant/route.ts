import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../agents/PersonalAssistantAgent';

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Transform conversation history to the expected format
    const conversationContext = conversationHistory ? {
      history: conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
        timestamp: new Date() // Use current time since we don't have timestamps from frontend
      })),
      currentContext: `User is continuing a conversation about: ${message}`
    } : undefined;
    
    // Process the conversation with history context
    const response = await assistant.handleUserConversation(message, conversationContext);
    
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
