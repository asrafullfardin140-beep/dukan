import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getInvoice, deleteInvoice, getShopProfile } from '../lib/storage';
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
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
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
    async function load() {
      const data = await getInvoice(id);
      const shopData = await getShopProfile();
      if (!data) navigate('/');
      else {
        setInvoice(data);
        setShop(shopData);
        setLoading(false);
        // schedule height update after render
        setTimeout(updateContainerHeight, 100);
      }
    }
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm(t('delete') + '?')) {
      await deleteInvoice(id);
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
      const a4W = pdf.internal.pageSize.getWidth();
      const a4H = pdf.internal.pageSize.getHeight();
      let pdfW = a4W;
      let pdfH = (canvas.height * pdfW) / canvas.width;
      
      if (pdfH > a4H) {
        pdfH = a4H;
        pdfW = (canvas.width * pdfH) / canvas.height;
      }
      
      pdf.addImage(imgData, 'JPEG', (a4W - pdfW) / 2, 0, pdfW, pdfH);
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
    if (!navigator.share) {
      alert('Web Share not supported by your browser. Please use Download PDF.');
      return;
    }

    setPdfLoading(true);
    const el = document.getElementById('invoice-pdf-render');
    if (!el) { setPdfLoading(false); return; }

    el.style.visibility = 'visible';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.display = 'block';
    el.style.width = '794px';

    try {
      await new Promise((r) => setTimeout(r, 200));
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const a4W = pdf.internal.pageSize.getWidth();
      const a4H = pdf.internal.pageSize.getHeight();
      let pdfW = a4W;
      let pdfH = (canvas.height * pdfW) / canvas.width;
      
      if (pdfH > a4H) {
        pdfH = a4H;
        pdfW = (canvas.width * pdfH) / canvas.height;
      }
      
      pdf.addImage(imgData, 'JPEG', (a4W - pdfW) / 2, 0, pdfW, pdfH);
      
      const pdfBlob = pdf.output('blob');
      const file = new File([pdfBlob], `Invoice_${invoice.id}.pdf`, { type: 'application/pdf' });

      el.style.display = 'none';
      setPdfLoading(false);

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Invoice ${invoice.id} — ${invoice.customerName}`,
        });
      } else {
        await navigator.share({
          title: `Invoice ${invoice.id} — ${invoice.customerName}`,
          text: `Invoice ${invoice.id}\nCustomer: ${invoice.customerName}\nTotal: ${formatBDT(invoice.total)}\nBalance: ${formatBDT(invoice.balance)}\n(PDF attachment not supported by this app)`,
        });
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        alert('Sharing failed. Try downloading instead.');
      }
      el.style.display = 'none';
      setPdfLoading(false);
    }
  };

  const handlePrint = async () => {
    setPdfLoading(true);
    const el = document.getElementById('invoice-pdf-render');
    if (!el) { setPdfLoading(false); return; }

    // Move off-screen (not visible but renderable)
    el.style.display = 'block';
    el.style.visibility = 'visible';
    el.style.position = 'fixed';
    el.style.left = '-9999px';
    el.style.top = '0';
    el.style.width = '794px';

    try {
      await new Promise((r) => setTimeout(r, 300)); // wait for fonts/images
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const a4W = pdf.internal.pageSize.getWidth();
      const a4H = pdf.internal.pageSize.getHeight();
      let pdfW = a4W;
      let pdfH = (canvas.height * pdfW) / canvas.width;
      
      if (pdfH > a4H) {
        pdfH = a4H;
        pdfW = (canvas.width * pdfH) / canvas.height;
      }
      
      pdf.addImage(imgData, 'JPEG', (a4W - pdfW) / 2, 0, pdfW, pdfH);

      // Open PDF as blob URL in new tab so user can print from PDF viewer
      const blob = pdf.output('blob');
      const url = URL.createObjectURL(blob);
      const tab = window.open(url, '_blank');
      // Auto-trigger print if the tab opened successfully
      if (tab) {
        tab.onload = () => {
          setTimeout(() => { tab.print(); }, 500);
        };
      }
    } catch (err) {
      console.error(err);
      alert('Could not generate print preview. Please use Download PDF instead.');
    } finally {
      el.style.display = 'none';
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      setPdfLoading(false);
    }
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
          body, * { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          body { background: white !important; margin: 0; padding: 0; }
          .hide-on-print { display: none !important; }
          #invoice-pdf-render { display: block !important; position: relative !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          @page { size: portrait; margin: 0; }
        }
      `}</style>

      {/* Header */}
      <div className="hide-on-print bg-white px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
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
      <div className="hide-on-print flex-1 px-4 py-4 flex items-start justify-center overflow-hidden">
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
              <InvoicePreview invoice={invoice} shop={shop} />
            </div>
          </div>
        </div>
      </div>

      {/* Hidden full-size for PDF */}
      <div
        id="invoice-pdf-render"
        style={{ display: 'none', width: '794px', background: '#fff' }}
      >
        <InvoicePreview invoice={invoice} shop={shop} />
      </div>

      {/* Action Buttons */}
      <div className="hide-on-print bg-white px-4 py-4 border-t border-gray-100 shadow-[0_-8px_20px_rgba(0,0,0,0.06)] sticky bottom-0 z-50">
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
