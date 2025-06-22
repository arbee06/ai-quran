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
              <span class="icon-text">🤖</span>
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
          ✓
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
          <span v-if="!isConnected && !isConnecting">🔌</span>
          <span v-else-if="isConnecting" class="spinner">⟳</span>
          <span v-else>🔴</span>
        </button>
        
        <!-- Mic button -->
        <button 
          class="control-button mic-button" 
          :class="{ 'mic-disabled': !micEnabled }"
          @click="toggleMic"
          v-if="isConnected"
          :title="micEnabled ? 'Mute microphone' : 'Unmute microphone'"
        >
          <span>{{ micEnabled ? '🎤' : '🚫' }}</span>
        </button>
        
        <!-- Fullscreen button -->
        <button 
          class="control-button fullscreen-button" 
          @click="toggleFullscreen"
          :class="{ 'active': isFullscreen }"
          :title="isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'"
        >
          <span>{{ isFullscreen ? '🗗' : '🗖' }}</span>
        </button>
        
        <!-- Clear button -->
        <button 
          class="control-button clear-button" 
          @click="clearConversation"
          v-if="isConnected && conversationHistory.length > 0"
          title="Clear conversation"
        >
          <span>🗑️</span>
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
.voice-assistant-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px;
  padding: 20px;
  background: linear-gradient(135deg, rgba(0, 10, 30, 0.95), rgba(0, 25, 60, 0.85));
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(0, 120, 255, 0.3);
  transition: all 0.3s ease;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(0, 150, 255, 0.2);
}

.compact-mode {
  width: 350px;
  padding: 15px;
}

.compact-mode .ai-interface {
  height: 250px;
}

.compact-mode .ai-response,
.compact-mode .user-query {
  min-height: 50px;
  font-size: 14px;
  padding: 12px;
  max-height: 120px;
  overflow-y: auto;
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
}

.fullscreen-mode .ai-interface {
  height: 70vh;
  width: 90%;
  margin: 0 auto;
}

.fullscreen-mode .ai-voice-visualization {
  transform: scale(2);
  margin-bottom: 80px;
}

.fullscreen-mode .ai-response,
.fullscreen-mode .user-query {
  width: 80%;
  max-width: 1000px;
  min-height: 120px;
  font-size: 28px;
  max-height: 400px;
}

.ai-interface {
  width: 100%;
  height: 300px;
  border-radius: 15px;
  margin-bottom: 25px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #051a3a, #000b1a);
  box-shadow: inset 0 0 30px rgba(0, 120, 255, 0.1);
  border: 1px solid rgba(0, 150, 255, 0.3);
  overflow: hidden;
  transition: all 0.3s ease;
}

.ai-interface::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(0, 120, 255, 0.15) 0%, transparent 70%);
  opacity: 0.6;
  transition: opacity 0.5s ease;
}

.ai-interface.ai-speaking::before {
  opacity: 1;
  animation: pulse-glow 2s infinite alternate;
}

.ai-interface.ai-listening::before {
  opacity: 0.8;
  animation: listen-pulse 1.5s infinite alternate;
}

@keyframes pulse-glow {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

@keyframes listen-pulse {
  from { opacity: 0.4; }
  to { opacity: 0.8; }
}

.ai-core {
  position: relative;
  width: 90%;
  height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.ai-voice-visualization {
  margin-bottom: 30px;
}

.visualization-circle {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #002c5a, #001528);
  border: 3px solid rgba(0, 150, 255, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 25px rgba(0, 150, 255, 0.4);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.visualization-circle.pulsing {
  animation: voice-glow 1.5s infinite alternate;
  transform: scale(1.1);
}

@keyframes voice-glow {
  from { 
    box-shadow: 0 0 25px rgba(0, 150, 255, 0.4);
    border-color: rgba(0, 150, 255, 0.6);
  }
  to { 
    box-shadow: 0 0 40px rgba(0, 200, 255, 0.8);
    border-color: rgba(0, 200, 255, 0.9);
  }
}

.voice-bars {
  width: 70%;
  height: 70%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}

.bar {
  width: 4px;
  background: linear-gradient(to top, #00a6ff, #00d4ff);
  border-radius: 4px;
  height: 15%;
  animation: soundBars 0.6s infinite alternate;
  box-shadow: 0 0 8px rgba(0, 166, 255, 0.6);
}

.bar1 { animation-delay: 0.1s; }
.bar2 { animation-delay: 0.2s; }
.bar3 { animation-delay: 0.3s; }
.bar4 { animation-delay: 0.4s; }
.bar5 { animation-delay: 0.2s; }
.bar6 { animation-delay: 0.1s; }

@keyframes soundBars {
  0% { height: 15%; opacity: 0.7; }
  100% { height: 80%; opacity: 1; }
}

.ai-icon {
  color: #00d4ff;
  font-size: 40px;
  animation: icon-breathe 3s ease-in-out infinite;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.6);
}

.icon-text {
  font-size: 40px;
  display: block;
}

@keyframes icon-breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.ai-response, .user-query {
  width: 85%;
  min-height: 70px;
  background: rgba(0, 25, 60, 0.7);
  border-radius: 12px;
  padding: 18px;
  margin-bottom: 15px;
  color: #ffffff;
  font-size: 16px;
  line-height: 1.6;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 100, 200, 0.2);
  border: 1px solid rgba(0, 150, 255, 0.3);
  animation: fadeIn 0.5s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.ai-response::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 150, 255, 0.1), transparent);
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.holographic-text {
  color: transparent !important;
  background: linear-gradient(
    90deg, 
    rgba(0, 255, 255, 0.9), 
    rgba(0, 200, 255, 0.9), 
    rgba(0, 150, 255, 0.9), 
    rgba(100, 150, 255, 0.9)
  );
  background-size: 400% 100%;
  background-clip: text;
  -webkit-background-clip: text;
  animation: hologram-flow 4s ease-in-out infinite;
  text-shadow: 
    0 0 10px rgba(0, 200, 255, 0.6),
    0 0 20px rgba(0, 150, 255, 0.4),
    0 0 30px rgba(0, 100, 255, 0.2);
}

@keyframes hologram-flow {
  0% { background-position: 0% 50%; filter: hue-rotate(0deg); }
  50% { background-position: 100% 50%; filter: hue-rotate(30deg); }
  100% { background-position: 0% 50%; filter: hue-rotate(0deg); }
}

.typed-text {
  display: inline-block;
  vertical-align: middle;
}

.cursor {
  display: inline-block;
  width: 3px;
  height: 20px;
  background: linear-gradient(to bottom, #00a6ff, #00d4ff);
  margin-left: 3px;
  animation: cursor-blink 1.2s infinite;
  vertical-align: middle;
  box-shadow: 0 0 8px rgba(0, 166, 255, 0.8);
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
  height: 30px;
}

.typing-indicator span {
  height: 10px;
  width: 10px;
  margin: 0 3px;
  background: linear-gradient(to bottom, #00a6ff, #00d4ff);
  display: block;
  border-radius: 50%;
  opacity: 0.4;
  box-shadow: 0 0 8px rgba(0, 166, 255, 0.6);
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
  0%, 100% { transform: translateY(0px); opacity: 0.4; }
  50% { transform: translateY(-8px); opacity: 1; }
}

.ai-status {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  color: #7fa8d7;
  font-size: 12px;
  background: rgba(0, 20, 40, 0.8);
  padding: 5px 12px;
  border-radius: 15px;
  border: 1px solid rgba(0, 150, 255, 0.3);
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  background-color: #444;
  transition: all 0.3s ease;
}

.status-dot.connected {
  background: linear-gradient(45deg, #00a6ff, #00d4ff);
  box-shadow: 0 0 12px rgba(0, 166, 255, 0.8);
}

.status-dot.connecting {
  background: linear-gradient(45deg, #ffa500, #ffcc00);
  box-shadow: 0 0 12px rgba(255, 165, 0, 0.8);
  animation: connecting-pulse 1.5s infinite;
}

.status-dot.speaking {
  background: linear-gradient(45deg, #00ffaa, #00ff80);
  box-shadow: 0 0 12px rgba(0, 255, 170, 0.8);
  animation: speaking-pulse 1s infinite;
}

.status-dot.listening {
  background: linear-gradient(45deg, #00a6ff, #0080ff);
  box-shadow: 0 0 12px rgba(0, 166, 255, 0.8);
  animation: listening-pulse 2s infinite;
}

@keyframes connecting-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.2); }
}

@keyframes speaking-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.3); }
}

@keyframes listening-pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.15); }
}

.control-panel {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.api-key-container {
  display: flex;
  width: 100%;
  max-width: 400px;
  margin-bottom: 20px;
}

.api-key-input {
  flex: 1;
  padding: 14px 18px;
  border: 2px solid rgba(0, 150, 255, 0.4);
  border-radius: 30px 0 0 30px;
  background: rgba(0, 20, 40, 0.8);
  color: #ffffff;
  font-size: 14px;
  outline: none;
  transition: all 0.3s ease;
}

.api-key-input:focus {
  border-color: #00a6ff;
  box-shadow: 0 0 15px rgba(0, 166, 255, 0.5);
}

.save-key-button {
  border-radius: 0 30px 30px 0 !important;
  padding: 0 20px;
  background: linear-gradient(135deg, #00a6ff, #0080ff) !important;
}

.control-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.control-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #003366, #001528);
  border: 2px solid rgba(0, 150, 255, 0.4);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  font-size: 20px;
  position: relative;
  overflow: hidden;
}

.control-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(0, 150, 255, 0.2) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.control-button:hover:not(:disabled) {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 150, 255, 0.4);
  border-color: #00a6ff;
}

.control-button:hover:not(:disabled)::before {
  opacity: 1;
}

.control-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.call-button {
  background: linear-gradient(135deg, #004080, #001a33);
  border-color: #0055a4;
}

.call-button.active {
  background: linear-gradient(135deg, #801a00, #330d00);
  border-color: #a42500;
}

.call-button.connecting {
  background: linear-gradient(135deg, #805400, #332200);
  border-color: #a46a00;
}

.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mic-button {
  background: linear-gradient(135deg, #004d99, #003366);
  border-color: #0066cc;
}

.mic-button.mic-disabled {
  background: linear-gradient(135deg, #990000, #660000);
  border-color: #cc0000;
}

.fullscreen-button {
  background: linear-gradient(135deg, #005a80, #003347);
  border-color: #0077a7;
}

.fullscreen-button.active {
  background: linear-gradient(135deg, #008080, #004747);
  border-color: #00a3a3;
}

.clear-button {
  background: linear-gradient(135deg, #1a3d66, #0d1f33);
  border-color: #234980;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>