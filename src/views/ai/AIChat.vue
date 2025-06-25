<template>
  <div class="ai-chat" :class="{ 'expanded': isExpanded }">
    <div class="chat-header" @click="toggleExpand">
      <div class="header-content">
        <div class="ai-avatar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 1-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 1 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 1 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 1-3.09 3.09z" fill="currentColor"/>
          </svg>
        </div>
        <h3>AI Assistant</h3>
      </div>
      <button class="expand-btn">{{ isExpanded ? '−' : '+' }}</button>
    </div>
    
    <div v-if="!apiKeySet" class="api-key-prompt">
      <div class="api-key-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h4>Setup Required</h4>
      <p>Enter your OpenAI API key to enable AI features:</p>
      <div class="api-key-input-group">
        <input 
          v-model="apiKey" 
          type="password" 
          placeholder="sk-..."
          class="api-key-input"
          @keyup.enter="setApiKey"
        >
        <button @click="setApiKey" class="api-key-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-else class="chat-content">
      <div v-if="currentContext" class="context-display">
        <div class="context-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
          </svg>
          {{ currentContext.surahName }} 
          <span v-if="currentContext.verse">• Verse {{ currentContext.verse }}</span>
        </div>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>

      <div class="quick-actions">
        <button @click="askForExplanation" class="quick-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M8 12h.01M12 12h.01M16 12h.01" stroke="currentColor" stroke-width="2"/>
          </svg>
          Explain
        </button>
        <button @click="askForContext" class="quick-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4l3 3" stroke="currentColor" stroke-width="2"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          </svg>
          Context
        </button>
        <button @click="askForApplication" class="quick-btn">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Apply
        </button>
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
  bottom: 1.5rem;
  left: 1.5rem;
  width: 400px;
  background: linear-gradient(145deg, 
    rgba(15, 23, 42, 0.98) 0%, 
    rgba(30, 41, 59, 0.95) 100%);
  border-radius: 24px;
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(99, 102, 241, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  backdrop-filter: blur(20px);
  z-index: 150;
  display: flex;
  flex-direction: column;
}

.ai-chat.expanded {
  height: 600px;
  max-height: 600px;
}

.ai-chat:not(.expanded) {
  height: 72px;
}

.chat-header {
  background: linear-gradient(135deg, 
    rgba(99, 102, 241, 0.9) 0%, 
    rgba(139, 92, 246, 0.8) 100%);
  color: white;
  padding: 1rem 1.25rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 24px 24px 0 0;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.chat-header::before {
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

.header-content {
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

.ai-avatar::before {
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

.ai-avatar svg {
  position: relative;
  z-index: 1;
  color: white;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.chat-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  font-family: inherit;
}

.expand-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
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
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.expand-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: scale(1.05);
}

.api-key-prompt {
  padding: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}

.api-key-icon {
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

.api-key-prompt h4 {
  color: #e2e8f0;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.api-key-prompt p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.5;
}

.api-key-input-group {
  display: flex;
  gap: 8px;
  width: 100%;
}

.api-key-input {
  flex: 1;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.api-key-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.api-key-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.api-key-btn {
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

.api-key-btn:hover {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.chat-content {
  display: flex;
  flex-direction: column;
  height: calc(100% - 72px);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}

.context-display {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border-bottom: 1px solid rgba(99, 102, 241, 0.15);
}

.context-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  background: rgba(99, 102, 241, 0.1);
  color: #e2e8f0;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid rgba(99, 102, 241, 0.2);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.message.user {
  align-items: flex-end;
}

.message.assistant {
  align-items: flex-start;
}

.message.system {
  align-items: center;
}

.message.error {
  align-items: center;
}

.message.user .message-content {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  padding: 0.875rem 1rem;
  border-radius: 16px 16px 4px 16px;
  max-width: 85%;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.assistant .message-content {
  background: rgba(255, 255, 255, 0.1);
  color: #e2e8f0;
  padding: 0.875rem 1rem;
  border-radius: 16px 16px 16px 4px;
  max-width: 85%;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.875rem;
  line-height: 1.5;
  word-wrap: break-word;
}

.message.system .message-content {
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-style: italic;
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 0.5rem;
  backdrop-filter: blur(10px);
}

.message.error .message-content {
  background: rgba(239, 68, 68, 0.1);
  color: #fca5a5;
  padding: 0.875rem 1rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(239, 68, 68, 0.2);
  backdrop-filter: blur(10px);
}

.message-time {
  font-size: 0.625rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0.5rem;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px 16px 16px 4px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: rgba(255, 255, 255, 0.6);
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
  gap: 0.75rem;
  align-items: flex-end;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  outline: none;
  resize: none;
  min-height: 44px;
  max-height: 100px;
  transition: all 0.3s ease;
  font-family: inherit;
  backdrop-filter: blur(10px);
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.message-input:focus {
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.send-btn {
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

.send-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
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
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-size: 0.75rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  backdrop-filter: blur(10px);
}

.quick-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
}
</style>