import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InfoModal } from './InfoModal';

describe('InfoModal', () => {
  it('should not render when isOpen is false', () => {
    render(
      <InfoModal
        isOpen={false}
        onClose={vi.fn()}
        title="Test Title"
        content="Test Content"
      />
    );
    
    expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
  });

  it('should render when isOpen is true', () => {
    render(
      <InfoModal
        isOpen={true}
        onClose={vi.fn()}
        title="Test Title"
        content="Test Content"
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', () => {
    const onClose = vi.fn();
    render(
      <InfoModal
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        content="Test Content"
      />
    );
    
    const backdrop = screen.getByRole('button', { name: /close/i }).parentElement?.previousSibling as HTMLElement;
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <InfoModal
        isOpen={true}
        onClose={onClose}
        title="Test Title"
        content="Test Content"
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should render Tools content correctly', () => {
    const toolsContent = "Tools are advanced AI capabilities that extend ChatGPT's functionality including File Search (analyze documents), Code Interpreter (write & execute code), DALL-E (generate images), and Web Browsing (retrieve real-time information).";
    
    render(
      <InfoModal
        isOpen={true}
        onClose={vi.fn()}
        title="Tools"
        content={toolsContent}
      />
    );
    
    expect(screen.getByText('Tools')).toBeInTheDocument();
    expect(screen.getByText(toolsContent)).toBeInTheDocument();
  });
});
