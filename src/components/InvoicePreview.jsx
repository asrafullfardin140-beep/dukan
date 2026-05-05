import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatBDT } from '../lib/currency';
import { amountToWords } from '../lib/amountInWords';
import { format } from 'date-fns';

export default function InvoicePreview({ invoice, shop = {} }) {
  const { lang, toBnNum, t } = useLanguage();

  if (!invoice) return null;

  const formatDate = (dateStr) => {
    try { return format(new Date(dateStr), 'MMM dd, yyyy'); } catch { return dateStr; }
  };
  const formatTime = (dateStr) => {
    try { return format(new Date(dateStr), 'hh:mm a'); } catch { return ''; }
  };

  const isUnpaid = Number(invoice.received || 0) === 0;
  const isPaid = Number(invoice.received || 0) >= Number(invoice.total || 0) && Number(invoice.total) > 0;
  const statusLabel = isPaid ? 'PAID' : isUnpaid ? 'UNPAID' : 'PARTIAL';
  const statusColor = isPaid ? '#10B981' : isUnpaid ? '#EF4444' : '#F59E0B';
  const primaryColor = '#1AABDD';

  return (
    <div
      style={{
        fontFamily: '"Inter", "Noto Sans Bengali", sans-serif',
        background: '#ffffff',
        width: '100%',
        padding: '50px',
        boxSizing: 'border-box',
        color: '#111827',
        fontSize: '13px',
        lineHeight: 1.5,
        minHeight: '1123px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── TOP HEADER ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        {/* Left: Logo & Company Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {shop.logo ? (
            <img src={shop.logo} alt="Logo" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '12px' }} />
          ) : (
            <div style={{ width: '64px', height: '64px', background: `${primaryColor}15`, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontSize: '24px', fontWeight: 900 }}>
              {(shop.nameEn || shop.nameBn || 'M')[0]}
            </div>
          )}
          <div>
            <div style={{ fontSize: '26px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
              {lang === 'bn' ? (shop.nameBn || shop.nameEn) : (shop.nameEn || shop.nameBn)}
            </div>
            {shop.nameBn && shop.nameEn && (
              <div style={{ fontSize: '13px', fontWeight: 600, color: primaryColor, letterSpacing: '1px', textTransform: 'uppercase' }}>
                {lang === 'bn' ? shop.nameEn : shop.nameBn}
              </div>
            )}
          </div>
        </div>

        {/* Right: INVOICE Title */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '42px', fontWeight: 900, color: '#111827', letterSpacing: '2px', textTransform: 'uppercase', lineHeight: 1 }}>
            INVOICE
          </div>
          <div style={{ width: '40px', height: '4px', background: primaryColor, marginLeft: 'auto', marginTop: '12px', borderRadius: '2px' }} />
        </div>
      </div>

      {/* ── INFO SECTION ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        {/* Left: Bill To */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
            Bill To
          </div>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            {invoice.customerName}
          </div>
          {invoice.customerLocation && <div style={{ color: '#4B5563', fontSize: '13px' }}>{invoice.customerLocation}</div>}
          {invoice.customerPhone && <div style={{ color: '#4B5563', fontSize: '13px' }}>{invoice.customerPhone}</div>}
        </div>

        {/* Right: Invoice Meta */}
        <div>
          <table style={{ borderCollapse: 'collapse', fontSize: '13px' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 16px 4px 0', color: '#6B7280', fontWeight: 600, textAlign: 'right' }}>Invoice No.</td>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#111827' }}>{invoice.id}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 16px 4px 0', color: '#6B7280', fontWeight: 600, textAlign: 'right' }}>Invoice Date</td>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#111827' }}>{formatDate(invoice.date)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 16px 4px 0', color: '#6B7280', fontWeight: 600, textAlign: 'right' }}>Time</td>
                <td style={{ padding: '4px 0', fontWeight: 700, color: '#111827' }}>{formatTime(invoice.date)}</td>
              </tr>
              <tr>
                <td style={{ padding: '4px 16px 4px 0', color: '#6B7280', fontWeight: 600, textAlign: 'right' }}>Status</td>
                <td style={{ padding: '4px 0', fontWeight: 800, color: statusColor }}>{statusLabel}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Shop Contact Pills (if available) */}
      {(shop.phone || shop.address) && (
        <div style={{ background: '#F8FAFC', padding: '12px 20px', borderRadius: '12px', display: 'flex', gap: '32px', marginBottom: '40px', border: '1px solid #F1F5F9' }}>
          {shop.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: primaryColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📞</div>
              <div>
                <div style={{ fontSize: '12px', color: '#111827', fontWeight: 600 }}>{shop.phone}</div>
                <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone</div>
              </div>
            </div>
          )}
          {shop.address && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: primaryColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>📍</div>
              <div>
                <div style={{ fontSize: '12px', color: '#111827', fontWeight: 600 }}>{shop.address}</div>
                <div style={{ fontSize: '10px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Address</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ITEMS TABLE ── */}
      <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', marginBottom: '40px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: primaryColor, color: '#ffffff' }}>
              <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>Item Description</th>
              <th style={{ padding: '16px 24px', textAlign: 'center', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', width: '80px' }}>Qty</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', width: '120px' }}>Unit Price</th>
              <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', width: '120px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {(invoice.items || []).map((item, idx) => (
              <tr key={idx} style={{ borderBottom: idx !== invoice.items.length - 1 ? '1px solid #F1F5F9' : 'none', background: '#ffffff' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F8FAFC', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: primaryColor, fontWeight: 800, fontSize: '16px' }}>
                      {item.name ? item.name.charAt(0).toUpperCase() : '-'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111827', fontSize: '14px', marginBottom: '2px' }}>{item.name}</div>
                      {item.desc && <div style={{ fontSize: '12px', color: '#6B7280' }}>{item.desc}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: '20px 24px', textAlign: 'center', fontWeight: 600, color: '#4B5563' }}>{item.qty}</td>
                <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 600, color: '#4B5563' }}>৳{Number(item.price || 0).toLocaleString('en-IN')}</td>
                <td style={{ padding: '20px 24px', textAlign: 'right', fontWeight: 800, color: '#111827' }}>৳{(Number(item.qty || 0) * Number(item.price || 0)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── FOOTER & TOTALS ── */}
      <div style={{ display: 'flex', gap: '40px', justifyContent: 'space-between' }}>
        {/* Left: Notes & Words */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {invoice.note && (
            <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: primaryColor }}>📝</span>
                <span style={{ fontSize: '11px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Notes</span>
              </div>
              <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6, fontStyle: 'italic' }}>"{invoice.note}"</div>
            </div>
          )}

          <div style={{ background: '#F8FAFC', borderRadius: '16px', padding: '20px', border: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ color: primaryColor }}>💵</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '1px' }}>Amount in Words</span>
            </div>
            <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6, fontWeight: 600 }}>{amountToWords(Math.floor(invoice.total || 0))}</div>
          </div>
        </div>

        {/* Right: Totals */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: '#6B7280', fontWeight: 600 }}>Subtotal</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>{formatBDT(invoice.subtotal)}</span>
          </div>
          {Number(invoice.discountAmount) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#6B7280', fontWeight: 600 }}>Discount ({invoice.discountPercent}%)</span>
              <span style={{ fontWeight: 700, color: '#EF4444' }}>-{formatBDT(invoice.discountAmount)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #F1F5F9' }}>
            <span style={{ color: primaryColor, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Total Bill</span>
            <span style={{ fontWeight: 900, color: primaryColor, fontSize: '18px' }}>{formatBDT(invoice.total)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', marginBottom: '16px' }}>
            <span style={{ color: '#6B7280', fontWeight: 600 }}>Received</span>
            <span style={{ fontWeight: 700, color: '#111827' }}>{formatBDT(invoice.received)}</span>
          </div>

          <div style={{ background: primaryColor, borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff', boxShadow: `0 10px 25px -5px ${primaryColor}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>💳</div>
              <div style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Balance<br/>Due</div>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 900 }}>{formatBDT(invoice.balance)}</div>
          </div>
        </div>
      </div>

      <div style={{ flexGrow: 1 }}></div>

      {/* ── SIGNATURE ── */}
      <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>
          Thank you for your business! <span style={{ color: primaryColor }}>💙</span>
          <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', fontWeight: 500 }}>Generated by {shop.nameEn || shop.nameBn || 'Dukan'}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          {shop.signature ? (
            <img src={shop.signature} alt="Signature" style={{ height: '70px', objectFit: 'contain', display: 'block', margin: '0 auto 12px' }} />
          ) : (
            <div style={{ height: '70px', width: '200px', marginBottom: '12px' }} />
          )}
          <div style={{ borderTop: '2px solid #E2E8F0', paddingTop: '12px', fontWeight: 700, color: '#111827', fontSize: '14px', width: '200px', textAlign: 'center' }}>
            {t('authorizedSign')}
          </div>
        </div>
    </div>
  );
}
