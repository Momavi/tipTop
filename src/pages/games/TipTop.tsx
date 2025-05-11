import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import './TipTop.css';

interface Room {
  id: string;
  playersCount: number;
  maxPlayers: number;
}

interface Player {
  id: string;
  username: string;
  number?: number;
  answer?: string;
  isCaptain?: boolean;
}

interface GameAnswer {
  username: string;
  answer: string;
}

function TipTop() {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [playerAnswer, setPlayerAnswer] = useState<string>('');
  const [playerAnswerSubmit, setPlayerAnswerSubmit] = useState<boolean>(false);
  const [isCaptain, setIsCaptain] = useState(false);
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);
  const [allAnswers, setAllAnswers] = useState<GameAnswer[]>([]);
  const [gameResult, setGameResult] = useState<{
    isCorrect: boolean;
    correctOrder: string[];
    submittedOrder: string[];
  } | null>(null);
  const [answerOrder, setAnswerOrder] = useState<string[]>([]);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('roomsList', (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    newSocket.on('roomCreated', ({ roomId, players }: { roomId: string, players: Player[] }) => {
      setCurrentRoom(roomId);
      setCurrentPlayers(players);
      setError(null);
    });

    newSocket.on('playerJoined', ({ players, roomId }: { players: Player[], roomId: string }) => {
      setCurrentPlayers(players);
      setCurrentRoom(roomId);
      setError(null);
    });

    newSocket.on('playerLeft', ({ players }: { players: Player[] }) => {
      setCurrentPlayers(players);
    });

    newSocket.on('error', (errorMessage: string) => {
      setError(errorMessage);
    });

    newSocket.on('gameStarted', ({ players, question }: { players: Player[], question: string }) => {
      setGameStarted(true);
      setCurrentQuestion(question);
      setCurrentPlayers(players);

      const currentPlayer = players.find(p => p.id === newSocket.id);
      if (currentPlayer) {
        setIsCaptain(currentPlayer.isCaptain || false);
        setPlayerNumber(currentPlayer.number || null);
      }
    });

    newSocket.on('allAnswersSubmitted', ({ answers }: { answers: GameAnswer[] }) => {
      setAllAnswers(answers);
    });

    newSocket.on('gameResult', (result: {
      isCorrect: boolean;
      correctOrder: string[];
      submittedOrder: string[];
    }) => {
      setGameResult(result);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.emit('getRooms');
    }
  }, [socket]);

  const createRoom = () => {
    if (socket && username.trim()) {
      socket.emit('createRoom', { username });
    } else {
      setError('Введите имя пользователя');
    }
  };

  const joinRoom = (roomId: string) => {
    if (socket && username.trim()) {
      socket.emit('joinRoom', { roomId, username });
    } else {
      setError('Введите имя пользователя');
    }
  };

  const submitAnswer = () => {
    if (socket && playerAnswer.trim()) {
      setPlayerAnswerSubmit(true)
      socket.emit('submitAnswer', { answer: playerAnswer });
    }
  };

  const submitOrder = () => {
    if (socket && answerOrder.length === allAnswers.length) {
      socket.emit('submitOrder', { order: answerOrder });
    }
  };

  const handleDragStart = (username: string) => {
    setAnswerOrder(prev => [...prev, username]);
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestion('');
    setPlayerAnswer('');
    setIsCaptain(false);
    setPlayerNumber(null);
    setAllAnswers([]);
    setGameResult(null);
    setAnswerOrder([]);
  };

  return (
    <div className="tiptop">
      <h1>TipTop Game</h1>

      {error && <div className="error">{error}</div>}

      {!currentRoom ? (
        <div className="room-management">
          <div className="username-input">
            <input
              type="text"
              placeholder="Введите ваше имя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="username-field"
            />
          </div>

          <button onClick={createRoom} className="create-room-btn">
            Создать комнату
          </button>

          <div className="rooms-list">
            <h2>Доступные комнаты:</h2>
            {rooms.length === 0 ? (
              <p>Нет доступных комнат</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="room-item">
                  <span>Комната: {room.id}</span>
                  <span>Игроки: {room.playersCount}/{room.maxPlayers}</span>
                  <button onClick={() => joinRoom(room.id)}>
                    Присоединиться
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : !gameStarted ? (
        <div className="game-room">
          <h2>Вы в комнате: {currentRoom}</h2>
          <p>Ожидание игроков {currentPlayers.length}/3</p>
          <p>Игроки в комнате: {currentPlayers.map(player => player.username).join(', ')}</p>
        </div>
      ) : isCaptain ? (
        <div className="game-room">
          <h2>Вы капитан!</h2>
          <p>Вопрос: {currentQuestion}</p>
          {allAnswers.length > 0 ? (
            <div className="captain-view">
              <h3>Ответы игроков:</h3>
              <div className="answers-list">
                {allAnswers.map((answer, index) => (
                  <div
                    key={index}
                    className="answer-item"
                    draggable
                    onDragStart={() => handleDragStart(answer.username)}
                  >
                    <p>Игрок: {answer.username}</p>
                    <p>Ответ: {answer.answer}</p>
                  </div>
                ))}
              </div>
              {answerOrder.length === allAnswers.length && (
                <button onClick={submitOrder} className="submit-order-btn">
                  Подтвердить порядок
                </button>
              )}
              {gameResult && (
                <div className="game-result">
                  <h3>Результат:</h3>
                  <p>{gameResult.isCorrect ? 'Правильно!' : 'Неправильно!'}</p>
                  <p>Правильный порядок: {gameResult.correctOrder.join(' → ')}</p>
                  <p>Ваш порядок: {gameResult.submittedOrder.join(' → ')}</p>
                  <button onClick={resetGame} className="new-game-btn">
                    Новая игра
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p>Ожидание ответов игроков...</p>
          )}
        </div>
      ) : (
        <div className="game-room">
          <h2>Ваш номер: {playerNumber}</h2>
          <p>Вопрос: {currentQuestion}</p>
          <div className="answer-input">
            {!playerAnswerSubmit ? (
              <>
                <input
                  type="text"
                  placeholder="Введите ваш ответ"
                  value={playerAnswer}
                  onChange={(e) => setPlayerAnswer(e.target.value)}
                  className="answer-field"
                />
                <button onClick={submitAnswer} className="submit-answer-btn">
                  Отправить ответ
                </button>
              </>
            ) : (
              <p>Ожидание ответа капитана...</p>
            )}
          </div>
          {gameResult && (
            <div className="game-result">
              <h3>Результат:</h3>
              <p>{gameResult.isCorrect ? 'Капитан угадал!' : 'Капитан не угадал!'}</p>
              <p>Правильный порядок: {gameResult.correctOrder.join(' → ')}</p>
              <p>Порядок капитана: {gameResult.submittedOrder.join(' → ')}</p>
              <button onClick={resetGame} className="new-game-btn">
                Новая игра
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TipTop;