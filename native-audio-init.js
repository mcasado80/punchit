/**
 * Native Audio Initialization
 * Script to initialize the native audio engine
 */

import { AudioEngine } from "./src/audio/AudioEngine.js";

let audioEngine = null;
let isInitialized = false;

/**
 * Initialize the native audio engine.
 */
export async function initializeNativeAudio() {
  if (isInitialized && audioEngine) {
    console.log("Native audio engine already initialized");
    return audioEngine;
  }

  try {
    audioEngine = new AudioEngine();
    await audioEngine.initialize();

    isInitialized = true;
    console.log("Native audio engine initialized with samples");
    return audioEngine;
  } catch (error) {
    console.error("Error initializing native audio engine:", error);
    isInitialized = false;
    audioEngine = null;
    throw error;
  }
}
