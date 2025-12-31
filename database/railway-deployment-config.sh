# ============================================================================
# Railway Database Deployment Configuration
# ============================================================================
# Purpose: Deploy Dual Model Quality Verification System to Railway
# Created: December 28, 2025
# Phase: 1 - Railway Infrastructure Setup
# ============================================================================

# Project Information
PROJECT_NAME="ai-agent-team-production"
DATABASE_NAME="dual_model_verification_db"
ENVIRONMENT="production"

# Schema Files to Deploy (in order)
SCHEMA_FILES=(
    "database/schema/quality_assurance_schema.sql"
    "database/schema/dual_model_verification_schema.sql"
)

# Environment Variables Required
REQUIRED_ENV_VARS=(
    "ANTHROPIC_API_KEY"
    "OPENAI_API_KEY"
    "DATABASE_URL"
    "RAILWAY_PROJECT_ID"
    "NEXTAUTH_SECRET"
)

# Database Configuration
DB_ENGINE="postgresql"
DB_VERSION="15"
INITIAL_SIZE="1GB"
MAX_CONNECTIONS=100

# File Storage Configuration  
BLOB_STORAGE_SIZE="10GB"
BLOB_STORAGE_REGION="us-west1"
FILE_RETENTION_DAYS=90

# Quality Thresholds
DEFAULT_QUALITY_THRESHOLD=85.00
MAX_RETRY_ATTEMPTS=3
ANALYSIS_TIMEOUT_SECONDS=300

# Model Configuration
PRIMARY_MODEL="claude-3-5-sonnet-20241220"
VERIFICATION_MODEL="gpt-4o"
TEMPERATURE=0.1
MAX_TOKENS=4000

# Performance Targets
TARGET_RESPONSE_TIME_MS=30000
TARGET_SUCCESS_RATE=0.95
TARGET_QUALITY_SCORE=85.00

# Monitoring & Alerting
ENABLE_MONITORING=true
ENABLE_ERROR_TRACKING=true
ALERT_ON_QUALITY_FAILURES=true
ALERT_ON_HIGH_ERROR_RATE=true

# Security Configuration
ENABLE_ENCRYPTION_AT_REST=true
ENABLE_SSL=true
ENABLE_AUDIT_LOGGING=true
DATA_RETENTION_DAYS=365

# ============================================================================
# Deployment Instructions
# ============================================================================

# Step 1: Create Railway Project
railway login
railway init --name ${PROJECT_NAME}

# Step 2: Add PostgreSQL Database
railway add postgresql

# Step 3: Deploy Schema Files
for schema_file in "${SCHEMA_FILES[@]}"; do
    echo "Deploying ${schema_file}..."
    railway run psql -f ${schema_file}
done

# Step 4: Set Environment Variables
for env_var in "${REQUIRED_ENV_VARS[@]}"; do
    echo "Set ${env_var} in Railway dashboard"
done

# Step 5: Verify Deployment
railway run psql -c "SELECT COUNT(*) FROM methodologies;"
railway run psql -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';"

# Step 6: Test API Endpoints
curl -X GET "${RAILWAY_URL}/api/health"
curl -X GET "${RAILWAY_URL}/api/methodologies"

# ============================================================================
# Post-Deployment Validation
# ============================================================================

echo "✅ Railway Infrastructure Setup Complete"
echo "🔍 Validation Checklist:"
echo "  [ ] Database schema deployed successfully"
echo "  [ ] All required tables created"
echo "  [ ] Environment variables configured"
echo "  [ ] API endpoints responding"
echo "  [ ] File storage accessible"
echo "  [ ] Quality thresholds configured"
echo "  [ ] Monitoring enabled"
echo ""
echo "🚀 Ready for Phase 2: Dual Model Integration"
