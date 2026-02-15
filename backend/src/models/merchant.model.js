const supabase = require('../config/supabase');

class MerchantModel {
  async create(merchantData) {
    const { data, error } = await supabase
      .from('merchants')
      .insert([merchantData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async findById(id) {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async update(id, updates) {
    const { data, error } = await supabase
      .from('merchants')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateLastLogin(id) {
    const { data, error } = await supabase
      .from('merchants')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

module.exports = new MerchantModel();
