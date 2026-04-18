import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getInvoices, getShopProfile, deleteInvoice } from '../lib/storage';
import { formatBDT } from '../lib/currency';
import { Receipt, ChevronRight, Settings, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

function StatusBadge({ invoice }) {
  const total = Number(invoice.total || 0);
  const received = Number(invoice.received || 0);
  if (total === 0 || received <= 0)
    return <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-red-100 text-red-600">UNPAID</span>;
  if (received >= total)
    return <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-[#1AABDD]/15 text-[#0D8CBB]">PAID</span>;
  return <span className="text-[11px] px-2.5 py-0.5 rounded-md font-bold bg-purple-100 text-purple-700">PARTIAL</span>;
}

export default function Home() {
  const { t, toBnNum, lang } = useLanguage();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({ count: 0, collected: 0, due: 0 });
  const [shopName, setShopName] = useState('HisabBook');

  const loadData = () => {
    const data = getInvoices();
    setInvoices(data);
    let collected = 0, due = 0;
    data.forEach((inv) => {
      collected += Number(inv.received || 0);
      due += Number(inv.balance || 0);
    });
    setStats({ count: data.length, collected, due });
    const profile = getShopProfile();
    setShopName(lang === 'bn' && profile.nameBn ? profile.nameBn : profile.nameEn || 'HisabBook');
  };

  useEffect(() => { loadData(); }, [lang]);

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this invoice?')) { deleteInvoice(id); loadData(); }
  };

  const formatDate = (ds) => { try { return format(new Date(ds), 'd MMM, yyyy'); } catch { return ds; } };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F0F8FB] pb-24">
      {/* Header */}
      <div className="bg-[#1AABDD] px-5 pt-12 pb-5 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Receipt size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white leading-tight">{shopName}</h1>
              <p className="text-xs text-white/70 font-medium">HisabBook</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white active:scale-95 transition-transform"
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Stats Row inside header */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-white/20 rounded-2xl p-3 text-center">
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-wide">{t('totalInvoices')}</p>
            <h2 className="text-2xl font-black text-white mt-1">{toBnNum(stats.count)}</h2>
          </div>
          <div className="bg-white/20 rounded-2xl p-3 text-center">
            <p className="text-[10px] text-white/70 font-bold uppercase tracking-wide">{t('totalCollected')}</p>
            <h2 className="text-base font-black text-white mt-1 leading-tight">{formatBDT(stats.collected)}</h2>
          </div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">{t('balanceDue')}</p>
            <h2 className="text-base font-black text-red-500 mt-1 leading-tight">{formatBDT(stats.due)}</h2>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Invoice List Header */}
        <div className="flex items-center justify-between pt-1">
          <h2 className="text-lg font-black text-gray-900">{t('invoiceList')}</h2>
          <span className="text-sm text-[#1AABDD] font-semibold">{toBnNum(invoices.length)} টি</span>
        </div>

        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 bg-white rounded-2xl border-2 border-dashed border-[#1AABDD]/30">
            <Receipt size={40} className="text-[#1AABDD]/30 mb-3" />
            <p className="text-gray-400 font-medium text-sm">নতুন ইনভয়েস তৈরি করুন</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform cursor-pointer"
                onClick={() => navigate(`/invoice/${invoice.id}`)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-base truncate">{invoice.customerName}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      #{invoice.id} &nbsp;·&nbsp; {formatDate(invoice.date)}
                    </p>
                  </div>
                  <div className="ml-3 text-right">
                    <div className="font-black text-gray-900 text-base">{formatBDT(invoice.total)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge invoice={invoice} />
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => handleDelete(e, invoice.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={15} />
                    </button>
                    <ChevronRight size={16} className="text-gray-300" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/new')}
        className="fixed bottom-24 right-5 w-14 h-14 bg-[#DC2626] rounded-full flex items-center justify-center shadow-xl text-white text-3xl z-40 active:scale-95 transition-transform"
      >
        +
      </button>
    </div>
  );
}
