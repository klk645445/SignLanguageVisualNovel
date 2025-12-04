# Common Ground - Sign Language Visual Novel

An interactive visual novel game built with Next.js that helps players learn about interacting with deaf and hard of hearing individuals. Features LLM-powered dynamic conversations using Google's Gemini API.

## Features

- 🎮 Interactive visual novel gameplay with branching storylines
- 🤖 LLM-powered dynamic character responses using Gemini API
- 🎵 Background music and sound effects
- 💬 Typewriter-style dialogue with text scroll sounds
- 📊 Relationship tracking system
- 🎨 Character sprites with multiple expressions
- 💾 Save/Load game state

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Google Gemini API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/klk645445/SignLanguageVisualNovel.git
cd SignLanguageVisualNovel
```

2. Install dependencies:
```bash
npm install
```

3. **Create your `.env` file** in the root directory:
```bash
touch .env
```

4. **Add your Gemini API key** to the `.env` file:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

You can get a free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey).

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) with your browser to play!

## Project Structure

```
├── app/
│   ├── api/gemini/          # Gemini API routes
│   ├── components/visual-novel/  # VN components
│   ├── data/                # Story data
│   └── types/               # TypeScript types
├── public/
│   ├── audio/               # BGM and SFX
│   ├── backgrounds/         # Scene backgrounds
│   └── characters/          # Character sprites
```

## Customization

See `VISUAL_NOVEL_GUIDE.md` for detailed documentation on how to create your own stories, add characters, and customize the game.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

**Important:** Remember to add your `GEMINI_API_KEY` to your Vercel environment variables.

## License

This project was created for an educational hackathon.
