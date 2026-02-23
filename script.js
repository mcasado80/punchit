/**
 * @file script.js
 * @description Main entry point for the PunchiTouch application.
 * This script handles the initial setup and launches the main application
 * after the user interacts with the start button.
 */

import { PunchiTouchApp } from "./src/core/PunchiTouchApp.js";
import { initializeNativeAudio } from "./native-audio-init.js";
import { createStartButton, showFatalError } from "./src/ui/utils.js";

/**
 * Main initialization logic.
 * This function sets up the audio engine and the main application.
 */
async function main() {
  console.log("Application entry point: Waiting for user interaction.");

  createStartButton(async () => {
    try {
      console.log("User interaction detected. Initializing application...");

      // Lock screen orientation to portrait
      try {
        if (
          screen.orientation &&
          typeof screen.orientation.lock === "function"
        ) {
          await screen.orientation.lock("portrait-primary");
          console.log("Screen orientation locked to portrait.");
        }
      } catch (err) {
        console.warn("Could not lock screen orientation:", err);
      }

      // Initialize the native audio engine first.
      // It's crucial this is done after a user gesture.
      const audioEngine = await initializeNativeAudio();
      console.log("Native AudioEngine initialized successfully.");

      // Now, initialize the main application logic, passing the engine to it.
      const app = new PunchiTouchApp(audioEngine);
      app.init(); // This will set up UI controllers and their listeners

      console.log("PunchiTouch is ready to use!");
    } catch (error) {
      console.error("Fatal error during application initialization:", error);
      showFatalError(
        "Could not initialize the application. Please try refreshing the page."
      );
    }
  });
}

// Start the application process once the DOM is fully loaded.
document.addEventListener("DOMContentLoaded", main);
