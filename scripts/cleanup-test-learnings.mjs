/**
 * Cleanup script to remove test learnings from the system
 */

const API_BASE = 'http://localhost:3002';

async function cleanupTestLearnings() {
    console.log('🧹 Starting cleanup of test learnings...');
    
    try {
        // Get current learning history
        const response = await fetch(`${API_BASE}/api/learning-management?action=history&limit=100`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(`Failed to fetch learning history: ${data.error}`);
        }
        
        const testLearnings = data.data.filter(learning => 
            learning.description.includes('Test learning') ||
            learning.description.includes('Test remove behavior') ||
            learning.description.includes('Test pending learning') ||
            learning.description.includes('test_')
        );
        
        console.log(`Found ${testLearnings.length} test learnings to remove:`);
        testLearnings.forEach(learning => {
            console.log(`- ${learning.id}: ${learning.description}`);
        });
        
        // Remove each test learning using 'feedback' with 'forget' action
        for (const learning of testLearnings) {
            console.log(`Forgetting: ${learning.id}`);
            
            const forgetResponse = await fetch(`${API_BASE}/api/learning-management`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'feedback',
                    learningId: learning.id,
                    feedback: {
                        action: 'forget',
                        rating: 1,
                        comments: 'Automated cleanup of test learning',
                        wasHelpful: false
                    }
                })
            });
            
            const forgetResult = await forgetResponse.json();
            if (forgetResult.success) {
                console.log(`✅ Forgot: ${learning.id}`);
            } else {
                console.log(`❌ Failed to forget ${learning.id}: ${forgetResult.error}`);
            }
        }
        
        console.log('🎉 Cleanup completed!');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
    }
}

// Run if called directly
if (typeof window === 'undefined') {
    cleanupTestLearnings();
}

export default cleanupTestLearnings;
