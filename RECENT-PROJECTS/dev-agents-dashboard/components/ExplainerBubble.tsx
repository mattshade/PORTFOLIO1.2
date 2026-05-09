'use client';
import { useEffect, useState } from 'react';

export default function ExplainerBubble() {
  const [visible, setVisible] = useState(false);
  const [removed, setRemoved] = useState(false);
  const text = "Not all coding agents are created equal. This next-gen Next.js scorecard is a competitive teardown—evaluating heavy hitters like Claude Code, Cursor, and Antigravity. It's the strategic cheat sheet leadership uses before rolling out tooling to thousands of devs.";

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setRemoved(true), 400);
  };

  if (removed) return null;

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .explainer-overlay {
          position: fixed; bottom: 2rem; right: 2rem; z-index: 999999; max-width: 320px;
          background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(0,0,0,0.1); border-radius: 12px; padding: 1.25rem 1.5rem;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
          transform: translateY(20px); opacity: 0; pointer-events: none;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease;
          font-family: system-ui, -apple-system, sans-serif;
          text-align: left;
        }
        .explainer-overlay.visible { transform: translateY(0); opacity: 1; pointer-events: auto; }
        .explainer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
        .explainer-title { font-size: 0.95rem; font-weight: 600; color: #111; margin: 0; display: flex; align-items: center; gap: 0.5rem; }
        .explainer-close { background: none; border: none; color: #666; cursor: pointer; padding: 0.25rem; margin: -0.25rem; border-radius: 4px; font-size: 1.25rem; line-height: 1; transition: background 0.2s, color 0.2s; }
        .explainer-close:hover { background: rgba(0,0,0,0.05); color: #000; }
        .explainer-text { font-size: 0.875rem; color: #444; line-height: 1.5; margin: 0; }
        .explainer-btn { display: inline-block; margin-top: 1rem; width: 100%; padding: 0.5rem; text-align: center; background: #93C572; color: #0a0a0b; border: none; border-radius: 6px; font-size: 0.875rem; font-weight: 500; cursor: pointer; transition: opacity 0.2s; }
        .explainer-btn:hover { opacity: 0.9; }
        @media (max-width: 480px) { .explainer-overlay { bottom: 1rem; right: 1rem; left: 1rem; max-width: none; } }
      `}} />
      <div className={`explainer-overlay ${visible ? 'visible' : ''}`}>
        <div className="explainer-header">
          <h4 className="explainer-title"><span>👀</span> Context Note</h4>
          <button className="explainer-close" aria-label="Close" onClick={dismiss}>&times;</button>
        </div>
        <p className="explainer-text">{text}</p>
        <button className="explainer-btn" onClick={dismiss}>Got it</button>
      </div>
    </>
  );
}
