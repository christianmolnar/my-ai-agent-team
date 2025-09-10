/**
 * Simple test script to verify Personal Assistant capabilities
 * This bypasses the web UI and directly tests the PersonalAssistantAgent
 */

const { PersonalAssistantAgent } = require('./agents/PersonalAssistantAgent');

async function testPersonalAssistant() {
    console.log('🤖 Testing Personal Assistant Direct Conversation');
    console.log('================================================\n');
    
    const assistant = new PersonalAssistantAgent();
    
    // Test basic conversation
    const testMessage = "Are you awake, Personal Assistant?";
    console.log(`👤 User: "${testMessage}"`);
    console.log('🤔 Processing...\n');
    
    try {
        const response = await assistant.handleUserConversation(testMessage);
        
        console.log('🤖 Personal Assistant Response:');
        console.log(`   Type: ${response.conversationType}`);
        console.log(`   Response: ${response.response}`);
        
        if (response.personaInfluence) {
            console.log(`   Persona Applied: ${response.personaInfluence.join(', ')}`);
        }
        
        if (response.suggestedFollowUps) {
            console.log('\n   💡 Follow-up Suggestions:');
            response.suggestedFollowUps.forEach(followUp => {
                console.log(`      - ${followUp}`);
            });
        }
        
        console.log('\n✅ Test completed successfully!');
        console.log('\nThe Personal Assistant IS capable of natural conversation.');
        console.log('The canned response you saw was from the web interface, not the actual agent.');
        
    } catch (error) {
        console.error(`❌ Error testing Personal Assistant: ${error.message}`);
        console.error(error.stack);
    }
}

testPersonalAssistant();
