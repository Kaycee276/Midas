import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { AxiosResponse } from 'axios';
import StudentRoi from '../pages/student/StudentRoi';
import * as investmentsApi from '../api/investments';
import type { ApiResponse, StudentRoiData } from '../types';

vi.mock('../api/investments', () => ({
  getStudentRoi: vi.fn(),
}));

describe('StudentRoi Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders student ROI analytics, metric cards and holdings', async () => {
    vi.mocked(investmentsApi.getStudentRoi).mockResolvedValue({
      data: {
        success: true,
        message: 'Student ROI analytics retrieved successfully',
        data: {
          summary: {
            total_invested: 65000,
            current_portfolio_value: 77200,
            total_dividends_earned: 12200,
            net_capital_growth: 12200,
            total_net_profit: 24400,
            overall_roi_percentage: 37.5,
            active_holdings_count: 2,
            next_distribution_date: '2027-01-01T00:00:00.000Z',
            days_to_distribution: 68,
            annual_profit_pool_share: '30%',
          },
          holdings: [
            {
              id: 'inv-1',
              merchant_id: 'm-1',
              business_name: 'Franco Refectory & Bites',
              business_type: 'restaurant',
              proximity_to_campus: 'on_campus',
              status: 'active',
              invested_amount: 40000,
              shares: 400,
              price_per_share: 100,
              current_value: 47200,
              dividends_earned: 7200,
              net_profit: 14400,
              roi_percentage: 36.0,
              portfolio_weight: 61.5,
              invested_at: '2026-09-01T10:00:00.000Z',
            },
          ],
          payouts: [],
        },
      },
    } as unknown as AxiosResponse<ApiResponse<StudentRoiData>>);

    render(
      <MemoryRouter>
        <StudentRoi />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Returns on Investment (ROI)')).toBeInTheDocument();
      expect(screen.getByText('+37.5%')).toBeInTheDocument();
      expect(screen.getByText('Franco Refectory & Bites')).toBeInTheDocument();
      expect(screen.getByText('+36.0%')).toBeInTheDocument();
      expect(screen.getByText('Annual Dividend Payout Estimator')).toBeInTheDocument();
    });
  });

  it('renders empty state when student has no active holdings', async () => {
    vi.mocked(investmentsApi.getStudentRoi).mockResolvedValue({
      data: {
        success: true,
        message: 'Student ROI analytics retrieved successfully',
        data: {
          summary: {
            total_invested: 0,
            current_portfolio_value: 0,
            total_dividends_earned: 0,
            net_capital_growth: 0,
            total_net_profit: 0,
            overall_roi_percentage: 0,
            active_holdings_count: 0,
            next_distribution_date: '2027-01-01T00:00:00.000Z',
            days_to_distribution: 68,
            annual_profit_pool_share: '30%',
          },
          holdings: [],
          payouts: [],
        },
      },
    } as unknown as AxiosResponse<ApiResponse<StudentRoiData>>);

    render(
      <MemoryRouter>
        <StudentRoi />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('No active investments yet')).toBeInTheDocument();
      expect(screen.getByText('Browse Campus Merchants')).toBeInTheDocument();
    });
  });
});
