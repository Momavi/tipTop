import { useState } from 'react';

function TipTopJoinRoom({ socket, rooms, setError }: any) {
  const [username, setUsername] = useState<string>('');

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

  return (
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
          rooms.map((room: any) => (
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
  )
}

export default TipTopJoinRoom
