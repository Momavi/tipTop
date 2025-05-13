function TipTopWaitRoom({ currentRoom, currentPlayers }: any) {

  return (
    <div className="game-room">
      <h2>Вы в комнате: {currentRoom}</h2>
      <p>Ожидание игроков {currentPlayers.length}/3</p>
      <p>Игроки в комнате: {currentPlayers.map((player: any) => player.username).join(', ')}</p>
    </div>
  )
}

export default TipTopWaitRoom
