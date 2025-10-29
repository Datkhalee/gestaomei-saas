import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sucesso from './pages/Sucesso';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/sucesso" element={<Sucesso />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        {/* outras rotas */}
      </Routes>
    </Router>
  );
}

export default App;
