class OpenAIService {
  constructor() {
    this.apiKey = null
    this.initialized = false
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required')
    }
    
    this.apiKey = apiKey
    this.initialized = true
  }

  async askAboutSurah(surahText, question, context = {}) {
    if (!this.initialized) {
      throw new Error('OpenAI service not initialized. Please provide API key.')
    }

    try {
      const systemPrompt = `You are an Islamic scholar and Quranic expert. You provide thoughtful, respectful, and accurate insights about the Quran. 
      You help users understand verses, their context, and their meanings. Always be respectful of the sacred nature of the text.
      Provide clear, educational responses that help deepen understanding of Islamic teachings.`

      const userPrompt = context.verse 
        ? `Regarding Surah ${context.surahName}, Verse ${context.verse}:\n"${surahText}"\n\nQuestion: ${question}`
        : `Regarding Surah ${context.surahName}:\n"${surahText}"\n\nQuestion: ${question}`

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to get AI response: ' + error.message)
    }
  }

  async explainVerse(verseText, context = {}) {
    return this.askAboutSurah(
      verseText,
      "Please explain this verse, its meaning, and any important context or lessons it contains.",
      context
    )
  }

  async findRelatedVerses(topic, limit = 5) {
    if (!this.initialized) {
      throw new Error('OpenAI service not initialized. Please provide API key.')
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a Quranic expert. When asked about a topic, provide relevant Quranic verses with their Surah names and verse numbers."
            },
            {
              role: "user",
              content: `Find ${limit} Quranic verses related to the topic: "${topic}". Format each as: Surah Name (Chapter:Verse) - Brief description`
            }
          ],
          temperature: 0.5,
          max_tokens: 500
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content
    } catch (error) {
      console.error('OpenAI API Error:', error)
      throw new Error('Failed to find related verses: ' + error.message)
    }
  }

  async generateReflection(verseText, context = {}) {
    return this.askAboutSurah(
      verseText,
      "Generate a thoughtful reflection on this verse that can help readers contemplate its meaning and apply it to their daily lives.",
      context
    )
  }

  isInitialized() {
    return this.initialized
  }
}

export default new OpenAIService()