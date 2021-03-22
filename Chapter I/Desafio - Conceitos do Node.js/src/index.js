const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;

  const user = users.find(usuario => usuario.username === username);

  if(!user){
    return response.status(400).json({ error: 'Customer not found!'})
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username} = request.body;
  const userExists = users.some((user)=>
    user.username===username
  );

  if(userExists){
    response.status(400).json({error: "User already existy"});
  }
  
  const id = uuidv4();
  const user = {
    id,
    name,
    username,
    todos:[]
  };
  users.push(user)
  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;
  return response.json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title,deadline} = request.body;
  const { user } = request;
  const id = uuidv4();

  const todo = {
    id,
    title,
    done: false,
    deadline:new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title,deadline} = request.body;
  const {user} = request;

  const todoExists = user.todos.some((todo)=>
  todo.id===id
);

if(!todoExists){
  response.status(404).json({error: "invalid todo id"});
}

  user.todos.map((todo)=>{
    if(todo.id===id){
      todo.title = title;
      todo.deadline = deadline;
      return response.json({title:todo.title,deadline:todo.deadline,done:todo.done});
    }
  })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const {user} = request;
  
  const todoExists = user.todos.some((todo)=>
    todo.id===id
  );

  if(!todoExists){
    response.status(404).json({error: "invalid todo id"});
  }

  user.todos.map((todo)=>{
    if(todo.id===id){
      if(todo.done===true){
        todoModify.push = todo;
        response.status(404).json({error: "todo is true"});
      }
      todo.done = true;
      return response.json(todo);
    }
  })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const {user} = request;

  const todoExists = user.todos.some((todo)=>
    todo.id===id
  );

  if(!todoExists){
    response.status(404).json({error: "invalid todo id"});
  }


  const removeUser = user.todos.map(function(item) { return item.id; }).indexOf(id);
  user.todos.splice(removeUser, 1);
  
  return response.status(204).send();
});

module.exports = app;