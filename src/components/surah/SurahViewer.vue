<template>
  <div class="surah-viewer">
    <div class="surah-header" v-if="surah && surah.name">
      <h2>{{ surah.name }} - {{ surah.englishName }}</h2>
      <div class="surah-meta">
        <span class="badge">{{ surah.type }}</span>
        <span class="verses-count">{{ surah.verses }} verses</span>
      </div>
    </div>
    <div class="surah-header" v-else-if="loading">
      <h2>Loading Surah...</h2>
    </div>
    <div class="surah-header" v-else>
      <h2>Surah {{ surahId }}</h2>
      <div class="surah-meta">
        <span class="verses-count">Loading...</span>
      </div>
    </div>

    <div class="controls">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Search in this Surah..."
        class="search-input"
      >
      <button @click="toggleTranslation" class="btn btn-secondary">
        {{ showTranslation ? 'Hide' : 'Show' }} Translation
      </button>
    </div>

    <div v-if="loading" class="loading">Loading verses...</div>
    
    <div v-else class="verses-container">
      <div 
        v-for="verse in filteredVerses" 
        :key="verse.number"
        class="verse-item"
        :class="{ 'selected': selectedVerse === verse.number }"
        :data-verse="verse.number"
        @click="selectVerse(verse)"
      >
        <div class="verse-number">{{ verse.number }}</div>
        <div class="verse-content">
          <p class="arabic-text" dir="rtl">{{ verse.text }}</p>
          <p v-if="showTranslation" class="translation">{{ verse.translation }}</p>
        </div>
        <div class="verse-actions">
          <button @click.stop="askAI(verse)" class="btn-icon" title="Ask AI">
            💭
          </button>
          <button @click.stop="copyVerse(verse)" class="btn-icon" title="Copy">
            📋
          </button>
          <button @click.stop="playAudio(verse)" class="btn-icon" title="Play Audio" v-if="verse.audio">
            🔊
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import surahService from '../../services/surahService'
import { highlightSearchTerms, copyToClipboard } from '../../utils/quranUtils'

export default {
  name: 'SurahViewer',
  props: {
    surahId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      surah: {},
      verses: [],
      loading: true,
      showTranslation: true,
      searchQuery: '',
      selectedVerse: null
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
    await this.loadSurah()
  },
  methods: {
    async loadSurah() {
      this.loading = true
      try {
        this.surah = await surahService.getSurahById(this.surahId)
        const content = await surahService.getSurahContent(this.surahId)
        this.verses = content?.verses || []
        
        // If surah data is missing, try to get it from content
        if (!this.surah && content) {
          this.surah = {
            id: this.surahId,
            name: content.name || `Surah ${this.surahId}`,
            englishName: content.englishName || `Chapter ${this.surahId}`,
            verses: content.verses?.length || 0,
            type: 'Unknown'
          }
        }
      } catch (error) {
        console.error('Error loading surah:', error)
        this.$emit('error', 'Failed to load Surah')
        
        // Set fallback data
        this.surah = {
          id: this.surahId,
          name: `Surah ${this.surahId}`,
          englishName: `Chapter ${this.surahId}`,
          verses: 0,
          type: 'Unknown'
        }
        this.verses = []
      } finally {
        this.loading = false
      }
    },
    toggleTranslation() {
      this.showTranslation = !this.showTranslation
    },
    selectVerse(verse) {
      this.selectedVerse = verse.number
      this.$emit('verse-selected', {
        surah: this.surah,
        verse: verse
      })
    },
    askAI(verse) {
      this.$emit('ask-ai', {
        surah: this.surah,
        verse: verse
      })
    },
    async copyVerse(verse) {
      const surahName = this.surah?.name || `Surah ${this.surahId}`
      const text = `${surahName} ${verse.number}\n${verse.text || ''}\n\n${verse.translation || ''}`
      const success = await copyToClipboard(text)
      if (success) {
        this.$emit('message', 'Verse copied to clipboard')
      }
    },
    playAudio(verse) {
      if (verse.audio) {
        const audio = new Audio(verse.audio)
        audio.play()
      }
    }
  },
  watch: {
    surahId() {
      this.loadSurah()
    }
  }
}
</script>

<style scoped>
.surah-viewer {
  max-width: 800px;
  margin: 0 auto;
}

.surah-header {
  text-align: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
}

.surah-header h2 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
}

.surah-meta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
}

.controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #e2e8f0;
  color: #2d3748;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.verses-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verse-item {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.verse-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.verse-item.selected {
  border-left: 4px solid #667eea;
}

.verse-number {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f7fafc;
  border-radius: 50%;
  font-weight: bold;
  color: #4a5568;
}

.verse-content {
  flex: 1;
}

.arabic-text {
  font-size: 1.5rem;
  line-height: 2;
  margin: 0 0 1rem 0;
  font-family: 'Amiri', 'Traditional Arabic', serif;
}

.translation {
  margin: 0;
  color: #4a5568;
  line-height: 1.6;
}

.verse-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.btn-icon:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.dark-theme .surah-viewer {
  color: #e2e8f0;
}

.dark-theme .verse-item {
  background: #2d3748;
}

.dark-theme .arabic-text {
  color: #e2e8f0;
}

.dark-theme .translation {
  color: #a0aec0;
}

.dark-theme .search-input {
  background: #2d3748;
  border-color: #4a5568;
  color: #e2e8f0;
}

.dark-theme .btn-icon {
  background: #4a5568;
}

.dark-theme .btn-icon:hover {
  background: #718096;
}
</style>