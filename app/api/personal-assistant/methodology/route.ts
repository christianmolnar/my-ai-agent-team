import { NextRequest, NextResponse } from 'next/server';
import { PersonalAssistantAgent } from '../../../../agents/PersonalAssistantAgent';

export async function POST(req: NextRequest) {
  try {
    const { area, improvement } = await req.json();
    
    if (!area || !improvement || typeof area !== 'string' || typeof improvement !== 'string') {
      return NextResponse.json({ 
        error: 'Invalid area or improvement. Both must be strings' 
      }, { status: 400 });
    }
    
    // Initialize Personal Assistant
    const assistant = new PersonalAssistantAgent();
    
    // Update methodology
    await assistant.updateOwnMethodology(area, improvement);
    
    return NextResponse.json({
      success: true,
      message: `Methodology updated for area: ${area}`,
      area,
      improvement
    });
    
  } catch (error) {
    console.error('Personal Assistant Methodology Update API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update methodology', details: error.message }, 
      { status: 500 }
    );
  }
}
