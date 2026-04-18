import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatBDT } from '../lib/currency';
import { amountToWords } from '../lib/amountInWords';
import { getShopProfile } from '../lib/storage';
import { format } from 'date-fns';

export default function InvoicePreview({ invoice }) {
  const { lang, toBnNum, t } = useLanguage();
  const shop = getShopProfile();

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
  const statusColor = isPaid ? '#6B7C3F' : isUnpaid ? '#DC2626' : '#9333EA';

  return (
    <div
      style={{
        fontFamily: '"Hind Siliguri", sans-serif',
        background: '#ffffff',
        width: '100%',
        padding: '40px',
        boxSizing: 'border-box',
        color: '#1a1a1a',
        fontSize: '14px',
        lineHeight: 1.5,
      }}
    >
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', borderBottom: '3px solid #6B7C3F', paddingBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {shop.logo && (
            <div style={{ width: '72px', height: '72px', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src={shop.logo} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#4A5A2A', lineHeight: 1.2 }}>
              {lang === 'bn' ? (shop.nameBn || shop.nameEn) : (shop.nameEn || shop.nameBn)}
            </div>
            {shop.nameBn && shop.nameEn && (
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginTop: '2px' }}>
                {lang === 'bn' ? shop.nameEn : shop.nameBn}
              </div>
            )}
            {shop.phone && <div style={{ marginTop: '6px', fontSize: '13px', color: '#4b5563', fontWeight: 600 }}>📞 {shop.phone}</div>}
            {shop.address && <div style={{ fontSize: '12px', color: '#6b7280', maxWidth: '280px' }}>{shop.address}</div>}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '36px', fontWeight: 900, color: '#6B7C3F', letterSpacing: '3px', textTransform: 'uppercase' }}>
            {t('invoiceTitle')}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{t('invoiceNo')} :</span>
              <span style={{ fontWeight: 900, color: '#4A5A2A' }}>{invoice.id}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{t('date')} :</span>
              <span style={{ fontWeight: 700 }}>{formatDate(invoice.date)}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{t('time')} :</span>
              <span style={{ fontWeight: 700 }}>{formatTime(invoice.date)}</span>
            </div>
            <div style={{ marginTop: '8px', padding: '4px 12px', background: statusColor, color: '#fff', borderRadius: '6px', fontSize: '12px', fontWeight: 900, letterSpacing: '1px' }}>
              {statusLabel}
            </div>
          </div>
        </div>
      </div>

      {/* ── CUSTOMER ── */}
      <div style={{ marginBottom: '24px', background: '#f9fafb', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bill To</div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#111827' }}>{invoice.customerName}</div>
        {invoice.customerPhone && <div style={{ fontSize: '14px', color: '#4b5563', fontWeight: 600, marginTop: '4px' }}>📱 {invoice.customerPhone}</div>}
        {invoice.customerLocation && <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>📍 {invoice.customerLocation}</div>}
      </div>

      {/* ── ITEMS TABLE ── */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
        <thead>
          <tr style={{ background: '#6B7C3F', color: '#ffffff' }}>
            {['#', 'Item & Description', 'Qty', 'Price/Unit', 'Amount'].map((h, i) => (
              <th key={i} style={{ padding: '10px 14px', textAlign: i === 0 ? 'center' : i >= 3 ? 'right' : 'left', fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', width: i === 0 ? '40px' : i === 2 ? '60px' : i >= 3 ? '110px' : 'auto' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(invoice.items || []).map((item, idx) => (
            <tr key={idx} style={{ background: idx % 2 === 0 ? '#ffffff' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '12px 14px', textAlign: 'center', color: '#6b7280', fontWeight: 600 }}>{idx + 1}</td>
              <td style={{ padding: '12px 14px' }}>
                <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px' }}>{item.name}</div>
                {item.desc && <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{item.desc}</div>}
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600 }}>{item.qty}</td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>৳{Number(item.price || 0).toLocaleString('en-IN')}</td>
              <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#111827' }}>৳{(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString('en-IN')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ── FOOTER ── */}
      <div style={{ display: 'flex', gap: '32px', justifyContent: 'space-between' }}>
        {/* Left: Words + Terms + Note */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '16px', background: '#f9fafb', borderRadius: '10px', padding: '14px', border: '1px solid #e5e7eb' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Amount in Words</div>
            <div style={{ fontWeight: 700, color: '#111827', fontSize: '13px', fontStyle: 'italic' }}>{amountToWords(Math.floor(invoice.total || 0))}</div>
          </div>

          {shop.terms && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>{t('termsDesc')}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', background: '#fffbf0', borderLeft: '3px solid #6B7C3F', paddingLeft: '12px', padding: '10px 10px 10px 14px', borderRadius: '0 8px 8px 0' }}>{shop.terms}</div>
            </div>
          )}

          {invoice.note && (
            <div style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '12px', padding: '10px 10px 10px 14px', background: '#fffbf0', borderRadius: '0 8px 8px 0' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>Note</div>
              <div style={{ fontSize: '13px', color: '#78350f', fontStyle: 'italic' }}>"{invoice.note}"</div>
            </div>
          )}
        </div>

        {/* Right: Totals */}
        <div style={{ width: '280px', flexShrink: 0 }}>
          <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ background: '#f9fafb', padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{t('subTotal')}</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{formatBDT(invoice.subtotal)}</span>
            </div>
            {Number(invoice.discountAmount) > 0 && (
              <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb' }}>
                <span style={{ color: '#6b7280', fontWeight: 600 }}>Discount ({invoice.discountPercent}%)</span>
                <span style={{ fontWeight: 700, color: '#DC2626' }}>-{formatBDT(invoice.discountAmount)}</span>
              </div>
            )}
            <div style={{ background: '#6B7C3F', padding: '14px 16px', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: '15px' }}>{t('totalBill')}</span>
              <span style={{ color: '#fff', fontWeight: 900, fontSize: '18px' }}>{formatBDT(invoice.total)}</span>
            </div>
            <div style={{ background: '#fff', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ color: '#6b7280', fontWeight: 600 }}>{t('received')}</span>
              <span style={{ fontWeight: 700, color: '#111827' }}>{formatBDT(invoice.received)}</span>
            </div>
            <div style={{ background: '#fff5f5', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #fecaca' }}>
              <span style={{ fontWeight: 800, color: '#b91c1c', fontSize: '14px' }}>{t('balance')}</span>
              <span style={{ fontWeight: 900, color: '#b91c1c', fontSize: '18px' }}>{formatBDT(invoice.balance)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SIGNATURE ── */}
      <div style={{ marginTop: '60px', borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '11px', color: '#d1d5db' }}>Generated by HisabBook</div>
        <div style={{ textAlign: 'center' }}>
          {shop.signature
            ? <img src={shop.signature} alt="Signature" style={{ height: '60px', objectFit: 'contain', marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
            : <div style={{ height: '60px', width: '200px', borderBottom: '1px dashed #9ca3af', marginBottom: '8px' }} />
          }
          <div style={{ borderTop: '2px solid #4A5A2A', paddingTop: '8px', fontWeight: 700, color: '#4A5A2A', fontSize: '13px', width: '200px', textAlign: 'center' }}>
            {t('authorizedSign')}
          </div>
        </div>
      </div>
    </div>
  );
}
