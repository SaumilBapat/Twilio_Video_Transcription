// client.js

// Include Twilio Video JavaScript SDK in your HTML file
// <script src="https://sdk.twilio.com/js/video/releases/2.22.0/twilio-video.min.js"></script>

// Replace with your actual Twilio Access Token
const token = 'YOUR_TWILIO_ACCESS_TOKEN';

// Open WebSocket connection to the server
const socket = new WebSocket('ws://localhost:8080');

// Connect to a Twilio Video room
Twilio.Video.connect(token, { name: 'my-room' }).then(room => {
  console.log(`Connected to Room: ${room.name}`);

  // Handle existing participants
  room.participants.forEach(participant => {
    handleParticipant(participant);
  });

  // Handle new participants joining
  room.on('participantConnected', participant => {
    handleParticipant(participant);
  });
});

function handleParticipant(participant) {
  console.log(`Participant "${participant.identity}" connected`);

  participant.tracks.forEach(publication => {
    if (publication.isSubscribed) {
      if (publication.track.kind === 'audio') {
        processAudioTrack(publication.track);
      }
    }
  });

  participant.on('trackSubscribed', track => {
    if (track.kind === 'audio') {
      processAudioTrack(track);
    }
  });
}

function processAudioTrack(audioTrack) {
  // Create an AudioContext
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();

  // Create a MediaStream from the audio track
  const mediaStream = new MediaStream([audioTrack.mediaStreamTrack]);

  // Create a MediaStreamSource from the MediaStream
  const source = audioContext.createMediaStreamSource(mediaStream);

  // Use AudioWorklet to process audio data
  audioContext.audioWorklet.addModule('processor.js').then(() => {
    const processor = new AudioWorkletNode(audioContext, 'audio-processor');

    source.connect(processor);
    processor.connect(audioContext.destination);

    // Send audio data to the server
    processor.port.onmessage = event => {
      const audioData = event.data;
      // Send raw Float32Array buffer to the server
      socket.send(audioData);
    };

    // Handle transcription messages from the server
    socket.onmessage = event => {
      const data = JSON.parse(event.data);
      if (data.transcription) {
        console.log('Transcription:', data.transcription);
        // Display transcription in the UI as needed
      }
    };
  });
}
