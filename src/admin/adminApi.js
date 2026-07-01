// src/admin/adminApi.js
import { supabase } from '../supabaseClient.js';

const TEMPLATE_DEFAULTS = {
  basic: [
    { block_type: 'text', data: { heading: 'Page Title', body: '<p>Add your content here...</p>', alignment: 'left' } }
  ],
  gallery: [
    { block_type: 'text', data: { heading: 'Gallery', body: '<p>Browse our collection.</p>', alignment: 'center' } },
    { block_type: 'gallery', data: { title: 'Photo Gallery', columns: 3, images: [] } }
  ],
  faculty: [
    { block_type: 'text', data: { heading: 'Our Faculty', body: '<p>Meet our dedicated team.</p>', alignment: 'center' } },
    { block_type: 'faculty', data: { title: 'Teaching Staff', members: [] } }
  ],
  notice_board: [
    { block_type: 'text', data: { heading: 'Notices & Circulars', body: '<p>Stay updated with important announcements.</p>', alignment: 'center' } },
    { block_type: 'notice', data: { title: '', date: '', body: '', type: 'info' } }
  ],
  downloads: [
    { block_type: 'text', data: { heading: 'Downloads', body: '<p>Important documents and forms.</p>', alignment: 'center' } },
    { block_type: 'downloads', data: { title: 'Documents', files: [] } }
  ],
  achievement: [
    { block_type: 'text', data: { heading: 'Achievements', body: '<p>Our proud moments.</p>', alignment: 'center' } },
    { block_type: 'cards', data: { title: 'Awards & Recognition', columns: 3, cards: [] } }
  ]
};

export const adminApi = {
  // Auth
  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw new Error(error.message);

    const payload = {
      token: data.session.access_token,
      user: {
        id: data.user.id,
        name: data.user.email.split('@')[0],
        email: data.user.email,
        role: data.user.user_metadata?.role || 'super_admin'
      }
    };

    localStorage.setItem('greenwood_admin_token', payload.token);
    localStorage.setItem('greenwood_admin_user', JSON.stringify(payload.user));
    return payload;
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!user) throw new Error('No active session');

    return {
      user: {
        id: user.id,
        name: user.email.split('@')[0],
        email: user.email,
        role: user.user_metadata?.role || 'super_admin'
      }
    };
  },

  forgotPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`
    });
    if (error) throw error;
    return { message: 'Password reset link sent to your email.' };
  },

  resetPassword: async (token, password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return { message: 'Password has been reset successfully. You can now login.' };
  },

  changePassword: async (currentPassword, newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return { message: 'Password changed successfully.' };
  },

  // Pages
  listPages: async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getPage: async (id) => {
    const { data: page, error: pageErr } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (pageErr) throw pageErr;
    if (!page) throw new Error('Page not found');

    const { data: blocks, error: blocksErr } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', id)
      .order('sort_order', { ascending: true });

    if (blocksErr) throw blocksErr;
    return { page, blocks };
  },

  createPage: async (pageData) => {
    const { data: page, error: pageErr } = await supabase
      .from('pages')
      .insert([
        {
          slug: pageData.slug,
          title: pageData.title,
          route: pageData.route,
          template: pageData.template,
          status: 'draft',
          hero_title: pageData.title,
          hero_subtitle: ''
        }
      ])
      .select()
      .single();

    if (pageErr) throw pageErr;

    const defaultBlocks = TEMPLATE_DEFAULTS[pageData.template] || TEMPLATE_DEFAULTS.basic;
    const blocksToInsert = defaultBlocks.map((b, idx) => ({
      page_id: page.id,
      block_type: b.block_type,
      sort_order: idx,
      data: b.data,
      status: 'draft'
    }));

    const { error: blocksErr } = await supabase
      .from('blocks')
      .insert(blocksToInsert);

    if (blocksErr) throw blocksErr;
    return page;
  },

  updatePage: async (id, pageData) => {
    const { data, error } = await supabase
      .from('pages')
      .update({
        title: pageData.title,
        hero_title: pageData.hero_title,
        hero_subtitle: pageData.hero_subtitle,
        meta_title: pageData.meta_title,
        meta_description: pageData.meta_description,
        meta_keywords: pageData.meta_keywords,
        canonical_url: pageData.canonical_url
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deletePage: async (id) => {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  publishPage: async (id) => {
    const { data: page } = await supabase
      .from('pages')
      .select('version')
      .eq('id', id)
      .single();

    const newVersion = (page?.version || 1) + 1;

    const { error: pageErr } = await supabase
      .from('pages')
      .update({ status: 'published', version: newVersion })
      .eq('id', id);

    if (pageErr) throw pageErr;

    const { error: blocksErr } = await supabase
      .from('blocks')
      .update({ status: 'published' })
      .eq('page_id', id);

    if (blocksErr) throw blocksErr;
    return { message: 'Page published successfully' };
  },

  unpublishPage: async (id) => {
    const { error } = await supabase
      .from('pages')
      .update({ status: 'draft' })
      .eq('id', id);

    if (error) throw error;
    return { message: 'Page reverted to draft successfully' };
  },

  duplicatePage: async (id) => {
    const { data: page, error: pageErr } = await supabase
      .from('pages')
      .select('*')
      .eq('id', id)
      .single();

    if (pageErr) throw pageErr;

    const { data: newPage, error: newPageErr } = await supabase
      .from('pages')
      .insert([
        {
          slug: `${page.slug}-copy-${Date.now().toString().slice(-4)}`,
          title: `${page.title} (Copy)`,
          route: `${page.route}-copy`,
          template: page.template,
          status: 'draft',
          hero_title: page.hero_title,
          hero_subtitle: page.hero_subtitle
        }
      ])
      .select()
      .single();

    if (newPageErr) throw newPageErr;

    const { data: blocks } = await supabase
      .from('blocks')
      .select('*')
      .eq('page_id', id);

    if (blocks && blocks.length > 0) {
      const blocksToInsert = blocks.map(b => ({
        page_id: newPage.id,
        block_type: b.block_type,
        sort_order: b.sort_order,
        data: b.data,
        status: 'draft'
      }));

      const { error: newBlocksErr } = await supabase
        .from('blocks')
        .insert(blocksToInsert);

      if (newBlocksErr) throw newBlocksErr;
    }
    return newPage;
  },

  // Blocks
  addBlock: async (pageId, blockType, initialData = {}) => {
    const { data: blocks } = await supabase
      .from('blocks')
      .select('sort_order')
      .eq('page_id', pageId)
      .order('sort_order', { ascending: false })
      .limit(1);

    const maxOrder = blocks && blocks.length > 0 ? blocks[0].sort_order : -1;

    const { data, error } = await supabase
      .from('blocks')
      .insert([
        {
          page_id: pageId,
          block_type: blockType,
          sort_order: maxOrder + 1,
          data: initialData,
          status: 'draft'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateBlock: async (id, blockData) => {
    const { data, error } = await supabase
      .from('blocks')
      .update({ data: blockData })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteBlock: async (id) => {
    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  reorderBlocks: async (pageId, orders) => {
    for (const item of orders) {
      const { error } = await supabase
        .from('blocks')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
      if (error) throw error;
    }
    return { message: 'Blocks reordered successfully' };
  },

  toggleBlockVisibility: async (id) => {
    const { data: block } = await supabase
      .from('blocks')
      .select('is_visible')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('blocks')
      .update({ is_visible: !block.is_visible })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Revisions
  getRevisions: async (pageId) => {
    return [];
  },

  rollbackRevision: async (pageId, version) => {
    return { message: 'Revisions disabled' };
  },

  // Media
  listMedia: async (search = '', category = '', page = 1) => {
    const folder = category || 'other';
    const { data, error } = await supabase.storage
      .from('media')
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'name', order: 'desc' }
      });

    if (error) throw error;

    const media = data
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map((file) => {
        const fileUrl = supabase.storage
          .from('media')
          .getPublicUrl(`${folder}/${file.name}`).data.publicUrl;

        return {
          id: `${folder}_${file.name}`,
          filename: file.name,
          original_name: file.name.substring(file.name.indexOf('_') + 1),
          file_url: fileUrl,
          file_size: file.metadata?.size || 0,
          file_type: file.metadata?.mimetype || (folder === 'image' || folder === 'gallery' ? 'image/jpeg' : 'application/pdf'),
          file_extension: file.name.split('.').pop(),
          category: folder,
          created_at: file.created_at
        };
      });

    const filtered = search
      ? media.filter(m => m.original_name.toLowerCase().includes(search.toLowerCase()))
      : media;

    return {
      media: filtered,
      total_pages: 1,
      page: 1,
      per_page: 100
    };
  },

  uploadMedia: async (formData) => {
    const file = formData.get('files');
    const category = formData.get('category') || 'other';

    const sanitized = file.name.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
    const filename = `${Date.now()}_${sanitized}`;

    const { error: uploadErr } = await supabase.storage
      .from('media')
      .upload(`${category}/${filename}`, file);

    if (uploadErr) throw uploadErr;

    const publicUrl = supabase.storage
      .from('media')
      .getPublicUrl(`${category}/${filename}`).data.publicUrl;

    return {
      id: `${category}_${filename}`,
      filename: filename,
      original_name: file.name,
      file_url: publicUrl,
      file_size: file.size
    };
  },

  updateMedia: async (id, title, altText) => {
    return { message: 'Metadata update disabled' };
  },

  deleteMedia: async (id) => {
    const parts = id.split('_');
    const folder = parts[0];
    const filename = parts.slice(1).join('_');

    const { error } = await supabase.storage
      .from('media')
      .remove([`${folder}/${filename}`]);

    if (error) throw error;
    return { message: 'Media deleted successfully' };
  },

  checkMediaUsage: async (id) => {
    return { used_count: 0, used_in: [] };
  },

  // Transfer Certificates
  listCertificates: async (search = '', page = 1) => {
    let query = supabase
      .from('transfer_certificates')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (search) {
      query = query.ilike('student_name', `%${search}%`);
    }

    const { data: items, error } = await query;
    if (error) throw error;

    return {
      certificates: items,
      total: items.length,
      page: 1,
      per_page: 100,
      total_pages: 1
    };
  },

  createCertificate: async (formData) => {
    const file = formData.get('pdf');
    const student_name = formData.get('student_name');
    const dob = formData.get('dob');
    const admission_number = formData.get('admission_number');
    const tc_number = formData.get('tc_number');
    const issue_date = formData.get('issue_date');

    let pdf_path = '';

    if (file) {
      const filename = `TC_${Date.now()}_${student_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(`certificate/${filename}`, file);

      if (uploadErr) throw uploadErr;

      pdf_path = supabase.storage
        .from('media')
        .getPublicUrl(`certificate/${filename}`).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('transfer_certificates')
      .insert([
        {
          student_name,
          dob,
          admission_number,
          tc_number,
          issue_date,
          pdf_path,
          is_active: true
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateCertificate: async (id, formData) => {
    const file = formData.get('pdf');
    const student_name = formData.get('student_name');
    const dob = formData.get('dob');
    const admission_number = formData.get('admission_number');
    const tc_number = formData.get('tc_number');
    const issue_date = formData.get('issue_date');
    const is_active = formData.get('is_active') === '1' || formData.get('is_active') === 'true';

    const updates = {
      student_name,
      dob,
      admission_number,
      tc_number,
      issue_date,
      is_active
    };

    if (file && file.size > 0) {
      const filename = `TC_${Date.now()}_${student_name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      const { error: uploadErr } = await supabase.storage
        .from('media')
        .upload(`certificate/${filename}`, file);

      if (uploadErr) throw uploadErr;

      updates.pdf_path = supabase.storage
        .from('media')
        .getPublicUrl(`certificate/${filename}`).data.publicUrl;
    }

    const { data, error } = await supabase
      .from('transfer_certificates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  deleteCertificate: async (id) => {
    const { error } = await supabase
      .from('transfer_certificates')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  },

  // Site Settings
  getSettings: async () => {
    const { data, error } = await supabase
      .from('site_settings')
      .select('setting_key, setting_value');

    if (error) throw error;

    const settings = {};
    data.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });
    return settings;
  },

  saveSettings: async (settings) => {
    for (const key of Object.keys(settings)) {
      const { error } = await supabase
        .from('site_settings')
        .upsert({ setting_key: key, setting_value: String(settings[key]) }, { onConflict: 'setting_key' });
      if (error) throw error;
    }
    return { message: 'Settings saved successfully' };
  },

  // Homepage Sections
  listHomepageSections: async () => {
    const { data, error } = await supabase
      .from('homepage_sections')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  saveHomepageSectionsOrder: async (orders) => {
    for (const item of orders) {
      const { error } = await supabase
        .from('homepage_sections')
        .update({ sort_order: item.sort_order })
        .eq('id', item.id);
      if (error) throw error;
    }
    return { message: 'Order saved successfully' };
  },

  updateHomepageSection: async (key, sectionData) => {
    const { data, error } = await supabase
      .from('homepage_sections')
      .update({
        is_enabled: sectionData.is_enabled,
        content: sectionData.content
      })
      .eq('section_key', key)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Backup & Restore
  listBackups: async () => [],
  createBackup: async () => ({ message: 'Backups automated in Supabase dashboard' }),
  downloadBackupUrl: (filename) => '#',
  restoreBackup: async () => ({ message: 'Restores managed in Supabase dashboard' }),
  deleteBackup: async () => ({ success: true }),

  // Contact Submissions
  getContactSubmissions: async () => {
    const { data, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  deleteContactSubmission: async (id) => {
    const { error } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  }
};

