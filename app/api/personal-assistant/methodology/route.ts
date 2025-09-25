import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../../agents/personal-assistant';

export async function POST(req: NextRequest) {
  try {
    const { area, improvement, action } = await req.json();
    
    if (!area || !improvement || typeof area !== 'string' || typeof improvement !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid area or improvement. Both must be strings' 
      }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Determine if this is a removal request
    const isRemovalRequest = action === 'remove' || 
      improvement.toLowerCase().includes('forget') ||
      improvement.toLowerCase().includes('stop') ||
      improvement.toLowerCase().includes('don\'t') ||
      improvement.toLowerCase().includes('remove') ||
      improvement.toLowerCase().includes('eliminate');
    
    let result;
    let response: any;
    
    if (isRemovalRequest) {
      // Handle behavior removal
      result = await assistant.learningSystem.removeBehavior(`${area}: ${improvement}`);
      
      response = {
        success: result.success,
        message: `Behavior removal processed for area: ${area}`,
        area,
        improvement,
        action: 'remove',
        removedBehaviors: result.removedBehaviors || [],
        conflictsDetected: result.conflictsDetected || [],
        filesModified: result.filesModified || [],
        learningId: result.learningId // Include learning ID for feedback UI
      };

      // Include detailed removal report in development mode
      if (result.detailedRemovalReport && (process.env.DEVELOPMENT_MODE === 'true' || process.env.LEARNING_FEEDBACK_ENABLED === 'true')) {
        response.removalReport = result.detailedRemovalReport;
      }
    } else {
      // Handle normal behavior learning
      result = await assistant.learningSystem.teachNewBehavior(`${area}: ${improvement}`);
      
      response = {
        success: result.success,
        message: `Methodology updated for area: ${area}`,
        area,
        improvement,
        action: 'learn',
        updatedCapabilities: result.updatedCapabilities || [],
        learningId: result.learningId // Include learning ID for feedback UI
      };

      // Include detailed learning report in development mode
      if (result.detailedLearningReport && (process.env.DEVELOPMENT_MODE === 'true' || process.env.LEARNING_FEEDBACK_ENABLED === 'true')) {
        response.learningReport = result.detailedLearningReport;
      }
    }

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Personal Assistant Methodology API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process methodology request', details: error.message }, 
      { status: 500 }
    );
  }
}
