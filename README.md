
# **Spider Web Application**

Greetings !
This project is being developed as part of the Spider R&D selection process. Below is the overview of the current progress, setup instructions, and pending improvements.


## Features

### 1. User Authentication System
- Implemented secure signup and sign-in functionality using RESTful APIs.
- Ensured secure password storage with bcrypt for hashing.

### 2. Real-Time Chat System
- Developed an instant messaging system within each workspace using WebSockets with Socket.IO.
- Features include:
  - Support for group chats where participants can join and leave freely.
  - Admin functionality to toggle whether newer members can view past chat history.
  - Sending text messages, emojis, and viewing chat history.

### 3. File Storage and Sharing
- Enabled users to upload and download files within a workspace.
- Integrated Google Cloud for blob storage to ensure efficient file handling.

## Technologies Used
- **Frontend and Backend**: MERN Stack (MongoDB, Express.js, React, Node.js).
- **Real-Time Communication**: WebSockets with Socket.IO.
- **File Storage**: Google Cloud (blob storage).

## Important Notes
- The backend server is configured to run on port `8080`. **Ensure that you start the server on this port** to avoid configuration issues.
- The project uses Google Cloud for file storage. To protect sensitive information, the Google Cloud credential file has been excluded from the repository (e.g., using `.gitignore`). You will need to set up your own credentials for the project to function properly.

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
4. Set up environment variables:
   - Ensure the backend server runs on port `8080`.
   - Add Google Cloud credentials for blob storage.
5. Start the backend server:
   ```bash
   node server.js
   ```
6. Start the frontend:
   ```bash
   npm run client
   ```

## Usage
- Access the application via your browser.
- Sign up or log in to explore the features.

## Future Improvements
- Adding video chat functionality.
- Enhanced file preview and search options.
- Advanced admin controls for user and file management.

## Contributing
Contributions are welcome! Please fork the repository and create a pull request for review.






