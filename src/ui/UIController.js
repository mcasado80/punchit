/**
 * @file UIController.js
 * @description Manages all DOM interactions, event listeners, and UI updates.
 * This module is responsible for the 'View' part of the application,
 * keeping DOM manipulation separate from the core application logic.
 */
import { AUDIO_CONFIG } from "../config/AppConfig.js";
import { ICONS } from "./icons.js";
import { VisualController } from "./VisualController.js";
import { PadController } from "./PadController.js";

export class UIController {
  /**
   * Constructs the UIController instance.
   * @param {import('../core/EventManager.js').EventManager} eventManager - The application's event manager.
   * @param {AudioContext} audioContext - The global AudioContext.
   */
  constructor(eventManager, audioContext) {
    this.eventManager = eventManager;
    this.audioContext = audioContext;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.mediaStream = null;
    this.currentBeatIndex = 0;
    this.isRecordingBusy = false;
    this.tapTimeout = null;
    this.isDraggingKnob = false;
    this.currentBeatboxPadId = null;
    this.visualController = new VisualController(eventManager);
    this.padController = new PadController(eventManager);
    this.padController.setOnBeatboxPadLongPress((padId) => {
      this.currentBeatboxPadId = padId;
      const pad = this.beatboxPadsContainer.querySelector(
        `.pad.beatbox-pad[data-pad-id="${padId}"]`
      );
      if (pad) {
        this.deleteSampleButton.style.display = pad.classList.contains("loaded")
          ? "inline-block"
          : "none";
        this._openModal();
      }
    });
  }

  /**
   * Initializes the UI by querying DOM elements, setting up initial state,
   * and attaching event listeners.
   * @throws {Error} If a required DOM element is not found.
   */
  init() {
    // DOM element references
    this.padContainer = document.querySelector(".pads-container");
    this.bpmSlider = document.getElementById("bpm-slider");
    this.bpmDisplay = document.getElementById("bpm-value");
    this.analogKnob = document.getElementById("analog-knob");
    this.knobIndicator = document.querySelector(".knob-indicator");
    this.loopModeButton = document.getElementById("loop-mode-btn");
    this.stopAllLoopsButton = document.getElementById("stop-all-loops-btn");
    this.bankToggleButton = document.getElementById("bank-toggle-btn");
    this.beatsToggleButton = document.getElementById("beat-length-btn");
    this.beatboxPadsContainer = document.querySelector(
      ".beatbox-pads-container"
    );
    this.modal = document.getElementById("beatbox-modal");
    this.closeButton = document.querySelector(".close-button");
    this.audioFileInput = document.getElementById("audio-file-input");
    this.recordToggleButton = document.getElementById("record-toggle-btn");
    this.fileInputContainer = document.querySelector(".file-input-container");
    this.deleteSampleButton = document.getElementById("delete-sample-btn");
    this.h1Element = document.querySelector("header h1");
    this.loopControlsContainer = document.querySelector(
      ".loop-controls-container"
    );

    // Simple validation
    const requiredElements = [
      { name: "padContainer", element: this.padContainer },
      { name: "bpmSlider", element: this.bpmSlider },
      { name: "bpmDisplay", element: this.bpmDisplay },
      { name: "analogKnob", element: this.analogKnob },
      { name: "loopModeButton", element: this.loopModeButton },
      { name: "stopAllLoopsButton", element: this.stopAllLoopsButton },
      { name: "bankToggleButton", element: this.bankToggleButton },
      { name: "beatsToggleButton", element: this.beatsToggleButton },
      { name: "beatboxPadsContainer", element: this.beatboxPadsContainer },
      { name: "modal", element: this.modal },
      { name: "closeButton", element: this.closeButton },
      { name: "audioFileInput", element: this.audioFileInput },
      { name: "recordToggleButton", element: this.recordToggleButton },
      { name: "fileInputContainer", element: this.fileInputContainer },
      { name: "deleteSampleButton", element: this.deleteSampleButton },
    ];

    for (const { name, element } of requiredElements) {
      if (!element) {
        throw new Error(
          `UIController: Required DOM element not found: ${name}`
        );
      }
    }

    const initialBeatIndex = AUDIO_CONFIG.BEATS_OPTIONS.indexOf(
      AUDIO_CONFIG.BEATS_DEFAULT
    );
    this.currentBeatIndex = initialBeatIndex > -1 ? initialBeatIndex : 0;

    this._loadButtonIcons();

    // Initialize PadController first (creates DOM pads)
    this.padController.init({
      padContainer: this.padContainer,
      beatboxPadsContainer: this.beatboxPadsContainer,
    });

    // Initialize VisualController with DOM refs
    this.visualController.init({
      bpmDisplay: this.bpmDisplay,
      knobIndicator: this.knobIndicator,
      beatsToggleButton: this.beatsToggleButton,
      loopModeButton: this.loopModeButton,
      bankToggleButton: this.bankToggleButton,
      loopControlsContainer: this.loopControlsContainer,
      padContainer: this.padContainer,
      h1Element: this.h1Element,
      bpmSlider: this.bpmSlider,
      beatboxPadsContainer: this.beatboxPadsContainer,
    });

    this._setupEventListeners();
  }

  /**
   * Loads SVG icons into the control buttons.
   * @private
   */
  _loadButtonIcons() {
    this.loopModeButton.innerHTML = ICONS.LOOP_MODE;
    this.bankToggleButton.innerHTML = ICONS.NEXT_BANK;
    this.beatsToggleButton.innerHTML = ICONS.BEAT_LENGTH_4;
    this.stopAllLoopsButton.innerHTML = ICONS.STOP_ALL;
    this.deleteSampleButton.innerHTML = ICONS.TRASH;
  }

  /**
   * Sets up all initial event listeners for UI elements.
   * @private
   */
  _setupEventListeners() {
    this.bpmSlider.addEventListener("input", (e) => this._handleBPMChange(e));
    this.loopModeButton.addEventListener("click", () => this._toggleLoopMode());
    this.stopAllLoopsButton.addEventListener("click", () =>
      this._handleStopAllLoops()
    );
    this.bankToggleButton.addEventListener("click", () =>
      this._handleBankToggle()
    );
    this.beatsToggleButton.addEventListener("click", () =>
      this._handleBeatsToggle()
    );

    this.closeButton.addEventListener("click", () => this._closeModal());
    window.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this._closeModal();
      }
    });
    this.deleteSampleButton.addEventListener("click", () =>
      this._handleDeleteSample()
    );
    this.fileInputContainer.addEventListener("click", () => {
      this.audioFileInput.click();
    });

    this.audioFileInput.addEventListener("change", (e) =>
      this._handleFileInput(e)
    );
    this.recordToggleButton.addEventListener("click", () =>
      this._handleRecordToggle()
    );
    this.analogKnob.addEventListener(
      "mousedown",
      (e) => this._handleKnobInteractionStart(e),
      { passive: false }
    );
    this.analogKnob.addEventListener(
      "touchstart",
      (e) => this._handleKnobInteractionStart(e),
      { passive: false }
    );
    // Custom double-tap/double-click handler
    this.analogKnob.addEventListener("click", (e) => {
      if (this.isDraggingKnob) {
        return;
      }
      if (this.tapTimeout) {
        clearTimeout(this.tapTimeout);
        this.tapTimeout = null;
        this._handleKnobDoubleClick();
      } else {
        this.tapTimeout = setTimeout(() => {
          this.tapTimeout = null;
        }, 300);
      }
    });

    // Handle overflow for loop controls animation
    this.loopControlsContainer.addEventListener("transitionend", () => {
      if (document.body.classList.contains("loop-mode")) {
        this.loopControlsContainer.style.overflow = "visible";
      } else {
        this.loopControlsContainer.style.overflow = "";
      }
    });
  }

  /**
   * Initiates the drag interaction for the analog knob.
   * @param {MouseEvent|TouchEvent} e - The mouse or touch event.
   * @private
   */
  _handleKnobInteractionStart(e) {
    this.isDraggingKnob = false;
    const knob = this.analogKnob;
    const slider = this.bpmSlider;
    const min = parseInt(slider.min, 10);
    const max = parseInt(slider.max, 10);

    const isTouchEvent = e.type.startsWith("touch");
    const startY = isTouchEvent ? e.touches[0].clientY : e.clientY;
    const startValue = parseInt(slider.value, 10);

    const handleInteractionMove = (moveEvent) => {
      moveEvent.preventDefault();
      this.isDraggingKnob = true;
      const moveY = isTouchEvent
        ? moveEvent.touches[0].clientY
        : moveEvent.clientY;
      const dy = startY - moveY;
      const sensitivity = 0.5;
      let newValue = startValue + dy * sensitivity;

      newValue = Math.max(min, Math.min(max, newValue));

      slider.value = newValue;
      this.updateBPMDisplay(newValue);

      const event = new Event("input", { bubbles: true });
      slider.dispatchEvent(event);
    };

    const handleInteractionEnd = () => {
      if (isTouchEvent) {
        document.removeEventListener("touchmove", handleInteractionMove);
        document.removeEventListener("touchend", handleInteractionEnd);
      } else {
        document.removeEventListener("mousemove", handleInteractionMove);
        document.removeEventListener("mouseup", handleInteractionEnd);
      }
      knob.classList.remove("active");
    };

    if (isTouchEvent) {
      document.addEventListener("touchmove", handleInteractionMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleInteractionEnd);
    } else {
      document.addEventListener("mousemove", handleInteractionMove);
      document.addEventListener("mouseup", handleInteractionEnd);
    }
    knob.classList.add("active");
  }

  /**
   * Resets the BPM to its default value when the knob is double-clicked.
   * @private
   */
  _handleKnobDoubleClick() {
    this.bpmSlider.value = AUDIO_CONFIG.BPM_DEFAULT;

    const event = new Event("input", { bubbles: true });
    this.bpmSlider.dispatchEvent(event);
  }

  /**
   * Handles BPM changes from the slider.
   * @param {Event} event - The input event from the slider.
   * @private
   */
  _handleBPMChange(event) {
    const newBPM = Number(event.target.value);
    this.updateBPMDisplay(newBPM);
    this.eventManager.emit("bpmChanged", newBPM);
  }

  /**
   * Toggles through the available beat lengths for loops.
   * @private
   */
  _handleBeatsToggle() {
    const options = AUDIO_CONFIG.BEATS_OPTIONS;
    this.currentBeatIndex = (this.currentBeatIndex + 1) % options.length;
    const nextBeats = options[this.currentBeatIndex];
    this.eventManager.emit("beatsChanged", { newBeats: nextBeats });
  }

  /**
   * Emits an event to toggle loop mode.
   * @private
   */
  _toggleLoopMode() {
    this.eventManager.emit("loopModeToggled");
  }

  /**
   * Emits an event to stop all active loops.
   * @private
   */
  _handleStopAllLoops() {
    this.eventManager.emit("stopAllLoops");
  }

  /**
   * Emits an event to toggle between sample banks.
   * @private
   */
  _handleBankToggle() {
    this.eventManager.emit("bankToggled");
  }

  /**
   * Opens the beatbox modal dialog.
   * @private
   */
  _openModal() {
    if (this.modal && this.currentBeatboxPadId) {
      const isLoaded = this.beatboxPadsContainer
        .querySelector(
          `.beatbox-pad[data-pad-id="${this.currentBeatboxPadId}"]`
        )
        .classList.contains("loaded");

      this.deleteSampleButton.style.display = isLoaded ? "flex" : "none";
      this.modal.style.display = "flex";
    } else {
      console.error("Modal or currentBeatboxPadId not set.");
    }
  }

  /**
   * Closes the beatbox modal dialog.
   * @private
   */
  _closeModal() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this._stopRecording();
    }
    this.modal.style.display = "none";
    this.currentBeatboxPadId = null;
  }

  /**
   * Updates the BPM display and the rotation of the analog knob indicator.
   * @param {number} bpm - The new BPM value.
   */
  updateBPMDisplay(bpm) {
    this.visualController.updateBPMDisplay(bpm);
  }

  /**
   * Updates the display of the beat length button.
   * @param {number} beats - The new number of beats.
   */
  updateBeatsDisplay(beats) {
    this.visualController.updateBeatsDisplay(beats);
  }

  /**
   * Handles the file input change event for loading a custom sample.
   * @param {Event} event - The file input change event.
   * @private
   */
  async _handleFileInput(event) {
    const file = event.target.files[0];
    if (!file || !this.currentBeatboxPadId) return;

    const arrayBuffer = await file.arrayBuffer();
    try {
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const padId = this.currentBeatboxPadId;
      this.eventManager.emit("beatboxSampleLoaded", {
        padId,
        buffer: audioBuffer,
      });
      this.padController.markBeatboxPadAsLoaded(padId);
    } catch (error) {
      console.error("Error decoding audio file:", error);
      alert(
        "Failed to load audio file. Please ensure it's a valid, non-corrupted audio file."
      );
    } finally {
      this.audioFileInput.value = null;
      this.currentBeatboxPadId = null;
      this._closeModal();
    }
  }

  /**
   * Handles the click on the record button to toggle microphone recording.
   * @private
   */
  _handleRecordToggle() {
    if (this.isRecordingBusy) {
      return;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this._stopRecording();
    } else {
      this._startRecording();
    }
  }

  /**
   * Starts recording audio from the user's microphone.
   * @private
   */
  async _startRecording() {
    if (!this.currentBeatboxPadId) return;
    this.isRecordingBusy = true;

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        this.mediaStream = stream;
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
          this.recordedChunks.push(event.data);
        };
        this.mediaRecorder.onstop = async () => {
          try {
            const blob = new Blob(this.recordedChunks, {
              type: "audio/webm;codecs=opus",
            });
            const arrayBuffer = await blob.arrayBuffer();
            const audioBuffer =
              await this.audioContext.decodeAudioData(arrayBuffer);
            const padId = this.currentBeatboxPadId;
            this.eventManager.emit("beatboxSampleLoaded", {
              padId,
              buffer: audioBuffer,
            });
            this.padController.markBeatboxPadAsLoaded(padId);
          } catch (error) {
            console.error("Error processing recorded audio:", error);
            alert("Failed to process recorded audio. Please try again.");
          } finally {
            this.recordedChunks = [];
            this._closeModal();
          }
        };
        this.mediaRecorder.start();
        this.recordToggleButton.classList.add("recording");
      } catch (error) {
        console.error("Error accessing microphone:", error);
        alert(
          "Could not access the microphone. Please check browser permissions."
        );
        this._closeModal();
        this.currentBeatboxPadId = null;
      } finally {
        this.isRecordingBusy = false;
      }
    } else {
      alert("Your browser does not support microphone recording.");
      this._closeModal();
      this.currentBeatboxPadId = null;
      this.isRecordingBusy = false;
    }
  }

  /**
   * Stops the microphone recording and processes the recorded audio.
   * @private
   */
  _stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      this.mediaRecorder.stop();
      this.recordToggleButton.classList.remove("recording");
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }
    this.mediaRecorder = null;
  }

  _handleDeleteSample() {
    if (this.currentBeatboxPadId) {
      const padId = this.currentBeatboxPadId;
      this.eventManager.emit("beatboxSampleDeleted", { padId });
      this._closeModal();
      this.padController.markBeatboxPadAsUnloaded(padId);
    }
  }
}
