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

    <!-- Modern Voice Assistant Widget -->
    <Transition name="voice-widget">
      <div v-if="showVoiceAssistant" class="voice-widget" :class="{ 'minimized': isMinimized }">
        <div class="widget-header">
          <div class="widget-title">
            <div class="ai-avatar">
              <div class="avatar-glow"></div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="ai-icon">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="title-text">
              <h4>Voice Assistant</h4>
              <span class="status">
                <span class="status-indicator"></span>
                Ready to help
              </span>
            </div>
          </div>
          <div class="widget-controls">
            <button @click="minimizeWidget" class="control-btn minimize" v-if="!isMinimized" title="Minimize">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 12h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
            </button>
            <button @click="maximizeWidget" class="control-btn maximize" v-if="isMinimized" title="Expand">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
            <button @click="toggleVoiceAssistant" class="control-btn close" title="Close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="widget-content" v-if="!isMinimized">
          <VoiceAssistant 
            ref="voiceAssistant"
            :current-surah-id="id"
            @navigate-to-surah="handleNavigateToSurah"
            @navigate-to-verse="handleNavigateToVerse"
            @navigate-to-page="handleNavigateToPage"
            @play-recitation="handlePlayRecitation"
            @bookmark-verse="handleBookmarkVerse"
            @toggle-theme="handleToggleTheme"
            @close="closeVoiceAssistant"
          />
        </div>
      </div>
    </Transition>

    <!-- AI Chat Widget -->
    <div v-if="showAIChat" class="ai-chat-widget" :class="{ 'expanded': aiWidgetExpanded }">
      <div class="ai-widget-header">
        <div class="ai-header-content" @click="toggleAiWidget">
          <div class="ai-chat-avatar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="ai-icon">
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456z" fill="currentColor"/>
            </svg>
          </div>
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
          <div class="api-key-icon">
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
              class="ai-key-input"
              @keyup.enter="setAiApiKey"
            >
            <button @click="setAiApiKey" class="ai-key-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Chat Content -->
        <div v-else class="ai-chat-content">
          <div v-if="aiContext" class="ai-context-display">
            <div class="context-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ aiContext.surahName }} 
              <span v-if="aiContext.verse">• Verse {{ aiContext.verse }}</span>
            </div>
          </div>

          <div class="ai-messages-container" ref="aiMessagesContainer">
            <div 
              v-for="(message, index) in aiMessages" 
              :key="index"
              class="ai-message"
              :class="message.type"
            >
              <div v-if="message.type === 'assistant'" class="message-avatar">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="currentColor"/>
                </svg>
              </div>
              <div class="ai-message-content">{{ message.content }}</div>
              <div class="ai-message-time">{{ formatAiTime(message.timestamp) }}</div>
            </div>
            <div v-if="aiIsLoading" class="ai-message assistant loading">
              <div class="message-avatar">
                <div class="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="ai-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>

          <div class="ai-chat-input">
            <div class="input-container">
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
          </div>

          <div class="ai-quick-actions">
            <button @click="askForExplanation" class="ai-quick-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="17" r="1" fill="currentColor"/>
              </svg>
              Explain
            </button>
            <button @click="askForContext" class="ai-quick-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              Context
            </button>
            <button @click="askForApplication" class="ai-quick-btn">
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

    <!-- Modern Floating Voice Button -->
    <div class="floating-actions">
      <button @click="toggleVoiceAssistant" class="fab voice-fab" :class="{ 'active': showVoiceAssistant }">
        <div class="fab-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="fab-pulse"></div>
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
      showVoiceAssistant: false,
      isMinimized: false,
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
    toggleVoiceAssistant() {
      this.showVoiceAssistant = !this.showVoiceAssistant
      if (!this.showVoiceAssistant) {
        this.isMinimized = false
      }
    },
    
    minimizeWidget() {
      this.isMinimized = true
    },
    
    maximizeWidget() {
      this.isMinimized = false
    },
    
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

/* Modern Voice Widget */
.voice-widget {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 400px;
  max-height: 600px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  z-index: 100;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-widget.minimized {
  height: 72px;
  max-height: 72px;
}

.widget-header {
  background: linear-gradient(135deg, 
    rgba(103, 126, 234, 0.9) 0%, 
    rgba(118, 75, 162, 0.9) 100%);
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  position: relative;
  overflow: hidden;
}

.widget-header::before {
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

.widget-title {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.avatar-glow {
  position: absolute;
  inset: -2px;
  background: conic-gradient(
    rgba(255, 255, 255, 0.3) 0deg,
    transparent 60deg,
    transparent 300deg,
    rgba(255, 255, 255, 0.3) 360deg
  );
  border-radius: 50%;
  animation: rotate 3s linear infinite;
  opacity: 0.8;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.ai-icon {
  color: white;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.title-text h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
}

.status {
  font-size: 0.75rem;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.status-indicator {
  width: 6px;
  height: 6px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { 
    opacity: 1; 
    transform: scale(1);
  }
  50% { 
    opacity: 0.5; 
    transform: scale(1.1);
  }
}

.widget-controls {
  display: flex;
  gap: 0.5rem;
}

.widget-controls .control-btn {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.widget-controls .control-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.widget-content {
  flex: 1;
  overflow: hidden;
  min-height: 450px;
  max-height: 520px;
  display: flex;
  flex-direction: column;
}

/* Voice Widget Transitions */
.voice-widget-enter-active, .voice-widget-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.voice-widget-enter-from, .voice-widget-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* AI Chat Widget */
.ai-chat-widget {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  width: 420px;
  background: linear-gradient(145deg, 
    rgba(255, 255, 255, 0.95) 0%, 
    rgba(255, 255, 255, 0.9) 100%);
  border-radius: 20px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 50;
  overflow: hidden;
  backdrop-filter: blur(20px);
}

.ai-chat-widget:not(.expanded) {
  height: 70px;
}

.ai-chat-widget.expanded {
  height: 650px;
}

.ai-widget-header {
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.9) 0%, 
    rgba(5, 150, 105, 0.9) 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px 20px 0 0;
  position: relative;
  overflow: hidden;
}

.ai-widget-header::before {
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

.ai-header-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  flex: 1;
}

.ai-chat-avatar {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ai-header-content h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
}

.ai-header-buttons {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ai-toggle-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.ai-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.ai-close-btn {
  width: 28px;
  height: 28px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.ai-close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.ai-widget-body {
  height: calc(100% - 70px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* API Key Setup */
.ai-api-key-prompt {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.api-key-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 0.5rem;
}

.ai-api-key-prompt h3 {
  color: #1f2937;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.ai-api-key-prompt p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.ai-key-input-group {
  display: flex;
  gap: 8px;
  width: 100%;
}

.ai-key-input {
  flex: 1;
  padding: 12px 16px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #1f2937;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.ai-key-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.ai-key-input::placeholder {
  color: #9ca3af;
}

.ai-key-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-key-btn:hover {
  background: linear-gradient(135deg, #059669, #047857);
  transform: scale(1.05);
}

/* Chat Content */
.ai-chat-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.ai-context-display {
  padding: 1rem;
  background: linear-gradient(135deg, #ecfdf5, #f0fdf4);
  border-bottom: 1px solid #d1fae5;
}

.context-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.ai-messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;
}

.ai-messages-container::-webkit-scrollbar {
  width: 6px;
}

.ai-messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.ai-messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.ai-message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
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

.message-avatar {
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  margin-bottom: 0.25rem;
}

.loading-dots {
  display: flex;
  gap: 2px;
}

.loading-dots span {
  width: 3px;
  height: 3px;
  background: white;
  border-radius: 50%;
  animation: loading-dots 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes loading-dots {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.ai-message-content {
  max-width: 85%;
  padding: 0.875rem 1rem;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.ai-message.user .ai-message-content {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-bottom-right-radius: 4px;
}

.ai-message.assistant .ai-message-content {
  background: #f3f4f6;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.ai-message.system .ai-message-content {
  background: #eff6ff;
  color: #1e40af;
  font-style: italic;
  text-align: center;
  border-radius: 12px;
  font-size: 0.75rem;
}

.ai-message.error .ai-message-content {
  background: #fef2f2;
  color: #dc2626;
  text-align: center;
  border-radius: 12px;
}

.ai-message-time {
  font-size: 0.625rem;
  color: #9ca3af;
  margin: 0 0.5rem;
}

.ai-typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.875rem 1rem;
  background: #f3f4f6;
  border-radius: 16px 16px 16px 4px;
}

.ai-typing-indicator span {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.ai-typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.ai-typing-indicator span:nth-child(2) { animation-delay: -0.16s; }

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

.ai-chat-input {
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
}

.input-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.ai-message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  color: #1f2937;
  font-size: 0.875rem;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 100px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.ai-message-input::placeholder {
  color: #9ca3af;
}

.ai-message-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.ai-send-btn {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #10b981, #059669);
  border: none;
  border-radius: 12px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ai-send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: scale(1.05);
}

.ai-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ai-quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.ai-quick-btn {
  flex: 1;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.ai-quick-btn:hover {
  background: #f9fafb;
  border-color: #10b981;
  color: #059669;
}

/* Modals & Panels */
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

.panel-header {
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

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

.panel-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
  transform: scale(1.1) rotate(90deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.02);
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

/* Modern Floating Actions */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 40;
}

.fab {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voice-fab {
  background: linear-gradient(135deg, 
    rgba(103, 126, 234, 0.9) 0%, 
    rgba(118, 75, 162, 0.9) 100%);
  box-shadow: 
    0 12px 24px rgba(103, 126, 234, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
}

.voice-fab.active {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.9) 0%, 
    rgba(220, 38, 38, 0.9) 100%);
  box-shadow: 
    0 12px 24px rgba(239, 68, 68, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1);
}

.fab:hover {
  transform: scale(1.1) translateY(-2px);
  box-shadow: 
    0 20px 40px rgba(103, 126, 234, 0.6),
    0 0 0 1px rgba(255, 255, 255, 0.2);
}

.fab-icon {
  position: relative;
  z-index: 2;
}

.fab-pulse {
  position: absolute;
  inset: -4px;
  background: inherit;
  border-radius: 50%;
  opacity: 0.6;
  animation: fab-pulse 2s infinite;
}

@keyframes fab-pulse {
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.3;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
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
    width: 56px;
    height: 56px;
  }
  
  .voice-widget {
    width: 350px;
    bottom: 1rem;
    right: 1rem;
  }
  
  .ai-chat-widget {
    width: 350px;
    bottom: 1rem;
    left: 1rem;
  }
}

@media (max-width: 480px) {
  .voice-widget,
  .ai-chat-widget {
    width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
  }
  
  .ai-chat-widget.expanded {
    height: calc(100vh - 2rem);
    top: 1rem;
  }
  
  .voice-widget {
    max-height: calc(100vh - 2rem);
  }
}

/* Dark mode compatibility */
@media (prefers-color-scheme: dark) {
  .voice-widget,
  .ai-chat-widget {
    background: linear-gradient(145deg, 
      rgba(31, 41, 55, 0.95) 0%, 
      rgba(17, 24, 39, 0.9) 100%);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .ai-message.assistant .ai-message-content {
    background: #374151;
    color: #f9fafb;
  }
  
  .ai-message-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .ai-message-input::placeholder {
    color: #9ca3af;
  }
}
</style>