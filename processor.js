// processor.js

class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input.length > 0) {
        const channelData = input[0]; // Get data from the first channel
  
        // Send the Float32Array to the main thread
        this.port.postMessage(channelData);
      }
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  