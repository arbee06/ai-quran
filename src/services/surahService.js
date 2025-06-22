import quranJsonService from './quranJsonService'

class SurahService {
  constructor() {
    this.cachedData = new Map()
    this.chaptersCache = null
  }

  async getAllSurahs() {
    if (this.chaptersCache) {
      return this.chaptersCache
    }

    try {
      const chaptersData = await quranJsonService.getChaptersList('en')
      
      // Convert to our app format
      this.chaptersCache = chaptersData.map((chapter) => ({
        id: chapter.id,
        name: chapter.name || `Surah ${chapter.id}`,
        englishName: chapter.translation || chapter.transliteration || `Chapter ${chapter.id}`,
        verses: chapter.total_verses || 0,
        type: chapter.type === 'meccan' ? 'Meccan' : chapter.type === 'medinan' ? 'Medinan' : 'Unknown'
      }))
      
      return this.chaptersCache
    } catch (error) {
      console.error('Error fetching chapters:', error)
      // Return fallback data
      return quranJsonService.getFallbackChaptersList()
    }
  }

  async getSurahById(id) {
    const allSurahs = await this.getAllSurahs()
    const surah = allSurahs.find(s => s.id === parseInt(id))
    
    // If not found, create a basic fallback
    if (!surah) {
      console.warn(`Surah with ID ${id} not found, creating fallback`)
      return {
        id: parseInt(id),
        name: `Surah ${id}`,
        englishName: `Chapter ${id}`,
        verses: 0,
        type: 'Unknown'
      }
    }
    
    return surah
  }

  async getSurahContent(surahId) {
    if (this.cachedData.has(surahId)) {
      return this.cachedData.get(surahId)
    }

    try {
      // Get chapter data from quran-json CDN
      const chapterData = await quranJsonService.getChapter(surahId, 'en')
      const surahInfo = await this.getSurahById(surahId)
      
      const surahContent = {
        id: parseInt(surahId),
        name: chapterData?.name || surahInfo?.name || `Surah ${surahId}`,
        englishName: chapterData?.translation || chapterData?.transliteration || surahInfo?.englishName || `Chapter ${surahId}`,
        verses: chapterData?.verses ? chapterData.verses.map((verse) => ({
          number: verse.id,
          text: verse.text || '',
          translation: verse.translation || '',
          transliteration: verse.transliteration || ''
        })) : []
      }
      
      this.cachedData.set(surahId, surahContent)
      return surahContent
    } catch (error) {
      console.error('Error fetching surah content:', error)
      return await this.getFallbackSurahContent(surahId)
    }
  }

  async getFallbackSurahContent(surahId) {
    const surah = await this.getSurahById(surahId)
    
    const fallbackVerses = {
      1: [
        { number: 1, text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ", translation: "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
        { number: 2, text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ", translation: "All praise is due to Allah, Lord of the worlds." },
        { number: 3, text: "الرَّحْمَٰنِ الرَّحِيمِ", translation: "The Entirely Merciful, the Especially Merciful." },
        { number: 4, text: "مَالِكِ يَوْمِ الدِّينِ", translation: "Sovereign of the Day of Recompense." },
        { number: 5, text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ", translation: "It is You we worship and You we ask for help." },
        { number: 6, text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ", translation: "Guide us to the straight path." },
        { number: 7, text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ", translation: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray." }
      ],
      112: [
        { number: 1, text: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "Say, 'He is Allah, [who is] One,'" },
        { number: 2, text: "اللَّهُ الصَّمَدُ", translation: "Allah, the Eternal Refuge." },
        { number: 3, text: "لَمْ يَلِدْ وَلَمْ يُولَدْ", translation: "He neither begets nor is born," },
        { number: 4, text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ", translation: "Nor is there to Him any equivalent." }
      ]
    }

    return {
      id: surahId,
      name: surah?.name || `Surah ${surahId}`,
      englishName: surah?.englishName || `Chapter ${surahId}`,
      verses: fallbackVerses[surahId] || []
    }
  }

  async searchVerses(query) {
    try {
      // Use quran-json service for searching
      return await quranJsonService.searchVerses(query, 'en')
    } catch (error) {
      console.error('Error searching verses:', error)
      
      // Fallback to manual search through cached content
      const results = []
      const allSurahs = await this.getAllSurahs()
      
      for (const surah of allSurahs) {
        try {
          const content = await this.getSurahContent(surah.id)
          if (content && content.verses) {
            content.verses.forEach(verse => {
              if (verse.text.includes(query) || verse.translation.toLowerCase().includes(query.toLowerCase())) {
                results.push({
                  surah: surah,
                  verse: verse,
                  surahId: surah.id,
                  verseNumber: verse.number
                })
              }
            })
          }
        } catch (error) {
          console.error(`Error searching in surah ${surah.id}:`, error)
        }
      }
      
      return results
    }
  }

  clearCache() {
    this.cachedData.clear()
  }
}

export default new SurahService()