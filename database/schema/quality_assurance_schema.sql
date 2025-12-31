-- ============================================================================
-- Quality Assurance Error Tracking Database Schema
-- ============================================================================
-- Purpose: Track errors, quality metrics, and review sessions for AI agents
-- Created: December 28, 2025
-- Phase: 1 - Foundation Infrastructure
-- ============================================================================

-- ============================================================================
-- Error Tracking Table
-- Tracks all errors detected by quality reviewers
-- ============================================================================
CREATE TABLE IF NOT EXISTS error_tracking (
    -- Primary Key
    error_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Agent Information
    agent_id VARCHAR(50) NOT NULL,
    agent_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    task_id VARCHAR(36),
    
    -- Error Classification
    error_category ENUM(
        'DATA_ACCURACY', 
        'LINK_VALIDATION', 
        'METHODOLOGY', 
        'HALLUCINATION', 
        'CALCULATION'
    ) NOT NULL,
    error_subcategory VARCHAR(100),
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL,
    
    -- Detection Details
    detection_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    detected_by VARCHAR(50) NOT NULL, -- Which reviewer found it
    detection_method VARCHAR(100),
    reviewer_confidence DECIMAL(3,2), -- 0.00-1.00
    
    -- Error Details
    error_description TEXT NOT NULL,
    error_location TEXT, -- Where in content the error occurred
    original_content TEXT,
    expected_content TEXT,
    
    -- Correction Process
    correction_date TIMESTAMP NULL,
    correction_attempt_count INT DEFAULT 0,
    correction_successful BOOLEAN DEFAULT FALSE,
    corrected_content TEXT,
    correction_method VARCHAR(100),
    correction_duration_seconds INT,
    
    -- Impact Assessment
    user_impact ENUM('HIGH', 'MEDIUM', 'LOW') NOT NULL,
    business_impact VARCHAR(200),
    prevented_error BOOLEAN DEFAULT FALSE, -- Caught before user saw it
    cost_of_error DECIMAL(10,2), -- Estimated cost if not caught
    
    -- Learning and Improvement
    lesson_learned TEXT,
    prevention_strategy TEXT,
    pattern_identified BOOLEAN DEFAULT FALSE,
    recurring_error BOOLEAN DEFAULT FALSE,
    
    -- Status Tracking
    status ENUM(
        'DETECTED', 
        'IN_CORRECTION', 
        'CORRECTED', 
        'VERIFIED', 
        'CLOSED',
        'FALSE_POSITIVE'
    ) DEFAULT 'DETECTED',
    resolution_notes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    
    -- Indexes for Performance
    INDEX idx_agent_date (agent_id, detection_date),
    INDEX idx_category_severity (error_category, severity),
    INDEX idx_status_date (status, detection_date),
    INDEX idx_task_type (task_type, detection_date),
    INDEX idx_severity_date (severity, detection_date)
);

-- ============================================================================
-- Quality Metrics Table
-- Tracks quality scores and performance metrics for tasks
-- ============================================================================
CREATE TABLE IF NOT EXISTS quality_metrics (
    -- Primary Key
    metric_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Task Information
    agent_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(36),
    task_type VARCHAR(50),
    measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Quality Scores (0-100 scale)
    overall_quality_score DECIMAL(5,2) NOT NULL,
    accuracy_score DECIMAL(5,2) NOT NULL,
    completeness_score DECIMAL(5,2) NOT NULL,
    relevance_score DECIMAL(5,2) NOT NULL,
    methodology_compliance_score DECIMAL(5,2) NOT NULL,
    
    -- Error Counts
    total_errors INT DEFAULT 0,
    critical_errors INT DEFAULT 0,
    high_errors INT DEFAULT 0,
    medium_errors INT DEFAULT 0,
    low_errors INT DEFAULT 0,
    
    -- Review Process Metrics
    review_duration_seconds INT,
    correction_cycles INT DEFAULT 0,
    reviewer_confidence DECIMAL(3,2),
    false_positive_count INT DEFAULT 0,
    
    -- Content Metrics
    content_length INT,
    link_count INT DEFAULT 0,
    calculation_count INT DEFAULT 0,
    claim_count INT DEFAULT 0,
    
    -- Performance Metrics
    processing_time_seconds INT,
    efficiency_ratio DECIMAL(6,2), -- Current task efficiency vs human baseline
    quality_improvement DECIMAL(5,2), -- vs. non-reviewed baseline
    
    -- Indexes for Performance
    INDEX idx_agent_date (agent_id, measurement_date),
    INDEX idx_quality_score (overall_quality_score),
    INDEX idx_error_count (total_errors),
    INDEX idx_task_type_date (task_type, measurement_date),
    INDEX idx_efficiency_ratio (efficiency_ratio)
);

-- ============================================================================
-- Review Sessions Table
-- Tracks individual review sessions and their outcomes
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_sessions (
    -- Primary Key
    session_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Session Information
    agent_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(36),
    reviewer_type VARCHAR(50) NOT NULL,
    review_stage ENUM('FIRST_PASS', 'CORRECTION', 'FINAL_VERIFICATION') DEFAULT 'FIRST_PASS',
    
    -- Session Timing
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP NULL,
    duration_seconds INT,
    status ENUM('IN_PROGRESS', 'COMPLETED', 'FAILED', 'TIMEOUT') DEFAULT 'IN_PROGRESS',
    
    -- Content
    original_content TEXT NOT NULL,
    reviewed_content TEXT,
    review_notes TEXT,
    reviewer_prompt TEXT, -- System prompt used for this review
    
    -- Results
    pass_fail BOOLEAN,
    requires_correction BOOLEAN DEFAULT FALSE,
    recommendation ENUM('APPROVE', 'REVISE', 'REJECT'),
    confidence_score DECIMAL(3,2),
    
    -- Performance Metrics
    processing_time_seconds INT,
    token_usage INT,
    api_cost DECIMAL(8,4), -- Cost in dollars for this review
    
    -- Error Details
    errors_found INT DEFAULT 0,
    critical_errors_found INT DEFAULT 0,
    suggestions_provided INT DEFAULT 0,
    
    -- Indexes for Performance
    INDEX idx_agent_session (agent_id, start_time),
    INDEX idx_reviewer_type (reviewer_type),
    INDEX idx_status (status),
    INDEX idx_task_id (task_id),
    INDEX idx_review_stage (review_stage)
);

-- ============================================================================
-- Efficiency Tracking Table
-- Tracks the impact on 160:1 efficiency ratio
-- ============================================================================
CREATE TABLE IF NOT EXISTS efficiency_tracking (
    -- Primary Key
    tracking_id VARCHAR(36) PRIMARY KEY DEFAULT (uuid()),
    
    -- Task Information
    agent_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(36),
    task_type VARCHAR(50),
    measurement_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Control Metrics (Original System)
    control_start_time TIMESTAMP,
    control_end_time TIMESTAMP,
    control_duration_seconds INT,
    control_quality_score DECIMAL(5,2),
    control_error_count INT,
    baseline_efficiency_ratio DECIMAL(6,2) DEFAULT 160.00,
    
    -- Treatment Metrics (Quality System)
    treatment_start_time TIMESTAMP,
    treatment_end_time TIMESTAMP,
    treatment_duration_seconds INT,
    treatment_quality_score DECIMAL(5,2),
    treatment_error_count INT,
    
    -- Breakdown of Treatment Time
    generation_time_seconds INT,
    review_time_seconds INT,
    correction_time_seconds INT,
    verification_time_seconds INT,
    
    -- Impact Analysis
    time_increase_seconds INT,
    time_increase_percentage DECIMAL(5,2),
    new_efficiency_ratio DECIMAL(6,2),
    efficiency_loss_percentage DECIMAL(5,2),
    
    -- Quality Impact
    quality_improvement DECIMAL(5,2),
    error_reduction_percentage DECIMAL(5,2),
    net_value_score DECIMAL(5,2), -- Quality gain vs efficiency loss
    
    -- Research Metadata
    test_group ENUM('CONTROL', 'TREATMENT'),
    research_phase VARCHAR(50),
    property_complexity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    
    -- Indexes for Performance
    INDEX idx_agent_date (agent_id, measurement_date),
    INDEX idx_efficiency_ratio (new_efficiency_ratio),
    INDEX idx_test_group (test_group),
    INDEX idx_task_type (task_type)
);

-- ============================================================================
-- Agent Performance Summary View
-- Real-time dashboard data aggregation
-- ============================================================================
CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    e.agent_id,
    e.agent_name,
    COUNT(e.error_id) as total_errors,
    AVG(q.overall_quality_score) as avg_quality_score,
    AVG(ef.new_efficiency_ratio) as avg_efficiency_ratio,
    SUM(CASE WHEN e.severity = 'CRITICAL' THEN 1 ELSE 0 END) as critical_errors,
    AVG(ef.quality_improvement) as avg_quality_improvement,
    AVG(ef.efficiency_loss_percentage) as avg_efficiency_loss,
    COUNT(DISTINCT e.task_id) as tasks_processed,
    MAX(e.detection_date) as last_error_date
FROM error_tracking e
LEFT JOIN quality_metrics q ON e.agent_id = q.agent_id 
    AND DATE(e.detection_date) = DATE(q.measurement_date)
LEFT JOIN efficiency_tracking ef ON e.agent_id = ef.agent_id 
    AND DATE(e.detection_date) = DATE(ef.measurement_date)
WHERE e.detection_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY e.agent_id, e.agent_name;

-- ============================================================================
-- Error Trend Analysis View
-- Weekly error pattern analysis
-- ============================================================================
CREATE OR REPLACE VIEW error_trends AS
SELECT 
    DATE(detection_date) as error_date,
    error_category,
    severity,
    COUNT(*) as error_count,
    AVG(correction_duration_seconds) as avg_correction_time,
    SUM(CASE WHEN correction_successful = 1 THEN 1 ELSE 0 END) as successful_corrections
FROM error_tracking
WHERE detection_date >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(detection_date), error_category, severity
ORDER BY error_date DESC, error_count DESC;

-- ============================================================================
-- Efficiency Impact Analysis View
-- Real-time 160:1 ratio monitoring
-- ============================================================================
CREATE OR REPLACE VIEW efficiency_impact_analysis AS
SELECT 
    agent_id,
    task_type,
    AVG(baseline_efficiency_ratio) as original_ratio,
    AVG(new_efficiency_ratio) as current_ratio,
    AVG(efficiency_loss_percentage) as avg_efficiency_loss,
    AVG(quality_improvement) as avg_quality_gain,
    AVG(net_value_score) as avg_net_value,
    COUNT(*) as sample_size,
    STDDEV(efficiency_loss_percentage) as efficiency_loss_std,
    MIN(new_efficiency_ratio) as min_ratio,
    MAX(new_efficiency_ratio) as max_ratio
FROM efficiency_tracking
WHERE measurement_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY agent_id, task_type
ORDER BY avg_efficiency_loss ASC;

-- ============================================================================
-- Insert Initial Configuration Data
-- ============================================================================

-- Insert agent registry for tracking
INSERT IGNORE INTO agent_registry (agent_id, agent_name, agent_type) VALUES
('real-estate-analyzer', 'Real Estate Analyzer', 'DATA_ANALYSIS'),
('data-scientist', 'Data Scientist', 'ANALYSIS'),
('communications', 'Communications Agent', 'CONTENT'),
('researcher', 'Research Agent', 'RESEARCH'),
('qa-engineer', 'QA Engineer', 'QUALITY'),
('master-orchestrator', 'Master Orchestrator', 'COORDINATION');

-- ============================================================================
-- Stored Procedures for Common Operations
-- ============================================================================

-- Record Error Procedure
DELIMITER $$
CREATE PROCEDURE RecordError(
    IN p_agent_id VARCHAR(50),
    IN p_task_id VARCHAR(36),
    IN p_error_category VARCHAR(50),
    IN p_severity VARCHAR(20),
    IN p_description TEXT,
    IN p_detected_by VARCHAR(50)
)
BEGIN
    INSERT INTO error_tracking (
        agent_id, task_id, error_category, severity, 
        error_description, detected_by
    ) VALUES (
        p_agent_id, p_task_id, p_error_category, p_severity,
        p_description, p_detected_by
    );
END$$
DELIMITER ;

-- Record Quality Metrics Procedure
DELIMITER $$
CREATE PROCEDURE RecordQualityMetrics(
    IN p_agent_id VARCHAR(50),
    IN p_task_id VARCHAR(36),
    IN p_overall_score DECIMAL(5,2),
    IN p_accuracy_score DECIMAL(5,2),
    IN p_total_errors INT,
    IN p_review_duration INT
)
BEGIN
    INSERT INTO quality_metrics (
        agent_id, task_id, overall_quality_score, accuracy_score,
        total_errors, review_duration_seconds
    ) VALUES (
        p_agent_id, p_task_id, p_overall_score, p_accuracy_score,
        p_total_errors, p_review_duration
    );
END$$
DELIMITER ;

-- Record Efficiency Impact Procedure
DELIMITER $$
CREATE PROCEDURE RecordEfficiencyImpact(
    IN p_agent_id VARCHAR(50),
    IN p_task_id VARCHAR(36),
    IN p_control_duration INT,
    IN p_treatment_duration INT,
    IN p_quality_improvement DECIMAL(5,2)
)
BEGIN
    DECLARE p_time_increase INT;
    DECLARE p_new_ratio DECIMAL(6,2);
    DECLARE p_efficiency_loss DECIMAL(5,2);
    
    SET p_time_increase = p_treatment_duration - p_control_duration;
    SET p_new_ratio = (960 * 60) / p_treatment_duration; -- 960 minutes human baseline
    SET p_efficiency_loss = ((160.00 - p_new_ratio) / 160.00) * 100;
    
    INSERT INTO efficiency_tracking (
        agent_id, task_id, control_duration_seconds, treatment_duration_seconds,
        time_increase_seconds, new_efficiency_ratio, efficiency_loss_percentage,
        quality_improvement
    ) VALUES (
        p_agent_id, p_task_id, p_control_duration, p_treatment_duration,
        p_time_increase, p_new_ratio, p_efficiency_loss, p_quality_improvement
    );
END$$
DELIMITER ;

-- ============================================================================
-- Triggers for Automated Updates
-- ============================================================================

-- Update efficiency metrics when errors are recorded
DELIMITER $$
CREATE TRIGGER UpdateEfficiencyOnError
AFTER INSERT ON error_tracking
FOR EACH ROW
BEGIN
    -- Update quality metrics for this task if exists
    UPDATE quality_metrics 
    SET total_errors = total_errors + 1,
        critical_errors = CASE WHEN NEW.severity = 'CRITICAL' THEN critical_errors + 1 ELSE critical_errors END,
        high_errors = CASE WHEN NEW.severity = 'HIGH' THEN high_errors + 1 ELSE high_errors END,
        medium_errors = CASE WHEN NEW.severity = 'MEDIUM' THEN medium_errors + 1 ELSE medium_errors END,
        low_errors = CASE WHEN NEW.severity = 'LOW' THEN low_errors + 1 ELSE low_errors END
    WHERE task_id = NEW.task_id;
END$$
DELIMITER ;
