// src/cms/api.js
import { supabase } from '../supabaseClient.js';

export const cmsApi = {
  // Get single page by slug with its blocks
  getPage: async (slug) => {
    // 1. Fetch page metadata
    const { data: page, error: pageErr } = await supabase
      .from('pages')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();

    if (pageErr) throw new Error(pageErr.message);
    if (!page) throw new Error('Page not found');

    // 2. Fetch page blocks in sort_order
    const { data: blocks, error: blocksErr } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', page.id)
      .eq('status', 'published')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true });

    if (blocksErr) throw new Error(blocksErr.message);

    return { page, blocks };
  },

  // Get all published pages
  listPages: async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('status', 'published');

    if (error) throw new Error(error.message);
    return data;
  },

  // Get all settings formatted as a key-value object
  getSettings: async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) throw new Error(error.message);

    const settings = {};
    data.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  },

  // Get active homepage sections
  getHomepageSections: async () => {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(error.message);
    return data;
  },

  // Public Search Transfer Certificate
  searchCertificate: async (studentName, dob) => {
    const { data, error } = await supabase
      .from('transfer_certificates')
      .select('student_name, dob, admission_number, tc_number, issue_date, pdf_path')
      .ilike('student_name', studentName)
      .eq('dob', dob)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) throw new Error('No Transfer Certificate Found');
    
    return { success: true, certificate: data };
  },

  // Submit Contact Form
  submitContact: async (formData) => {
    const { error } = await supabase
      .from('contact_submissions')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          subject: formData.subject,
          message: formData.message
        }
      ]);

    if (error) throw new Error(error.message);
    return { message: 'Your message has been submitted successfully.' };
  }
};

