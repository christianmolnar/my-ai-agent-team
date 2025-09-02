# Test Implementation Plan for AI Personal Team

This document outlines the specific plan for implementing automated testing across the AI Personal Team application, focusing especially on the Memorias-AI agent we've recently developed.

## 1. Test Environment Setup

### 1.1 Dependencies

First, install the required testing frameworks and utilities:

```bash
cd ai-personal-team
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom supertest msw playwright @playwright/test
```

### 1.2 Configuration

Create the following configuration files:

**jest.config.js**
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'agents/**/*.ts',
    'app/**/*.tsx',
    'pages/api/**/*.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**jest.setup.js**
```javascript
import '@testing-library/jest-dom';

// Mock global fetch
global.fetch = jest.fn();

// Mock environment variables
process.env.OPENAI_API_KEY = 'test-key';
```

**playwright.config.ts**
```typescript
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'Chrome',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
  ],
};

export default config;
```

## 2. Unit Tests

### 2.1 Agent Tests

Create tests for the key agent functions:

**File: `agents/__tests__/whisper_transcribe.test.ts`**
```typescript
import { transcribeAudio } from '../whisper_transcribe';

// Mock OpenAI client
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: jest.fn().mockResolvedValue({ text: 'Mocked transcription text' })
      }
    }
  }))
}));

describe('whisper_transcribe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call OpenAI with correct parameters', async () => {
    const mockBuffer = Buffer.from('test audio data');
    const mockFileName = 'recording.mp3';
    
    const openai = require('openai').OpenAI.mock.results[0].value;
    const createSpy = jest.spyOn(openai.audio.transcriptions, 'create');
    
    const result = await transcribeAudio(mockBuffer, mockFileName);
    
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      file: expect.any(Object),
      model: 'whisper-1',
    }));
    expect(result).toBe('Mocked transcription text');
  });
  
  it('should include language parameter when provided', async () => {
    const mockBuffer = Buffer.from('test audio data');
    const mockFileName = 'recording.mp3';
    const language = 'es';
    
    const openai = require('openai').OpenAI.mock.results[0].value;
    const createSpy = jest.spyOn(openai.audio.transcriptions, 'create');
    
    await transcribeAudio(mockBuffer, mockFileName, language);
    
    expect(createSpy).toHaveBeenCalledWith(expect.objectContaining({
      language: 'es'
    }));
  });
  
  it('should throw an error when API call fails', async () => {
    const mockError = new Error('API Error');
    const openai = require('openai').OpenAI.mock.results[0].value;
    
    jest.spyOn(openai.audio.transcriptions, 'create').mockRejectedValueOnce(mockError);
    
    const mockBuffer = Buffer.from('test audio data');
    const mockFileName = 'recording.mp3';
    
    await expect(transcribeAudio(mockBuffer, mockFileName)).rejects.toThrow('API Error');
  });
});
```

**File: `agents/__tests__/MemoriasAI.test.ts`**
```typescript
import { MemoriasAI } from '../MemoriasAI';

// This would need to be expanded based on the actual implementation
describe('MemoriasAI', () => {
  it('should initialize with correct properties', () => {
    const agent = new MemoriasAI();
    expect(agent.name).toBe('Memorias-AI');
    expect(agent.description).toContain('Argentine Spanish stories');
  });
});
```

### 2.2 API Route Tests

Create tests for the API endpoints:

**File: `pages/api/__tests__/transcribe-audio.test.ts`**
```typescript
import { createMocks } from 'node-mocks-http';
import handler from '../transcribe-audio';

// Mock the whisper_transcribe module
jest.mock('../../../agents/whisper_transcribe', () => ({
  transcribeAudio: jest.fn().mockResolvedValue('Mocked transcription')
}));

// Mock formidable
jest.mock('formidable', () => ({
  IncomingForm: jest.fn().mockImplementation(() => ({
    parse: (req, callback) => {
      callback(null, {}, { 
        audioFile: [{ 
          filepath: '/tmp/mock-file.mp3', 
          originalFilename: 'recording.mp3',
          mimetype: 'audio/mp3' 
        }]
      });
    }
  }))
}));

// Mock fs
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue(Buffer.from('mock audio data')),
  promises: {
    readFile: jest.fn().mockResolvedValue(Buffer.from('mock audio data')),
  }
}));

describe('Transcribe Audio API', () => {
  it('should return transcription when valid audio is provided', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data; boundary=boundary',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toEqual({ text: 'Mocked transcription' });
  });

  it('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });
});
```

## 3. Integration Tests

Create tests that verify the integration between components:

**File: `tests/integration/memorias-ai-flow.test.ts`**
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MemoriasAIPage from '../../app/memorias-ai/page';

// Setup mock server
const server = setupServer(
  rest.post('/api/transcribe-audio', (req, res, ctx) => {
    return res(ctx.json({ text: 'Test transcription response' }));
  })
);

describe('Memorias-AI Integration Flow', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // This test would need to be adapted based on actual component implementation
  it('should submit audio and display transcription', async () => {
    // Mock MediaRecorder API
    // This would need more setup for a real test
    global.MediaRecorder = jest.fn().mockImplementation(() => ({
      start: jest.fn(),
      stop: jest.fn(),
      addEventListener: jest.fn(),
      state: 'inactive',
    }));

    render(<MemoriasAIPage />);
    
    // Find and click record button
    const recordButton = screen.getByRole('button', { name: /record/i });
    fireEvent.click(recordButton);
    
    // Simulate audio recording completion
    // This would need to be adapted to your component's actual behavior
    
    // Wait for transcription to appear
    await waitFor(() => {
      expect(screen.getByText('Test transcription response')).toBeInTheDocument();
    });
  });
});
```

## 4. E2E Tests

Create end-to-end tests that verify the complete user experience:

**File: `tests/e2e/memorias-ai.spec.ts`**
```typescript
import { test, expect } from '@playwright/test';

test('Memorias-AI recording and transcription flow', async ({ page }) => {
  // Navigate to the Memorias-AI page
  await page.goto('/memorias-ai');
  
  // This test would need adaptations for real browser testing
  // Particularly since browser permissions for microphone access are required
  
  // Check that the page loads with expected elements
  await expect(page.getByRole('heading', { name: 'Memorias-AI' })).toBeVisible();
  await expect(page.getByRole('button', { name: /record/i })).toBeEnabled();
  
  // For a complete E2E test, we would need to:
  // 1. Handle microphone permissions
  // 2. Mock or intercept the audio recording
  // 3. Verify the transcription appears
  
  // Example verification
  await expect(page.getByText('Ready to record your stories in Argentine Spanish')).toBeVisible();
});
```

## 5. CI/CD Integration

Create a GitHub Actions workflow to run tests automatically:

**File: `.github/workflows/test.yml`**
```yaml
name: Test Suite

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run linting
        run: npm run lint
        
      - name: Run unit tests
        run: npm test
        
      - name: Build application
        run: npm run build
        
      - name: Run integration tests
        run: npm run test:integration
        
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          
  e2e:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
        
      - name: Build application
        run: npm run build
        
      - name: Start application
        run: npm start &
        
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload E2E test artifacts
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## 6. Package.json Scripts

Add these scripts to your package.json:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config=jest.integration.config.js",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
  }
}
```

## 7. Monitoring and Reporting

### 7.1 Test Reports Dashboard

Set up a test reporting dashboard using either:
- GitHub Pages with Jest HTML reporter
- CodeCov for coverage visualization
- A dedicated dashboard service like Allure

### 7.2 Quality Gates

Implement these quality gates in your CI/CD pipeline:

1. **PR Gate**:
   - All unit tests must pass
   - Code coverage must not decrease
   - No TypeScript errors
   - No ESLint errors

2. **Merge Gate**:
   - All integration tests must pass
   - Security scan must pass

3. **Deployment Gate**:
   - All E2E tests must pass on staging
   - Performance tests must meet benchmarks

## 8. Implementation Timeline

1. **Week 1**: Set up testing frameworks and write initial unit tests
2. **Week 2**: Implement API and integration tests
3. **Week 3**: Set up E2E testing framework and write basic smoke tests
4. **Week 4**: Configure CI/CD pipeline and reporting

## 9. Test Maintenance Plan

- Review and update tests with each feature release
- Conduct monthly test suite review to identify flaky or outdated tests
- Rotate testing responsibilities among team members
- Document test failures and their resolutions for knowledge sharing
