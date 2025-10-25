# 🏖️ Beach Buddy

Your smart beach day concierge for Palm Harbor, FL and surrounding beaches.

Beach Buddy helps you find the perfect time to hit the beach by analyzing real-time weather, tides, UV index, and wind conditions. Get intelligent recommendations with BeachScore™, personalized checklists, and nearby amenities.

## ✨ Features

- **BeachScore™**: 0-100 scoring system that evaluates beach conditions
- **3-Hour Time Windows**: Intelligent suggestions for the next 12 hours
- **Smart Checklists**: Auto-generated packing lists based on conditions
- **Live Conditions**: Real-time weather, tide, UV, and wind data
- **Nearby Places**: Find restaurants, cafes, and bars near the beach
- **PWA Support**: Install as an app on your phone
- **Mobile-First**: Optimized for mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys (see below)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bb
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file with your API keys:
```bash
OPENWEATHER_API_KEY=your_openweather_key
OPENUV_API_KEY=your_openuv_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting API Keys

- **OpenWeather API**: Sign up at [openweathermap.org](https://openweathermap.org/api) (Free tier: 1,000 calls/day)
- **OpenUV API**: Sign up at [openuv.io](https://www.openuv.io/) (Free tier: 50 calls/day)

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
npm start
```

## 🏖️ Supported Beaches

- Honeymoon Island State Park
- Clearwater Beach
- Caladesi Island State Park
- Fred Howard Park Beach
- Dunedin Causeway Beach
- Sand Key Park
- Indian Rocks Beach
- Madeira Beach

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Language**: TypeScript
- **Data Fetching**: SWR
- **APIs**: OpenWeather, OpenUV, NOAA Tides, OpenStreetMap
- **Deployment**: Vercel

## 📱 PWA Installation

Beach Buddy is a Progressive Web App (PWA) that can be installed on your device:

1. Open Beach Buddy in your mobile browser
2. Tap the "Share" button (iOS) or menu (Android)
3. Select "Add to Home Screen"
4. Enjoy the app-like experience!

## 🧮 BeachScore Algorithm

BeachScore™ evaluates conditions based on:

- **Temperature** (30%): Optimal at 80-90°F
- **UV Safety** (25%): Lower is better
- **Wind Comfort** (25%): Lower is better
- **Tide Suitability** (10%): Slack/low tide preferred
- **Weather** (10%): Clear > Cloudy > Rain

Score ranges:
- 80-100: Perfect day!
- 60-79: Pretty good
- 40-59: Okay
- 0-39: Maybe tomorrow

## 📁 Project Structure

```
/app                  # Next.js App Router pages
/components           # Reusable React components
/lib
  /models            # TypeScript interfaces
  /services          # API service wrappers
  /scoring           # BeachScore engine
  /utils             # Helper functions
/data                # Beach seed data
/public              # Static assets
```

## 🚢 Deployment

Deploy to Vercel:

```bash
# Connect your GitHub repo to Vercel
# Add environment variables in Vercel dashboard
# Deploy automatically on push to main
```

Or use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a pull request.

## 📞 Support

For issues or questions, please open a GitHub issue.

---

Made with ☀️ in Palm Harbor, FL
