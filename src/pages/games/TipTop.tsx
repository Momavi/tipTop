import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import TipTopJoinRoom from './TipTopJoinRoom';
import TipTopWaitRoom from './TipTopWaitRoom';

import './TipTop.css';
import { DragDropProvider } from '@dnd-kit/react';
import Droppable from '../../components/Droppable';
import Draggable from '../../components/Draggable';

import type { Room, Player, GameAnswer } from './TipTopTypes'
import TipTopResult from './TipTopResult';
import TipTopPlay from './TipTopPlay';

function TipTop() {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [currentPlayers, setCurrentPlayers] = useState<Player[]>([]);
  const [error, setError] = useState<string | null>(null);
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
        <TipTopJoinRoom
          socket={socket}
          rooms={rooms}
          setError={setError}
        />
      ) : !gameStarted ? (
        <TipTopWaitRoom
          currentRoom={currentRoom}
          currentPlayers={currentPlayers}
        />
      ) : isCaptain ? (
        <div className="game-room">
          <h2>Вы капитан!</h2>
          <p>Вопрос: {currentQuestion}</p>
          {allAnswers.length > 0 ? (
            <div className="captain-view">
              <TipTopPlay
                allAnswers={allAnswers}
                submitOrder={submitOrder}
              />
              {gameResult && (
                <TipTopResult
                  gameResult={gameResult}
                  resetGame={resetGame}
                />
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
            <TipTopResult
              gameResult={gameResult}
              resetGame={resetGame}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default TipTop;