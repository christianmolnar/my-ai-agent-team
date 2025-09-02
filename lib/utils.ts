import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a story with proper paragraph breaks while preserving original punctuation
 */
export function formatStoryText(text: string): string {
  if (!text || text.trim().length === 0) {
    return text;
  }

  let formatted = text.trim();

  // Only do very conservative formatting to preserve the original text
  // Just ensure the first letter is capitalized
  formatted = formatted.replace(/^\w/g, (match) => match.toUpperCase());
  
  // Split into sentences for paragraph creation, but be more conservative
  // Look for actual sentence endings (periods, exclamation marks, question marks)
  const sentences = formatted.split(/([.!?]+\s+)/);
  const paragraphs: string[] = [];
  let currentParagraph = '';
  let sentenceCount = 0;
  
  for (let i = 0; i < sentences.length; i += 2) {
    const sentence = sentences[i]?.trim();
    const punctuation = sentences[i + 1] || '';
    
    if (!sentence) continue;
    
    currentParagraph += sentence + punctuation;
    sentenceCount++;
    
    // Create paragraph breaks at natural points, but be more conservative
    const shouldBreak = (
      sentenceCount >= 3 && (
        sentence.match(/\b(entonces|después|luego|más tarde|al día siguiente|años después|tiempo después|en un momento|después de eso)\b/i) ||
        sentence.match(/\b(recuerdo que|me acuerdo|otra vez|también|además|por otro lado)\b/i) ||
        currentParagraph.length > 300
      )
    );
    
    if (shouldBreak) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = '';
      sentenceCount = 0;
    }
  }
  
  // Add any remaining content
  if (currentParagraph.trim().length > 0) {
    paragraphs.push(currentParagraph.trim());
  }
  
  // If no natural breaks were found, just return the original text
  if (paragraphs.length <= 1) {
    return formatted;
  }
  
  // Join paragraphs with double line breaks for HTML display
  return paragraphs.filter(p => p.trim().length > 0).join('\n\n');
}
