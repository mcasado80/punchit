/**
 * @file EventManager.js
 * @description A simple pub/sub event manager for decoupled communication.
 * This allows different modules to interact without direct dependencies,
 * promoting a more modular and maintainable architecture.
 */

export class EventManager {
  constructor() {
    this.listeners = {};
  }

  /**
   * Subscribes a callback function to a specific event.
   * @param {string} eventName - The name of the event to subscribe to.
   * @param {Function} callback - The function to execute when the event is triggered.
   */
  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  /**
   * Triggers an event, executing all subscribed callbacks with the provided data.
   * @param {string} eventName - The name of the event to trigger.
   * @param {*} data - The data to pass to the event callbacks.
   */
  emit(eventName, data) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for '${eventName}':`, error);
        }
      });
    }
  }

  /**
   * Unsubscribes a callback function from a specific event.
   * @param {string} eventName - The name of the event to unsubscribe from.
   * @param {Function} callback - The specific callback to remove.
   */
  off(eventName, callback) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter(
        (cb) => cb !== callback
      );
    }
  }
}

// Export a single instance to be used throughout the application (Singleton pattern)
export const eventManager = new EventManager();
