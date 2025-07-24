# Todolist API

This is a simple Todolist API project I worked on recently in class which i have now started to proper develop into a working API (This is made mostly with ChatGPT as I am still learning how to code and by reading over this and building projects off of this i hopefully will learn quicker). It demonstrates CRUD operations (Create, Read, Update, Delete) using MongoDB as the database, Express.js as the web framework, and JWT for authentication.

## Features

- Create, read, update, and delete todo items
- User authentication with JWT
- Data persistence with MongoDB
- Admin accounts that have there own dashboard and commands

## Technologies Used

- Node.js
- Express.js
- MongoDB
- JSON Web Tokens (JWT)

## Getting Started

1. Clone the repository.
2. Run `npm install` to install all required dependencies.
3. Run `mongod` to start your MongoDB server.
4. Run `node index.js` to start your Node.js server.
5. Use Postman (or any API client) to interact with the Todolist API.

## API Endpoints

### `GET /todos`

- **Description:** Shows all of your todos.

### `GET /admin/dashboard`

- **Description:** Shows all of the users and the todos.

### `PUT /admin/promote/userid`

- **Description:** Promote someone to admin.

### `PUT /admin/demote/userid`

- **Description:** Demote someone from admin.

### `PUT /todos/id`

- **Description:** Changes something on a certain todo or if you completed it.

### `DELETE /todos/id`

- **Description:** Deletes a certain todo.

### `POST /todos`

- **Description:** Creates a todo.

### `POST /auth/signup`

- **Description:** Creates an account.

### `POST /auth/login`

- **Description:** Login to an account.

### `POST /auth/account`

- **Description:** Change account username or password.
