
# **Spider Web Application**

Greetings !
This project is being developed as part of the Spider R&D selection process. So far, I have completed the Login, Signup, and Chat Application functionalities. Below is the overview of the current progress, setup instructions, and pending improvements.


## Features

### 1. User Authentication System
- Implemented secure signup and sign-in functionality using RESTful APIs.
- Ensured secure password storage with bcrypt for hashing.
- Built using the MERN stack for seamless integration between frontend and backend.

### 2. Real-Time Chat System
- Developed an instant messaging system using WebSockets with Socket.IO.
- Features include:
  - Support for group chats where participants can join and leave freely.
  - Admin functionality to toggle whether newer members can view past chat history.
  - Sending text messages, emojis, and viewing chat history.
- Built using the MERN stack for real-time communication and user interface.

### 3. File Storage and Sharing
- Enabled users to upload and download files within a workspace.
- Integrated Google Cloud for blob storage to ensure efficient file handling.

## Technologies Used
- **Frontend and Backend**: MERN Stack (MongoDB, Express.js, React, Node.js).
- **Real-Time Communication**: WebSockets with Socket.IO.
- **File Storage**: Google Cloud (blob storage).

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Vishesh3569/Spider.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Spider
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Set up environment variables for authentication, WebSocket server, and Google Cloud integration.
5. Start the development server:
   ```bash
   npm start
   ```

## Usage
- Access the app via your local server (e.g., `http://localhost:3000`).
- **Run the server on Port 8080
- Sign up or log in to explore the features.

## Future Improvements
- Adding video and voice chat functionality.
- Enhanced file preview and search options.
- Advanced admin controls for user and file management.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request for review.





