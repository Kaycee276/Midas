const supabase = require('../config/supabase');

class AdminModel {
  async create(adminData) {
    const { data, error } = await supabase
      .from('admins')
      .insert([adminData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getDashboardStats() {
    // Students counts
    const [
      { count: totalStudents },
      { count: activeStudents },
      { count: suspendedStudents },
      { count: inactiveStudents },
    ] = await Promise.all([
      supabase.from('students').select('*', { count: 'exact', head: true }),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('account_status', 'active'),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('account_status', 'suspended'),
      supabase.from('students').select('*', { count: 'exact', head: true }).eq('account_status', 'inactive'),
    ]);

    // Merchants counts
    const [
      { count: totalMerchants },
      { count: activeMerchants },
      { count: pendingKycMerchants },
      { count: kycSubmittedMerchants },
      { count: kycRejectedMerchants },
      { count: suspendedMerchants },
      { count: inactiveMerchants },
    ] = await Promise.all([
      supabase.from('merchants').select('*', { count: 'exact', head: true }),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('account_status', 'active'),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('account_status', 'pending_kyc'),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('account_status', 'kyc_submitted'),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('account_status', 'kyc_rejected'),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('account_status', 'suspended'),
      supabase.from('merchants').select('*', { count: 'exact', head: true }).eq('account_status', 'inactive'),
    ]);

    // Investments counts + financial totals
    const [
      { count: totalInvestments },
      { count: activeInvestments },
      { count: withdrawnInvestments },
      investmentTotals,
    ] = await Promise.all([
      supabase.from('investments').select('*', { count: 'exact', head: true }),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('investments').select('*', { count: 'exact', head: true }).eq('status', 'withdrawn'),
      supabase.from('investments').select('amount, current_value'),
    ]);

    const totalInvested = (investmentTotals.data || []).reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
    const totalCurrentValue = (investmentTotals.data || []).reduce((sum, inv) => sum + (Number(inv.current_value) || 0), 0);

    // KYC counts
    const [
      { count: totalKyc },
      { count: pendingKyc },
      { count: approvedKyc },
      { count: rejectedKyc },
      { count: resubmissionKyc },
    ] = await Promise.all([
      supabase.from('kyc_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'rejected'),
      supabase.from('kyc_submissions').select('*', { count: 'exact', head: true }).eq('status', 'resubmission_required'),
    ]);

    return {
      students: {
        total: totalStudents || 0,
        active: activeStudents || 0,
        suspended: suspendedStudents || 0,
        inactive: inactiveStudents || 0,
      },
      merchants: {
        total: totalMerchants || 0,
        active: activeMerchants || 0,
        pending_kyc: pendingKycMerchants || 0,
        kyc_submitted: kycSubmittedMerchants || 0,
        kyc_rejected: kycRejectedMerchants || 0,
        suspended: suspendedMerchants || 0,
        inactive: inactiveMerchants || 0,
      },
      investments: {
        total: totalInvestments || 0,
        active: activeInvestments || 0,
        withdrawn: withdrawnInvestments || 0,
        total_invested: totalInvested,
        total_current_value: totalCurrentValue,
      },
      kyc: {
        total: totalKyc || 0,
        pending: pendingKyc || 0,
        approved: approvedKyc || 0,
        rejected: rejectedKyc || 0,
        resubmission_required: resubmissionKyc || 0,
      },
    };
  }

  async getAnalytics() {
    // Investment trend - last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const sixMonthsAgoISO = sixMonthsAgo.toISOString();

    const { data: recentInvestments } = await supabase
      .from('investments')
      .select('amount, invested_at')
      .gte('invested_at', sixMonthsAgoISO);

    const investmentTrend = this._groupByMonth(recentInvestments || [], 'invested_at', 'amount');

    // Revenue trend - last 6 months (distributed reports)
    const { data: distributedReports } = await supabase
      .from('revenue_reports')
      .select('gross_revenue, net_profit, submitted_at, status')
      .eq('status', 'distributed')
      .gte('submitted_at', sixMonthsAgoISO);

    const revenueTrend = this._groupRevenueByMonth(distributedReports || []);

    // Top merchants by capital raised
    const { data: allInvestments } = await supabase
      .from('investments')
      .select('merchant_id, amount, merchant:merchants(business_name, business_type)');

    const merchantTotals = {};
    (allInvestments || []).forEach(inv => {
      const mid = inv.merchant_id;
      if (!merchantTotals[mid]) {
        merchantTotals[mid] = {
          merchant_id: mid,
          business_name: inv.merchant?.business_name || 'Unknown',
          business_type: inv.merchant?.business_type || 'other',
          total_raised: 0
        };
      }
      merchantTotals[mid].total_raised += Number(inv.amount) || 0;
    });
    const topMerchants = Object.values(merchantTotals)
      .sort((a, b) => b.total_raised - a.total_raised)
      .slice(0, 5);

    // Investments by business type
    const investmentsByType = {};
    (allInvestments || []).forEach(inv => {
      const type = inv.merchant?.business_type || 'other';
      investmentsByType[type] = (investmentsByType[type] || 0) + (Number(inv.amount) || 0);
    });
    const investmentsByTypeArr = Object.entries(investmentsByType).map(([type, amount]) => ({
      business_type: type,
      total_amount: amount
    }));

    // Recent distributions
    const { data: recentDistributions } = await supabase
      .from('dividend_distributions')
      .select(`
        *,
        merchant:merchants(business_name, business_type)
      `)
      .order('created_at', { ascending: false })
      .limit(10);

    // Platform balance
    const { data: platformWallet } = await supabase
      .from('platform_wallet')
      .select('balance')
      .limit(1)
      .single();

    // Pending revenue count
    const { count: pendingRevenueCount } = await supabase
      .from('revenue_reports')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Total revenue & distributed
    const { data: allReports } = await supabase
      .from('revenue_reports')
      .select('gross_revenue, net_profit, status');

    let totalRevenue = 0;
    let totalDistributed = 0;
    (allReports || []).forEach(r => {
      totalRevenue += Number(r.gross_revenue) || 0;
      if (r.status === 'distributed') {
        totalDistributed += Number(r.net_profit) || 0;
      }
    });

    return {
      investment_trend: investmentTrend,
      revenue_trend: revenueTrend,
      top_merchants: topMerchants,
      investments_by_type: investmentsByTypeArr,
      recent_distributions: recentDistributions || [],
      platform_balance: Number(platformWallet?.balance) || 0,
      pending_revenue_count: pendingRevenueCount || 0,
      total_revenue: totalRevenue,
      total_distributed: totalDistributed
    };
  }

  _groupByMonth(items, dateField, amountField) {
    const months = {};
    const now = new Date();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: key, count: 0, total_amount: 0 };
    }
    items.forEach(item => {
      const d = new Date(item[dateField]);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].count += 1;
        months[key].total_amount += Number(item[amountField]) || 0;
      }
    });
    return Object.values(months);
  }

  _groupRevenueByMonth(reports) {
    const months = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months[key] = { month: key, total_revenue: 0, total_distributed: 0 };
    }
    reports.forEach(r => {
      const d = new Date(r.submitted_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (months[key]) {
        months[key].total_revenue += Number(r.gross_revenue) || 0;
        months[key].total_distributed += Number(r.net_profit) || 0;
      }
    });
    return Object.values(months);
  }

  async updateLastLogin(id) {
    const { data, error } = await supabase
      .from('admins')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new AdminModel();
