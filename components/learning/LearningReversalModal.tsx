/**
 * Learning Reversal Modal - Interface for reviewing and reversing learnings
 * Shows detailed file contents and allows users to revert or keep learnings active
 */

'use client';

import React, { useState, useEffect } from 'react';

interface LearningReversalModalProps {
  isOpen: boolean;
  onClose: () => void;
  learningId: string;
  learningData: {
    id: string;
    description: string;
    status: string;
    timestamp: string;
    filesModified: string[];
  };
  onAction: (action: 'revert' | 'keep', reason?: string) => Promise<void>;
}

interface FileContent {
  path: string;
  content: string;
  size: string;
}

const LearningReversalModal: React.FC<LearningReversalModalProps> = ({
  isOpen,
  onClose,
  learningId,
  learningData,
  onAction
}) => {
  const [fileContents, setFileContents] = useState<FileContent[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);

  useEffect(() => {
    if (isOpen && learningData.filesModified.length > 0) {
      loadFileContents();
    }
  }, [isOpen, learningData.filesModified]);

  const loadFileContents = async () => {
    setLoadingFiles(true);
    try {
      // Load file metadata and sizes
      const contents: FileContent[] = [];
      for (const filePath of learningData.filesModified) {
        try {
          // Get file size and basic info
          const response = await fetch(`/api/learning-management?action=getFileContent&learningId=${learningId}&filePath=${encodeURIComponent(filePath)}`);
          if (response.ok) {
            const data = await response.json();
            contents.push({
              path: filePath,
              content: data.content || '',
              size: data.size || 'Unknown'
            });
          } else {
            contents.push({
              path: filePath,
              content: 'Error loading content',
              size: 'Error'
            });
          }
        } catch (error) {
          contents.push({
            path: filePath,
            content: 'Error loading content',
            size: 'Error'
          });
        }
      }
      setFileContents(contents);
    } catch (error) {
      console.error('Error loading file contents:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const handleFileClick = async (filePath: string) => {
    setSelectedFile(filePath);
    const fileContent = fileContents.find(f => f.path === filePath);
    if (fileContent) {
      setSelectedFileContent(fileContent.content);
    }
  };

  const handleAction = async (action: 'revert' | 'keep') => {
    setLoading(true);
    try {
      await onAction(action, reason);
      onClose();
    } catch (error) {
      console.error(`Error ${action}ing learning:`, error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#1e1e1e',
        border: '1px solid #333',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '800px',
        height: '90%',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#2a2a2a'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔄</span>
            <h2 style={{ margin: 0, color: '#ffb347', fontSize: '20px' }}>Revert Learning</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#ccc',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Learning Details */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>📋</span>
              <h3 style={{ margin: 0, color: '#ffb347', fontSize: '16px' }}>Learning Details</h3>
            </div>
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{ color: '#f3f3f3', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
                {learningData.description}
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Created: {new Date(learningData.timestamp).toLocaleString()} • Status: {learningData.status} • Files: {learningData.filesModified.length}
              </div>
            </div>
          </div>

          {/* What will be removed */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>⚠️</span>
              <h3 style={{ margin: 0, color: '#ff6b6b', fontSize: '16px' }}>What will be removed:</h3>
            </div>
            <div style={{
              backgroundColor: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '8px',
              padding: '15px'
            }}>
              <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.6' }}>
                Removes: Cross-reference biographical claims against reliable sources, Identify patterns 
                indicating potentially fabricated information, Generate appropriate responses to suspected 
                misinformation, Enhanced information verification, Enhanced trust management ({learningData.filesModified.length} files 
                affected)
              </div>
            </div>
          </div>

          {/* Files that will be deleted */}
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>📄</span>
              <h3 style={{ margin: 0, color: '#ffb347', fontSize: '16px' }}>Files that will be deleted ({learningData.filesModified.length}):</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '15px', height: '300px' }}>
              {/* File List */}
              <div style={{
                flex: '0 0 300px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                overflow: 'auto'
              }}>
                {loadingFiles ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    Loading file details...
                  </div>
                ) : (
                  fileContents.map((file, index) => (
                    <div
                      key={index}
                      onClick={() => handleFileClick(file.path)}
                      style={{
                        padding: '12px 15px',
                        borderBottom: index < fileContents.length - 1 ? '1px solid #333' : 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedFile === file.path ? '#3a3a3a' : 'transparent',
                        transition: 'background-color 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                      }}
                      onMouseOver={(e) => {
                        if (selectedFile !== file.path) {
                          e.currentTarget.style.backgroundColor = '#333';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (selectedFile !== file.path) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>📁</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: '#f3f3f3',
                          fontSize: '13px',
                          fontWeight: '500',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.path.split('/').pop()}
                        </div>
                        <div style={{ color: '#888', fontSize: '11px' }}>
                          {file.size}
                        </div>
                      </div>
                      <div style={{ color: '#888', fontSize: '11px' }}>
                        Click to view content
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* File Content */}
              <div style={{
                flex: 1,
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                overflow: 'auto',
                padding: selectedFile ? '15px' : '0'
              }}>
                {selectedFile ? (
                  <div>
                    <div style={{ 
                      color: '#ffb347', 
                      fontSize: '14px', 
                      fontWeight: '600', 
                      marginBottom: '10px',
                      borderBottom: '1px solid #444',
                      paddingBottom: '10px'
                    }}>
                      {selectedFile}
                    </div>
                    <pre style={{
                      color: '#ccc',
                      fontSize: '12px',
                      lineHeight: '1.4',
                      fontFamily: 'monospace',
                      margin: 0,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}>
                      {selectedFileContent}
                    </pre>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    color: '#888',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}>
                    Click on a file to view its content
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px' }}>📝</span>
              <h3 style={{ margin: 0, color: '#ffb347', fontSize: '16px' }}>Reason (optional):</h3>
            </div>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., No longer needed, Testing system, etc."
              style={{
                width: '100%',
                height: '60px',
                backgroundColor: '#2a2a2a',
                border: '1px solid #444',
                borderRadius: '8px',
                color: '#f3f3f3',
                fontSize: '14px',
                padding: '12px',
                resize: 'vertical',
                outline: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '20px',
          borderTop: '1px solid #333',
          display: 'flex',
          gap: '15px',
          justifyContent: 'flex-end',
          backgroundColor: '#2a2a2a'
        }}>
          <button
            onClick={() => handleAction('keep')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#666' : '#4CAF50',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#45a049';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#4CAF50';
              }
            }}
          >
            Keep Learning Active
          </button>
          
          <button
            onClick={() => handleAction('revert')}
            disabled={loading}
            style={{
              padding: '12px 24px',
              backgroundColor: loading ? '#666' : '#ff6b6b',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ff5252';
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#ff6b6b';
              }
            }}
          >
            🔄 Revert Learning
          </button>
        </div>
      </div>
    </div>
  );
};

export default LearningReversalModal;