import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../../agents/PersonalAssistantAgent';

export async function POST(req: NextRequest) {
  try {
    const { feedback, context, sessionId, userMessage, agentResponse } = await req.json();
    
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Process the feedback for learning
    const learningResult = await assistant.processUserFeedback(feedback, {
      sessionId: sessionId || `session-${Date.now()}`,
      userMessage: userMessage || 'N/A',
      agentResponse: agentResponse || 'N/A',
      context: context || {}
    });
    
    return NextResponse.json({
      success: learningResult.success,
      message: 'Feedback processed and learned from successfully',
      learningDetails: {
        changes: learningResult.changes,
        appliedTo: learningResult.analysis,
        confidenceBoost: 'Moderate improvement in similar contexts',
        updatedFiles: learningResult.updatedFiles
      }
    });
    
  } catch (error) {
    console.error('Personal Assistant Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback', details: error.message }, 
      { status: 500 }
    );
  }
}
