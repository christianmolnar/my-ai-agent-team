// API Configuration Test
// Tests API key setup and configuration
import { apiKeyManager, API_KEY_CONFIGS } from './api-keys';

console.log('🔑 API Key Configuration Test');
console.log('=============================');

// Test API key manager initialization
console.log('\n📋 Testing API Key Manager...');
try {
  const status = apiKeyManager.getConfigurationStatus();
  const validation = apiKeyManager.validateConfiguration();
  
  console.log('\n✅ API Key Manager initialized successfully');
  
  // Show configuration status
  console.log('\n📊 Configuration Status:');
  console.log('------------------------');
  
  for (const config of API_KEY_CONFIGS) {
    const hasKey = status[config.provider];
    const icon = hasKey ? '✅' : (config.required ? '❌' : '⚠️');
    const statusText = hasKey ? 'CONFIGURED' : 'MISSING';
    const requiredText = config.required ? ' (REQUIRED)' : ' (optional)';
    
    console.log(`${icon} ${config.provider.padEnd(12)} ${statusText}${requiredText}`);
    console.log(`   ${config.description}`);
  }
  
  // Summary
  console.log('\n📈 Summary:');
  console.log(`✅ Available providers: ${validation.available.length}`);
  console.log(`❌ Missing required: ${validation.missing.length}`);
  console.log(`🎯 Configuration valid: ${validation.valid ? 'YES' : 'NO'}`);
  
  if (validation.available.length > 0) {
    console.log(`\n🔑 Available: ${validation.available.join(', ')}`);
  }
  
  if (validation.missing.length > 0) {
    console.log(`\n❌ Missing Required: ${validation.missing.join(', ')}`);
    console.log('\n🔧 To fix missing keys:');
    console.log('   1. Edit .env file');
    console.log('   2. Add missing API keys');
    console.log('   3. Run this test again');
    console.log('\n📖 See SETUP-API-KEYS.md for detailed instructions');
  } else {
    console.log('\n🚀 All required API keys configured!');
    console.log('   System ready for full agent execution');
  }
  
} catch (error) {
  console.error('❌ API Key Manager test failed:', error);
  console.log('\n🔧 Troubleshooting:');
  console.log('   1. Check .env file exists');
  console.log('   2. Verify environment variable loading');
  console.log('   3. Check file permissions');
}

// Test individual key access
console.log('\n🧪 Testing Key Access...');
const testProviders = ['openai', 'anthropic', 'google'];
for (const provider of testProviders) {
  try {
    const hasKey = apiKeyManager.hasKey(provider);
    const keyPreview = hasKey ? 
      `${apiKeyManager.getKey(provider)?.substring(0, 8)}...` : 
      'Not found';
    console.log(`${hasKey ? '✅' : '❌'} ${provider}: ${keyPreview}`);
  } catch (error) {
    console.log(`❌ ${provider}: Error accessing key`);
  }
}

console.log('\n🎯 Test Complete');
console.log('================');

// Export for other tests
if (apiKeyManager.validateConfiguration().valid) {
  console.log('✅ API configuration is valid');
  console.log('🚀 Ready to test agent execution');
} else {
  console.log('⚠️  API configuration incomplete');
  console.log('🔧 Please configure missing API keys');
}
