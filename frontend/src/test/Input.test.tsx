import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../components/ui/Input';

describe('Input component', () => {
  it('renders input with label and placeholder', () => {
    render(<Input label="Email Address" placeholder="Enter your email" />);
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
  });

  it('handles user text input', async () => {
    const handleChange = vi.fn();
    render(<Input placeholder="Type here" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/type here/i);

    await userEvent.type(input, 'hello');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('hello');
  });

  it('renders error message when error prop is passed', () => {
    render(<Input label="Password" error="Password is required" />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });
});
