/**
 * Test Orchestration API Route
 * Simple endpoint to test multi-agent orchestration and interaction logging
 */

import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../agents/PersonalAssistantAgent';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Message is required'
      }, { status: 400 });
    }

    // Create personal assistant agent
    const personalAssistant = new PersonalAssistantAgent();

    // Handle the user conversation (this should trigger orchestration for complex requests)
    const response = await personalAssistant.handleUserConversation(message);

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Test orchestration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to process orchestration test'
    }, { status: 500 });
  }
}
