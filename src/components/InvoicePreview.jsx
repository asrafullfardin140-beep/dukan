import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatBDT } from '../lib/currency';
import { amountToWords } from '../lib/amountInWords';
import { format } from 'date-fns';

export default function InvoicePreview({ invoice, shop = {} }) {
  const { lang, toBnNum, t } = useLanguage();

  if (!invoice) return null;

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), 'dd/MM/yyyy'); } catch { return dateStr; }
  };
  const formatTime = (dateStr) => {
    try { return format(new Date(dateStr), 'hh:mm a'); } catch { return ''; }
  };

  const isUnpaid = Number(invoice.received || 0) === 0;
  const isPaid = Number(invoice.received || 0) >= Number(invoice.total || 0) && Number(invoice.total) > 0;
  const statusLabel = isPaid ? 'PAID' : isUnpaid ? 'UNPAID' : 'PARTIAL';
  const statusColor = isPaid ? '#1AABDD' : isUnpaid ? '#DC2626' : '#9333EA';

  return (
    <div
      style={{
        fontFamily: '"Inter", "Noto Sans Bengali", sans-serif',
        background: '#ffffff',
        width: '100%',
        padding: '50px',
        boxSizing: 'border-box',
        color: '#1a1a1a',
        fontSize: '18px',
        lineHeight: 1.5,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '3px solid #1AABDD', paddingBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {shop.logo && (
            <div style={{ maxWidth: '280px', maxHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
              <img src={shop.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '8px' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '32px', fontWeight: 900, color: '#0D8CBB', lineHeight: 1.2 }}>
              {lang === 'bn' ? (shop.nameBn || shop.nameEn) : (shop.nameEn || shop.nameBn)}
            </div>
            {shop.nameBn && shop.nameEn && (
              <div style={{ fontSize: '18px', fontWeight: 600, color: '#6b7280', marginTop: '4px' }}>
                {lang === 'bn' ? shop.nameEn : shop.nameBn}
              </div>
            )}
            {shop.phone && <div style={{ marginTop: '8px', fontSize: '17px', color: '#4b5563', fontWeight: 600 }}>📞 {shop.phone}</div>}
            {shop.address && <div style={{ fontSize: '16px', color: '#6b7280', maxWidth: '340px' }}>{shop.address}</div>}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '48px', fontWeight: 900, color: '#1AABDD', letterSpacing: '4px', textTransform: 'uppercase' }}>
            {t('invoiceTitle')}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '10px', fontSize: '17px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{t('invoiceNo')} :</span>
              <span style={{ fontWeight: 900, color: '#0D8CBB' }}>{invoice.id}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '17px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{t('date')} :</span>
              <span style={{ fontWeight: 700 }}>{formatDate(invoice.date)}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '17px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{t('time')} :</span>
              <span style={{ fontWeight: 700 }}>{formatTime(invoice.date)}</span>
            </div>
            <div style={{ marginTop: '12px', padding: '6px 16px', background: statusColor, color: '#fff', borderRadius: '8px', fontSize: '16px', fontWeight: 900, letterSpacing: '1px' }}>
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER ── */}
      <div style={{ marginBottom: '32px', background: '#f9fafb', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }}>Bill To</div>
        <div style={{ fontSize: '28px', fontWeight: 900, color: '#111827' }}>{invoice.customerName}</div>
        {invoice.customerPhone && <div style={{ fontSize: '18px', color: '#4b5563', fontWeight: 600, marginTop: '6px' }}>📱 {invoice.customerPhone}</div>}
        {invoice.customerLocation && <div style={{ fontSize: '17px', color: '#6b7280', marginTop: '4px' }}>📍 {invoice.customerLocation}</div>}
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '40px' }}>
        <thead>
          <tr style={{ background: '#1AABDD', color: '#ffffff' }}>
            {['#', 'Item & Description', 'Qty', 'Price/Unit', 'Amount'].map((h, i) => (
              <th key={i} style={{ padding: '14px 18px', textAlign: i === 0 ? 'center' : i >= 3 ? 'right' : 'left', fontSize: '16px', fontWeight: 700, letterSpacing: '0.5px', width: i === 0 ? '50px' : i === 2 ? '70px' : i >= 3 ? '130px' : 'auto' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '16px 18px', textAlign: 'center', color: '#6b7280', fontWeight: 600, fontSize: '16px' }}>{idx + 1}</td>
              <td style={{ padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '18px' }}>{item.name}</div>
                {item.desc && <div style={{ fontSize: '16px', color: '#9ca3af', marginTop: '4px' }}>{item.desc}</div>}
              </td>
              <td style={{ padding: '16px 18px', textAlign: 'center', fontWeight: 600, fontSize: '16px' }}>{item.qty}</td>
              <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 600, fontSize: '16px' }}>৳{Number(item.price || 0).toLocaleString('en-IN')}</td>
              <td style={{ padding: '16px 18px', textAlign: 'right', fontWeight: 700, color: '#111827', fontSize: '18px' }}>৳{(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── FOOTER ── */}
      <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
        {/* Left: Words + Terms + Note */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '24px', background: '#f9fafb', borderRadius: '12px', padding: '18px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Amount in Words</div>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: '17px', fontStyle: 'italic' }}>{amountToWords(Math.floor(invoice.total || 0))}</div>
          </div>


          {invoice.note && (
            <div style={{ borderLeft: '4px solid #f59e0b', paddingLeft: '16px', padding: '14px 14px 14px 18px', background: '#fffbf0', borderRadius: '0 10px 10px 0' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>Note</div>
              <div style={{ fontSize: '17px', color: '#78350f', fontStyle: 'italic' }}>"{invoice.note}"</div>
            </div>
          )}
        </div>

        {/* Right: Totals */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <div style={{ borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ background: '#f9fafb', padding: '16px 20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontWeight: 600, fontSize: '17px' }}>{t('subTotal')}</span>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: '17px' }}>{formatBDT(invoice.subtotal)}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ color: '#6b7280', fontWeight: 600, fontSize: '17px' }}>Discount ({invoice.discountPercent}%)</span>
                <span style={{ fontWeight: 700, color: '#DC2626', fontSize: '17px' }}>-{formatBDT(invoice.discountAmount)}</span>
              </div>
            )}
            <div style={{ background: '#1AABDD', padding: '18px 20px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '20px' }}>{t('totalBill')}</span>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '24px' }}>{formatBDT(invoice.total)}</span>
            </div>
            <div style={{ background: '#fff', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ color: '#6b7280', fontWeight: 600, fontSize: '17px' }}>{t('received')}</span>
              <span style={{ fontWeight: 700, color: '#111827', fontSize: '17px' }}>{formatBDT(invoice.received)}</span>
            </div>
            <div style={{ background: '#fff5f5', padding: '18px 20px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fecaca' }}>
              <span style={{ fontWeight: 800, color: '#b91c1c', fontSize: '18px' }}>{t('balance')}</span>
              <span style={{ fontWeight: 900, color: '#b91c1c', fontSize: '24px' }}>{formatBDT(invoice.balance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      <div style={{ marginTop: '80px', borderTop: '1px solid #e5e7eb', paddingTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '14px', color: '#d1d5db' }}>Generated by {shop.nameEn || shop.nameBn || 'M.R Electronics'}</div>
        <div style={{ textAlign: 'center' }}>
          {shop.signature
            ? <img src={shop.signature} alt="Signature" style={{ height: '80px', objectFit: 'contain', marginBottom: '12px', display: 'block', margin: '0 auto 12px' }} />
            : <div style={{ height: '80px', width: '260px', borderBottom: '2px dashed #9ca3af', marginBottom: '12px' }} />
          }
          <div style={{ borderTop: '3px solid #0D8CBB', paddingTop: '10px', fontWeight: 700, color: '#0D8CBB', fontSize: '17px', width: '260px', textAlign: 'center' }}>
            {t('authorizedSign')}
          </div>
        </div>
      </div>
    </div>
  );
}
