import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getShopProfile, saveShopProfile, uploadMedia } from '../lib/storage';
import { Camera, CheckCircle, Settings, Loader2 } from 'lucide-react';

const InputField = ({ label, name, type = 'text', placeholder, rows, profile, onChange }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-600 mb-1.5">{label}</label>
    {rows ? (
      <textarea name={name} value={profile[name]} onChange={onChange} rows={rows} placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1AABDD] focus:bg-white text-gray-800 text-sm transition-colors resize-none" />
    ) : (
      <input type={type} name={name} value={profile[name]} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1AABDD] focus:bg-white text-gray-800 text-sm transition-colors" />
    )}
  </div>
);

const ImageUploadBox = ({ label, field, profile, setProfile, handleImageUpload, wide = false }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">{label}</label>
    <label className="cursor-pointer block">
      <div className={`${wide ? 'w-36 h-20' : 'w-20 h-20'} rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50 overflow-hidden hover:border-[#1AABDD] hover:bg-[#1AABDD]/5 transition-colors`}>
        {profile[field]
          ? <img src={profile[field]} alt={label} className="w-full h-full object-contain p-1" />
          : <><Camera size={20} className="text-gray-400 mb-1" /><span className="text-[10px] text-gray-400 font-medium">Upload</span></>
        }
      </div>
      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, field)} className="hidden" />
    </label>
    {profile[field] && <button type="button" onClick={() => setProfile((p) => ({ ...p, [field]: '' }))} className="text-xs text-red-400 mt-1 font-medium">Remove</button>}
  </div>
);

export default function SettingsPage() {
  const { lang, setLang, t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ nameEn: '', nameBn: '', phone: '', address: '', logo: '', signature: '', terms: '' });

  useEffect(() => { 
    async function load() {
      const data = await getShopProfile();
      if (data) setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image too large. Please use under 2MB.'); return; }
    
    // Optimistic UI update
    const reader = new FileReader();
    reader.onloadend = () => setProfile((prev) => ({ ...prev, [field]: reader.result }));
    reader.readAsDataURL(file);

    // Background upload
    const url = await uploadMedia(file, field);
    if (url) {
      setProfile((prev) => ({ ...prev, [field]: url }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await saveShopProfile(profile);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F0F8FB]">
        <Loader2 className="animate-spin text-[#1AABDD]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F0F8FB] pb-24">
      {/* Header */}
      <div className="bg-[#1AABDD] px-5 pt-12 pb-5 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Settings size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-black text-white">{t('settings')}</h1>
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 ${saved ? 'bg-green-500 text-white' : 'bg-white text-[#1AABDD]'}`}
          >
            {saved ? <CheckCircle size={16} /> : null}
            {saved ? 'Saved!' : t('save')}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Language Toggle */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <p className="text-sm font-bold text-gray-700 mb-3">{t('language')}</p>
          <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
            <button onClick={() => setLang('bn')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${lang === 'bn' ? 'bg-[#1AABDD] text-white shadow-sm' : 'text-gray-500'}`}>
              বাংলা
            </button>
            <button onClick={() => setLang('en')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${lang === 'en' ? 'bg-[#1AABDD] text-white shadow-sm' : 'text-gray-500'}`}>
              English
            </button>
          </div>
        </div>

        {/* Shop Profile */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-base font-black text-gray-800">{t('shopProfile')}</h2>
          <div className="flex gap-6 pb-2">
            <ImageUploadBox label={t('logo')} field="logo" profile={profile} setProfile={setProfile} handleImageUpload={handleImageUpload} />
            <ImageUploadBox label={t('signature')} field="signature" profile={profile} setProfile={setProfile} handleImageUpload={handleImageUpload} wide />
          </div>
          <InputField label={t('shopNameBn')} name="nameBn" placeholder="e.g. ভাই ভাই এন্টারপ্রাইজ" profile={profile} onChange={handleChange} />
          <InputField label={t('shopNameEn')} name="nameEn" placeholder="e.g. Bhai Bhai Enterprise" profile={profile} onChange={handleChange} />
          <InputField label={t('phone')} name="phone" type="tel" placeholder="01XXXXXXXXX" profile={profile} onChange={handleChange} />
          <InputField label={t('address')} name="address" placeholder="Full shop address" rows={2} profile={profile} onChange={handleChange} />
        </div>

        {/* Terms */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-black text-gray-800 mb-4">{t('termsDesc')}</h2>
          <textarea name="terms" value={profile.terms} onChange={handleChange} rows={4}
            placeholder="আমাদের প্রতিষ্ঠান থেকে আপনি কখনাই প্রতারিত হবেন না। ইনশাআল্লাহ।"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1AABDD] focus:bg-white text-gray-800 text-sm resize-none" />
        </div>

        {/* Save Button */}
        <button onClick={handleSave} disabled={saving}
          className={`w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 ${saved ? 'bg-green-500 text-white' : 'bg-[#1AABDD] text-white disabled:opacity-70'}`}>
          {saving ? <Loader2 size={20} className="animate-spin" /> : saved ? <CheckCircle size={20} /> : null}
          {saving ? 'Saving...' : saved ? (lang === 'bn' ? 'সেভ হয়েছে!' : 'Saved!') : t('save')}
        </button>
      </div>
    </div>
  );
}
