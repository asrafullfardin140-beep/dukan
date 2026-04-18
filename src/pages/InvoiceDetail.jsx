import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getInvoice, deleteInvoice } from '../lib/storage';
import InvoicePreview from '../components/InvoicePreview';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ArrowLeft, Share2, Download, Printer, Trash2, Loader2, Edit3 } from 'lucide-react';
import { formatBDT } from '../lib/currency';

function StatusBadge({ invoice }) {
  const total = Number(invoice.total || 0);
  const received = Number(invoice.received || 0);
  if (total === 0 || received <= 0) return <span className="px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-600">UNPAID</span>;
  if (received >= total) return <span className="px-3 py-1 rounded-lg text-xs font-bold bg-[#1AABDD]/15 text-[#0D8CBB]">PAID</span>;
  return <span className="px-3 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700">PARTIAL</span>;
}

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [invoice, setInvoice] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const printRef = useRef(null);
  const scaleRef = useRef(null);
  const scaleWrapRef = useRef(null);

  // Dynamically size the wrapper to match the scaled visual height
  const updateContainerHeight = () => {
    if (scaleRef.current && scaleWrapRef.current) {
      const inner = scaleRef.current;
      const h = inner.scrollHeight;
      scaleWrapRef.current.style.height = Math.ceil(h * 0.46) + 'px';
    }
  };

  useEffect(() => {
    const data = getInvoice(id);
    if (!data) navigate('/');
    else {
      setInvoice(data);
      // schedule height update after render
      setTimeout(updateContainerHeight, 100);
    }
  }, [id, navigate]);

  const handleDelete = () => {
    if (window.confirm('Delete this invoice?')) {
      deleteInvoice(id);
      navigate('/');
    }
  };

  const handleDownloadPdf = async () => {
    setPdfLoading(true);
    const el = document.getElementById('invoice-pdf-render');
    if (!el) return;
    el.style.visibility = 'visible';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.display = 'block';
    el.style.width = '794px'; // A4 at 96dpi

    try {
      await new Promise((r) => setTimeout(r, 200)); // let fonts render
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (canvas.height * pdfW) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH);
      pdf.save(`${invoice.id}.pdf`);
    } catch (err) {
      console.error(err);
      alert('PDF generation failed. Try Print instead.');
    } finally {
      el.style.display = 'none';
      setPdfLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Invoice ${invoice.id} — ${invoice.customerName}`,
          text: `Invoice ${invoice.id}\nCustomer: ${invoice.customerName}\nTotal: ${formatBDT(invoice.total)}\nBalance: ${formatBDT(invoice.balance)}`,
        });
      } catch (err) {
        if (err.name !== 'AbortError') alert('Sharing failed.');
      }
    } else {
      alert('Web Share not supported. Please use Download PDF.');
    }
  };

  const handlePrint = () => {
    const el = document.getElementById('invoice-pdf-render');
    if (el) {
      el.style.display = 'block';
      el.style.visibility = 'visible';
    }
    window.print();
    setTimeout(() => { if (el) el.style.display = 'none'; }, 1000);
  };

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[#1AABDD]" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#F0F8FB]">
      {/* Print CSS */}
      <style>{`
        @media print {
          body > * { display: none !important; }
          #invoice-pdf-render { display: block !important; position: static !important; visibility: visible !important; width: 100% !important; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center active:scale-95 transition-transform">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-base font-black text-gray-900">#{invoice.id}</h1>
            <p className="text-xs text-gray-500">{invoice.customerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge invoice={invoice} />
          <button onClick={handleDelete} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-400 active:scale-95 transition-transform">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Preview Area — scaled-down visual */}
      <div className="flex-1 px-4 py-4 flex items-start justify-center overflow-hidden">
        <div
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          style={{ width: '100%' }}
        >
          {/* Scale wrapper: 794px content at ~46% = ~365px visual */}
          <div ref={scaleWrapRef} style={{ width: '100%', overflowX: 'hidden', overflowY: 'hidden' }}>
            <div
              id="preview-scale-inner"
              ref={scaleRef}
              style={{
                transform: 'scale(0.46)',
                transformOrigin: 'top left',
                width: '794px',
                pointerEvents: 'none',
              }}
            >
              <InvoicePreview invoice={invoice} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size for PDF */}
      <div
        id="invoice-pdf-render"
        style={{ display: 'none', width: '794px', background: '#fff' }}
      >
        <InvoicePreview invoice={invoice} />
      </div>

      {/* Action Buttons */}
      <div className="bg-white px-4 py-4 border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] sticky bottom-0 z-50">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={() => navigate(`/edit/${invoice.id}`)}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-orange-50 text-orange-600 font-bold active:scale-95 transition-transform"
          >
            <Edit3 size={22} />
            <span className="text-xs">{t('edit')}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-blue-50 text-blue-600 font-bold active:scale-95 transition-transform"
          >
            <Share2 size={22} />
            <span className="text-xs">{t('share')}</span>
          </button>
          <button
            onClick={handleDownloadPdf}
            disabled={pdfLoading}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-[#1AABDD]/10 text-[#0D8CBB] font-bold active:scale-95 transition-transform disabled:opacity-70"
          >
            {pdfLoading
              ? <Loader2 size={22} className="animate-spin" />
              : <Download size={22} />}
            <span className="text-xs">{pdfLoading ? '...' : t('downloadPdf')}</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex flex-col items-center justify-center gap-1.5 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold active:scale-95 transition-transform"
          >
            <Printer size={22} />
            <span className="text-xs">{t('print')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
