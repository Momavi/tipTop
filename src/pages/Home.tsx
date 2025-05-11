import { Link } from 'react-router-dom'
import './Home.css'
import tiptop from '../assets/tiptop2.png'

interface Card {
  id: number
  title: string
  description: string
  image: string
}

const cards: Card[] = [
  {
    id: 1,
    title: 'Тип-топ',
    description: 'Description for card 1',
    image: tiptop
  },
  {
    id: 2,
    title: 'Card 2',
    description: 'Description for card 2',
    image: './assets/tiptop.png'
  },
  {
    id: 3,
    title: 'Card 3',
    description: 'Description for card 3',
    image: './assets/tiptop.png'
  },
  {
    id: 4,
    title: 'Card 4',
    description: 'Description for card 4',
    image: './assets/tiptop.png'
  },
  {
    id: 5,
    title: 'Card 5',
    description: 'Description for card 5',
    image: './assets/tiptop.png'
  },
  {
    id: 6,
    title: 'Card 6',
    description: 'Description for card 6',
    image: './assets/tiptop.png'
  }
]

function Home() {
  return (
    <div className="home">
      <h1 className="home-title">Игры</h1>
      <div className="cards-grid">
        {cards.map((card) => (
          <Link to={`/card/${card.id}`} key={card.id} className="card">
            <img className='card-image' src={card.image} alt={card.title} />
            <h2 className='card-title'>{card.title}</h2>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Home;
