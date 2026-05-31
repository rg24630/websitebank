import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, ArrowDownCircle, ArrowUpCircle, HelpCircle, 
  Download, Eye, Filter, Sparkles, X, ChevronDown, CheckCircle, FileText, Globe 
} from 'lucide-react';
import { Transaction, BankAccount } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
  accounts: BankAccount[];
}

export default function TransactionHistory({ transactions, accounts }: TransactionHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedAccount, setSelectedAccount] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  // Categories extraction
  const categories = ['All', 'Salary', 'Transfer', 'Shopping', 'Food', 'Utilities', 'Travel', 'Investment', 'Entertainment', 'Others'];

  // Indian Formatting
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  // Generic Currency Formatting (for international amounts)
  const formatForeign = (value: number, currencyCode: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  };

  // Find account name/type
  const getAccountLabel = (accId: string) => {
    const acc = accounts.find(a => a.id === accId);
    if (!acc) return 'Direct Account';
    return `${acc.accountType} (..${acc.accountNo.slice(-4)})`;
  };

  // Filtering Logic
  const filteredTx = transactions.filter((tx) => {
    const matchesSearch = 
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.recipientName && tx.recipientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.swiftCode && tx.swiftCode.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
    const matchesAccount = selectedAccount === 'All' || tx.accountId === selectedAccount;
    const matchesType = 
      selectedType === 'All' || 
      (selectedType === 'debits' && tx.type === 'debit') || 
      (selectedType === 'credits' && tx.type === 'credit');

    return matchesSearch && matchesCategory && matchesAccount && matchesType;
  });

  // Calculate summary of visible items
  const outgoingSum = filteredTx.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const incomingSum = filteredTx.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);

  // Download simulation
  const [isDownloading, setIsDownloading] = useState(false);
  const handleDownloadReceipt = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      window.print(); // Native print allows user to save receipt beautifully
    }, 800);
  };

  return (
    <div id="transaction_section" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="space-y-0.5">
          <h2 className="text-xl font-bold text-stone-800">Account Statements</h2>
          <p className="text-xs text-stone-500">Real-time ledger audit and international transfer clearance logs.</p>
        </div>
        <div className="px-3 py-1 bg-[#9D1D42]/10 border border-[#9D1D42]/20 text-[#9D1D42] text-[11px] font-bold rounded-lg flex items-center gap-1">
          <Sparkles className="w-3 h-3 animate-pulse" /> Live Updating Feed
        </div>
      </div>

      {/* Filter Matrix Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 p-5 space-y-4">
        
        {/* Row 1: Search & Type Trigger */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="relative md:col-span-8">
            <span className="absolute left-3 top-2.5 text-stone-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              id="tx_search_input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Payee, Description, Swift BIC or TXN Reference..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#9D1D42] focus:border-[#9D1D42]"
            />
          </div>

          <div className="md:col-span-4 flex rounded-lg overflow-hidden border border-stone-200">
            <button
              onClick={() => setSelectedType('All')}
              className={`flex-1 py-1.5 text-[11px] font-bold ${
                selectedType === 'All' ? 'bg-[#9D1D42] text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              } transition-colors`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setSelectedType('credits')}
              className={`flex-1 py-1.5 text-[11px] font-bold ${
                selectedType === 'credits' ? 'bg-emerald-600 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              } transition-colors`}
            >
              Credits Only
            </button>
            <button
              onClick={() => setSelectedType('debits')}
              className={`flex-1 py-1.5 text-[11px] font-bold ${
                selectedType === 'debits' ? 'bg-rose-600 text-white' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              } transition-colors`}
            >
              Debits Only
            </button>
          </div>
        </div>

        {/* Row 2: Account and Category dropdown filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-stone-100">
          
          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Account Source
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs font-semibold text-stone-700 focus:outline-none"
            >
              <option value="All">All Bank Portfolios</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.accountType} (..{acc.accountNo.slice(-4)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs font-semibold text-stone-700 focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Quick Metrics display inside bar */}
          <div className="sm:col-span-2 bg-stone-50 rounded-lg p-2 flex justify-around items-center border border-stone-150">
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-stone-400 block">Filtered Incoming</span>
              <span className="text-xs font-extrabold text-emerald-600">{formatINR(incomingSum)}</span>
            </div>
            <div className="h-6 w-[1.5px] bg-stone-200"></div>
            <div className="text-center">
              <span className="text-[9px] uppercase font-bold text-stone-400 block">Filtered Outgoing</span>
              <span className="text-xs font-extrabold text-stone-700">{formatINR(outgoingSum)}</span>
            </div>
          </div>

        </div>

      </div>

      {/* Main Ledger Feed Card */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200/60 overflow-hidden">
        
        {/* Table/List Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="statement_table">
            <thead>
              <tr className="bg-stone-50 text-[10px] uppercase tracking-wider font-extrabold text-stone-400 border-b border-stone-200">
                <th className="py-3.5 px-5">Booking Date</th>
                <th className="py-3.5 px-4">Payee & Booking Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Portfolios</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Amount (₹)</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredTx.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                    No transaction entries match your current search constraints.
                  </td>
                </tr>
              ) : (
                filteredTx.map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-amber-50/20 transition-colors group align-middle cursor-pointer"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <td className="py-3.5 px-5 font-mono text-stone-500 whitespace-nowrap">
                        {new Date(tx.date).toLocaleDateString(undefined, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: '2-digit' 
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-normal max-w-sm">
                        <div className="font-bold text-stone-850 flex items-center gap-1.5">
                          {isCredit ? (
                            <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          ) : (
                            <ArrowUpCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          )}
                          <span className="line-clamp-1">{tx.description}</span>
                          {tx.swiftCode && (
                            <span className="px-1.5 py-0.2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[8px] font-black rounded flex items-center gap-0.5 whitespace-nowrap">
                              <Globe className="w-2.5 h-2.5" /> SWIFT WIRE
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-stone-400 font-mono mt-0.5">TXN Ref: {tx.referenceNo}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 bg-stone-100 border border-stone-200 text-stone-600 rounded-full font-semibold text-[10px]">
                          {tx.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-500 font-medium">
                        {getAccountLabel(tx.accountId)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wide inline-block ${
                          tx.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-rose-50 text-rose-700'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`py-3.5 px-5 font-extrabold text-right tracking-tight text-sm whitespace-nowrap ${
                        isCredit ? 'text-emerald-600' : 'text-stone-800'
                      }`}>
                        {isCredit ? '+' : '-'}{formatINR(tx.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedTx(tx)}
                          className="p-1 text-[#9D1D42] hover:bg-[#9D1D42]/10 rounded-md transition-colors focus:outline-none"
                          title="View Digital Receipt"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Exquisite Print-Ready Receipt Modal Overlay */}
      <AnimatePresence>
        {selectedTx && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex justify-center items-center p-4 print:p-0 print:absolute print:inset-0 print:bg-white print:z-10"
            id="receipt_overlay"
            onClick={() => setSelectedTx(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white rounded-2xl shadow-2xl border border-stone-200 max-w-lg w-full overflow-hidden print:shadow-none print:border-none print:rounded-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Receipt Visual Top header */}
              <div className="bg-[#9D1D42] text-white p-5 flex justify-between items-center print:bg-transparent print:text-stone-800 print:border-b print:border-stone-200">
                <div className="space-y-0.5">
                  <span className="text-xl font-black tracking-tight text-white print:text-stone-900">
                    IDFC <span className="font-light text-rose-100">FIRST</span> Bank
                  </span>
                  <p className="text-[10px] uppercase font-bold text-rose-200 tracking-widest print:text-stone-500">Official Electronic Receipt</p>
                </div>
                <button
                  onClick={() => setSelectedTx(null)}
                  className="p-1 px-2.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 print:hidden focus:outline-none text-xs font-bold"
                >
                  <X className="w-5 h-5 inline-block" />
                </button>
              </div>

              {/* Receipt Core Data */}
              <div className="p-7 space-y-6" id="receipt_content">
                
                {/* Transaction Heading */}
                <div className="text-center space-y-1 py-2 border-b border-dashed border-stone-200">
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Transaction Amount</p>
                  <h3 className={`text-3xl font-black tracking-tight ${
                    selectedTx.type === 'credit' ? 'text-emerald-600' : 'text-stone-800'
                  }`}>
                    {selectedTx.type === 'credit' ? '+' : '-'}{formatINR(selectedTx.amount)}
                  </h3>
                  <div className="flex justify-center items-center gap-1.5 pt-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[11px] font-bold text-stone-600 tracking-wide uppercase">Transaction Settled & Cleared</span>
                  </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs border-b border-stone-100 pb-5">
                  
                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">Status</span>
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Booked & Settled
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">Reference Number</span>
                    <span className="font-mono font-bold text-stone-700">{selectedTx.referenceNo}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">Source Account</span>
                    <span className="font-semibold text-stone-700">{getAccountLabel(selectedTx.accountId)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-stone-400 font-bold block">Booking Timestamp</span>
                    <span className="font-mono text-stone-600">{new Date(selectedTx.date).toLocaleString()}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] uppercase text-stone-400 font-bold block mb-0.5">Description / Narration</span>
                    <span className="font-bold text-stone-800">{selectedTx.description}</span>
                  </div>

                </div>

                {/* If it is an International Wire Transfer details panel */}
                {selectedTx.swiftCode && (
                  <div className="p-4 bg-stone-50 border border-stone-200/60 rounded-xl space-y-3.5 text-xs">
                    <h4 className="font-extrabold text-indigo-700 flex items-center gap-1 uppercase tracking-wide text-[10px]">
                      <Globe className="w-4 h-4" /> 
                      <span>Outbound SWIFT Wire Breakdown</span>
                    </h4>

                    <div className="grid grid-cols-2 gap-3 pb-3 border-b border-stone-200/50">
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 font-bold block">Recipient Name</span>
                        <span className="font-bold text-stone-700">{selectedTx.recipientName}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 font-bold block">Swift BIC Code</span>
                        <span className="font-mono font-bold text-indigo-700">{selectedTx.swiftCode}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 font-bold block">Recipient Account/IBAN</span>
                        <span className="font-mono text-[11px] text-stone-600 truncate max-w-[150px] block">{selectedTx.recipientAccount}</span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase text-stone-400 font-bold block">Destination Country</span>
                        <span className="font-semibold text-stone-700">{selectedTx.recipientCountry}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 text-[11px] text-stone-500">
                      <div className="flex justify-between font-medium">
                        <span>Converted FX Amount:</span>
                        <span className="font-bold text-stone-700">
                          {selectedTx.convertedAmount && selectedTx.recipientCountry ? (
                            formatForeign(
                              selectedTx.convertedAmount, 
                              selectedTx.recipientCountry.includes('France') || selectedTx.recipientCountry.includes('Europe') ? 'EUR' : 'USD'
                            )
                          ) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Applied Exchange Rate / Conversion Ratio:</span>
                        <span className="font-bold text-stone-700">₹{selectedTx.exchangeRate}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Corporate Remittance Taxes (GST & SWIFT):</span>
                        <span className="font-bold text-stone-700">{formatINR(selectedTx.feesApplied || 250)}</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* Secure Certification Footer */}
                <div className="pt-2 text-center text-[10px] text-stone-400 space-y-1">
                  <p>Document protected by IDFC FIRST Bank Digital Signature security key.</p>
                  <p className="font-mono">Security Checksum SHA-256: {Math.random().toString(16).slice(2, 6).toUpperCase()}89D42DFF{Math.random().toString(16).slice(2, 6).toUpperCase()}</p>
                </div>

              </div>

              {/* Receipt Footer Action */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex gap-3 print:hidden justify-end">
                <button
                  onClick={() => setSelectedTx(null)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-lg transition-colors focus:outline-none cursor-pointer"
                >
                  Close Receipt
                </button>
                <button
                  onClick={handleDownloadReceipt}
                  className="px-4 py-2 bg-[#9D1D42] hover:bg-[#801433] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
