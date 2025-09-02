"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../f-insight-ai/f-insight-ai.module.css";

export default function CoinbaseSetup() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // Prevent hydration issues
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Setting Up Coinbase API Access</h1>
      </div>

      <div className={styles.content} style={{ maxWidth: "800px", margin: "0 auto", padding: "0 20px" }}>
        <section>
          <h2>Understanding the Issue</h2>
          <p>
            We're currently experiencing a <code>401 Unauthorized</code> error when trying to access the Coinbase API. 
            This indicates that there's an issue with the API credentials being used.
          </p>

          <h2>Coinbase API vs CDP API</h2>
          <p>There are two different types of API credentials being used:</p>
          
          <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
            <h3>1. Coinbase Developer Platform (CDP)</h3>
            <p>Used for blockchain and wallet interactions</p>
            <ul>
              <li>Variables: <code>CDP_API_KEY_ID</code>, <code>CDP_API_KEY_SECRET</code>, <code>CDP_WALLET_SECRET</code>, <code>CDP_ADDRESS</code></li>
              <li>Format: UUID-style keys (<code>218d7e0b-caf9-437f-adaa-44952cfafe7e</code>)</li>
            </ul>
          </div>

          <div style={{ margin: "20px 0", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
            <h3>2. Coinbase REST API</h3>
            <p>Used for account/trading data</p>
            <ul>
              <li>Variables: <code>COINBASE_API_KEY</code>, <code>COINBASE_API_SECRET</code></li>
              <li>Format: Typically longer alphanumeric strings, not UUID format</li>
            </ul>
          </div>

          <h2>How to Create Proper Coinbase API Keys</h2>
          <p>Follow these steps to create the correct API keys for the Coinbase REST API:</p>
          
          <ol style={{ lineHeight: "1.6" }}>
            <li>Log in to your Coinbase account at <a href="https://www.coinbase.com/" target="_blank" style={{ color: "#4CAF50" }}>https://www.coinbase.com/</a></li>
            <li>Go to Settings → API</li>
            <li>Click "New API Key"</li>
            <li>
              Select the following permissions:
              <ul>
                <li><strong>wallet:accounts:read</strong> (required)</li>
                <li><strong>wallet:transactions:read</strong> (required)</li>
                <li><strong>wallet:buys:read</strong> (optional)</li>
                <li><strong>wallet:sells:read</strong> (optional)</li>
              </ul>
            </li>
            <li>Set a nickname for the key (e.g., "Personal Assistant")</li>
            <li>Complete any security verification steps</li>
            <li>Copy both the API Key and API Secret</li>
          </ol>
          
          <div style={{ margin: "20px 0" }}>
            <img 
              src="https://developer.coinbase.com/static/images/api_keys.png" 
              alt="Coinbase API Key Creation" 
              style={{ maxWidth: "100%", border: "1px solid #ddd", borderRadius: "5px" }} 
            />
          </div>

          <h2>Update Your Environment Variables</h2>
          <p>Once you have the new API key and secret, update your <code>.env.local</code> file:</p>
          
          <pre style={{ backgroundColor: "#f5f5f5", padding: "15px", borderRadius: "5px", overflow: "auto" }}>
{`# Coinbase REST API credentials
COINBASE_API_KEY=your_new_api_key_here
COINBASE_API_SECRET=your_new_api_secret_here`}
          </pre>

          <h2>Testing Your API Key</h2>
          <p>After updating your environment variables, you can test your API connection by:</p>
          
          <ol>
            <li>Visiting <Link href="/coinbase-diagnostic" style={{ color: "#4CAF50" }}>/coinbase-diagnostic</Link> in your browser</li>
            <li>Check the console logs for authentication status</li>
            <li>Try the Crypto tab in the Financial Insights section</li>
          </ol>

          <h2>Important Notes</h2>
          <ul>
            <li>The Coinbase REST API requires specific permissions to access your account data</li>
            <li>API keys from the Coinbase Developer Platform (CDP) cannot be used with the REST API</li>
            <li>For security, never share your API Secret with anyone</li>
            <li>Consider using an API key with read-only permissions for better security</li>
          </ul>

          <div style={{ marginTop: "40px", padding: "15px", backgroundColor: "#e8f5e9", borderRadius: "5px" }}>
            <h3>Need More Help?</h3>
            <p>
              For more detailed information, visit the{" "}
              <a href="https://docs.cloud.coinbase.com/sign-in-with-coinbase/docs/api-key-authentication" target="_blank" style={{ color: "#4CAF50" }}>
                official Coinbase API documentation
              </a>.
            </p>
          </div>
        </section>

        <footer className={styles.footer} style={{ marginTop: "40px" }}>
          <Link href="/coinbase-diagnostic" className={styles.backButton} style={{ marginRight: "20px" }}>
            ← Back to Diagnostics
          </Link>
          <Link href="/" className={styles.backButton}>
            ← Back to Mission Control
          </Link>
        </footer>
      </div>
    </main>
  );
}
