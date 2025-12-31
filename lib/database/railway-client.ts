// ============================================================================
// Railway Database Client
// ============================================================================
// Purpose: Database connection and query management for Railway PostgreSQL
// Phase: 3 - Railway Cloud Integration
// Created: December 28, 2025
// ============================================================================

import { Pool, PoolClient, QueryResult } from 'pg';

// ============================================================================
// Database Configuration
// ============================================================================

interface DatabaseConfig {
  connectionString: string;
  ssl: {
    rejectUnauthorized: boolean;
  };
  max: number; // Maximum pool size
  min: number; // Minimum pool size
  connectionTimeoutMillis: number;
  idleTimeoutMillis: number;
}

// ============================================================================
// Database Pool Management
// ============================================================================

class RailwayDatabase {
  private pool: Pool | null = null;
  private isInitialized = false;

  constructor() {
    this.initializePool();
  }

  private initializePool(): void {
    if (this.isInitialized) return;

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    const config: DatabaseConfig = {
      connectionString: databaseUrl,
      ssl: {
        rejectUnauthorized: false // Railway requires this for external connections
      },
      max: parseInt(process.env.DB_POOL_MAX || '10'),
      min: parseInt(process.env.DB_POOL_MIN || '1'),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      idleTimeoutMillis: 30000,
    };

    this.pool = new Pool(config);
    this.isInitialized = true;

    console.log('🚀 Railway database pool initialized');
  }

  // ============================================================================
  // Connection Management
  // ============================================================================

  async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return await this.pool.connect();
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return await this.pool.query(text, params);
  }

  async healthCheck(): Promise<{ status: string; database: string; timestamp: string }> {
    try {
      const result = await this.query('SELECT NOW() as timestamp, current_database() as database');
      return {
        status: 'connected',
        database: result.rows[0].database,
        timestamp: result.rows[0].timestamp
      };
    } catch (error) {
      console.error('Database health check failed:', error);
      return {
        status: 'disconnected',
        database: 'unknown',
        timestamp: new Date().toISOString()
      };
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      this.isInitialized = false;
      console.log('Database pool closed');
    }
  }

  // ============================================================================
  // Analysis Management
  // ============================================================================

  async saveAnalysis(analysisData: {
    analysisId: string;
    userEmail: string;
    analysisType: string;
    propertyFiles: any[];
    userParameters: any;
    qualityScore: number;
    processingTimeMs: number;
    retryCount: number;
    status: string;
  }): Promise<string> {
    const query = `
      INSERT INTO property_analyses (
        analysis_id, user_email, analysis_type, property_files, 
        user_parameters, quality_score, processing_time_ms, 
        retry_count, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (analysis_id) 
      DO UPDATE SET
        quality_score = EXCLUDED.quality_score,
        processing_time_ms = EXCLUDED.processing_time_ms,
        retry_count = EXCLUDED.retry_count,
        status = EXCLUDED.status,
        updated_at = CURRENT_TIMESTAMP
      RETURNING analysis_id
    `;

    const values = [
      analysisData.analysisId,
      analysisData.userEmail,
      analysisData.analysisType,
      JSON.stringify(analysisData.propertyFiles),
      JSON.stringify(analysisData.userParameters),
      analysisData.qualityScore,
      analysisData.processingTimeMs,
      analysisData.retryCount,
      analysisData.status
    ];

    const result = await this.query(query, values);
    return result.rows[0].analysis_id;
  }

  async updateAnalysisResults(analysisId: string, results: {
    primaryResult?: string;
    verificationResult?: string;
    crossValidationResult?: string;
    finalAnalysis?: string;
    qualityScore?: number;
    primaryConfidence?: number;
    verificationConfidence?: number;
    agreementPercentage?: number;
    status: string;
  }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (results.primaryResult !== undefined) {
      fields.push(`primary_result = $${paramIndex++}`);
      values.push(results.primaryResult);
    }
    if (results.verificationResult !== undefined) {
      fields.push(`verification_result = $${paramIndex++}`);
      values.push(results.verificationResult);
    }
    if (results.crossValidationResult !== undefined) {
      fields.push(`cross_validation_result = $${paramIndex++}`);
      values.push(results.crossValidationResult);
    }
    if (results.finalAnalysis !== undefined) {
      fields.push(`final_analysis = $${paramIndex++}`);
      values.push(results.finalAnalysis);
    }
    if (results.qualityScore !== undefined) {
      fields.push(`quality_score = $${paramIndex++}`);
      values.push(results.qualityScore);
    }
    if (results.primaryConfidence !== undefined) {
      fields.push(`primary_confidence = $${paramIndex++}`);
      values.push(results.primaryConfidence);
    }
    if (results.verificationConfidence !== undefined) {
      fields.push(`verification_confidence = $${paramIndex++}`);
      values.push(results.verificationConfidence);
    }
    if (results.agreementPercentage !== undefined) {
      fields.push(`agreement_percentage = $${paramIndex++}`);
      values.push(results.agreementPercentage);
    }

    fields.push(`status = $${paramIndex++}`);
    values.push(results.status);

    if (results.status === 'COMPLETED') {
      fields.push(`completed_at = CURRENT_TIMESTAMP`);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);

    const query = `
      UPDATE property_analyses 
      SET ${fields.join(', ')}
      WHERE analysis_id = $${paramIndex}
    `;
    values.push(analysisId);

    await this.query(query, values);
  }

  async getAnalysisById(analysisId: string): Promise<any | null> {
    const query = `
      SELECT * FROM property_analyses 
      WHERE analysis_id = $1
    `;
    const result = await this.query(query, [analysisId]);
    return result.rows[0] || null;
  }

  async getAnalysesByUser(userEmail: string, limit: number = 10): Promise<any[]> {
    const query = `
      SELECT analysis_id, analysis_type, quality_score, status, created_at
      FROM property_analyses 
      WHERE user_email = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `;
    const result = await this.query(query, [userEmail, limit]);
    return result.rows;
  }

  // ============================================================================
  // Quality Metrics Management  
  // ============================================================================

  async saveQualityMetrics(metricsData: {
    analysisId: string;
    primaryModelAccuracy: number;
    verificationScore: number;
    crossValidationScore: number;
    overallQuality: number;
    processingTimeMs: number;
    retryCount: number;
    modelCostsUsd?: number;
    accuracyScore: number;
    completenessScore: number;
    relevanceScore: number;
    consistencyScore: number;
    methodologyCompliance: number;
    methodologyId?: string;
  }): Promise<string> {
    const query = `
      INSERT INTO quality_metrics (
        analysis_id, primary_model_accuracy, verification_score, 
        cross_validation_score, overall_quality, processing_time_ms,
        retry_count, model_costs_usd, accuracy_score, completeness_score,
        relevance_score, consistency_score, methodology_compliance,
        methodology_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING metric_id
    `;

    const values = [
      metricsData.analysisId,
      metricsData.primaryModelAccuracy,
      metricsData.verificationScore,
      metricsData.crossValidationScore,
      metricsData.overallQuality,
      metricsData.processingTimeMs,
      metricsData.retryCount,
      metricsData.modelCostsUsd || null,
      metricsData.accuracyScore,
      metricsData.completenessScore,
      metricsData.relevanceScore,
      metricsData.consistencyScore,
      metricsData.methodologyCompliance,
      metricsData.methodologyId || null
    ];

    const result = await this.query(query, values);
    return result.rows[0].metric_id;
  }

  async getQualityMetrics(analysisId: string): Promise<any[]> {
    const query = `
      SELECT * FROM quality_metrics 
      WHERE analysis_id = $1 
      ORDER BY measured_at DESC
    `;
    const result = await this.query(query, [analysisId]);
    return result.rows;
  }

  // ============================================================================
  // Error Tracking
  // ============================================================================

  async logError(errorData: {
    analysisId: string;
    errorType: string;
    errorMessage: string;
    errorDetails?: any;
    stackTrace?: string;
    modelSource?: string;
    methodologyStep?: string;
    retrySuccessful?: boolean;
  }): Promise<string> {
    const query = `
      INSERT INTO analysis_errors (
        analysis_id, error_type, error_message, error_details,
        stack_trace, model_source, methodology_step, retry_successful
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING error_id
    `;

    const values = [
      errorData.analysisId,
      errorData.errorType,
      errorData.errorMessage,
      errorData.errorDetails ? JSON.stringify(errorData.errorDetails) : null,
      errorData.stackTrace || null,
      errorData.modelSource || null,
      errorData.methodologyStep || null,
      errorData.retrySuccessful || false
    ];

    const result = await this.query(query, values);
    return result.rows[0].error_id;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

let databaseInstance: RailwayDatabase | null = null;

export function getRailwayDatabase(): RailwayDatabase {
  if (!databaseInstance) {
    databaseInstance = new RailwayDatabase();
  }
  return databaseInstance;
}

export default getRailwayDatabase;
