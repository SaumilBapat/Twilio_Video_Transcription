# Real-Time Audio Transcription with Twilio Video and OpenAI's Real-Time API

This project captures real-time audio from participants in a Twilio Video room, streams the audio data to a server via WebSocket, and transcribes it using OpenAI's new real-time API. The transcribed text can be used for live captioning, meeting notes, or any other application requiring real-time speech-to-text conversion.

## Files

### Client-Side

- **`index.html`**: The main HTML file that loads the client application and includes the Twilio Video SDK.
- **`client.js`**: Connects to a Twilio Video room, captures audio tracks from participants, processes the audio data, and sends it to the server using WebSocket.
- **`processor.js`**: An AudioWorklet processor that captures raw audio data from the audio track for real-time processing.

### Server-Side

- **`server.js`**: Sets up a WebSocket server to receive audio data from the client, forwards it to OpenAI's real-time API, and handles the transcription results.
- **`.env`**: A configuration file that stores environment variables like the OpenAI API key (not included in the repository for security reasons).

## Libraries Used

### Client-Side Libraries

- **Twilio Video JavaScript SDK**: Enables connection to Twilio Video rooms and access to media tracks.
- **Web Audio API**: Used to process audio data within the browser.
- **WebSocket API**: Allows real-time communication between the client and server for streaming audio data.

### Server-Side Libraries

- **Node.js**: Server-side JavaScript runtime.
- **ws**: WebSocket library for Node.js.
- **OpenAI's Real-Time API**: Used to transcribe audio data in real time.
- **dotenv**: Loads environment variables from a `.env` file.

## Setup Instructions

1. **Install Dependencies**:

   - Navigate to the server directory and run:

     ```bash
     npm install
     ```

   - Navigate to the client directory and run:

     ```bash
     npm install
     ```

2. **Configure Environment Variables**:

   - In the server directory, create a `.env` file with the following content:

     ```bash
     OPENAI_API_KEY=your_openai_api_key
     ```

     Replace `your_openai_api_key` with your actual OpenAI API key.

3. **Run the Server**:

   - From the server directory, start the server:

     ```bash
     node server.js
     ```

4. **Run the Client**:

   - Serve the client files using a local HTTP server. From the client directory, you can use:

     ```bash
     npm install -g http-server
     http-server
     ```

   - Open your web browser and navigate to `http://localhost:8080`.

5. **Twilio Configuration**:

   - Replace `'YOUR_TWILIO_ACCESS_TOKEN'` in `client.js` with your actual Twilio Access Token:

     ```javascript
     const token = 'YOUR_TWILIO_ACCESS_TOKEN';
     ```

## Usage

- The client connects to a Twilio Video room, captures audio from participants, and streams it to the server.
- The server receives the audio data, forwards it to OpenAI's real-time API, and handles the transcription results.
- Transcriptions are logged in the server console and can be sent back to the client.

## Important Notes

- **Permissions**: Ensure you have consent from all participants before capturing and processing audio.
- **Privacy**: Handle all data according to privacy laws and regulations.
- **Security**: Do not commit the `.env` file or any sensitive information to version control.
- **API Access**: Ensure your OpenAI API key has access to the real-time API features.
