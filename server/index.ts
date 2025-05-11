import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

interface Player {
  id: string;
  username: string;
  number?: number;
  answer?: string;
  isCaptain?: boolean;
}

interface Room {
  id: string;
  players: Player[];
  maxPlayers: number;
  gameStarted: boolean;
  currentQuestion?: string;
  answersSubmitted: number;
}

const rooms: Map<string, Room> = new Map();

// Примеры вопросов
const questions = [
  "Что бы вы взяли с собой на необитаемый остров?",
  "Какой ваш любимый фильм?",
  "Куда бы вы хотели поехать в отпуск?",
  "Какое ваше любимое блюдо?",
  "Какой ваш любимый музыкальный жанр?"
];

// Функция для отправки обновленного списка комнат всем клиентам
const broadcastRoomsList = () => {
  const availableRooms = Array.from(rooms.values())
    .filter(room => !room.gameStarted && room.players.length < room.maxPlayers)
    .map(room => ({
      id: room.id,
      playersCount: room.players.length,
      maxPlayers: room.maxPlayers
    }));
  io.emit('roomsList', availableRooms);
};

// Функция для выбора случайного вопроса
const getRandomQuestion = () => {
  return questions[Math.floor(Math.random() * questions.length)];
};

// Функция для начала игры
const startGame = (room: Room) => {
  const players = [...room.players];
  // Выбираем случайного капитана
  const captainIndex = Math.floor(Math.random() * players.length);
  players[captainIndex].isCaptain = true;

  // Раздаем номера остальным игрокам
  const numbers = [1, 2, 3, 4];
  players.forEach((player, index) => {
    if (index !== captainIndex) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      player.number = numbers[randomIndex];
      numbers.splice(randomIndex, 1);
    }
  });

  room.players = players;
  room.gameStarted = true;
  room.currentQuestion = getRandomQuestion();
  room.answersSubmitted = 0;

  io.to(room.id).emit('gameStarted', {
    players: room.players,
    question: room.currentQuestion
  });
};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Создание новой комнаты
  socket.on('createRoom', ({ username }: { username: string }) => {
    const roomId = Math.random().toString(36).substring(2, 8);
    const room: Room = {
      id: roomId,
      players: [{ id: socket.id, username }],
      maxPlayers: 4,
      gameStarted: false,
      answersSubmitted: 0
    };
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.emit('roomCreated', { roomId, players: room.players });
    broadcastRoomsList();
  });

  // Присоединение к комнате
  socket.on('joinRoom', ({ roomId, username }: { roomId: string, username: string }) => {
    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', 'Room is full');
      return;
    }
    if (room.gameStarted) {
      socket.emit('error', 'Game already started');
      return;
    }
    room.players.push({ id: socket.id, username });
    socket.join(roomId);
    io.to(roomId).emit('playerJoined', { roomId, players: room.players });
    broadcastRoomsList();

    // Если набралось 3 игрока, начинаем игру
    if (room.players.length === 3) {
      startGame(room);
    }
  });

  // Получение списка комнат
  socket.on('getRooms', () => {
    broadcastRoomsList();
  });

  // Отправка ответа игроком
  socket.on('submitAnswer', ({ answer }: { answer: string }) => {
    const room = Array.from(rooms.values()).find(r => 
      r.players.some(p => p.id === socket.id)
    );
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isCaptain) return;

    player.answer = answer;
    room.answersSubmitted++;

    // Если все ответили, отправляем ответы капитану
    if (room.answersSubmitted === room.players.length - 1) {
      const captain = room.players.find(p => p.isCaptain);
      if (captain) {
        io.to(captain.id).emit('allAnswersSubmitted', {
          answers: room.players
            .filter(p => !p.isCaptain)
            .map(p => ({ username: p.username, answer: p.answer }))
        });
      }
    }
  });

  // Проверка порядка ответов капитаном
  socket.on('submitOrder', ({ order }: { order: string[] }) => {
    const room = Array.from(rooms.values()).find(r => 
      r.players.some(p => p.id === socket.id && p.isCaptain)
    );
    if (!room) return;

    const correctOrder = room.players
      .filter(p => !p.isCaptain)
      .sort((a, b) => (a.number || 0) - (b.number || 0))
      .map(p => p.username);

    const isCorrect = order.every((username, index) => username === correctOrder[index]);
    
    io.to(room.id).emit('gameResult', {
      isCorrect,
      correctOrder,
      submittedOrder: order
    });
  });

  // Отключение игрока
  socket.on('disconnect', () => {
    rooms.forEach((room, roomId) => {
      if (room.players.some(player => player.id === socket.id)) {
        room.players = room.players.filter(player => player.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(roomId);
        } else {
          io.to(roomId).emit('playerLeft', { roomId, players: room.players });
        }
        broadcastRoomsList();
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 