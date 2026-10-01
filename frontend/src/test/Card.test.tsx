import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from '../components/ui/Card';

describe('Card component', () => {
  it('renders card with children', () => {
    render(
      <Card>
        <p>Card Content</p>
      </Card>
    );
    expect(screen.getByText('Card Content')).toBeInTheDocument();
  });

  it('applies padding by default and omits when padding is false', () => {
    const { container: withPadding } = render(<Card>Padded</Card>);
    expect(withPadding.firstChild).toHaveClass('p-6');

    const { container: withoutPadding } = render(<Card padding={false}>Unpadded</Card>);
    expect(withoutPadding.firstChild).not.toHaveClass('p-6');
  });
});
