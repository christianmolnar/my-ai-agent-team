import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';

const ALERTS_FILE = path.join(process.cwd(), 'logs', 'alert-config.json');

interface AlertConfig {
  slackWebhook?: string;
  emailEndpoint?: string;
  discordWebhook?: string;
  execNotificationThreshold: number;
}

export async function GET() {
  try {
    const data = await readFile(ALERTS_FILE, 'utf8');
    const config = JSON.parse(data);
    
    // Don't return sensitive webhook URLs in full
    const safeConfig = {
      ...config,
      slackWebhook: config.slackWebhook ? '***CONFIGURED***' : undefined,
      discordWebhook: config.discordWebhook ? '***CONFIGURED***' : undefined,
      emailEndpoint: config.emailEndpoint ? '***CONFIGURED***' : undefined,
    };
    
    return NextResponse.json(safeConfig);
  } catch (error) {
    // Return default config
    return NextResponse.json({
      execNotificationThreshold: 3,
      slackWebhook: undefined,
      emailEndpoint: undefined,
      discordWebhook: undefined,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const config: AlertConfig = {
      execNotificationThreshold: body.execNotificationThreshold || 3,
      slackWebhook: body.slackWebhook || undefined,
      emailEndpoint: body.emailEndpoint || undefined,
      discordWebhook: body.discordWebhook || undefined,
    };

    // Validate threshold
    if (config.execNotificationThreshold < 1 || config.execNotificationThreshold > 10) {
      return NextResponse.json(
        { error: 'execNotificationThreshold must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Test webhook URLs if provided
    const validationResults: any = {};

    if (config.slackWebhook) {
      const testResult = await testSlackWebhook(config.slackWebhook);
      validationResults.slack = testResult;
      if (!testResult.success) {
        return NextResponse.json(
          { error: 'Slack webhook test failed', details: testResult },
          { status: 400 }
        );
      }
    }

    if (config.discordWebhook) {
      const testResult = await testDiscordWebhook(config.discordWebhook);
      validationResults.discord = testResult;
      if (!testResult.success) {
        return NextResponse.json(
          { error: 'Discord webhook test failed', details: testResult },
          { status: 400 }
        );
      }
    }

    // Save configuration
    await writeFile(ALERTS_FILE, JSON.stringify(config, null, 2));

    return NextResponse.json({
      message: 'Alert configuration updated successfully',
      validationResults,
    });

  } catch (error) {
    console.error('Error updating alert config:', error);
    return NextResponse.json(
      { error: 'Failed to update alert configuration' },
      { status: 500 }
    );
  }
}

async function testSlackWebhook(webhook: string): Promise<{ success: boolean; message: string }> {
  try {
    const testMessage = {
      text: '✅ AI Agent Team - Alert Configuration Test',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*Test Message*\nYour Slack webhook is configured correctly! You will receive executive alerts when API keys fail repeatedly.'
          }
        }
      ]
    };

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage),
    });

    if (response.ok) {
      return { success: true, message: 'Slack webhook test successful' };
    } else {
      return { success: false, message: `Slack webhook test failed: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, message: `Slack webhook test error: ${error}` };
  }
}

async function testDiscordWebhook(webhook: string): Promise<{ success: boolean; message: string }> {
  try {
    const testMessage = {
      content: '✅ **AI Agent Team - Alert Configuration Test**',
      embeds: [
        {
          title: 'Test Message',
          description: 'Your Discord webhook is configured correctly! You will receive executive alerts when API keys fail repeatedly.',
          color: 0x00ff00, // Green color for success
          timestamp: new Date().toISOString(),
        }
      ]
    };

    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testMessage),
    });

    if (response.ok) {
      return { success: true, message: 'Discord webhook test successful' };
    } else {
      return { success: false, message: `Discord webhook test failed: ${response.statusText}` };
    }
  } catch (error) {
    return { success: false, message: `Discord webhook test error: ${error}` };
  }
}
