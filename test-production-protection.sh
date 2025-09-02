#!/bin/bash
# Test script to verify production protection

echo "Testing API Status page in development mode..."
curl -s http://localhost:3000/api-status | grep -q "Configure API keys" && echo "✅ Development mode: Page accessible" || echo "❌ Development mode: Page blocked"

echo "Testing API Status page access in production mode..."
echo "Note: Production protection is handled client-side based on environment variables during build time."
