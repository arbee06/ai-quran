/**
 * Service for handling OpenAI Realtime API connections using WebRTC directly
 * for voice-based Surah app interaction
 */
class RealtimeApiService {
  constructor() {
    this.peerConnection = null;
    this.dataChannel = null;
    this.audioElement = null;
    this.mediaStream = null;
    this.audioTrack = null;
    this.onMessage = null;
    this.onConnectionStateChange = null;
    this.isConnected = false;
    this.isConnecting = false;
    
    // API key should be stored in environment variables
    this.apiKey = '';
  }

  /**
   * Initialize the WebRTC connection to OpenAI Realtime API
   * @param {Function} onMessage Callback for handling messages from the API
   * @param {Function} onConnectionStateChange Callback for connection state changes
   * @returns {Promise<void>}
   */
  async initialize(onMessage, onConnectionStateChange) {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    this.onMessage = onMessage;
    this.onConnectionStateChange = onConnectionStateChange;
    
    try {
      // Create a peer connection
      this.peerConnection = new RTCPeerConnection();
      
      // Set up the data channel for sending/receiving events
      this.dataChannel = this.peerConnection.createDataChannel("oai-events");
      this.dataChannel.addEventListener("message", this.handleDataChannelMessage.bind(this));
      this.dataChannel.addEventListener("open", () => {
        console.log("Data channel opened");
        this.isConnected = true;
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange("connected");
        }
      });
      
      // Set up to play remote audio from the model
      this.audioElement = document.createElement("audio");
      this.audioElement.autoplay = true;
      
      this.peerConnection.ontrack = (e) => {
        this.audioElement.srcObject = e.streams[0];
      };
      
      // Get user media for microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      
      // Store reference to the audio track for mute/unmute controls
      this.audioTrack = this.mediaStream.getAudioTracks()[0];
      
      // Add local audio track for microphone input
      this.mediaStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.mediaStream);
      });
      
      // Handle connection state changes
      this.peerConnection.onconnectionstatechange = () => {
        console.log("Connection state change:", this.peerConnection.connectionState);
        if (this.onConnectionStateChange) {
          this.onConnectionStateChange(this.peerConnection.connectionState);
        }
        
        if (this.peerConnection.connectionState === "disconnected" || 
            this.peerConnection.connectionState === "failed" ||
            this.peerConnection.connectionState === "closed") {
          this.isConnected = false;
          this.isConnecting = false;
        }
      };
      
      // Create an offer to start the connection
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      
      // Connect to the OpenAI Realtime API
      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/sdp",
          "OpenAI-Beta": "realtime=v1",
        },
      });
      
      if (!sdpResponse.ok) {
        throw new Error(`Failed to connect to OpenAI Realtime API: ${sdpResponse.status} ${sdpResponse.statusText}`);
      }
      
      const answer = {
        type: "answer",
        sdp: await sdpResponse.text(),
      };
      
      await this.peerConnection.setRemoteDescription(answer);
      this.isConnecting = false;
      
      // Send initial session configuration after connection is established
      setTimeout(() => {
        if (this.isConnected) {
          this.updateSession({
            voice: "alloy",
            instructions: "You are an AI assistant for a Quran learning app. Help users understand Surahs, verses, and Islamic teachings. Be respectful and knowledgeable.",
            tools: this.getDefaultTools()
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error("Error connecting to OpenAI Realtime API:", error);
      this.isConnecting = false;
      this.isConnected = false;
      
      if (this.onConnectionStateChange) {
        this.onConnectionStateChange("failed");
      }
      
      // Clean up resources if connection failed
      this.disconnect();
      
      throw error;
    }
  }
  
  /**
   * Get the audio track for microphone control
   * @returns {MediaStreamTrack|null} The audio track
   */
  getAudioTrack() {
    return this.audioTrack;
  }
  
  /**
   * Set API key (use this method to update the API key at runtime)
   * @param {string} key 
   */
  setApiKey(key) {
    this.apiKey = key;
  }
  
  /**
   * Handle messages from the data channel
   * @param {MessageEvent} event 
   */
  handleDataChannelMessage(event) {
    try {
      const data = JSON.parse(event.data);
      if (this.onMessage) {
        this.onMessage(data);
      }
    } catch (error) {
      console.error("Error parsing data channel message:", error);
    }
  }
  
  /**
   * Send a message through the data channel
   * @param {Object} message 
   */
  sendMessage(message) {
    if (!this.dataChannel || this.dataChannel.readyState !== "open") {
      console.error("Data channel not ready");
      return;
    }
    
    try {
      this.dataChannel.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }
  
  /**
   * Update session configuration
   * @param {Object} config 
   */
  updateSession(config) {
    const message = {
      type: "session.update",
      session: {
        ...config,
        tool_choice: "auto"
      }
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Generate response with optional parameters
   * @param {Object} params 
   */
  generateResponse(params = {}) {
    const message = {
      type: "response.create",
      response: {
        ...params,
        tool_choice: "auto"
      }
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Submit function call output
   * @param {string} callId The ID of the function call
   * @param {Object} output The result of the function call
   */
  submitFunctionCallOutput(callId, output) {
    const message = {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify(output)
      }
    };
    
    this.sendMessage(message);
  }
  
  /**
   * Get default function definitions for Surah app
   * @returns {Array} Array of tool definitions
   */
  getDefaultTools() {
    return [
      {
        type: "function",
        name: "get_surah_content",
        description: "Get complete Surah content with verses using the Public Sura API",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            content_type: {
              type: "string",
              description: "Type of content to retrieve",
              enum: ["basic", "tafsir-katheer", "w-moyassar", "tafsir-saadi"],
              default: "basic"
            }
          },
          required: ["surah_number"]
        }
      },
      {
        type: "function",
        name: "get_verse_details",
        description: "Get detailed verse information including Tafsir, I'rab, and more",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number within the Surah"
            },
            include_tafsir: {
              type: "boolean",
              description: "Include Tafsir (interpretation)",
              default: true
            },
            tafsir_type: {
              type: "string",
              description: "Type of Tafsir to include",
              enum: ["tafsir-katheer", "w-moyassar", "tafsir-saadi", "tafsir-tabary"],
              default: "tafsir-katheer"
            },
            include_irab: {
              type: "boolean",
              description: "Include I'rab (grammatical analysis)",
              default: false
            },
            include_reasons: {
              type: "boolean", 
              description: "Include reasons for revelation (Asbab al-Nuzul)",
              default: false
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "get_tafsir",
        description: "Get detailed Tafsir (interpretation) for specific verses",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number"
            },
            tafsir_type: {
              type: "string",
              description: "Type of Tafsir scholar",
              enum: ["tafsir-katheer", "w-moyassar", "tafsir-baghawy", "tafsir-saadi", "tafsir-tabary", "tafsir-mokhtasar"],
              default: "tafsir-katheer"
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "get_word_analysis",
        description: "Get detailed word-by-word analysis of a verse",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number"
            },
            word_number: {
              type: "integer",
              description: "Specific word number (optional, analyzes all words if not provided)"
            },
            analysis_type: {
              type: "string",
              description: "Type of word analysis",
              enum: ["eerab-word-aya", "word-pic"],
              default: "eerab-word-aya"
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "get_reasons_for_revelation",
        description: "Get the historical context and reasons for revelation (Asbab al-Nuzul)",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number"
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "get_tajweed_rules",
        description: "Get Tajweed rules and pronunciation guidance for a verse",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number"
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "get_page_content",
        description: "Get Quran content by page number (Mushaf page)",
        parameters: {
          type: "object",
          properties: {
            page_number: {
              type: "integer",
              description: "Page number in the Mushaf (1-604)"
            },
            content_type: {
              type: "string",
              description: "Type of content",
              enum: ["basic", "tafsir-katheer", "w-moyassar"],
              default: "basic"
            }
          },
          required: ["page_number"]
        }
      },
      {
        type: "function",
        name: "get_multiple_verses",
        description: "Get a range of verses from a Surah",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            from_verse: {
              type: "integer",
              description: "Starting verse number"
            },
            to_verse: {
              type: "integer",
              description: "Ending verse number"
            },
            include_tafsir: {
              type: "boolean",
              description: "Include Tafsir for the verses",
              default: false
            }
          },
          required: ["surah_number", "from_verse", "to_verse"]
        }
      },
      {
        type: "function",
        name: "navigate_to_surah",
        description: "Navigate to a specific Surah in the app",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number to navigate to (1-114)"
            }
          },
          required: ["surah_number"]
        }
      },
      {
        type: "function",
        name: "navigate_to_verse",
        description: "Navigate to a specific verse in the app",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number"
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "navigate_to_page",
        description: "Navigate to a specific page in the Mushaf",
        parameters: {
          type: "object",
          properties: {
            page_number: {
              type: "integer",
              description: "Page number in the Mushaf (1-604)"
            }
          },
          required: ["page_number"]
        }
      },
      {
        type: "function",
        name: "get_available_projects",
        description: "Get list of all available Quranic projects and content types",
        parameters: {
          type: "object",
          properties: {
            project_type: {
              type: "string",
              description: "Filter by project type (optional)"
            }
          }
        }
      },
      {
        type: "function",
        name: "bookmark_verse",
        description: "Bookmark a verse for later reference",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Verse number to bookmark"
            },
            note: {
              type: "string",
              description: "Optional note to add with the bookmark"
            }
          },
          required: ["surah_number", "verse_number"]
        }
      },
      {
        type: "function",
        name: "play_recitation",
        description: "Play audio recitation of a verse or Surah",
        parameters: {
          type: "object",
          properties: {
            surah_number: {
              type: "integer",
              description: "Surah number (1-114)"
            },
            verse_number: {
              type: "integer",
              description: "Specific verse number (optional, plays whole Surah if not provided)"
            },
            reciter: {
              type: "string",
              description: "Reciter key (e.g., 'sudais', 'afasy', 'husary', 'minshawy'). Use get_available_reciters to see all options",
              default: "sudais"
            }
          },
          required: ["surah_number"]
        }
      },
      {
        type: "function",
        name: "pause_recitation",
        description: "Pause the current Quran recitation",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "resume_recitation",
        description: "Resume the paused Quran recitation",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "stop_recitation",
        description: "Stop the current Quran recitation",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "next_verse",
        description: "Play the next verse in the current Surah playlist",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "previous_verse",
        description: "Play the previous verse in the current Surah playlist",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "jump_to_verse",
        description: "Jump to a specific verse in the current Surah playlist",
        parameters: {
          type: "object",
          properties: {
            verse_number: {
              type: "integer",
              description: "Verse number to jump to"
            }
          },
          required: ["verse_number"]
        }
      },
      {
        type: "function",
        name: "get_recitation_status",
        description: "Get the current status of Quran recitation playback",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "set_reciter",
        description: "Change the current reciter for Quran recitation",
        parameters: {
          type: "object",
          properties: {
            reciter: {
              type: "string",
              description: "Reciter key (e.g., 'sudais', 'afasy', 'husary', 'minshawy')"
            }
          },
          required: ["reciter"]
        }
      },
      {
        type: "function",
        name: "get_available_reciters",
        description: "Get list of all available Quran reciters",
        parameters: {
          type: "object",
          properties: {}
        }
      },
      {
        type: "function",
        name: "set_volume",
        description: "Set the volume for Quran recitation (0-100)",
        parameters: {
          type: "object",
          properties: {
            volume: {
              type: "integer",
              description: "Volume level from 0 (mute) to 100 (maximum)",
              minimum: 0,
              maximum: 100
            }
          },
          required: ["volume"]
        }
      },
      {
        type: "function",
        name: "toggle_theme",
        description: "Toggle between light and dark theme",
        parameters: {
          type: "object",
          properties: {}
        }
      }
    ];
  }
  
  /**
   * Disconnect from the OpenAI Realtime API and clean up resources
   */
  disconnect() {
    console.log('Disconnecting from Realtime API...');
    
    // Set flags to prevent any ongoing operations
    this.isConnected = false;
    this.isConnecting = false;
    
    // Stop and remove all media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        console.log('Stopping media track:', track.kind);
        track.stop();
      });
      this.mediaStream = null;
    }
    
    // Clear audio track reference
    this.audioTrack = null;
    
    // Close and cleanup data channel
    if (this.dataChannel) {
      console.log('Closing data channel...');
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    // Cleanup peer connection
    if (this.peerConnection) {
      console.log('Closing peer connection...');
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    // Cleanup audio element
    if (this.audioElement) {
      console.log('Cleaning up audio element...');
      this.audioElement.pause();
      this.audioElement.srcObject = null;
      this.audioElement = null;
    }
    
    // Clear callbacks
    this.onMessage = null;
    this.onConnectionStateChange = null;
    
    console.log('Disconnection complete');
  }
}

export default new RealtimeApiService();