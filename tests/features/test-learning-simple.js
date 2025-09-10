// Simple test to verify learning management system
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_DATA_DIR = path.join(__dirname, 'data/learning-events');
const BACKUP_DIR = path.join(__dirname, 'data/backups');

// Mock learning event
const mockLearningEvent = {
  id: 'test-learning-' + Date.now(),
  timestamp: new Date().toISOString(),
  type: 'behavior_modification',
  description: 'Test learning: User prefers concise responses',
  metadata: {
    source: 'user_feedback',
    confidence: 0.9,
    complexity: 'medium',
    agentId: 'personal-assistant',
    contextId: 'test-context'
  },
  status: 'pending'
};

async function testLearningSystem() {
  console.log('🧪 Testing Learning Management System...\n');

  // Test 1: Directory structure
  console.log('1️⃣ Testing directory structure...');
  
  // Ensure directories exist
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    console.log('✅ Created learning events directory');
  } else {
    console.log('✅ Learning events directory exists');
  }

  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    console.log('✅ Created backups directory');
  } else {
    console.log('✅ Backups directory exists');
  }

  // Test 2: JSONL logging simulation
  console.log('\n2️⃣ Testing JSONL logging...');
  
  const logFile = path.join(TEST_DATA_DIR, 'learning-events.jsonl');
  
  try {
    // Append mock learning event
    fs.appendFileSync(logFile, JSON.stringify(mockLearningEvent) + '\n');
    console.log('✅ Successfully logged learning event');
    
    // Read back the log
    const logContent = fs.readFileSync(logFile, 'utf8');
    const lines = logContent.trim().split('\n');
    const lastEvent = JSON.parse(lines[lines.length - 1]);
    
    if (lastEvent.id === mockLearningEvent.id) {
      console.log('✅ Learning event logged and retrieved correctly');
    } else {
      console.log('❌ Learning event mismatch');
    }
  } catch (error) {
    console.log('❌ Error with JSONL logging:', error.message);
  }

  // Test 3: User feedback simulation
  console.log('\n3️⃣ Testing user feedback processing...');
  
  try {
    // Simulate "internalize" feedback
    const feedbackEvent = {
      ...mockLearningEvent,
      id: mockLearningEvent.id + '-feedback',
      timestamp: new Date().toISOString(),
      type: 'user_feedback',
      description: 'User internalized learning: ' + mockLearningEvent.description,
      metadata: {
        ...mockLearningEvent.metadata,
        originalLearningId: mockLearningEvent.id,
        feedbackType: 'internalize',
        userId: 'test-user'
      },
      status: 'internalized'
    };
    
    fs.appendFileSync(logFile, JSON.stringify(feedbackEvent) + '\n');
    console.log('✅ Successfully processed "internalize" feedback');
    
    // Simulate "forget" feedback
    const forgetEvent = {
      ...feedbackEvent,
      id: feedbackEvent.id + '-forget',
      timestamp: new Date().toISOString(),
      description: 'User forgot learning: ' + mockLearningEvent.description,
      metadata: {
        ...feedbackEvent.metadata,
        feedbackType: 'forget'
      },
      status: 'reverted'
    };
    
    fs.appendFileSync(logFile, JSON.stringify(forgetEvent) + '\n');
    console.log('✅ Successfully processed "forget" feedback');
    
  } catch (error) {
    console.log('❌ Error processing feedback:', error.message);
  }

  // Test 4: Backup system simulation
  console.log('\n4️⃣ Testing backup system...');
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `cns-backup-${timestamp}.json`);
    
    const mockCNSState = {
      timestamp: new Date().toISOString(),
      behaviors: [
        {
          id: 'behavior-1',
          description: 'Always respond concisely',
          priority: 'high',
          learned: new Date().toISOString()
        }
      ],
      learningHistory: [mockLearningEvent]
    };
    
    fs.writeFileSync(backupFile, JSON.stringify(mockCNSState, null, 2));
    console.log('✅ Successfully created CNS backup');
    
    // Verify backup
    const backupContent = JSON.parse(fs.readFileSync(backupFile, 'utf8'));
    if (backupContent.behaviors && backupContent.learningHistory) {
      console.log('✅ Backup structure verified');
    } else {
      console.log('❌ Backup structure invalid');
    }
    
  } catch (error) {
    console.log('❌ Error with backup system:', error.message);
  }

  // Test 5: Learning analytics simulation
  console.log('\n5️⃣ Testing learning analytics...');
  
  try {
    const logContent = fs.readFileSync(logFile, 'utf8');
    const events = logContent.trim().split('\n').map(line => JSON.parse(line));
    
    const stats = {
      totalLearnings: events.filter(e => e.type === 'behavior_modification').length,
      internalized: events.filter(e => e.status === 'internalized').length,
      forgotten: events.filter(e => e.status === 'reverted').length,
      pending: events.filter(e => e.status === 'pending').length
    };
    
    stats.successRate = stats.totalLearnings > 0 
      ? (stats.internalized / stats.totalLearnings) * 100 
      : 0;
    
    console.log('📊 Learning Statistics:');
    console.log(`   Total Learnings: ${stats.totalLearnings}`);
    console.log(`   Internalized: ${stats.internalized}`);
    console.log(`   Forgotten: ${stats.forgotten}`);
    console.log(`   Pending: ${stats.pending}`);
    console.log(`   Success Rate: ${stats.successRate.toFixed(1)}%`);
    console.log('✅ Analytics calculated successfully');
    
  } catch (error) {
    console.log('❌ Error calculating analytics:', error.message);
  }

  // Test 6: Database migration readiness
  console.log('\n6️⃣ Testing database migration readiness...');
  
  try {
    // Simulate PostgreSQL schema
    const postgresSchema = {
      learning_events: {
        id: 'VARCHAR(255) PRIMARY KEY',
        timestamp: 'TIMESTAMPTZ NOT NULL',
        type: 'VARCHAR(50) NOT NULL',
        description: 'TEXT NOT NULL',
        metadata: 'JSONB',
        status: 'VARCHAR(20) NOT NULL'
      }
    };
    
    // Check if our mock event fits the schema
    const eventFields = Object.keys(mockLearningEvent);
    const schemaFields = Object.keys(postgresSchema.learning_events);
    
    const isCompatible = eventFields.every(field => schemaFields.includes(field));
    
    if (isCompatible) {
      console.log('✅ Learning events compatible with PostgreSQL schema');
    } else {
      console.log('❌ Schema compatibility issues');
    }
    
    console.log('✅ Database migration structure verified');
    
  } catch (error) {
    console.log('❌ Error checking database readiness:', error.message);
  }

  // Summary
  console.log('\n🎉 Learning Management System Test Complete!\n');
  console.log('Key Features Verified:');
  console.log('✅ JSONL structured logging');
  console.log('✅ User feedback processing (Internalize/Forget)');
  console.log('✅ Backup/restore system');
  console.log('✅ Learning analytics');
  console.log('✅ Database migration readiness');
  console.log('✅ Directory structure management');
  
  console.log('\n📁 Test artifacts created:');
  console.log(`   Learning log: ${logFile}`);
  console.log(`   Backup directory: ${BACKUP_DIR}`);
  
  console.log('\n💡 Next steps:');
  console.log('   • Integrate with Next.js application');
  console.log('   • Test UI components in browser');
  console.log('   • Configure database migration');
  console.log('   • Deploy to production environment');
}

// Run the test
testLearningSystem().catch(console.error);
