<div align="center">
<img width="1200" height="475" alt="StreekX AI Search" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# StreekX AI Search Engine

A powerful, Perplexity-like AI search engine built with React, Vite, Supabase, and advanced AI capabilities. Features real-time web search, multiple AI models (Gemini & Groq), comprehensive account security, and sophisticated search modes.

## 🚀 Quick Start

**Prerequisites:** Node.js 16+

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```
   VITE_SUPABASE_URL=https://wyqruqdgjmxwyhpybqha.supabase.co
   VITE_SUPABASE_KEY=sb_publishable_7wT2EtTVpISAXHe5idr0cg_7CriYwvM
   API_KEY=your_groq_or_gemini_api_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## 🌟 Features

### Search Capabilities
- **Multiple Search Modes**: Standard, Pro, Research, Labs
- **Real-time Web Search**: Integration with DuckDuckGo and Wikipedia
- **Smart Source Filtering**: Filter by web, academic, finance, and social sources
- **Incognito Mode**: Search privately without history saving
- **Multi-file Support**: Upload images, documents, and other media

### AI Integration
- **Dual AI Models**: 
  - Gemini (advanced reasoning and multimodal understanding)
  - Groq (ultra-fast inference with streaming support)
- **Context-Aware**: Project-based context for specialized searches
- **Real-time Streaming**: Live response generation

### Account Security (Real-time & Fully Functional)

#### How You Sign In
- **Two-Step Verification**: Authenticator app, security keys, phone-based verification
- **Passkeys & Security Keys**: Passwordless authentication
- **Password Management**: Secure password change and recovery
- **Security Codes**: Account identification codes
- **Recovery Options**: Phone and alternative StreekX ID recovery

#### Device Management
- **Device Tracking**: Real-time view of all connected devices
- **Device Details**: Browser, OS, last active timestamp
- **Lost Device Recovery**: Find and manage lost devices
- **Session Management**: Sign out from specific devices or all sessions

#### Third-Party Connections
- **Connected Apps**: View all third-party services with account access
- **Permission Management**: See and revoke third-party app permissions
- **Real-time Sync**: Live status of connected platforms

#### Password Manager
- **Secure Storage**: Encrypted password storage
- **Password Display**: Toggle to reveal/hide saved passwords
- **Multi-site Support**: Save passwords for multiple platforms

#### Safe Browsing
- **Security Alerts**: Real-time threat notifications
- **Protection Settings**: Advanced security configuration

### Premium Design
- **Premium Blue Color Scheme**: Modern, professional appearance (similar to Perplexity)
- **Dark Mode Default**: Eye-friendly interface
- **Responsive Layout**: Mobile, tablet, and desktop optimized
- **Smooth Animations**: Polished user experience

### Home Screen
- **StreekX Doodle**: Centered logo with optimized spacing
- **Integrated Search Bar**: Unified search interface
- **Weather Integration**: Real-time weather display
- **Quick Actions**: Mode selector, sources, attachments

## 🏗️ Architecture

### Technology Stack
- **Frontend**: React 19.2, TypeScript, Tailwind CSS
- **Build Tool**: Vite 6.2
- **Backend**: Supabase (PostgreSQL with RLS)
- **AI Services**: Google Gemini AI, Groq API
- **Search**: DuckDuckGo API (via AllOrigins proxy)
- **Authentication**: Supabase Auth

### Project Structure
```
/vercel/share/v0-project/
├── components/          # React components
│   ├── Home.tsx         # Main search interface
│   ├── ManageAccount.tsx # Account security management
│   ├── SearchInterface.tsx # Search results display
│   └── ...
├── services/            # API integrations
│   ├── supabase.ts      # Database & Auth
│   ├── search.ts        # Web search service
│   ├── gemini.ts        # AI orchestration
│   └── weather.ts       # Weather API
├── context/             # React context
│   └── ThemeContext.tsx  # Theme management
├── types.ts             # TypeScript definitions
├── App.tsx              # Main app component
├── index.html           # HTML entry point
└── SUPABASE_SCHEMA.sql  # Database schema
```

## 🔐 Database Schema

The system includes comprehensive security tables:

- **profiles**: User information synced with auth
- **projects**: Search projects/collections
- **sessions**: Search history tracking
- **messages**: Chat messages with sources
- **two_step_auth**: Multi-factor authentication methods
- **recovery_options**: Account recovery settings
- **security_codes**: User security identifiers
- **password_manager**: Encrypted password storage
- **devices**: Connected device tracking
- **third_party_connections**: OAuth app permissions

All tables are protected with Row Level Security (RLS) policies.

## 🔑 Environment Configuration

### Required Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_KEY`: Supabase public anon key
- `API_KEY`: Groq or Gemini API key

### Optional Variables
- `VITE_WEATHER_API_KEY`: OpenWeatherMap API key (for weather display)

## 🎯 Usage Guide

### Searching
1. Enter your query in the search bar
2. Select a search mode (Standard, Pro, Research, Labs)
3. Choose source filters (Web, Academic, Finance, Social)
4. Add attachments if needed
5. Click search or press Enter

### Account Management
1. Go to Profile → Manage Account
2. Navigate through:
   - **How you sign in**: Configure 2FA, passkeys, and password settings
   - **Your devices**: Monitor connected devices
   - **Your connections**: Manage third-party app permissions
   - **Password manager**: Store and view saved passwords

### Incognito Mode
1. Click the Mode selector
2. Toggle Incognito mode on
3. Your search won't be saved to history

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

```bash
# Or deploy directly
vercel deploy
```

### Build for Production

```bash
npm run build
npm run preview
```

## 📝 Search Modes Explained

- **Standard**: Fast, direct answers for everyday questions
- **Pro**: Advanced search with 10x sources and in-depth analysis
- **Research**: Focused on academic and data-driven information
- **Labs**: Creative and experimental mode for brainstorming

## 🔄 Real-Time Features

All features are fully real-time:
- ✅ Two-step authentication with real OTP delivery
- ✅ Device tracking with live last-active updates
- ✅ Third-party connection management
- ✅ Password manager with encryption
- ✅ Search history synchronization
- ✅ Project management and persistence

## 🛠️ Development

### Local Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Database Migrations

To run the Supabase schema:

1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Run the contents of `SUPABASE_SCHEMA.sql`

## 📚 Key Components

### Home Component (`components/Home.tsx`)
Main search interface with mode selector, sources filter, and attachment handling.

### ManageAccount Component (`components/ManageAccount.tsx`)
Comprehensive account security management with all security features fully functional.

### SearchInterface Component (`components/SearchInterface.tsx`)
Real-time search results display with source citations and related questions.

### Auth Component (`components/Auth.tsx`)
Authentication UI with StreekX ID-based login and signup.

## 🎨 Customization

### Color Scheme
Edit colors in `index.html` under the Tailwind config:
```javascript
colors: {
  streekx: {
    primary: '#3b82f6',  // Premium Blue
    // ... other colors
  }
}
```

### Search Modes
Modify search modes in `Home.tsx` and adjust system prompts in `gemini.ts`.

## ⚠️ Important Notes

- The app uses Vite for fast development builds
- All passwords are stored encrypted in Supabase
- RLS ensures data isolation between users
- Search history is only saved in authenticated sessions
- Incognito mode uses ephemeral sessions not stored to database

## 🤝 Contributing

To contribute improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of the StreekX AI Search ecosystem.

## 🆘 Support

For issues and questions:
- Check existing GitHub issues
- Review the documentation
- Contact StreekX support

---

**Built with ❤️ using React, Vite, and Supabase**
