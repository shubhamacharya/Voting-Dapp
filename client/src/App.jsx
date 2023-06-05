import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'
import Elections from './components/Elections';
import Admin from './components/Admin';
import Login from './components/Login'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route index path='/' element={<Login />} />
          <Route path='/dashboard' element={<Elections/>} />
          <Route path='/admin' element={<Admin />} />
          <Route path='*' element={<Login />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
