# 🎙️ ToastCraft AI — Event Speechwriter & Rehearsal Stage Coach

> **Never Freeze at the Podium Again.**
> ToastCraft AI transforms personal memories, inside jokes, and heartfelt gratitude into a standing-ovation speech in under 3 minutes—complete with real-time teleprompter rehearsal and stage-ready cue cards.

---

## 🌟 Hackathon Highlights & "Wow" Moments

1. **Context-Aware Guided Questionnaire**:
   - Tailors questions to the exact occasion (Best Man, Maid of Honor, Retirement, Eulogy, Farewell, Birthday Roast).
   - Extracts real memories, quirks, and admired virtues—avoiding generic, clichéd templates.
   - Includes **1-Click Pre-fill Sample Data** for effortless live testing.

2. **1-Click Tone Shifter & Length Controller**:
   - Seamlessly rewrite speeches across 4 distinct tones:
     - 😄 **Funny & Witty** (Affectionate roasts, comedic pauses, light teasing)
     - ❤️ **Heartfelt & Poignant** (Tearful sincerity, deep gratitude, emotional resonance)
     - ⚖️ **The Perfect Blend** (50% humor + 50% heart—the crowd pleaser)
     - 🏛️ **Formal & Poised** (Dignified, eloquent, and structured for banquets)
   - Real-time word count & duration targeting: Short (~2.5m), Medium (~4m), Long (~7m).

3. **Interactive Teleprompter & TTS Rehearsal Studio**:
   - Browser-native Web Speech API with zero external latency or cost.
   - **Karaoke Sentence Highlighting**: Text scrolls and highlights sentence-by-sentence in lockstep with the voice.
   - **Live WPM Pacing Gauge**: Flags if you are rushing (>165 WPM) or dragging (<115 WPM).
   - Click any sentence to jump the voice directly to that point.

4. **Printable Stage Cue Cards**:
   - Converts speeches into pocket-sized 4x6 index cards.
   - Automatically injects stage cues: `[PAUSE FOR LAUGHTER - 2s]`, `[LOOK AT BRIDE & GROOM]`, `[RAISE GLASS HIGH]`.
   - Download as PDF or print directly from browser.

5. **Delivery & Confidence Coach**:
   - Emotional Arc visualization (Hook $\rightarrow$ Story $\rightarrow$ Reflection $\rightarrow$ Toast).
   - Tone balance analyzer (% Humor, % Emotion, % Formality).
   - **4-7-8 Stage Fright Breathing Calmer**: Interactive animated circle to lower heart rate before taking the stage.
   - Tactical stage presence guide (Eye contact quadrants, choke recovery protocol).

6. **Dual AI Engine with 100% Demo Uptime**:
   - Supports **Google Gemini API** (`gemini-2.5-flash`) and **OpenAI API**.
   - Features a built-in **Smart Offline Generation Engine** that guarantees the application works flawlessly during hackathon presentations even without internet or API keys.

---

## 🚀 2-Minute Judge Demo Flow

1. **Landing Page**:
   - View the value proposition.
   - Test the **Live Interactive Tone Transformer** widget to see how the excerpt instantly changes from Funny $\leftrightarrow$ Heartfelt $\leftrightarrow$ Formal.
2. **Launch a Demo**:
   - Click **"Instant Demo: Jack's Best Man Speech"** on the hero or click the **"Try Demo Scenarios"** button in the navbar.
   - Notice how personal details (the college road trip radiator breakdown, the 14-tab paper towel spreadsheet, the rooftop bakery first date) are woven into a moving, funny speech.
3. **Tone Shifting**:
   - In the Studio, click **"😄 Funny"** to watch the speech rewrite into a witty roast.
   - Click **"❤️ Heartfelt"** to see it transform into an intimate tear-jerker.
4. **Rehearsal Studio**:
   - Click **"Practice & Rehearse"**.
   - Hit **Play** and listen to the speech read aloud while each sentence lights up in gold karaoke style.
   - Adjust speed (0.8x, 1.0x, 1.25x) and watch the WPM gauge update.
5. **Stage Cue Cards & Export**:
   - Click **"Cue Cards"** to flip through index cards with stage directions (`[PAUSE FOR LAUGHTER]`).
   - Click **"PDF"** to export the clean podium reading sheet.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti
- **Text-to-Speech**: Web Speech API (SpeechSynthesis & SpeechSynthesisUtterance)
- **PDF Generation**: jsPDF (custom podium sheets and 4x6 cue card layouts)
- **Backend**: Node.js, Express, CORS, Dotenv
- **AI Integration**: Google Gemini API REST client, OpenAI API client, and local algorithmic fallback engine
- **Build Tool**: Vite 6, Concurrently

---

## 💻 How to Run Locally

### Prerequisites
- Node.js v18+ and npm installed

### 1. Clone & Install Dependencies
```bash
cd "hackathon ideastorm"
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the root directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```
*(If no API key is provided, the application runs in Smart Offline Mode with 100% functionality).*

### 3. Start Full-Stack Application
```bash
npm run dev
```
This runs both the backend Express server (port `5000`) and the Vite client (port `5173`) concurrently.

Open your browser to: **`http://localhost:5173`**

---

## 📁 Project Structure

```
hackathon-ideastorm/
├── server/
│   ├── controllers/
│   │   └── speechController.js     # LLM calls (Gemini/OpenAI) + smart offline generator
│   ├── prompts/
│   │   └── speechPrompts.js        # Prompt templates for generation, tone, length & cards
│   └── index.js                    # Express API server & routes
├── src/
│   ├── components/
│   │   ├── Coach/
│   │   │   └── ConfidenceCoachModal.tsx  # Pacing score, 4-7-8 breathing, stage playbook
│   │   ├── CueCards/
│   │   │   └── CueCardViewer.tsx         # 4x6 index cards, stage directions, print/PDF
│   │   ├── Editor/
│   │   │   └── SpeechEditor.tsx          # Word stats, tone switcher, drafts, AI polish
│   │   ├── Questionnaire/
│   │   │   └── QuestionnaireModal.tsx    # Multi-step questions, pre-fill sample button
│   │   ├── Rehearsal/
│   │   │   └── RehearsalStudio.tsx       # Teleprompter, TTS karaoke sync, WPM gauge
│   │   ├── SavedProjects/
│   │   │   └── SavedProjectsModal.tsx    # Project history & management
│   │   ├── DemoMenuModal.tsx             # 1-click pre-filled scenarios for judges
│   │   ├── LandingPage.tsx               # Hero, live preview widget, how it works
│   │   ├── Navbar.tsx                    # Header, navigation, status indicators
│   │   └── SettingsModal.tsx             # In-app API key & engine configuration
│   ├── data/
│   │   ├── demoScenarios.ts        # Pre-built realistic speeches (Best Man, MOH, Retirement)
│   │   └── questionTemplates.ts    # Question definitions & advice per speech type
│   ├── services/
│   │   ├── api.ts                  # REST API client with offline fallback
│   │   ├── deliveryAnalyzer.ts     # Speech pacing, emotional arc & tone breakdown
│   │   ├── pdfExporter.ts          # jsPDF podium sheet & cue card document generator
│   │   └── speechSynthesis.ts      # Web Speech API controller with sentence chunking
│   ├── types/
│   │   └── speech.ts               # TypeScript interfaces & types
│   ├── App.tsx                     # Main application container & view manager
│   ├── index.css                   # Tailwind styles, glassmorphism & soundwaves
│   └── main.tsx                    # React DOM root entrypoint
├── index.html                      # HTML template with Google Fonts (Playfair + Inter)
├── package.json                    # Full-stack scripts & dependencies
├── tailwind.config.js              # Theme configuration with champagne gold palette
├── tsconfig.json                   # TypeScript bundler configuration
└── vite.config.ts                  # Vite configuration with /api backend proxy
```

---

## 🏆 Hackathon Judge Evaluation Checklist

| Criteria | ToastCraft AI Implementation |
| :--- | :--- |
| **Problem Value** | Public speaking and speech panic affects millions; professional speechwriters cost \$500+. |
| **User Experience** | Multi-step questionnaire eliminates blank page paralysis; pre-fills allow 10-second demos. |
| **AI Innovation** | Structured prompt engineering preserves authentic stories while shifting comedic or emotional tone. |
| **"Wow" Factor** | Live Web Speech API teleprompter with synchronized sentence spotlighting and stage cue cards. |
| **Stage Readiness** | 4-7-8 breathing exercise, WPM pacing gauge, and PDF podium cue sheets. |
| **Reliability** | Dual-engine architecture guarantees zero crashes during live demonstrations. |
