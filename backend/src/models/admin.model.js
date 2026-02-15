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
