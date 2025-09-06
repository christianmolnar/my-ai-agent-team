import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../agents/PersonalAssistantAgent';

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Process the conversation
    const response = await assistant.handleUserConversation(message);
    
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
