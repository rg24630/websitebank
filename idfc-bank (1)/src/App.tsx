import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, LayoutDashboard, Send, FileText, PieChart, ShieldAlert, LogOut, 
  Menu, X, ShieldCheck, Bell, RefreshCw, UserCheck, HelpCircle, ChevronRight, Lock
} from 'lucide-react';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import TransactionHistory from './components/TransactionHistory';
import InternationalTransfer from './components/InternationalTransfer';
import VisualAnalytics from './components/VisualAnalytics';
import SecurityCenter from './components/SecurityCenter';

// Types
import { UserProfile, BankAccount, Transaction, SecuritySetting } from './types';

// Mock Data
import { mockUser, mockAccounts, mockTransactions, initialSecuritySetting } from './mockData';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySetting>(initialSecuritySetting);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; msg: string; type: 'info' | 'success' }[]>([]);

  // Load state from local storage or defaults on startup
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('idfc_user');
      const storedAccounts = localStorage.getItem('idfc_accounts');
      const storedTransactions = localStorage.getItem('idfc_transactions');
      const storedSecurity = localStorage.getItem('idfc_security');

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
      
      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        setAccounts(mockAccounts);
        localStorage.setItem('idfc_accounts', JSON.stringify(mockAccounts));
      }

      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      } else {
        setTransactions(mockTransactions);
        localStorage.setItem('idfc_transactions', JSON.stringify(mockTransactions));
      }

      if (storedSecurity) {
        setSecuritySettings(JSON.parse(storedSecurity));
      } else {
        setSecuritySettings(initialSecuritySetting);
        localStorage.setItem('idfc_security', JSON.stringify(initialSecuritySetting));
      }
    } catch (e) {
      console.error('Failed to parse database from LocalStorage, falling back to static structures.', e);
      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
      setSecuritySettings(initialSecuritySetting);
    }
  }, []);

  // Sync state helpers
  const saveAccountsToStorage = (updatedList: BankAccount[]) => {
    setAccounts(updatedList);
    localStorage.setItem('idfc_accounts', JSON.stringify(updatedList));
  };

  const saveTransactionsToStorage = (updatedList: Transaction[]) => {
    setTransactions(updatedList);
    localStorage.setItem('idfc_transactions', JSON.stringify(updatedList));
  };

  const saveSecuritySettingsToStorage = (updatedSettings: SecuritySetting) => {
    setSecuritySettings(updatedSettings);
    localStorage.setItem('idfc_security', JSON.stringify(updatedSettings));
  };

  // User Actions
  const handleLogin = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    localStorage.setItem('idfc_user', JSON.stringify(authenticatedUser));
    addNotification('Identity credentials verified. Access GRANTED.', 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('idfc_user');
    setActiveTab('dashboard');
    addNotification('NetBanking session safely disconnected.', 'info');
  };

  // Notification Handler
  const addNotification = (msg: string, type: 'info' | 'success' = 'info') => {
    const newId = Math.random().toString(36).slice(2, 9);
    setNotifications(prev => [...prev, { id: newId, msg, type }]);
    
    // Auto purge in 4 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== newId));
    }, 4000);
  };

  // Simulation controls called from dashboard children
  const handleSimulateDeposit = (accountId: string, amount: number) => {
    const updated = accounts.map(acc => {
      if (acc.id === accountId) {
        return {
          ...acc,
          balance: acc.balance + amount
        };
      }
      return acc;
    });
    saveAccountsToStorage(updated);

    const targetAccount = accounts.find(a => a.id === accountId);
    const targetLabel = targetAccount ? targetAccount.accountType : 'Deposit';

    // Log the transaction
    const newTx: Transaction = {
      id: 'tx_deposit_' + Math.floor(Math.random() * 100000),
      accountId: accountId,
      type: 'credit',
      description: `Direct Deposit - Influx Remit`,
      amount: amount,
      currency: 'INR',
      date: new Date().toISOString(),
      category: 'Salary', // fits deposit
      status: 'Completed',
      referenceNo: 'DEP' + Math.floor(10000000 + Math.random() * 90000000)
    };

    saveTransactionsToStorage([newTx, ...transactions]);
    addNotification(`Instantly credited ₹${amount.toLocaleString()} into your bank balances.`, 'success');
  };

  const handleToggleCardLock = () => {
    const updated = !securitySettings.cardLocked;
    const settingsCopy = { ...securitySettings, cardLocked: updated };
    saveSecuritySettingsToStorage(settingsCopy);
    addNotification(
      updated ? 'FIRST Credit card blocked and merchants paused.' : 'FIRST credit card unlocked and activated.',
      updated ? 'info' : 'success'
    );
  };

  const handleUpdateSecuritySettings = (updated: SecuritySetting) => {
    saveSecuritySettingsToStorage(updated);
    addNotification('Vault policy metrics successfully updated.', 'success');
  };

  const handleAddWireTransaction = (newTx: Transaction) => {
    saveTransactionsToStorage([newTx, ...transactions]);
    addNotification(`Global Remittance of ₹${newTx.amount.toLocaleString()} transmitted successfully via SWIFT.`, 'success');
  };

  const handleUpdateAccountBalance = (accountId: string, newBalance: number) => {
    const updated = accounts.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, balance: newBalance };
      }
      return acc;
    });
    saveAccountsToStorage(updated);
  };

  // Quick reset for testing convinience
  const handleResetSandbox = () => {
    if (window.confirm('Reset local banking ledger to default portfolio seeds?')) {
      localStorage.clear();
      setAccounts(mockAccounts);
      setTransactions(mockTransactions);
      setSecuritySettings(initialSecuritySetting);
      addNotification('Sandbox environment successfully seeded!', 'info');
    }
  };

  // Nav Elements Array
  const navItems = [
    { id: 'dashboard', label: 'Portfolio Dashboard', icon: LayoutDashboard },
    { id: 'transfers', label: 'International Wire', icon: Send },
    { id: 'transactions', label: 'Statements Ledger', icon: FileText },
    { id: 'analytics', label: 'Spend Intelligence', icon: PieChart },
    { id: 'security', label: 'Secure Vault', icon: ShieldCheck }
  ];

  if (!user) {
    return <Login onLoginSuccess={handleLogin} mockUser={mockUser} />;
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans flex flex-col md:flex-row relative">
      
      {/* Dynamic Pop up notifications wrapper */}
      <div className="fixed top-12 right-4 z-50 space-y-2 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {notifications.map(n => (
            <motion.div
              layout
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              key={n.id}
              className={`p-4 rounded-xl shadow-lg border text-xs font-bold leading-tight flex items-start gap-2.5 pointer-events-auto ${
                n.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-[#9D1D42]/10 border-[#9D1D42]/20 text-[#9D1D42]'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {n.type === 'success' ? <UserCheck className="w-4.5 h-4.5" /> : <ShieldAlert className="w-4.5 h-4.5" />}
              </div>
              <p>{n.msg}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar navigation */}
      <aside 
        id="side_app_bar" 
        className="hidden md:flex flex-col justify-between w-64 bg-stone-900 text-stone-300 border-r border-stone-950 shrink-0 select-none z-10"
      >
        <div className="p-6 space-y-8">
          
          {/* Identity header */}
          <div className="space-y-1">
            <span className="text-2xl font-black tracking-tight text-white block">
              IDFC <span className="text-stone-300 font-light">FIRST</span> <span className="text-[#C29B38] font-black">Bank</span>
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#C29B38] block bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/25 text-center">
              FIRST Select Portal
            </span>
          </div>

          {/* Navigation link group */}
          <nav className="space-y-1.5" id="nav_links">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-black tracking-wide uppercase transition-all duration-150 cursor-pointer text-left focus:outline-none ${
                    isActive
                      ? 'bg-[#9D1D42] text-white shadow-md font-bold'
                      : 'hover:bg-white/5 text-stone-400 hover:text-stone-105'
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#C29B38]' : 'text-stone-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Footer controls inside sidebar */}
        <div className="p-6 border-t border-stone-850 space-y-4">
          
          <div className="bg-stone-850 p-3 rounded-xl border border-stone-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <div className="relative">
                <img 
                  src={user.avatarUrl} 
                  referrerPolicy="no-referrer"
                  alt={user.fullName} 
                  className="w-7 h-7 rounded-full object-cover border border-[#C29B38]"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-stone-850" />
              </div>
              <div className="leading-tight shrink-0">
                <p className="font-extrabold font-sans text-[11px] truncate">{user.fullName}</p>
                <p className="text-[9px] text-[#C29B38] uppercase">Premium Client</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full py-1.5 bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors text-[10px] font-bold uppercase rounded-lg flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-500" />
              <span>Session Log-Out</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <button
              onClick={handleResetSandbox}
              className="text-stone-500 hover:text-stone-300 font-semibold focus:outline-none flex items-center gap-1 cursor-pointer"
              title="Reset Database to defaults"
            >
              <RefreshCw className="w-3 h-3 animate-spin-hover" />
              <span>Reset Sandbox</span>
            </button>
            <span className="text-stone-600 font-mono">v1.4.2</span>
          </div>

        </div>
      </aside>

      {/* Mobile Responsive Header navigation */}
      <AnimatePresence>
        <header className="md:hidden flex justify-between items-center bg-stone-900 text-white px-5 py-4 w-full border-b border-stone-950 z-20">
          <span className="text-xl font-black tracking-tight text-white block">
            IDFC <span className="text-stone-300 font-light">FIRST</span> <span className="text-[#C29B38] font-bold">Bank</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('security');
                addNotification('Fast navigation to security logs initialized.', 'info');
              }}
              className="p-1 px-2.5 rounded-lg text-white font-bold bg-[#9D1D42]/20 hover:bg-[#9D1D42]/30 border border-[#9D1D42]/30 flex items-center gap-1 select-none"
            >
              <Lock className="w-3 h-3 text-[#C29B38] inline-block" />
              <span className="text-[10px] text-stone-300">Secure</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 hover:bg-stone-800 border border-stone-800 text-stone-400 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </header>

        {/* Mobile dropdown menu drawers details */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden w-full absolute top-[57px] bg-stone-900 border-b border-stone-950 z-20 shadow-2xl flex flex-col p-4 space-y-4 text-stone-300"
          >
            <div className="flex flex-col space-y-1.5" id="mobile_links">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase transition-all duration-150 text-left cursor-pointer focus:outline-none ${
                      isActive
                        ? 'bg-[#9D1D42] text-white shadow-md'
                        : 'hover:bg-white/5 text-stone-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-stone-800 pt-4 flex flex-col space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <img 
                  src={user.avatarUrl} 
                  alt={user.fullName} 
                  className="w-7 h-7 rounded-full object-cover border border-[#C29B38]"
                />
                <span className="font-extrabold text-[#C29B38] capitalize">{user.fullName}</span>
              </div>
              
              <div className="flex justify-between items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-[#9D1D42] text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer focus:outline-none flex-1 text-center"
                >
                  Safely Log-out
                </button>
                <button
                  onClick={() => {
                    handleResetSandbox();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 bg-stone-800 border border-stone-700 text-stone-400 hover:text-white transition-colors text-[10px] font-bold uppercase rounded-lg cursor-pointer focus:outline-none text-center"
                >
                  Reset Platform
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content viewport */}
      <main className="flex-1 overflow-x-hidden min-h-screen relative flex flex-col justify-between" id="app_viewport">
        
        {/* Beautiful Floating Security Alert ticker */}
        <div className="bg-[#1C1A17] text-amber-500 py-1.5 px-6 border-b border-amber-500/10 text-[11px] font-semibold flex items-center justify-between pointer-events-none select-none z-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="flex h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="whitespace-nowrap uppercase tracking-wider text-[10px]">Security Advisory:</span>
            <marquee className="text-amber-100/90 text-[10px] w-96 font-medium">
              IDFC FIRST netbanking will NEVER demand your passwords or request remote software setups. Remittances above ₹1,00,000 always require verified dual-factor SMS keys. Maintain caution online.
            </marquee>
          </div>
          <span className="text-[9px] bg-amber-500/10 px-2 py-0.2 border border-amber-500/20 text-[#C29B38] font-bold rounded-full">
            RBI Remit Compliant
          </span>
        </div>

        {/* Content Viewport render mapping */}
        <div className="p-4 md:p-8 flex-1 select-text">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="focus:outline-none"
            >
              {activeTab === 'dashboard' && (
                <Dashboard 
                  user={user}
                  accounts={accounts}
                  transactions={transactions}
                  onNavigate={setActiveTab}
                  onSimulateDeposit={handleSimulateDeposit}
                  cardLocked={securitySettings.cardLocked}
                  onToggleCardLock={handleToggleCardLock}
                />
              )}

              {activeTab === 'transfers' && (
                <InternationalTransfer 
                  accounts={accounts}
                  user={user}
                  dailyLimit={securitySettings.dailyWireLimit}
                  currentWireSpent={securitySettings.currentWireSpent}
                  onAddTransaction={handleAddWireTransaction}
                  onUpdateAccountBalance={handleUpdateAccountBalance}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionHistory 
                  transactions={transactions}
                  accounts={accounts}
                />
              )}

              {activeTab === 'analytics' && (
                <VisualAnalytics 
                  transactions={transactions}
                />
              )}

              {activeTab === 'security' && (
                <SecurityCenter 
                  securitySettings={securitySettings}
                  onUpdateSettings={handleUpdateSecuritySettings}
                  cardLocked={securitySettings.cardLocked}
                  onToggleCardLock={handleToggleCardLock}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer info branding */}
        <footer className="py-4 bg-stone-100 border-t border-stone-200 text-center text-[11px] text-stone-400 font-medium select-none">
          <p>© 2026 IDFC FIRST Bank Limited. Registered Office: KRM Towers, 7th Floor, Harrington Road, Chetpet, Chennai - 600031. CIN: L65110TN2014PLC097792</p>
        </footer>

      </main>

    </div>
  );
}
