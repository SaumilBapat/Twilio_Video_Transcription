// server.js

const WebSocket = require('ws');
const fs = require('fs');
require('dotenv').config();

// OpenAI WebSocket URL and headers
const openaiUrl = 'wss://api.openai.com/v1/realtime?model=whisper-1';
const openaiHeaders = {
  'Authorization': 'Bearer ' + process.env.OPENAI_API_KEY,
  'OpenAI-Beta': 'realtime=v1',
};

// Set up WebSocket server for clients
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', clientWs => {
  console.log('Client connected');

  // Connect to OpenAI's real-time API
  const openaiWs = new WebSocket(openaiUrl, { headers: openaiHeaders });

  openaiWs.on('open', () => {
    console.log('Connected to OpenAI real-time API');

    // Start a new transcription session
    openaiWs.send(JSON.stringify({
      type: 'response.create',
      response: {
        modalities: ['text'],
        instructions: 'Transcribe the audio stream in real-time.',
      },
    }));
  });

  openaiWs.on('message', message => {
    const data = JSON.parse(message.toString());

    // Handle transcription results
    if (data.type === 'response.result') {
      const transcription = data.payload.text;
      console.log('Transcription:', transcription);

      // Optionally, send transcription back to the client or process further
      clientWs.send(JSON.stringify({ transcription }));
    }
  });

  openaiWs.on('error', error => {
    console.error('Error with OpenAI WebSocket:', error);
  });

  clientWs.on('message', message => {
    // Forward audio data received from the client to OpenAI
    openaiWs.send(JSON.stringify({
      type: 'request.audio',
      audio: {
        content: message.toString('base64'),
        encoding: 'pcm_f32le', // Assuming 32-bit float PCM
        sample_rate: 48000,
      },
    }));
  });

  clientWs.on('close', () => {
    console.log('Client disconnected');
    openaiWs.close();
  });
});
