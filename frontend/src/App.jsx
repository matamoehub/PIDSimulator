import { Nav, Navbar } from 'react-bootstrap'
import { Link, Route, Routes } from 'react-router-dom'
import Simulator from './components/Simulator.jsx'
import Admin from './components/Admin.jsx'

export default function App() {
  return (
    <>
      <Navbar variant="dark" className="app-topbar px-3 navbar-matamoe">
        <Navbar.Brand as={Link} to="/">Matamoe · Line Follower PID</Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link as={Link} to="/">Simulator</Nav.Link>
          <Nav.Link as={Link} to="/admin">Admin</Nav.Link>
        </Nav>
      </Navbar>

      <Routes>
        <Route path="/" element={<Simulator />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </>
  )
}
