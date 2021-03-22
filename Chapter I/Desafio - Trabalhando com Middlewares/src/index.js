const express = require('express');
const cors = require('cors');

const { v4: uuidv4, validate } = require('uuid');

const app = express();
app.use(express.json());
app.use(cors());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ message: 'This user already exists' });
  }
  request.user = user;
  return next();
}

function checksCreateTodosUserAvailability(request, response, next) {
  const { user } = request;
  if (!user.pro) {
    if (user.todos.length > 9) {
      return response.status(403).json({ message: 'Free plan exceeded!' });
    }
  }
  return next();
}

function checksTodoExists(request, response, next) {
  const { username } = request.headers;
  const { id } = request.params;

  const userExist = users.some((name) => name.username === username);
  if (!userExist) {
    return response.status(404).json({ error: 'This user already exists' });
  }
  if (!validate(id)) {
    return response.status(400).json({ error: 'Invalid ID' });
  }
  const user = users.filter((name) => name.username === username);

  const { todos } = user[0];

  console.log(todos);

  if (!todos || todos.length === 0) {
    return response.status(404).json({ error: 'Todo invalid' });
  }
  const vali = todos.filter((ids) => ids.id === id);

  if (!vali[0]) {
    return response
      .status(404)
      .json({ error: 'Id does not belong to the whole' });
  }
  request.todo = vali[0];
  request.user = user[0];

  return next();
}

function findUserById(request, response, next) {
  const { id } = request.params;

  const user = users.some((ids) => ids.id === id);

  if (!user) {
    return response.status(404).json({ message: 'This user already exists' });
  }
  const userr = users.filter((ids) => ids.id === id);
  request.user = userr[0];
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: 'Username already exists' });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: [],
  };

  users.push(user);

  return response.status(201).json({
    id: user.id,
    name: user.name,
    pro: user.pro,
    todos: user.todos,
    username: user.username,
  });
});

app.get('/users/:id', findUserById, (request, response) => {
  const { user } = request;

  return response.json({
    name: user.name,
    pro: user.pro,
    todos: user.todos,
    username: user.username,
  });
});

app.patch('/users/:id/pro', findUserById, (request, response) => {
  const { user } = request;

  if (user.pro) {
    return response
      .status(400)
      .json({ error: 'Pro plan is already activated.' });
  }

  user.pro = true;

  return response.json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post(
  '/todos',
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  (request, response) => {
    const { title, deadline } = request.body;
    const { user } = request;

    const newTodo = {
      id: uuidv4(),
      title,
      deadline: new Date(deadline),
      done: false,
      created_at: new Date(),
    };

    user.todos.push(newTodo);

    return response.status(201).json(newTodo);
  }
);

app.put('/todos/:id', checksTodoExists, (request, response) => {
  const { title, deadline } = request.body;
  const { todo } = request;

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksTodoExists, (request, response) => {
  const { todo } = request;

  todo.done = true;

  return response.json(todo);
});

app.delete(
  '/todos/:id',
  checksExistsUserAccount,
  checksTodoExists,
  (request, response) => {
    const { user, todo } = request;

    const todoIndex = user.todos.indexOf(todo);

    if (todoIndex === -1) {
      return response.status(404).json({ error: 'Todo not found' });
    }

    user.todos.splice(todoIndex, 1);

    return response.status(204).send();
  }
);

module.exports = {
  app,
  users,
  checksExistsUserAccount,
  checksCreateTodosUserAvailability,
  checksTodoExists,
  findUserById,
};