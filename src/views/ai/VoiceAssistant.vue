# File: ai-quran/src/views/ai/VoiceAssistant.vue

<template>
  <div class="voice-assistant-wrapper">
    <!-- Enhanced Floating Voice Button - Hidden when widget is open -->
    <button 
      v-if="!showVoiceAssistant"
      @click="toggleVoiceAssistant" 
      class="voice-fab"
      :class="{ 'pulsing': isConnected }"
      title="Open Voice Assistant"
    >
      <div class="fab-background"></div>
      <div class="fab-glow"></div>
      <div class="fab-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
          <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
          <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <div class="fab-ripple"></div>
    </button>

    <!-- Enhanced Voice Assistant Widget -->
    <Transition name="voice-widget" appear>
      <div v-if="showVoiceAssistant" class="voice-widget" :class="{ 'minimized': isMinimized }">
        <!-- Glassmorphism Header -->
        <div class="widget-header">
          <div class="header-background"></div>
          <div class="header-content">
            <div class="widget-title">
              <div class="ai-avatar">
                <div class="avatar-rings">
                  <div class="ring ring-1"></div>
                  <div class="ring ring-2"></div>
                  <div class="ring ring-3"></div>
                </div>
                <div class="avatar-core">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="ai-icon">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
              </div>
              <div class="title-text">
                <h4>Voice Assistant</h4>
                <div class="status-container">
                  <div class="status-dot" :class="statusClass"></div>
                  <span class="status-text">{{ aiStatusText }}</span>
                </div>
              </div>
            </div>
            <div class="widget-controls">
              <button @click="minimizeWidget" class="control-btn minimize-btn" v-if="!isMinimized" title="Minimize">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 12h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
                </svg>
              </button>
              <button @click="maximizeWidget" class="control-btn expand-btn" v-if="isMinimized" title="Expand">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <button @click="closeWidget" class="control-btn close-btn" title="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Enhanced Main Content -->
        <div class="widget-content" v-if="!isMinimized">
          <div class="voice-assistant-container" :class="{ 'fullscreen-mode': isFullscreen, 'compact-mode': !isFullscreen }">
            <!-- Enhanced AI Interface -->
            <div class="ai-interface" :class="interfaceClass">
              <div class="interface-background">
                <div class="gradient-orb orb-1"></div>
                <div class="gradient-orb orb-2"></div>
                <div class="gradient-orb orb-3"></div>
              </div>
              
              <div class="ai-core">
                <!-- Enhanced Voice Visualization -->
                <div class="ai-voice-visualization">
                  <div class="visualization-container">
                    <!-- Central Visualization -->
                    <div class="central-viz" :class="{ 'active': isConnected, 'speaking': isAssistantResponding, 'listening': isUserSpeaking }">
                      <div class="viz-outer-ring"></div>
                      <div class="viz-middle-ring"></div>
                      <div class="viz-inner-core">
                        <div v-if="isAssistantResponding" class="voice-bars-container">
                          <div class="voice-bar" v-for="i in 5" :key="i" :style="{ '--delay': i * 0.1 + 's' }"></div>
                        </div>
                        <div v-else-if="isUserSpeaking" class="listening-indicator">
                          <div class="listening-wave" v-for="i in 3" :key="i" :style="{ '--delay': i * 0.2 + 's' }"></div>
                        </div>
                        <div v-else class="ai-logo">
                          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Floating Particles -->
                    <div class="floating-particles">
                      <div class="particle" v-for="i in 8" :key="i" :style="{ '--delay': i * 0.5 + 's', '--duration': (2 + i * 0.3) + 's' }"></div>
                    </div>
                  </div>
                </div>

                <!-- Enhanced Response Display -->
                <Transition name="content-fade">
                  <div v-if="currentAIResponse || isAssistantResponding || (userTranscript && isUserSpeaking)" class="content-display">
                    <!-- AI Response -->
                    <div v-if="currentAIResponse || isAssistantResponding" class="ai-response-container">
                      <div class="response-header">
                        <div class="response-avatar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" fill="currentColor"/>
                            <path d="M12 1v6m0 14v-6m11-5h-6M6 12H1" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                        <span class="response-label">Assistant</span>
                      </div>
                      <div class="response-content">
                        <div v-if="isAssistantResponding && !currentAIResponse" class="typing-indicator">
                          <span></span><span></span><span></span>
                        </div>
                        <div v-else class="response-text">
                          <span class="typed-text">{{ typedText }}</span>
                          <span class="cursor" :class="{'typing': isTyping}"></span>
                        </div>
                      </div>
                    </div>

                    <!-- User Query -->
                    <div v-if="userTranscript && isUserSpeaking" class="user-query-container">
                      <div class="query-header">
                        <div class="query-avatar">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                        <span class="query-label">You</span>
                      </div>
                      <div class="query-content">
                        <div class="query-text">{{ userTranscript }}</div>
                      </div>
                    </div>
                  </div>
                </Transition>

                <!-- Enhanced Status Display -->
                <div class="status-display">
                  <div class="status-container">
                    <div class="status-dot" :class="statusClass"></div>
                    <span class="status-text">{{ aiStatusText }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Control Panel -->
            <div class="control-panel">
              <div class="panel-background"></div>
              
              <!-- API Key Input -->
              <Transition name="api-key">
                <div v-if="showApiKeyInput" class="api-key-section">
                  <div class="api-key-header">
                    <div class="api-key-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="16" r="1" fill="currentColor"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                    <span>OpenAI API Key Required</span>
                  </div>
                  <div class="api-key-input-container">
                    <input 
                      type="password" 
                      v-model="apiKey" 
                      class="api-key-input" 
                      placeholder="Enter your OpenAI API key"
                      @keyup.enter="saveApiKey"
                    />
                    <button @click="saveApiKey" class="save-key-btn">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </Transition>

              <!-- Enhanced Control Buttons -->
              <div class="control-buttons">
                <!-- Connect/Disconnect Button -->
                <button 
                  class="control-button connect-btn" 
                  :class="{ 'connected': isConnected, 'connecting': isConnecting }"
                  @click="toggleCall"
                  :disabled="isConnecting"
                >
                  <div class="btn-background"></div>
                  <div class="btn-content">
                    <Transition name="btn-icon" mode="out-in">
                      <svg v-if="!isConnected && !isConnecting" key="connect" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
                      </svg>
                      <div v-else-if="isConnecting" key="connecting" class="loading-spinner">
                        <div class="spinner-ring"></div>
                      </div>
                      <svg v-else key="disconnect" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" stroke-width="2" fill="none"/>
                      </svg>
                    </Transition>
                  </div>
                  <div class="btn-ripple"></div>
                </button>

                <!-- Microphone Button -->
                <button 
                  v-if="isConnected"
                  class="control-button mic-btn" 
                  :class="{ 'muted': !micEnabled }"
                  @click="toggleMic"
                >
                  <div class="btn-background"></div>
                  <div class="btn-content">
                    <Transition name="btn-icon" mode="out-in">
                      <svg v-if="micEnabled" key="mic-on" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <svg v-else key="mic-off" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2"/>
                        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" stroke="currentColor" stroke-width="2"/>
                        <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </Transition>
                  </div>
                  <div class="btn-ripple"></div>
                </button>

                <!-- Fullscreen Button -->
                <button 
                  class="control-button fullscreen-btn" 
                  @click="toggleFullscreen"
                  :class="{ 'active': isFullscreen }"
                >
                  <div class="btn-background"></div>
                  <div class="btn-content">
                    <Transition name="btn-icon" mode="out-in">
                      <svg v-if="!isFullscreen" key="expand" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <svg v-else key="collapse" width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </Transition>
                  </div>
                  <div class="btn-ripple"></div>
                </button>

                <!-- Clear Button -->
                <button 
                  v-if="isConnected && conversationHistory.length > 0"
                  class="control-button clear-btn" 
                  @click="clearConversation"
                >
                  <div class="btn-background"></div>
                  <div class="btn-content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="btn-ripple"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
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
      // Widget state
      showVoiceAssistant: false,
      isMinimized: false,
      
      // Connection state
      isConnected: false,
      isConnecting: false,
      connectionState: 'disconnected',
      
      // Conversation state
      userTranscript: '',
      assistantResponse: '',
      currentAIResponse: '',
      typedText: '',
      isTyping: false,
      typingInterval: null,
      typingSpeed: 30,
      processingFunctionCall: false,
      currentFunctionCall: null,
      conversationHistory: [],
      
      // Voice state
      isUserSpeaking: false,
      isAssistantResponding: false,
      micEnabled: true,
      audioTrack: null,
      
      // UI state
      isFullscreen: false,
      apiKey: '',
      showApiKeyInput: false,
      
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
    },
    statusClass() {
      if (this.isConnecting) return 'connecting';
      if (!this.isConnected) return 'offline';
      if (this.isAssistantResponding) return 'speaking';
      if (this.isUserSpeaking) return 'listening';
      if (!this.micEnabled) return 'muted';
      return 'ready';
    },
    interfaceClass() {
      return {
        'ai-speaking': this.isAssistantResponding,
        'ai-listening': this.isUserSpeaking,
        'ai-connected': this.isConnected,
        'ai-offline': !this.isConnected
      };
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
     * Widget control methods
     */
    toggleVoiceAssistant() {
      this.showVoiceAssistant = !this.showVoiceAssistant;
      if (this.showVoiceAssistant) {
        this.$emit('start-voice-session');
      }
    },
    
    startVoiceSession() {
      this.showVoiceAssistant = true;
      if (!this.isConnected && this.apiKey && !this.isConnecting) {
        this.startCall();
      }
    },
    
    minimizeWidget() {
      this.isMinimized = true;
    },
    
    maximizeWidget() {
      this.isMinimized = false;
    },
    
    closeWidget() {
      this.showVoiceAssistant = false;
      if (this.isConnected) {
        this.endCall();
      }
    },
    
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
      const element = this.$el.querySelector('.voice-widget');
      
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
          case 'navigate_to_surah':
            result = await this.executeNavigateToSurahFunction(parsedArgs);
            break;
          case 'navigate_to_verse':
            result = await this.executeNavigateToVerseFunction(parsedArgs);
            break;
          case 'navigate_to_page':
            result = await this.executeNavigateToPageFunction(parsedArgs);
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
    
    // Include other function execution methods here (same as before)
    async executeGetSurahContentFunction(args) {
      try {
        const { surah_number } = args;
        const content = await surahService.getSurahContent(surah_number);
        this.$emit('navigate-to-surah', surah_number);
        return {
          success: true,
          surah_number,
          content,
          message: `Retrieved Surah ${surah_number} content`
        };
      } catch (error) {
        return { error: `Failed to get Surah content: ${error.message}` };
      }
    },
    
    async executeNavigateToSurahFunction(args) {
      try {
        const { surah_number } = args;
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
    
    async executeNavigateToVerseFunction(args) {
      try {
        const { surah_number, verse_number } = args;
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
    
    async executeNavigateToPageFunction(args) {
      try {
        const { page_number } = args;
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
    
    async executeBookmarkVerseFunction(args) {
      try {
        const { surah_id, verse_number, note } = args;
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
    
    async executePlayRecitationFunction(args) {
      try {
        const { surah_number, verse_number, reciter = 'sudais' } = args;
        let result;
        if (verse_number) {
          result = await quranAudioService.playVerse(surah_number, verse_number, reciter);
        } else {
          result = await quranAudioService.playSurah(surah_number, reciter);
        }
        this.$emit('play-recitation', { surah_number, verse_number, reciter });
        return {
          success: result.success,
          message: result.success 
            ? (verse_number 
                ? `Playing recitation of Surah ${surah_number}, verse ${verse_number}`
                : `Playing recitation of Surah ${surah_number}`)
            : result.error,
          surah_number,
          verse_number
        };
      } catch (error) {
        return { error: `Failed to play recitation: ${error.message}` };
      }
    },
    
    async executeToggleThemeFunction(args) {
      try {
        this.$emit('toggle-theme');
        return {
          success: true,
          message: 'Theme toggled successfully'
        };
      } catch (error) {
        return { error: `Failed to toggle theme: ${error.message}` };
      }
    },
    
    setupAudioEventListeners() {
      // Audio event listeners setup (same as before)
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
    }
  }
}
</script>

<style scoped>
/* Modern Enhanced Voice Assistant Styling */
.voice-assistant-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 200;
}

.voice-assistant-wrapper > * {
  pointer-events: auto;
}

/* Enhanced Floating Action Button */
.voice-fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 201;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.fab-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    #667eea 0%, 
    #764ba2 50%, 
    #f093fb 100%);
  transition: all 0.4s ease;
}

.fab-glow {
  position: absolute;
  inset: -2px;
  background: inherit;
  border-radius: 50%;
  opacity: 0;
  animation: fab-glow 2s ease-in-out infinite;
  z-index: -1;
}

.voice-fab.pulsing .fab-glow {
  opacity: 0.6;
}

@keyframes fab-glow {
  0%, 100% { 
    transform: scale(1); 
    opacity: 0.3; 
  }
  50% { 
    transform: scale(1.2); 
    opacity: 0.6; 
  }
}

.fab-icon {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.fab-ripple {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: scale(0);
  opacity: 0;
  transition: all 0.3s ease;
}

.voice-fab:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.voice-fab:active .fab-ripple {
  transform: scale(1);
  opacity: 1;
}

/* Enhanced Widget Transitions */
.voice-widget-enter-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.voice-widget-leave-active {
  transition: all 0.4s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.voice-widget-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.9);
}

.voice-widget-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}

/* Enhanced Voice Widget */
.voice-widget {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 420px;
  max-height: 650px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(24px);
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 16px 32px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  z-index: 200;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.voice-widget.minimized {
  height: 80px;
  max-height: 80px;
}

/* Enhanced Header */
.widget-header {
  position: relative;
  padding: 1.25rem 1.5rem;
  overflow: hidden;
}

.header-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.9) 0%, 
    rgba(118, 75, 162, 0.9) 50%, 
    rgba(240, 147, 251, 0.9) 100%);
  backdrop-filter: blur(20px);
}

.header-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(255, 255, 255, 0.6) 50%, 
    transparent 100%);
}

.header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.widget-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Enhanced AI Avatar */
.ai-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-rings {
  position: absolute;
  inset: 0;
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  animation: ring-rotate 8s linear infinite;
}

.ring-1 {
  inset: 0;
  animation-duration: 8s;
}

.ring-2 {
  inset: 4px;
  animation-duration: 12s;
  animation-direction: reverse;
}

.ring-3 {
  inset: 8px;
  animation-duration: 16s;
}

@keyframes ring-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.avatar-core {
  position: relative;
  z-index: 2;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.title-text h4 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.status-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.status-text {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 500;
}

/* Enhanced Status Dots */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
}

.status-dot::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: inherit;
  opacity: 0.3;
  animation: status-pulse 2s infinite;
}

.status-dot.offline {
  background: #64748b;
}

.status-dot.connecting {
  background: #f59e0b;
  animation: status-connecting 1s infinite;
}

.status-dot.ready {
  background: #10b981;
}

.status-dot.listening {
  background: #3b82f6;
  animation: status-listening 1s infinite;
}

.status-dot.speaking {
  background: #8b5cf6;
  animation: status-speaking 0.8s infinite;
}

.status-dot.muted {
  background: #ef4444;
}

@keyframes status-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.5); opacity: 0.1; }
}

@keyframes status-connecting {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

@keyframes status-listening {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes status-speaking {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.1); }
  75% { transform: scale(1.05); }
}

/* Enhanced Widget Controls */
.widget-controls {
  display: flex;
  gap: 0.5rem;
}

.control-btn {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* Enhanced Widget Content */
.widget-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  max-height: 560px;
}

.voice-assistant-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: linear-gradient(145deg, 
    rgba(15, 23, 42, 0.95) 0%, 
    rgba(30, 41, 59, 0.95) 100%);
  position: relative;
  overflow: hidden;
}

.voice-assistant-container::before {
  content: '';
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(102, 126, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(118, 75, 162, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(240, 147, 251, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

/* Enhanced AI Interface */
.ai-interface {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2rem 1.5rem;
  min-height: 320px;
}

.interface-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.4;
  animation: orb-float 6s ease-in-out infinite;
}

.orb-1 {
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, #667eea 0%, transparent 70%);
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.orb-2 {
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, #764ba2 0%, transparent 70%);
  top: 60%;
  right: 30%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, #f093fb 0%, transparent 70%);
  bottom: 30%;
  left: 40%;
  animation-delay: 4s;
}

@keyframes orb-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(20px, -20px) scale(1.1); }
  66% { transform: translate(-15px, 15px) scale(0.9); }
}

.ai-interface.ai-speaking .gradient-orb {
  animation-duration: 3s;
  opacity: 0.6;
}

.ai-interface.ai-listening .gradient-orb {
  animation-duration: 4s;
  opacity: 0.5;
}

.ai-core {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
}

/* Enhanced Voice Visualization */
.visualization-container {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.central-viz {
  position: relative;
  width: 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s ease;
}

.viz-outer-ring {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(102, 126, 234, 0.3);
  border-radius: 50%;
  transition: all 0.4s ease;
}

.viz-middle-ring {
  position: absolute;
  inset: 15px;
  border: 1px solid rgba(118, 75, 162, 0.4);
  border-radius: 50%;
  transition: all 0.4s ease;
}

.viz-inner-core {
  position: relative;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.2) 0%, 
    rgba(118, 75, 162, 0.2) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.4s ease;
}

.central-viz.active .viz-outer-ring {
  border-color: rgba(102, 126, 234, 0.6);
  animation: ring-pulse 2s infinite;
}

.central-viz.active .viz-middle-ring {
  border-color: rgba(118, 75, 162, 0.6);
  animation: ring-pulse 2s infinite 0.5s;
}

.central-viz.speaking .viz-outer-ring {
  border-color: rgba(139, 92, 246, 0.8);
  animation: ring-speaking 1s infinite;
}

.central-viz.listening .viz-outer-ring {
  border-color: rgba(59, 130, 246, 0.8);
  animation: ring-listening 1.5s infinite;
}

@keyframes ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.05); opacity: 1; }
}

@keyframes ring-speaking {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

@keyframes ring-listening {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}

/* Voice Bars Animation */
.voice-bars-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  height: 32px;
}

.voice-bar {
  width: 3px;
  height: 8px;
  background: linear-gradient(to top, #667eea, #8b5cf6);
  border-radius: 2px;
  animation: voice-bar-animate 0.8s ease-in-out infinite;
  animation-delay: var(--delay);
}

@keyframes voice-bar-animate {
  0%, 100% { height: 8px; opacity: 0.6; }
  50% { height: 24px; opacity: 1; }
}

/* Listening Waves */
.listening-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.listening-wave {
  width: 6px;
  height: 6px;
  background: #3b82f6;
  border-radius: 50%;
  animation: listening-wave-animate 1.5s infinite;
  animation-delay: var(--delay);
}

@keyframes listening-wave-animate {
  0%, 100% { transform: scale(1); opacity: 0.4; }
  50% { transform: scale(1.5); opacity: 1; }
}

/* AI Logo */
.ai-logo {
  color: rgba(255, 255, 255, 0.8);
  animation: logo-breathe 3s ease-in-out infinite;
}

@keyframes logo-breathe {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
}

/* Floating Particles */
.floating-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: particle-float var(--duration) ease-in-out infinite;
  animation-delay: var(--delay);
}

.particle:nth-child(1) { top: 10%; left: 10%; }
.particle:nth-child(2) { top: 20%; right: 15%; }
.particle:nth-child(3) { bottom: 30%; left: 20%; }
.particle:nth-child(4) { bottom: 20%; right: 10%; }
.particle:nth-child(5) { top: 50%; left: 5%; }
.particle:nth-child(6) { top: 30%; right: 5%; }
.particle:nth-child(7) { bottom: 40%; left: 60%; }
.particle:nth-child(8) { top: 60%; right: 40%; }

@keyframes particle-float {
  0%, 100% { transform: translateY(0px) scale(1); opacity: 0.3; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.8; }
}

/* Enhanced Content Display */
.content-display {
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
}

.content-fade-enter-active, .content-fade-leave-active {
  transition: all 0.4s ease;
}

.content-fade-enter-from, .content-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Enhanced Response Containers */
.ai-response-container, .user-query-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: message-slide-in 0.4s ease;
}

@keyframes message-slide-in {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.ai-response-container {
  border-left: 3px solid #8b5cf6;
}

.user-query-container {
  border-left: 3px solid #3b82f6;
}

.response-header, .query-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.response-avatar, .query-avatar {
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
}

.response-label, .query-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
}

.response-content, .query-content {
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
}

/* Enhanced Typing Indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.5rem 0;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: linear-gradient(45deg, #667eea, #8b5cf6);
  border-radius: 50%;
  animation: typing-dot 1.4s infinite;
}

.typing-indicator span:nth-child(1) { animation-delay: 0ms; }
.typing-indicator span:nth-child(2) { animation-delay: 200ms; }
.typing-indicator span:nth-child(3) { animation-delay: 400ms; }

@keyframes typing-dot {
  0%, 60%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  30% { transform: translateY(-10px) scale(1.2); opacity: 1; }
}

/* Enhanced Cursor */
.cursor {
  display: inline-block;
  width: 2px;
  height: 18px;
  background: linear-gradient(to bottom, #667eea, #8b5cf6);
  margin-left: 2px;
  animation: cursor-blink 1.2s infinite;
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

/* Enhanced Status Display */
.status-display {
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

.status-display .status-container {
  background: linear-gradient(135deg, 
    rgba(255, 255, 255, 0.1) 0%, 
    rgba(255, 255, 255, 0.05) 100%);
  padding: 0.75rem 1.25rem;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 
    0 4px 16px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.status-display .status-text {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.875rem;
  font-weight: 500;
}

/* Enhanced Control Panel */
.control-panel {
  position: relative;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.95);
  border-radius: 0 0 24px 24px;
}

.panel-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, 
    rgba(15, 23, 42, 0.9) 0%, 
    rgba(30, 41, 59, 0.9) 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Enhanced API Key Section */
.api-key-section {
  position: relative;
  z-index: 2;
  margin-bottom: 1.5rem;
}

.api-key-enter-active, .api-key-leave-active {
  transition: all 0.4s ease;
}

.api-key-enter-from, .api-key-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.api-key-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.2) 0%, 
    rgba(217, 119, 6, 0.2) 100%);
  border-radius: 8px;
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #f59e0b;
  box-shadow: 
    0 2px 8px rgba(245, 158, 11, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: api-key-glow 3s ease-in-out infinite;
}

@keyframes api-key-glow {
  0%, 100% { 
    box-shadow: 
      0 2px 8px rgba(245, 158, 11, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }
  50% { 
    box-shadow: 
      0 4px 16px rgba(245, 158, 11, 0.3),
      inset 0 1px 0 rgba(255, 255, 255, 0.2);
  }
}

.api-key-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.95);
  font-size: 0.875rem;
  font-weight: 600;
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.1) 0%, 
    rgba(217, 119, 6, 0.1) 100%);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(245, 158, 11, 0.2);
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(245, 158, 11, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.api-key-input-container {
  display: flex;
  gap: 0.5rem;
}

.api-key-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.api-key-input:focus {
  outline: none;
  border-color: rgba(102, 126, 234, 0.6);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  transform: scale(1.01);
}

.api-key-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.save-key-btn {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.9) 0%, 
    rgba(5, 150, 105, 0.9) 50%, 
    rgba(6, 182, 212, 0.9) 100%);
  border: 1px solid rgba(16, 185, 129, 0.4);
  border-radius: 12px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
  box-shadow: 
    0 4px 16px rgba(16, 185, 129, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.save-key-btn:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 1) 0%, 
    rgba(5, 150, 105, 1) 50%, 
    rgba(6, 182, 212, 1) 100%);
  box-shadow: 
    0 6px 20px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
}

/* Enhanced Control Buttons */
.control-buttons {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  animation: buttons-slide-up 0.6s ease 0.3s both;
}

@keyframes buttons-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.control-button {
  position: relative;
  width: 64px;
  height: 64px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-background {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(20px);
  transition: all 0.3s ease;
}

.btn-content {
  position: relative;
  z-index: 2;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.btn-ripple {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  transform: scale(0);
  opacity: 0;
  transition: all 0.3s ease;
}

.control-button:hover .btn-background {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.02);
}

.control-button:hover .btn-content {
  color: white;
  transform: scale(1.1);
}

.control-button:active .btn-ripple {
  transform: scale(1);
  opacity: 1;
}

/* Enhanced Button Variants with AI Theme Colors */
.connect-btn .btn-background {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.25) 0%, 
    rgba(5, 150, 105, 0.25) 50%, 
    rgba(6, 182, 212, 0.25) 100%);
  border: 1px solid rgba(16, 185, 129, 0.4);
  box-shadow: 
    0 4px 16px rgba(16, 185, 129, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.connect-btn .btn-content {
  color: #10b981;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.connect-btn:hover .btn-background {
  background: linear-gradient(135deg, 
    rgba(16, 185, 129, 0.35) 0%, 
    rgba(5, 150, 105, 0.35) 50%, 
    rgba(6, 182, 212, 0.35) 100%);
  box-shadow: 
    0 6px 20px rgba(16, 185, 129, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.connect-btn.connected .btn-background {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.25) 0%, 
    rgba(220, 38, 38, 0.25) 50%, 
    rgba(248, 113, 113, 0.25) 100%);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 
    0 4px 16px rgba(239, 68, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.connect-btn.connected .btn-content {
  color: #ef4444;
}

.connect-btn.connecting .btn-background {
  background: linear-gradient(135deg, 
    rgba(245, 158, 11, 0.25) 0%, 
    rgba(217, 119, 6, 0.25) 50%, 
    rgba(251, 191, 36, 0.25) 100%);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 
    0 4px 16px rgba(245, 158, 11, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  animation: connecting-glow 2s ease-in-out infinite;
}

.connect-btn.connecting .btn-content {
  color: #f59e0b;
}

@keyframes connecting-glow {
  0%, 100% { box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1); }
  50% { box-shadow: 0 6px 24px rgba(245, 158, 11, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2); }
}

.mic-btn .btn-background {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.25) 0%, 
    rgba(99, 102, 241, 0.25) 50%, 
    rgba(139, 92, 246, 0.25) 100%);
  border: 1px solid rgba(102, 126, 234, 0.4);
  box-shadow: 
    0 4px 16px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.mic-btn .btn-content {
  color: #667eea;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.mic-btn:hover .btn-background {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.35) 0%, 
    rgba(99, 102, 241, 0.35) 50%, 
    rgba(139, 92, 246, 0.35) 100%);
  box-shadow: 
    0 6px 20px rgba(102, 126, 234, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.mic-btn.muted .btn-background {
  background: linear-gradient(135deg, 
    rgba(239, 68, 68, 0.25) 0%, 
    rgba(220, 38, 38, 0.25) 50%, 
    rgba(248, 113, 113, 0.25) 100%);
  border-color: rgba(239, 68, 68, 0.4);
  box-shadow: 
    0 4px 16px rgba(239, 68, 68, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.mic-btn.muted .btn-content {
  color: #ef4444;
}

.fullscreen-btn .btn-background {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.25) 0%, 
    rgba(124, 58, 237, 0.25) 50%, 
    rgba(168, 85, 247, 0.25) 100%);
  border: 1px solid rgba(139, 92, 246, 0.4);
  box-shadow: 
    0 4px 16px rgba(139, 92, 246, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.fullscreen-btn .btn-content {
  color: #8b5cf6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.fullscreen-btn:hover .btn-background {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.35) 0%, 
    rgba(124, 58, 237, 0.35) 50%, 
    rgba(168, 85, 247, 0.35) 100%);
  box-shadow: 
    0 6px 20px rgba(139, 92, 246, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.fullscreen-btn.active .btn-background {
  background: linear-gradient(135deg, 
    rgba(139, 92, 246, 0.4) 0%, 
    rgba(124, 58, 237, 0.4) 50%, 
    rgba(168, 85, 247, 0.4) 100%);
  border-color: rgba(139, 92, 246, 0.6);
  box-shadow: 
    0 6px 24px rgba(139, 92, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.clear-btn .btn-background {
  background: linear-gradient(135deg, 
    rgba(240, 147, 251, 0.25) 0%, 
    rgba(236, 72, 153, 0.25) 50%, 
    rgba(251, 113, 133, 0.25) 100%);
  border: 1px solid rgba(240, 147, 251, 0.4);
  box-shadow: 
    0 4px 16px rgba(240, 147, 251, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.clear-btn .btn-content {
  color: #f093fb;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.clear-btn:hover .btn-background {
  background: linear-gradient(135deg, 
    rgba(240, 147, 251, 0.35) 0%, 
    rgba(236, 72, 153, 0.35) 50%, 
    rgba(251, 113, 133, 0.35) 100%);
  box-shadow: 
    0 6px 20px rgba(240, 147, 251, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

/* Enhanced Button Icon Transitions */
.btn-icon-enter-active, .btn-icon-leave-active {
  transition: all 0.3s ease;
}

.btn-icon-enter-from, .btn-icon-leave-to {
  opacity: 0;
  transform: scale(0.8) rotate(45deg);
}

/* Loading Spinner */
.loading-spinner {
  width: 20px;
  height: 20px;
  position: relative;
}

.spinner-ring {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 480px) {
  .voice-fab {
    bottom: 1rem;
    right: 1rem;
    width: 56px;
    height: 56px;
  }
  
  .voice-widget {
    width: calc(100vw - 2rem);
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    max-height: calc(100vh - 2rem);
  }
  
  .central-viz {
    width: 120px;
    height: 120px;
  }
  
  .viz-inner-core {
    width: 70px;
    height: 70px;
  }
  
  .control-buttons {
    gap: 0.75rem;
  }
  
  .control-button {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }
  
  .btn-background,
  .btn-ripple {
    border-radius: 16px;
  }
}

/* Dark Theme Enhancements */
@media (prefers-color-scheme: dark) {
  .voice-widget {
    background: rgba(15, 23, 42, 0.95);
    border-color: rgba(255, 255, 255, 0.1);
  }
  
  .control-btn {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(255, 255, 255, 0.2);
  }
}

/* Accessibility Improvements */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>