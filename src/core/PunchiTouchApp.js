/**
 * @file PunchiTouchApp.js
 * @description The main application class.
 * This class acts as the central controller, orchestrating the UI, audio,
 * and state management components. It listens for UI events and translates
 * them into actions and state changes.
 */

import { UIController } from "../ui/UIController.js";
import { eventManager } from "./EventManager.js";
import { AUDIO_CONFIG } from "../config/AppConfig.js";

export class PunchiTouchApp {
  constructor(audioEngine) {
    this.ui = new UIController(eventManager, audioEngine.context);
    this.audioEngine = audioEngine;
    this.state = {
      bpm: AUDIO_CONFIG.BPM_DEFAULT,
      beats: AUDIO_CONFIG.BEATS_DEFAULT,
      isLoopMode: false,
      isBeatboxMode: false,
      activeLoops: new Map(), // Map<sampleName, Set<beat>>
      activeBeatboxLoops: new Map(), // Map<padId, Set<beat>>
      beatboxSamples: new Map(), // Map<padId, AudioBuffer>
      currentBeat: 0,
      isPlaying: false,
    };
    this.animationFrameId = null;
  }

  /**
   * Initializes the application, assigns DOM elements, and sets up event listeners.
   */
  init() {
    try {
      this.ui.init(); // This will assign elements, apply colors, and set up UI listeners
      this.setupEventListeners(); // Subscribes the app logic to UI events
      this.ui.updateBPMDisplay(this.state.bpm);
      this.ui.updateBeatsDisplay(this.state.beats);
      this.updateLogoAnimationSpeed(this.state.bpm); // Initial sync
    } catch (error) {
      console.error("Failed to initialize PunchiTouchApp:", error);
    }
  }

  /**
   * Subscribes to events from the event manager.
   */
  setupEventListeners() {
    eventManager.on("padPressed", (data) => this.onPadPressed(data));
    eventManager.on("subPadPressed", (data) => this.onSubPadPressed(data));
    eventManager.on("loopModeToggled", () => this.onToggleLoopMode());
    eventManager.on("stopAllLoops", () => this.onStopAllLoops());
    eventManager.on("bpmChanged", (data) => this.onBPMChanged(data));
    eventManager.on("beatsChanged", (data) => this.onBeatsChanged(data));
    eventManager.on("bankToggled", () => this.onBankToggled());
    eventManager.on("beatboxSampleLoaded", (data) =>
      this.onBeatboxSampleLoaded(data)
    );
    eventManager.on("beatboxSampleDeleted", (data) =>
      this.onBeatboxSampleDeleted(data)
    );
  }

  // --- Event Handlers ---

  onPadPressed(data) {
    if (this.state.isBeatboxMode) {
      const padId = data.padId;
      if (this.state.beatboxSamples.has(padId)) {
        this.audioEngine.playSoundFromBuffer(
          this.state.beatboxSamples.get(padId)
        );
        this.ui.visualController.triggerPadVisualFeedback(padId, true);
      }
    } else {
      this.ui.visualController.triggerPadVisualFeedback(data.sampleName);
      this.audioEngine.playSound(data.sampleName);
    }
  }

  onSubPadPressed(data) {
    if (!this.state.isLoopMode) return;
    const { identifier, beat, isActive, isBeatbox } = data;
    if (isBeatbox) {
      if (!this.state.activeBeatboxLoops.has(identifier)) {
        this.state.activeBeatboxLoops.set(identifier, new Set());
      }
      const activeBeats = this.state.activeBeatboxLoops.get(identifier);
      if (isActive) {
        activeBeats.add(beat);
      } else {
        activeBeats.delete(beat);
      }
      this.ui.visualController.updatePadLoopVisuals(
        identifier,
        activeBeats,
        true
      );
    } else {
      const sampleName = identifier;
      if (!this.state.activeLoops.has(sampleName)) {
        this.state.activeLoops.set(sampleName, new Set());
      }
      const activeBeats = this.state.activeLoops.get(sampleName);
      if (isActive) {
        activeBeats.add(beat);
      } else {
        activeBeats.delete(beat);
      }
      this.ui.visualController.updatePadLoopVisuals(
        sampleName,
        activeBeats,
        false
      );
    }
  }

  onBeatboxSampleLoaded(data) {
    const { padId, buffer } = data;
    this.state.beatboxSamples.set(padId, buffer);
    this.ui.padController.markBeatboxPadAsLoaded(padId);
  }

  onBeatboxSampleDeleted(data) {
    const { padId } = data;
    if (this.state.beatboxSamples.has(padId)) {
      this.state.beatboxSamples.delete(padId);
      this.state.activeBeatboxLoops.delete(padId);
      this.ui.padController.markBeatboxPadAsUnloaded(padId);
      this.ui.visualController.updatePadLoopVisuals(padId, new Set(), true);
    }
  }

  onBankToggled() {
    this.state.isBeatboxMode = !this.state.isBeatboxMode;
    this.ui.visualController.updateBankVisuals(this.state.isBeatboxMode);
    if (this.state.isLoopMode) {
      this.ui.visualController.toggleLoopModeVisuals(true);
      if (this.state.isBeatboxMode) {
        for (const [padId, activeBeats] of this.state.activeBeatboxLoops) {
          this.ui.visualController.updatePadLoopVisuals(
            padId,
            activeBeats,
            true
          );
        }
      } else {
        for (const [sampleName, activeBeats] of this.state.activeLoops) {
          this.ui.visualController.updatePadLoopVisuals(
            sampleName,
            activeBeats,
            false
          );
        }
      }
    }
  }

  onToggleLoopMode() {
    if (this.state.isLoopMode) {
      this.onStopAllLoops();
    } else {
      this.state.isLoopMode = true;
      this.ui.visualController.toggleLoopModeVisuals(true);
      this.startSequencer();
    }
  }

  onStopAllLoops() {
    this.stopSequencer();

    this.state.activeLoops.clear();
    this.state.activeBeatboxLoops.clear();
    this.state.isLoopMode = false;

    this.ui.visualController.toggleLoopModeVisuals(false);
    this.ui.visualController.resetAllLoopVisuals();
  }

  onBPMChanged(newBPM) {
    this.state.bpm = Number(newBPM);
    this.updateLogoAnimationSpeed(this.state.bpm);
  }

  onBeatsChanged(data) {
    const { newBeats } = data;
    this.state.beats = newBeats;
    this.ui.updateBeatsDisplay(this.state.beats);
    this.ui.padController.updatePadsLayout(this.state.beats);

    // After layout change, re-apply loop visuals to restore state
    if (this.state.isLoopMode) {
      this.state.activeLoops.forEach((activeBeats, sampleName) => {
        this.ui.visualController.updatePadLoopVisuals(
          sampleName,
          activeBeats,
          false
        );
      });
      this.state.activeBeatboxLoops.forEach((activeBeats, padId) => {
        this.ui.visualController.updatePadLoopVisuals(padId, activeBeats, true);
      });
    }
  }

  updateLogoAnimationSpeed(bpm) {
    const h1 = document.querySelector("header h1");
    if (h1) {
      // Calculate duration: higher BPM = faster animation
      // The formula is arbitrary, adjust for feel.
      // Let's say at 120 BPM the duration is 4 seconds.
      const animationDuration = (120 / bpm) * 4;
      h1.style.animationDuration = `${animationDuration.toFixed(2)}s`;
    }
  }

  // --- Sequencer Logic ---

  startSequencer() {
    if (this.state.isPlaying) return;
    this.state.isPlaying = true;
    this.tick();
  }

  stopSequencer() {
    this.state.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.ui.visualController.updateCurrentBeatIndicator(-1); // Turn off all beat indicators
  }

  tick() {
    if (!this.state.isPlaying) return;

    const currentTime = this.audioEngine.context.currentTime;
    const beatInterval =
      60 / this.state.bpm / AUDIO_CONFIG.LOOP_TIMING_ADJUSTMENT_FACTOR;
    const barLength = beatInterval * this.state.beats;
    const currentBeat = Math.floor((currentTime % barLength) / beatInterval);

    if (currentBeat !== this.state.currentBeat) {
      this.state.currentBeat = currentBeat;
      this.ui.visualController.updateCurrentBeatIndicator(currentBeat);
      this.playActiveBeats(currentBeat);
    }

    this.animationFrameId = requestAnimationFrame(() => this.tick());
  }

  playActiveBeats(beat) {
    for (const [sampleName, activeBeats] of this.state.activeLoops.entries()) {
      if (activeBeats.has(beat)) {
        this.audioEngine.playSound(sampleName);
        this.ui.visualController.triggerPadVisualFeedback(sampleName);
      }
    }

    for (const [
      padId,
      activeBeats,
    ] of this.state.activeBeatboxLoops.entries()) {
      if (activeBeats.has(beat)) {
        if (this.state.beatboxSamples.has(padId)) {
          this.audioEngine.playSoundFromBuffer(
            this.state.beatboxSamples.get(padId)
          );
          this.ui.visualController.triggerPadVisualFeedback(padId, true);
        }
      }
    }
  }

}
