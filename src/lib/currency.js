export function formatBDT(amount) {
  if (isNaN(amount)) return '৳ 0.00';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Intel.NumberFormat for BDT might output 'BDT 1,00,000.00'. We want '৳ 1,00,000.00'
  return formatter.format(amount).replace('BDT', '৳').replace('Tk', '৳').trim();
}
