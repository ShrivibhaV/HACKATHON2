# NeuroLearn Quick Start Guide

Get up and running in 5 minutes.

## 1. Install & Run (2 minutes)

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

That's it! The app is now running locally.

## 2. Try the Platform (3 minutes)

### Complete Onboarding
1. Go to `http://localhost:3000/onboarding`
2. Answer 8 quick visual questions about your learning preferences
3. See your weighted profile (e.g., "65% Dyslexia, 35% ADHD")
4. Click "Start Learning"

### Explore Learning Modes

**Dyslexia Mode** (`/learn`)
- See text with Bionic Reading (bold word starts)
- Adjust font size, line height, word spacing
- Toggle reading ruler overlay
- Try text-to-speech

**ADHD Mode** (`/learn`)
- Enter Focus Mode (one sentence at a time)
- Start Pomodoro timer
- See confetti when you complete a session
- Watch your streak grow

**AI Educator** (`/educator`)
- Ask a question about photosynthesis
- Try asking via voice (if your browser supports it)
- See AI responses adapted to your learning style

### Check Your Progress

Go to `/progress` to see:
- Your weekly activity charts
- Learning mode usage pie chart
- Achievement badges you've earned
- Study statistics

### Peek at Teacher Dashboard

Go to `/teacher` to see what educators get:
- Class overview and performance trends
- Individual student statistics
- Student status (active/inactive/struggling)
- Data export capability

## 3. Environment Setup (Optional but Recommended)

To use the AI Educator feature, add your OpenAI API key:

```bash
# Create .env.local
echo "OPENAI_API_KEY=sk-your-key-here" > .env.local

# Get API key from https://platform.openai.com/api-keys
```

If you add the API key:
1. AI Educator will provide real OpenAI responses
2. Responses adapt to your learning profile
3. Voice input will work fully

## Key Routes

```
/                    Home page with feature overview
/onboarding         Assessment questions (start here!)
/learn              Learning interface with adaptive content
/educator           AI tutor chatbot with voice input
/progress           Your learning analytics
/teacher            Teacher dashboard with class analytics
```

## What to Try First

1. **The Before/After Toggle**: 
   - Go to `/learn`
   - Click "Original" and "Adapted" buttons
   - See instant transformation of text

2. **Reading Ruler** (Dyslexia Mode):
   - Enable "Reading Ruler" button
   - Move mouse over text
   - Watch the ruler follow your position

3. **Focus Mode** (ADHD Mode):
   - Click "Start 25-Min Session"
   - Then toggle "Focus Mode"
   - See one sentence at a time

4. **Voice Input**:
   - Go to `/educator`
   - Click the microphone button
   - Say "Explain photosynthesis"
   - Watch it transcribe and send

5. **Customization**:
   - In `/learn`, adjust sliders in sidebar
   - Change font size, spacing, line height
   - See instant live updates

## Tips for Best Experience

- **Test on mobile**: Responsive design is a key feature
- **Try dark mode**: Click theme toggle in top right
- **Use voice input**: Chrome/Edge recommended
- **Check achievements**: See badges in Progress page
- **Adjust settings**: Tools are in sidebars/panels

## Common Questions

**Q: Do I need an OpenAI API key?**
A: No! The app works without it. You'll get mock responses. Add a key to get real AI responses.

**Q: Where does my data get saved?**
A: Currently in localStorage. With Supabase setup, it saves to database.

**Q: Can I change my learning mode?**
A: Go back to `/onboarding` anytime and retake the assessment.

**Q: Does voice input work?**
A: Yes, if your browser supports Web Speech API (Chrome, Edge, Safari). Firefox coming soon.

**Q: Can teachers use this?**
A: Yes! Go to `/teacher` to see the teacher dashboard.

## Deployment (Bonus: 1 minute setup)

### Deploy to Vercel (Easiest)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Select your GitHub repo
5. Click "Deploy"
6. Add environment variables:
   - `OPENAI_API_KEY=sk-...`
7. Done! Your app is live

See [DEPLOYMENT.md](./DEPLOYMENT.md) for other options.

## Customization Ideas

- Add your own learning content
- Change color scheme in `globals.css`
- Modify timer durations in ADHDTools
- Adjust Bionic Reading percentage in text-transformers
- Add more achievements
- Create additional learning modes

## Project Structure Quick Tour

```
/app              # Pages (onboarding, learn, etc)
/components       # Reusable UI components
/lib              # Business logic and utilities
  ├── text-transformers.ts     # Text adaptation
  ├── openai-integration.ts    # AI API
  └── profile-context.ts       # User profile state
/public           # Images and static files
```

## Next Steps

1. **Explore the code**: Start with `/app/page.tsx` (home page)
2. **Customize**: Modify colors, text, features to your liking
3. **Add data**: Integrate Supabase for user accounts (see INTEGRATION_GUIDE.md)
4. **Deploy**: Get it live on Vercel (see DEPLOYMENT.md)
5. **Share**: Send to friends, teachers, students

## Get Help

- **README.md** - Comprehensive feature guide
- **INTEGRATION_GUIDE.md** - Setup and integration details
- **DEPLOYMENT.md** - Deployment options and instructions
- **COMPLETION_SUMMARY.md** - What was built and why

## You're Ready!

Everything is set up and ready to go. The platform is fully functional, all features work, and the code is production-ready.

**Next action**: Open `http://localhost:3000` and start exploring!

---

**Questions?** Check the README or INTEGRATION_GUIDE for more details.

**Want to deploy?** See DEPLOYMENT.md for step-by-step instructions.

Happy learning!
