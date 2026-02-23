/**
 * SamplePlayer - System for playing samples with ultra low latency
 */
import kickPath from "../assets/samples/kick.wav";
import snarePath from "../assets/samples/snare.wav";
import clapPath from "../assets/samples/clap.wav";
import crashPath from "../assets/samples/crash.wav";
import hihatPath from "../assets/samples/hat.wav";
import scratchPath from "../assets/samples/scratch.wav";

export class SamplePlayer {
  constructor(context, workletNode) {
    this.context = context;
    this.workletNode = workletNode;
    this.buffers = new Map();
    this.isReady = false;
    this.samplePaths = {
      kick: kickPath,
      snare: snarePath,
      clap: clapPath,
      crash: crashPath,
      hihat: hihatPath,
      scratch: scratchPath,
    };
  }

  /**
   * Preload all buffers in parallel
   */
  async preloadBuffers() {
    try {
      const loadPromises = Object.entries(this.samplePaths).map(
        ([name, path]) => this._loadAndProcessBuffer(name, path)
      );

      await Promise.all(loadPromises);
      this.isReady = true;
    } catch (error) {
      console.error("Error preloading buffers:", error);
      throw error;
    }
  }

  /**
   * Load and process an individual buffer
   */
  async _loadAndProcessBuffer(name, path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer);

      // Convert AudioBuffer to arrays for the worklet
      const channelData = [];
      for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
        channelData.push(audioBuffer.getChannelData(channel));
      }

      // Store locally
      this.buffers.set(name, audioBuffer);

      // Send to worklet
      if (this.workletNode) {
        this.workletNode.port.postMessage({
          type: "loadBuffer",
          name: name,
          buffer: channelData,
        });
      }
    } catch (error) {
      console.error(`Error loading buffer ${name}:`, error);
      throw error;
    }
  }

  /**
   * Get a buffer by name
   */
  getBuffer(soundName) {
    return this.buffers.get(soundName);
  }

  isBufferReady(soundName) {
    return this.buffers.has(soundName);
  }

  /**
   * Play a sample via the worklet
   */
  play(soundName, volume = 1.0) {
    if (!this.workletNode) {
      console.warn("Worklet not available for playback");
      return;
    }

    this.workletNode.port.postMessage({
      type: "playSound",
      soundName: soundName,
      volume: volume,
    });
  }
}
