-- ============================================================================
-- AI Agent Team Platform - PostgreSQL Database Schema  
-- ============================================================================
-- Purpose: Unified platform for AI Agent Team with dual model quality verification
-- Created: December 28, 2025
-- Database: PostgreSQL (Railway)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS - Define custom types
-- ============================================================================

-- Methodology types
CREATE TYPE methodology_type AS ENUM (
    'REAL_ESTATE_PRIMARY',
    'REAL_ESTATE_INVESTMENT', 
    'QUALITY_VERIFICATION',
    'FINANCIAL_ANALYSIS',
    'DOCUMENT_GENERATION',
    'JOB_ANALYSIS',
    'RESEARCH_PROJECT'
);

-- Analysis types
CREATE TYPE analysis_type AS ENUM (
    'PRIMARY_RESIDENCE',
    'INVESTMENT_PROPERTY',
    'COMPARISON_ANALYSIS',
    'JOB_POSITION',
    'RESEARCH_TASK'
);

-- Model roles
CREATE TYPE model_role AS ENUM ('PRIMARY', 'VERIFICATION');

-- File types
CREATE TYPE file_type AS ENUM (
    'PROPERTY_LISTING',
    'FINANCIAL_DOCUMENT',
    'MARKET_REPORT', 
    'JOB_DESCRIPTION',
    'RESUME',
    'RESEARCH_DOCUMENT',
    'USER_UPLOAD'
);

-- Error types
CREATE TYPE error_type AS ENUM (
    'MODEL_FAILURE',
    'QUALITY_FAILURE',
    'PARSING_ERROR',
    'VALIDATION_ERROR',
    'TIMEOUT_ERROR',
    'API_RATE_LIMIT',
    'SYSTEM_ERROR'
);

-- Analysis status
CREATE TYPE analysis_status AS ENUM (
    'PENDING',
    'PROCESSING_PRIMARY',
    'PROCESSING_VERIFICATION', 
    'CROSS_VALIDATING',
    'RETRYING',
    'COMPLETED',
    'FAILED',
    'QUALITY_FAILED'
);

-- ============================================================================
-- Core Tables
-- ============================================================================

-- Methodologies Table
CREATE TABLE methodologies (
    -- Primary Key
    methodology_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Methodology Information
    name VARCHAR(255) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    methodology_type methodology_type NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    description TEXT,
    success_criteria TEXT,
    quality_thresholds JSONB, -- Minimum scores for each step
    
    -- Versioning
    is_active BOOLEAN DEFAULT TRUE,
    parent_methodology_id UUID REFERENCES methodologies(methodology_id),
    changelog TEXT,
    
    -- Performance Metrics
    average_execution_time_seconds INTEGER,
    success_rate_percentage DECIMAL(5,2),
    average_quality_score DECIMAL(5,2),
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Property Analysis Results
CREATE TABLE property_analyses (
    -- Primary Key  
    analysis_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- User Information
    user_email VARCHAR(255) NOT NULL,
    user_id VARCHAR(100),
    
    -- Analysis Configuration
    analysis_type analysis_type NOT NULL,
    methodology_id UUID REFERENCES methodologies(methodology_id),
    
    -- Input Data
    property_files JSONB NOT NULL, -- Array of uploaded files metadata
    user_parameters JSONB, -- User preferences and criteria
    
    -- Analysis Results
    primary_result TEXT, -- Claude analysis result
    verification_result TEXT, -- OpenAI verification result  
    cross_validation_result TEXT, -- Comparison analysis
    final_analysis TEXT, -- Merged final result
    
    -- Quality Metrics
    quality_score DECIMAL(5,2),
    primary_confidence DECIMAL(5,2),
    verification_confidence DECIMAL(5,2),
    agreement_percentage DECIMAL(5,2),
    
    -- Processing Information
    processing_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    status analysis_status DEFAULT 'PENDING',
    
    -- Generated Documents
    final_documents JSONB, -- URLs and metadata for generated PDFs
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Quality Metrics Tracking
CREATE TABLE quality_metrics (
    -- Primary Key
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Analysis Reference
    analysis_id UUID REFERENCES property_analyses(analysis_id) ON DELETE CASCADE,
    
    -- Model Performance
    primary_model_accuracy DECIMAL(5,2),
    verification_score DECIMAL(5,2),
    cross_validation_score DECIMAL(5,2),
    overall_quality DECIMAL(5,2) NOT NULL,
    
    -- Processing Metrics
    processing_time_ms INTEGER NOT NULL,
    retry_count INTEGER DEFAULT 0,
    model_costs_usd DECIMAL(10,4), -- API costs
    
    -- Quality Breakdown
    accuracy_score DECIMAL(5,2),
    completeness_score DECIMAL(5,2),
    relevance_score DECIMAL(5,2),
    consistency_score DECIMAL(5,2),
    
    -- Methodology Compliance
    methodology_compliance DECIMAL(5,2),
    methodology_id UUID REFERENCES methodologies(methodology_id),
    
    -- Timestamp
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Model Interactions
CREATE TABLE model_interactions (
    -- Primary Key
    interaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Analysis Reference
    analysis_id UUID REFERENCES property_analyses(analysis_id) ON DELETE CASCADE,
    
    -- Model Information
    model_name VARCHAR(100) NOT NULL,
    model_role model_role NOT NULL,
    
    -- Request/Response
    request_prompt TEXT NOT NULL,
    response_content TEXT,
    response_metadata JSONB,
    
    -- Performance
    response_time_ms INTEGER,
    token_count INTEGER,
    cost_usd DECIMAL(8,4),
    
    -- Quality Assessment
    confidence_score DECIMAL(5,2),
    quality_score DECIMAL(5,2),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- File Storage Metadata
CREATE TABLE file_storage (
    -- Primary Key
    file_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Analysis Reference
    analysis_id UUID REFERENCES property_analyses(analysis_id) ON DELETE CASCADE,
    
    -- File Information
    original_filename VARCHAR(500) NOT NULL,
    file_type file_type NOT NULL,
    file_size_bytes BIGINT,
    content_type VARCHAR(100),
    
    -- Storage Information
    storage_url TEXT NOT NULL, -- Railway storage URL
    download_url TEXT, -- Secure download URL
    is_temporary BOOLEAN DEFAULT FALSE,
    
    -- Processing Status
    is_processed BOOLEAN DEFAULT FALSE,
    extracted_text TEXT,
    processing_metadata JSONB,
    
    -- Metadata
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Analysis Errors
CREATE TABLE analysis_errors (
    -- Primary Key
    error_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Analysis Reference
    analysis_id UUID REFERENCES property_analyses(analysis_id) ON DELETE CASCADE,
    
    -- Error Information
    error_type error_type NOT NULL,
    error_message TEXT NOT NULL,
    error_details JSONB,
    stack_trace TEXT,
    
    -- Context
    model_source VARCHAR(50),
    methodology_step VARCHAR(100),
    retry_successful BOOLEAN DEFAULT FALSE,
    
    -- Resolution
    resolution_applied TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User Feedback
CREATE TABLE user_feedback (
    -- Primary Key
    feedback_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Analysis Reference
    analysis_id UUID REFERENCES property_analyses(analysis_id) ON DELETE CASCADE,
    user_email VARCHAR(255) NOT NULL,
    
    -- Feedback Content
    overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    speed_rating INTEGER CHECK (speed_rating BETWEEN 1 AND 5),
    usefulness_rating INTEGER CHECK (usefulness_rating BETWEEN 1 AND 5),
    
    -- Comments
    feedback_text TEXT,
    improvement_suggestions TEXT,
    
    -- Metadata
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- Analysis lookups
CREATE INDEX idx_analyses_user_email ON property_analyses(user_email);
CREATE INDEX idx_analyses_status ON property_analyses(status);
CREATE INDEX idx_analyses_created_at ON property_analyses(created_at);
CREATE INDEX idx_analyses_type ON property_analyses(analysis_type);

-- Quality metrics
CREATE INDEX idx_quality_analysis_id ON quality_metrics(analysis_id);
CREATE INDEX idx_quality_score ON quality_metrics(overall_quality);
CREATE INDEX idx_quality_measured_at ON quality_metrics(measured_at);

-- Model interactions
CREATE INDEX idx_interactions_analysis_id ON model_interactions(analysis_id);
CREATE INDEX idx_interactions_model_role ON model_interactions(model_role);

-- File storage
CREATE INDEX idx_files_analysis_id ON file_storage(analysis_id);
CREATE INDEX idx_files_type ON file_storage(file_type);

-- Errors
CREATE INDEX idx_errors_analysis_id ON analysis_errors(analysis_id);
CREATE INDEX idx_errors_type ON analysis_errors(error_type);
CREATE INDEX idx_errors_occurred_at ON analysis_errors(occurred_at);

-- User feedback
CREATE INDEX idx_feedback_analysis_id ON user_feedback(analysis_id);
CREATE INDEX idx_feedback_rating ON user_feedback(overall_rating);

-- ============================================================================
-- Views for Common Queries
-- ============================================================================

-- Recent Analysis Performance
CREATE VIEW recent_analysis_performance AS
SELECT 
    DATE(created_at) as analysis_date,
    COUNT(*) as total_analyses,
    AVG(quality_score) as avg_quality_score,
    AVG(processing_time_ms) as avg_processing_time,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as successful_analyses,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_analyses
FROM property_analyses 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY analysis_date DESC;

-- Quality Metrics Summary
CREATE VIEW quality_metrics_summary AS
SELECT 
    DATE(measured_at) as metric_date,
    AVG(overall_quality) as avg_quality,
    AVG(processing_time_ms) as avg_processing_time,
    COUNT(*) as total_metrics
FROM quality_metrics 
WHERE measured_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(measured_at)
ORDER BY metric_date DESC;

-- Error Rate Analysis  
CREATE VIEW error_rate_analysis AS
SELECT 
    error_type,
    COUNT(*) as error_count,
    COUNT(CASE WHEN retry_successful = true THEN 1 END) as resolved_count
FROM analysis_errors 
WHERE occurred_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY error_type
ORDER BY error_count DESC;

-- ============================================================================
-- Functions for Common Operations
-- ============================================================================

-- Function to update methodology usage count
CREATE OR REPLACE FUNCTION update_methodology_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE methodologies 
    SET usage_count = usage_count + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE methodology_id = NEW.methodology_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update methodology usage
CREATE TRIGGER trigger_update_methodology_usage
    AFTER INSERT ON property_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_methodology_usage();

-- Function to calculate quality score
CREATE OR REPLACE FUNCTION calculate_quality_score(
    p_accuracy DECIMAL(5,2),
    p_completeness DECIMAL(5,2), 
    p_relevance DECIMAL(5,2),
    p_consistency DECIMAL(5,2)
) RETURNS DECIMAL(5,2) AS $$
BEGIN
    RETURN (p_accuracy * 0.3 + p_completeness * 0.25 + p_relevance * 0.25 + p_consistency * 0.2);
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Initial Data - Default Methodologies
-- ============================================================================

-- Real Estate Primary Analysis Methodology
INSERT INTO methodologies (
    name, 
    version, 
    methodology_type, 
    content, 
    description,
    quality_thresholds,
    created_by
) VALUES (
    'Real Estate Primary Analysis',
    '1.0.0',
    'REAL_ESTATE_PRIMARY',
    'Comprehensive real estate analysis methodology focusing on investment potential, market conditions, and financial projections.',
    'Primary methodology for analyzing real estate investment opportunities with focus on ROI, market trends, and risk assessment.',
    '{"minimum_quality_score": 85, "minimum_confidence": 80, "minimum_agreement": 70}'::jsonb,
    'system'
);

-- Quality Verification Methodology  
INSERT INTO methodologies (
    name,
    version,
    methodology_type,
    content,
    description, 
    quality_thresholds,
    created_by
) VALUES (
    'Dual Model Quality Verification',
    '1.0.0', 
    'QUALITY_VERIFICATION',
    'Cross-validation methodology using Claude and OpenAI models to ensure analysis quality and consistency.',
    'Quality assurance system that compares results from multiple AI models to identify discrepancies and ensure reliability.',
    '{"minimum_overall_score": 85, "minimum_agreement": 75, "maximum_retries": 3}'::jsonb,
    'system'
);

-- ============================================================================
-- Schema Deployment Complete
-- ============================================================================

-- Verify deployment
SELECT 'AI Agent Team Platform database schema deployed successfully!' as status;
SELECT COUNT(*) as methodology_count FROM methodologies;
