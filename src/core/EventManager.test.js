import { describe, it, expect, vi } from "vitest";
import { EventManager } from "./EventManager";

describe("EventManager", () => {
  it("should register an event listener and call it on emit", () => {
    const eventManager = new EventManager();
    const callback = vi.fn(); // Mock function

    eventManager.on("testEvent", callback);
    eventManager.emit("testEvent", { data: "test" });

    expect(callback).toHaveBeenCalled();
  });

  it("should pass data to the event listener", () => {
    const eventManager = new EventManager();
    const callback = vi.fn();
    const eventData = { message: "Hello, World!" };

    eventManager.on("dataEvent", callback);
    eventManager.emit("dataEvent", eventData);

    expect(callback).toHaveBeenCalledWith(eventData);
  });

  it("should not call a listener for a different event", () => {
    const eventManager = new EventManager();
    const callback = vi.fn();

    eventManager.on("firstEvent", callback);
    eventManager.emit("secondEvent");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should handle multiple listeners for the same event", () => {
    const eventManager = new EventManager();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    eventManager.on("multiple", callback1);
    eventManager.on("multiple", callback2);
    eventManager.emit("multiple");

    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it("should subscribe to an event and call the callback on emit", () => {
    const eventManager = new EventManager();
    const callback = vi.fn(); // Vitest spy function
    const eventData = { message: "hello" };

    eventManager.on("test-event", callback);
    eventManager.emit("test-event", eventData);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(eventData);
  });

  it("should call multiple callbacks for the same event", () => {
    const eventManager = new EventManager();
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    eventManager.on("multi-event", callback1);
    eventManager.on("multi-event", callback2);
    eventManager.emit("multi-event");

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("should not call a callback after it has been unsubscribed", () => {
    const eventManager = new EventManager();
    const callback = vi.fn();

    eventManager.on("off-event", callback);
    eventManager.off("off-event", callback);
    eventManager.emit("off-event");

    expect(callback).not.toHaveBeenCalled();
  });

  it("should only unsubscribe the specified callback", () => {
    const eventManager = new EventManager();
    const callbackToKeep = vi.fn();
    const callbackToRemove = vi.fn();

    eventManager.on("selective-off", callbackToKeep);
    eventManager.on("selective-off", callbackToRemove);
    eventManager.off("selective-off", callbackToRemove);
    eventManager.emit("selective-off");

    expect(callbackToKeep).toHaveBeenCalledTimes(1);
    expect(callbackToRemove).not.toHaveBeenCalled();
  });

  it("should not fail when emitting an event with no subscribers", () => {
    const eventManager = new EventManager();
    // This should execute without throwing an error
    expect(() => eventManager.emit("no-subscriber-event")).not.toThrow();
  });
});
