/**
 * @file VisualController.js
 * @description Handles all visual update logic for the UI.
 * Responsible for updating visual elements such as BPM, beats, loop indicators, etc.
 */
import { ICONS } from "./icons.js";
import { UI_CONFIG } from "../config/AppConfig.js";

export class VisualController {
  /**
   * Constructs the VisualController instance.
   * @param {import('../core/EventManager.js').EventManager} eventManager - The application's event manager.
   */
  constructor(eventManager) {
    this.eventManager = eventManager;
  }

  /**
   * Initializes required DOM references.
   * @param {Object} domRefs - References to required DOM elements.
   */
  init(domRefs) {
    this.bpmDisplay = domRefs.bpmDisplay;
    this.knobIndicator = domRefs.knobIndicator;
    this.beatsToggleButton = domRefs.beatsToggleButton;
    this.loopModeButton = domRefs.loopModeButton;
    this.bankToggleButton = domRefs.bankToggleButton;
    this.loopControlsContainer = domRefs.loopControlsContainer;
    this.padContainer = domRefs.padContainer;
    this.h1Element = domRefs.h1Element;
    this.bpmSlider = domRefs.bpmSlider;
    this.beatboxPadsContainer = domRefs.beatboxPadsContainer;
  }

  /**
   * Updates the BPM display.
   * @param {number} bpm - The BPM value to display.
   */
  updateBPMDisplay(bpm) {
    const bpmValue = Math.round(bpm);
    this.bpmDisplay.textContent = bpmValue;

    // Rotate the knob indicator
    const minBPM = parseInt(this.bpmSlider.min, 10);
    const maxBPM = parseInt(this.bpmSlider.max, 10);
    const range = maxBPM - minBPM;
    const percentage = (bpmValue - minBPM) / range;
    const rotation = -135 + percentage * 270; // -135 to +135 degrees
    this.knobIndicator.style.transform = `rotate(${rotation}deg)`;

    // Update H1 gradient animation speed
    if (this.h1Element && bpmValue > 0) {
      // One animation cycle per 2-beat measure
      const animationDuration = (60 / bpmValue) * 2;
      this.h1Element.style.animationDuration = `${animationDuration}s`;
    }
  }

  /**
   * Updates the beats display.
   * @param {number} beats - The number of beats to display (4, 8, or 16).
   */
  updateBeatsDisplay(beats) {
    // Update the icon based on the beat count
    switch (beats) {
      case 4:
        this.beatsToggleButton.innerHTML = ICONS.BEAT_LENGTH_4;
        break;
      case 8:
        this.beatsToggleButton.innerHTML = ICONS.BEAT_LENGTH_8;
        break;
      case 16:
        this.beatsToggleButton.innerHTML = ICONS.BEAT_LENGTH_16;
        break;
    }
  }

  /**
   * Updates the visual elements for loop mode.
   * @param {boolean} isLoopMode - Whether loop mode is active.
   */
  toggleLoopModeVisuals(isLoopMode) {
    document.body.classList.toggle("loop-mode", isLoopMode);
    this.loopModeButton.classList.toggle("active", isLoopMode);

    // Toggle visibility of loop controls container (knob, etc.)
    if (isLoopMode) {
      this.loopControlsContainer.style.display = "flex";
      // Force a reflow to ensure the 'display' change is applied before the transition starts
      void this.loopControlsContainer.offsetWidth;
      this.loopControlsContainer.style.visibility = "visible";
      this.loopControlsContainer.style.opacity = "1";
    } else {
      this.loopControlsContainer.style.opacity = "0";
      this.loopControlsContainer.style.visibility = "hidden";
    }

    // Toggle visibility of sequencer sub-pads
    const allPads = this._getAllPads();
    allPads.forEach((pad) => {
      const padInner = pad.querySelector(".pad-inner");
      if (!padInner) return;

      if (isLoopMode) {
        // In beatbox mode, only show sequencer if a sample is loaded.
        if (
          pad.classList.contains("beatbox-pad") &&
          !pad.classList.contains("loaded")
        ) {
          return;
        }
        padInner.style.visibility = "visible";
        padInner.style.opacity = "1";
      } else {
        padInner.style.visibility = "hidden";
        padInner.style.opacity = "0";
      }
    });

    if (!isLoopMode) {
      this.resetAllLoopVisuals();
    }
  }

  /**
   * Updates the visual elements for bank switching.
   * @param {boolean} isBeatboxMode - Whether beatbox mode is active.
   */
  updateBankVisuals(isBeatboxMode) {
    // When in beatbox mode, show the "previous" icon to go back.
    // When in sample mode, show the "next" icon to go forward.
    this.bankToggleButton.innerHTML = isBeatboxMode
      ? ICONS.PREVIOUS_BANK
      : ICONS.NEXT_BANK;
    this.bankToggleButton.classList.toggle("active", isBeatboxMode);

    if (isBeatboxMode) {
      this.padContainer.style.display = "none";
      this.beatboxPadsContainer.style.display = "grid";
      document.body.classList.add("beatbox-mode");
    } else {
      this.padContainer.style.display = "grid";
      this.beatboxPadsContainer.style.display = "none";
      document.body.classList.remove("beatbox-mode");
    }
  }

  /**
   * Resets all loop visual indicators.
   */
  resetAllLoopVisuals() {
    this._getAllPads().forEach((pad) => {
      pad.classList.remove("pad-is-looping");
      const subPads = pad.querySelectorAll(".sub-pad");
      subPads.forEach((subPad) => subPad.classList.remove("active"));
    });
  }

  /**
   * Updates the current beat indicator.
   * @param {number} beat - The current beat index.
   */
  updateCurrentBeatIndicator(beat) {
    // Clear previous beat indicators, but respect user's active selections
    const allSubPads = document.querySelectorAll(".sub-pad");
    allSubPads.forEach((sp) => {
      if (!sp.classList.contains("active")) {
        sp.classList.remove("current-beat");
      }
    });

    if (beat === -1) return; // Sequencer stopped

    // Highlight the current beat on all visible sub-pads
    const currentSubPads = document.querySelectorAll(
      `.pad-inner[style*="visible"] .sub-pad[data-beat="${beat}"]`
    );
    currentSubPads.forEach((sp) => sp.classList.add("current-beat"));

    // Also update the beat length button visualizer
    const indicators =
      this.beatsToggleButton.querySelectorAll(".beat-indicator");
    if (indicators.length > 0) {
      indicators.forEach((indicator, index) => {
        indicator.classList.toggle("active", index === beat);
      });
    }
  }

  /**
   * Updates the loop visuals for a specific pad.
   * @param {string} identifier - The pad identifier.
   * @param {number[]} activeBeats - Array of active beat indices.
   * @param {boolean} isBeatbox - Whether the pad is a beatbox pad.
   */
  updatePadLoopVisuals(identifier, activeBeats, isBeatbox = false) {
    const selector = isBeatbox
      ? `[data-pad-id="${identifier}"]`
      : `[data-sample="${identifier}"]`;
    const container = isBeatbox ? this.beatboxPadsContainer : this.padContainer;
    const pad = container.querySelector(selector);

    if (pad) {
      const subPads = pad.querySelectorAll(".sub-pad");
      subPads.forEach((subPad) => {
        const beat = parseInt(subPad.dataset.beat, 10);
        if (activeBeats.has(beat)) {
          subPad.classList.add("active");
        } else {
          subPad.classList.remove("active");
        }
      });

      if (activeBeats.size > 0) {
        pad.classList.add("pad-is-looping");
      } else {
        pad.classList.remove("pad-is-looping");
      }
    }
  }

  /**
   * Triggers a brief visual pulse animation on a pad.
   * @param {string} sampleNameOrPadId - The identifier of the pad to activate.
   * @param {boolean} [isBeatbox=false] - True if the pad is a beatbox pad.
   */
  triggerPadVisualFeedback(sampleNameOrPadId, isBeatbox = false) {
    const { padContainer, beatboxPadsContainer } = this;
    const duration = UI_CONFIG.PAD_FEEDBACK_DURATION || 350;
    const padElement = isBeatbox
      ? beatboxPadsContainer.querySelector(
          `.pad.beatbox-pad[data-pad-id="${sampleNameOrPadId}"]`
        )
      : padContainer.querySelector(`.pad[data-sample="${sampleNameOrPadId}"]`);
    if (padElement) {
      padElement.classList.add("active");
      setTimeout(() => {
        padElement.classList.remove("active");
      }, duration);
    }
  }

  _getAllPads() {
    return [
      ...this.padContainer.querySelectorAll(".pad"),
      ...this.beatboxPadsContainer.querySelectorAll(".beatbox-pad"),
    ];
  }
}
