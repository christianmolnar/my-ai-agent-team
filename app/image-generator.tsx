"use client";

import React, { useState } from 'react';
import prompts from '../data/imagePrompts';
import styles from './image-generator.module.css';

export default function ImageGeneratorPage() {
  const [selectedPrompt, setSelectedPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePromptChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrompt(e.target.value);
    setCustomPrompt('');
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
    setSelectedPrompt('');
  };

  const handleReferenceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReferenceImage(e.target.value);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    try {
      const prompt = customPrompt || selectedPrompt;
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: 'communications',
          task: {
            type: 'Generate Image',
            payload: {
              prompt,
              referenceImagePath: referenceImage,
              aspectRatio: '16:9',
              resolution: '1792x1024',
            },
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setImageUrl(data.result);
      } else {
        setError(data.error || 'Image generation failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Image Generator</h1>
      <label htmlFor="prompt-select">Choose a prompt:</label>
      <select id="prompt-select" value={selectedPrompt} onChange={handlePromptChange}>
        <option value="">-- Select a prompt --</option>
        {prompts.map((p, i) => (
          <option key={i} value={p}>{p.slice(0, 80)}...</option>
        ))}
      </select>
      <div>or paste a new prompt:</div>
      <textarea
        rows={6}
        value={customPrompt}
        onChange={handleCustomPromptChange}
        placeholder="Paste or write your own prompt here..."
        style={{ width: '100%', marginBottom: 12 }}
      />
      <div>
        <label htmlFor="reference-image">Reference image filename (in /public/uploads):</label>
        <input
          id="reference-image"
          type="text"
          value={referenceImage}
          onChange={handleReferenceImageChange}
          placeholder="e.g. zrgivbfojuayvcfbfuqlq8klf.jpg"
          style={{ width: '100%', marginBottom: 12 }}
        />
      </div>
      <button onClick={handleGenerate} disabled={loading || !(customPrompt || selectedPrompt)}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
      {imageUrl && (
        <div className={styles.result}>
          <h2>Generated Image</h2>
          <img src={imageUrl} alt="Generated" style={{ maxWidth: '100%' }} />
        </div>
      )}
    </div>
  );
}
