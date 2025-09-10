/**
 * Learning Management API Routes
 * RESTful endpoints for learning tracking, user feedback, and rollback operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { learningTracker } from '../../../lib/learning-tracker';
import { UserFeedback } from '../../../types/learning-tracking';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'history':
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const history = learningTracker.getLearningHistory(limit);
        return NextResponse.json({ success: true, data: history });

      case 'stats':
        const stats = learningTracker.getLearningStats();
        return NextResponse.json({ success: true, data: stats });

      case 'search':
        const query = searchParams.get('query') || '';
        const status = searchParams.get('status') as any;
        const area = searchParams.get('area');
        const complexity = searchParams.get('complexity') as any;
        
        const filters: any = {};
        if (status) filters.status = status;
        if (area) filters.area = area;
        if (complexity) filters.complexity = complexity;

        const searchResults = learningTracker.searchLearningHistory(query, filters);
        return NextResponse.json({ success: true, data: searchResults });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: history, stats, search'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Learning Management GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to retrieve learning data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, learningId, ...data } = body;

    switch (action) {
      case 'feedback':
        if (!learningId || !data.feedback) {
          return NextResponse.json({
            success: false,
            error: 'learningId and feedback are required'
          }, { status: 400 });
        }

        const feedback: UserFeedback = {
          action: data.feedback.action,
          timestamp: new Date(),
          rating: data.feedback.rating,
          comments: data.feedback.comments,
          wasHelpful: data.feedback.wasHelpful,
          improvementSuggestions: data.feedback.improvementSuggestions
        };

        const feedbackSuccess = await learningTracker.processFeedback(learningId, feedback);
        
        if (feedbackSuccess) {
          return NextResponse.json({
            success: true,
            message: `Learning ${feedback.action === 'internalize' ? 'internalized' : 'forgotten'} successfully`,
            data: {
              learningId,
              action: feedback.action,
              timestamp: feedback.timestamp
            }
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Failed to process feedback'
          }, { status: 500 });
        }

      case 'rollback':
        if (!learningId || !data.reason) {
          return NextResponse.json({
            success: false,
            error: 'learningId and reason are required'
          }, { status: 400 });
        }

        const rollbackSuccess = await learningTracker.rollbackLearning(learningId, data.reason);
        
        if (rollbackSuccess) {
          return NextResponse.json({
            success: true,
            message: 'Learning rolled back successfully',
            data: {
              learningId,
              reason: data.reason,
              timestamp: new Date()
            }
          });
        } else {
          return NextResponse.json({
            success: false,
            error: 'Failed to rollback learning'
          }, { status: 500 });
        }

      case 'log':
        // Create new learning log entry
        const learningEvent = {
          agentType: data.agentType || 'personal-assistant',
          userId: data.userId,
          sessionId: data.sessionId,
          learningType: data.learningType,
          description: data.description,
          area: data.area,
          complexity: data.complexity || 'moderate',
          filesModified: data.filesModified || [],
          changesApplied: data.changesApplied || [],
          claudeAnalysis: data.claudeAnalysis,
          conflictsDetected: data.conflictsDetected,
          removalStrategy: data.removalStrategy
        };

        const newLearningId = await learningTracker.logLearningEvent(learningEvent);
        
        return NextResponse.json({
          success: true,
          message: 'Learning event logged successfully',
          data: {
            learningId: newLearningId,
            timestamp: new Date()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Supported actions: feedback, rollback, log'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Learning Management POST Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process learning management request'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const learningId = searchParams.get('learningId');
  const reason = searchParams.get('reason');

  if (!learningId || !reason) {
    return NextResponse.json({
      success: false,
      error: 'learningId and reason are required'
    }, { status: 400 });
  }

  try {
    const rollbackSuccess = await learningTracker.rollbackLearning(learningId, reason);
    
    if (rollbackSuccess) {
      return NextResponse.json({
        success: true,
        message: 'Learning deleted and rolled back successfully',
        data: {
          learningId,
          reason,
          timestamp: new Date()
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to delete and rollback learning'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Learning Management DELETE Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete learning'
    }, { status: 500 });
  }
}
