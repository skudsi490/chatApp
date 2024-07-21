## Overview

ChatApp is the capstone project for my Full Stack Web Development Certificate. It showcases the use of the MERN stack (MongoDB, Express.js, React, Node.js) to develop a sophisticated, real-time messaging application. The app enables users to register, log in, and participate in both one-on-one and group chats. It leverages modern web development practices to ensure scalability, responsiveness, and a seamless user experience.

![Home Screen](./screenshots/Screenshot%202024-07-21%20234910.png)


## Features

- **User Authentication:** Secure user registration and login utilizing JWT-based authentication.
- **Real-time Messaging:** Instant messaging with real-time updates powered by Socket.io.
- **Group Chat:** Users can create, manage, and participate in group chats.
- **Typing Indicators:** Real-time indicators to show when a user is typing.
- **Responsive Design:** A fully responsive layout that works across desktop and mobile devices.
- **3D Visualizations:** Interactive 3D globe visualization using Three.js and React Three Fiber.

## Technology Stack

### Frontend

- **React:** A JavaScript library for building user interfaces.
- **Redux Toolkit:** For state management, ensuring a predictable state container for JavaScript apps.
- **@react-three/fiber & @react-three/drei:** Libraries for advanced 3D visualizations.
- **Axios:** An HTTP client for making API requests.
- **Socket.io-client:** Facilitates real-time communication between the client and server.

### Backend

- **Node.js:** A JavaScript runtime for executing server-side code.
- **Express.js:** A fast, unopinionated web framework for Node.js.
- **MongoDB:** A NoSQL database for storing user and chat data.
- **Mongoose:** An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Socket.io:** Enables real-time, bidirectional communication between web clients and servers.
- **JWT:** Utilized for secure authentication via JSON Web Tokens.

## Project Structure

### Client

- **Components:**
    - **Avatar:** Reusable avatar components.
    - **ChatArea:** The main interface for chatting, including input for typing messages.
    - **ChatBox:** A container for `ChatArea`.
    - **ChatsList:** Displays a list of available chats.
    - **GlobeVisualization:** An interactive 3D globe component.
    - **Header:** The main header/navigation bar.
    - **Loading:** A loading spinner component.
    - **Miscellaneous:** Various modals for profile and group chat management.
    - **Scroll:** Handles message scrolling.
    - **TypingIndicator:** Shows when a user is typing.
- **State Management:**
    - **chatSlice.js:** A Redux slice for managing chat state and actions.
    - **store.js:** Configures the Redux store.
- **Selectors:**
    - **selectors.js:** Reselect selectors for extracting data from the state.

### Server

- **Controllers:**
    - **chat.controller.js:** Handles chat-related requests.
    - **user.controller.js:** Manages user-related requests.
- **Middleware:**
    - **authentication.js:** Middleware for verifying JWT tokens.
    - **errorHandling.js:** Global error handlers.
- **Models:**
    - **chatModel.js:** Defines the schema for chat documents using Mongoose.
    - **userModel.js:** Defines the schema for user documents using Mongoose.
- **Routes:**
    - **chatRoutes.js:** Defines API endpoints related to chats.
    - **userRoutes.js:** Defines API endpoints related to users.
- **Configuration:**
    - **connectDB.js:** Configuration for connecting to MongoDB.
    - **tokenGenerator.js:** Utility for generating JWT tokens.
- **Main Server File:**
    - **index.js:** The entry point for the server, setting up routes, middleware, and Socket.io configuration.

## Installation and Setup

1. **Clone the repository:**
    
    ```bash
    git clone https://github.com/yourusername/chatapp.git
    cd chatapp
    
    ```
    
2. **Install dependencies:**
    - Backend:
        
        ```bash
        cd server
        npm install
        
        ```
        
    - Frontend:
        
        ```bash
        cd client
        npm install
        
        ```
        
3. **Environment Variables:**
    - Create a `.env` file in the `server` directory and add the following:
        
        ```makefile
        # Server Configuration
        PORT=5000
        
        # Database Configuration
        MONGO_URI=mongodb://localhost:27017/new-chat-app
        
        # JWT Secret for Authentication
        JWT_SECRET=your_jwt_secret
        
        MONGO_PASS=your_mongo_password
        
        ```
        
4. **Run the application:**
    - Backend:
        
        ```bash
        cd server
        npm start
        
        ```
        
    - Frontend:
        
        ```bash
        cd client
        npm run dev
        
        ```
        

## Real-time Communication with Socket.io
![Chat Screen](./screenshots/Screenshot%202024-07-21%20234825.png)

### Handling High Traffic: Message Queuing and Batching

To ensure that the application can handle high traffic efficiently, a combination of message queuing and batch processing is implemented.

- **Message Queuing:** The server maintains an in-memory array called `messageQueue` to temporarily hold messages before they are processed and saved to the database. When a new message is received via the `new message` event, it is added to the `messageQueue` if it is not already present to avoid duplicates.
- **Batch Processing:** The `processMessageQueue` function processes the messages in the queue in batches. This function is called every second using `setInterval` to process and save the messages from the queue to the database.
- **Real-time Notification:** As soon as a new message is received and added to the queue, the server immediately notifies the clients (chat members) about the new message using `socket.emit`. This ensures a real-time messaging experience for users.

### Room Management and Typing Indicators

- **Room Management:** Users join chat rooms upon selecting a chat. This is managed through Socket.io's `join` functionality.
- **Typing Indicators:** Real-time typing indicators show when a user is typing in a chat, providing immediate feedback to other users.

## Responsive Design and Theming

- **Global Styles:** The application uses CSS variables for consistent theming and easy customization.
- **Responsive Layout:** Media queries ensure a responsive layout that adapts to different screen sizes, ensuring usability on both desktop and mobile devices.

## Conclusion

ChatApp is a comprehensive project that demonstrates my proficiency in full stack development using the MERN stack. It combines modern web development techniques with practical implementations of real-time communication, responsive design, and efficient data handling. This project serves as a testament to my skills and readiness for professional full stack development roles.

