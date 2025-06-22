/**
 * Service for managing Quran audio recitation
 * Using King Saud University audio endpoint: https://quran.ksu.edu.sa/ayat/mp3/
 */
class QuranAudioService {
  constructor() {
    this.baseUrl = 'https://quran.ksu.edu.sa/ayat/mp3'
    this.currentAudio = null
    this.currentPlaylist = []
    this.currentIndex = 0
    this.isPlaying = false
    this.isPaused = false
    this.currentReciter = 'sudais' // Default reciter
    this.volume = 0.8
    this.eventListeners = new Map()
    
    this.quraaMap = {
      "husary": "Husary_64kbps",
      "husary.m": "Husary_Mujawwad_64kbps",
      "husary.t": "Hussary.teacher_64kbps",
      "husary.tq": "Hussary.teacher_32kbps",
      "husary.w": "warsh_husary_64kbps",
      "husary.e": "husary_qasr_64kbps",
      "huzaify": "Hudhaify_64kbps",
      "sudais": "Abdurrahmaan_As-Sudais_64kbps",
      "shuraym": "Saood_ash-Shuraym_64kbps",
      "maher": "Maher_AlMuaiqly_64kbps",
      "ghamidi": "Ghamadi_40kbps",
      "qatami": "Nasser_Alqatami_128kbps",
      "jibreel": "Muhammad_Jibreel_64kbps",
      "shatree": "Abu_Bakr_Ash-Shaatree_64kbps",
      "ajamy": "Ahmed_ibn_Ali_al-Ajamy_64kbps",
      "afasy": "Alafasy_64kbps",
      "basfar": "Abdullah_Basfar_64kbps",
      "absulbasit": "Abdul_Basit_Murattal_64kbps",
      "absulbasit.m": "AbdulSamad_64kbps",
      "minshawy": "Minshawy_Murattal_128kbps",
      "minshawy.m": "Minshawy_Mujawwad_64kbps",
      "minshawy.t": "Minshawy_Teacher_128kbps",
      "ayyoub": "Muhammad_Ayyoub_64kbps",
      "rifai": "Hani_Rifai_192kbps",
      "awwad": "Abdullaah_3awwaad_Al-Juhaynee_128kbps",
      "qasim": "Muhsin_Al_Qasim_192kbps",
      "tablawy": "Mohammad_al_Tablaway_64kbps",
      "tunaiji": "tunaiji_64kbps",
      "khaleefa": "khaleefa_96kbps",
      "yaser": "Yasser_Ad-Dussary_128kbps",
      "abdulkareem": "Muhammad_AbdulKareem_128kbps",
      "dosary": "warsh_dossary_128kbps",
      "dosary.q": "warsh_dossary_32kbps",
      "yasin": "warsh_yassin_64kbps",
      "fares": "Fares_Abbad_64kbps",
      "salamah": "Yaser_Salamah_128kbps",
      "mostafa": "Mostafa_Ismail_128kbps",
      "jaber": "Ali_Jaber_64kbps",
      "ayman": "Ayman_Sowaid_64kbps",
      "husary.q": "Husary_40kbps",
      "minshawy.q": "Minshawy_Murattal_48kbps",
      "absulbasit.q": "Abdul_Basit_Murattal_40kbps",
      "huzaify.q": "Hudhaify_32kbps",
      "banna": "Banna_32kbps",
      "basfar.q": "Abdullah_Basfar_32kbps",
      "akhdar.q": "Ibrahim_Akhdar_32kbps",
      "ayyob.q": "Muhammad_Ayyoub_32kbps",
      "en": "English_Walk",
      "fr": "fr.leclerc_128kbs",
      "ur": "ur.khan_46kbs",
      "bs": "Bosnian_Korkut_128kbps"
    }

    this.reciterNames = {
      "husary": "Sheikh Mahmoud Khalil Al-Husary",
      "husary.m": "Sheikh Mahmoud Khalil Al-Husary (Mujawwad)",
      "husary.t": "Sheikh Mahmoud Khalil Al-Husary (Teacher)",
      "husary.tq": "Sheikh Mahmoud Khalil Al-Husary (Teacher - Low Quality)",
      "husary.w": "Sheikh Mahmoud Khalil Al-Husary (Warsh)",
      "husary.e": "Sheikh Mahmoud Khalil Al-Husary (Qasr)",
      "huzaify": "Sheikh Ali Hudhaify",
      "sudais": "Sheikh Abdurrahman As-Sudais",
      "shuraym": "Sheikh Saood Ash-Shuraym",
      "maher": "Sheikh Maher Al-Muaiqly",
      "ghamidi": "Sheikh Saad Al-Ghamidi",
      "qatami": "Sheikh Nasser Al-Qatami",
      "jibreel": "Sheikh Muhammad Jibreel",
      "shatree": "Sheikh Abu Bakr Ash-Shaatree",
      "ajamy": "Sheikh Ahmed Ibn Ali Al-Ajamy",
      "afasy": "Sheikh Mishary Rashid Al-Afasy",
      "basfar": "Sheikh Abdullah Basfar",
      "absulbasit": "Sheikh Abdul Basit Abdus Samad (Murattal)",
      "absulbasit.m": "Sheikh Abdul Basit Abdus Samad (Mujawwad)",
      "minshawy": "Sheikh Mohamed Siddiq El-Minshawi (Murattal)",
      "minshawy.m": "Sheikh Mohamed Siddiq El-Minshawi (Mujawwad)",
      "minshawy.t": "Sheikh Mohamed Siddiq El-Minshawi (Teacher)",
      "ayyoub": "Sheikh Muhammad Ayyoub",
      "rifai": "Sheikh Hani Rifai",
      "awwad": "Sheikh Abdullah Awwad Al-Juhaynee",
      "qasim": "Sheikh Muhsin Al-Qasim",
      "tablawy": "Sheikh Mohammad Al-Tablaway",
      "tunaiji": "Sheikh Tunaiji",
      "khaleefa": "Sheikh Khaleefa",
      "yaser": "Sheikh Yasser Ad-Dussary",
      "abdulkareem": "Sheikh Muhammad Abdul Kareem",
      "dosary": "Sheikh Warsh Dossary",
      "dosary.q": "Sheikh Warsh Dossary (Low Quality)",
      "yasin": "Sheikh Warsh Yassin",
      "fares": "Sheikh Fares Abbad",
      "salamah": "Sheikh Yaser Salamah",
      "mostafa": "Sheikh Mostafa Ismail",
      "jaber": "Sheikh Ali Jaber",
      "ayman": "Sheikh Ayman Sowaid",
      "husary.q": "Sheikh Mahmoud Khalil Al-Husary (Low Quality)",
      "minshawy.q": "Sheikh Mohamed Siddiq El-Minshawi (Low Quality)",
      "absulbasit.q": "Sheikh Abdul Basit Abdus Samad (Low Quality)",
      "huzaify.q": "Sheikh Ali Hudhaify (Low Quality)",
      "banna": "Sheikh Ahmad Banna",
      "basfar.q": "Sheikh Abdullah Basfar (Low Quality)",
      "akhdar.q": "Sheikh Ibrahim Akhdar (Low Quality)",
      "ayyob.q": "Sheikh Muhammad Ayyoub (Low Quality)",
      "en": "English Translation",
      "fr": "French Translation",
      "ur": "Urdu Translation",
      "bs": "Bosnian Translation"
    }
  }

  /**
   * Get available reciters
   */
  getAvailableReciters() {
    return Object.keys(this.quraaMap).map(key => ({
      key,
      name: this.reciterNames[key] || key,
      folderName: this.quraaMap[key]
    }))
  }

  /**
   * Set current reciter
   */
  setReciter(reciterKey) {
    if (this.quraaMap[reciterKey]) {
      this.currentReciter = reciterKey
      return true
    }
    return false
  }

  /**
   * Get current reciter info
   */
  getCurrentReciter() {
    return {
      key: this.currentReciter,
      name: this.reciterNames[this.currentReciter] || this.currentReciter,
      folderName: this.quraaMap[this.currentReciter]
    }
  }

  /**
   * Format verse number for URL (SSSAAA format)
   */
  formatVerseNumber(surahNumber, ayahNumber) {
    const surah = String(surahNumber).padStart(3, '0')
    const ayah = String(ayahNumber).padStart(3, '0')
    return `${surah}${ayah}`
  }

  /**
   * Get audio URL for a specific verse
   */
  getAudioUrl(surahNumber, ayahNumber, reciterKey = null) {
    const reciter = reciterKey || this.currentReciter
    const folderName = this.quraaMap[reciter]
    const verseNumber = this.formatVerseNumber(surahNumber, ayahNumber)
    return `${this.baseUrl}/${folderName}/${verseNumber}.mp3`
  }

  /**
   * Create audio element with event listeners
   */
  createAudioElement(url, metadata = {}) {
    const audio = new Audio(url)
    audio.volume = this.volume
    audio.preload = 'metadata'
    
    // Add metadata
    audio.metadata = metadata

    // Add event listeners
    audio.addEventListener('loadstart', () => this.emit('loadstart', metadata))
    audio.addEventListener('loadeddata', () => this.emit('loadeddata', metadata))
    audio.addEventListener('loadedmetadata', () => this.emit('loadedmetadata', metadata))
    audio.addEventListener('canplay', () => this.emit('canplay', metadata))
    audio.addEventListener('canplaythrough', () => this.emit('canplaythrough', metadata))
    audio.addEventListener('play', () => {
      this.isPlaying = true
      this.isPaused = false
      this.emit('play', metadata)
    })
    audio.addEventListener('pause', () => {
      this.isPlaying = false
      this.isPaused = true
      this.emit('pause', metadata)
    })
    audio.addEventListener('ended', () => {
      this.isPlaying = false
      this.isPaused = false
      this.emit('ended', metadata)
      this.playNext()
    })
    audio.addEventListener('error', (e) => {
      this.emit('error', { ...metadata, error: e })
    })
    audio.addEventListener('timeupdate', () => {
      this.emit('timeupdate', {
        ...metadata,
        currentTime: audio.currentTime,
        duration: audio.duration,
        progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0
      })
    })

    return audio
  }

  /**
   * Play a single verse
   */
  async playVerse(surahNumber, ayahNumber, reciterKey = null) {
    try {
      this.stop() // Stop any current playback

      const url = this.getAudioUrl(surahNumber, ayahNumber, reciterKey)
      const metadata = {
        type: 'verse',
        surahNumber,
        ayahNumber,
        reciter: reciterKey || this.currentReciter,
        url
      }

      this.currentAudio = this.createAudioElement(url, metadata)
      this.currentPlaylist = [metadata]
      this.currentIndex = 0

      await this.currentAudio.play()
      
      return {
        success: true,
        message: `Playing Surah ${surahNumber}, Ayah ${ayahNumber}`,
        metadata
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to play verse: ${error.message}`
      }
    }
  }

  /**
   * Play entire Surah sequentially
   */
  async playSurah(surahNumber, reciterKey = null, startAyah = 1) {
    try {
      // Get surah info to know how many verses
      const surahInfo = await this.getSurahInfo(surahNumber)
      if (!surahInfo) {
        throw new Error(`Surah ${surahNumber} not found`)
      }

      this.stop() // Stop any current playback

      // Create playlist for entire surah
      this.currentPlaylist = []
      for (let ayah = startAyah; ayah <= surahInfo.verses; ayah++) {
        const url = this.getAudioUrl(surahNumber, ayah, reciterKey)
        this.currentPlaylist.push({
          type: 'surah',
          surahNumber,
          ayahNumber: ayah,
          reciter: reciterKey || this.currentReciter,
          url,
          surahName: surahInfo.name,
          totalVerses: surahInfo.verses
        })
      }

      this.currentIndex = 0
      await this.playCurrentTrack()

      return {
        success: true,
        message: `Playing Surah ${surahNumber} (${surahInfo.name}) - ${this.currentPlaylist.length} verses`,
        playlist: this.currentPlaylist
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to play surah: ${error.message}`
      }
    }
  }

  /**
   * Play current track in playlist
   */
  async playCurrentTrack() {
    if (this.currentPlaylist.length === 0 || this.currentIndex >= this.currentPlaylist.length) {
      return
    }

    const track = this.currentPlaylist[this.currentIndex]
    this.currentAudio = this.createAudioElement(track.url, track)
    await this.currentAudio.play()
  }

  /**
   * Play next track in playlist
   */
  async playNext() {
    if (this.currentIndex < this.currentPlaylist.length - 1) {
      this.currentIndex++
      await this.playCurrentTrack()
      return true
    } else {
      // Playlist ended
      this.emit('playlistEnded', { playlist: this.currentPlaylist })
      return false
    }
  }

  /**
   * Play previous track in playlist
   */
  async playPrevious() {
    if (this.currentIndex > 0) {
      this.currentIndex--
      await this.playCurrentTrack()
      return true
    }
    return false
  }

  /**
   * Jump to specific verse in current surah playlist
   */
  async jumpToVerse(ayahNumber) {
    if (this.currentPlaylist.length === 0) {
      return false
    }

    const index = this.currentPlaylist.findIndex(track => track.ayahNumber === ayahNumber)
    if (index !== -1) {
      this.currentIndex = index
      await this.playCurrentTrack()
      return true
    }
    return false
  }

  /**
   * Pause current playback
   */
  pause() {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause()
      return true
    }
    return false
  }

  /**
   * Resume paused playback
   */
  async resume() {
    if (this.currentAudio && this.isPaused) {
      await this.currentAudio.play()
      return true
    }
    return false
  }

  /**
   * Stop playback
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
      this.currentAudio = null
    }
    this.isPlaying = false
    this.isPaused = false
    this.emit('stop')
  }

  /**
   * Set volume (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume))
    if (this.currentAudio) {
      this.currentAudio.volume = this.volume
    }
  }

  /**
   * Get current playback status
   */
  getStatus() {
    const track = this.currentPlaylist[this.currentIndex]
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentTrack: track || null,
      currentIndex: this.currentIndex,
      playlistLength: this.currentPlaylist.length,
      volume: this.volume,
      reciter: this.getCurrentReciter(),
      currentTime: this.currentAudio?.currentTime || 0,
      duration: this.currentAudio?.duration || 0,
      progress: this.currentAudio?.duration ? (this.currentAudio.currentTime / this.currentAudio.duration) * 100 : 0
    }
  }

  /**
   * Get surah info (this should integrate with your surahService)
   */
  async getSurahInfo(surahNumber) {
    // This is a basic implementation - you might want to integrate with your surahService
    const surahData = {
      1: { name: "Al-Fatihah", verses: 7 },
      2: { name: "Al-Baqarah", verses: 286 },
      3: { name: "Ali 'Imran", verses: 200 },
      4: { name: "An-Nisa", verses: 176 },
      5: { name: "Al-Ma'idah", verses: 120 },
      // Add more or integrate with your existing service
    }

    // Fallback to get total verses for all surahs
    const totalVerses = [
      7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111, 110, 98, 135,
      112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45, 83, 182, 88, 75, 85, 54, 53,
      89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12,
      12, 30, 52, 52, 44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26,
      30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6
    ]

    if (surahNumber >= 1 && surahNumber <= 114) {
      return {
        number: surahNumber,
        name: surahData[surahNumber]?.name || `Surah ${surahNumber}`,
        verses: totalVerses[surahNumber - 1]
      }
    }

    return null
  }

  /**
   * Event system
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data = null) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Clear all event listeners
   */
  clearEventListeners() {
    this.eventListeners.clear()
  }
}

export default new QuranAudioService()