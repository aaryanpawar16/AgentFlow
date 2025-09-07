import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Bot, Shield, Lock, ArrowRight, Zap, Network, Key } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const agentsRef = useRef<HTMLDivElement>(null);
  const tokenCoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animations
      const tl = gsap.timeline();
      
      tl.fromTo(titleRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }
      )
      .fromTo(subtitleRef.current,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: 'power3.out' },
        '-=0.6'
      )
      .fromTo(ctaRef.current,
        { y: 30, opacity: 0, scale: 0.8 },
        { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.4'
      );

      // Token core pulsing animation
      gsap.to(tokenCoreRef.current, {
        scale: 1.1,
        duration: 2,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });

      // Orbiting agents around token core
      gsap.to('.agent-orbit-1', {
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center'
      });

      gsap.to('.agent-orbit-2', {
        rotation: -360,
        duration: 25,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center'
      });

      gsap.to('.agent-orbit-3', {
        rotation: 360,
        duration: 30,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center center'
      });

      // Floating animation for individual agents
      gsap.to('.floating-agent', {
        y: -15,
        duration: 3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.8
      });

      // Parallax background
      gsap.to('.hero-bg', {
        yPercent: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      });

      // Data flow animation
      gsap.to('.data-flow', {
        strokeDashoffset: 0,
        duration: 3,
        ease: 'power2.inOut',
        repeat: -1,
        yoyo: true
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleStartDemo = () => {
    gsap.to('.page-transition', {
      scale: 1.05,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.inOut',
      onComplete: () => navigate('/workflow')
    });
  };

  return (
    <div className="page-transition" ref={heroRef}>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="hero-bg absolute inset-0 bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-800 opacity-30"></div>
        
        {/* Central Token Core */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            ref={tokenCoreRef}
            className="relative w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-2xl shadow-cyan-500/50"
          >
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse">
              <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-600 to-cyan-500 flex items-center justify-center">
                <Key className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            
            {/* Orbiting Agents */}
            <div className="agent-orbit-1 absolute inset-0">
              <div className="floating-agent absolute -top-16 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50">
                <Bot className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <div className="agent-orbit-2 absolute inset-0">
              <div className="floating-agent absolute top-1/2 -right-16 transform -translate-y-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Shield className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <div className="agent-orbit-3 absolute inset-0">
              <div className="floating-agent absolute -bottom-16 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-green-500 flex items-center justify-center shadow-lg shadow-teal-500/50">
                <Lock className="h-6 w-6 text-white" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-center max-w-5xl">
          <h1 
            ref={titleRef}
            className="text-6xl md:text-8xl font-bold text-white leading-tight mb-6"
          >
            Where Agents Work
            <br />
            Together Securely 
           </h1>
          
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-white/85 max-w-3xl mx-auto mb-12"
          >
            Intelligent AI agents collaborate seamlessly through secure Descope OAuth tokens, 
            creating autonomous workflows that adapt and scale
          </p>
          
          <button
            ref={ctaRef}
            onClick={handleStartDemo}
            className="group px-12 py-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-2xl text-white text-xl font-semibold transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 border border-cyan-400/30"
          >
            <span className="flex items-center space-x-3">
              <span>Watch Agents Work</span>
              <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
          </button>
        </div>

        {/* Floating Network Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <defs>
            <linearGradient id="dataFlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          <path 
            className="data-flow"
            d="M 200 300 Q 400 200 600 400 Q 800 500 1000 300"
            stroke="url(#dataFlow)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="20 10"
            strokeDashoffset="100"
          />
          <path 
            className="data-flow"
            d="M 100 500 Q 300 400 500 600 Q 700 700 900 500"
            stroke="url(#dataFlow)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="15 8"
            strokeDashoffset="80"
          />
        </svg>
      </section>

      {/* Features Section */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-white">
            Autonomous Agent Ecosystem
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="feature-card group">
              <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-cyan-400/20 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 hover:border-cyan-400/40">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                  <Network className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Intelligent Coordination</h3>
                <p className="text-gray-400 leading-relaxed">
                  Agents communicate through secure channels, automatically routing tasks based on capabilities and availability.
                </p>
              </div>
            </div>

            <div className="feature-card group">
              <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-purple-400/20 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 hover:border-purple-400/40">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                  <Shield className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Zero-Trust Security</h3>
                <p className="text-gray-400 leading-relaxed">
                  Every agent interaction is authenticated with scoped tokens, ensuring complete security and audit trails.
                </p>
              </div>
            </div>

            <div className="feature-card group">
              <div className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-teal-400/20 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:shadow-teal-500/20 hover:-translate-y-2 hover:border-teal-400/40">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                  <Zap className="h-8 w-8 text-white" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Real-Time Adaptation</h3>
                <p className="text-gray-400 leading-relaxed">
                  Agents learn and adapt their workflows in real-time, optimizing performance and handling edge cases automatically.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
