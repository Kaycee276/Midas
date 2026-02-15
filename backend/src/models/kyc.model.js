const supabase = require('../config/supabase');

class KycModel {
  async create(merchantId, kycData) {
    const { data, error } = await supabase
      .from('merchant_kyc')
      .insert([{
        merchant_id: merchantId,
        ...kycData,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findByMerchantId(merchantId) {
    const { data, error } = await supabase
      .from('merchant_kyc')
      .select('*')
      .eq('merchant_id', merchantId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('merchant_kyc')
      .select(`
        *,
        merchant:merchants(
          id,
          email,
          business_name,
          business_type,
          business_address,
          business_phone,
          owner_full_name,
          owner_phone,
          created_at
        )
      `)
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async update(merchantId, kycData) {
    const { data, error } = await supabase
      .from('merchant_kyc')
      .update(kycData)
      .eq('merchant_id', merchantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateStatus(kycId, status, reviewData) {
    const { data, error } = await supabase
      .from('merchant_kyc')
      .update({
        status,
        reviewed_at: new Date().toISOString(),
        ...reviewData
      })
      .eq('id', kycId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createHistoryEntry(merchantId, kycData) {
    const { data, error } = await supabase
      .from('kyc_submission_history')
      .insert([{
        merchant_id: merchantId,
        kyc_data: kycData,
        status: kycData.status,
        rejection_reason: kycData.rejection_reason,
        reviewed_at: kycData.reviewed_at,
        reviewed_by: kycData.reviewed_by
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findPendingKyc(limit = 20, offset = 0) {
    const { data, error, count } = await supabase
      .from('merchant_kyc')
      .select(`
        *,
        merchant:merchants(
          id,
          email,
          business_name,
          business_type,
          owner_full_name,
          created_at
        )
      `, { count: 'exact' })
      .eq('status', 'pending')
      .order('submitted_at', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data, count };
  }
}

module.exports = new KycModel();
