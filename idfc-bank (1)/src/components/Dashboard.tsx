import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, CreditCard, Shield, Send, ArrowUpRight, ArrowDownLeft, 
  Percent, Zap, Wallet, Lock, Unlock, PlusCircle, ExternalLink, RefreshCw, Info 
} from 'lucide-react';
import { BankAccount, UserProfile, Transaction } from '../types';

interface DashboardProps {
  user: UserProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onSimulateDeposit: (accountId: string, amount: number) => void;
  cardLocked: boolean;
  onToggleCardLock: () => void;
}

export default function Dashboard({
  user,
  accounts,
  transactions,
  onNavigate,
  onSimulateDeposit,
  cardLocked,
  onToggleCardLock
}: DashboardProps) {
  const [depositAmount, setDepositAmount] = useState('10000');
  const [selectedDepositAccount, setSelectedDepositAccount] = useState(accounts[0]?.id || 'acc_savings');
  const [depositSuccess, setDepositSuccess] = useState(false);

  // Math totals
  const totalAssets = accounts
    .filter(a => a.accountType !== 'Credit Card')
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalLiabilities = Math.abs(
    accounts
      .filter(a => a.accountType === 'Credit Card')
      .reduce((sum, a) => sum + a.balance, 0)
  );

  const netWorth = totalAssets - totalLiabilities;

  // Format currency in Indian numbering system (Lakhs/Crores) as it is IDFC Bank
  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(value);
  };

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) return;

    onSimulateDeposit(selectedDepositAccount, amt);
    setDepositSuccess(true);
    setTimeout(() => setDepositSuccess(false), 2000);
  };

  // Modern formatted date greeting
  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div id="dashboard_panel" className="space-y-6">
      
      {/* Prime Customer Welcoming Bar */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gradient-to-r from-[#9D1D42] to-[#7B1331] text-white rounded-3xl p-6 md:p-8 shadow-lg relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#C29B38]/20 to-transparent pointer-events-none" />
        
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase bg-[#C29B38] text-stone-900 px-3 py-0.5 rounded-full font-bold tracking-wider">
              IDFC FIRST Select
            </span>
            <span className="text-xs text-stone-200">CIF ID: {user.customerId}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight pt-1">
            {getGreeting()}, {user.fullName}
          </h1>
          <p className="text-xs text-rose-200 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-[#C29B38]" /> Safe & Secure Session. Last login: {new Date(user.lastLogin).toLocaleString()}
          </p>
        </div>

        {/* Aggregate Net Worth Panel */}
        <div className="mt-4 md:mt-0 text-right bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 z-10 w-full md:w-auto">
          <p className="text-xs text-rose-150 uppercase tracking-widest font-semibold text-stone-200">Aggregate Net Worth</p>
          <p className="text-2xl font-black text-[#C29B38] tracking-tight">{formatINR(netWorth)}</p>
          <div className="flex justify-between md:justify-end gap-4 text-[10px] mt-1.5 text-stone-300">
            <span>Assets: {formatINR(totalAssets)}</span>
            <span>Credit Owed: {formatINR(totalLiabilities)}</span>
          </div>
        </div>
      </motion.div>

      {/* Main Account Portfolios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {accounts.map((account, index) => {
          const isCredit = account.accountType === 'Credit Card';
          return (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              key={account.id}
              className={`relative rounded-2xl p-6 shadow-md border ${
                isCredit 
                  ? 'bg-gradient-to-br from-zinc-900 to-stone-800 text-white border-zinc-950' 
                  : account.accountType === 'Savings'
                    ? 'bg-white text-stone-800 border-amber-100/60'
                    : 'bg-gradient-to-br from-amber-50/40 to-white text-stone-800 border-amber-200/40'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-0.5">
                  <span className={`text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-full ${
                    isCredit ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-red-50 text-red-700'
                  }`}>
                    {account.accountType}
                  </span>
                  <p className="text-[11px] text-stone-400 font-mono mt-1">{account.accountNo}</p>
                </div>
                {isCredit ? (
                  <CreditCard className="w-6 h-6 text-[#C29B38]" />
                ) : (
                  <Wallet className="w-6 h-6 text-[#9D1D42]" />
                )}
              </div>

              <div className="space-y-1 my-6">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-stone-400">Available Balance</p>
                <p className={`text-2xl font-bold tracking-tight ${
                  isCredit 
                    ? account.balance < 0 ? 'text-amber-300' : 'text-white'
                    : 'text-stone-800'
                }`}>
                  {isCredit ? formatINR(account.limit! + account.balance) : formatINR(account.balance)}
                </p>
                {isCredit && (
                  <div className="pt-2 text-xs text-stone-400">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Total Card Limit:</span>
                      <span>{formatINR(account.limit!)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span>Current Unbilled Owed:</span>
                      <span className="text-red-400">{formatINR(Math.abs(account.balance))}</span>
                    </div>
                  </div>
                )}
                {account.accountType === 'Savings' && account.interestRate && (
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 pt-1.5">
                    <Percent className="w-3 h-3" /> Earning {account.interestRate}% Interest per annum, credited monthly
                  </p>
                )}
              </div>

              {/* Action indicators inside card */}
              <div className="flex justify-between items-center pt-2 border-t border-stone-200/50 mt-1">
                <span className="text-[11px] text-stone-400 font-medium">Holder: {account.accountHolder}</span>
                <button 
                  onClick={() => onNavigate('transactions')} 
                  className="text-xs font-bold text-[#9D1D42] hover:text-[#7B1331] inline-flex items-center gap-0.5 focus:outline-none cursor-pointer"
                >
                  Statement <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Grid of Quick Action Center & Simulation Node */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Action Matrix (Left Column) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 space-y-4">
          <h3 className="text-md font-bold text-stone-800 flex items-center gap-2">
            <Zap className="w-4.5 h-4.5 text-[#9D1D42]" /> 
            <span>Instant Banking Actions</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('transfers')}
              className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-[#9D1D42]/5 border border-stone-200 hover:border-[#9D1D42]/30 rounded-xl transition-all cursor-pointer text-center group"
            >
              <Send className="w-6 h-6 text-[#9D1D42] mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-700">International Wire</span>
              <span className="text-[9px] text-stone-400 mt-0.5">SWIFT Transfers</span>
            </button>

            <button
              onClick={() => onNavigate('transactions')}
              className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-[#9D1D42]/5 border border-stone-200 hover:border-[#9D1D42]/30 rounded-xl transition-all cursor-pointer text-center group"
            >
              <TrendingUp className="w-6 h-6 text-[#9D1D42] mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-700">Statements</span>
              <span className="text-[9px] text-stone-400 mt-0.5">Real-time ledger</span>
            </button>

            <button
              onClick={() => onNavigate('analytics')}
              className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-[#9D1D42]/5 border border-stone-200 hover:border-[#9D1D42]/30 rounded-xl transition-all cursor-pointer text-center group"
            >
              <TrendingUp className="w-6 h-6 text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-700">Spending Analysis</span>
              <span className="text-[9px] text-stone-400 mt-0.5">Charts & Analytics</span>
            </button>

            <button
              onClick={() => onNavigate('security')}
              className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-[#9D1D42]/5 border border-stone-200 hover:border-[#9D1D42]/30 rounded-xl transition-all cursor-pointer text-center group"
            >
              <Shield className="w-6 h-6 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-700">Security Vault</span>
              <span className="text-[9px] text-stone-400 mt-0.5">Limit manager, IP Logs</span>
            </button>

            {/* Simulated Fast Credit Utility */}
            <button
              onClick={() => onNavigate('security')}
              className="flex flex-col items-center justify-center p-4 bg-stone-50 hover:bg-[#9D1D42]/5 border border-stone-200 hover:border-[#9D1D42]/30 rounded-xl transition-all cursor-pointer text-center group"
            >
              <CreditCard className="w-6 h-6 text-[#C29B38] mb-2 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-stone-700">Premium Credit Log</span>
              <span className="text-[9px] text-stone-400 mt-0.5">FIRST Select</span>
            </button>

            {/* Quick Lock Trigger */}
            <button
              onClick={onToggleCardLock}
              className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all cursor-pointer text-center group ${
                cardLocked 
                  ? 'bg-rose-50 border-rose-300 hover:bg-rose-100/50 hover:border-rose-400' 
                  : 'bg-stone-50 hover:bg-rose-50/30 border-stone-200 hover:border-rose-200'
              }`}
            >
              {cardLocked ? (
                <Lock className="w-6 h-6 text-rose-600 mb-2 group-hover:scale-110 transition-transform animate-bounce" />
              ) : (
                <Unlock className="w-6 h-6 text-stone-500 group-hover:text-rose-600 mb-2 group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-bold text-stone-700">{cardLocked ? 'Unlock Card' : 'Lock Credit Card'}</span>
              <span className="text-[9px] text-stone-400 mt-0.5">{cardLocked ? 'CARD IS FROZEN' : 'Instant Freeze option'}</span>
            </button>
          </div>

          {/* Secure advisory card */}
          <div className="p-3.5 bg-yellow-50/50 border border-yellow-200/60 rounded-xl text-yellow-800 text-[11px] flex gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Immediate Fraud Alert System:</strong> Any outward transfer over ₹1,00,000 mandates automatic 2-Factor OTP verification. To raise your boundaries, navigate to the Secure Vault.
            </p>
          </div>
        </div>

        {/* Real-time Deposit Sandbox Simulator (Right Column) */}
        <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-md font-bold text-stone-800 mb-2 flex items-center gap-2">
              <PlusCircle className="w-4.5 h-4.5 text-emerald-600" />
              <span>Direct Fund Simulator</span>
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Since this is a client-side prototype, you can instantly deposit test money to test real-time portfolio updates and ledger history. Let's grow your wealth!
            </p>

            <form onSubmit={handleDepositSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">
                  Destination Account
                </label>
                <select
                  value={selectedDepositAccount}
                  onChange={(e) => setSelectedDepositAccount(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountType} ({acc.accountNo}) - Balance: {formatINR(acc.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wide mb-1">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-stone-500 font-bold text-xs">₹</span>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter deposit amount"
                    min="100"
                    max="1000000"
                    className="w-full pl-7 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-black text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                id="deposit_btn"
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-lg shadow-sm transition-colors cursor-pointer flex justify-center items-center gap-1"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Simulate Instant Deposit</span>
              </button>
            </form>
          </div>

          <div className="pt-4 mt-4 border-t border-stone-100">
            {depositSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-center rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deposit Applied! Balances Refreshed.</span>
              </motion.div>
            ) : (
              <div className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1">
                <span>Safe Sandbox Environment</span>
                <span>•</span>
                <span>Values backed by LocalStorage</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Mini ledger of 3 key recent transactions */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold text-stone-800">Recent Platform Activity</h3>
          <button 
            onClick={() => onNavigate('transactions')} 
            className="text-xs text-[#9D1D42] font-semibold hover:underline cursor-pointer"
          >
            See Full Statement ({transactions.length} entries)
          </button>
        </div>

        <div className="divide-y divide-stone-100">
          {transactions.slice(0, 3).map((tx) => (
            <div key={tx.id} className="py-3 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <p className="font-bold text-stone-850">{tx.description}</p>
                <div className="flex items-center space-x-2 text-[10px] text-stone-500">
                  <span className="font-semibold text-stone-400">{tx.category}</span>
                  <span>•</span>
                  <span>{new Date(tx.date).toLocaleDateString()}</span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                    tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
              <p className={`font-extrabold tracking-tight shrink-0 ${
                tx.type === 'credit' ? 'text-emerald-600' : 'text-stone-800'
              }`}>
                {tx.type === 'credit' ? '+' : '-'}{formatINR(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
