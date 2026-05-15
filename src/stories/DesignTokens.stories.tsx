import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';

const TokensTable = () => {
  // Common design tokens defined in src/index.css
  const tokens = [
    { name: '--bg', value: '#0a0a0b', role: 'Page background' },
    { name: '--bg-elevated', value: '#111113', role: 'Raised surfaces' },
    { name: '--bg-glass', value: 'rgba(16, 16, 19, 0.7)', role: 'Glass panels' },
    { name: '--border', value: 'rgba(255, 255, 255, 0.08)', role: 'Default dividers' },
    { name: '--border-strong', value: 'rgba(255, 255, 255, 0.15)', role: 'Emphasized edges' },
    { name: '--text', value: '#f3f4f6', role: 'Primary copy' },
    { name: '--text-muted', value: '#9ca3af', role: 'Secondary copy' },
    { name: '--brand', value: '#bef264', role: 'Brand mark' },
    { name: '--accent', value: '#bef264', role: 'Primary accent' },
    { name: '--accent-secondary', value: '#e2b35a', role: 'Technical amber' },
    { name: '--font-sans', value: 'Geist, ...', role: 'Main font' },
    { name: '--font-mono', value: 'Geist Mono, ...', role: 'Monospace font' },
    { name: '--text-shadow-standalone', value: 'horizontal blur', role: 'Hero/section copy over aviary (not glass)' },
  ];

  return (
    <div style={{ padding: '24px', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>Design Tokens</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
        These tokens are defined in <code>src/index.css</code> and serve as the source of truth for the entire system.
      </p>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {tokens.map((token) => (
          <div key={token.name} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '24px', 
            padding: '16px', 
            background: 'var(--bg-elevated)', 
            border: '1px solid var(--border)', 
            borderRadius: '8px' 
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: `var(${token.name})`, border: '1px solid var(--border-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               {!token.name.includes('font') && !token.name.includes('shadow') && <div style={{ width: '24px', height: '24px', background: `var(${token.name})`, borderRadius: '2px' }} />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--accent)' }}>{token.name}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{token.role}</div>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', opacity: 0.8 }}>
               {/* Note: This shows the current computed value in the browser if we wanted to be fancy, but hardcoding for demo is fine since it's documented in MDX too */}
               var({token.name})
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const meta: Meta<typeof TokensTable> = {
  title: 'Foundations/Design Tokens',
  component: TokensTable,
};

export default meta;
type Story = StoryObj<typeof TokensTable>;

export const List: Story = {};
