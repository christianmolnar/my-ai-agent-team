# Main Homepage UI Design Specification

## Purpose
Create a visually engaging, modern, and intuitive homepage for the AI Agent Team application. The homepage should provide a clear overview of the system, easy navigation, and a welcoming entry point for users.

## Layout Structure
- **Header:**
  - Application logo and name (left)
  - Navigation links (right): Home, Agents, About, Settings
  - Sticky or fixed at the top
- **Hero Section:**
  - Large, bold title (e.g., "Welcome to Your AI Agent Team")
  - Short description/subtitle
  - Call-to-action button (e.g., "Meet Your Agents")
  - Background gradient or subtle illustration
- **Status/Overview Section:**
  - System status (e.g., "All systems operational")
  - Quick stats: number of agents, active tasks, recent activity
  - Visual indicators (icons, color coding)
- **Agent Cards Grid:**
  - Responsive grid of agent cards (3-4 per row on desktop, 1-2 on mobile)
  - Each card shows:
    - Agent avatar/icon
    - Name and role
    - Status (active/idle/working, with color dot)
    - Short description
    - Button/link to agent details or chat
  - Hover/focus effects for interactivity
- **Footer:**
  - Copyright, links to documentation, support, etc.

## Visual Style
- **Color Palette:**
  - Dark background (e.g., slate/gray/black)
  - Accent colors: orange, blue, green for status and highlights
  - White/gray text for readability
- **Typography:**
  - Bold, modern sans-serif fonts
  - Clear hierarchy: large headers, medium subheaders, readable body text
- **Spacing & Sizing:**
  - Generous padding and margin for clarity
  - Rounded corners on cards and buttons
- **Responsiveness:**
  - Mobile-first, scales up to desktop
  - Grid collapses to single column on small screens

## Interactivity
- **Navigation:**
  - Top nav bar with clear active state
  - Agent cards clickable for details/chat
- **Feedback:**
  - Loading spinners, hover/focus states, error/success toasts

## Accessibility
- Sufficient color contrast
- Keyboard navigable
- ARIA labels for interactive elements

---

# Agent Page UI Design Specification

## Purpose
Provide a focused, interactive workspace for engaging with a specific agent (e.g., Personal Assistant). The page should feel like a modern chat/assistant interface.

## Layout Structure
- **Header:**
  - Back button (to agents list)
  - Agent avatar/icon, name, and status
  - Short description
- **Capabilities Section:**
  - List or grid of agent capabilities (icons or badges)
- **Chat Interface:**
  - Scrollable chat window with chat bubbles (user and agent)
  - Agent avatar for agent messages, user avatar for user messages
  - Timestamps (optional)
  - Loading indicator for agent thinking
- **Input Area:**
  - Text input field (full width)
  - Send button (prominent, accessible)
  - Optionally, quick action buttons (e.g., "Schedule Meeting")
- **Footer:**
  - Link to agent documentation or feedback

## Visual Style
- **Color Palette:**
  - Consistent with homepage (dark background, accent colors)
  - Chat bubbles: blue for user, gray/orange for agent
- **Typography:**
  - Clear, readable, modern
- **Spacing & Sizing:**
  - Comfortable padding, rounded corners
- **Responsiveness:**
  - Mobile-friendly, chat window resizes gracefully

## Interactivity
- **Chat:**
  - Smooth scroll to latest message
  - Loading spinner for agent response
  - Error handling for failed messages
- **Navigation:**
  - Back button always visible

## Accessibility
- Keyboard accessible
- ARIA labels for chat and input
- Sufficient color contrast

---

## Team Activity Panel (Personal Assistant Page)

### Purpose
Show real-time status of which agents are being consulted, what each is working on, and their progress.

### Layout
- Sidebar or section on the Personal Assistant page
- Each entry includes:
  - Agent avatar/icon
  - Agent name
  - Status (consulting, waiting, responded)
  - One-line summary of the subtask
- Updates in real time as the Personal Assistant delegates and receives responses

### Visual Style
- Consistent with chat UI (dark background, accent colors)
- Status icons (spinner for in-progress, check for done, etc.)
- Collapsible or always visible

### Interactivity
- Hover for more detail (optional)
- Click to view agent’s full response (optional)

---

## Multi-Agent Deliverable Workflow

### Use Case Example: Music Masterclass Request

#### Input
- User provides a narrative (e.g., "Create a master class on New Orleans Piano in the style of Dr. John...")
- User may provide links (e.g., YouTube video)

#### Team Workflow
- Personal Assistant parses the request and delegates:
  - **Music Coach:** Analyzes style, creates lesson plan, writes instructions
  - **Researcher:** Finds relevant videos, articles, and resources
  - **Image/Video Generator:** Prepares diagrams, sheet music, or video snippets
  - **Writer/Editor:** Ensures clarity, structure, and polish
- Each agent’s contribution is tracked in the Team Activity panel
- Personal Assistant compiles all contributions

#### Output (Deliverable)
- Written instruction (step-by-step, clear, and structured)
- Piano chords and musical notation (bass, treble, both hands)
- Embedded or linked video tutorials
- Additional resources (listening, exercises, etc.)
- Optionally: Audio snippets, MIDI files, interactive sheet music
- Compiled as a downloadable PDF or Word doc (using Pandoc or similar)
- UI provides a “Download” button for the final deliverable

### Technical Notes
- Use a document assembly pipeline (Markdown → Pandoc → PDF/Word)
- Store intermediate assets in a temp workspace
- Support for rich media and links in the final document

---

## Notes
- All UI should use Tailwind CSS for rapid, consistent styling
- Use Next.js best practices for routing and data fetching
- Prioritize clarity, usability, and a welcoming experience
