/**
 * Service for accessing Quran data from quran-json CDN
 * Using: https://cdn.jsdelivr.net/npm/quran-json@3.1.2/
 */
class QuranJsonService {
  constructor() {
    this.baseUrl = 'https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist'
    this.cache = new Map()
  }

  /**
   * Get list of all chapters (Surahs)
   */
  async getChaptersList(language = 'en') {
    const cacheKey = `chapters_${language}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const url = language === 'ar' 
        ? `${this.baseUrl}/chapters/index.json`
        : `${this.baseUrl}/chapters/${language}/index.json`
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const chapters = await response.json()
      this.cache.set(cacheKey, chapters)
      return chapters
    } catch (error) {
      console.error('Error fetching chapters list:', error)
      // Fallback to basic data
      return this.getFallbackChaptersList()
    }
  }

  /**
   * Get a specific chapter (Surah) by number
   */
  async getChapter(chapterNumber, language = 'en') {
    const cacheKey = `chapter_${chapterNumber}_${language}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      let url
      if (language === 'ar') {
        url = `${this.baseUrl}/chapters/${chapterNumber}.json`
      } else {
        url = `${this.baseUrl}/chapters/${language}/${chapterNumber}.json`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const chapter = await response.json()
      this.cache.set(cacheKey, chapter)
      return chapter
    } catch (error) {
      console.error('Error fetching chapter:', error)
      return this.getFallbackChapter(chapterNumber)
    }
  }

  /**
   * Get a specific verse by its global number (1-6236)
   */
  async getVerse(verseNumber) {
    const cacheKey = `verse_${verseNumber}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const url = `${this.baseUrl}/verses/${verseNumber}.json`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const verse = await response.json()
      this.cache.set(cacheKey, verse)
      return verse
    } catch (error) {
      console.error('Error fetching verse:', error)
      throw error
    }
  }

  /**
   * Get the complete Quran with translations
   */
  async getCompleteQuran(language = 'en') {
    const cacheKey = `complete_quran_${language}`
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      let url
      if (language === 'ar') {
        url = `${this.baseUrl}/quran.json`
      } else {
        url = `${this.baseUrl}/quran_${language}.json`
      }
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const quran = await response.json()
      this.cache.set(cacheKey, quran)
      return quran
    } catch (error) {
      console.error('Error fetching complete Quran:', error)
      throw error
    }
  }

  /**
   * Get Quran transliteration
   */
  async getTransliteration() {
    const cacheKey = 'quran_transliteration'
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    try {
      const url = `${this.baseUrl}/quran_transliteration.json`
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const transliteration = await response.json()
      this.cache.set(cacheKey, transliteration)
      return transliteration
    } catch (error) {
      console.error('Error fetching transliteration:', error)
      throw error
    }
  }

  /**
   * Search verses by text
   */
  async searchVerses(query, language = 'en') {
    try {
      const quran = await this.getCompleteQuran(language)
      const results = []
      
      const searchTerm = query.toLowerCase()
      
      quran.forEach((chapter, chapterIndex) => {
        chapter.verses.forEach((verse, verseIndex) => {
          let searchText = verse.text || ''
          
          // Add translation text to search if available
          if (verse.translation) {
            searchText += ' ' + verse.translation
          }
          
          if (searchText.toLowerCase().includes(searchTerm)) {
            results.push({
              chapter: chapterIndex + 1,
              verse: verseIndex + 1,
              chapterName: chapter.name || `Chapter ${chapterIndex + 1}`,
              verseText: verse.text,
              translation: verse.translation,
              transliteration: verse.transliteration
            })
          }
        })
      })
      
      return results
    } catch (error) {
      console.error('Error searching verses:', error)
      return []
    }
  }

  /**
   * Convert chapter data to our app format
   */
  convertChapterToAppFormat(chapter, chapterNumber) {
    return {
      id: chapter.id || chapterNumber,
      name: chapter.name || `Surah ${chapterNumber}`,
      englishName: chapter.translation || chapter.transliteration || `Chapter ${chapterNumber}`,
      verses: chapter.verses ? chapter.verses.length : chapter.total_verses || 0,
      type: chapter.type === 'meccan' ? 'Meccan' : chapter.type === 'medinan' ? 'Medinan' : 'Unknown',
      verses_data: chapter.verses || []
    }
  }

  /**
   * Convert verse data to our app format
   */
  convertVerseToAppFormat(verse, verseNumber) {
    return {
      number: verse.id || verseNumber,
      text: verse.text || '',
      translation: verse.translation || '',
      transliteration: verse.transliteration || ''
    }
  }

  /**
   * Get fallback chapters list
   */
  getFallbackChaptersList() {
    return [
      { id: 1, name: "الفاتحة", englishName: "Al-Fatihah", verses: 7, type: "Meccan" },
      { id: 2, name: "البقرة", englishName: "Al-Baqarah", verses: 286, type: "Medinan" },
      { id: 3, name: "آل عمران", englishName: "Ali 'Imran", verses: 200, type: "Medinan" },
      { id: 4, name: "النساء", englishName: "An-Nisa", verses: 176, type: "Medinan" },
      { id: 5, name: "المائدة", englishName: "Al-Ma'idah", verses: 120, type: "Medinan" },
      { id: 6, name: "الأنعام", englishName: "Al-An'am", verses: 165, type: "Meccan" },
      { id: 7, name: "الأعراف", englishName: "Al-A'raf", verses: 206, type: "Meccan" },
      { id: 8, name: "الأنفال", englishName: "Al-Anfal", verses: 75, type: "Medinan" },
      { id: 9, name: "التوبة", englishName: "At-Tawbah", verses: 129, type: "Medinan" },
      { id: 10, name: "يونس", englishName: "Yunus", verses: 109, type: "Meccan" },
      { id: 112, name: "الإخلاص", englishName: "Al-Ikhlas", verses: 4, type: "Meccan" },
      { id: 113, name: "الفلق", englishName: "Al-Falaq", verses: 5, type: "Meccan" },
      { id: 114, name: "الناس", englishName: "An-Nas", verses: 6, type: "Meccan" }
    ]
  }

  /**
   * Get fallback chapter data
   */
  getFallbackChapter(chapterNumber) {
    const fallbackData = {
      1: {
        name: "الفاتحة",
        englishName: "Al-Fatihah",
        verses: [
          { text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
          { text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "All praise is due to Allah, Lord of the worlds." },
          { text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful." },
          { text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
          { text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
          { text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path." },
          { text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray." }
        ]
      },
      112: {
        name: "الإخلاص",
        englishName: "Al-Ikhlas",
        verses: [
          { text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [who is] One,'" },
          { text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
          { text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
          { text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent." }
        ]
      }
    }

    const data = fallbackData[chapterNumber]
    if (data) {
      return {
        ...data,
        verses: data.verses.map((verse, index) => ({
          number: index + 1,
          ...verse
        }))
      }
    }

    return {
      name: `Surah ${chapterNumber}`,
      englishName: `Chapter ${chapterNumber}`,
      verses: []
    }
  }

  /**
   * Get available languages
   */
  getAvailableLanguages() {
    return [
      { code: 'ar', name: 'Arabic' },
      { code: 'en', name: 'English' },
      { code: 'bn', name: 'Bengali' },
      { code: 'zh', name: 'Chinese' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ru', name: 'Russian' },
      { code: 'sv', name: 'Swedish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'ur', name: 'Urdu' }
    ]
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize() {
    return this.cache.size
  }
}

export default new QuranJsonService()