// processor.js

class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
      const input = inputs[0];
      if (input && input[0]) {
        const channelData = input[0];
  
        // Post the audio data to the main thread
        this.port.postMessage(channelData.slice(0)); // Send a copy of the buffer
      }
      return true;
    }
  }
  
  registerProcessor('audio-processor', AudioProcessor);
  