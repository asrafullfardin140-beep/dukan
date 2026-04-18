import { supabase } from './supabase';

export async function getShopProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching profile:', error);
  }

  // Map to our expected format
  if (data) {
    return {
      nameEn: data.name_en || '',
      nameBn: data.name_bn || '',
      phone: data.phone || '',
      address: data.address || '',
      logo: data.logo_url || '',
      signature: data.signature_url || '',
      terms: data.terms || 'আমাদের প্রতিষ্ঠান থেকে আপনি কখনাই প্রতারিত হবেন না। ইনশাআল্লাহ।'
    };
  }

  return { nameEn: '', nameBn: '', phone: '', address: '', logo: '', signature: '', terms: 'আমাদের প্রতিষ্ঠান থেকে আপনি কখনাই প্রতারিত হবেন না। ইনশাআল্লাহ।' };
}

export async function saveShopProfile(data) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const profileData = {
    id: user.id,
    name_en: data.nameEn,
    name_bn: data.nameBn,
    phone: data.phone,
    address: data.address,
    logo_url: data.logo,
    signature_url: data.signature,
    terms: data.terms,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabase.from('profiles').upsert(profileData);
  if (error) console.error('Error saving profile:', error);
}

export async function getInvoices() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching invoices:', error);
    return [];
  }

  return data.map(mapInvoiceFromDb);
}

export async function getInvoice(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching single invoice:', error);
    return null;
  }

  return mapInvoiceFromDb(data);
}

export async function saveInvoice(invoiceData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const dbData = {
    id: invoiceData.id,
    user_id: user.id,
    date: invoiceData.date,
    customer_name: invoiceData.customerName,
    customer_phone: invoiceData.customerPhone,
    customer_location: invoiceData.customerLocation,
    items: invoiceData.items,
    subtotal: invoiceData.subtotal,
    discount_amount: invoiceData.discountAmount,
    discount_percent: invoiceData.discountPercent,
    total: invoiceData.total,
    received: invoiceData.received,
    balance: invoiceData.balance,
    note: invoiceData.note
  };

  const { error } = await supabase.from('invoices').upsert(dbData);
  if (error) console.error('Error saving invoice:', error);
}

export async function deleteInvoice(id) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('invoices')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) console.error('Error deleting invoice:', error);
}

export async function getNextInvoiceNumber() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return "INV-001"; // Fallback

  const prefix = "INV-" + new Date().getFullYear() + "-";
  
  const { data, error } = await supabase
    .from('invoices')
    .select('id')
    .eq('user_id', user.id)
    .like('id', `${prefix}%`);

  if (error || !data || data.length === 0) {
    return prefix + "001";
  }

  const maxNum = data.reduce((max, inv) => {
    const parts = inv.id.split('-');
    if (parts.length === 3) {
      const num = parseInt(parts[2], 10);
      return num > max ? num : max;
    }
    return max;
  }, 0);

  return prefix + String(maxNum + 1).padStart(3, '0');
}

export async function uploadMedia(file, path) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const fileName = `${user.id}/${path}/${Date.now()}_${file.name}`;
  
  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading media:', uploadError);
    return null;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(fileName);

  return publicUrl;
}

function mapInvoiceFromDb(dbItem) {
  return {
    id: dbItem.id,
    date: dbItem.date,
    customerName: dbItem.customer_name,
    customerPhone: dbItem.customer_phone,
    customerLocation: dbItem.customer_location,
    items: dbItem.items || [],
    subtotal: Number(dbItem.subtotal),
    discountAmount: Number(dbItem.discount_amount),
    discountPercent: Number(dbItem.discount_percent),
    total: Number(dbItem.total),
    received: Number(dbItem.received),
    balance: Number(dbItem.balance),
    note: dbItem.note
  };
}
