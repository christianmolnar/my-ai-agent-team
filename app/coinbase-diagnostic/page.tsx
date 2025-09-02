"use client";

import { useEffect, useState } from "react";
import styles from "../f-insight-ai/f-insight-ai.module.css";
import Link from "next/link";

interface DiagnosticResult {
  success: boolean;
  message: string;
  diagnostics?: {
    hasCredentials: boolean;
    keyFormat: {
      length: number;
      prefix: string;
      suffix: string;
      isUuidFormat: boolean;
      mightBeStandardApiKey: boolean;
      isCdpKeyUsedForRestApi?: boolean;
      recommendCreateNewKey?: boolean;
    };
    secretFormat: {
      length: number;
      hasBase64Chars: boolean;
      containsPlus: boolean;
      containsSlash: boolean;
      containsEquals: boolean;
    };
    environmentVariables: {
      hasApiKey: boolean;
      hasApiSecret: boolean;
      hasCdpApiKeyId: boolean;
      hasCdpApiKeySecret: boolean;
      hasCdpWalletSecret: boolean;
    };
  };
  error?: string;
}

export default function CoinbaseDiagnostic() {
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    async function fetchDiagnostic() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/coinbase-diagnostic');
        const data = await response.json();
        setDiagnostic(data);
      } catch (error) {
        console.error('Error fetching diagnostic:', error);
        setTestResult(`Error running diagnostic: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDiagnostic();
  }, []);

  const [testDetails, setTestDetails] = useState<any>(null);
  
  const runApiTest = async () => {
    try {
      setTestResult("Testing API connection...");
      setTestDetails(null);
      
      const response = await fetch('/api/coinbase-test');
      const data = await response.json();
      
      setTestDetails(data);
      
      if (data.success) {
        setTestResult(`✅ API connection successful! Connected as ${data.userData?.name || 'Unknown'}`);
      } else {
        let errorMsg = `❌ API connection failed: ${data.error || 'Unknown error'}`;
        if (data.statusCode) {
          errorMsg += ` (${data.statusCode})`;
        }
        setTestResult(errorMsg);
      }
    } catch (error) {
      setTestResult(`❌ API test error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Coinbase API Diagnostics</h1>
      </div>

      <div className={styles.content} style={{ maxWidth: "800px", margin: "0 auto" }}>
        <section>
          <h2>API Credentials Diagnostic</h2>
          
          {isLoading ? (
            <p>Loading diagnostic information...</p>
          ) : diagnostic ? (
            <div>
              <h3>Status: {diagnostic.success ? '✅ Complete' : '❌ Failed'}</h3>
              <p>{diagnostic.message}</p>
              
              {diagnostic.diagnostics && (
                <div>
                  <h3>Credential Check</h3>
                  <div className={styles.positionsTable}>
                    <table>
                      <tbody>
                        <tr>
                          <td>API Credentials Present:</td>
                          <td>{diagnostic.diagnostics.hasCredentials ? '✅ Yes' : '❌ No'}</td>
                        </tr>
                        <tr>
                          <td>API Key Format:</td>
                          <td>
                            Length: {diagnostic.diagnostics.keyFormat.length}<br/>
                            Prefix: {diagnostic.diagnostics.keyFormat.prefix}...<br/>
                            Suffix: ...{diagnostic.diagnostics.keyFormat.suffix}<br/>
                            UUID Format: {diagnostic.diagnostics.keyFormat.isUuidFormat ? '✅ Yes' : '❌ No'}<br/>
                            Standard API Key: {diagnostic.diagnostics.keyFormat.mightBeStandardApiKey ? '✅ Possibly' : '❌ Unlikely'}
                            
                            {diagnostic.diagnostics.keyFormat.isCdpKeyUsedForRestApi && (
                              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fee', borderRadius: '4px' }}>
                                <strong>⚠️ Issue Detected:</strong> You are using CDP API credentials for the Coinbase REST API.
                                These are different systems and require different API keys.
                              </div>
                            )}
                            
                            {diagnostic.diagnostics.keyFormat.recommendCreateNewKey && (
                              <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#e8f5e9', borderRadius: '4px' }}>
                                <strong>Recommendation:</strong> Create a new API key in your Coinbase account settings.
                                <br />
                                <a href="/coinbase-setup" style={{ color: '#4CAF50' }}>View setup instructions</a>
                              </div>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>API Secret Format:</td>
                          <td>
                            Length: {diagnostic.diagnostics.secretFormat.length}<br/>
                            Base64 Characters: {diagnostic.diagnostics.secretFormat.hasBase64Chars ? '✅ Yes' : '❌ No'}<br/>
                            Contains '+': {diagnostic.diagnostics.secretFormat.containsPlus ? '✅ Yes' : '❌ No'}<br/>
                            Contains '/': {diagnostic.diagnostics.secretFormat.containsSlash ? '✅ Yes' : '❌ No'}<br/>
                            Contains '=': {diagnostic.diagnostics.secretFormat.containsEquals ? '✅ Yes' : '❌ No'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3>Environment Variables</h3>
                  <div className={styles.positionsTable}>
                    <table>
                      <tbody>
                        <tr>
                          <td>COINBASE_API_KEY:</td>
                          <td>{diagnostic.diagnostics.environmentVariables.hasApiKey ? '✅ Set' : '❌ Missing'}</td>
                        </tr>
                        <tr>
                          <td>COINBASE_API_SECRET:</td>
                          <td>{diagnostic.diagnostics.environmentVariables.hasApiSecret ? '✅ Set' : '❌ Missing'}</td>
                        </tr>
                        <tr>
                          <td>CDP_API_KEY_ID:</td>
                          <td>{diagnostic.diagnostics.environmentVariables.hasCdpApiKeyId ? '✅ Set' : '❌ Missing'}</td>
                        </tr>
                        <tr>
                          <td>CDP_API_KEY_SECRET:</td>
                          <td>{diagnostic.diagnostics.environmentVariables.hasCdpApiKeySecret ? '✅ Set' : '❌ Missing'}</td>
                        </tr>
                        <tr>
                          <td>CDP_WALLET_SECRET:</td>
                          <td>{diagnostic.diagnostics.environmentVariables.hasCdpWalletSecret ? '✅ Set' : '❌ Missing'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {diagnostic.error && (
                <div>
                  <h3>Error</h3>
                  <pre style={{ background: '#fee', padding: '1rem', borderRadius: '4px' }}>{diagnostic.error}</pre>
                </div>
              )}
            </div>
          ) : (
            <p>Failed to load diagnostic information</p>
          )}
        </section>

        <section style={{ marginTop: '2rem' }}>
          <h2>Test API Connection</h2>
          <button 
            className={styles.actionButton}
            onClick={runApiTest} 
            disabled={isLoading}
          >
            Test Coinbase API
          </button>
          
          {testResult && (
            <div style={{ marginTop: '1rem' }}>
              <h3>Test Result</h3>
              <div 
                style={{ 
                  background: testResult.includes('✅') ? '#efe' : '#fee', 
                  padding: '1rem', 
                  borderRadius: '4px' 
                }}
              >
                {testResult}
                
                {testDetails && !testDetails.success && testDetails.recommendations && (
                  <div style={{ marginTop: '10px' }}>
                    <h4>Recommendations:</h4>
                    <ul>
                      {testDetails.recommendations.map((rec: string, idx: number) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                    
                    <div style={{ marginTop: '10px' }}>
                      <Link href="/coinbase-setup" style={{ color: '#4CAF50' }}>
                        View Setup Instructions
                      </Link>
                    </div>
                  </div>
                )}
                
                {testDetails && testDetails.success && testDetails.userData && (
                  <div style={{ marginTop: '10px' }}>
                    <h4>User Info:</h4>
                    <p>Name: {testDetails.userData.name}<br />
                    User ID: {testDetails.userData.user_id}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
        
        <section style={{ marginTop: '2rem' }}>
          <h2>Setup Instructions</h2>
          <p>
            To properly set up your Coinbase API credentials, follow the instructions in the{' '}
            <Link href="/coinbase-setup" style={{ color: '#4CAF50' }}>
              Coinbase API Setup Guide
            </Link>.
          </p>
          
          <div style={{ marginTop: '1rem' }}>
            <h3>Common Issues</h3>
            <ul>
              <li>Using CDP API credentials instead of Coinbase REST API credentials</li>
              <li>Missing required permissions on the API key</li>
              <li>API secret not correctly copied or formatted</li>
              <li>Two-factor authentication requirements</li>
            </ul>
          </div>
        </section>

        <footer className={styles.footer}>
          <Link href="/" className={styles.backButton}>
            ← Back to Mission Control
          </Link>
        </footer>
      </div>
    </main>
  );
}
