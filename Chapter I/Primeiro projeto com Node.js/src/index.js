const { v4: uuidv4 } = require('uuid');
const express = require('express');

const app = express();
const customers = [];

app.use(express.json());

function verifyIfExistsAccountCPF(request, response, next) {
  const { cpf } = request.headers;
  const customer = customers.find((conta) => conta.cpf === cpf);

  if (!customer) {
    return response.status(400).json({ error: 'Customer not found' });
  }
  request.customer = customer;
  return next();
}

function getBalamce(statement) {
  const balance = statement.reduce((acc, operation) => {
    if (operation.type === 'credit') {
      return acc + operation.amount;
    }
    return acc - operation.amount;
  }, 0);
  return balance;
}

app.post('/account', (request, response) => {
  const { cpf, name } = request.body;
  const id = uuidv4();

  customers.push({
    id,
    name,
    cpf,
    statement: [],
  });

  return response.status(201).json({ message: 'Conta Crianda com sucesso🔥!' });
});

app.get('/statement', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer.statement);
});

app.get('/statement/date', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const { date } = request.query;
  const dateFormat = new Date(`${date} 00:00`);

  const statement = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  );
  return response.json(statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
  const { description, amount } = request.body;
  const { customer } = request;

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit',
  };

  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
  const { amount } = request.body;
  const { customer } = request;

  const balance = getBalamce(customer.statement);

  if (balance < amount) {
    return response.status(400).json({ error: 'Insufficient funds!' });
  }
  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit',
  };
  customer.statement.push(statementOperation);

  return response.status(201).send();
});

app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { name } = request.body;
  const { customer } = request;

  customer.name = name;

  return response.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  return response.json(customer);
});

app.delete('/account', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;

  customers.splice(customer, 1);

  return response.status(200).json(customers);
});

app.get('/balance', verifyIfExistsAccountCPF, (request, response) => {
  const { customer } = request;
  const balance = getBalamce(customer.statement);
  return response.json(balance);
});

app.listen(3333, () => {
  console.log('Backend Iniciado na porta 3333! 🚀🚀🚀');
});
