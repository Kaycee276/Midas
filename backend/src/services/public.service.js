const supabase = require('../config/supabase');
const { NotFoundError } = require('../utils/errors');
const { ACCOUNT_STATUS } = require('../types/enums');

class PublicService {
  async getActiveMerchants(page = 1, limit = 20, filters = {}) {
    const offset = (page - 1) * limit;

    let query = supabase
      .from('merchants')
      .select(`
        id,
        business_name,
        business_type,
        business_description,
        business_address,
        business_phone,
        proximity_to_campus,
        created_at
      `, { count: 'exact' })
      .eq('account_status', ACCOUNT_STATUS.ACTIVE);

    // Apply filters
    if (filters.business_type) {
      query = query.eq('business_type', filters.business_type);
    }

    if (filters.proximity_to_campus) {
      query = query.eq('proximity_to_campus', filters.proximity_to_campus);
    }

    if (filters.search) {
      query = query.or(`business_name.ilike.%${filters.search}%,business_description.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return {
      merchants: data,
      pagination: {
        total: count,
        page,
        limit,
        total_pages: Math.ceil(count / limit)
      }
    };
  }

  async getMerchantDetails(merchantId) {
    const { data, error } = await supabase
      .from('merchants')
      .select(`
        id,
        business_name,
        business_type,
        business_description,
        business_address,
        business_phone,
        proximity_to_campus,
        account_status,
        created_at
      `)
      .eq('id', merchantId)
      .single();

    if (error && error.code === 'PGRST116') {
      throw new NotFoundError('Merchant not found');
    }
    if (error) throw error;

    if (data.account_status !== ACCOUNT_STATUS.ACTIVE) {
      throw new NotFoundError('Merchant not available');
    }

    return data;
  }

  async getBusinessTypes() {
    const { data, error } = await supabase
      .from('merchants')
      .select('business_type')
      .eq('account_status', ACCOUNT_STATUS.ACTIVE);

    if (error) throw error;

    // Get unique business types
    const types = [...new Set(data.map(m => m.business_type))];
    return types;
  }
}

module.exports = new PublicService();
