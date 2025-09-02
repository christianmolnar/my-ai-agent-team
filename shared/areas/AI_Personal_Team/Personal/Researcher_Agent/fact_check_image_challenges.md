# Fact-Checking Images: Challenges and Categories

## 1. Images of Objects/People (possibly altered or staged)
- **Authenticity:** Is the image original, altered, or AI-generated (deepfake, Photoshop, etc.)?
- **Context:** What is the real context—when, where, and why was the photo taken?
- **Reverse Image Search:** Find earliest known appearance and other uses to check for manipulation or misattribution.
- **Provenance:** Trace the source and verify if the image is being used to represent something it does not.

## 2. Images with Text Captions (real or fake context)
- **Caption-Image Consistency:** Does the caption match the actual content and context of the image?
- **Meme/Overlay Text:** Detect and extract overlaid text (using OCR) to fact-check the claim separately.
- **Manipulated Captions:** Is the caption misleading, fabricated, or added to a real image to change its meaning?

## 3. Images of Text (claims, paragraphs, screenshots)
- **OCR Accuracy:** Extract text reliably from the image (quality, font, background noise can affect this).
- **Source Verification:** Is the text a real quote, a fabricated statement, or a misattributed claim?
- **Fact-Checking the Extracted Text:** Run the extracted claim through the same fact-checking pipeline as typed text.

## 4. Images of Articles (possibly altered or faked)
- **Publication Authenticity:** Does the article actually exist on the claimed publication’s website?
- **Alteration Detection:** Has the article’s content, headline, or byline been changed (e.g., via image forensics or comparing with archived versions)?
- **Source Trustworthiness:** Is the publication reputable and is the article consistent with their editorial standards?

## Technical/Implementation Challenges
- **OCR Quality:** Handling low-resolution, noisy, or stylized text.
- **Image Forensics:** Detecting manipulations (e.g., Photoshop, deepfakes) requires advanced tools and is not always reliable.
- **Reverse Image Search APIs:** Many are rate-limited, paid, or have limited accuracy.
- **Contextual Reasoning:** Even with all data, determining intent and context can be ambiguous and may require human judgment.
- **Scalability:** Automated tools may not catch subtle or novel manipulations.
