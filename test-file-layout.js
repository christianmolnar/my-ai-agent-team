#!/usr/bin/env node

/**
 * Test script to add learning entries with files to demonstrate the new layout
 */

const BASE_URL = 'http://localhost:3000';

async function addTestLearningWithFiles() {
  console.log('🧪 Adding test learning entries with files...\n');

  const testEntries = [
    {
      description: "Enhanced file processing with improved error handling",
      filesModified: [
        "lib/fileProcessor.ts",
        "utils/errorHandler.js", 
        "components/FileUpload.tsx",
        "types/FileTypes.ts",
        "api/processFile.ts",
        "config/fileConfig.json",
        "services/FileService.ts",
        "hooks/useFileUpload.ts"
      ]
    },
    {
      description: "Updated authentication system with OAuth integration", 
      filesModified: [
        "auth/OAuthProvider.tsx",
        "lib/authService.js",
        "middleware/authMiddleware.ts"
      ]
    },
    {
      description: "Added comprehensive logging and monitoring capabilities",
      filesModified: [
        "lib/logger.ts",
        "monitoring/metrics.js"
      ]
    },
    {
      description: "Implemented real-time notifications and WebSocket support",
      filesModified: [
        "websocket/NotificationService.ts",
        "components/NotificationPanel.tsx", 
        "hooks/useWebSocket.ts",
        "api/notifications.ts",
        "types/NotificationTypes.ts"
      ]
    }
  ];

  for (let i = 0; i < testEntries.length; i++) {
    const entry = testEntries[i];
    console.log(`➕ Adding entry ${i + 1}: ${entry.description}`);
    
    try {
      const response = await fetch(`${BASE_URL}/api/learning-management`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_learning',
          learning: {
            id: `test_learning_files_${Date.now()}_${i}`,
            timestamp: new Date().toISOString(),
            type: 'behavior_modification',
            description: entry.description,
            details: `Test entry ${i + 1} with ${entry.filesModified.length} files modified`,
            status: 'pending',
            filesModified: entry.filesModified,
            context: `Test learning entry to demonstrate file layout - Entry ${i + 1}`,
            userRequest: `Test request ${i + 1}`,
            agentResponse: `Test response with file modifications - ${entry.filesModified.length} files affected`
          }
        })
      });

      if (response.ok) {
        console.log(`✅ Added successfully (${entry.filesModified.length} files)`);
      } else {
        const errorText = await response.text();
        console.log(`❌ Failed to add: ${errorText}`);
      }
    } catch (error) {
      console.log(`❌ Error adding entry: ${error.message}`);
    }
  }

  console.log('\n🎉 Test entries added! Visit http://localhost:3000 and check the Learning Management section.');
  console.log('👀 Look for:');
  console.log('   • 2-column file layout (max 6 files visible)');
  console.log('   • "+X more" indicator for entries with >6 files'); 
  console.log('   • Compact row design with files in center column');
  console.log('   • Action buttons on the right side');
}

// Check if we can make the API call
if (typeof fetch === 'undefined') {
  // Node.js environment, need to import fetch
  import('node-fetch').then(fetch => {
    global.fetch = fetch.default;
    addTestLearningWithFiles();
  }).catch(() => {
    console.log('📦 Installing node-fetch...');
    require('child_process').execSync('npm install node-fetch', { stdio: 'inherit' });
    global.fetch = require('node-fetch');
    addTestLearningWithFiles();
  });
} else {
  addTestLearningWithFiles();
}
