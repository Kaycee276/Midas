import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../components/ui/Badge';

describe('Badge component', () => {
  it('renders badge children text', () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('applies success styling', () => {
    const { container } = render(<Badge variant="success">Approved</Badge>);
    expect(container.firstChild).toHaveClass('text-green-500');
  });

  it('applies error styling', () => {
    const { container } = render(<Badge variant="error">Rejected</Badge>);
    expect(container.firstChild).toHaveClass('text-red-500');
  });

  it('applies warning styling', () => {
    const { container } = render(<Badge variant="warning">Pending</Badge>);
    expect(container.firstChild).toHaveClass('text-yellow-500');
  });
});
