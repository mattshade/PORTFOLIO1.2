import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { KPICard } from './KPICard';

describe('KPICard', () => {
  it('should render basic KPICard with title and value', () => {
    render(<KPICard title="Test Metric" value="100" />);
    
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should render subValue when provided', () => {
    render(<KPICard title="Active Users" value="500" subValue="50% Rate" />);
    
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('500')).toBeInTheDocument();
    expect(screen.getByText('50% Rate')).toBeInTheDocument();
  });

  it('should render info icon when info prop is provided', () => {
    const { container } = render(<KPICard title="Tools Adoption" value="75%" info="This is a test info" />);
    
    // Look for the Info icon by its CSS class
    const infoIcon = container.querySelector('.lucide-info');
    expect(infoIcon).toBeInTheDocument();
  });

  it('should not render info icon when info prop is not provided', () => {
    const { container } = render(<KPICard title="Tools Adoption" value="75%" />);
    
    const infoIcon = container.querySelector('.lucide-info');
    expect(infoIcon).not.toBeInTheDocument();
  });

  it('should open modal when info icon is clicked', () => {
    const { container } = render(<KPICard title="Tools Adoption" value="75%" info="Test information" />);
    
    // Find and click the info icon
    const infoIcon = container.querySelector('.lucide-info');
    
    if (infoIcon) {
      fireEvent.click(infoIcon);
      // Modal should now be visible - check for modal title which appears twice (once in card, once in modal)
      const titles = screen.getAllByText('Tools Adoption');
      expect(titles.length).toBeGreaterThan(1);
    }
  });

  it('should render trend indicator when trend is provided', () => {
    const { container } = render(
      <KPICard 
        title="Growth" 
        value="120" 
        trend="up" 
        trendValue="+15%" 
      />
    );
    
    // Check for trend text
    expect(container.textContent).toContain('↑');
    expect(container.textContent).toContain('+15%');
  });

  it('should apply correct color class', () => {
    const { container } = render(
      <KPICard title="Test" value="100" color="green" />
    );
    
    const decorationDiv = container.querySelector('.bg-emerald-300');
    expect(decorationDiv).toBeInTheDocument();
  });
});
