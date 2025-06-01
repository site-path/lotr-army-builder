
import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ForcesPage from './pages/ForcesPage';
import AboutUsPage from './pages/AboutUsPage';
import SpecialRulesPage from './pages/SpecialRulesPage'; 
import MagicalPowersPage from './pages/MagicalPowersPage';


const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <header className="bg-slate-800 bg-opacity-90 shadow-lg p-4 sticky top-0 z-50 backdrop-blur-md border-b-2 border-yellow-600">
          <nav className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
            <Link to="/" className="text-3xl font-bold text-yellow-400 hover:text-yellow-300 transition-colors font-[Quintessential,serif] tracking-wider mb-2 sm:mb-0">
              Middle Earth Armies Builder
            </Link>
            <div className="space-x-2 sm:space-x-4 text-center sm:text-left">
              <Link to="/forces/good" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-lg">Forces of Good</Link>
              <Link to="/forces/evil" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-lg">Forces of Evil</Link>
              <Link to="/special-rules" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-lg">Special Rules</Link>
              <Link to="/magical-powers" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-lg">Magical Powers</Link>
              <Link to="/about" className="text-yellow-300 hover:text-yellow-200 font-semibold transition-colors text-lg">About Us</Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/forces/:alignment" element={<ForcesPage />} />
            <Route path="/special-rules" element={<SpecialRulesPage />} />
            <Route path="/magical-powers" element={<MagicalPowersPage />} />
            <Route path="/about" element={<AboutUsPage />} />
          </Routes>
        </main>

        <footer className="bg-slate-800 bg-opacity-90 text-center p-6 text-sm text-slate-400 shadow-t-lg backdrop-blur-md border-t-2 border-yellow-600">
          <p>&copy; {new Date().getFullYear()} Middle Earth Armies Builder. Inspired by the works of J.R.R. Tolkien.</p>
          <p className="text-xs mt-1 text-slate-500">All character names, items, and concepts are property of their respective owners. This is a fan-made tool.</p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;