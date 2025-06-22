# AI Surah App 🕌

A modern, AI-powered Quran learning application built with Vue 3 that combines traditional Islamic scholarship with cutting-edge AI technology for enhanced understanding and learning.

## ✨ Features

### 🎤 Voice Assistant
- **Real-time Voice Interaction**: Talk naturally with an AI assistant using OpenAI's Realtime API
- **Islamic Knowledge**: Specialized AI trained to provide respectful and accurate Islamic teachings
- **Voice Commands**: Navigate, search, and learn using voice commands
- **Multilingual Support**: Interact in multiple languages

### 📖 Comprehensive Quran Access
- **All 114 Surahs**: Complete access to the Holy Quran
- **Arabic Text**: Beautiful Arabic typography with proper rendering
- **English Translations**: Clear, accurate translations
- **Verse-by-Verse Navigation**: Easy browsing and reference

### 🤖 AI-Powered Learning
- **Verse Explanations**: Deep insights into meanings and context
- **Historical Context**: Understanding the circumstances of revelation
- **Modern Applications**: How to apply teachings in daily life
- **Related Verses**: Find connections across the Quran

### 🔍 Smart Search
- **Text Search**: Find verses by keywords or phrases
- **Topic-Based Search**: Explore themes like patience, mercy, prayer
- **AI-Enhanced Results**: Intelligent matching and suggestions

### 🎨 Modern Interface
- **Dark/Light Themes**: Comfortable reading in any environment
- **Responsive Design**: Perfect on desktop, tablet, and mobile
- **Accessibility**: Designed for users with different abilities
- **Clean Typography**: Easy-to-read Arabic and English fonts

## 🚀 Getting Started

### Prerequisites
- Node.js 16 or higher
- npm or yarn
- OpenAI API key for AI features

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd src
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Configuration

1. **OpenAI API Key**
   - Get your API key from [OpenAI](https://openai.com)
   - Enter it in the app when prompted
   - The app will securely store it in your browser

2. **Environment Variables** (Optional)
   Create a `.env` file:
   ```
   VUE_APP_OPENAI_API_KEY=your_api_key_here
   ```

## 🛠️ Technology Stack

### Frontend Framework
- **Vue 3**: Modern, reactive JavaScript framework
- **Vue Router**: Client-side routing
- **Composition API**: Modern Vue development patterns

### AI Integration
- **OpenAI Realtime API**: Voice-based AI interactions
- **WebRTC**: Real-time audio communication
- **GPT-4**: Advanced language understanding

### Data Sources
- **Al Quran Cloud API**: Verse data and translations
- **Local Fallback**: Offline access to essential Surahs

### Styling
- **Custom CSS**: Hand-crafted, responsive design
- **CSS Grid & Flexbox**: Modern layout techniques
- **CSS Variables**: Dynamic theming support

## 📱 Usage

### Basic Navigation
1. **Browse Surahs**: View all 114 Surahs on the home page
2. **Filter by Type**: Sort by Meccan or Medinan revelations
3. **Search**: Find specific Surahs by name or number

### Reading Experience
1. **Select a Surah**: Click on any Surah card
2. **View Verses**: Read Arabic text with translations
3. **AI Assistance**: Click the AI button for explanations

### Voice Assistant
1. **Toggle Voice Mode**: Click the 🎤 button
2. **Connect**: Enter your OpenAI API key
3. **Start Talking**: Ask questions naturally
4. **Voice Commands**:
   - "Take me to Surah Al-Fatihah"
   - "Explain verse 5 of this Surah"
   - "Find verses about patience"
   - "What is the context of this verse?"

### AI Features
- **Verse Explanations**: Deep theological insights
- **Historical Context**: Circumstances of revelation
- **Cross-References**: Related verses and themes
- **Modern Applications**: Contemporary relevance

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Main application files
├── assets/             # Static assets and styles
├── components/         # Reusable Vue components
│   ├── ai/            # AI-related components
│   └── surah/         # Quran-specific components
├── services/          # API and business logic
├── utils/             # Helper functions
├── views/             # Page components
└── router/            # Routing configuration
```

### Key Components
- **VoiceAssistant.vue**: Real-time voice interaction
- **SurahViewer.vue**: Quran reading interface  
- **AIChat.vue**: Text-based AI assistance
- **RealtimeApiService.js**: OpenAI WebRTC integration

### API Services
- **surahService.js**: Quran data management
- **openaiService.js**: Text-based AI interactions
- **realtimeApiService.js**: Voice AI integration

### Building for Production
```bash
npm run build
```

## 🎯 Voice Commands Reference

### Navigation Commands
- "Go to Surah [name/number]"
- "Take me to [Surah name]"
- "Show me the home page"
- "Navigate to [location]"

### Search Commands
- "Find verses about [topic]"
- "Search for [keyword]"
- "Show me verses related to [theme]"

### Learning Commands
- "Explain this verse"
- "What is the context of this verse?"
- "How can I apply this verse today?"
- "Find related verses"

### App Commands
- "Toggle dark mode"
- "Bookmark this verse"
- "Play recitation"
- "Show daily verse"

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: Bookmarks and preferences stored locally
- **No Personal Data**: No personal information collected
- **API Keys**: Stored securely in browser only
- **Voice Data**: Processed by OpenAI (see their privacy policy)

### Security Features
- **HTTPS Required**: Secure connections only
- **API Key Encryption**: Keys never sent to our servers
- **No Tracking**: No analytics or tracking scripts

## 🤝 Contributing

We welcome contributions from the Muslim developer community!

### How to Contribute
1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Contribution Guidelines
- Maintain respectful and accurate Islamic content
- Follow Vue.js best practices
- Test thoroughly before submitting
- Document new features clearly

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **The Holy Quran**: The source of all wisdom
- **Al Quran Cloud**: API for Quranic data
- **OpenAI**: AI technology for enhanced learning
- **Vue.js Community**: Amazing framework and ecosystem
- **Islamic Scholars**: Traditional knowledge and interpretations

## 📞 Support

Having issues? Need help?

1. **Check the Documentation**: Most questions are answered here
2. **Search Issues**: Look for similar problems
3. **Create an Issue**: Detailed bug reports help us improve
4. **Community Support**: Connect with other users

## 🎓 Educational Purpose

This application is designed for educational purposes to help Muslims and those interested in Islamic studies to better understand the Quran through modern technology. All interpretations are based on traditional Islamic scholarship and should be verified with qualified Islamic scholars.

---

**Barakallahu feekum** - May Allah bless you all! 🤲

Made with ❤️ for the Muslim Ummah