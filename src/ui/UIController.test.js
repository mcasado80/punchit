import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { UIController } from "./UIController.js";
import { EventManager } from "../core/EventManager.js";
import { samples } from "../config/AppConfig.js";

// Mock the global AudioContext
global.AudioContext = vi.fn(() => ({
  decodeAudioData: vi.fn(),
  createGain: vi.fn(() => ({
    connect: vi.fn(),
    gain: { value: 1 },
  })),
  destination: {},
  currentTime: 0,
}));

describe("UIController", () => {
  let eventManager;
  let audioContext;

  beforeEach(() => {
    // Set up the basic HTML structure UIController expects
    document.body.innerHTML = `
      <div class="container">
        <header>
          <h1>PunchiTouch</h1>
        </header>
        <main class="app">
          <div class="pads-container"></div>
          <div class="beatbox-pads-container" style="display: none;">
            ${Array(6)
              .fill(0)
              .map(
                (_, i) =>
                  `<div class="beatbox-pad" data-pad-id="${i}"><div class="pad-inner"></div></div>`
              )
              .join("")}
          </div>
        </main>
        <div class="controls-section">
          <button id="loop-mode-btn"></button>
          <button id="bank-toggle-btn"></button>
          <div class="loop-controls-container">
            <div id="analog-knob"><div class="knob-indicator"></div></div>
            <input type="range" id="bpm-slider" min="60" max="180" value="120" />
            <span id="bpm-value">120</span>
            <button id="beat-length-btn"></button>
            <button id="stop-all-loops-btn"></button>
          </div>
        </div>
        <div id="beatbox-modal" class="modal">
          <div class="modal-content">
            <span class="close-button"></span>
            <div class="file-input-container">
              <input type="file" id="audio-file-input" />
            </div>
            <div class="modal-buttons">
              <button id="record-toggle-btn"></button>
              <button id="delete-sample-btn"></button>
            </div>
          </div>
        </div>
      </div>
    `;
    eventManager = new EventManager();
    audioContext = new global.AudioContext();
  });

  afterEach(() => {
    // Clean up the DOM
    document.body.innerHTML = "";
    vi.clearAllMocks();
  });

  it("should initialize without errors and find all required DOM elements", () => {
    const ui = new UIController(eventManager, audioContext);
    // The test will throw if init() fails, so no explicit expect is needed
    // for the error check.
    expect(() => ui.init()).not.toThrow();
  });

  it("should create the correct number of pads during initialization", () => {
    const ui = new UIController(eventManager, audioContext);
    ui.init();
    const padElements = document.querySelectorAll(".pads-container .pad");
    expect(padElements.length).toBe(samples.length);
  });
});
