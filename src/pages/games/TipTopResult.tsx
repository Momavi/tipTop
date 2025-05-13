function TipTopResult({ gameResult, resetGame }: any) {
  return (
    <div className="game-result">
      <h3>Результат:</h3>
      <p>{gameResult.isCorrect ? 'Капитан угадал!' : 'Капитан не угадал!'}</p>
      <p>Правильный порядок: {gameResult.correctOrder.join(' → ')}</p>
      <p>Порядок капитана: {gameResult.submittedOrder.join(' → ')}</p>
      <button onClick={resetGame()} className="new-game-btn">
        Новая игра
      </button>
    </div>
  )
}

export default TipTopResult