import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Textarea from '../components/ui/Textarea';

describe('Textarea component', () => {
  it('renders textarea with label and placeholder', () => {
    render(<Textarea label="Notes" placeholder="Enter notes..." />);
    expect(screen.getByLabelText('Notes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter notes...')).toBeInTheDocument();
  });

  it('renders error message when error prop is provided', () => {
    render(<Textarea label="Bio" error="Bio is required" />);
    expect(screen.getByText('Bio is required')).toBeInTheDocument();
  });

  it('handles user text input correctly', async () => {
    const user = userEvent.setup();
    render(<Textarea label="Comments" />);
    const textarea = screen.getByLabelText('Comments');
    await user.type(textarea, 'Great business');
    expect(textarea).toHaveValue('Great business');
  });
});
