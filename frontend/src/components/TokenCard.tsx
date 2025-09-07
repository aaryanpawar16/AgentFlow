import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Key, Copy, ChevronRight, ChevronLeft, CheckCircle, Shield, Clock, User } from 'lucide-react';

const TokenCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const verifyRef = useRef<HTMLDivElement>(null);

  const tokenData = {
    issuer: "descope.com",
    subject: "agent-workflow-demo",
    audience: "agentflow-platform",
    expires: "24h",
    scope: ["agent:execute", "workflow:manage", "contract:verify"],
    permissions: {
      agents: ["coordinate", "monitor", "deploy"],
      workflows: ["create", "execute", "audit"],
      contracts: ["upload", "verify", "approve"]
    },
    user: {
      email: "demo@agentflow.ai",
      name: "Demo User",
      role: "workflow_orchestrator"
    }
  };

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { x: '100%' },
      { x: isExpanded ? 0 : '85%', duration: 0.6, ease: 'power3.out' }
    );

    gsap.to(contentRef.current, {
      opacity: isExpanded ? 1 : 0,
      duration: 0.4,
      ease: 'power2.inOut',
      delay: isExpanded ? 0.2 : 0
    });

    // Animate token fields when expanded
    if (isExpanded) {
      gsap.fromTo('.token-field',
        { x: 20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'power3.out', delay: 0.3 }
      );
    }
  }, [isExpanded]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(tokenData, null, 2));
    setCopied(true);
    
    gsap.to('.copy-btn', {
      scale: 0.9,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });

    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = () => {
    gsap.to('.verify-btn', {
      scale: 0.95,
      duration: 0.1,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut',
      onComplete: () => {
        setIsVerified(true);
        gsap.fromTo(verifyRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
        );
      }
    });
  };

  const togglePanel = () => {
    gsap.to('.toggle-btn', {
      rotation: isExpanded ? 0 : 180,
      duration: 0.3,
      ease: 'power2.inOut'
    });
    setIsExpanded(!isExpanded);
  };

  return (
    <div 
      ref={panelRef}
      className="fixed top-1/2 right-0 transform -translate-y-1/2 z-40 w-96"
    >
      <div className="bg-black/20 backdrop-blur-xl border-l border-t border-b border-cyan-400/30 rounded-l-3xl shadow-2xl shadow-cyan-500/20">
        {/* Toggle Button */}
        <button
          onClick={togglePanel}
          className="toggle-btn absolute -left-12 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-l-2xl flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/30 transition-all duration-300 border border-cyan-400/30"
        >
          {isExpanded ? <ChevronRight className="h-6 w-6 text-white" /> : <ChevronLeft className="h-6 w-6 text-white" />}
        </button>

        {/* Panel Content */}
        <div ref={contentRef} className="p-6 opacity-0">
          <div className="flex items-center space-x-3 mb-6">
            <div className="relative">
              <Key className="h-6 w-6 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h3 className="text-xl font-bold text-white">Access Token</h3>
          </div>

          {/* Token Card UI */}
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-600/10 border border-cyan-400/30 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-cyan-400" />
                  <span className="text-cyan-300 font-semibold">Descope Token</span>
                </div>
                {isVerified && (
                  <div ref={verifyRef} className="flex items-center space-x-1 text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Verified</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="token-field flex items-center justify-between p-3 rounded-xl bg-black/30 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Subject</span>
                  </div>
                  <span className="text-white text-sm font-mono">{tokenData.subject}</span>
                </div>
                
                <div className="token-field flex items-center justify-between p-3 rounded-xl bg-black/30 border border-gray-700/50">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Expires</span>
                  </div>
                  <span className="text-white text-sm font-mono">{tokenData.expires}</span>
                </div>
                
                <div className="token-field p-3 rounded-xl bg-black/30 border border-gray-700/50">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">Scopes</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tokenData.scope.map((scope, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs border border-cyan-400/30"
                      >
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleCopy}
                className="copy-btn flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300 flex items-center justify-center space-x-2 border border-blue-400/30"
              >
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">Copy</span>
                  </>
                )}
              </button>
              
              {!isVerified && (
                <button
                  onClick={handleVerify}
                  className="verify-btn py-3 px-4 bg-gradient-to-r from-teal-500 to-green-600 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center border border-teal-400/30"
                >
                  <Shield className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="text-xs text-gray-500 space-y-2 p-4 rounded-xl bg-black/20 border border-gray-800">
              <p><span className="text-cyan-400">Issuer:</span> {tokenData.issuer}</p>
              <p><span className="text-purple-400">Role:</span> {tokenData.user.role}</p>
              <p><span className="text-teal-400">Status:</span> Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;