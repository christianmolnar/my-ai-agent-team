#!/usr/bin/env node

/**
 * Learning History Cleanup Utility
 * Permanently removes problematic learnings from the learning history
 */

const fs = require('fs');
const path = require('path');

class LearningCleanup {
  constructor() {
    this.learningHistoryPath = path.join(process.cwd(), 'data', 'learning', 'learning-history.jsonl');
    this.backupPath = path.join(process.cwd(), 'data', 'learning', 'backups');
  }

  /**
   * Identify problems with a learning entry
   */
  identifyProblems(learning) {
    const problems = [];

    // Problem 1: Pending learnings with no files modified (should have been materialized)
    if (learning.status === 'pending' && 
        (!learning.filesModified || learning.filesModified.length === 0) &&
        learning.claudeAnalysis) {
      problems.push('Pending learning with no materialized files');
    }

    // Problem 2: remove_behavior learnings (incompatible with current system)
    if (learning.learningType === 'remove_behavior') {
      problems.push('Legacy remove_behavior type (incompatible with new system)');
    }

    // Problem 3: Missing required fields
    if (!learning.id || !learning.timestamp || !learning.status) {
      problems.push('Missing required fields');
    }

    return problems;
  }

  /**
   * Permanently remove problematic learnings
   */
  async cleanupProblematicLearnings() {
    console.log('🔍 Analyzing learning history...');
    
    try {
      const data = fs.readFileSync(this.learningHistoryPath, 'utf8');
      const lines = data.trim().split('\n').filter(line => line.trim());
      
      console.log(`Total learnings: ${lines.length}`);
      
      const problematicLearnings = [];
      const validLearnings = [];
      
      for (const line of lines) {
        try {
          const learning = JSON.parse(line);
          const problems = this.identifyProblems(learning);
          
          if (problems.length > 0) {
            problematicLearnings.push({ learning, problems });
            console.log(`❌ Problematic: ${learning.id} - ${problems.join(', ')}`);
          } else {
            validLearnings.push(line);
            console.log(`✅ Valid: ${learning.id} - Status: ${learning.status}, Files: ${(learning.filesModified || []).length}`);
          }
        } catch (parseError) {
          console.log(`❌ Parse Error: Invalid JSON in learning history`);
        }
      }
      
      if (problematicLearnings.length === 0) {
        console.log('✅ No problematic learnings found');
        return { removed: 0 };
      }

      // Create backup
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupPath, `learning-history-backup-${timestamp}.jsonl`);
      fs.mkdirSync(this.backupPath, { recursive: true });
      fs.copyFileSync(this.learningHistoryPath, backupFile);
      console.log(`📋 Backup created: ${backupFile}`);

      // Write cleaned learning history
      const cleanedContent = validLearnings.join('\n') + (validLearnings.length > 0 ? '\n' : '');
      fs.writeFileSync(this.learningHistoryPath, cleanedContent);

      console.log(`✅ Cleanup complete: Removed ${problematicLearnings.length} problematic learnings`);
      return { removed: problematicLearnings.length, backup: backupFile };
      
    } catch (error) {
      throw new Error(`Failed to cleanup learning history: ${error.message}`);
    }
  }
}

// Export for module use
module.exports = { LearningCleanup };

// CLI usage
if (require.main === module) {
  const cleanup = new LearningCleanup();
  cleanup.cleanupProblematicLearnings()
    .then(result => {
      if (result.removed > 0) {
        console.log(`🎯 Permanently deleted ${result.removed} problematic learnings`);
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    });
}
