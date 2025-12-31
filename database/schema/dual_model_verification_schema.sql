-- ============================================================================
-- Dual Model Quality Verification System - Database Schema
-- ============================================================================
-- Purpose: Support Claude + OpenAI dual model verification for Real Estate Analysis
-- Created: December 28, 2025
-- Phase: 1 - Railway Infrastructure Setup
-- Dependencies: quality_assurance_schema.sql (extends existing error tracking)
-- ============================================================================

-- ============================================================================
-- Methodologies Table
-- Stores Universal Methodology Engine templates and versions
-- ============================================================================
CREATE TABLE IF NOT EXISTS methodologies (
    -- Primary Key
    methodology_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Methodology Information
    name VARCHAR(255) NOT NULL UNIQUE,
    version VARCHAR(50) NOT NULL,
    methodology_type ENUM(
        'REAL_ESTATE_PRIMARY',
        'REAL_ESTATE_INVESTMENT', 
        'QUALITY_VERIFICATION',
        'FINANCIAL_ANALYSIS',
        'DOCUMENT_GENERATION'
    ) NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    description TEXT,
    success_criteria TEXT,
    quality_thresholds JSON, -- Minimum scores for each step
    
    -- Versioning
    is_active BOOLEAN DEFAULT TRUE,
    parent_methodology_id VARCHAR(36) NULL, -- For versioning chain
    changelog TEXT,
    
    -- Performance Metrics
    average_execution_time_seconds INT,
    success_rate_percentage DECIMAL(5,2),
    average_quality_score DECIMAL(5,2),
    usage_count INT DEFAULT 0,
    
    -- Metadata
    created_by VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deprecated_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_type_active (methodology_type, is_active),
    INDEX idx_name_version (name, version),
    INDEX idx_success_rate (success_rate_percentage),
    FOREIGN KEY (parent_methodology_id) REFERENCES methodologies(methodology_id)
);

-- ============================================================================
-- Property Analyses Table  
-- Stores complete property analysis sessions with dual model results
-- ============================================================================
CREATE TABLE IF NOT EXISTS property_analyses (
    -- Primary Key
    analysis_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Session Information
    user_id VARCHAR(100) NOT NULL,
    session_name VARCHAR(255),
    analysis_type ENUM('PRIMARY_RESIDENCE', 'INVESTMENT_PROPERTY') NOT NULL,
    methodology_id VARCHAR(36) NOT NULL,
    
    -- Input Data
    property_files JSON NOT NULL, -- Array of uploaded file metadata
    user_parameters JSON NOT NULL, -- Budget, preferences, criteria
    analysis_prompt TEXT NOT NULL, -- Generated prompt for models
    
    -- Primary Model Results (Claude)
    primary_model VARCHAR(50) DEFAULT 'claude-3-5-sonnet-20241022',
    primary_result TEXT,
    primary_execution_time_ms INT,
    primary_token_usage INT,
    primary_cost DECIMAL(8,4),
    primary_quality_score DECIMAL(5,2),
    
    -- Verification Model Results (OpenAI)
    verification_model VARCHAR(50) DEFAULT 'gpt-4o',
    verification_result TEXT,
    verification_execution_time_ms INT,
    verification_token_usage INT,
    verification_cost DECIMAL(8,4),
    verification_quality_score DECIMAL(5,2),
    
    -- Cross-Validation Results
    cross_validation_score DECIMAL(5,2) NOT NULL,
    agreement_percentage DECIMAL(5,2),
    discrepancies JSON, -- Array of differences found
    overall_quality_score DECIMAL(5,2) NOT NULL,
    
    -- Quality Assurance
    meets_quality_threshold BOOLEAN DEFAULT FALSE,
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    quality_threshold DECIMAL(5,2) DEFAULT 85.00,
    
    -- Generated Documents
    final_documents JSON, -- URLs/paths to generated PDFs, reports
    document_generation_time_ms INT,
    document_quality_score DECIMAL(5,2),
    
    -- Status Tracking
    status ENUM(
        'INITIALIZING',
        'PROCESSING_PRIMARY',
        'PROCESSING_VERIFICATION', 
        'CROSS_VALIDATING',
        'QUALITY_CHECK',
        'RETRYING',
        'GENERATING_DOCUMENTS',
        'COMPLETED',
        'FAILED',
        'QUALITY_FAILED'
    ) DEFAULT 'INITIALIZING',
    
    -- Performance Metrics
    total_processing_time_ms INT,
    total_cost DECIMAL(8,4),
    user_satisfaction_score DECIMAL(3,2), -- Post-analysis feedback
    
    -- Error Tracking
    error_details JSON, -- Array of errors encountered
    failure_reason TEXT,
    recovery_attempts INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_analysis_type (analysis_type),
    INDEX idx_status_date (status, created_at),
    INDEX idx_quality_score (overall_quality_score),
    INDEX idx_processing_time (total_processing_time_ms),
    FOREIGN KEY (methodology_id) REFERENCES methodologies(methodology_id)
);

-- ============================================================================
-- Quality Metrics Detailed Table
-- Granular quality tracking for dual model verification
-- ============================================================================
CREATE TABLE IF NOT EXISTS dual_model_quality_metrics (
    -- Primary Key
    metric_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Analysis Reference
    analysis_id VARCHAR(36) NOT NULL,
    methodology_step INT NOT NULL, -- Which step of 7-step process
    step_name VARCHAR(100) NOT NULL,
    
    -- Primary Model Metrics
    primary_accuracy DECIMAL(5,2),
    primary_completeness DECIMAL(5,2),
    primary_relevance DECIMAL(5,2),
    primary_consistency DECIMAL(5,2),
    primary_step_score DECIMAL(5,2),
    
    -- Verification Model Metrics  
    verification_accuracy DECIMAL(5,2),
    verification_completeness DECIMAL(5,2),
    verification_relevance DECIMAL(5,2),
    verification_consistency DECIMAL(5,2),
    verification_step_score DECIMAL(5,2),
    
    -- Cross-Validation Metrics
    model_agreement_score DECIMAL(5,2),
    discrepancy_count INT DEFAULT 0,
    major_discrepancies JSON, -- Critical differences
    minor_discrepancies JSON, -- Style/approach differences
    
    -- Step-Specific Quality
    data_accuracy_score DECIMAL(5,2),
    calculation_accuracy_score DECIMAL(5,2),
    methodology_compliance_score DECIMAL(5,2),
    output_quality_score DECIMAL(5,2),
    
    -- Performance Metrics
    step_processing_time_ms INT,
    step_retry_count INT DEFAULT 0,
    step_cost DECIMAL(8,4),
    
    -- Quality Gates
    passed_quality_gate BOOLEAN DEFAULT FALSE,
    quality_gate_threshold DECIMAL(5,2) DEFAULT 85.00,
    requires_human_review BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_analysis_step (analysis_id, methodology_step),
    INDEX idx_step_quality (step_name, primary_step_score),
    INDEX idx_agreement_score (model_agreement_score),
    FOREIGN KEY (analysis_id) REFERENCES property_analyses(analysis_id) ON DELETE CASCADE
);

-- ============================================================================
-- Model Performance Tracking Table
-- Compare Claude vs OpenAI performance over time
-- ============================================================================
CREATE TABLE IF NOT EXISTS model_performance_tracking (
    -- Primary Key
    tracking_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Model Information
    model_name VARCHAR(50) NOT NULL,
    model_version VARCHAR(50) NOT NULL,
    model_role ENUM('PRIMARY', 'VERIFICATION') NOT NULL,
    
    -- Task Information
    analysis_id VARCHAR(36) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    task_complexity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    
    -- Performance Metrics
    response_time_ms INT NOT NULL,
    token_input INT NOT NULL,
    token_output INT NOT NULL,
    cost_usd DECIMAL(8,4) NOT NULL,
    
    -- Quality Metrics
    accuracy_score DECIMAL(5,2),
    coherence_score DECIMAL(5,2),
    relevance_score DECIMAL(5,2),
    factual_correctness_score DECIMAL(5,2),
    overall_quality_score DECIMAL(5,2),
    
    -- Error Analysis
    errors_detected INT DEFAULT 0,
    error_types JSON, -- Array of error categories
    hallucination_count INT DEFAULT 0,
    calculation_errors INT DEFAULT 0,
    
    -- Comparison Metrics (vs other model)
    performance_vs_peer DECIMAL(5,2), -- Percentage better/worse
    cost_efficiency_ratio DECIMAL(8,4), -- Quality per dollar
    speed_efficiency_ratio DECIMAL(8,4), -- Quality per second
    
    -- Context
    prompt_length INT,
    context_window_utilized DECIMAL(5,2),
    temperature_setting DECIMAL(3,2),
    
    -- Timestamps
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_model_performance (model_name, model_version, overall_quality_score),
    INDEX idx_task_complexity (task_complexity, overall_quality_score),
    INDEX idx_cost_efficiency (cost_efficiency_ratio),
    INDEX idx_analysis_date (analysis_id, measured_at),
    FOREIGN KEY (analysis_id) REFERENCES property_analyses(analysis_id) ON DELETE CASCADE
);

-- ============================================================================
-- File Storage Metadata Table
-- Track uploaded property files and generated documents in Railway storage
-- ============================================================================
CREATE TABLE IF NOT EXISTS file_storage_metadata (
    -- Primary Key
    file_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Analysis Reference
    analysis_id VARCHAR(36) NOT NULL,
    
    -- File Information
    file_type ENUM(
        'PROPERTY_INPUT',
        'IMAGE_UPLOAD',
        'PDF_DOCUMENT',
        'GENERATED_REPORT',
        'TRIP_ITINERARY',
        'COMPARISON_MATRIX',
        'FINANCIAL_ANALYSIS'
    ) NOT NULL,
    
    -- Storage Details
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL, -- Railway blob storage path
    download_url TEXT, -- Public URL for downloads
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    
    -- Processing Status
    processing_status ENUM(
        'UPLOADED',
        'PROCESSING', 
        'PROCESSED',
        'GENERATED',
        'FAILED',
        'DELETED'
    ) DEFAULT 'UPLOADED',
    
    -- Content Analysis
    content_preview TEXT, -- First few lines for .md files
    metadata_extracted JSON, -- File metadata (properties, images, etc.)
    processing_notes TEXT,
    
    -- Quality & Security
    file_hash VARCHAR(64), -- SHA-256 hash for integrity
    virus_scan_status ENUM('PENDING', 'CLEAN', 'INFECTED', 'FAILED') DEFAULT 'PENDING',
    content_validation_status ENUM('PENDING', 'VALID', 'INVALID') DEFAULT 'PENDING',
    
    -- Access Control
    access_level ENUM('PUBLIC', 'PRIVATE', 'RESTRICTED') DEFAULT 'PRIVATE',
    expiry_date TIMESTAMP NULL, -- Auto-delete date
    download_count INT DEFAULT 0,
    
    -- Timestamps
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    last_accessed TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_analysis_type (analysis_id, file_type),
    INDEX idx_storage_path (file_path(255)),
    INDEX idx_processing_status (processing_status),
    INDEX idx_upload_date (uploaded_at),
    FOREIGN KEY (analysis_id) REFERENCES property_analyses(analysis_id) ON DELETE CASCADE
);

-- ============================================================================
-- Analysis Error Tracking Table  
-- Detailed error tracking specific to dual model verification
-- ============================================================================
CREATE TABLE IF NOT EXISTS analysis_error_tracking (
    -- Primary Key
    error_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Analysis Reference
    analysis_id VARCHAR(36) NOT NULL,
    methodology_step INT,
    step_name VARCHAR(100),
    
    -- Error Classification
    error_type ENUM(
        'MODEL_FAILURE',
        'API_ERROR',
        'QUALITY_THRESHOLD_FAILED',
        'CROSS_VALIDATION_FAILED',
        'DATA_PROCESSING_ERROR',
        'TIMEOUT',
        'RATE_LIMIT',
        'FILE_PROCESSING_ERROR',
        'DOCUMENT_GENERATION_FAILED'
    ) NOT NULL,
    
    error_severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    model_source ENUM('PRIMARY', 'VERIFICATION', 'CROSS_VALIDATION') NOT NULL,
    
    -- Error Details
    error_message TEXT NOT NULL,
    error_context JSON, -- Request/response context when error occurred
    stack_trace TEXT,
    
    -- Recovery Information
    retry_attempted BOOLEAN DEFAULT FALSE,
    retry_successful BOOLEAN DEFAULT FALSE,
    retry_count INT DEFAULT 0,
    recovery_method VARCHAR(100),
    recovery_time_ms INT,
    
    -- Impact Assessment
    user_impacted BOOLEAN DEFAULT TRUE,
    analysis_failed BOOLEAN DEFAULT FALSE,
    quality_degraded BOOLEAN DEFAULT FALSE,
    cost_impact DECIMAL(8,4),
    
    -- Learning Data
    pattern_identified BOOLEAN DEFAULT FALSE,
    prevention_strategy TEXT,
    similar_error_count INT DEFAULT 0, -- Count of similar errors in last 24h
    
    -- Resolution
    resolution_status ENUM(
        'UNRESOLVED',
        'AUTO_RECOVERED', 
        'MANUAL_INTERVENTION',
        'ESCALATED',
        'IGNORED'
    ) DEFAULT 'UNRESOLVED',
    resolution_notes TEXT,
    
    -- Timestamps
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    -- Indexes
    INDEX idx_analysis_error (analysis_id, error_type),
    INDEX idx_severity_date (error_severity, occurred_at),
    INDEX idx_model_source (model_source, error_type),
    INDEX idx_resolution_status (resolution_status),
    FOREIGN KEY (analysis_id) REFERENCES property_analyses(analysis_id) ON DELETE CASCADE
);

-- ============================================================================
-- User Feedback & Satisfaction Table
-- Track user satisfaction and feedback for continuous improvement  
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_feedback (
    -- Primary Key
    feedback_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Analysis Reference
    analysis_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(100) NOT NULL,
    
    -- Satisfaction Scores (1-5 scale)
    overall_satisfaction INT CHECK (overall_satisfaction BETWEEN 1 AND 5),
    quality_satisfaction INT CHECK (quality_satisfaction BETWEEN 1 AND 5),
    speed_satisfaction INT CHECK (speed_satisfaction BETWEEN 1 AND 5),
    accuracy_satisfaction INT CHECK (accuracy_satisfaction BETWEEN 1 AND 5),
    usefulness_satisfaction INT CHECK (usefulness_satisfaction BETWEEN 1 AND 5),
    
    -- Specific Feedback
    positive_feedback TEXT,
    negative_feedback TEXT,
    improvement_suggestions TEXT,
    feature_requests TEXT,
    
    -- Usage Intent
    would_recommend BOOLEAN,
    would_use_again BOOLEAN,
    primary_use_case VARCHAR(200),
    
    -- Quality Assessment
    found_errors BOOLEAN DEFAULT FALSE,
    error_descriptions TEXT,
    missing_information TEXT,
    unexpected_results TEXT,
    
    -- Document Quality Feedback
    document_quality_score INT CHECK (document_quality_score BETWEEN 1 AND 5),
    document_usefulness_score INT CHECK (document_usefulness_score BETWEEN 1 AND 5),
    document_feedback TEXT,
    
    -- Timestamps
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_analysis_user (analysis_id, user_id),
    INDEX idx_overall_satisfaction (overall_satisfaction),
    INDEX idx_submission_date (submitted_at),
    FOREIGN KEY (analysis_id) REFERENCES property_analyses(analysis_id) ON DELETE CASCADE
);

-- ============================================================================
-- Views for Dashboard and Reporting
-- ============================================================================

-- Real-time Analysis Status Dashboard
CREATE OR REPLACE VIEW analysis_status_dashboard AS
SELECT 
    pa.analysis_id,
    pa.user_id,
    pa.analysis_type,
    pa.status,
    pa.overall_quality_score,
    pa.total_processing_time_ms,
    pa.retry_count,
    pa.created_at,
    m.name as methodology_name,
    m.version as methodology_version,
    COUNT(fsm.file_id) as file_count,
    COUNT(aet.error_id) as error_count
FROM property_analyses pa
LEFT JOIN methodologies m ON pa.methodology_id = m.methodology_id
LEFT JOIN file_storage_metadata fsm ON pa.analysis_id = fsm.analysis_id
LEFT JOIN analysis_error_tracking aet ON pa.analysis_id = aet.analysis_id
WHERE pa.created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY pa.analysis_id
ORDER BY pa.created_at DESC;

-- Model Performance Comparison View
CREATE OR REPLACE VIEW model_performance_comparison AS
SELECT 
    model_name,
    model_role,
    COUNT(*) as analysis_count,
    AVG(overall_quality_score) as avg_quality_score,
    AVG(response_time_ms) as avg_response_time,
    AVG(cost_usd) as avg_cost,
    AVG(cost_efficiency_ratio) as avg_cost_efficiency,
    SUM(errors_detected) as total_errors,
    AVG(accuracy_score) as avg_accuracy
FROM model_performance_tracking
WHERE measured_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY model_name, model_role
ORDER BY avg_quality_score DESC;

-- Quality Trend Analysis View
CREATE OR REPLACE VIEW quality_trend_analysis AS
SELECT 
    DATE(created_at) as analysis_date,
    analysis_type,
    COUNT(*) as daily_analyses,
    AVG(overall_quality_score) as avg_quality,
    AVG(total_processing_time_ms) as avg_processing_time,
    SUM(CASE WHEN meets_quality_threshold = 1 THEN 1 ELSE 0 END) as passed_quality,
    AVG(retry_count) as avg_retries,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_analyses
FROM property_analyses
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), analysis_type
ORDER BY analysis_date DESC;

-- ============================================================================
-- Stored Procedures for Common Operations
-- ============================================================================

-- Start New Analysis Procedure
DELIMITER $$
CREATE PROCEDURE StartNewAnalysis(
    IN p_user_id VARCHAR(100),
    IN p_analysis_type VARCHAR(50),
    IN p_methodology_id VARCHAR(36),
    IN p_property_files JSON,
    IN p_user_parameters JSON,
    OUT p_analysis_id VARCHAR(36)
)
BEGIN
    SET p_analysis_id = UUID();
    
    INSERT INTO property_analyses (
        analysis_id, user_id, analysis_type, methodology_id,
        property_files, user_parameters, status
    ) VALUES (
        p_analysis_id, p_user_id, p_analysis_type, p_methodology_id,
        p_property_files, p_user_parameters, 'INITIALIZING'
    );
    
    -- Update methodology usage count
    UPDATE methodologies 
    SET usage_count = usage_count + 1 
    WHERE methodology_id = p_methodology_id;
END$$
DELIMITER ;

-- Record Dual Model Results Procedure
DELIMITER $$
CREATE PROCEDURE RecordDualModelResults(
    IN p_analysis_id VARCHAR(36),
    IN p_primary_result TEXT,
    IN p_primary_quality DECIMAL(5,2),
    IN p_verification_result TEXT,  
    IN p_verification_quality DECIMAL(5,2),
    IN p_cross_validation_score DECIMAL(5,2),
    IN p_overall_quality DECIMAL(5,2)
)
BEGIN
    UPDATE property_analyses SET
        primary_result = p_primary_result,
        primary_quality_score = p_primary_quality,
        verification_result = p_verification_result,
        verification_quality_score = p_verification_quality,
        cross_validation_score = p_cross_validation_score,
        overall_quality_score = p_overall_quality,
        meets_quality_threshold = (p_overall_quality >= quality_threshold),
        status = CASE 
            WHEN p_overall_quality >= quality_threshold THEN 'GENERATING_DOCUMENTS'
            ELSE 'QUALITY_FAILED'
        END,
        updated_at = CURRENT_TIMESTAMP
    WHERE analysis_id = p_analysis_id;
END$$
DELIMITER ;

-- ============================================================================
-- Triggers for Automated Quality Tracking
-- ============================================================================

-- Auto-update methodology performance when analysis completes
DELIMITER $$
CREATE TRIGGER UpdateMethodologyPerformance
AFTER UPDATE ON property_analyses
FOR EACH ROW
BEGIN
    IF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
        UPDATE methodologies SET
            average_quality_score = (
                SELECT AVG(overall_quality_score) 
                FROM property_analyses 
                WHERE methodology_id = NEW.methodology_id 
                AND status = 'COMPLETED'
            ),
            success_rate_percentage = (
                SELECT (COUNT(CASE WHEN meets_quality_threshold = 1 THEN 1 END) * 100.0 / COUNT(*))
                FROM property_analyses 
                WHERE methodology_id = NEW.methodology_id 
                AND status IN ('COMPLETED', 'QUALITY_FAILED')
            ),
            updated_at = CURRENT_TIMESTAMP
        WHERE methodology_id = NEW.methodology_id;
    END IF;
END$$
DELIMITER ;

-- ============================================================================
-- Initial Data Setup
-- ============================================================================

-- Insert default Real Estate methodologies
INSERT INTO methodologies (
    methodology_id, name, version, methodology_type, content, description,
    quality_thresholds, created_by
) VALUES 
(
    UUID(),
    'Real Estate Primary Residence Analysis',
    '1.0.0',
    'REAL_ESTATE_PRIMARY',
    '7-Step Universal Methodology Engine for Primary Residence Analysis...',
    'Comprehensive analysis for primary residence selection including financial, location, and lifestyle factors',
    '{"data_ingestion": 85, "methodology_application": 85, "quality_assurance": 90, "document_generation": 85, "learning_integration": 80}',
    'system'
),
(
    UUID(),
    'Real Estate Investment Property Analysis', 
    '1.0.0',
    'REAL_ESTATE_INVESTMENT',
    '7-Step Universal Methodology Engine for Investment Property Analysis...',
    'Investment-focused analysis including ROI, cash flow, appreciation potential, and market dynamics',
    '{"data_ingestion": 85, "methodology_application": 90, "quality_assurance": 95, "document_generation": 85, "learning_integration": 80}',
    'system'
),
(
    UUID(),
    'Dual Model Quality Verification',
    '1.0.0', 
    'QUALITY_VERIFICATION',
    'Cross-validation methodology for Claude + OpenAI dual model verification...',
    'Quality assurance system for validating analysis results between multiple AI models',
    '{"cross_validation": 85, "agreement_threshold": 80, "quality_gate": 85}',
    'system'
);

-- ============================================================================
-- Database Schema Complete
-- Ready for Railway deployment and API integration
-- ============================================================================
