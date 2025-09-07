import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { Bot, Workflow, BarChart3 } from 'lucide-react';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    gsap.fromTo('.nav-item', 
      { y: -20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
    );
  }, []);

  const handleNavigation = (path: string) => {
    gsap.to('.page-transition', {
      opacity: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: () => {
        navigate(path);
        gsap.to('.page-transition', {
          opacity: 1,
          duration: 0.3,
          ease: 'power2.inOut'
        });
      }
    });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="nav-item flex items-center space-x-2">
          <div className="relative">
            <Bot className="h-8 w-8 text-cyan-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AgentFlow
          </span>
        </div>
        
        <div className="nav-item flex space-x-4">
          <button
            onClick={() => handleNavigation('/')}
            className={`px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 border ${
              location.pathname === '/' 
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-lg shadow-cyan-500/25' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-cyan-400/30'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavigation('/workflow')}
            className={`px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 flex items-center space-x-2 border ${
              location.pathname === '/workflow' 
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/50 shadow-lg shadow-purple-500/25' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-purple-400/30'
            }`}
          >
            <Workflow className="h-5 w-5" />
            <span>Workflow</span>
          </button>
          <button
            onClick={() => handleNavigation('/dashboard')}
            className={`px-6 py-3 rounded-2xl backdrop-blur-md transition-all duration-300 hover:scale-105 flex items-center space-x-2 border ${
              location.pathname === '/dashboard' 
                ? 'bg-teal-500/20 text-teal-300 border-teal-400/50 shadow-lg shadow-teal-500/25' 
                : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white hover:border-teal-400/30'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Dashboard</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;  