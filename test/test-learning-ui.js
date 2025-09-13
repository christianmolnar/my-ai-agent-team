// Test script to verify learning system UI changes
async function testLearningSystem() {
    console.log('Testing Learning System UI Changes...');
    
    // Test API endpoint directly
    try {
        const response = await fetch('/api/learning-management?action=history&limit=10');
        const data = await response.json();
        console.log('Learning History Data:', data);
        
        if (data.success && data.data) {
            const pending = data.data.filter(item => item.status === 'pending');
            const internalized = data.data.filter(item => item.status === 'internalized');
            const reverted = data.data.filter(item => item.status === 'reverted');
            
            console.log('Status Distribution:');
            console.log(`- Pending: ${pending.length}`);
            console.log(`- Internalized: ${internalized.length}`);
            console.log(`- Reverted: ${reverted.length}`);
            
            // Test status filtering logic
            const active = data.data.filter(item => 
                item.status === 'pending' || item.status === 'internalized'
            );
            console.log(`- Active (Pending + Internalized): ${active.length}`);
        }
        
        return data;
    } catch (error) {
        console.error('Failed to test learning system:', error);
        return null;
    }
}

// Run the test
testLearningSystem();
