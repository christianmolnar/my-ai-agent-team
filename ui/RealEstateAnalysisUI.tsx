/**
 * REAL ESTATE ANALYSIS UI COMPONENT
 * React interface for property analysis with file upload and methodology execution
 * 
 * Provides interactive UI for Arizona trip property evaluation
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RealEstateUIController, PropertyAnalysisRequest, UIState, FileUpload, AnalysisParameters } from '../agents/real-estate-ui-controller';

// ====================================================================
// TYPE DEFINITIONS
// ====================================================================

interface RealEstateAnalysisUIProps {
  onAnalysisComplete?: (documents: any[]) => void;
  onError?: (error: string) => void;
}

// ====================================================================
// MAIN COMPONENT
// ====================================================================

export const RealEstateAnalysisUI: React.FC<RealEstateAnalysisUIProps> = ({
  onAnalysisComplete,
  onError
}) => {
  // ====================================================================
  // STATE MANAGEMENT
  // ====================================================================
  
  const [uiController] = useState(() => new RealEstateUIController());
  const [uiState, setUIState] = useState<UIState | null>(null);
  const [selectedAnalysisType, setSelectedAnalysisType] = useState<'primary-residence' | 'investment-property' | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [analysisParameters, setAnalysisParameters] = useState<Partial<AnalysisParameters>>({
    budgetRange: { min: 100000, max: 500000 },
    analysisDepth: 'comprehensive'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // ====================================================================
  // EFFECTS AND EVENT HANDLERS
  // ====================================================================
  
  useEffect(() => {
    // Listen for UI updates from controller
    const handleUIUpdate = (event: CustomEvent) => {
      setUIState(event.detail);
    };
    
    window.addEventListener('realEstateUIUpdate', handleUIUpdate as EventListener);
    
    // Initialize state
    setUIState(uiController.getCurrentState());
    
    return () => {
      window.removeEventListener('realEstateUIUpdate', handleUIUpdate as EventListener);
    };
  }, [uiController]);
  
  // ====================================================================
  // FILE UPLOAD HANDLING
  // ====================================================================
  
  const handleFileUpload = useCallback(async (files: FileList) => {
    const newFiles: FileUpload[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = await file.arrayBuffer();
      
      const fileUpload: FileUpload = {
        id: `file-${Date.now()}-${i}`,
        filename: file.name,
        fileType: getFileType(file.name),
        content: Buffer.from(content),
        metadata: {
          size: file.size,
          uploadDate: new Date(),
          source: 'user_upload',
          processingStatus: 'pending'
        }
      };
      
      newFiles.push(fileUpload);
    }
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  }, []);
  
  const getFileType = (filename: string): FileUpload['fileType'] => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'pdf';
      case 'docx':
      case 'doc': return 'docx';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'image';
      default: return 'pdf'; // Default fallback
    }
  };
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  }, [handleFileUpload]);
  
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  // ====================================================================
  // ANALYSIS EXECUTION
  // ====================================================================
  
  const executeAnalysis = useCallback(async () => {
    if (!selectedAnalysisType || uploadedFiles.length === 0) {
      onError?.('Please select analysis type and upload files');
      return;
    }
    
    const request: PropertyAnalysisRequest = {
      analysisType: selectedAnalysisType,
      files: uploadedFiles,
      parameters: analysisParameters as AnalysisParameters,
      userPreferences: {
        communicationStyle: 'detailed',
        focusAreas: ['valuation', 'market_analysis', 'investment_potential'],
        riskTolerance: 'moderate',
        previousExperience: 'experienced'
      }
    };
    
    try {
      await uiController.executeAnalysis(request);
      const documents = uiController.getGeneratedDocuments();
      onAnalysisComplete?.(documents);
    } catch (error) {
      onError?.(error.message);
    }
  }, [selectedAnalysisType, uploadedFiles, analysisParameters, uiController, onAnalysisComplete, onError]);
  
  // ====================================================================
  // UTILITY FUNCTIONS
  // ====================================================================
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getProgressPercentage = (): number => {
    if (!uiState) return 0;
    return Math.round((uiState.analysisProgress.step / uiState.analysisProgress.totalSteps) * 100);
  };
  
  // ====================================================================
  // RENDER METHODS
  // ====================================================================
  
  const renderAnalysisTypeSelection = () => (
    <div className="analysis-type-section">
      <h3>Select Analysis Type</h3>
      <div className="type-buttons">
        <button
          className={`type-btn ${selectedAnalysisType === 'primary-residence' ? 'active' : ''}`}
          onClick={() => setSelectedAnalysisType('primary-residence')}
        >
          <span className="icon">🏠</span>
          <span className="label">Primary Residence</span>
          <span className="desc">Personal home purchase analysis</span>
        </button>
        <button
          className={`type-btn ${selectedAnalysisType === 'investment-property' ? 'active' : ''}`}
          onClick={() => setSelectedAnalysisType('investment-property')}
        >
          <span className="icon">💰</span>
          <span className="label">Investment Property</span>
          <span className="desc">Rental income & ROI analysis</span>
        </button>
      </div>
    </div>
  );
  
  const renderFileUpload = () => (
    <div className="file-upload-section">
      <h3>Upload Property Documents</h3>
      <div
        className="file-drop-zone"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="drop-icon">📄</div>
        <div className="drop-text">
          <p>Drop files here or click to browse</p>
          <p className="drop-subtext">PDF, DOCX, Images • Max 50MB per file</p>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif"
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        style={{ display: 'none' }}
      />
      
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files">
          <h4>Uploaded Files ({uploadedFiles.length})</h4>
          {uploadedFiles.map(file => (
            <div key={file.id} className="file-item">
              <span className="file-name">{file.filename}</span>
              <span className="file-size">{formatFileSize(file.metadata.size)}</span>
              <span className={`file-status ${file.metadata.processingStatus}`}>
                {file.metadata.processingStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  const renderParameterCollection = () => (
    <div className="parameter-section">
      <h3>Analysis Parameters</h3>
      
      <div className="parameter-group">
        <label>Budget Range</label>
        <div className="budget-inputs">
          <input
            type="number"
            placeholder="Min Budget"
            value={analysisParameters.budgetRange?.min || ''}
            onChange={(e) => setAnalysisParameters(prev => ({
              ...prev,
              budgetRange: {
                ...prev.budgetRange,
                min: parseInt(e.target.value) || 0,
                max: prev.budgetRange?.max || 500000
              }
            }))}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max Budget"
            value={analysisParameters.budgetRange?.max || ''}
            onChange={(e) => setAnalysisParameters(prev => ({
              ...prev,
              budgetRange: {
                min: prev.budgetRange?.min || 100000,
                max: parseInt(e.target.value) || 0
              }
            }))}
          />
        </div>
      </div>
      
      <div className="parameter-group">
        <label>Analysis Depth</label>
        <select
          value={analysisParameters.analysisDepth || 'comprehensive'}
          onChange={(e) => setAnalysisParameters(prev => ({
            ...prev,
            analysisDepth: e.target.value as 'basic' | 'comprehensive' | 'investment-grade'
          }))}
        >
          <option value="basic">Basic Analysis</option>
          <option value="comprehensive">Comprehensive Analysis</option>
          <option value="investment-grade">Investment Grade Analysis</option>
        </select>
      </div>
    </div>
  );
  
  const renderAnalysisProgress = () => {
    if (!uiState || uiState.currentStep !== 'analysis') return null;
    
    return (
      <div className="analysis-progress">
        <h3>Analysis in Progress</h3>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="progress-text">
          <span>Step {uiState.analysisProgress.step} of {uiState.analysisProgress.totalSteps}</span>
          <span>{uiState.analysisProgress.currentOperation}</span>
        </div>
        {uiState.analysisProgress.estimatedTimeRemaining > 0 && (
          <div className="time-remaining">
            Estimated time remaining: {uiState.analysisProgress.estimatedTimeRemaining} minutes
          </div>
        )}
      </div>
    );
  };
  
  const renderResults = () => {
    if (!uiState || uiState.currentStep !== 'results') return null;
    
    return (
      <div className="results-section">
        <h3>Analysis Complete</h3>
        
        {uiState.qualityMetrics && (
          <div className="quality-metrics">
            <h4>Quality Score: {uiState.qualityMetrics.overallScore}/100</h4>
            <div className="quality-breakdown">
              <div>Data Completeness: {uiState.qualityMetrics.dataCompletenessScore}/100</div>
              <div>Analysis Depth: {uiState.qualityMetrics.analysisDepthScore}/100</div>
              <div>Accuracy Confidence: {uiState.qualityMetrics.accuracyConfidence}/100</div>
            </div>
          </div>
        )}
        
        {uiState.documents.length > 0 && (
          <div className="documents-section">
            <h4>Generated Documents</h4>
            {uiState.documents.map(doc => (
              <div key={doc.id} className="document-item">
                <span className="doc-name">{doc.filename}</span>
                <span className="doc-type">{doc.type}</span>
                <a href={doc.downloadUrl} download className="download-btn">
                  Download
                </a>
              </div>
            ))}
          </div>
        )}
        
        <button
          className="reset-btn"
          onClick={() => {
            uiController.resetAnalysis();
            setSelectedAnalysisType(null);
            setUploadedFiles([]);
          }}
        >
          Start New Analysis
        </button>
      </div>
    );
  };
  
  // ====================================================================
  // MAIN RENDER
  // ====================================================================
  
  return (
    <div className="real-estate-analysis-ui">
      <header className="ui-header">
        <h1>🏠 Real Estate Analysis System</h1>
        <p>Professional property analysis for informed decision-making</p>
      </header>
      
      <div className="ui-content">
        {(!uiState || uiState.currentStep === 'selection') && renderAnalysisTypeSelection()}
        
        {selectedAnalysisType && (!uiState || uiState.currentStep === 'upload') && renderFileUpload()}
        
        {selectedAnalysisType && uploadedFiles.length > 0 && (!uiState || uiState.currentStep === 'parameters') && renderParameterCollection()}
        
        {renderAnalysisProgress()}
        
        {renderResults()}
        
        {uiState?.errors && uiState.errors.length > 0 && (
          <div className="errors-section">
            <h4>Issues Detected</h4>
            {uiState.errors.map(error => (
              <div key={error.id} className={`error-item ${error.type}`}>
                <span className="error-message">{error.message}</span>
                {error.details && <span className="error-details">{error.details}</span>}
              </div>
            ))}
          </div>
        )}
        
        {selectedAnalysisType && uploadedFiles.length > 0 && (!uiState || uiState.currentStep !== 'analysis') && (
          <div className="action-section">
            <button
              className="execute-btn"
              onClick={executeAnalysis}
              disabled={!selectedAnalysisType || uploadedFiles.length === 0}
            >
              🚀 Execute Analysis
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealEstateAnalysisUI;
