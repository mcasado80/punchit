/**
 * @file src/ui/utils.js
 * @description UI utility functions.
 */

/**
 * Displays a prominent error message in the UI.
 * @param {string} message - The error message to display.
 */
export function showFatalError(message) {
  const errorContainer = document.createElement("div");
  errorContainer.id = "fatal-error";
  errorContainer.textContent = `Error: ${message}`;
  document.body.appendChild(errorContainer);
}

/**
 * Creates and displays a start button to capture the initial user gesture,
 * which is required by modern browsers to enable audio.
 * @param {Function} onStart - The callback function to execute when the button is clicked.
 */
export function createStartButton(onStart) {
  const startButton = document.createElement("button");
  startButton.id = "start-button";
  startButton.innerHTML = '<div class="play-icon"></div>';

  startButton.addEventListener(
    "click",
    () => {
      onStart();
      startButton.remove();
    },
    { once: true }
  );

  document.body.appendChild(startButton);
}

/**
 * Triggers a short haptic feedback vibration, if supported by the browser.
 * @param {number} duration - The duration of the vibration in milliseconds.
 */
export function triggerHapticFeedback(duration = 5) {
  if (
    typeof window !== "undefined" &&
    "vibrate" in window.navigator &&
    window.navigator.vibrate
  ) {
    try {
      window.navigator.vibrate(duration);
    } catch (e) {
      // Could fail if duration is too long on some devices
      console.warn("Haptic feedback failed.", e);
    }
  }
}
