<template>
  <div class="surah-view">
    <!-- Modern Floating Header -->
    <header class="floating-header">
      <div class="header-container">
        <div class="header-content">
          <button @click="$router.back()" class="modern-back-btn">
            <div class="btn-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <span>Back</span>
          </button>
          
          <div class="header-title">
            <h1>Surah Explorer</h1>
            <p>Discover divine wisdom with AI guidance</p>
          </div>
          
          <button @click="toggleVoiceAssistant" class="modern-voice-btn" :class="{ 'active': showVoiceAssistant }">
            <div class="btn-icon">
              <svg v-if="!showVoiceAssistant" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <span>{{ showVoiceAssistant ? 'Text Chat' : 'AI Assistant' }}</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Hero Background -->
    <div class="hero-background">
      <div class="gradient-overlay"></div>
      <div class="pattern-overlay"></div>
    </div>

    <!-- Main Content -->
    <main class="main-container">
      <div class="content-wrapper">
        <!-- Modern Surah Viewer Card -->
        <div class="surah-card">
          <div class="card-header">
            <div class="surah-info">
              <div class="surah-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  <path d="M6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
                <span>Surah {{ id }}</span>
              </div>
              <!-- <div class="reading-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: readingProgress + '%' }"></div>
                </div>
                <span class="progress-text">{{ Math.round(readingProgress) }}% read</span>
              </div> -->
            </div>
          </div>
          
          <div class="card-content">
            <SurahViewer 
              :surah-id="id" 
              @verse-selected="handleVerseSelected"
              @ask-ai="handleAskAI"
              @error="handleError"
              @message="handleMessage"
              @reading-progress="updateReadingProgress"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Modern Floating AI Assistant -->
    <Transition name="ai-assistant">
      <div v-if="showVoiceAssistant" class="ai-assistant-float">
        <div class="assistant-card">
          <div class="assistant-header">
            <div class="assistant-info">
              <div class="ai-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="assistant-details">
                <h3>AI Assistant</h3>
                <div class="status-indicator">
                  <div class="status-dot"></div>
                  <span>Online & Ready</span>
                </div>
              </div>
            </div>
            <div class="assistant-controls">
              <button @click="minimizeAssistant" class="control-btn" :class="{ 'active': isMinimized }">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 12h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
              <button @click="toggleVoiceAssistant" class="control-btn close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div v-if="!isMinimized" class="assistant-content">
            <VoiceAssistant 
              ref="voiceAssistant"
              :current-surah-id="id"
              @navigate-to-surah="handleNavigateToSurah"
              @navigate-to-verse="handleNavigateToVerse"
              @navigate-to-page="handleNavigateToPage"
              @play-recitation="handlePlayRecitation"
              @bookmark-verse="handleBookmarkVerse"
              @toggle-theme="handleToggleTheme"
            />
          </div>
        </div>
      </div>
    </Transition>
    
    <!-- Modern Text Chat Panel -->
    <Transition name="text-chat">
      <div v-if="!showVoiceAssistant && aiContext" class="text-chat-float">
        <div class="chat-card">
          <div class="chat-header">
            <div class="chat-info">
              <div class="chat-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="chat-details">
                <h3>AI Text Chat</h3>
                <p>Discussing verse {{ aiContext.verseNumber }}</p>
              </div>
            </div>
            <button @click="aiContext = null" class="control-btn close">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          
          <div class="chat-content">
            <AIChat 
              ref="aiChat"
              :initial-context="aiContext"
            />
          </div>
        </div>
      </div>
    </Transition>

    <!-- Modern Notification Toast -->
    <Transition name="notification-slide">
      <div v-if="notification" class="notification-toast" :class="notification.type">
        <div class="toast-content">
          <div class="toast-icon">
            <svg v-if="notification.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else-if="notification.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="toast-message">
            <span>{{ notification.message }}</span>
          </div>
          <button @click="dismissNotification" class="toast-dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="toast-progress">
          <div class="progress-bar" :style="{ animation: `toast-progress ${notificationDuration}ms linear` }"></div>
        </div>
      </div>
    </Transition>

    <!-- Floating Action Buttons -->
    <div class="floating-actions">
      <button @click="scrollToTop" class="fab scroll-top" v-show="showScrollTop">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M7 14l5-5 5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      
      <button @click="toggleBookmarks" class="fab bookmarks">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import SurahViewer from '../../components/surah/SurahViewer.vue'
import AIChat from '../../components/ai/AIChat.vue'
import VoiceAssistant from '../../components/ai/VoiceAssistant.vue'

export default {
  name: 'SurahView',
  components: {
    SurahViewer,
    AIChat,
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
      aiContext: null,
      notification: null,
      showVoiceAssistant: false,
      isMinimized: false,
      notificationTimeout: null,
      notificationDuration: 4000,
      readingProgress: 0,
      showScrollTop: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    if (this.notificationTimeout) {
      clearTimeout(this.notificationTimeout)
    }
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    toggleVoiceAssistant() {
      this.showVoiceAssistant = !this.showVoiceAssistant
      this.isMinimized = false
      
      // Haptic feedback
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    },
    
    minimizeAssistant() {
      this.isMinimized = !this.isMinimized
    },
    
    handleScroll() {
      this.showScrollTop = window.scrollY > 400
    },
    
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    
    toggleBookmarks() {
      this.showNotification('Bookmarks panel coming soon!', 'info')
    },
    
    updateReadingProgress(progress) {
      this.readingProgress = progress
    },
    
    handleVerseSelected({ surah, verse }) {
      this.aiContext = {
        surahName: surah.name,
        verseNumber: verse.number,
        verseText: verse.text,
        verse: verse.number
      }
    },
    
    handleAskAI({ surah, verse }) {
      this.aiContext = {
        surahName: surah.name,
        verseNumber: verse.number,
        verseText: verse.text,
        verse: verse.number
      }
      
      if (!this.showVoiceAssistant && this.$refs.aiChat) {
        this.$refs.aiChat.setContext(this.aiContext)
      }
    },
    
    handleNavigateToSurah(surahId) {
      this.$router.push(`/surah/${surahId}`)
      this.showNotification(`Navigating to Surah ${surahId}`, 'info')
    },
    
    handleNavigateToVerse({ surah_number, verse_number }) {
      if (surah_number != this.id) {
        this.$router.push(`/surah/${surah_number}`)
      }
      
      this.$nextTick(() => {
        const verseElement = document.querySelector(`[data-verse="${verse_number}"]`)
        if (verseElement) {
          const yOffset = -120
          const y = verseElement.getBoundingClientRect().top + window.pageYOffset + yOffset
          
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          })
          
          verseElement.classList.add('highlighted-verse')
          setTimeout(() => {
            verseElement.classList.remove('highlighted-verse')
          }, 4000)
        }
      })
      
      this.showNotification(`Navigating to Surah ${surah_number}, verse ${verse_number}`, 'info')
    },
    
    handleNavigateToPage({ page_number }) {
      this.showNotification(`Page navigation coming soon - Page ${page_number}`, 'info')
    },
    
    handlePlayRecitation({ surah_id, verse_number, reciter }) {
      const message = verse_number 
        ? `Playing verse ${verse_number} of Surah ${surah_id}${reciter ? ` by ${reciter}` : ''}`
        : `Playing Surah ${surah_id}${reciter ? ` by ${reciter}` : ''}`
      this.showNotification(message, 'success')
    },
    
    handleBookmarkVerse({ surah_id, verse_number, note }) {
      try {
        const bookmarks = JSON.parse(localStorage.getItem('quran_bookmarks') || '[]')
        const bookmark = {
          surah_id,
          verse_number,
          note,
          timestamp: new Date().toISOString(),
          id: Date.now()
        }
        bookmarks.push(bookmark)
        localStorage.setItem('quran_bookmarks', JSON.stringify(bookmarks))
        
        this.showNotification(`Verse ${verse_number} bookmarked successfully`, 'success')
      } catch (error) {
        console.error('Error saving bookmark:', error)
        this.showNotification('Failed to save bookmark', 'error')
      }
    },
    
    handleToggleTheme() {
      this.$emit('toggle-theme')
      this.showNotification('Theme toggled', 'info')
    },
    
    handleError(message) {
      this.showNotification(message, 'error')
    },
    
    handleMessage(message) {
      this.showNotification(message, 'success')
    },
    
    showNotification(message, type = 'info') {
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout)
      }
      
      this.notificationDuration = type === 'error' ? 6000 : type === 'success' ? 4000 : 5000
      this.notification = { message, type }
      
      this.notificationTimeout = setTimeout(() => {
        this.notification = null
      }, this.notificationDuration)
    },
    
    dismissNotification() {
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout)
      }
      this.notification = null
    }
  }
}
</script>

<style scoped>
/* Modern CSS Variables */
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
  --success-700: #047857;
  --success-800: #065f46;
  
  --error-50: #fef2f2;
  --error-100: #fee2e2;
  --error-300: #fca5a5;
  --error-500: #ef4444;
  --error-700: #b91c1c;
  --error-800: #991b1b;
  
  --warning-50: #fffbeb;
  --warning-500: #f59e0b;
  --warning-700: #b45309;
  
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-secondary: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
  --gradient-error: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --shadow-2xl: 0 25px 50px -12px rgb(0 0 0 / 0.25);
  
  --radius-sm: 0.375rem;
  --radius: 0.5rem;
  --radius-md: 0.75rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;
  --radius-2xl: 2rem;
  --radius-3xl: 3rem;
  
  --blur: blur(16px);
  --backdrop: saturate(180%) blur(20px);
}

/* Base Styles */
.surah-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--gray-50), white);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
}

/* Hero Background */
.hero-background {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  z-index: -1;
  overflow: hidden;
}

.gradient-overlay {
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0.1;
}

.pattern-overlay {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0);
  background-size: 24px 24px;
  opacity: 0.5;
}

/* Modern Floating Header */
.floating-header {
  position: sticky;
  top: 1rem;
  z-index: 40;
  padding: 0 1.5rem;
  margin-bottom: 2rem;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
}

.header-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--backdrop);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  padding: 1.25rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-xl);
}

.modern-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  background: var(--gray-100);
  border: none;
  border-radius: var(--radius-xl);
  color: var(--gray-700);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.9375rem;
}

.modern-back-btn:hover {
  background: var(--gray-200);
  color: var(--gray-900);
  transform: translateX(-4px);
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.modern-back-btn:hover .btn-icon {
  transform: translateX(-2px);
}

.header-title {
  text-align: center;
  flex: 1;
  margin: 0 2rem;
}

.header-title h1 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--gray-900);
  letter-spacing: -0.02em;
}

.header-title p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.modern-voice-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-xl);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-lg);
  font-size: 0.9375rem;
}

.modern-voice-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.modern-voice-btn.active {
  background: var(--gradient-secondary);
}

/* Main Container */
.main-container {
  padding: 0 1.5rem 4rem;
  position: relative;
  z-index: 1;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

/* Modern Surah Card */
.surah-card {
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-3xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  backdrop-filter: var(--backdrop);
}

.card-header {
  background: linear-gradient(135deg, var(--gray-50) 0%, rgba(255, 255, 255, 0.8) 100%);
  padding: 2rem;
  border-bottom: 1px solid var(--gray-200);
}

.surah-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.surah-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--gradient-primary);
  color: white;
  border-radius: var(--radius-xl);
  font-weight: 600;
  font-size: 0.9375rem;
  box-shadow: var(--shadow-md);
}

.reading-progress {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  width: 200px;
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-600);
  white-space: nowrap;
}

.card-content {
  padding: 0;
  background: white;
}

/* Modern AI Assistant Float */
.ai-assistant-float {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  width: 420px;
  max-width: calc(100vw - 2rem);
  max-height: calc(100vh - 8rem);
}

.assistant-card {
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  backdrop-filter: var(--backdrop);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 600px;
}

.assistant-header {
  background: var(--gradient-primary);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  flex-shrink: 0;
}

.assistant-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.ai-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.assistant-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.assistant-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.control-btn.close:hover {
  background: rgba(239, 68, 68, 0.8);
}

.assistant-content {
  flex: 1;
  overflow: hidden;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
}

/* Force VoiceAssistant component to fill remaining space */
.assistant-content > * {
  flex: 1;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: transparent;
}

/* VoiceAssistant specific styling */
.ai-assistant-float .voice-assistant {
  flex: 1 !important;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  border-radius: var(--radius-lg) !important;
  background: transparent !important;
  display: flex !important;
  flex-direction: column !important;
}

/* Modern Text Chat Float */
.text-chat-float {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 50;
  width: 420px;
  max-width: calc(100vw - 2rem);
  height: 600px;
  max-height: calc(100vh - 8rem);
}

.chat-card {
  background: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  backdrop-filter: var(--backdrop);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.chat-header {
  background: var(--gradient-secondary);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  flex-shrink: 0;
}

.chat-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chat-avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.chat-details h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.chat-details p {
  margin: 0;
  font-size: 0.875rem;
  opacity: 0.9;
}

.chat-content {
  flex: 1;
  overflow: hidden;
  background: white;
  padding: 1.5rem;
}

/* Modern Notification Toast */
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 60;
  width: 400px;
  max-width: calc(100vw - 2rem);
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  overflow: hidden;
  border: 1px solid var(--gray-200);
}

.toast-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
}

.toast-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -2px;
}

.notification-toast.success .toast-icon {
  background: var(--success-100);
  color: var(--success-700);
}

.notification-toast.error .toast-icon {
  background: var(--error-100);
  color: var(--error-700);
}

.notification-toast.info .toast-icon {
  background: var(--primary-100);
  color: var(--primary-700);
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-message span {
  font-weight: 500;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--gray-800);
}

.toast-dismiss {
  width: 28px;
  height: 28px;
  background: var(--gray-100);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-500);
  transition: all 0.2s ease;
  flex-shrink: 0;
  margin-top: 6px;
}

.toast-dismiss:hover {
  background: var(--gray-200);
  color: var(--gray-700);
  transform: scale(1.05);
}

.toast-progress {
  height: 3px;
  background: var(--gray-200);
  overflow: hidden;
}

.toast-progress .progress-bar {
  height: 100%;
  background: var(--primary-500);
  transform-origin: left;
}

@keyframes toast-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}

/* Floating Action Buttons */
.floating-actions {
  position: fixed;
  bottom: 2rem;
  left: 2rem;
  z-index: 45;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.fab {
  width: 56px;
  height: 56px;
  background: var(--gradient-primary);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  box-shadow: var(--shadow-xl);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-2xl);
}

.fab.scroll-top {
  background: var(--gradient-secondary);
}

.fab.bookmarks {
  background: var(--gradient-success);
}

/* Highlighted Verse Animation */
:global(.highlighted-verse) {
  animation: verse-highlight 4s ease-in-out;
  border-left: 4px solid var(--primary-500) !important;
  background: linear-gradient(90deg, var(--primary-50) 0%, transparent 100%) !important;
  border-radius: var(--radius-lg) !important;
  padding-left: 1.5rem !important;
  margin-left: -1.5rem !important;
  box-shadow: var(--shadow-md) !important;
}

@keyframes verse-highlight {
  0% {
    background: linear-gradient(90deg, var(--primary-100) 0%, var(--primary-50) 100%);
    transform: scale(1.01);
  }
  25% {
    background: linear-gradient(90deg, var(--primary-75) 0%, var(--primary-25) 100%);
  }
  75% {
    background: linear-gradient(90deg, var(--primary-75) 0%, var(--primary-25) 100%);
  }
  100% {
    background: linear-gradient(90deg, var(--primary-50) 0%, transparent 100%);
    transform: scale(1);
  }
}

/* Transitions */
.ai-assistant-enter-active,
.ai-assistant-leave-active,
.text-chat-enter-active,
.text-chat-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-assistant-enter-from,
.ai-assistant-leave-to,
.text-chat-enter-from,
.text-chat-leave-to {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.notification-slide-enter-active,
.notification-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-slide-enter-from,
.notification-slide-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Responsive Design */
@media (max-width: 768px) {
  .floating-header {
    top: 0.5rem;
    padding: 0 1rem;
    margin-bottom: 1rem;
  }
  
  .header-content {
    padding: 1rem 1.5rem;
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-title {
    margin: 0;
    text-align: center;
  }
  
  .modern-back-btn,
  .modern-voice-btn {
    justify-content: center;
  }
  
  .main-container {
    padding: 0 1rem 3rem;
  }
  
  .card-header {
    padding: 1.5rem;
  }
  
  .surah-info {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .reading-progress {
    justify-content: center;
  }
  
  .ai-assistant-float,
  .text-chat-float {
    bottom: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
    max-width: none;
    height: 500px;
  }
  
  .floating-actions {
    bottom: 1rem;
    left: 1rem;
  }
  
  .notification-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    width: auto;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .floating-header {
    top: 0.25rem;
    padding: 0 0.75rem;
  }
  
  .header-content {
    padding: 0.875rem 1rem;
    border-radius: var(--radius-xl);
  }
  
  .header-title h1 {
    font-size: 1.25rem;
  }
  
  .main-container {
    padding: 0 0.75rem 2rem;
  }
  
  .surah-card {
    border-radius: var(--radius-2xl);
  }
  
  .card-header {
    padding: 1rem;
  }
  
  .progress-bar {
    width: 150px;
  }
  
  .ai-assistant-float,
  .text-chat-float {
    bottom: 0.75rem;
    right: 0.75rem;
    left: 0.75rem;
    height: 450px;
    border-radius: var(--radius-xl);
  }
  
  .assistant-header,
  .chat-header {
    padding: 1rem;
  }
  
  .assistant-content,
  .chat-content {
    padding: 1rem;
  }
  
  .floating-actions {
    bottom: 0.75rem;
    left: 0.75rem;
  }
  
  .fab {
    width: 48px;
    height: 48px;
  }
  
  .modern-back-btn span,
  .modern-voice-btn span {
    font-size: 0.875rem;
  }
}

/* Performance Optimizations */
.ai-assistant-float,
.text-chat-float,
.notification-toast,
.floating-actions {
  will-change: transform, opacity;
}

/* Focus States for Accessibility */
.modern-back-btn:focus,
.modern-voice-btn:focus,
.control-btn:focus,
.toast-dismiss:focus,
.fab:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
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
  
  .surah-view {
    background: linear-gradient(to bottom, var(--gray-900), var(--gray-800));
  }
  
  .header-content,
  .surah-card,
  .assistant-card,
  .chat-card,
  .notification-toast {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(55, 65, 81, 0.8);
  }
  
  .card-header {
    background: linear-gradient(135deg, var(--gray-800) 0%, rgba(17, 24, 39, 0.8) 100%);
  }
}
</style>