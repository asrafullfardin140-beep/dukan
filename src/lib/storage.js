// Get Shop Profile
export function getShopProfile() {
    const defaultProfile = {
        nameEn: '',
        nameBn: '',
        phone: '',
        address: '',
        logo: '',
        signature: '',
        terms: 'আমাদের প্রতিষ্ঠান থেকে আপনি কখনাই প্রতারিত হবেন না। ইনশাআল্লাহ।'
    };
    try {
        const profile = localStorage.getItem('hisabbook_profile');
        return profile ? JSON.parse(profile) : defaultProfile;
    } catch {
        return defaultProfile;
    }
}

// Save Shop Profile
export function saveShopProfile(data) {
    localStorage.setItem('hisabbook_profile', JSON.stringify(data));
}

// Get Invoices
export function getInvoices() {
    try {
        const invoices = localStorage.getItem('hisabbook_invoices');
        return invoices ? JSON.parse(invoices) : [];
    } catch {
        return [];
    }
}

// Get Single Invoice
export function getInvoice(id) {
    const invoices = getInvoices();
    return invoices.find(inv => inv.id === id) || null;
}

// Save Invoice
export function saveInvoice(invoiceData) {
    const invoices = getInvoices();
    
    // Check if updating
    const index = invoices.findIndex(inv => inv.id === invoiceData.id);
    if (index >= 0) {
        invoices[index] = invoiceData;
    } else {
        invoices.push(invoiceData);
    }
    
    // Sort by date created (newest first)
    invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
    localStorage.setItem('hisabbook_invoices', JSON.stringify(invoices));
}

// Delete Invoice
export function deleteInvoice(id) {
    const invoices = getInvoices();
    const newInvoices = invoices.filter(inv => inv.id !== id);
    localStorage.setItem('hisabbook_invoices', JSON.stringify(newInvoices));
}

// Get Next Invoice Number
export function getNextInvoiceNumber() {
    const invoices = getInvoices();
    const prefix = "INV-" + new Date().getFullYear() + "-";
    
    // Filter invoices from current year that match the prefix
    const currentYearInvoices = invoices.filter(inv => inv.id.startsWith(prefix));
    
    if (currentYearInvoices.length === 0) {
        return prefix + "001";
    }
    
    // Extract max number
    const maxNum = currentYearInvoices.reduce((max, inv) => {
        const parts = inv.id.split('-');
        if (parts.length === 3) {
            const num = parseInt(parts[2], 10);
            return num > max ? num : max;
        }
        return max;
    }, 0);
    
    return prefix + String(maxNum + 1).padStart(3, '0');
}
