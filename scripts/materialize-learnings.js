#!/usr/bin/env node

/**
 * Script to materialize internalized learnings into actual CNS files
 * This resolves the issue where learnings are marked as "internalized" but no files are created
 */

const { LearningProcessor } = require('../lib/learning-processor.js');

async function main() {
  console.log('🧠 Starting Learning Materialization Process...\n');
  
  try {
    const result = await LearningProcessor.processPendingLearnings();
    
    console.log('📊 Processing Results:');
    console.log(`✅ Processed: ${result.processed} learning(s)`);
    console.log(`📁 Created: ${result.created.length} file(s)`);
    console.log(`📝 Updated: ${result.updated.length} learning file(s)`);
    console.log(`❌ Errors: ${result.errors.length}`);
    
    if (result.created.length > 0) {
      console.log('\n📁 Files Created:');
      result.created.forEach(file => console.log(`   - ${file}`));
    }
    
    if (result.updated.length > 0) {
      console.log('\n📝 Files Updated:');
      result.updated.forEach(file => console.log(`   - ${file}`));
    }
    
    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach(error => console.log(`   - ${error}`));
    }
    
    if (result.processed === 0) {
      console.log('\n🎯 No internalized learnings found that need materialization.');
      console.log('   All learnings are already properly materialized into CNS files.');
    } else {
      console.log('\n🎉 Learning materialization complete!');
      console.log('   Internalized learnings now have physical CNS files created.');
    }
    
  } catch (error) {
    console.error('💥 Error during learning materialization:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (require.main === module) {
  main();
}
