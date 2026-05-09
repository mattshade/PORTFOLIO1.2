import { useState, useEffect } from 'react';
import './ContextualBlurb.css';

interface ContextualBlurbProps {
  id: string;
  text: string;
  className?: string;
  delay?: number;
  /** Shown in the card header; omit for a text-only card */
  title?: string;
}

export function ContextualBlurb({
  id,
  text,
  className = '',
  delay = 1000,
  title = 'Context Note',
}: ContextualBlurbProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!hasMounted) return null;

  return (
    <div id={id} className={`contextual-blurb ${isVisible ? 'visible' : ''} ${className}`}>
      {title ? (
        <div className="contextual-blurb-header">
          <h4 className="contextual-blurb-title">
            <span className="contextual-blurb-emoji" aria-hidden>
              👀
            </span>{' '}
            {title}
          </h4>
        </div>
      ) : null}
      <p>{text}</p>
      <button type="button" onClick={handleDismiss} aria-label="Dismiss">
        Got it
      </button>
    </div>
  );
}
