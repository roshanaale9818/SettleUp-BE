# Expense Share App Backend

Welcome to the Expense Share App Backend repository! This Node.js application serves as the backend for the Expense Share App, providing APIs for managing users, groups, expenses, and group chat functionality.

## Features

- **User Management**: APIs for user authentication, registration, and profile management.
- **Group Management**: APIs for creating, joining, and managing groups.
- **Expense Management**: APIs for adding expenses to groups and calculating expense division.
- **Chat Functionality**: Real-time chat APIs for communication among group members.
- **Security**: Secure endpoints with authentication and authorization mechanisms.

## Technologies Used

- **Node.js**: Server-side JavaScript runtime environment.
- **Express.js**: Web application framework for building APIs.
- **PostgreSQL**: Relational database for storing user data, groups, expenses, and chat messages.
- **Socket.IO**: Real-time communication library for enabling group chat functionality.

## Installation

To run the Expense Share App Backend locally, follow these steps:

1. Clone the repository:
   git clone
2. Navigate to the project directory:
    cd backend 
3. Install dependencies:
   npm install

4. Set up environment variables:

Create a `.env` file in the root directory and add the following variables:

HOST=yourhost
USER=yourpostgre
PASSWORD=yourpostgresdataabasepassword
DB=expenseshare
PORT=8081
EMAIL=youremail
EMAILPASSWORD=youremailpassword
MODE=DEV
SECRETKEY=yoursecretkeytogenererateJWT


5. Start the server:
   npm start
6. The backend server will be running at port 8081
