import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import StatsPage from './pages/StatsPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white shadow">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link to="/" className="font-bold text-lg">TinyLink</Link>
            <nav>
              <Link to="/" className="text-sm text-slate-600">Dashboard</Link>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Dashboard/>} />
            <Route path="/code/:code" element={<StatsPage/>} />
          </Routes>
        </main>

        <footer className="text-center text-sm text-slate-500 py-6">
          TinyLink • simple URL shortener
        </footer>
      </div>
    </BrowserRouter>
  );
}
