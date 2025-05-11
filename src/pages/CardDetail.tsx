import { useParams } from 'react-router-dom'

function CardDetail() {
  const { id } = useParams()

  return (
    <div className="card-detail">
      <h1>Card {id}</h1>
      <div className="card-content">
        <h2>Card Title {id}</h2>
        <p>Detailed description for card {id}</p>
        <p>This is a detailed view of the card with ID: {id}</p>
      </div>
    </div>
  )
}

export default CardDetail 