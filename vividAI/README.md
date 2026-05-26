<div align="center">

  <h2>Vivid AI - a Trivia Arena</h2>

  <div align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" />
  </div>
</div>

## 📋 <a name="table">Table of Contents</a>

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🤸 [Quick Start](#quick-start)

## <a name="introduction">🤖 Introduction</a>

Welcome to **Vivid AI - a Trivia Arena**! Our goal is to develop an immersive, visually stunning, and highly responsive web application that brings a dynamic, AI-powered trivia game to the digital world. This project serves as a comprehensive showcase for a modern gaming experience where players can configure match parameters, choose topic domains, and test their knowledge against specialized AI host personalities.

Built from the ground up utilizing **React**, modern **TailwindCSS**, **Node.js**, **Express**, and the **Google Gemini AI API** (powered by the lightning-fast **Vite** build tool and **TypeScript**), the application emphasizes best practices in modern full-stack web development. We achieve a premium, polished user experience by incorporating dynamic animations powered by **Motion**, custom sound synthesized in real-time with the **Web Audio API**, and real-time interactive host dialogues.

## <a name="tech-stack">⚙️ Tech Stack</a>

- React 19
- Tailwind CSS v4
- Motion (Framer Motion)
- Google Gemini API (`@google/genai`)
- Node.js
- Express.js
- TypeScript
- Vite

## <a name="features">🔋 Features</a>

👉 **Generative AI Questions**: Instantly generate sets of unique trivia questions using `gemini-3.5-flash` across different topics and difficulties.

👉 **Dynamic AI Host Personalities**: Match wits with 5 distinct simulated personalities, each reacting dynamically with custom comments, emojis, and specific dialogue styling.

👉 **Live Banter Thread**: Engage in real-time conversational chat with your selected host, receiving contextual, character-accurate replies.

👉 **Smart Hint Synthesis**: Request hints generated on-the-fly in the host's voice, narrowing your focus without giving away the final answer.

👉 **Real-Time Sound Synthesis**: Programmatic game audio chimes, alerts, and win fanfares generated dynamically using the Web Audio API without loading external media files.

👉 **Fluid Animations & Dark Aesthetics**: Elegant glassmorphism, responsive grid layouts, custom transition animations (powered by `motion`), and a beautiful retro-modern dark theme.

👉 **Complete Performance Telemetry**: Tracking game metrics such as speed-based points, answer streaks, total time, and an automated custom host evaluation.

all these while creating the Trivia Arena website with,

- Arena Header with live score, streak trackers, and audio mute controller
- Dynamic Game Configuration Lobby (Host, Category, Difficulty, and Question Count selection)
- Interactive Presenter Card with dialogue display, hint button, and banter thread chat
- Countdown Timer Bar with tense speed-based countdowns
- Multiple-choice Interactive Question Deck
- Performance Recap Board with a personalized host evaluation bubble

## <a name="quick-start">🤸 Quick Start</a>

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/en) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation & Configuration

1. **Clone the repository** (if you haven't already):

    ```bash
    git clone https://github.com/itzzSVR-tech/ShadowFox.git
    cd ShadowFox/vividAI
    ```

2. **Install dependencies**:

    ```bash
    npm install
    ```

3. **Configure environment variables**:
   Create a `.env` file in the root of the `vividAI` directory and add your Google Gemini API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

### Running the Project

Start the local development server:

```bash
npm run dev
```

The server will spin up and the application will be accessible at `http://0.0.0:3000`.

### Building for Production

To build both the frontend and backend bundle for production:

```bash
npm run build
```

To run the production bundle locally:

```bash
npm start
```
