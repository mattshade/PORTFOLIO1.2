'use client';

interface ToolLogoProps {
  name: string;
  logo: string;
  fallbackLetter: string;
  color: string;
}

export default function ToolLogo({ name, logo, fallbackLetter, color }: ToolLogoProps) {
  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      amber: 'bg-amber-500',
      purple: 'bg-purple-500',
      blue: 'bg-blue-500',
      emerald: 'bg-emerald-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className={`flex items-center justify-center ${name === 'Codex' ? 'w-12 h-12' : 'w-10 h-10'}`}>
      <img
        src={logo}
        alt={`${name} logo`}
        className="w-full h-full object-contain"
        onError={(e) => {
          // Fallback to letter if logo fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.textContent = fallbackLetter;
          }
        }}
      />
    </div>
  );
}
