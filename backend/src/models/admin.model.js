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
