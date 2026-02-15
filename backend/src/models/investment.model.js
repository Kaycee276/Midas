const supabase = require('../config/supabase');

class InvestmentModel {
  async create(investmentData) {
    const { data, error } = await supabase
      .from('investments')
      .insert([investmentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('investments')
      .select(`
        *,
        student:students(id, full_name, email, student_id),
        merchant:merchants(id, business_name, business_type, business_address)
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByStudentId(studentId, status = null) {
    let query = supabase
      .from('investments')
      .select(`
        *,
        merchant:merchants(id, business_name, business_type, business_address, proximity_to_campus)
      `)
      .eq('student_id', studentId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('invested_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async findByMerchantId(merchantId, limit = 20, offset = 0) {
    const { data, error, count } = await supabase
      .from('investments')
      .select(`
        *,
        student:students(id, full_name, student_id)
      `, { count: 'exact' })
      .eq('merchant_id', merchantId)
      .order('invested_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }

  async getPortfolioSummary(studentId) {
    const { data, error } = await supabase
      .from('student_portfolio_summary')
      .select('*')
      .eq('student_id', studentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getMerchantInvestmentSummary(merchantId) {
    const { data, error } = await supabase
      .from('merchant_investment_summary')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('investments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTotalInvestedByStudent(studentId) {
    const { data, error } = await supabase
      .from('investments')
      .select('amount')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (error) throw error;

    const total = data.reduce((sum, inv) => sum + parseFloat(inv.amount), 0);
    return total;
  }

  async getTransactionHistory(studentId, limit = 50, offset = 0) {
    const { data, error, count } = await supabase
      .from('investment_transactions')
      .select(`
        *,
        merchant:merchants(business_name, business_type)
      `, { count: 'exact' })
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }
}

module.exports = new InvestmentModel();
