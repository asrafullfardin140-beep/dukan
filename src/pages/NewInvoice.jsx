import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getNextInvoiceNumber, saveInvoice, getInvoices, getInvoice } from '../lib/storage';
import { amountToWords } from '../lib/amountInWords';
import { formatBDT } from '../lib/currency';
import { ArrowLeft, ArrowRight, UserPlus, Trash2 } from 'lucide-react';

// ─── Step 1: Customer Details ─────────────────────────────────────────────────
function StepCustomer({ invoice, onChange, recentCustomers, onSelectRecent }) {
  const { t } = useLanguage();
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
      <div className="flex items-center gap-2 text-gray-800 font-bold text-lg mb-5">
        <UserPlus size={20} className="text-[#1AABDD]" />
        {t('customerInfo')}
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerName')}</label>
          <input type="text" name="customerName" value={invoice.customerName} onChange={onChange} placeholder={t('namePlaceholder')}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1AABDD] text-base" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('customerPhone')}</label>
          <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-[#1AABDD]">
            <span className="px-3 py-3 bg-gray-100 text-gray-500 border-r border-gray-200 font-medium text-sm flex items-center">+880</span>
            <input type="tel" name="customerPhone" value={invoice.customerPhone} onChange={onChange} placeholder="01XXXXXXXXX"
              className="flex-1 px-3 py-3 bg-transparent focus:outline-none text-base" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">{t('location')}</label>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">ঐচ্ছিক</span>
          </div>
          <input type="text" name="customerLocation" value={invoice.customerLocation} onChange={onChange} placeholder={t('locationPlaceholder')}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1AABDD] text-base" />
        </div>
        {recentCustomers.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">{t('recentCustomers')}</p>
            <div className="flex flex-wrap gap-2">
              {recentCustomers.map((name) => (
                <button key={name} type="button" onClick={() => onSelectRecent(name)}
                  className="px-3 py-1.5 bg-[#E5F6FC] text-[#0D8CBB] border border-[#1AABDD]/25 rounded-full text-sm font-medium active:scale-95 transition-transform">
                  {name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Step 2: Items ────────────────────────────────────────────────────────────
function StepItems({ invoice, onItemChange, onAddItem, onRemoveItem }) {
  const { t } = useLanguage();
  const subtotal = invoice.items.reduce((acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0), 0);

  return (
    <div className="space-y-3">
      {invoice.items.length === 0 && (
        <p className="text-center text-gray-400 py-6 text-sm">{t('addItemBtn')} — এখনও কোনো পণ্য নেই</p>
      )}
      {invoice.items.map((item, idx) => (
        <div key={idx} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 relative">
          <button type="button" onClick={() => onRemoveItem(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600 p-1">
            <Trash2 size={17} />
          </button>
          <div className="pr-8 space-y-2">
            <input type="text" placeholder={t('itemName')} value={item.name} onChange={(e) => onItemChange(idx, 'name', e.target.value)}
              className="w-full text-base font-bold text-gray-800 placeholder-gray-300 focus:outline-none border-b border-gray-100 pb-1" />
            <input type="text" placeholder={t('itemDesc')} value={item.desc} onChange={(e) => onItemChange(idx, 'desc', e.target.value)}
              className="w-full text-xs text-gray-500 placeholder-gray-300 focus:outline-none" />
            <div className="flex gap-2 pt-2">
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t('qty')}</label>
                <input type="number" inputMode="numeric" value={item.qty} onChange={(e) => onItemChange(idx, 'qty', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1AABDD] text-base text-center font-bold" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t('price')} ৳</label>
                <input type="number" inputMode="decimal" placeholder="0" value={item.price} onChange={(e) => onItemChange(idx, 'price', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#1AABDD] text-base font-bold" />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t('amount')} ৳</label>
                <div className="w-full px-3 py-2 bg-[#1AABDD]/10 text-[#0D8CBB] rounded-lg font-bold text-base">
                  {(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={onAddItem}
        className="w-full py-4 border-2 border-dashed border-[#1AABDD]/40 text-[#1AABDD] font-bold rounded-2xl bg-[#1AABDD]/5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform text-base">
        {t('addItemBtn')}
      </button>
      {invoice.items.length > 0 && (
        <div className="bg-[#1AABDD] text-white p-4 rounded-2xl flex justify-between items-center shadow-md">
          <span className="font-bold text-base">{t('subTotal')}</span>
          <span className="text-xl font-black">{formatBDT(subtotal)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Step 3: Summary ──────────────────────────────────────────────────────────
function StepSummary({ invoice, onChange }) {
  const { t } = useLanguage();
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-center py-2 border-b border-gray-100">
          <span className="text-gray-600 font-medium">{t('subTotal')}</span>
          <span className="font-bold text-gray-900">{formatBDT(invoice.subtotal)}</span>
        </div>
        <div className="py-4 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t('discount')}</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">৳</span>
              <input type="number" inputMode="decimal" name="discountAmount"
                value={invoice.discountAmount > 0 ? invoice.discountAmount : ''}
                onChange={onChange} placeholder="0"
                className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#1AABDD] text-base font-bold" />
            </div>
            <div className="w-20 flex items-center justify-center bg-gray-100 text-gray-600 font-bold rounded-xl border border-gray-200">
              {invoice.discountPercent || 0}%
            </div>
          </div>
          {Number(invoice.discountAmount) > 0 && (
            <p className="text-[#1AABDD] text-sm mt-2 text-center font-semibold">
              {t('youSaved', { amount: formatBDT(invoice.discountAmount) })}
            </p>
          )}
        </div>
        <div className="bg-[#E5F6FC] -mx-5 px-5 py-4 border-y border-[#1AABDD]/20 flex justify-between items-center my-2">
          <span className="text-[#0D8CBB] font-bold text-lg">{t('totalBill')}</span>
          <span className="text-[#0D8CBB] font-black text-2xl">{formatBDT(invoice.total)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('received')}</label>
            <input type="number" inputMode="decimal" name="received"
              value={invoice.received || ''}
              onChange={onChange} placeholder="0"
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-800 rounded-xl focus:outline-none text-base font-bold" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('balance')}</label>
            <div className="w-full px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-[#DC2626] font-black text-base">
              {formatBDT(invoice.balance)}
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
          <p className="text-xs text-gray-500 italic">
            <span className="font-bold text-gray-700">In Words: </span>
            {amountToWords(Math.floor(invoice.total))}
          </p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 border-2 border-dashed border-gray-200">
        <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t('customerNote')}</label>
        <textarea name="note" value={invoice.note} onChange={onChange} rows={2}
          placeholder={t('customerNotePlaceholder')}
          className="w-full bg-transparent focus:outline-none text-sm text-gray-700 resize-none" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewInvoice() {
  const { t, toBnNum } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(1);
  const [recentCustomers, setRecentCustomers] = useState([]);

  const [invoice, setInvoice] = useState({
    id: '', date: new Date().toISOString(),
    customerName: '', customerPhone: '', customerLocation: '',
    items: [], subtotal: 0, discountAmount: 0, discountPercent: 0,
    total: 0, received: 0, balance: 0,
    note: 'সময়মতো পেমেন্ট করার জন্য ধন্যবাদ।',
  });

  useEffect(() => {
    if (id) {
      const existing = getInvoice(id);
      if (existing) {
        setInvoice(existing);
      } else {
        navigate('/');
      }
    } else {
      setInvoice((prev) => ({ ...prev, id: getNextInvoiceNumber() }));
    }
    const all = getInvoices();
    const names = [...new Set(all.map((i) => i.customerName).filter(Boolean))].slice(0, 5);
    setRecentCustomers(names);
  }, [id, navigate]);

  useEffect(() => {
    const subtotal = invoice.items.reduce((acc, item) => acc + Number(item.qty || 0) * Number(item.price || 0), 0);
    const discountAmount = Number(invoice.discountAmount || 0);
    const total = Math.max(subtotal - discountAmount, 0);
    const received = Number(invoice.received || 0);
    const balance = Math.max(total - received, 0);
    const discountPercent = subtotal > 0 ? Math.round((discountAmount / subtotal) * 100) : 0;
    setInvoice((prev) => ({ ...prev, subtotal, total, balance, discountPercent }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice.items, invoice.discountAmount, invoice.received]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setInvoice((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSelectRecent = useCallback((name) => {
    const match = getInvoices().find((i) => i.customerName === name);
    setInvoice((prev) => ({ ...prev, customerName: name, customerPhone: match?.customerPhone || prev.customerPhone, customerLocation: match?.customerLocation || prev.customerLocation }));
  }, []);

  const addItem = useCallback(() => {
    setInvoice((prev) => ({ ...prev, items: [...prev.items, { name: '', desc: '', qty: 1, price: '' }] }));
  }, []);

  const removeItem = useCallback((index) => {
    setInvoice((prev) => { const items = [...prev.items]; items.splice(index, 1); return { ...prev, items }; });
  }, []);

  const handleItemChange = useCallback((index, field, value) => {
    setInvoice((prev) => { const items = [...prev.items]; items[index] = { ...items[index], [field]: value }; return { ...prev, items }; });
  }, []);

  const handleNext = () => {
    if (step === 1 && !invoice.customerName.trim()) { alert('Customer Name is required!'); return; }
    setStep((s) => Math.min(s + 1, 3));
  };

  const handleSaveAndPreview = () => { saveInvoice(invoice); navigate(`/invoice/${invoice.id}`); };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F0F8FB]">
      {/* Header */}
      <div className="bg-[#1AABDD] px-5 pt-12 pb-5 sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-black text-white flex-1">{id ? `Edit #${invoice.id}` : t('newInvoice')}</h1>
        </div>
        {/* Progress in header */}
        <div className="flex items-center justify-center gap-3 mt-4">
          {[1, 2, 3].map((s, i) => (
            <React.Fragment key={s}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step >= s ? 'bg-white text-[#1AABDD] shadow-md' : 'bg-white/20 text-white/60'}`}>
                {toBnNum(s)}
              </div>
              {i < 2 && <div className={`flex-1 h-0.5 transition-all ${step > s ? 'bg-white' : 'bg-white/30'}`} />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Invoice Meta */}
      <div className="px-5 pt-4 flex gap-3 mb-4">
        <div className="bg-white flex-1 px-4 py-3 rounded-xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-500 mb-0.5 font-medium uppercase tracking-wider">{t('invoiceNo')}</p>
          <p className="font-bold text-[#1AABDD]">#{invoice.id}</p>
        </div>
        <div className="bg-white flex-1 px-4 py-3 rounded-xl shadow-sm border border-gray-100">
          <p className="text-[10px] text-gray-500 mb-0.5 font-medium uppercase tracking-wider">{t('date')}</p>
          <p className="font-bold text-gray-700">{new Date(invoice.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-5 pb-32 overflow-y-auto">
        {step === 1 && <StepCustomer invoice={invoice} onChange={handleChange} recentCustomers={recentCustomers} onSelectRecent={handleSelectRecent} />}
        {step === 2 && <StepItems invoice={invoice} onItemChange={handleItemChange} onAddItem={addItem} onRemoveItem={removeItem} />}
        {step === 3 && <StepSummary invoice={invoice} onChange={handleChange} />}
      </div>

      {/* Bottom Action */}
      <div className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-gray-100 px-5 py-4 z-50 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] flex gap-3 items-center">
        {step > 1 && (
          <button type="button" onClick={() => setStep((s) => Math.max(s - 1, 1))}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-gray-500 bg-gray-100 active:scale-95 transition-transform">
            <ArrowLeft size={22} />
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={handleNext}
            className="flex-1 h-14 bg-[#1AABDD] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform text-base">
            {t('next')} <ArrowRight size={20} />
          </button>
        ) : (
          <button type="button" onClick={handleSaveAndPreview}
            className="flex-1 h-14 bg-[#1AABDD] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform text-base">
            👁 {t('previewBtn')}
          </button>
        )}
      </div>
    </div>
  );
}
