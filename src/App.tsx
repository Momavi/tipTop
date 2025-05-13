import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'


import './App.css'

import Home from './pages/Home'
import CardDetail from './pages/CardDetail'
import TipTop from './pages/games/TipTop'

function About() {
  return (
    <div>
      <h1>About Page</h1>
      <p>This is a sample React application with TypeScript and React Router.</p>
    </div>
  )
}


function App() {
  return (
    <Router>
      <div className="app">
        <nav>
          <ul>
            <li>
              <Link to="/">Главная</Link>
            </li>
          </ul>
        </nav>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/card/1" element={<TipTop />} />
            <Route path="/card/:id" element={<CardDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
