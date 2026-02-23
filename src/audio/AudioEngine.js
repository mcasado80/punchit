/**
 * PunchiTouch Native Audio Engine
 * Native audio engine with ultra-low latency using Web Audio API
 */

import { SamplePlayer } from "./SamplePlayer.js";
import { AUDIO_CONFIG } from "../config/AppConfig.js";

export class AudioEngine {
  constructor() {
    this.context = null;
    this.masterGain = null;
    this.samplePlayer = null;
    this.workletNode = null;
    this.isInitialized = false;
    this.bpm = 120;
  }

  /**
   * Initializes the AudioEngine, sets up the AudioContext, and loads the audio worklet.
   * This method must be called in response to a user gesture (e.g., a click).
   * @async
   * @throws {Error} If the AudioContext or AudioWorklet cannot be initialized.
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      const contextOptions = {
        latencyHint: "interactive",
        sampleRate: 48000,
      };

      if ("audioWorklet" in AudioContext.prototype) {
        contextOptions.latencyHint = 0.001;
      }

      this.context = new (window.AudioContext || window.webkitAudioContext)(
        contextOptions
      );

      if (this.context.audioWorklet) {
        try {
          if (this.context.destination.channelCount) {
            this.context.destination.channelCount = 2;
          }
        } catch (e) {
          console.warn("Could not set destination channel count:", e);
        }
      }

      // Configure master gain
      this.masterGain = this.context.createGain();
      this.masterGain.connect(this.context.destination);
      this.masterGain.gain.value = 0.9;

      // Load AudioWorklet
      const workletURL = new URL("./audio-engine-worklet.js", import.meta.url)
        .href;
      await this.context.audioWorklet.addModule(workletURL);

      // Create worklet node with minimum buffer
      this.workletNode = new AudioWorkletNode(
        this.context,
        "audio-engine-worklet",
        {
          numberOfInputs: 0,
          numberOfOutputs: 1,
          outputChannelCount: [2],
          processorOptions: {
            bufferSize: 128,
            sampleRate: 48000,
          },
        }
      );

      this.workletNode.connect(this.context.destination);

      // Initialize sample player with worklet
      this.samplePlayer = new SamplePlayer(this.context, this.workletNode);
      await this.samplePlayer.preloadBuffers();

      // Force context to "running" immediately
      if (this.context.state === "suspended") {
        await this.context.resume();
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Error initializing AudioEngine:", error);
      this.isInitialized = false;
      this.workletNode = null;
      throw error;
    }
  }

  /**
   * Returns the underlying AudioContext.
   * @returns {AudioContext} The global audio context.
   */
  getContext() {
    return this.context;
  }

  /**
   * Returns the master gain node, which acts as the main output.
   * @returns {GainNode} The master gain node.
   */
  getDestination() {
    return this.masterGain;
  }

  /**
   * Plays a pre-loaded sound sample via the audio worklet for minimal latency.
   * @param {string} soundName - The name of the sample to play (e.g., 'kick', 'snare').
   * @param {number} [time=0] - The future time at which to play the sound (in seconds).
   */
  playSound(soundName, time = 0) {
    if (!this.isInitialized || !this.workletNode) {
      console.warn("AudioEngine not initialized or worklet not available");
      return;
    }

    try {
      const volume = AUDIO_CONFIG.VOLUME_MAP[soundName] || 1.2;

      this.workletNode.port.postMessage({
        type: "playSound",
        soundName: soundName,
        volume: volume,
        timestamp: this.context.currentTime + (time || 0),
      });
    } catch (error) {
      console.error(`Error playing ${soundName}:`, error);
    }
  }

  /**
   * Plays a sound directly from an AudioBuffer. Used for dynamic samples like beatbox recordings.
   * @param {AudioBuffer} buffer - The AudioBuffer to play.
   */
  playSoundFromBuffer(buffer) {
    if (!this.isInitialized) {
      console.warn("AudioEngine not initialized.");
      return;
    }
    try {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(this.masterGain);
      source.start(0);
    } catch (error) {
      console.error("Error playing buffer:", error);
    }
  }

  /**
   * Sets the transport's tempo.
   * @param {number} bpm - The new Beats Per Minute value.
   */
  setBPM(bpm) {
    this.bpm = Math.max(40, Math.min(180, bpm));
  }

  /**
   * Gets the current transport tempo.
   * @returns {number} The current BPM value.
   */
  getBPM() {
    return this.bpm;
  }

  // --- AudioContext Management ---

  /**
   * Cleans up all audio resources and closes the AudioContext.
   * @async
   */
  async dispose() {
    if (!this.isInitialized) return;

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }
    if (this.masterGain) {
      this.masterGain.disconnect();
      this.masterGain = null;
    }
    if (this.context && this.context.state !== "closed") {
      await this.context.close();
    }

    this.samplePlayer = null;
    this.isInitialized = false;
  }

  /**
   * Suspends the audio context, saving power.
   * @async
   */
  async suspend() {
    if (this.context && this.context.state === "running") {
      await this.context.suspend();
    }
  }

  /**
   * Resumes a suspended audio context.
   * @async
   */
  async resume() {
    if (this.context && this.context.state === "suspended") {
      await this.context.resume();
    }
  }
}
