import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Landing from '../pages/Landing';

describe('Landing Page Redesign', () => {
  const renderLanding = () =>
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>
    );

  it('renders the hero section, key headlines and CTA links', () => {
    renderLanding();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /turn campus spending into campus wealth/i
    );
    expect(screen.getByRole('link', { name: /start investing/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /list your business/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explore marketplace/i })).toBeInTheDocument();
  });

  it('renders stats ribbon with key platform counters', () => {
    renderLanding();

    expect(screen.getByText('1,450+')).toBeInTheDocument();
    expect(screen.getByText(/active student investors/i)).toBeInTheDocument();
    expect(screen.getByText('₦38.5M')).toBeInTheDocument();
    expect(screen.getByText(/total micro-capital funded/i)).toBeInTheDocument();
  });

  it('allows toggling between student and merchant audience value propositions', async () => {
    renderLanding();

    const studentTab = screen.getByRole('button', { name: /for students/i });
    const merchantTab = screen.getByRole('button', { name: /for merchants/i });

    // Initial state: For Students
    expect(screen.getByText(/low barrier to entry/i)).toBeInTheDocument();
    expect(screen.getByText(/automated annual dividends/i)).toBeInTheDocument();

    // Switch to For Merchants
    await userEvent.click(merchantTab);
    expect(screen.getByRole('heading', { name: /debt-free growth capital/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /loyal student advocates/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /keep 65% of profits/i })).toBeInTheDocument();

    // Switch back to Students
    await userEvent.click(studentTab);
    expect(screen.getByRole('heading', { name: /low barrier to entry/i })).toBeInTheDocument();
  });

  it('updates annual dividend calculator projections when investment capital changes', () => {
    renderLanding();

    // Find the capital range slider
    const sliders = screen.getAllByRole('slider');
    const capitalSlider = sliders[0];

    // Change investment capital to 50,000
    fireEvent.change(capitalSlider, { target: { value: '50000' } });

    expect(screen.getByText('₦50,000')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start earning with ₦50,000/i })).toBeInTheDocument();
  });

  it('expands and collapses FAQ accordion items', async () => {
    renderLanding();

    // First FAQ is open by default
    expect(screen.getByText(/every year on january 1st at midnight/i)).toBeInTheDocument();

    // Click the 65 / 30 / 5 FAQ button
    const formulaFaq = screen.getByRole('button', {
      name: /what is the 65% \/ 30% \/ 5% revenue sharing formula\?/i,
    });
    await userEvent.click(formulaFaq);

    expect(
      screen.getByText(/total annual net profit is transparently divided: 65% is retained/i)
    ).toBeInTheDocument();
  });
});
