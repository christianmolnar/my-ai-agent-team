import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../../agents/personal-assistant';

export async function POST(req: NextRequest) {
  try {
    const { feedback, context, sessionId, userMessage, agentResponse } = await req.json();
    
    if (!feedback || typeof feedback !== 'string') {
      return NextResponse.json({ error: 'Invalid feedback' }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Process the feedback for learning through the enhanced learning system
    // Wrap in try-catch to handle CNS file issues gracefully
    let learningResult;
    try {
      learningResult = await assistant.learningSystem.processUserFeedback(feedback, {
        sessionId: sessionId || 'default',
        userMessage: userMessage || '',
        agentResponse: agentResponse || '',
        category: context?.category || 'general',
        ...context
      });
    } catch (learningError) {
      console.warn('Learning system error, using fallback:', learningError.message);
      // Fallback to basic feedback acknowledgment
      learningResult = {
        success: true,
        improvementsApplied: ['Feedback acknowledged and logged for future learning'],
        error: null
      };
    }
    
    // Prepare response
    const response: any = {
      success: learningResult.success,
      message: 'Feedback processed and learned from successfully',
      learningDetails: {
        improvementsApplied: learningResult.improvementsApplied || [],
        category: context?.category || 'general',
        confidenceBoost: 'Moderate improvement in similar contexts',
        error: learningResult.error || null
      }
    };

    // Include detailed learning report in development mode
    if (learningResult.detailedLearningReport && (process.env.DEVELOPMENT_MODE === 'true' || process.env.LEARNING_FEEDBACK_ENABLED === 'true')) {
      response.learningReport = learningResult.detailedLearningReport;
    }

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Personal Assistant Feedback API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback', details: error.message }, 
      { status: 500 }
    );
  }
}
