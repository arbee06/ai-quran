# File: ai-quran/src/views/home/index.vue

<template>
  <div class="home-view">
    <!-- Main Hero Section with Modern Features -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="hero-gradient"></div>
        <div class="hero-pattern"></div>
      </div>
      
      <div class="hero-content">
        <div class="hero-main">
          <h1 class="hero-title">
            Experience the
            <span class="gradient-text">Holy Quran</span>
            like never before
          </h1>
          
          <p class="hero-description">
            Discover divine wisdom with AI-powered insights, natural voice interaction, 
            and seamless navigation through all 114 Surahs
          </p>

          <div class="hero-actions">
            <button @click="startVoiceSession" class="btn-primary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>Start Voice Session</span>
            </button>
            
            <button @click="scrollToSurahs" class="btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <span>Browse Surahs</span>
            </button>
          </div>
        </div>

        <!-- Modern 2x2 Features Grid -->
        <div class="features-container">
          <div class="features-grid">
            <div class="feature-card primary" @click="scrollToSurahs">
              <div class="feature-header">
                <div class="feature-icon quran">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <path d="M6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="feature-badge">Study</div>
              </div>
              <div class="feature-content">
                <h3>Read & Study</h3>
                <p>Beautiful Arabic text with translations and scholarly commentary for deep understanding</p>
              </div>
            </div>
            
            <div class="feature-card secondary" @click="startVoiceSession">
              <div class="feature-header">
                <div class="feature-icon ai">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="feature-badge ai-badge">AI</div>
              </div>
              <div class="feature-content">
                <h3>Voice Assistant</h3>
                <p>Natural conversations powered by AI for personalized Quranic insights and guidance</p>
              </div>
            </div>
            
            <div class="feature-card tertiary">
              <div class="feature-header">
                <div class="feature-icon audio">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <polygon points="11 5,6 9,2 9,2 15,6 15,11 19,11 5" fill="currentColor"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" stroke-width="2"/>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="feature-badge audio-badge">Audio</div>
              </div>
              <div class="feature-content">
                <h3>Recitation</h3>
                <p>Listen to beautiful recitations from world-renowned Qaris with crystal clear audio</p>
              </div>
            </div>
            
            <div class="feature-card quaternary">
              <div class="feature-header">
                <div class="feature-icon search">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="feature-badge search-badge">Search</div>
              </div>
              <div class="feature-content">
                <h3>Smart Search</h3>
                <p>Find verses instantly by keywords, themes, or concepts with intelligent search</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Surahs Section with Reduced Gap -->
    <section class="surahs-section" ref="surahsSection">
      <div class="container">
        <div class="section-header">
          <h2>Browse All 114 Surahs</h2>
          <p>Search and discover the chapters of divine revelation</p>
        </div>
        
        <!-- Search Bar -->
        <div class="search-section">
          <div class="search-container">
            <div class="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search Surahs, verses, or topics..."
              class="search-input"
              @input="handleSearch"
            >
            <div v-if="searchQuery" class="search-clear" @click="searchQuery = ''">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div class="surahs-controls">
          <div class="filter-tabs">
            <button 
              @click="filterType = 'all'" 
              :class="{ active: filterType === 'all' }"
              class="filter-tab"
            >
              <span>All Surahs</span>
              <span class="count">114</span>
            </button>
            <button 
              @click="filterType = 'meccan'" 
              :class="{ active: filterType === 'meccan' }"
              class="filter-tab"
            >
              <span>Meccan</span>
              <span class="count">86</span>
            </button>
            <button 
              @click="filterType = 'medinan'" 
              :class="{ active: filterType === 'medinan' }"
              class="filter-tab"
            >
              <span>Medinan</span>
              <span class="count">28</span>
            </button>
          </div>
          
          <div class="view-controls">
            <button 
              @click="viewMode = 'grid'" 
              :class="{ active: viewMode === 'grid' }"
              class="view-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="1.5"/>
                <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="1.5"/>
                <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="1.5"/>
                <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="{ active: viewMode === 'list' }"
              class="view-btn"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <line x1="8" y1="6" x2="21" y2="6" stroke="currentColor" stroke-width="1.5"/>
                <line x1="8" y1="12" x2="21" y2="12" stroke="currentColor" stroke-width="1.5"/>
                <line x1="8" y1="18" x2="21" y2="18" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="6" x2="3.01" y2="6" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="12" x2="3.01" y2="12" stroke="currentColor" stroke-width="1.5"/>
                <line x1="3" y1="18" x2="3.01" y2="18" stroke="currentColor" stroke-width="1.5"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Loading Surahs...</p>
        </div>
        
        <div v-else :class="['surahs-grid', viewMode]">
          <router-link 
            v-for="surah in filteredSurahs" 
            :key="surah.id"
            :to="`/surah/${surah.id}`"
            class="modern-surah-card"
          >
            <div class="card-background"></div>
            <div class="surah-number-badge">{{ surah.id }}</div>
            <div class="surah-main-content">
              <div class="surah-names">
                <h3 class="arabic-name">{{ surah.name }}</h3>
                <p class="english-name">{{ surah.englishName }}</p>
              </div>
              <div class="surah-meta">
                <span class="revelation-badge" :class="surah.type.toLowerCase()">
                  {{ surah.type }}
                </span>
                <span class="verse-count">{{ surah.verses }} verses</span>
              </div>
            </div>
            <div class="card-action">
              <div class="play-button">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polygon points="5,3 19,12 5,21" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <!-- Voice Assistant Widget - Self-contained -->
    <VoiceAssistant 
      ref="voiceAssistant"
      @navigate-to-surah="handleNavigateToSurah"
      @navigate-to-verse="handleNavigateToVerse"
      @navigate-to-page="handleNavigateToPage"
      @play-recitation="handlePlayRecitation"
      @bookmark-verse="handleBookmarkVerse"
      @toggle-theme="handleToggleTheme"
      @start-voice-session="handleStartVoiceSession"
    />

    <!-- Notifications -->
    <Transition name="notification">
      <div v-if="notification" class="notification" :class="notification.type">
        <div class="notification-icon">
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
        <span>{{ notification.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script>
import surahService from '../../services/surahService'
import VoiceAssistant from '../ai/VoiceAssistant.vue'

export default {
  name: 'HomeView',
  components: {
    VoiceAssistant
  },
  data() {
    return {
      surahs: [],
      searchQuery: '',
      filterType: 'all',
      viewMode: 'grid',
      loading: true,
      notification: null
    }
  },
  computed: {
    filteredSurahs() {
      let filtered = this.surahs
      
      if (this.filterType !== 'all') {
        filtered = filtered.filter(surah => 
          surah.type.toLowerCase() === this.filterType
        )
      }
      
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(surah => 
          surah.name.toLowerCase().includes(query) ||
          surah.englishName.toLowerCase().includes(query) ||
          surah.id.toString() === query
        )
      }
      
      return filtered
    }
  },
  async mounted() {
    await this.loadSurahs()
  },
  methods: {
    async loadSurahs() {
      this.loading = true
      try {
        this.surahs = await surahService.getAllSurahs()
      } catch (error) {
        console.error('Error loading surahs:', error)
        this.showNotification('Failed to load Surahs', 'error')
      } finally {
        this.loading = false
      }
    },
    
    handleSearch() {
      // Debounced search implementation
    },
    
    startVoiceSession() {
      this.$refs.voiceAssistant?.startVoiceSession()
    },
    
    scrollToSurahs() {
      this.$refs.surahsSection?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    },
    
    handleNavigateToSurah(surahId) {
      this.$router.push(`/surah/${surahId}`)
      this.showNotification(`Navigating to Surah ${surahId}`, 'info')
    },
    
    handleNavigateToVerse({ surah_number, verse_number }) {
      this.$router.push(`/surah/${surah_number}`)
      this.showNotification(`Navigating to Surah ${surah_number}, verse ${verse_number}`, 'info')
    },
    
    handleNavigateToPage({ page_number }) {
      this.showNotification(`Page navigation coming soon!`, 'info')
    },
    
    handlePlayRecitation({ surah_number, verse_number, reciter }) {
      const message = verse_number 
        ? `Playing verse ${verse_number} of Surah ${surah_number}`
        : `Playing Surah ${surah_number}`
      this.showNotification(message, 'success')
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
      
      this.showNotification(`Bookmarked Surah ${surah_number}, verse ${verse_number}`, 'success')
    },
    
    handleToggleTheme() {
      this.$emit('toggle-theme')
      this.showNotification('Theme toggled', 'info')
    },
    
    handleStartVoiceSession() {
      // Voice session started from the widget - no notification needed
    },
    
    showNotification(message, type = 'info') {
      this.notification = { message, type }
      setTimeout(() => {
        this.notification = null
      }, 4000)
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

/* Base Styles */
* {
  box-sizing: border-box;
}

.home-view {
  min-height: 100vh;
  background: linear-gradient(to bottom, var(--gray-50), white);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Enhanced Hero Section */
.hero-section {
  position: relative;
  padding: 4rem 1.5rem 2rem; /* Reduced bottom padding */
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
  z-index: -1;
}

.hero-gradient {
  position: absolute;
  inset: 0;
  background: var(--gradient-primary);
  opacity: 0.08;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 1px 1px, rgba(99, 102, 241, 0.15) 1px, transparent 0);
  background-size: 24px 24px;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.hero-main {
  text-align: center;
  margin-bottom: 3rem; /* Reduced from 4rem */
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.1;
  color: var(--gray-900);
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
}

.gradient-text {
  color: #1d4ed8 !important;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  display: inline-block;
}

@supports not (-webkit-background-clip: text) {
  .gradient-text {
    background: none !important;
    color: #1d4ed8 !important;
  }
}

.hero-description {
  font-size: 1.25rem;
  color: var(--gray-600);
  margin-bottom: 3rem;
  line-height: 1.6;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem; /* Added margin */
}

/* Button Styles */
.btn-primary {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  color: white;
  border: none;
  border-radius: 16px;
  padding: 16px 32px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 
    0 10px 25px -5px rgba(79, 70, 229, 0.4),
    0 4px 6px -2px rgba(79, 70, 229, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 180px;
  text-decoration: none;
  cursor: pointer;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #5b21b6 0%, #1e40af 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.btn-primary:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 
    0 20px 40px -5px rgba(79, 70, 229, 0.5),
    0 8px 16px -4px rgba(79, 70, 229, 0.2);
}

.btn-primary:hover::before {
  opacity: 1;
}

.btn-primary span {
  position: relative;
  z-index: 1;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  color: #374151;
  border: 1px solid rgba(209, 213, 219, 0.8);
  border-radius: 16px;
  padding: 16px 32px;
  font-weight: 600;
  font-size: 16px;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.05),
    0 2px 4px rgba(0, 0, 0, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 180px;
  text-decoration: none;
  cursor: pointer;
}

.btn-secondary::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: 16px;
}

.btn-secondary:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(79, 70, 229, 0.3);
  color: #1f2937;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.1),
    0 4px 12px rgba(79, 70, 229, 0.1);
}

.btn-secondary:hover::before {
  opacity: 1;
}

.btn-secondary span {
  position: relative;
  z-index: 1;
}

/* Modern Features Container */
.features-container {
  max-width: 900px; /* Reduced width for better 2x2 layout */
  margin: 0 auto;
}

/* Modern 2x2 Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem; /* Reduced gap */
  margin-bottom: 2rem; /* Reduced margin */
}

/* Modern Feature Cards */
.feature-card {
  position: relative;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.8);
  border-radius: 20px;
  padding: 1.75rem;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-height: 160px; /* Consistent height */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--accent-color), transparent);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.08),
    0 8px 16px rgba(0, 0, 0, 0.06);
  border-color: rgba(99, 102, 241, 0.2);
}

.feature-card:hover::before {
  transform: scaleX(1);
}

/* Feature Card Variants */
.feature-card.primary {
  --accent-color: #3b82f6;
}

.feature-card.secondary {
  --accent-color: #8b5cf6;
}

.feature-card.tertiary {
  --accent-color: #06b6d4;
}

.feature-card.quaternary {
  --accent-color: #10b981;
}

.feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.feature-icon {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s ease;
}

.feature-icon.quran {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.feature-icon.ai {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.feature-icon.audio {
  background: linear-gradient(135deg, #06b6d4, #0891b2);
}

.feature-icon.search {
  background: linear-gradient(135deg, #10b981, #059669);
}

.feature-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(59, 130, 246, 0.1);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.feature-badge.ai-badge {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
  border-color: rgba(139, 92, 246, 0.2);
}

.feature-badge.audio-badge {
  background: rgba(6, 182, 212, 0.1);
  color: #0891b2;
  border-color: rgba(6, 182, 212, 0.2);
}

.feature-badge.search-badge {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  border-color: rgba(16, 185, 129, 0.2);
}

.feature-content {
  flex: 1;
}

.feature-content h3 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.01em;
}

.feature-content p {
  color: var(--gray-600);
  line-height: 1.5;
  font-size: 0.875rem;
  margin: 0;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

/* Surahs Section with Reduced Gap */
.surahs-section {
  padding: 3rem 0 6rem; /* Reduced top padding from 4rem to 3rem */
  background: var(--gray-50);
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--gray-900);
  margin-bottom: 1rem;
  letter-spacing: -0.02em;
}

.section-header p {
  font-size: 1.125rem;
  color: var(--gray-600);
  max-width: 600px;
  margin: 0 auto;
}

/* Search Section */
.search-section {
  margin-bottom: 3rem;
}

.search-container {
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  padding-right: 3rem;
  font-size: 1rem;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-xl);
  background: white;
  transition: all 0.2s ease;
  color: var(--gray-900);
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), var(--shadow-md);
}

.search-input::placeholder {
  color: var(--gray-500);
}

.search-clear {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: var(--gray-200);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--gray-500);
  transition: all 0.2s ease;
}

.search-clear:hover {
  background: var(--gray-300);
  color: var(--gray-700);
}

.surahs-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-tabs {
  display: flex;
  background: var(--gray-100);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  color: var(--gray-600);
}

.filter-tab.active {
  background: white;
  color: var(--primary-600);
  box-shadow: var(--shadow-sm);
}

.count {
  background: var(--gray-200);
  color: var(--gray-600);
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.filter-tab.active .count {
  background: var(--primary-100);
  color: var(--primary-600);
}

.view-controls {
  display: flex;
  background: var(--gray-100);
  border-radius: var(--radius-lg);
  padding: 0.25rem;
}

.view-btn {
  width: 44px;
  height: 44px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--gray-500);
}

.view-btn.active {
  background: white;
  color: var(--primary-600);
  box-shadow: var(--shadow-sm);
}

.loading-state {
  text-align: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top: 3px solid var(--primary-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.surahs-grid {
  display: grid;
  gap: 1rem;
}

.surahs-grid.grid {
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.surahs-grid.list {
  grid-template-columns: 1fr;
}

/* Modern Surah Cards */
.modern-surah-card {
  position: relative;
  background: white;
  border: 1px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
}

.modern-surah-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, #3b82f6, #8b5cf6, transparent);
  transform: scaleX(0);
  transition: transform 0.4s ease;
}

.modern-surah-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.modern-surah-card:hover::before {
  transform: scaleX(1);
}

.card-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.02) 0%, rgba(139, 92, 246, 0.02) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-surah-card:hover .card-background {
  opacity: 1;
}

.surah-number-badge {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  border: 1px solid var(--gray-200);
  transition: all 0.3s ease;
}

.modern-surah-card:hover .surah-number-badge {
  background: var(--primary-50);
  color: var(--primary-600);
  border-color: var(--primary-200);
  transform: scale(1.05);
}

.surah-main-content {
  flex: 1;
  min-width: 0;
}

.surah-names {
  margin-bottom: 0.75rem;
}

.arabic-name {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  letter-spacing: -0.01em;
}

.english-name {
  font-size: 0.9375rem;
  color: var(--gray-600);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}

.surah-meta {
  display: flex;
  gap: 1rem;
  align-items: center;
  font-size: 0.8125rem;
}

.revelation-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.75rem;
}

.revelation-badge.meccan {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border: 1px solid #fbbf24;
}

.revelation-badge.medinan {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border: 1px solid #34d399;
}

.verse-count {
  color: var(--gray-500);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.verse-count::before {
  content: '';
  width: 4px;
  height: 4px;
  background: var(--gray-400);
  border-radius: 50%;
}

.card-action {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.play-button {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #0ea5e9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0284c7;
  transition: all 0.3s ease;
  opacity: 0;
  transform: scale(0.8);
}

.modern-surah-card:hover .play-button {
  opacity: 1;
  transform: scale(1);
}

.play-button:hover {
  background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
  color: white;
  transform: scale(1.1);
}

/* Notification */
.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 110;
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

.notification.success {
  border-color: var(--success-300);
  background: var(--success-50);
  color: var(--success-800);
}

.notification.error {
  border-color: var(--error-300);
  background: var(--error-50);
  color: var(--error-800);
}

.notification.info {
  border-color: var(--primary-300);
  background: var(--primary-50);
  color: var(--primary-800);
}

/* Transitions */
.notification-enter-active, .notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from, .notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-section {
    padding: 3rem 1rem 2rem;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .feature-card {
    min-height: auto;
    padding: 1.5rem;
  }
  
  .surahs-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .surahs-grid.grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 1rem;
  }
  
  .hero-section {
    padding: 2rem 1rem 1.5rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    max-width: 280px;
  }
  
  .features-container {
    max-width: 100%;
  }
  
  .feature-card {
    padding: 1.25rem;
  }
  
  .modern-surah-card {
    padding: 1rem;
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .surah-main-content {
    order: 2;
  }
  
  .surah-number-badge {
    order: 1;
    width: 48px;
    height: 48px;
    font-size: 1rem;
  }
  
  .card-action {
    order: 3;
    justify-content: center;
  }
  
  .section-header h2 {
    font-size: 2rem;
  }
  
  .search-input {
    font-size: 0.9375rem;
  }
  
  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
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