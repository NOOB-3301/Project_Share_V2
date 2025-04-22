# PeerLink - P2P File Sharing & Video Calls

### The hosted url is [PeerLink](https://project-share-v2.vercel.app/)
PeerLink is a modern web application that enables secure peer-to-peer file sharing and video calls using WebRTC technology. Built with Next.js and Firebase, it offers a seamless experience for real-time communication and file transfer without server intermediaries.



## 🚀 Features

- **P2P File Sharing**
  - Direct peer-to-peer file transfer
  - Stream-based transfer for large files
  - Progress tracking for uploads/downloads
  - No file size limits
  - Efficient memory usage with chunks

- **Video Calls**
  - HD video and audio calls
  - Screen sharing capability
  - Camera/microphone controls
  - Fullscreen mode
  - Real-time chat during calls

- **Real-time Chat**
  - Draggable chat window
  - Instant messaging
  - Timestamp display
  - Message history

## 🔧 Technical Architecture

### WebRTC Implementation
The application uses WebRTC for peer-to-peer connections:
- Establishes data channels for file transfer and chat
- Uses STUN servers for NAT traversal
- Handles ICE candidates for connection establishment
- Manages media streams for video/audio

### File Transfer Mechanism
- Uses `streamsaver` for efficient file handling
- Implements chunk-based streaming (216KB chunks)
- Handles backpressure for large files
- Progress tracking for both sender and receiver

### Firebase Integration
Firebase Firestore is used for:
- Signaling server for WebRTC
- Storing and exchanging ICE candidates
- Managing call metadata
- Temporary storage of connection information

## 📁 Project Structure

```
app/
├── components/
│   ├── LandingPage/    # Landing page components
│   ├── SharePage/      # File sharing components
│   └── Navbar.tsx      # Navigation component
├── video/              # Video call implementation
├── share/              # File sharing implementation
├── groupchat/          # Group chat feature
└── firebase.ts         # Firebase configuration
```

## 🛣️ Routes

- `/` - Landing page
- `/share` - File sharing interface
- `/video` - Video call interface
- `/groupchat` - Group chat interface (in development)

## 💡 How It Works

### File Sharing
1. Sender creates a WebRTC offer
2. Connection established via Firebase signaling
3. File is read as a stream
4. Data is chunked and sent through WebRTC data channel
5. Receiver saves chunks using streamsaver
6. Progress is tracked in real-time

### Video Calls
1. Local media stream is acquired
2. WebRTC peer connection is established
3. Video/audio tracks are exchanged
4. Additional data channel for chat is created
5. Real-time communication begins

## 🔒 Security

- End-to-end encryption via WebRTC
- Direct P2P connections
- No server storage of files
- Secure signaling through Firebase

## 🚀 Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Set up Firebase:
   - Create a Firebase project
   - Add your Firebase config to `firebase.ts`

4. Run the development server:
```bash
npm run dev
```

## 💻 Technical Requirements

- Modern web browser with WebRTC support
- Node.js 16+
- Firebase account

## 📝 Notes

- The application uses stream-based file transfer instead of loading entire files into memory, making it suitable for transferring large files
- Firebase is used only for signaling; all data transfers are peer-to-peer
- The project uses Next.js 15.3.1 with the new app router
