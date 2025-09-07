import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Code, Copy, ChevronRight, ChevronLeft, CheckCircle } from 'lucide-react';

const TokenPanel: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const sampleToken = {
    "iss": "https://api.descope.com",
    "sub": "U2FsdGVkX1+user123",
    "aud": ["secureflow-app"],
    "exp": 1735689600,
    "iat": 1735603200,
    "scope": ["workflow:read", "workflow:execute", "contract:verify"],
    "permissions": {
      "workflows": ["create", "read", "execute"],
      "contracts": ["upload", "verify", "approve"]
    },
    "user": {
      "email": "demo@secureflow.com",
      "name": "Demo User",
      "role": "workflow_admin"
    }
  };

  useEffect(() => {
    gsap.fromTo(panelRef.current,
      { x: '100%' },
      { x: isExpanded ? 0 : '80%', duration: 0.6, ease: 'power3.out' }
    );

    gsap.to(contentRef.current, {
      opacity: isExpanded ? 1 : 0,
      duration: 0.4,
      ease: 'power2.inOut',
      delay: isExpanded ? 0.2 : 0
    });
  }, [isExpanded]);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(sampleToken, null, 2));
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
      <div className="bg-black/30 backdrop-blur-xl border-l border-t border-b border-white/20 rounded-l-3xl shadow-2xl">
        {/* Toggle Button */}
        <button
          onClick={togglePanel}
          className="toggle-btn absolute -left-12 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-l-2xl flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300"
        >
          {isExpanded ? <ChevronRight className="h-6 w-6 text-white" /> : <ChevronLeft className="h-6 w-6 text-white" />}
        </button>

        {/* Panel Content */}
        <div ref={contentRef} className="p-6 opacity-0">
          <div className="flex items-center space-x-3 mb-6">
            <Code className="h-6 w-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Access Token</h3>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-black/40 border border-gray-700">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-hidden">
                {JSON.stringify(sampleToken, null, 2)}
              </pre>
            </div>

            <button
              onClick={handleCopy}
              className="copy-btn w-full py-3 px-6 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl text-white font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-5 w-5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span>Copy Token</span>
                </>
              )}
            </button>

            <div className="text-xs text-gray-500 space-y-2">
              <p><span className="text-blue-400">Scope:</span> workflow:execute</p>
              <p><span className="text-purple-400">Expires:</span> 24 hours</p>
              <p><span className="text-teal-400">Issuer:</span> Descope OAuth</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenPanel;