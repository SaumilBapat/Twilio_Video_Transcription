// server.js

const WebSocket = require('ws');
const fs = require('fs');
const wav = require('wav');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Set up WebSocket server
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', ws => {
  console.log('Client connected');
  let audioBuffers = [];

  ws.on('message', async message => {
    // Receive ArrayBuffer and convert it back to Float32Array
    const float32Array = arrayBufferToFloat32(message);
    audioBuffers.push(float32Array);

    // Process audio after collecting enough data
    if (audioBuffers.length >= 50) {
      const audioData = mergeFloat32Arrays(audioBuffers);
      audioBuffers = []; // Reset for the next batch

      // Save audio data as a WAV file
      const wavBuffer = float32ToWav(audioData);
      fs.writeFileSync('audio.wav', wavBuffer);

      // Send the audio file to OpenAI for transcription
      try {
        const response = await openai.createTranscription(
          fs.createReadStream('audio.wav'),
          'whisper-1'
        );
        console.log('Transcription:', response.data.text);
      } catch (err) {
        console.error('Error during transcription:', err.response ? err.response.data : err.message);
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Helper functions
function arrayBufferToFloat32(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  const float32Array = new Float32Array(arrayBuffer.byteLength / 4);
  for (let i = 0; i < float32Array.length; i++) {
    float32Array[i] = dataView.getFloat32(i * 4, true);
  }
  return float32Array;
}

function mergeFloat32Arrays(arrays) {
  let totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  let result = new Float32Array(totalLength);
  let offset = 0;
  arrays.forEach(arr => {
    result.set(arr, offset);
    offset += arr.length;
  });
  return result;
}

function float32ToWav(float32Array) {
  const buffer = Buffer.alloc(44 + float32Array.length * 2);
  // Write WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + float32Array.length * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 for PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels
  buffer.writeUInt32LE(48000, 24); // SampleRate
  buffer.writeUInt32LE(48000 * 2, 28); // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(2, 32);  // BlockAlign (NumChannels * BitsPerSample/8)
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(float32Array.length * 2, 40); // Subchunk2Size

  // Write PCM data
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7FFF, 44 + i * 2);
  }

  return buffer;
}
