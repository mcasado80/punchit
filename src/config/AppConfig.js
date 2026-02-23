/**
 * @file AppConfig.js
 * @description Centralized application configuration.
 * This file consolidates settings for audio, UI, and application behavior
 * to provide a single source of truth and facilitate easier updates.
 */

// Audio processing and timing settings
export const AUDIO_CONFIG = {
  BPM_MIN: 60,
  BPM_MAX: 180,
  BPM_DEFAULT: 120,
  BEATS_DEFAULT: 4,
  BEATS_OPTIONS: [4, 8, 16],
  // Time in seconds to prevent rapid-fire re-triggering of the same sound
  MIN_TRIGGER_INTERVAL: 0.05,
  // A factor to adjust the perceived speed of the loop to feel more natural.
  // Values > 1 are faster, < 1 are slower. 1.67 seems to be a sweet spot.
  LOOP_TIMING_ADJUSTMENT_FACTOR: 1.67,
  // Canonical volume map for each sample
  VOLUME_MAP: {
    kick: 1.8,
    snare: 1.4,
    crash: 1.2,
    clap: 1.3,
    hihat: 1.6,
    scratch: 1.8,
  },
};

// UI and visual feedback settings
export const UI_CONFIG = {
  // Duration in ms for the visual feedback on a pad after being triggered
  PAD_FEEDBACK_DURATION: 350,
  // Duration in ms for a press to be considered a "long press"
  LONG_PRESS_DURATION: 500,
  // Sensitivity factor for the analog knob control
  KNOB_SENSITIVITY: 0.5,
  // Defines the color for each pad. Used to set CSS variables.
  PAD_COLORS: {
    kick: "#FF7F50", // Coral
    snare: "#40E0D0", // Turquoise
    crash: "#98FB98", // PaleGreen
    clap: "#FFD700", // Gold
    hihat: "#DA70D6", // Orchid
    scratch: "#FF4500", // OrangeRed, for the scratch sound.
  },
};

/**
 * A pure function to lighten a hex color by a given percentage.
 * Exported for testing purposes.
 * @param {string} hex - The hex color string (e.g., '#FF7F50').
 * @param {number} percent - The percentage to lighten (e.g., 15).
 * @returns {string} The new, lightened hex color string.
 */
export const lightenColor = (hex, percent) => {
  const num = parseInt(hex.slice(1), 16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    G = ((num >> 8) & 0x00ff) + amt,
    B = (num & 0x0000ff) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
};

/**
 * Derived array of sample configurations for the UI.
 * Combines pad color settings with computed hover/active states.
 */
export const samples = Object.keys(UI_CONFIG.PAD_COLORS).map((key) => {
  const color = UI_CONFIG.PAD_COLORS[key];
  return {
    name: key,
    color: color,
    hoverColor: lightenColor(color, 15),
    activeColor: lightenColor(color, 30),
  };
});

// Beatbox pad colors (A "Dusty Pastel" version of the main palette)
export const beatboxSamples = [
  {
    id: "0",
    name: "beatbox-1",
    color: "#ff2e63",
    activeColor: "#ff5e9c",
    hoverColor: "#ff7ebc",
  },
  {
    id: "1",
    name: "beatbox-2",
    color: "#08d9d6",
    activeColor: "#00f2e9",
    hoverColor: "#3ff6f3",
  },
  {
    id: "2",
    name: "beatbox-3",
    color: "#f9ed69",
    activeColor: "#fff86b",
    hoverColor: "#fff9a3",
  },
  {
    id: "3",
    name: "beatbox-4",
    color: "#6a4cff",
    activeColor: "#8c6cff",
    hoverColor: "#b3a1ff",
  },
  {
    id: "4",
    name: "beatbox-5",
    color: "#43e97b",
    activeColor: "#6fffa3",
    hoverColor: "#a3ffcb",
  },
  {
    id: "5",
    name: "beatbox-6",
    color: "#ff6f3c",
    activeColor: "#ff914d",
    hoverColor: "#ffb88c",
  },
];
