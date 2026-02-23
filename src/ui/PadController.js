import { triggerHapticFeedback } from "./utils.js";
import { samples, beatboxSamples } from "../config/AppConfig.js";

export class PadController {
  constructor(eventManager) {
    this.eventManager = eventManager;
    this.longPressDuration = 500;
    this.longPressTimer = null;
    this.currentBeatboxPad = null;
  }

  /**
   * Initializes required DOM references and creates pads.
   * @param {Object} domRefs - References to DOM elements
   */
  init(domRefs) {
    this.padContainer = domRefs.padContainer;
    this.beatboxPadsContainer = domRefs.beatboxPadsContainer;
    this._createPads();
    this._createBeatboxPads();
  }

  /**
   * Updates the layout of all pads to reflect a new number of beats.
   * @param {number} beats - The new number of beats (e.g., 4, 8, 16).
   */
  updatePadsLayout(beats) {
    const allPads = [
      ...this.padContainer.querySelectorAll(".pad"),
      ...this.beatboxPadsContainer.querySelectorAll(".pad.beatbox-pad"),
    ];
    allPads.forEach((pad) => {
      const padInner = pad.querySelector(".pad-inner");
      if (!padInner) return;

      const identifier = pad.dataset.sample || pad.dataset.padId || "unknown";
      const isBeatbox = pad.classList.contains("beatbox-pad");

      // Determine the active sub-pads before clearing
      const activeBeats = new Set();
      padInner.querySelectorAll(".sub-pad.active").forEach((activeSubPad) => {
        activeBeats.add(parseInt(activeSubPad.dataset.beat, 10));
      });

      padInner.innerHTML = "";

      const columns = 4;
      const numRows = Math.ceil(beats / columns);
      padInner.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      padInner.style.gridTemplateRows = `repeat(${numRows}, 1fr)`;

      if (numRows > 1) {
        const subPadHeight = 45; // Estimated height for a sub-pad row
        const gap = 4; // The gap between rows
        const newHeight = numRows * subPadHeight + (numRows - 1) * gap;
        padInner.style.height = `${newHeight}px`;
      } else {
        padInner.style.height = "50px"; // Default height for a single row
      }

      for (let i = 0; i < beats; i++) {
        const subPad = this._createSubPad(identifier, i, isBeatbox);
        if (activeBeats.has(i)) {
          subPad.classList.add("active");
        }
        padInner.appendChild(subPad);
      }
    });
  }

  /**
   * Creates main pads from configuration.
   */
  _createPads() {
    this.padContainer.innerHTML = "";
    samples.forEach((sample) => {
      const pad = this._createPad(sample);
      this.padContainer.appendChild(pad);
    });
  }

  /**
   * Creates beatbox pads from configuration.
   */
  _createBeatboxPads() {
    this.beatboxPadsContainer.innerHTML = "";
    beatboxSamples.forEach((padConfig) => {
      const pad = this._createPad(padConfig, true);
      this.beatboxPadsContainer.appendChild(pad);
    });
  }

  /**
   * Creates a single pad element.
   * @param {object} sample - Pad configuration.
   * @param {boolean} isBeatbox - If it is a beatbox pad.
   */
  _createPad(sample, isBeatbox = false) {
    const padElement = document.createElement("div");
    padElement.className = isBeatbox ? "pad beatbox-pad" : "pad";
    padElement.dataset.sample = sample.name;
    if (isBeatbox) padElement.dataset.padId = sample.id;
    if (!isBeatbox) {
      padElement.style.setProperty("--pad-color", sample.color);
      padElement.style.setProperty("--pad-active-color", sample.activeColor);
      padElement.style.setProperty("--pad-hover-color", sample.hoverColor);
    } else {
      padElement.style.setProperty("--pad-color", "#333");
      padElement.style.setProperty("--pad-active-color", "#444");
      padElement.style.setProperty("--pad-hover-color", "#555");
    }

    const padInner = document.createElement("div");
    padInner.className = "pad-inner";
    for (let i = 0; i < 4; i++) {
      const subPad = this._createSubPad(
        isBeatbox ? String(sample.id) : sample.name,
        i,
        isBeatbox
      );
      padInner.appendChild(subPad);
    }
    padElement.appendChild(padInner);

    // Visual cues
    const visualCues = document.createElement("div");
    visualCues.className = "pad-visual-cues";
    padElement.appendChild(visualCues);

    // Events
    let touchStarted = false;
    let longPressTimer = null;
    padElement.addEventListener(
      "touchstart",
      (e) => {
        touchStarted = true;
        if (e.target.closest(".sub-pad")) return;
        if (e.cancelable) e.preventDefault();
        if (isBeatbox && padElement.classList.contains("loaded")) {
          longPressTimer = setTimeout(() => {
            if (this.onBeatboxPadLongPress) {
              this.onBeatboxPadLongPress(padElement.dataset.padId);
            }
          }, this.longPressDuration);
        }
        this._handlePadPress(e, sample.name, isBeatbox);
      },
      { passive: false }
    );
    padElement.addEventListener("touchend", () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    });
    padElement.addEventListener("mousedown", (e) => {
      if (isBeatbox && padElement.classList.contains("loaded")) {
        longPressTimer = setTimeout(() => {
          if (this.onBeatboxPadLongPress) {
            this.onBeatboxPadLongPress(padElement.dataset.padId);
          }
        }, this.longPressDuration);
      }
    });
    padElement.addEventListener("mouseup", () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    });
    padElement.addEventListener("mouseleave", () => {
      if (longPressTimer) clearTimeout(longPressTimer);
    });
    padElement.addEventListener("click", (e) => {
      if (touchStarted) {
        touchStarted = false;
        return;
      }
      if (e.target.closest(".sub-pad")) return;
      if (isBeatbox && !padElement.classList.contains("loaded")) {
        if (this.onBeatboxPadLongPress) {
          this.onBeatboxPadLongPress(padElement.dataset.padId);
        }
        return;
      }
      this._handlePadPress(e, sample.name, isBeatbox);
    });
    return padElement;
  }

  /**
   * Creates a sub-pad for the sequencer.
   */
  _createSubPad(identifier, beat, isBeatbox = false) {
    const subPad = document.createElement("div");
    subPad.className = "sub-pad";
    subPad.dataset.beat = beat;
    subPad.addEventListener("click", (e) => {
      this._handleSubPadPress(e, identifier, beat, isBeatbox);
    });
    return subPad;
  }

  /**
   * Handles a press event on a main pad.
   */
  _handlePadPress(event, sampleName, isBeatbox) {
    triggerHapticFeedback();
    const pad = event.currentTarget;
    if (isBeatbox) {
      const padId = pad.dataset.padId;
      this.eventManager.emit("padPressed", { padId });
    } else {
      this.eventManager.emit("padPressed", { sampleName });
    }
  }

  /**
   * Handles a press event on a sub-pad.
   */
  _handleSubPadPress(event, identifier, beat, isBeatbox) {
    event.target.classList.toggle("active");
    const isActive = event.target.classList.contains("active");
    this.eventManager.emit("subPadPressed", {
      identifier,
      beat,
      isActive,
      isBeatbox,
    });
  }

  /**
   * Marks a beatbox pad as loaded (with a sample).
   * @param {string} padId - The ID of the beatbox pad.
   */
  markBeatboxPadAsLoaded(padId) {
    const pad = this.beatboxPadsContainer.querySelector(
      `.pad.beatbox-pad[data-pad-id="${padId}"]`
    );
    if (pad) {
      pad.classList.add("loaded");
      // Set real colors from config for this specific pad
      const sample = beatboxSamples.find((s) => String(s.id) === String(padId));
      if (sample) {
        pad.style.setProperty("--pad-color", sample.color);
        pad.style.setProperty("--pad-active-color", sample.activeColor);
        pad.style.setProperty("--pad-hover-color", sample.hoverColor);
        pad.offsetHeight;
      }
    }
  }

  /**
   * Marks a beatbox pad as unloaded (no sample).
   * @param {string} padId - The ID of the beatbox pad.
   */
  markBeatboxPadAsUnloaded(padId) {
    const pad = this.beatboxPadsContainer.querySelector(
      `.pad.beatbox-pad[data-pad-id="${padId}"]`
    );
    if (pad) {
      pad.classList.remove("loaded");
      pad.style.setProperty("--pad-color", "#333");
      pad.style.setProperty("--pad-active-color", "#444");
      pad.style.setProperty("--pad-hover-color", "#555");
    }
  }

  /**
   * Creates a single pad element for a given sample.
   * @param {object} sample - The sample configuration object.
   * @returns {HTMLElement} The created pad element.
   */
  createPad(sample) {
    return this._createPad(sample, false);
  }

  /**
   * Creates a single sequencer sub-pad element.
   * @param {string} identifier - The sample name or pad ID for which to create the sub-pad.
   * @param {number} beat - The beat number (0-indexed).
   * @param {boolean} [isBeatbox=false] - Whether this sub-pad belongs to a beatbox pad.
   * @returns {HTMLElement} The created sub-pad element.
   */
  createSubPad(identifier, beat, isBeatbox = false) {
    return this._createSubPad(identifier, beat, isBeatbox);
  }

  setOnBeatboxPadLongPress(callback) {
    this.onBeatboxPadLongPress = callback;
  }
}
