# File: ai-quran/src/views/ai/VoiceAssistant.vue

<template>
  <div class="voice-assistant-container" :class="{ 'fullscreen-mode': isFullscreen, 'compact-mode': !isFullscreen }">
    <!-- Main AI interface with voice visualization -->
    <div class="ai-interface" :class="{ 'ai-speaking': isAssistantResponding, 'ai-listening': isUserSpeaking }">
      <div class="ai-core">
        <!-- Voice visualization/animation -->
        <div class="ai-voice-visualization" v-if="isConnected">
          <div class="visualization-circle" :class="{ 'pulsing': isAssistantResponding }">
            <div class="voice-bars" v-if="isAssistantResponding">
              <div class="bar bar1"></div>
              <div class="bar bar2"></div>
              <div class="bar bar3"></div>
              <div class="bar bar4"></div>
              <div class="bar bar5"></div>
              <div class="bar bar6"></div>
            </div>
            <div class="ai-icon" v-else>
              <div class="icon-bg">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" class="ai-icon-svg">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <!-- AI Response display -->
        <div class="ai-response" v-if="currentAIResponse || isAssistantResponding">
          <div class="typing-indicator" v-if="isAssistantResponding && !currentAIResponse">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="response-text holographic-text">
            <span class="typed-text">{{ typedText }}</span>
            <span class="cursor" :class="{'typing': isTyping}">|</span>
          </div>
        </div>
        
        <!-- User query display -->
        <div class="user-query" v-if="userTranscript && isUserSpeaking">
          <div class="query-text">{{ userTranscript }}</div>
        </div>
        
        <!-- Status indicator -->
        <div class="ai-status">
          <div class="status-dot" :class="{ 
            'connected': isConnected, 
            'connecting': isConnecting,
            'speaking': isAssistantResponding,
            'listening': isUserSpeaking && !isAssistantResponding
          }"></div>
          <div class="status-text">{{ aiStatusText }}</div>
        </div>
      </div>
    </div>
    
    <!-- Control panel -->
    <div class="control-panel">
      <div v-if="showApiKeyInput" class="api-key-container">
        <input 
          type="password" 
          v-model="apiKey" 
          class="api-key-input" 
          placeholder="Enter your OpenAI API key"
          @keyup.enter="saveApiKey"
        />
        <button @click="saveApiKey" class="control-button save-key-button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      
      <div class="control-buttons">
        <!-- Call button -->
        <button 
          class="control-button call-button" 
          :class="{ 'active': isConnected, 'connecting': isConnecting }"
          @click="toggleCall"
          :disabled="isConnecting"
          :title="isConnected ? 'Disconnect' : 'Connect'"
        >
          <span v-if="!isConnected && !isConnecting">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
          </span>
          <span v-else-if="isConnecting" class="spinner">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.3"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </span>
          <span v-else>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#ef4444" stroke-width="2" fill="none"/>
            </svg>
          </span>
        </button>
        
        <!-- Mic button -->
        <button 
          class="control-button mic-button" 
          :class="{ 'mic-disabled': !micEnabled }"
          @click="toggleMic"
          v-if="isConnected"
          :title="micEnabled ? 'Mute microphone' : 'Unmute microphone'"
        >
          <svg v-if="micEnabled" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" stroke-width="2"/>
            <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <!-- Fullscreen button -->
        <button 
          class="control-button fullscreen-button" 
          @click="toggleFullscreen"
          :class="{ 'active': isFullscreen }"
          :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        >
          <svg v-if="!isFullscreen" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <!-- Clear button -->
        <button 
          class="control-button clear-button" 
          @click="clearConversation"
          v-if="isConnected && conversationHistory.length > 0"
          title="Clear conversation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import realtimeApiService from '../../services/realtimeApiService';
import surahService from '../../services/surahService';
import openaiService from '../../services/openaiService';
import quranAudioService from '../../services/quranAudioService';

export default {
  name: 'VoiceAssistant',
  props: {
    currentSurahId: {
      type: [String, Number],
      default: null
    }
  },
  data() {
    return {
      isConnected: false,
      isConnecting: false,
      connectionState: 'disconnected',
      userTranscript: '',
      assistantResponse: '',
      currentAIResponse: '',
      typedText: '',
      isTyping: false,
      typingInterval: null,
      typingSpeed: 30,
      processingFunctionCall: false,
      currentFunctionCall: null,
      apiKey: '',
      showApiKeyInput: false,
      conversationHistory: [],
      isUserSpeaking: false,
      isAssistantResponding: false,
      micEnabled: true,
      audioTrack: null,
      isFullscreen: false,
      // Audio playback status
      audioStatus: {
        isPlaying: false,
        isPaused: false,
        currentTrack: null,
        currentReciter: null,
        volume: 80,
        progress: 0,
        currentTime: 0,
        duration: 0
      }
    };
  },
  computed: {
    aiStatusText() {
      if (this.isConnecting) return 'Connecting...';
      if (!this.isConnected) return 'Offline';
      if (this.isAssistantResponding) return 'Speaking';
      if (this.isUserSpeaking) return 'Listening';
      if (!this.micEnabled) return 'Muted';
      return 'Ready to help';
    }
  },
  watch: {
    currentAIResponse: {
      immediate: true,
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal) {
          this.startTypingEffect(newVal);
        }
      }
    }
  },
  mounted() {
    // Check for saved API key
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      this.apiKey = savedApiKey;
    } else {
      this.showApiKeyInput = true;
    }
    
    // Listen for fullscreen change events
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);

    // Set up audio service event listeners
    this.setupAudioEventListeners();
  },
  beforeDestroy() {
    console.log('Voice assistant being destroyed...');
    
    // Clean up event listeners
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
    
    // Exit fullscreen if active
    if (this.isFullscreen) {
      this.exitFullscreen();
    }

    // Clear typing interval
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    
    // Force disconnect
    if (this.isConnected || this.isConnecting) {
      this.endCall();
    }

    // Clean up audio service event listeners
    quranAudioService.clearEventListeners();
  },
  methods: {
    /**
     * Start typing effect for AI response
     */
    startTypingEffect(text) {
      if (this.typingInterval) {
        clearInterval(this.typingInterval);
      }
      
      this.typedText = '';
      this.isTyping = true;
      
      let charIndex = 0;
      this.typingInterval = setInterval(() => {
        if (charIndex < text.length) {
          this.typedText += text.charAt(charIndex);
          charIndex++;
        } else {
          this.isTyping = false;
          clearInterval(this.typingInterval);
          this.typingInterval = null;
        }
      }, this.typingSpeed);
    },
    
    /**
     * Toggle fullscreen mode
     */
    toggleFullscreen() {
      if (this.isFullscreen) {
        this.exitFullscreen();
      } else {
        this.enterFullscreen();
      }
    },
    
    /**
     * Enter fullscreen mode
     */
    enterFullscreen() {
      const element = this.$el;
      
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      }
    },
    
    /**
     * Exit fullscreen mode
     */
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
    },
    
    /**
     * Handle fullscreen change events
     */
    handleFullscreenChange() {
      this.isFullscreen = !!(document.fullscreenElement || 
                           document.webkitFullscreenElement || 
                           document.mozFullScreenElement || 
                           document.msFullscreenElement);
    },
    
    /**
     * Toggle microphone
     */
    toggleMic() {
      if (this.audioTrack) {
        this.micEnabled = !this.micEnabled;
        this.audioTrack.enabled = this.micEnabled;
      }
    },
    
    /**
     * Toggle call state
     */
    toggleCall() {
      if (this.isConnected) {
        this.endCall();
      } else {
        if (!this.apiKey) {
          this.showApiKeyInput = true;
          return;
        }
        this.startCall();
      }
    },
    
    /**
     * Save API key
     */
    saveApiKey() {
      if (this.apiKey.trim()) {
        localStorage.setItem('openai_api_key', this.apiKey.trim());
        realtimeApiService.setApiKey(this.apiKey.trim());
        this.showApiKeyInput = false;
        this.startCall();
      }
    },
    
    /**
     * Start voice call
     */
    async startCall() {
      this.isConnecting = true;
      
      try {
        if (this.apiKey) {
          realtimeApiService.setApiKey(this.apiKey);
        }
        
        await realtimeApiService.initialize(
          this.handleApiMessage,
          this.handleConnectionStateChange
        );
        
        this.audioTrack = realtimeApiService.getAudioTrack();
        this.micEnabled = true;
        
      } catch (error) {
        console.error('Failed to start call:', error);
        this.isConnecting = false;
        
        if (error.message && (
            error.message.includes('401') || 
            error.message.includes('authentication') || 
            error.message.includes('API key')
          )) {
          this.showApiKeyInput = true;
        }
        
        alert(`Failed to connect: ${error.message}`);
      }
    },
    
    /**
     * End voice call
     */
    endCall() {
      console.log('Ending voice call...');
      
      if (this.typingInterval) {
        clearInterval(this.typingInterval);
        this.typingInterval = null;
      }
      
      this.isUserSpeaking = false;
      this.isAssistantResponding = false;
      this.userTranscript = '';
      this.assistantResponse = '';
      this.currentAIResponse = '';
      this.typedText = '';
      this.isTyping = false;
      this.processingFunctionCall = false;
      this.currentFunctionCall = null;
      this.micEnabled = true;
      this.audioTrack = null;
      
      try {
        realtimeApiService.disconnect();
      } catch (error) {
        console.error('Error during disconnect:', error);
      }
      
      this.isConnected = false;
      this.isConnecting = false;
      this.connectionState = 'disconnected';
      this.showApiKeyInput = false;
    },
    
    /**
     * Clear conversation history
     */
    clearConversation() {
      this.conversationHistory = [];
      this.userTranscript = '';
      this.assistantResponse = '';
      this.currentAIResponse = '';
    },
    
    /**
     * Handle connection state changes
     */
    handleConnectionStateChange(state) {
      console.log('Connection state changed to:', state);
      this.connectionState = state;
      
      if (state === 'connected') {
        this.isConnected = true;
        this.isConnecting = false;
        
        // Configure session for Surah app
        realtimeApiService.updateSession({
          voice: "alloy",
          instructions: "You are an AI assistant for a Quran learning app. Help users understand Surahs, verses, and Islamic teachings. Be respectful, knowledgeable, and patient. You can navigate the app, search for verses, explain meanings, and provide spiritual guidance.",
          tools: realtimeApiService.getDefaultTools()
        });
      } else if (state === 'failed' || state === 'disconnected' || state === 'closed') {
        this.isConnected = false;
        this.isConnecting = false;
        this.isUserSpeaking = false;
        this.isAssistantResponding = false;
      }
    },
    
    /**
     * Handle messages from the API
     */
    async handleApiMessage(message) {
      console.log('Received message:', message);
      
      switch (message.type) {
        case 'session.created':
        case 'session.updated':
          console.log('Session ready:', message);
          break;
          
        case 'input_audio_buffer.speech_started':
          this.isUserSpeaking = true;
          this.userTranscript = 'Listening...';
          break;
          
        case 'input_audio_buffer.speech_stopped':
          this.isUserSpeaking = false;
          break;
          
        case 'conversation.item.input_audio_transcription.delta':
          if (message.delta) {
            this.userTranscript = message.delta;
          }
          break;
          
        case 'conversation.item.input_audio_transcription.completed':
          if (message.transcript) {
            this.userTranscript = message.transcript;
            
            if (this.userTranscript && this.userTranscript !== 'Listening...') {
              this.conversationHistory.push({
                speaker: 'You',
                text: this.userTranscript
              });
              this.userTranscript = '';
            }
          }
          break;
          
        case 'response.audio.delta':
          this.isAssistantResponding = true;
          break;
          
        case 'response.text.delta':
          this.isAssistantResponding = true;
          if (message.delta) {
            this.assistantResponse += message.delta;
          }
          break;
          
        case 'response.audio.done':
        case 'response.text.done':
          this.isAssistantResponding = false;
          
          if (this.assistantResponse && !this.processingFunctionCall) {
            this.currentAIResponse = this.assistantResponse;
            
            this.conversationHistory.push({
              speaker: 'Assistant',
              text: this.assistantResponse
            });
            this.assistantResponse = '';
          }
          break;
          
        case 'response.done':
          if (message.response && 
              message.response.output && 
              message.response.output.length > 0) {
                
            if (message.response.output[0].type === 'function_call') {
              await this.handleFunctionCall(message.response.output[0]);
            } 
            else if (message.response.output[0].type === 'message' && 
                    message.response.output[0].content && 
                    message.response.output[0].content.length > 0) {
              
              const content = message.response.output[0].content[0];
              if (content.type === 'audio' && content.transcript) {
                this.currentAIResponse = content.transcript;
                
                this.conversationHistory.push({
                  speaker: 'Assistant',
                  text: content.transcript
                });
              }
            }
          }
          break;
      }
    },
    
    /**
     * Handle function calls from the assistant
     */
    async handleFunctionCall(functionCall) {
      this.processingFunctionCall = true;
      this.currentFunctionCall = functionCall;
      
      this.currentAIResponse = `Processing: ${functionCall.name}...`;
      
      try {
        const { name, arguments: args, call_id } = functionCall;
        const parsedArgs = JSON.parse(args);
        
        let result;
        switch (name) {
          case 'get_surah_content':
            result = await this.executeGetSurahContentFunction(parsedArgs);
            break;
          case 'get_verse_details':
            result = await this.executeGetVerseDetailsFunction(parsedArgs);
            break;
          case 'get_tafsir':
            result = await this.executeGetTafsirFunction(parsedArgs);
            break;
          case 'get_word_analysis':
            result = await this.executeGetWordAnalysisFunction(parsedArgs);
            break;
          case 'get_reasons_for_revelation':
            result = await this.executeGetReasonsForRevelationFunction(parsedArgs);
            break;
          case 'get_tajweed_rules':
            result = await this.executeGetTajweedRulesFunction(parsedArgs);
            break;
          case 'get_page_content':
            result = await this.executeGetPageContentFunction(parsedArgs);
            break;
          case 'get_multiple_verses':
            result = await this.executeGetMultipleVersesFunction(parsedArgs);
            break;
          case 'navigate_to_surah':
            result = await this.executeNavigateToSurahFunction(parsedArgs);
            break;
          case 'navigate_to_verse':
            result = await this.executeNavigateToVerseFunction(parsedArgs);
            break;
          case 'navigate_to_page':
            result = await this.executeNavigateToPageFunction(parsedArgs);
            break;
          case 'get_available_projects':
            result = await this.executeGetAvailableProjectsFunction(parsedArgs);
            break;
          case 'bookmark_verse':
            result = await this.executeBookmarkVerseFunction(parsedArgs);
            break;
          case 'play_recitation':
            result = await this.executePlayRecitationFunction(parsedArgs);
            break;
          case 'toggle_theme':
            result = await this.executeToggleThemeFunction(parsedArgs);
            break;
          default:
            result = { error: 'Function not implemented' };
        }
        
        this.conversationHistory.push({
          speaker: 'System',
          text: `Function ${functionCall.name} executed`
        });
        
        realtimeApiService.submitFunctionCallOutput(call_id, result);
        
        this.processingFunctionCall = false;
        this.currentAIResponse = "Processing completed...";
        
        realtimeApiService.generateResponse();
      } catch (error) {
        console.error('Error handling function call:', error);
        this.processingFunctionCall = false;
        
        this.currentAIResponse = `Error: ${error.message}`;
        
        if (this.currentFunctionCall) {
          realtimeApiService.submitFunctionCallOutput(
            this.currentFunctionCall.call_id, 
            { error: 'Function execution failed' }
          );
          
          realtimeApiService.generateResponse();
        }
      }
    },
    
    /**
     * Execute get Surah content function using the Public Sura API
     */
    async executeGetSurahContentFunction(args) {
      try {
        const { surah_number, content_type = 'basic' } = args;
        
        // Validate Surah number
        if (surah_number < 1 || surah_number > 114) {
          return { error: 'Surah number must be between 1 and 114' };
        }
        
        let content;
        if (content_type === 'basic') {
          // Get basic Surah content from our existing service
          content = await surahService.getSurahContent(surah_number);
        } else {
          // Enhanced content not available without external API
          content = await surahService.getSurahContent(surah_number);
        }
        
        // Navigate to the Surah
        this.$emit('navigate-to-surah', surah_number);
        
        return {
          success: true,
          surah_number,
          content,
          content_type,
          message: `Retrieved Surah ${surah_number} content`
        };
      } catch (error) {
        return { error: `Failed to get Surah content: ${error.message}` };
      }
    },
    
    /**
     * Execute get verse function
     */
    async executeGetVerseFunction(args) {
      try {
        const { surah_id, verse_number, include_translation = true } = args;
        
        const surahContent = await surahService.getSurahContent(surah_id);
        if (!surahContent || !surahContent.verses) {
          return { error: `Surah ${surah_id} not found` };
        }
        
        const verse = surahContent.verses.find(v => v.number === verse_number);
        if (!verse) {
          return { error: `Verse ${verse_number} not found in Surah ${surah_id}` };
        }
        
        const result = {
          success: true,
          verse: {
            surah_id,
            surah_name: surahContent.name,
            verse_number,
            arabic_text: verse.text
          }
        };
        
        if (include_translation) {
          result.verse.translation = verse.translation;
        }
        
        return result;
      } catch (error) {
        return { error: `Failed to get verse: ${error.message}` };
      }
    },
    
    /**
     * Execute search verses function
     */
    async executeSearchVersesFunction(args) {
      try {
        const { query, limit = 5 } = args;
        
        const results = await surahService.searchVerses(query);
        const limitedResults = results.slice(0, limit);
        
        return {
          success: true,
          query,
          results: limitedResults.map(result => ({
            surah_id: result.surahId,
            surah_name: result.surah.name,
            verse_number: result.verseNumber,
            arabic_text: result.verse.text,
            translation: result.verse.translation
          })),
          total_found: results.length
        };
      } catch (error) {
        return { error: `Failed to search verses: ${error.message}` };
      }
    },
    
    /**
     * Execute explain verse function
     */
    async executeExplainVerseFunction(args) {
      try {
        const { surah_id, verse_number, aspect = 'general' } = args;
        
        // Get the verse first
        const verseResult = await this.executeGetVerseFunction({ 
          surah_id, 
          verse_number, 
          include_translation: true 
        });
        
        if (!verseResult.success) {
          return verseResult;
        }
        
        // Use OpenAI service to get explanation
        let question;
        switch (aspect) {
          case 'context':
            question = 'What is the historical context and circumstances of revelation for this verse?';
            break;
          case 'application':
            question = 'How can this verse be applied in modern daily life?';
            break;
          case 'linguistic':
            question = 'What are the linguistic and grammatical insights of this verse?';
            break;
          default:
            question = 'Please provide a comprehensive explanation of this verse.';
        }
        
        if (openaiService.isInitialized()) {
          const explanation = await openaiService.askAboutSurah(
            verseResult.verse.arabic_text,
            question,
            {
              surahName: verseResult.verse.surah_name,
              verse: verse_number
            }
          );
          
          return {
            success: true,
            verse: verseResult.verse,
            explanation,
            aspect
          };
        } else {
          return {
            success: true,
            verse: verseResult.verse,
            explanation: `This is verse ${verse_number} from ${verseResult.verse.surah_name}. AI explanation requires OpenAI API key to be configured.`,
            aspect
          };
        }
      } catch (error) {
        return { error: `Failed to explain verse: ${error.message}` };
      }
    },
    
    /**
     * Execute find related verses function
     */
    async executeFindRelatedVersesFunction(args) {
      try {
        const { topic, limit = 5 } = args;
        
        if (openaiService.isInitialized()) {
          const relatedVerses = await openaiService.findRelatedVerses(topic, limit);
          
          return {
            success: true,
            topic,
            related_verses: relatedVerses,
            source: 'AI-powered search'
          };
        } else {
          // Fallback to simple text search
          const results = await surahService.searchVerses(topic);
          const limitedResults = results.slice(0, limit);
          
          return {
            success: true,
            topic,
            related_verses: limitedResults.map(result => 
              `${result.surah.name} ${result.verseNumber} - ${result.verse.translation}`
            ).join('\n'),
            source: 'Text search'
          };
        }
      } catch (error) {
        return { error: `Failed to find related verses: ${error.message}` };
      }
    },
    
    /**
     * Execute navigate to Surah function
     */
    async executeNavigateToSurahFunction(args) {
      try {
        const { surah_number } = args;
        
        // Emit event to parent to navigate
        this.$emit('navigate-to-surah', surah_number);
        
        return {
          success: true,
          message: `Navigating to Surah ${surah_number}`,
          surah_number
        };
      } catch (error) {
        return { error: `Failed to navigate: ${error.message}` };
      }
    },
    
    /**
     * Execute play recitation function
     */
    async executePlayRecitationFunction(args) {
      try {
        const { surah_number, verse_number, reciter = 'sudais' } = args;
        
        let result;
        if (verse_number) {
          // Play specific verse
          result = await quranAudioService.playVerse(surah_number, verse_number, reciter);
        } else {
          // Play entire Surah
          result = await quranAudioService.playSurah(surah_number, reciter);
        }

        // Emit event to parent
        this.$emit('play-recitation', { surah_number, verse_number, reciter });
        
        return {
          success: result.success,
          message: result.success 
            ? (verse_number 
                ? `Playing recitation of Surah ${surah_number}, verse ${verse_number} by ${quranAudioService.getCurrentReciter().name}`
                : `Playing recitation of Surah ${surah_number} by ${quranAudioService.getCurrentReciter().name}`)
            : result.error,
          surah_number,
          verse_number,
          reciter: quranAudioService.getCurrentReciter()
        };
      } catch (error) {
        return { error: `Failed to play recitation: ${error.message}` };
      }
    },

    /**
     * Execute pause recitation function
     */
    async executePauseRecitationFunction(args) {
      try {
        const success = quranAudioService.pause();
        return {
          success,
          message: success ? 'Recitation paused' : 'No recitation is currently playing'
        };
      } catch (error) {
        return { error: `Failed to pause recitation: ${error.message}` };
      }
    },

    /**
     * Execute resume recitation function
     */
    async executeResumeRecitationFunction(args) {
      try {
        const success = await quranAudioService.resume();
        return {
          success,
          message: success ? 'Recitation resumed' : 'No recitation is paused'
        };
      } catch (error) {
        return { error: `Failed to resume recitation: ${error.message}` };
      }
    },

    /**
     * Execute stop recitation function
     */
    async executeStopRecitationFunction(args) {
      try {
        quranAudioService.stop();
        return {
          success: true,
          message: 'Recitation stopped'
        };
      } catch (error) {
        return { error: `Failed to stop recitation: ${error.message}` };
      }
    },

    /**
     * Execute next verse function
     */
    async executeNextVerseFunction(args) {
      try {
        const success = await quranAudioService.playNext();
        const status = quranAudioService.getStatus();
        
        return {
          success,
          message: success 
            ? `Playing next verse: Surah ${status.currentTrack?.surahNumber}, verse ${status.currentTrack?.ayahNumber}`
            : 'No next verse available or no playlist active',
          currentTrack: status.currentTrack
        };
      } catch (error) {
        return { error: `Failed to play next verse: ${error.message}` };
      }
    },

    /**
     * Execute previous verse function
     */
    async executePreviousVerseFunction(args) {
      try {
        const success = await quranAudioService.playPrevious();
        const status = quranAudioService.getStatus();
        
        return {
          success,
          message: success 
            ? `Playing previous verse: Surah ${status.currentTrack?.surahNumber}, verse ${status.currentTrack?.ayahNumber}`
            : 'No previous verse available or no playlist active',
          currentTrack: status.currentTrack
        };
      } catch (error) {
        return { error: `Failed to play previous verse: ${error.message}` };
      }
    },

    /**
     * Execute jump to verse function
     */
    async executeJumpToVerseFunction(args) {
      try {
        const { verse_number } = args;
        const success = await quranAudioService.jumpToVerse(verse_number);
        const status = quranAudioService.getStatus();
        
        return {
          success,
          message: success 
            ? `Jumped to verse ${verse_number}: Surah ${status.currentTrack?.surahNumber}, verse ${status.currentTrack?.ayahNumber}`
            : `Verse ${verse_number} not found in current playlist`,
          currentTrack: status.currentTrack
        };
      } catch (error) {
        return { error: `Failed to jump to verse: ${error.message}` };
      }
    },

    /**
     * Execute get recitation status function
     */
    async executeGetRecitationStatusFunction(args) {
      try {
        const status = quranAudioService.getStatus();
        
        return {
          success: true,
          status: {
            isPlaying: status.isPlaying,
            isPaused: status.isPaused,
            currentTrack: status.currentTrack,
            reciter: status.reciter,
            volume: status.volume,
            progress: Math.round(status.progress),
            currentTime: Math.round(status.currentTime),
            duration: Math.round(status.duration),
            playlistLength: status.playlistLength,
            currentIndex: status.currentIndex
          },
          message: status.isPlaying 
            ? `Currently playing: Surah ${status.currentTrack?.surahNumber}, verse ${status.currentTrack?.ayahNumber} by ${status.reciter?.name}`
            : (status.isPaused 
                ? `Paused: Surah ${status.currentTrack?.surahNumber}, verse ${status.currentTrack?.ayahNumber}`
                : 'No recitation is currently playing')
        };
      } catch (error) {
        return { error: `Failed to get recitation status: ${error.message}` };
      }
    },

    /**
     * Execute set reciter function
     */
    async executeSetReciterFunction(args) {
      try {
        const { reciter } = args;
        const success = quranAudioService.setReciter(reciter);
        const currentReciter = quranAudioService.getCurrentReciter();
        
        return {
          success,
          message: success 
            ? `Reciter changed to ${currentReciter.name}`
            : `Reciter '${reciter}' not found. Use get_available_reciters to see available options.`,
          reciter: currentReciter
        };
      } catch (error) {
        return { error: `Failed to set reciter: ${error.message}` };
      }
    },

    /**
     * Execute get available reciters function
     */
    async executeGetAvailableRecitersFunction(args) {
      try {
        const reciters = quranAudioService.getAvailableReciters();
        const currentReciter = quranAudioService.getCurrentReciter();
        
        return {
          success: true,
          reciters: reciters.slice(0, 20), // Limit to first 20 for readability
          totalCount: reciters.length,
          currentReciter,
          message: `Found ${reciters.length} available reciters. Current reciter: ${currentReciter.name}`,
          popularReciters: [
            { key: 'sudais', name: 'Sheikh Abdurrahman As-Sudais' },
            { key: 'afasy', name: 'Sheikh Mishary Rashid Al-Afasy' },
            { key: 'husary', name: 'Sheikh Mahmoud Khalil Al-Husary' },
            { key: 'minshawy', name: 'Sheikh Mohamed Siddiq El-Minshawi' },
            { key: 'maher', name: 'Sheikh Maher Al-Muaiqly' },
            { key: 'ajamy', name: 'Sheikh Ahmed Ibn Ali Al-Ajamy' }
          ]
        };
      } catch (error) {
        return { error: `Failed to get available reciters: ${error.message}` };
      }
    },

    /**
     * Execute set volume function
     */
    async executeSetVolumeFunction(args) {
      try {
        const { volume } = args;
        const normalizedVolume = volume / 100; // Convert 0-100 to 0-1
        quranAudioService.setVolume(normalizedVolume);
        
        return {
          success: true,
          volume: volume,
          message: `Volume set to ${volume}%`
        };
      } catch (error) {
        return { error: `Failed to set volume: ${error.message}` };
      }
    },

    /**
     * Set up audio service event listeners
     */
    setupAudioEventListeners() {
      // Update audio status on events
      quranAudioService.on('play', (metadata) => {
        this.audioStatus.isPlaying = true;
        this.audioStatus.isPaused = false;
        this.audioStatus.currentTrack = metadata;
      });

      quranAudioService.on('pause', (metadata) => {
        this.audioStatus.isPlaying = false;
        this.audioStatus.isPaused = true;
      });

      quranAudioService.on('stop', () => {
        this.audioStatus.isPlaying = false;
        this.audioStatus.isPaused = false;
        this.audioStatus.currentTrack = null;
        this.audioStatus.progress = 0;
        this.audioStatus.currentTime = 0;
        this.audioStatus.duration = 0;
      });

      quranAudioService.on('timeupdate', (data) => {
        this.audioStatus.progress = data.progress || 0;
        this.audioStatus.currentTime = data.currentTime || 0;
        this.audioStatus.duration = data.duration || 0;
      });

      quranAudioService.on('ended', (metadata) => {
        // Audio service handles auto-play next, so we just update status
        this.audioStatus.currentTrack = metadata;
      });

      quranAudioService.on('error', (data) => {
        console.error('Audio playback error:', data.error);
        // You could emit this to parent component for user notification
        this.$emit('audio-error', data);
      });

      quranAudioService.on('playlistEnded', (data) => {
        this.audioStatus.isPlaying = false;
        this.audioStatus.isPaused = false;
        this.audioStatus.currentTrack = null;
        // Emit to parent for notification
        this.$emit('playlist-ended', data);
      });
    },
    
    /**
     * Execute bookmark verse function
     */
    async executeBookmarkVerseFunction(args) {
      try {
        const { surah_id, verse_number, note } = args;
        
        // Emit event to parent to bookmark
        this.$emit('bookmark-verse', { surah_id, verse_number, note });
        
        return {
          success: true,
          message: `Bookmarked Surah ${surah_id}, verse ${verse_number}`,
          bookmark: { surah_id, verse_number, note }
        };
      } catch (error) {
        return { error: `Failed to bookmark verse: ${error.message}` };
      }
    },
    
    /**
     * Execute get daily verse function
     */
    async executeGetDailyVerseFunction(args) {
      try {
        // Get a random verse (or implement daily verse logic)
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
        const surahId = (dayOfYear % 114) + 1;
        
        const surahContent = await surahService.getSurahContent(surahId);
        if (surahContent && surahContent.verses && surahContent.verses.length > 0) {
          const randomVerse = surahContent.verses[Math.floor(Math.random() * surahContent.verses.length)];
          
          return {
            success: true,
            daily_verse: {
              surah_id: surahId,
              surah_name: surahContent.name,
              verse_number: randomVerse.number,
              arabic_text: randomVerse.text,
              translation: randomVerse.translation,
              date: today.toDateString()
            }
          };
        }
        
        return { error: 'Could not retrieve daily verse' };
      } catch (error) {
        return { error: `Failed to get daily verse: ${error.message}` };
      }
    },
    
    /**
     * Execute toggle theme function
     */
    async executeToggleThemeFunction(args) {
      try {
        // Emit event to parent to toggle theme
        this.$emit('toggle-theme');
        
        return {
          success: true,
          message: 'Theme toggled successfully'
        };
      } catch (error) {
        return { error: `Failed to toggle theme: ${error.message}` };
      }
    },

    /**
     * Execute get verse details function using the Public Sura API
     */
    async executeGetVerseDetailsFunction(args) {
      try {
        const { 
          surah_number, 
          verse_number, 
          include_tafsir = true, 
          tafsir_type = 'tafsir-katheer',
          include_irab = false,
          include_reasons = false 
        } = args;
        
        const result = {
          success: true,
          surah_number,
          verse_number,
          details: {}
        };

        // Get basic verse content from local service
        const surahContent = await surahService.getSurahContent(surah_number);
        if (surahContent && surahContent.verses) {
          const verse = surahContent.verses.find(v => v.number === verse_number);
          if (verse) {
            result.details.verse = {
              surah_id: surah_number,
              verse_number: verse_number,
              arabic_text: verse.text,
              translation: verse.translation
            };
          }
        }

        // Tafsir not available without external API
        if (include_tafsir) {
          result.details.tafsir_error = 'Tafsir functionality requires external API integration';
        }

        // I'rab not available without external API
        if (include_irab) {
          result.details.irab_error = 'I\'rab functionality requires external API integration';
        }

        // Reasons for revelation not available without external API
        if (include_reasons) {
          result.details.reasons_error = 'Reasons for revelation functionality requires external API integration';
        }

        return result;
      } catch (error) {
        return { error: `Failed to get verse details: ${error.message}` };
      }
    },

    /**
     * Execute get Tafsir function
     */
    async executeGetTafsirFunction(args) {
      try {
        const { surah_number, verse_number, tafsir_type = 'tafsir-katheer' } = args;
        
        // Tafsir functionality requires external API integration
        throw new Error('Tafsir functionality requires external API integration');
      } catch (error) {
        return { error: `Failed to get Tafsir: ${error.message}` };
      }
    },

    /**
     * Execute get word analysis function
     */
    async executeGetWordAnalysisFunction(args) {
      try {
        const { surah_number, verse_number, word_number, analysis_type = 'eerab-word-aya' } = args;
        
        // Word analysis functionality requires external API integration
        throw new Error('Word analysis functionality requires external API integration');
      } catch (error) {
        return { error: `Failed to get word analysis: ${error.message}` };
      }
    },

    /**
     * Execute get reasons for revelation function
     */
    async executeGetReasonsForRevelationFunction(args) {
      try {
        const { surah_number, verse_number } = args;
        
        // Reasons for revelation functionality requires external API integration
        throw new Error('Reasons for revelation functionality requires external API integration');
      } catch (error) {
        return { error: `Failed to get reasons for revelation: ${error.message}` };
      }
    },

    /**
     * Execute get Tajweed rules function
     */
    async executeGetTajweedRulesFunction(args) {
      try {
        const { surah_number, verse_number } = args;
        
        // Tajweed rules functionality requires external API integration
        throw new Error('Tajweed rules functionality requires external API integration');
      } catch (error) {
        return { error: `Failed to get Tajweed rules: ${error.message}` };
      }
    },

    /**
     * Execute get page content function
     */
    async executeGetPageContentFunction(args) {
      try {
        const { page_number, content_type = 'basic' } = args;
        
        // Validate page number
        if (page_number < 1 || page_number > 604) {
          return { error: 'Page number must be between 1 and 604' };
        }
        
        // Page content functionality requires external API integration
        throw new Error('Page content functionality requires external API integration');
      } catch (error) {
        return { error: `Failed to get page content: ${error.message}` };
      }
    },

    /**
     * Execute get multiple verses function
     */
    async executeGetMultipleVersesFunction(args) {
      try {
        const { surah_number, from_verse, to_verse, include_tafsir = false } = args;
        
        let content_type = 'basic';
        if (include_tafsir) {
          content_type = 'tafsir-katheer';
        }
        
        // Get multiple verses from local service
        const surahContent = await surahService.getSurahContent(surah_number);
        if (!surahContent || !surahContent.verses) {
          throw new Error(`Surah ${surah_number} not found`);
        }
        
        const verses = surahContent.verses.filter(v => 
          v.number >= from_verse && v.number <= to_verse
        ).map(v => ({
          surah_id: surah_number,
          verse_number: v.number,
          arabic_text: v.text,
          translation: v.translation
        }));
        
        return {
          success: true,
          surah_number,
          from_verse,
          to_verse,
          include_tafsir,
          verses,
          message: `Retrieved verses ${from_verse}-${to_verse} from Surah ${surah_number}`
        };
      } catch (error) {
        return { error: `Failed to get multiple verses: ${error.message}` };
      }
    },

    /**
     * Execute navigate to verse function
     */
    async executeNavigateToVerseFunction(args) {
      try {
        const { surah_number, verse_number } = args;
        
        // Emit event to parent to navigate to specific verse
        this.$emit('navigate-to-verse', { surah_number, verse_number });
        
        return {
          success: true,
          message: `Navigating to Surah ${surah_number}, verse ${verse_number}`,
          surah_number,
          verse_number
        };
      } catch (error) {
        return { error: `Failed to navigate to verse: ${error.message}` };
      }
    },

    /**
     * Execute navigate to page function
     */
    async executeNavigateToPageFunction(args) {
      try {
        const { page_number } = args;
        
        // Emit event to parent to navigate to specific page
        this.$emit('navigate-to-page', { page_number });
        
        return {
          success: true,
          message: `Navigating to page ${page_number}`,
          page_number
        };
      } catch (error) {
        return { error: `Failed to navigate to page: ${error.message}` };
      }
    },

    /**
     * Execute get available projects function
     */
    async executeGetAvailableProjectsFunction(args) {
      try {
        const { project_type } = args;
        
        // Projects functionality requires external API integration
        const projects = [];
        const tafsirTypes = [];
        const analysisTypes = [];
        
        return {
          success: true,
          projects,
          available_tafsir_types: tafsirTypes,
          available_analysis_types: analysisTypes,
          message: 'Retrieved available projects and content types'
        };
      } catch (error) {
        return { error: `Failed to get available projects: ${error.message}` };
      }
    }
  }
}
</script>

<style scoped>
/* Modern Glass Morphism Design */
.voice-assistant-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 0;
  background: linear-gradient(145deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border-radius: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset,
    0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  position: relative;
}

.voice-assistant-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.3) 50%, 
    transparent 100%);
}

.compact-mode {
  width: 380px;
  min-height: 450px;
}

.fullscreen-mode {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100% !important;
  max-width: 100% !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  border-radius: 0 !important;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 50%, 
    #f093fb 100%);
}

.ai-interface {
  width: 100%;
  min-height: 320px;
  border-radius: 24px 24px 0 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.8) 0%, 
    rgba(30, 41, 59, 0.8) 100%);
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 2rem 1.5rem;
}

.ai-interface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, 
    rgba(103, 126, 234, 0.1) 0%, 
    transparent 70%);
  opacity: 0.6;
  transition: opacity 0.6s ease;
}

.ai-interface.ai-speaking::before {
  opacity: 1;
  animation: speaking-pulse 2s infinite alternate;
}

.ai-interface.ai-listening::before {
  opacity: 0.8;
  animation: listening-pulse 1.5s infinite alternate;
  background: radial-gradient(circle at 50% 50%, 
    rgba(34, 197, 94, 0.15) 0%, 
    transparent 70%);
}

@keyframes speaking-pulse {
  from { 
    opacity: 0.6; 
    transform: scale(1);
  }
  to { 
    opacity: 1; 
    transform: scale(1.02);
  }
}

@keyframes listening-pulse {
  from { 
    opacity: 0.4; 
    transform: scale(1);
  }
  to { 
    opacity: 0.8; 
    transform: scale(1.01);
  }
}

.ai-core {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
  gap: 1.5rem;
}

.ai-voice-visualization {
  margin-bottom: 1rem;
}

.visualization-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(145deg, 
    rgba(30, 41, 59, 0.6) 0%, 
    rgba(15, 23, 42, 0.8) 100%);
  border: 2px solid rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.3),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(15px);
}

.visualization-circle::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: conic-gradient(
    rgba(103, 126, 234, 0.3) 0deg,
    transparent 60deg,
    transparent 300deg,
    rgba(103, 126, 234, 0.3) 360deg
  );
  animation: rotate 4s linear infinite;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.visualization-circle.pulsing::before {
  opacity: 1;
}

.visualization-circle.pulsing {
  animation: voice-glow 1.5s infinite alternate;
  transform: scale(1.05);
  border-color: rgba(103, 126, 234, 0.4);
  box-shadow: 
    0 15px 40px rgba(103, 126, 234, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.3) inset;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes voice-glow {
  from { 
    box-shadow: 
      0 10px 30px rgba(0, 0, 0, 0.1),
      0 1px 0 rgba(255, 255, 255, 0.2) inset;
  }
  to { 
    box-shadow: 
      0 20px 50px rgba(103, 126, 234, 0.3),
      0 1px 0 rgba(255, 255, 255, 0.4) inset;
  }
}

.voice-bars {
  width: 60px;
  height: 40px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
}

.bar {
  width: 6px;
  background: linear-gradient(to top, 
    #6366f1 0%, 
    #8b5cf6 50%, 
    #ec4899 100%);
  border-radius: 3px;
  height: 20%;
  animation: soundBars 0.8s infinite alternate;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
}

.bar1 { animation-delay: 0.1s; }
.bar2 { animation-delay: 0.2s; }
.bar3 { animation-delay: 0.3s; }
.bar4 { animation-delay: 0.4s; }
.bar5 { animation-delay: 0.2s; }
.bar6 { animation-delay: 0.1s; }

@keyframes soundBars {
  0% { 
    height: 20%; 
    opacity: 0.7; 
    transform: scaleY(1);
  }
  100% { 
    height: 90%; 
    opacity: 1; 
    transform: scaleY(1.1);
  }
}

.ai-icon {
  position: relative;
}

.icon-bg {
  width: 56px;
  height: 56px;
  background: linear-gradient(145deg, 
    rgba(103, 126, 234, 0.2) 0%, 
    rgba(118, 75, 162, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.ai-icon-svg {
  color: #667eea;
  filter: drop-shadow(0 2px 4px rgba(103, 126, 234, 0.3));
  animation: icon-breathe 3s ease-in-out infinite;
}

@keyframes icon-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.ai-response, .user-query {
  width: 90%;
  max-width: 320px;
  min-height: 60px;
  background: rgba(30, 41, 59, 0.8);
  border-radius: 16px;
  padding: 1rem 1.25rem;
  color: #e2e8f0;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 1px 0 rgba(255, 255, 255, 0.1) inset;
  border: 1px solid rgba(99, 102, 241, 0.2);
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(15px);
}

.ai-response {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.3);
}

.user-query {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.3);
}

@keyframes slideIn {
  from { 
    opacity: 0; 
    transform: translateY(20px) scale(0.95); 
  }
  to { 
    opacity: 1; 
    transform: translateY(0) scale(1); 
  }
}

.holographic-text {
  background: linear-gradient(
    90deg, 
    #6366f1 0%, 
    #8b5cf6 50%, 
    #ec4899 100%
  );
  background-size: 200% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: hologram-flow 3s ease-in-out infinite;
  font-weight: 500;
}

@keyframes hologram-flow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.typed-text {
  display: inline-block;
  vertical-align: middle;
}

.cursor {
  display: inline-block;
  width: 2px;
  height: 16px;
  background: linear-gradient(to bottom, #6366f1, #8b5cf6);
  margin-left: 2px;
  animation: cursor-blink 1.2s infinite;
  vertical-align: middle;
  border-radius: 1px;
}

.cursor.typing {
  animation: none;
  opacity: 1;
}

@keyframes cursor-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.typing-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 24px;
}

.typing-indicator span {
  height: 8px;
  width: 8px;
  background: linear-gradient(45deg, #6366f1, #8b5cf6);
  display: block;
  border-radius: 50%;
  opacity: 0.4;
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.typing-indicator span:nth-of-type(1) {
  animation: typing-bounce 1.2s infinite;
}

.typing-indicator span:nth-of-type(2) {
  animation: typing-bounce 1.2s 0.4s infinite;
}

.typing-indicator span:nth-of-type(3) {
  animation: typing-bounce 1.2s 0.8s infinite;
}

@keyframes typing-bounce {
  0%, 100% { 
    transform: translateY(0px) scale(1); 
    opacity: 0.4; 
  }
  50% { 
    transform: translateY(-6px) scale(1.1); 
    opacity: 1; 
  }
}

.ai-status {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
  font-size: 13px;
  font-weight: 500;
  background: rgba(15, 23, 42, 0.8);
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(15px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
  min-width: 120px;
  justify-content: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  transition: all 0.3s ease;
}

.status-dot.connected {
  background: linear-gradient(45deg, #10b981, #059669);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}

.status-dot.connecting {
  background: linear-gradient(45deg, #f59e0b, #d97706);
  box-shadow: 0 0 8px rgba(245, 158, 11, 0.4);
  animation: connecting-pulse 1.5s infinite;
}

.status-dot.speaking {
  background: linear-gradient(45deg, #667eea, #764ba2);
  box-shadow: 0 0 8px rgba(103, 126, 234, 0.4);
  animation: speaking-dot 1s infinite;
}

.status-dot.listening {
  background: linear-gradient(45deg, #22c55e, #16a34a);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  animation: listening-dot 2s infinite;
}

@keyframes connecting-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

@keyframes speaking-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.3); }
}

@keyframes listening-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}

.control-panel {
  width: 100%;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.9);
  border-radius: 0 0 24px 24px;
  border-top: 1px solid rgba(99, 102, 241, 0.2);
  backdrop-filter: blur(20px);
}

.api-key-container {
  display: flex;
  gap: 8px;
  margin-bottom: 1rem;
  width: 100%;
}

.api-key-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 12px;
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.api-key-input::placeholder {
  color: rgba(148, 163, 184, 0.7);
}

.api-key-input:focus {
  border-color: rgba(99, 102, 241, 0.6);
  background: rgba(30, 41, 59, 0.9);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.control-button {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.control-button svg {
  width: 20px;
  height: 20px;
  display: block;
}

.control-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(145deg, 
    rgba(99, 102, 241, 0.1) 0%, 
    transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.control-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  background: rgba(30, 41, 59, 0.9);
  border-color: rgba(99, 102, 241, 0.5);
  color: #6366f1;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

.control-button:hover:not(:disabled)::before {
  opacity: 1;
}

.control-button:active {
  transform: translateY(0) scale(0.98);
}

.control-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.call-button {
  background: rgba(16, 185, 129, 0.2);
  border-color: rgba(16, 185, 129, 0.4);
  color: #10b981;
}

.call-button:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.3);
  border-color: rgba(16, 185, 129, 0.6);
  color: #059669;
}

.call-button.active {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.call-button.active:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
  color: #dc2626;
}

.call-button.connecting {
  background: rgba(245, 158, 11, 0.2);
  border-color: rgba(245, 158, 11, 0.4);
  color: #f59e0b;
}

.spinner svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mic-button {
  background: rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
  color: #6366f1;
}

.mic-button:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.3);
  border-color: rgba(99, 102, 241, 0.6);
}

.mic-button.mic-disabled {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}

.mic-button.mic-disabled:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: rgba(239, 68, 68, 0.6);
}

.fullscreen-button {
  background: rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.4);
  color: #8b5cf6;
}

.fullscreen-button:hover:not(:disabled) {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.6);
}

.fullscreen-button.active {
  background: rgba(139, 92, 246, 0.3);
  border-color: rgba(139, 92, 246, 0.6);
  color: #7c3aed;
}

.clear-button {
  background: rgba(107, 114, 128, 0.2);
  border-color: rgba(107, 114, 128, 0.4);
  color: #9ca3af;
}

.clear-button:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.3);
  border-color: rgba(107, 114, 128, 0.6);
  color: #6b7280;
}

.save-key-button {
  background: rgba(16, 185, 129, 0.3) !important;
  border-color: rgba(16, 185, 129, 0.5) !important;
  color: #10b981 !important;
  border-radius: 12px !important;
}

.save-key-button:hover {
  background: rgba(16, 185, 129, 0.4) !important;
  color: #059669 !important;
}

/* Responsive Design */
@media (max-width: 480px) {
  .compact-mode {
    width: 100%;
    max-width: 350px;
  }
  
  .visualization-circle {
    width: 100px;
    height: 100px;
  }
  
  .icon-bg {
    width: 48px;
    height: 48px;
  }
  
  .ai-icon-svg {
    width: 24px;
    height: 24px;
  }
  
  .control-button {
    width: 48px;
    height: 48px;
  }
  
  .control-buttons {
    gap: 8px;
  }
  
  .ai-response, .user-query {
    font-size: 13px;
    padding: 0.875rem 1rem;
  }
}

/* Dark mode compatibility */
@media (prefers-color-scheme: dark) {
  .voice-assistant-container {
    background: linear-gradient(145deg, 
      rgba(0, 0, 0, 0.4) 0%, 
      rgba(0, 0, 0, 0.2) 100%);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .ai-response, .user-query {
    color: #f8fafc;
  }
  
  .api-key-input {
    color: #f8fafc;
  }
  
  .api-key-input::placeholder {
    color: rgba(148, 163, 184, 0.6);
  }
}
</style>