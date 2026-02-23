/**
 * @class SamplePlayerWorklet
 * @extends AudioWorkletProcessor
 * @description An AudioWorklet processor for playing audio samples with ultra-low latency.
 * It receives messages from the main thread to load audio buffers and play them.
 * This processor mixes multiple sound requests in real-time.
 */
class SamplePlayerWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    /**
     * @private
     * @type {Map<string, Float32Array[]>}
     * @description Stores the loaded audio buffers, keyed by sample name.
     */
    this.buffers = new Map();
    /**
     * @private
     * @type {Array<{soundName: string, volume: number, playhead: number}>}
     * @description A queue of active play requests. Each request is an object
     * containing the sound name, volume, and current playhead position.
     */
    this.playRequests = [];
    this.port.onmessage = this.handleMessage.bind(this);
  }

  /**
   * @private
   * @param {MessageEvent} event - The message event from the main thread.
   * @description Handles messages for loading buffers and playing sounds.
   */
  handleMessage(event) {
    const { type, name, buffer, soundName, volume } = event.data;

    if (type === "loadBuffer") {
      this.buffers.set(
        name,
        buffer.map((channel) => new Float32Array(channel))
      );
      this.port.postMessage({ type: "bufferLoaded", name });
    } else if (type === "playSound") {
      if (this.buffers.has(soundName)) {
        this.playRequests.push({
          soundName,
          volume: volume || 1.0,
          playhead: 0,
        });
      }
    }
  }

  /**
   * @public
   * @param {Float32Array[][]} inputs - The input audio buffers.
   * @param {Float32Array[][]} outputs - The output audio buffers to be filled.
   * @returns {boolean} - Returns true to keep the processor alive.
   * @description This is the core processing function of the worklet. It's called
   * repeatedly by the audio engine to fill the output buffers with audio data.
   * It mixes all active play requests into the output buffer.
   */
  process(inputs, outputs) {
    const output = outputs[0];
    const leftChannel = output[0];
    const rightChannel = output.length > 1 ? output[1] : null;

    leftChannel.fill(0);
    if (rightChannel) {
      rightChannel.fill(0);
    }

    for (let i = this.playRequests.length - 1; i >= 0; i--) {
      const request = this.playRequests[i];
      const bufferData = this.buffers.get(request.soundName);

      if (!bufferData) {
        this.playRequests.splice(i, 1);
        continue;
      }

      const sampleBufferLeft = bufferData[0];
      const sampleBufferRight =
        bufferData.length > 1 ? bufferData[1] : sampleBufferLeft;

      let isFinished = true;

      for (let frame = 0; frame < leftChannel.length; frame++) {
        if (request.playhead < sampleBufferLeft.length) {
          leftChannel[frame] +=
            sampleBufferLeft[request.playhead] * request.volume;
          if (rightChannel) {
            rightChannel[frame] +=
              sampleBufferRight[request.playhead] * request.volume;
          }
          request.playhead++;
          isFinished = false;
        }
      }

      if (isFinished) {
        this.playRequests.splice(i, 1);
      }
    }

    return true;
  }
}

registerProcessor("audio-engine-worklet", SamplePlayerWorklet);
