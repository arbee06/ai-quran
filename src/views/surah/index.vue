# File: ai-quran/src/views/surah/index.vue

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

    <!-- Enhanced Voice Assistant Widget -->
    <VoiceAssistant 
      ref="voiceAssistant"
      :current-surah-id="id"
      @navigate-to-surah="handleNavigateToSurah"
      @navigate-to-verse="handleNavigateToVerse"
      @navigate-to-page="handleNavigateToPage"
      @play-recitation="handlePlayRecitation"
      @bookmark-verse="handleBookmarkVerse"
      @toggle-theme="handleToggleTheme"
      @start-voice-session="handleStartVoiceSession"
    />

    <!-- AI Chat Widget -->
    <div v-if="showAIChat" class="ai-text-chat-widget" :class="{ 'expanded': aiWidgetExpanded }">
      <div class="ai-text-widget-header">
        <div class="ai-text-header-content" @click="toggleAiWidget">
          <div class="ai-text-chat-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="ai-icon">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" fill="currentColor"/>
            </svg>
          </div>
          <h4>AI Assistant</h4>
        </div>
        <div class="ai-text-header-buttons">
          <button @click="toggleAiWidget" class="ai-text-toggle-btn">
            <span>{{ aiWidgetExpanded ? '−' : '+' }}</span>
          </button>
          <button @click="closeAIChat" class="ai-text-close-btn" v-if="aiWidgetExpanded">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <div v-if="aiWidgetExpanded" class="ai-text-widget-body">
        <!-- API Key Setup -->
        <div v-if="!aiApiKeySet" class="ai-text-api-key-prompt">
          <div class="ai-text-api-key-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <h3>Setup Required</h3>
          <p>Enter your OpenAI API key to enable AI features:</p>
          <div class="ai-key-input-group">
            <input 
              v-model="aiApiKey" 
              type="password" 
              placeholder="sk-..."
              class="ai-text-key-input"
              @keyup.enter="setAiApiKey"
            >
            <button @click="setAiApiKey" class="ai-text-key-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat Content -->
        <div v-else class="ai-text-chat-content">
          <div v-if="aiContext" class="ai-text-context-display">
            <div class="ai-text-context-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ aiContext.surahName }} 
              <span v-if="aiContext.verse">• Verse {{ aiContext.verse }}</span>
            </div>
          </div>

          <div class="ai-text-messages-container" ref="aiMessagesContainer">
            <div 
              v-for="(message, index) in aiMessages" 
              :key="index"
              class="ai-text-message"
              :class="message.type"
            >
              <div v-if="message.type === 'assistant'" class="message-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div class="ai-text-message-content">{{ message.content }}</div>
              <div class="ai-text-message-time">{{ formatAiTime(message.timestamp) }}</div>
            </div>
            <div v-if="aiIsLoading" class="ai-text-message assistant loading">
              <div class="message-avatar">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="ai-text-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div class="ai-text-chat-input">
            <div class="ai-text-input-container">
              <textarea 
                v-model="aiUserInput" 
                @keyup.enter.ctrl="sendAiMessage"
                placeholder="Ask about this verse..."
                class="ai-text-message-input"
                :disabled="aiIsLoading"
                rows="2"
              ></textarea>
              <button 
                @click="sendAiMessage" 
                class="ai-text-send-btn"
                :disabled="!aiUserInput.trim() || aiIsLoading"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="ai-text-quick-actions">
            <button @click="askForExplanation" class="ai-text-quick-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
              Explain
            </button>
            <button @click="askForContext" class="ai-text-quick-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              Context
            </button>
            <button @click="askForApplication" class="ai-text-quick-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Apply
            </button>
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
import VoiceAssistant from '../ai/VoiceAssistant.vue'
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
      if (parseInt(surah_number) === parseInt(this.id)) {
        this.scrollToVerse(verse_number)
        this.showToast(`Scrolling to verse ${verse_number}`, 'info')
      } else {
        this.$router.push(`/surah/${surah_number}`)
        this.showToast(`Navigating to Surah ${surah_number}, verse ${verse_number}`, 'info')
      }
    },
    
    handleNavigateToPage({ page_number }) {
      this.showToast(`Page navigation coming soon!`, 'info')
    },
    
    handlePlayRecitation({ surah_number, verse_number, reciter }) {
      const message = verse_number 
        ? `Playing verse ${verse_number} of Surah ${surah_number}`
        : `Playing Surah ${surah_number}`
      this.showToast(message, 'success')
    },
    
    handleBookmarkVerse({ surah_number, verse_number, note }) {
      const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]')
      const bookmark = {
        surah_number,
        verse_number,
        note,
        timestamp: new Date().toISOString()
      }
      bookmarks.push(bookmark)
      localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks))
      
      this.showToast(`Bookmarked Surah ${surah_number}, verse ${verse_number}`, 'success')
    },
    
    handleToggleTheme() {
      this.showToast('Theme toggled', 'info')
    },
    
    handleStartVoiceSession() {
      // Voice session started from the widget - no notification needed
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
/* Modern CSS Variables - Updated to match home page */
:root {
  --primary-50: #eff6ff;
  --primary-100: #dbeafe;
  --primary-200: #bfdbfe;
  --primary-300: #93c5fd;
  --primary-500: #3b82f6;
  --primary-600: #2563eb;
  --primary-700: #1d4ed8;
  --primary-800: #1e40af;
  --primary-900: #1e3a8a;
  
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-500: #6b7280;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
  
  --success-50: #ecfdf5;
  --success-100: #d1fae5;
  --success-300: #86efac;
  --success-500: #10b981;
  --success-800: #065f46;
  
  --error-50: #fef2f2;
  --error-300: #fca5a5;
  --error-500: #ef4444;
  --error-800: #991b1b;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #a16207;
  
  --sky-50: #f0f9ff;
  --sky-500: #0ea5e9;
  
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  
  --radius-sm: 0.375rem;
  --radius: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  
  --blur: blur(16px);
  --backdrop: saturate(180%) blur(20px);
}

/* Base styles matching your home page */
* {
  box-sizing: border-box;
}

.surah-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

/* AI Text Chat Widget - Matching home page styling */
.ai-text-chat-widget {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  width: 400px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(20px);
  z-index: 150;
  display: flex;
  flex-direction: column;
}

.ai-text-chat-widget:not(.expanded) {
  height: 72px;
}

.ai-text-chat-widget.expanded {
  height: 600px;
  max-height: 600px;
}

.ai-text-widget-header {
  background: rgba(255, 255, 255, 0.95);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #1e293b;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(15, 23, 42, 0.1);
}

.ai-text-widget-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.5) 50%, 
    transparent 100%);
}

.ai-text-header-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  flex: 1;
}

.ai-text-chat-avatar {
  width: 40px;
  height: 40px;
  background: rgba(15, 23, 42, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(15, 23, 42, 0.2);
  position: relative;
  overflow: hidden;
}

.ai-text-chat-avatar::before {
  content: '';
  position: absolute;
  inset: -2px;
  background: conic-gradient(
    rgba(255, 255, 255, 0.6) 0deg,
    transparent 60deg,
    transparent 300deg,
    rgba(255, 255, 255, 0.6) 360deg
  );
  border-radius: 50%;
  animation: rotate 3s linear infinite;
  opacity: 0.8;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-text-chat-avatar svg {
  position: relative;
  z-index: 1;
  color: #1e293b;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.ai-text-header-content h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
}

.ai-text-header-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-text-toggle-btn {
  width: 32px;
  height: 32px;
  background: rgba(15, 23, 42, 0.1);
  border: 1px solid rgba(15, 23, 42, 0.2);
  border-radius: 8px;
  color: #1e293b;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.ai-text-toggle-btn:hover {
  background: rgba(15, 23, 42, 0.15);
  border-color: rgba(15, 23, 42, 0.3);
  transform: scale(1.05);
}

.ai-text-close-btn {
  width: 32px;
  height: 32px;
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  color: #667eea;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.ai-text-close-btn:hover {
  background: rgba(102, 126, 234, 0.15);
  border-color: rgba(102, 126, 234, 0.3);
  transform: scale(1.05);
  color: #5a67d8;
}

.ai-text-widget-body {
  height: calc(100% - 72px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ai-text-api-key-prompt {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.ai-text-api-key-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 0.5rem;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
}

.ai-text-api-key-prompt h3 {
  color: #1e293b;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ai-text-api-key-prompt p {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.ai-key-input-group {
  display: flex;
  gap: 8px;
  width: 100%;
}

.ai-text-key-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.05);
  border: 2px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  color: #1e293b;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.ai-text-key-input:focus {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.ai-text-key-input::placeholder {
  color: rgba(15, 23, 42, 0.4);
}

.ai-text-key-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.ai-text-key-btn:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.ai-text-chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.ai-text-context-display {
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.ai-text-context-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(99, 102, 241, 0.1);
  color: #4338ca;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.ai-text-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
}

.ai-text-messages-container::-webkit-scrollbar {
  width: 6px;
}

.ai-text-messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.ai-text-messages-container::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}

.ai-text-message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ai-text-message.user {
  align-items: flex-end;
}

.ai-text-message.assistant {
  align-items: flex-start;
}

.ai-text-message.system {
  align-items: center;
}

.ai-text-message.error {
  align-items: center;
}

.message-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.loading-dots {
  display: flex;
  gap: 2px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  background: white;
  border-radius: 50%;
  animation: loading-bounce 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes loading-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-text-message-content {
  padding: 0.875rem 1rem;
  border-radius: 16px;
  max-width: 85%;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.ai-text-message.user .ai-text-message-content {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 16px 16px 4px 16px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.ai-text-message.assistant .ai-text-message-content {
  background: rgba(15, 23, 42, 0.05);
  color: #1e293b;
  border-radius: 16px 16px 16px 4px;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.ai-text-message.system .ai-text-message-content {
  text-align: center;
  color: #64748b;
  font-style: italic;
  font-size: 0.75rem;
  background: rgba(15, 23, 42, 0.03);
  border-radius: 12px;
  padding: 0.5rem;
}

.ai-text-message.error .ai-text-message-content {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.ai-text-message-time {
  font-size: 0.625rem;
  color: rgba(0, 0, 0, 0.5);
  margin: 0 0.5rem;
}

.ai-text-typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.875rem 1rem;
  background: rgba(15, 23, 42, 0.05);
  border-radius: 16px 16px 16px 4px;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.ai-text-typing-indicator span {
  width: 6px;
  height: 6px;
  background: rgba(15, 23, 42, 0.6);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.ai-text-typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.ai-text-typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-text-chat-input {
  display: flex;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.1);
}

.ai-text-input-container {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  width: 100%;
}

.ai-text-message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.05);
  border: 2px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  color: #1e293b;
  font-size: 0.875rem;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 120px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.ai-text-message-input::placeholder {
  color: rgba(15, 23, 42, 0.4);
}

.ai-text-message-input:focus {
  border-color: rgba(99, 102, 241, 0.3);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.ai-text-send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.ai-text-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.ai-text-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-text-quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.ai-text-quick-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.05);
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 8px;
  color: #475569;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.ai-text-quick-btn:hover {
  background: rgba(15, 23, 42, 0.1);
  border-color: rgba(15, 23, 42, 0.2);
  color: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Panel overlays and other styles remain the same... */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.panel-content {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  max-width: 500px;
  width: 100%;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.panel-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
}

.panel-close {
  width: 40px;
  height: 40px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.panel-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.panel-body {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

.setting-group {
  margin-bottom: 2rem;
}

.setting-group label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.font-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.font-btn {
  width: 40px;
  height: 40px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
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
  background: #f3f4f6;
  border-color: #6366f1;
  color: #6366f1;
}

.font-size {
  font-weight: 600;
  color: #1f2937;
  min-width: 60px;
  text-align: center;
}

.setting-select {
  width: 100%;
  padding: 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 1rem;
  outline: none;
  transition: all 0.2s ease;
}

.setting-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.toggle-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.toggle-option input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
  accent-color: #6366f1;
}

.toggle-option span {
  color: #374151;
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  color: #6b7280;
}

.empty-state svg {
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state p {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: #374151;
}

.empty-state span {
  font-size: 0.875rem;
}

.bookmarks-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.bookmark-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bookmark-item:hover {
  background: white;
  border-color: #6366f1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bookmark-info {
  flex: 1;
  min-width: 0;
}

.bookmark-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.bookmark-info p {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bookmark-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.bookmark-delete {
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  transition: all 0.2s ease;
}

.bookmark-delete:hover {
  background: #fef2f2;
  border-color: #f87171;
}

/* Toast notifications */
.toast-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-weight: 500;
  max-width: 400px;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.toast.success {
  border-color: var(--success-300);
  background: var(--success-50);
  color: var(--success-800);
}

.toast.error {
  border-color: var(--error-300);
  background: var(--error-50);
  color: var(--error-800);
}

.toast.info {
  border-color: var(--primary-300);
  background: var(--primary-50);
  color: var(--primary-800);
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .surah-nav {
    order: -1;
  }
  
  .content-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ai-text-chat-widget {
    bottom: 1rem;
    left: 1rem;
    width: calc(100vw - 2rem);
    max-width: 400px;
  }
}

@media (max-width: 480px) {
  .surah-view {
    font-size: 0.875rem;
  }
  
  .header {
    padding: 1rem 0;
  }
  
  .nav-content {
    gap: 0.75rem;
  }
  
  .nav-arrow,
  .settings-btn {
    width: 40px;
    height: 40px;
  }
  
  .surah-info h1 {
    font-size: 1.25rem;
  }
  
  .verse-item {
    padding: 1rem;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .verse-actions {
    flex-direction: row;
    align-self: stretch;
    justify-content: center;
  }
  
  .toast-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .toast {
    max-width: none;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #111827;
    --gray-100: #1f2937;
    --gray-200: #374151;
    --gray-300: #4b5563;
    --gray-400: #6b7280;
    --gray-500: #9ca3af;
    --gray-600: #d1d5db;
    --gray-700: #e5e7eb;
    --gray-800: #f3f4f6;
    --gray-900: #f9fafb;
  }
}
</style>