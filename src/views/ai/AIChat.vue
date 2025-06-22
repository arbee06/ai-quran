<template>
  <div class="ai-chat" :class="{ 'expanded': isExpanded }">
    <div class="chat-header" @click="toggleExpand">
      <h3>AI Assistant</h3>
      <button class="expand-btn">{{ isExpanded ? '−' : '+' }}</button>
    </div>
    
    <div v-if="!apiKeySet" class="api-key-prompt">
      <p>Please enter your OpenAI API key to use AI features:</p>
      <input 
        v-model="apiKey" 
        type="password" 
        placeholder="sk-..."
        class="api-key-input"
        @keyup.enter="setApiKey"
      >
      <button @click="setApiKey" class="btn btn-primary">Set API Key</button>
    </div>

    <div v-else class="chat-content">
      <div v-if="currentContext" class="context-display">
        <small>Context: {{ currentContext.surahName }} 
          <span v-if="currentContext.verse">Verse {{ currentContext.verse }}</span>
        </small>
      </div>

      <div class="messages-container" ref="messagesContainer">
        <div 
          v-for="(message, index) in messages" 
          :key="index"
          class="message"
          :class="message.type"
        >
          <div class="message-content">{{ message.content }}</div>
          <div class="message-time">{{ formatTime(message.timestamp) }}</div>
        </div>
        <div v-if="isLoading" class="message assistant loading">
          <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <textarea 
          v-model="userInput" 
          @keyup.enter.ctrl="sendMessage"
          placeholder="Ask about this verse or any Islamic topic..."
          class="message-input"
          :disabled="isLoading"
        ></textarea>
        <button 
          @click="sendMessage" 
          class="send-btn"
          :disabled="!userInput.trim() || isLoading"
        >
          Send
        </button>
      </div>

      <div class="quick-actions">
        <button @click="askForExplanation" class="quick-btn">Explain Verse</button>
        <button @click="askForContext" class="quick-btn">Historical Context</button>
        <button @click="askForApplication" class="quick-btn">Modern Application</button>
      </div>
    </div>
  </div>
</template>

<script>
import openaiService from '../../services/openaiService'

export default {
  name: 'AIChat',
  props: {
    initialContext: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      isExpanded: false,
      apiKey: '',
      apiKeySet: false,
      messages: [],
      userInput: '',
      isLoading: false,
      currentContext: null
    }
  },
  mounted() {
    const savedApiKey = localStorage.getItem('openai_api_key')
    if (savedApiKey) {
      this.apiKey = savedApiKey
      this.setApiKey()
    }
    
    if (this.initialContext) {
      this.setContext(this.initialContext)
    }
  },
  methods: {
    toggleExpand() {
      this.isExpanded = !this.isExpanded
    },
    setApiKey() {
      if (this.apiKey.trim()) {
        try {
          openaiService.initialize(this.apiKey)
          this.apiKeySet = true
          localStorage.setItem('openai_api_key', this.apiKey)
          this.addMessage('system', 'AI Assistant ready! Ask me anything about the Quran.')
        } catch (error) {
          alert('Invalid API key. Please check and try again.')
        }
      }
    },
    setContext(context) {
      this.currentContext = context
      this.isExpanded = true
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.isLoading) return
      
      const userMessage = this.userInput.trim()
      this.addMessage('user', userMessage)
      this.userInput = ''
      this.isLoading = true
      
      try {
        let response
        if (this.currentContext && this.currentContext.verseText) {
          response = await openaiService.askAboutSurah(
            this.currentContext.verseText,
            userMessage,
            {
              surahName: this.currentContext.surahName,
              verse: this.currentContext.verseNumber
            }
          )
        } else {
          response = await openaiService.askAboutSurah(
            '',
            userMessage,
            { surahName: 'General Question' }
          )
        }
        
        this.addMessage('assistant', response)
      } catch (error) {
        this.addMessage('error', 'Sorry, I encountered an error. Please try again.')
        console.error('AI Error:', error)
      } finally {
        this.isLoading = false
      }
    },
    async askForExplanation() {
      if (!this.currentContext || !this.currentContext.verseText) {
        this.addMessage('error', 'Please select a verse first.')
        return
      }
      
      this.userInput = 'Please explain this verse in detail.'
      await this.sendMessage()
    },
    async askForContext() {
      if (!this.currentContext || !this.currentContext.verseText) {
        this.addMessage('error', 'Please select a verse first.')
        return
      }
      
      this.userInput = 'What is the historical context and reason for revelation of this verse?'
      await this.sendMessage()
    },
    async askForApplication() {
      if (!this.currentContext || !this.currentContext.verseText) {
        this.addMessage('error', 'Please select a verse first.')
        return
      }
      
      this.userInput = 'How can we apply the teachings of this verse in modern daily life?'
      await this.sendMessage()
    },
    addMessage(type, content) {
      this.messages.push({
        type,
        content,
        timestamp: new Date()
      })
      
      this.$nextTick(() => {
        this.scrollToBottom()
      })
    },
    scrollToBottom() {
      const container = this.$refs.messagesContainer
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    },
    formatTime(date) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  },
  watch: {
    initialContext(newContext) {
      if (newContext) {
        this.setContext(newContext)
      }
    }
  }
}
</script>

<style scoped>
.ai-chat {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  overflow: hidden;
}

.ai-chat.expanded {
  height: 600px;
}

.chat-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header h3 {
  margin: 0;
  font-size: 1.1rem;
}

.expand-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
}

.api-key-prompt {
  padding: 1.5rem;
}

.api-key-input {
  width: 100%;
  padding: 0.75rem;
  margin: 0.5rem 0;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 60px);
}

.context-display {
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #718096;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.message {
  margin-bottom: 1rem;
}

.message.user .message-content {
  background: #667eea;
  color: white;
  padding: 0.75rem;
  border-radius: 12px 12px 4px 12px;
  margin-left: auto;
  max-width: 80%;
}

.message.assistant .message-content {
  background: #f7fafc;
  color: #2d3748;
  padding: 0.75rem;
  border-radius: 12px 12px 12px 4px;
  max-width: 80%;
}

.message.system .message-content {
  text-align: center;
  color: #718096;
  font-style: italic;
  font-size: 0.875rem;
}

.message.error .message-content {
  background: #fed7d7;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 8px;
}

.message-time {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.25rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #718096;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

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

.chat-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
}

.message-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  resize: none;
  min-height: 50px;
  max-height: 100px;
}

.send-btn {
  padding: 0.5rem 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem 1rem;
}

.quick-btn {
  flex: 1;
  padding: 0.5rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: #e2e8f0;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  margin-top: 0.5rem;
}

.dark-theme .ai-chat {
  background: #2d3748;
}

.dark-theme .message.assistant .message-content {
  background: #4a5568;
  color: #e2e8f0;
}

.dark-theme .context-display {
  background: #4a5568;
  color: #a0aec0;
}

.dark-theme .message-input {
  background: #4a5568;
  border-color: #718096;
  color: #e2e8f0;
}

.dark-theme .quick-btn {
  background: #4a5568;
  border-color: #718096;
  color: #e2e8f0;
}
</style>