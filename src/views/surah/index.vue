<template>
  <div class="surah-view">
    <!-- Navigation Header -->
    <header class="header">
      <div class="container">
        <div class="nav-content">
          <button @click="$router.push('/')" class="nav-home">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/>
              <polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2"/>
            </svg>
            Home
          </button>
          
          <div class="surah-nav">
            <button @click="previousSurah" :disabled="id <= 1" class="nav-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            
            <div class="surah-info">
              <h1>{{ surahInfo.name || 'Loading...' }}</h1>
              <p>Surah {{ id }} • {{ surahInfo.englishName }}</p>
            </div>
            
            <button @click="nextSurah" :disabled="id >= 114" class="nav-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
          
          <button @click="showSettings = true" class="settings-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              <path d="M12 1v6m0 6v6m6.364-15.364L15 7m-6 6l-3.364 3.364M23 12h-6m-6 0H1m6.364 6.364L11 15m6-6l3.364-3.364" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
      </div>
    </header>


    <!-- Surah Content Section -->
    <section class="content-section" ref="contentSection">
      <div class="container">
        <div class="section-header">
          <h2>{{ surahInfo.name || 'Surah' }} - {{ surahInfo.englishName || 'The Holy Quran' }}</h2>
          <p>{{ surahInfo.revelationType || 'Meccan' }} • {{ surahInfo.numberOfAyahs || totalVerses }} verses</p>
        </div>
        
        <!-- Controls -->
        <div class="content-controls">
          <div class="search-container" v-if="showSearch">
            <div class="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="search-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="Search in this surah..."
                class="search-input"
                @keyup.enter="performSearch"
                ref="searchInput"
              >
              <button @click="showSearch = false" class="search-close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="view-controls">
            <button @click="showSearch = !showSearch" class="control-btn" :class="{ active: showSearch }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Search
            </button>
            
            <button @click="showBookmarks = true" class="control-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Bookmarks
            </button>
            
            <button @click="playAudio" class="control-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <polygon points="5,3 19,12 5,21" fill="currentColor"/>
              </svg>
              Listen
            </button>
          </div>
        </div>

        <!-- Inline Surah Content -->
        <div class="surah-content">
          <div v-if="loading" class="loading">
            <div class="loading-spinner"></div>
            <p>Loading verses...</p>
          </div>
          
          <div v-else class="verses-container">
            <div 
              v-for="verse in filteredVerses" 
              :key="verse.number"
              class="verse-item"
              :class="{ 'selected': selectedVerse === verse.number }"
              @click="selectVerse(verse)"
            >
              <div class="verse-number">{{ verse.number }}</div>
              <div class="verse-content">
                <p class="arabic-text" dir="rtl" :style="{ fontSize: fontSize + 'px' }">{{ verse.text }}</p>
                <p v-if="showTranslation" class="translation">{{ verse.translation }}</p>
                <p v-if="showTransliteration" class="transliteration">{{ verse.transliteration }}</p>
              </div>
              <div class="verse-actions">
                <button @click.stop="askAI(verse)" class="verse-btn" title="Ask AI">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button @click.stop="copyVerse(verse)" class="verse-btn" title="Copy">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
                <button @click.stop="bookmarkVerse(verse)" class="verse-btn" title="Bookmark">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Voice Assistant Modal -->
    <div v-if="showVoiceAssistant" class="modal-overlay" @click.self="closeVoiceAssistant">
      <div class="modal-content voice-modal">
        <div class="modal-header">
          <div class="modal-title">
            <div class="modal-icon voice">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div>
              <h3>Voice Assistant</h3>
              <p>Speak naturally to interact</p>
            </div>
          </div>
          <button @click="closeVoiceAssistant" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <VoiceAssistant 
            ref="voiceAssistant"
            :current-surah-id="id"
            @navigate-to-surah="handleNavigateToSurah"
            @navigate-to-verse="handleNavigateToVerse"
            @close="closeVoiceAssistant"
          />
        </div>
      </div>
    </div>

    <!-- AI Chat Widget -->
    <div v-if="showAIChat" class="ai-chat-widget" :class="{ 'expanded': aiWidgetExpanded }">
      <div class="ai-widget-header">
        <div class="ai-header-content" @click="toggleAiWidget">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="ai-icon">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" fill="currentColor"/>
          </svg>
          <h4>AI Assistant</h4>
        </div>
        <div class="ai-header-buttons">
          <button @click="toggleAiWidget" class="ai-toggle-btn">
            <span>{{ aiWidgetExpanded ? '−' : '+' }}</span>
          </button>
          <button @click="closeAIChat" class="ai-close-btn" v-if="aiWidgetExpanded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="aiWidgetExpanded" class="ai-widget-body">
        <!-- API Key Setup -->
        <div v-if="!aiApiKeySet" class="ai-api-key-prompt">
          <p>Enter your OpenAI API key:</p>
          <div class="ai-key-input-group">
            <input 
              v-model="aiApiKey" 
              type="password" 
              placeholder="sk-..."
              class="ai-key-input"
              @keyup.enter="setAiApiKey"
            >
            <button @click="setAiApiKey" class="ai-key-btn">Set</button>
          </div>
        </div>

        <!-- Chat Content -->
        <div v-else class="ai-chat-content">
          <div v-if="aiContext" class="ai-context-display">
            <small>{{ aiContext.surahName }} 
              <span v-if="aiContext.verse">• Verse {{ aiContext.verse }}</span>
            </small>
          </div>

          <div class="ai-messages-container" ref="aiMessagesContainer">
            <div 
              v-for="(message, index) in aiMessages" 
              :key="index"
              class="ai-message"
              :class="message.type"
            >
              <div class="ai-message-content">{{ message.content }}</div>
              <div class="ai-message-time">{{ formatAiTime(message.timestamp) }}</div>
            </div>
            <div v-if="aiIsLoading" class="ai-message assistant loading">
              <div class="ai-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div class="ai-chat-input">
            <textarea 
              v-model="aiUserInput" 
              @keyup.enter.ctrl="sendAiMessage"
              placeholder="Ask about this verse..."
              class="ai-message-input"
              :disabled="aiIsLoading"
              rows="2"
            ></textarea>
            <button 
              @click="sendAiMessage" 
              class="ai-send-btn"
              :disabled="!aiUserInput.trim() || aiIsLoading"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <div class="ai-quick-actions">
            <button @click="askForExplanation" class="ai-quick-btn">Explain</button>
            <button @click="askForContext" class="ai-quick-btn">Context</button>
            <button @click="askForApplication" class="ai-quick-btn">Apply</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Panel -->
    <div v-if="showSettings" class="panel-overlay" @click.self="closeSettings">
      <div class="panel-content settings-panel">
        <div class="panel-header">
          <h3>Reading Settings</h3>
          <button @click="closeSettings" class="panel-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="panel-body">
          <div class="setting-group">
            <label>Font Size</label>
            <div class="font-controls">
              <button @click="decreaseFontSize" class="font-btn">A-</button>
              <span class="font-size">{{ fontSize }}px</span>
              <button @click="increaseFontSize" class="font-btn">A+</button>
            </div>
          </div>
          
          <div class="setting-group">
            <label>Translation</label>
            <select v-model="selectedTranslation" class="setting-select">
              <option value="en">English - Sahih International</option>
              <option value="ur">Urdu - Maulana Maududi</option>
              <option value="bn">Bengali - Muhiuddin Khan</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label>Display Options</label>
            <div class="toggle-options">
              <label class="toggle-option">
                <input type="checkbox" v-model="showTransliteration">
                <span>Show Transliteration</span>
              </label>
              <label class="toggle-option">
                <input type="checkbox" v-model="showWordByWord">
                <span>Word by Word Translation</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Bookmarks Panel -->
    <div v-if="showBookmarks" class="panel-overlay" @click.self="closeBookmarks">
      <div class="panel-content bookmarks-panel">
        <div class="panel-header">
          <h3>Bookmarks</h3>
          <button @click="closeBookmarks" class="panel-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        
        <div class="panel-body">
          <div v-if="bookmarksList.length === 0" class="empty-state">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>No bookmarks yet</p>
            <span>Bookmark verses to access them quickly</span>
          </div>
          
          <div v-else class="bookmarks-list">
            <div 
              v-for="bookmark in bookmarksList" 
              :key="bookmark.id"
              class="bookmark-item"
              @click="goToBookmark(bookmark)"
            >
              <div class="bookmark-info">
                <h4>Surah {{ bookmark.surah_number }}, Verse {{ bookmark.verse_number }}</h4>
                <p>{{ bookmark.note || bookmark.verseText?.substring(0, 100) + '...' }}</p>
                <span class="bookmark-date">{{ formatDate(bookmark.timestamp) }}</span>
              </div>
              <button @click.stop="deleteBookmark(bookmark.id)" class="bookmark-delete">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Floating Actions -->
    <div class="floating-actions">
      <button @click="showVoiceAssistant = true" class="fab voice-fab">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <div class="toast-icon">
          <svg v-if="toast.type === 'success'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else-if="toast.type === 'error'" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <span>{{ toast.message }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import VoiceAssistant from '../../components/ai/VoiceAssistant.vue'
import surahService from '../../services/surahService'
import openaiService from '../../services/openaiService'

export default {
  name: 'SurahView',
  components: {
    VoiceAssistant
  },
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      surahInfo: {},
      verses: [],
      loading: true,
      selectedVerse: null,
      viewMode: 'reading',
      searchQuery: '',
      showSearch: false,
      showSettings: false,
      showBookmarks: false,
      showVoiceAssistant: false,
      showAIChat: false,
      aiContext: null,
      readingProgress: 0,
      currentVerse: 1,
      totalVerses: 0,
      bookmarksList: [],
      toasts: [],
      
      // AI Chat data
      aiApiKey: '',
      aiApiKeySet: false,
      aiMessages: [],
      aiUserInput: '',
      aiIsLoading: false,
      aiWidgetExpanded: false,
      
      // Settings
      fontSize: 18,
      selectedTranslation: 'en',
      showTransliteration: false,
      showWordByWord: false,
      showTranslation: true
    }
  },
  computed: {
    filteredVerses() {
      if (!this.verses || !Array.isArray(this.verses)) return []
      if (!this.searchQuery) return this.verses
      
      const query = this.searchQuery.toLowerCase()
      return this.verses.filter(verse => 
        (verse.text && verse.text.includes(this.searchQuery)) ||
        (verse.translation && verse.translation.toLowerCase().includes(query))
      )
    }
  },
  async mounted() {
    this.loadSettings()
    this.loadBookmarks()
    this.loadAiApiKey()
    await this.loadSurah()
  },
  watch: {
    id: {
      immediate: true,
      async handler() {
        await this.loadSurah()
      }
    }
  },
  methods: {
    // Navigation
    previousSurah() {
      if (this.id > 1) {
        this.$router.push(`/surah/${parseInt(this.id) - 1}`)
      }
    },
    
    nextSurah() {
      if (this.id < 114) {
        this.$router.push(`/surah/${parseInt(this.id) + 1}`)
      }
    },
    
    scrollToContent() {
      this.$refs.contentSection?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    },
    
    // Modals & Panels
    closeVoiceAssistant() {
      this.showVoiceAssistant = false
    },
    
    closeAIChat() {
      this.showAIChat = false
      this.aiWidgetExpanded = false
    },
    
    toggleAiWidget() {
      this.aiWidgetExpanded = !this.aiWidgetExpanded
    },
    
    closeSettings() {
      this.showSettings = false
      this.saveSettings()
    },
    
    closeBookmarks() {
      this.showBookmarks = false
    },
    
    // Settings
    loadSettings() {
      this.fontSize = parseInt(localStorage.getItem('fontSize') || '18')
      this.selectedTranslation = localStorage.getItem('translation') || 'en'
      this.showTransliteration = localStorage.getItem('showTransliteration') === 'true'
      this.showWordByWord = localStorage.getItem('showWordByWord') === 'true'
    },
    
    saveSettings() {
      localStorage.setItem('fontSize', this.fontSize)
      localStorage.setItem('translation', this.selectedTranslation)
      localStorage.setItem('showTransliteration', this.showTransliteration)
      localStorage.setItem('showWordByWord', this.showWordByWord)
    },
    
    increaseFontSize() {
      if (this.fontSize < 32) {
        this.fontSize += 2
        this.saveSettings()
      }
    },
    
    decreaseFontSize() {
      if (this.fontSize > 12) {
        this.fontSize -= 2
        this.saveSettings()
      }
    },
    
    // Search
    performSearch() {
      if (this.searchQuery.trim()) {
        this.showToast(`Searching for "${this.searchQuery}"...`, 'info')
      }
    },
    
    // Audio
    playAudio() {
      this.showToast('Audio playback coming soon', 'info')
    },
    
    // Navigation handlers
    handleNavigateToSurah(surahId) {
      this.$router.push(`/surah/${surahId}`)
    },
    
    handleNavigateToVerse({ surah_number, verse_number }) {
      if (surah_number != this.id) {
        this.$router.push(`/surah/${surah_number}`)
      }
      // Scroll to verse logic here
    },
    
    // Bookmarks
    loadBookmarks() {
      this.bookmarksList = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]')
    },
    
    goToBookmark(bookmark) {
      this.handleNavigateToVerse({
        surah_number: bookmark.surah_number,
        verse_number: bookmark.verse_number
      })
      this.showBookmarks = false
    },
    
    deleteBookmark(id) {
      this.bookmarksList = this.bookmarksList.filter(b => b.id !== id)
      localStorage.setItem('quran_bookmarks', JSON.stringify(this.bookmarksList))
      this.showToast('Bookmark removed', 'info')
    },
    
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleDateString()
    },
    
    // Surah loading
    async loadSurah() {
      this.loading = true
      try {
        const surah = await surahService.getSurahById(this.id)
        const content = await surahService.getSurahContent(this.id)
        
        this.surahInfo = {
          name: surah.name,
          englishName: surah.englishName,
          numberOfAyahs: surah.verses,
          revelationType: surah.type
        }
        
        this.verses = content?.verses || []
        this.totalVerses = this.verses.length
        
        // If surah data is missing, try to get it from content
        if (!surah.name && content) {
          this.surahInfo.name = content.name || `Surah ${this.id}`
          this.surahInfo.englishName = content.englishName || `Chapter ${this.id}`
        }
      } catch (error) {
        console.error('Error loading surah:', error)
        this.showToast('Failed to load Surah', 'error')
        
        // Set fallback data
        this.surahInfo = {
          name: `Surah ${this.id}`,
          englishName: `Chapter ${this.id}`,
          numberOfAyahs: 0,
          revelationType: 'Unknown'
        }
        this.verses = []
      } finally {
        this.loading = false
      }
    },
    
    // Verse interactions
    selectVerse(verse) {
      this.selectedVerse = verse.number
      this.currentVerse = verse.number
    },
    
    askAI(verse) {
      this.aiContext = {
        surahName: this.surahInfo.name,
        verseNumber: verse.number,
        verseText: verse.text,
        verse: verse.number
      }
      this.showAIChat = true
      this.aiWidgetExpanded = true
    },
    
    copyVerse(verse) {
      const text = `${verse.text}\n\n${verse.translation}\n\nSurah ${this.surahInfo.englishName}, Verse ${verse.number}`
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Verse copied to clipboard', 'success')
      })
    },
    
    bookmarkVerse(verse) {
      const bookmark = {
        id: Date.now(),
        surah_number: this.id,
        verse_number: verse.number,
        verseText: verse.text,
        translation: verse.translation,
        timestamp: Date.now()
      }
      
      this.bookmarksList.push(bookmark)
      localStorage.setItem('quran_bookmarks', JSON.stringify(this.bookmarksList))
      this.showToast('Verse bookmarked', 'success')
    },
    
    // AI Chat methods
    loadAiApiKey() {
      const savedApiKey = localStorage.getItem('openai_api_key')
      if (savedApiKey) {
        this.aiApiKey = savedApiKey
        this.setAiApiKey()
      }
    },
    
    setAiApiKey() {
      if (this.aiApiKey.trim()) {
        try {
          openaiService.initialize(this.aiApiKey)
          this.aiApiKeySet = true
          localStorage.setItem('openai_api_key', this.aiApiKey)
          this.addAiMessage('system', 'AI Assistant ready! Ask me anything about the Quran.')
        } catch (error) {
          this.showToast('Invalid API key. Please check and try again.', 'error')
        }
      }
    },
    
    async sendAiMessage() {
      if (!this.aiUserInput.trim() || this.aiIsLoading) return
      
      const userMessage = this.aiUserInput.trim()
      this.addAiMessage('user', userMessage)
      this.aiUserInput = ''
      this.aiIsLoading = true
      
      try {
        let response
        if (this.aiContext && this.aiContext.verseText) {
          response = await openaiService.askAboutSurah(
            this.aiContext.verseText,
            userMessage,
            {
              surahName: this.aiContext.surahName,
              verse: this.aiContext.verseNumber
            }
          )
        } else {
          response = await openaiService.askAboutSurah(
            '',
            userMessage,
            { surahName: 'General Question' }
          )
        }
        
        this.addAiMessage('assistant', response)
      } catch (error) {
        this.addAiMessage('error', 'Sorry, I encountered an error. Please try again.')
        console.error('AI Error:', error)
      } finally {
        this.aiIsLoading = false
      }
    },
    
    async askForExplanation() {
      if (!this.aiContext || !this.aiContext.verseText) {
        this.addAiMessage('error', 'Please select a verse first.')
        return
      }
      
      this.aiUserInput = 'Please explain this verse in detail.'
      await this.sendAiMessage()
    },
    
    async askForContext() {
      if (!this.aiContext || !this.aiContext.verseText) {
        this.addAiMessage('error', 'Please select a verse first.')
        return
      }
      
      this.aiUserInput = 'What is the historical context and reason for revelation of this verse?'
      await this.sendAiMessage()
    },
    
    async askForApplication() {
      if (!this.aiContext || !this.aiContext.verseText) {
        this.addAiMessage('error', 'Please select a verse first.')
        return
      }
      
      this.aiUserInput = 'How can we apply the teachings of this verse in modern daily life?'
      await this.sendAiMessage()
    },
    
    addAiMessage(type, content) {
      this.aiMessages.push({
        type,
        content,
        timestamp: new Date()
      })
      
      this.$nextTick(() => {
        this.scrollAiToBottom()
      })
    },
    
    scrollAiToBottom() {
      const container = this.$refs.aiMessagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    
    formatAiTime(date) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    },
    
    // Toast notifications
    showToast(message, type = 'info') {
      const id = Date.now()
      this.toasts.push({ id, message, type })
      setTimeout(() => {
        this.toasts = this.toasts.filter(t => t.id !== id)
      }, 4000)
    }
  }
}
</script>

<style scoped>
/* Base styles matching your home page */
* {
  box-sizing: border-box;
}

.surah-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1.5rem 0;
  position: sticky;
  top: 0;
  z-index: 40;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nav-home {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  color: #1f2937;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
  backdrop-filter: blur(10px);
}

.nav-home:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.surah-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: center;
}

.nav-arrow {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.nav-arrow:hover:not(:disabled) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-color: rgba(255, 255, 255, 0.4);
  color: #667eea;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.nav-arrow:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.surah-info {
  text-align: center;
  min-width: 200px;
}

.surah-info h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: #1f2937;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.surah-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
  opacity: 0.8;
}

.settings-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #1f2937;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.settings-btn:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.15));
  border-color: rgba(255, 255, 255, 0.4);
  color: #667eea;
  transform: translateY(-2px) scale(1.05) rotate(180deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}


/* Content Section */
.content-section {
  padding: 2rem 0 6rem;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
}

.section-header p {
  color: #6b7280;
  font-size: 1.125rem;
}

.content-controls {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.search-container {
  flex: 1;
  max-width: 400px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.search-icon {
  color: #9ca3af;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1rem;
  color: #111827;
}

.search-close {
  width: 24px;
  height: 24px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.search-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #f3f4f6;
  border-color: #6366f1;
  color: #6366f1;
}

.control-btn.active {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.surah-content {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 1rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 2rem;
}

.loading {
  text-align: center;
  padding: 4rem 2rem;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e1e5e9;
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.verses-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.verse-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: #f9fafb;
  border: 1px solid #e1e5e9;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.verse-item:hover {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.verse-item.selected {
  background: #eff6ff;
  border-color: #3b82f6;
}

.verse-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
}

.verse-content {
  flex: 1;
}

.arabic-text {
  font-family: 'Amiri', 'Scheherazade New', serif;
  font-size: 1.5rem;
  line-height: 2;
  color: #111827;
  margin: 0 0 1rem 0;
  text-align: right;
  direction: rtl;
}

.translation {
  font-size: 1rem;
  line-height: 1.6;
  color: #374151;
  margin: 0 0 0.5rem 0;
  font-style: italic;
}

.transliteration {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  font-style: italic;
}

.verse-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-self: flex-start;
}

.verse-btn {
  width: 32px;
  height: 32px;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.verse-btn:hover {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
  transform: scale(1.1);
}

/* Modals & Panels */
.modal-overlay,
.panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.9));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.5rem;
  width: 90%;
  max-width: 700px;
  max-height: 85vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: modalSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.voice-modal {
  max-width: 900px;
  background: linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%);
  color: white;
  border: 1px solid rgba(148, 163, 184, 0.2);
}

/* AI Chat Widget */
.ai-chat-widget {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 400px;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(229, 231, 235, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow: hidden;
}

.ai-chat-widget:not(.expanded) {
  height: 60px;
}

.ai-chat-widget.expanded {
  height: 600px;
}

.panel-content {
  background: white;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  margin-left: auto;
  box-shadow: -10px 0 15px -3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header,
.panel-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

.voice-modal .modal-header {
  border-bottom: 1px solid rgba(148, 163, 184, 0.2);
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(51, 65, 85, 0.6));
  backdrop-filter: blur(20px);
}

.ai-widget-header {
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 1rem 1rem 0 0;
}

.ai-header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  flex: 1;
}

.ai-header-content h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.ai-header-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.modal-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.modal-icon.voice {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(22, 163, 74, 0.3));
  box-shadow: 0 0 30px rgba(34, 197, 94, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.modal-icon.ai {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(37, 99, 235, 0.3));
  box-shadow: 0 0 30px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.modal-title h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: inherit;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.modal-title p {
  font-size: 0.9375rem;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  opacity: 0.9;
}

.voice-modal .modal-title h3,
.ai-modal .modal-title h3 {
  color: white;
}

.voice-modal .modal-title p,
.ai-modal .modal-title p {
  color: rgba(255, 255, 255, 0.8);
}

.modal-close,
.panel-close {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.modal-close:hover,
.panel-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.modal-body,
.panel-body {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
}

.voice-modal .modal-body {
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.4), rgba(51, 65, 85, 0.2));
  backdrop-filter: blur(20px);
  min-height: 500px;
  padding: 2.5rem;
}

.ai-widget-body {
  height: calc(100% - 60px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.ai-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* AI Widget Styles */
.ai-api-key-prompt {
  padding: 1.5rem;
  text-align: center;
}

.ai-api-key-prompt p {
  color: #374151;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.ai-key-input-group {
  display: flex;
  gap: 0.5rem;
}

.ai-key-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  outline: none;
  transition: all 0.2s ease;
}

.ai-key-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.ai-key-input::placeholder {
  color: rgba(148, 163, 184, 0.6);
}

.ai-key-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  border: none;
  border-radius: 0.5rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.ai-key-btn:hover {
  background: #5a67d8;
}

.ai-chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-context-display {
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #718096;
  font-size: 0.75rem;
}

.ai-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.ai-messages-container::-webkit-scrollbar {
  width: 6px;
}

.ai-messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.ai-messages-container::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 3px;
}

.ai-messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.ai-message {
  display: flex;
  flex-direction: column;
}

.ai-message.user {
  align-items: flex-end;
}

.ai-message.assistant {
  align-items: flex-start;
}

.ai-message.system {
  align-items: center;
}

.ai-message.error {
  align-items: center;
}

.ai-message-content {
  max-width: 85%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
  word-wrap: break-word;
}

.ai-message.user .ai-message-content {
  background: #667eea;
  color: white;
  border-bottom-right-radius: 0.25rem;
  margin-left: auto;
}

.ai-message.assistant .ai-message-content {
  background: #f7fafc;
  color: #2d3748;
  border-bottom-left-radius: 0.25rem;
}

.ai-message.system .ai-message-content {
  background: #f7fafc;
  color: #718096;
  font-style: italic;
  text-align: center;
  border-radius: 0.5rem;
  font-size: 0.75rem;
}

.ai-message.error .ai-message-content {
  background: #fed7d7;
  color: #c53030;
  text-align: center;
  border-radius: 0.5rem;
}

.ai-message-time {
  font-size: 0.625rem;
  color: #a0aec0;
  margin-top: 0.25rem;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.ai-typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background: #f7fafc;
  border-radius: 1rem 1rem 1rem 0.25rem;
}

.ai-typing-indicator span {
  width: 6px;
  height: 6px;
  background: #718096;
  border-radius: 50%;
  animation: aiTyping 1.4s infinite ease-in-out;
}

.ai-typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.ai-typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes aiTyping {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  background: white;
}

.ai-message-input {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 80px;
  transition: all 0.2s ease;
  font-family: inherit;
}

.ai-message-input::placeholder {
  color: #9ca3af;
}

.ai-message-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.ai-send-btn {
  width: 40px;
  height: 40px;
  background: #667eea;
  border: none;
  border-radius: 0.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-send-btn:hover:not(:disabled) {
  background: #5a67d8;
}
.ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
  flex-wrap: wrap;
}

.ai-quick-btn {
  flex: 1;
  min-width: 80px;
  padding: 0.5rem 0.75rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  color: #718096;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.ai-quick-btn:hover {
  background: #e2e8f0;
  color: #374151;
}

/* Settings */
.setting-group {
  margin-bottom: 2rem;
}

.setting-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.75rem;
  color: #111827;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.font-btn {
  width: 36px;
  height: 36px;
  background: #f3f4f6;
  border: 1px solid #e1e5e9;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-weight: 600;
  color: #374151;
  transition: all 0.2s ease;
}

.font-btn:hover {
  background: #6366f1;
  border-color: #6366f1;
  color: white;
}

.font-size {
  min-width: 60px;
  text-align: center;
  font-weight: 500;
}

.setting-select {
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 0.5rem;
  color: #111827;
  font-size: 0.9375rem;
}

.toggle-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-option input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

/* Bookmarks */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #9ca3af;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  font-weight: 500;
  margin: 0 0 0.5rem 0;
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.bookmark-item {
  background: #f9fafb;
  border: 1px solid #e1e5e9;
  border-radius: 0.75rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.bookmark-item:hover {
  border-color: #6366f1;
  background: white;
}

.bookmark-info {
  flex: 1;
}

.bookmark-info h4 {
  font-size: 0.9375rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #111827;
}

.bookmark-info p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.bookmark-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.bookmark-delete {
  width: 28px;
  height: 28px;
  background: transparent;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #9ca3af;
  transition: all 0.2s ease;
}

.bookmark-delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Floating Actions */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 40;
}

.fab {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.voice-fab {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 60;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 0.75rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  max-width: 350px;
}

.toast.success {
  border-color: #86efac;
  background: #f0fdf4;
}

.toast.error {
  border-color: #fca5a5;
  background: #fef2f2;
}

.toast.info {
  border-color: #93c5fd;
  background: #eff6ff;
}

.toast-icon {
  flex-shrink: 0;
}

.toast.success .toast-icon { color: #16a34a; }
.toast.error .toast-icon { color: #dc2626; }
.toast.info .toast-icon { color: #2563eb; }

.toast span {
  flex: 1;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .surah-nav {
    width: 100%;
    justify-content: center;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
  
  .content-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    max-width: none;
  }
  
  .panel-content {
    width: 100%;
  }
  
  .floating-actions {
    bottom: 1rem;
    right: 1rem;
  }
  
  .fab {
    width: 48px;
    height: 48px;
  }
}
</style>