import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, ArrowUpDown, Clock, Check, AlertTriangle, 
  HelpCircle, CheckCircle, ArrowRight, ShieldCheck, Mail, Key 
} from 'lucide-react';
import { BankAccount, CurrencyRate, Transaction, UserProfile } from '../types';
import { currencyRates } from '../mockData';

interface InternationalTransferProps {
  accounts: BankAccount[];
  user: UserProfile;
  dailyLimit: number;
  currentWireSpent: number;
  onAddTransaction: (newTx: Transaction) => void;
  onUpdateAccountBalance: (accountId: string, newBalance: number) => void;
}

export default function InternationalTransfer({
  accounts,
  user,
  dailyLimit,
  currentWireSpent,
  onAddTransaction,
  onUpdateAccountBalance
}: InternationalTransferProps) {
  // Step model: 1 = Form Details, 2 = Regulatory Review, 3 = OTP Secure Verify, 4 = Settlement Processing, 5 = Remittance Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form Fields
  const [sourceAccountId, setSourceAccountId] = useState(accounts[0]?.id || 'acc_savings');
  const [recipientName, setRecipientName] = useState('');
  const [recipientCountry, setRecipientCountry] = useState('United States');
  const [recipientBank, setRecipientBank] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [targetCurrency, setTargetCurrency] = useState<CurrencyRate>(currencyRates[0]);
  const [remitAmount, setRemitAmount] = useState('');
  const [amountType, setAmountType] = useState<'INR' | 'FOREIGN'>('FOREIGN');
  const [purposeCode, setPurposeCode] = useState('S1302');

  // Regulatory checklist
  const [agreeLrs, setAgreeLrs] = useState(false);
  const [agreeTax, setAgreeTax] = useState(false);

  // OTP Simulation
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Form Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Exchange calculations
  const [inrCost, setInrCost] = useState(0);
  const [foreignAmount, setForeignAmount] = useState(0);
  const swiftFeeInr = 500; // Flat standard SWIFT fee

  // Preset Country Swift and Bank templates for realistic usability
  const countryTemplates: Record<string, { currency: string; bank: string; swift: string; format: string }> = {
    'United States': { currency: 'USD', bank: 'Chase Bank NA', swift: 'CHASEUS33XXX', format: 'Alphanumeric routing & AccountNo' },
    'United Kingdom': { currency: 'GBP', bank: 'Barclays Bank PLC', swift: 'BARCGB2DXXX', format: 'IBAN format start with GB' },
    'Germany': { currency: 'EUR', bank: 'Deutsche Bank AG', swift: 'DEUTDEFFXXX', format: 'IBAN format start with DE' },
    'France': { currency: 'EUR', bank: 'BNP Paribas', swift: 'BNPAFRPPXXX', format: 'IBAN format start with FR' },
    'Singapore': { currency: 'SGD', bank: 'DBS Bank Ltd', swift: 'DBSSSG22XXX', format: 'Account Number of 9-12 digits' },
    'United Arab Emirates': { currency: 'AED', bank: 'Emirates NBD', swift: 'ENBDAD22XXX', format: 'IBAN format start with AE' },
    'Australia': { currency: 'AUD', bank: 'Commonwealth Bank of Australia', swift: 'CTBAAU2SXXX', format: 'BSB and Account number' }
  };

  const selectedSourceAccount = accounts.find(a => a.id === sourceAccountId);

  // Sync Currency & Bank defaults on country swap
  useEffect(() => {
    const template = countryTemplates[recipientCountry];
    if (template) {
      const cur = currencyRates.find(c => c.code === template.currency) || currencyRates[0];
      setTargetCurrency(cur);
      setRecipientBank(template.bank);
      setSwiftCode(template.swift);
    }
  }, [recipientCountry]);

  // Sync mathematical conversions
  useEffect(() => {
    const rate = targetCurrency.rateVsInr;
    const value = parseFloat(remitAmount);

    if (isNaN(value) || value <= 0) {
      setInrCost(0);
      setForeignAmount(0);
      return;
    }

    if (amountType === 'FOREIGN') {
      const cost = Math.round(value * rate * 100) / 100;
      setInrCost(cost);
      setForeignAmount(value);
    } else {
      const foreignVal = Math.round((value / rate) * 100) / 100;
      setInrCost(value);
      setForeignAmount(foreignVal);
    }
  }, [remitAmount, amountType, targetCurrency]);

  const validateForm = () => {
    const errs: Record<string, string> = {};

    if (!recipientName.trim()) errs.recipientName = 'Recipient Full Name is required.';
    if (!recipientBank.trim()) errs.recipientBank = 'Recipient Bank Name is required.';
    if (!recipientAccount.trim()) errs.recipientAccount = 'Account Number / International IBAN is required.';
    
    // SWIFT Code format (8 or 11 characters)
    const normalizedSwift = swiftCode.replace(/\s+/g, '');
    if (!normalizedSwift) {
      errs.swiftCode = 'SWIFT / BIC Code is required.';
    } else if (normalizedSwift.length !== 8 && normalizedSwift.length !== 11) {
      errs.swiftCode = 'SWIFT code must be exactly 8 or 11 alphanumeric characters.';
    }

    const value = parseFloat(remitAmount);
    if (isNaN(value) || value <= 0) {
      errs.amount = 'Please enter a valid transfer amount.';
    } else if (selectedSourceAccount) {
      const totalCostWithSwift = inrCost + swiftFeeInr;
      if (totalCostWithSwift > selectedSourceAccount.balance) {
        errs.amount = 'Insufficient balance in the selected source account for this transaction (including SWIFT fees).';
      }

      // Check daily limit constraint
      if (currentWireSpent + inrCost > dailyLimit) {
        errs.amount = `Remittance exceeds the daily security transfer threshold of ₹${dailyLimit.toLocaleString()}. Currently spent today: ₹${currentWireSpent.toLocaleString()}`;
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setStep(2);
    }
  };

  const handleStep2Submit = () => {
    if (!agreeLrs || !agreeTax) return;

    // Send mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);
    setUserOtp('');
    setOtpError(null);
    setStep(3);

    // Output OTP in alert for client convenience (highly usable, no friction)
    console.log(`[SECURE SMS/EMAIL OTP ALERT] IDFC Remittance authentication token: ${otp}`);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    if (userOtp === generatedOtp || userOtp === '999999') { // Bypass option for easy testing
      setStep(4);
      executeMockSettlement();
    } else {
      setOtpError('Invalid secure OTP code. Please trace console and enter the issued code.');
    }
  };

  const [settlementStep, setSettlementStep] = useState(0);
  const settlementLogs = [
    'Remitter reserve locks applied on source account balance...',
    'Liberalized Remittance Scheme compliance review: PASS',
    'Generating SWIFT transaction payload...',
    'Exchanging matching clearing certificates with international correspondent bank...',
    'Remittance routing complete, broadcasting SHA-256 block ledger...'
  ];

  const executeMockSettlement = () => {
    setSettlementStep(0);
    const interval = setInterval(() => {
      setSettlementStep((prev) => {
        if (prev >= settlementLogs.length - 1) {
          clearInterval(interval);
          completeTransferDatabaseBooking();
          return prev;
        }
        return prev + 1;
      });
    }, 1200);
  };

  const completeTransferDatabaseBooking = () => {
    if (!selectedSourceAccount) return;

    const finalDebitInr = inrCost + swiftFeeInr;
    
    // 1. Update balances
    const newBalance = selectedSourceAccount.balance - finalDebitInr;
    onUpdateAccountBalance(selectedSourceAccount.id, newBalance);

    // 2. Generate and append ledger transaction
    const newTx: Transaction = {
      id: 'tx_remit_' + Math.floor(Math.random() * 100000),
      accountId: selectedSourceAccount.id,
      type: 'debit',
      description: `Int'l Wire - ${recipientName} (${recipientCountry})`,
      amount: finalDebitInr,
      currency: 'INR',
      date: new Date().toISOString(),
      category: 'Transfer',
      status: 'Completed',
      referenceNo: 'REM' + Math.floor(10000000 + Math.random() * 90000000),
      recipientName,
      recipientBank,
      recipientAccount,
      recipientCountry,
      swiftCode,
      exchangeRate: targetCurrency.rateVsInr,
      feesApplied: swiftFeeInr,
      convertedAmount: foreignAmount,
      convertedCurrency: targetCurrency.rateVsInr
    };

    onAddTransaction(newTx);
    setStep(5);
  };

  const purposeCodes = [
    { code: 'S0306', desc: 'Education & Student Support Fees Abroad' },
    { code: 'S1302', desc: 'Gift or Remittance to Immediate Family Members' },
    { code: 'S1107', desc: 'Travel Expenses: Leisure/Business Remittances' },
    { code: 'S0201', desc: 'Investments in Overseas Properties/Stocks' },
    { code: 'S1501', desc: 'Medical treatment abroad' },
    { code: 'S0802', desc: 'Professional Consultation Fees Remittance' }
  ];

  return (
    <div id="transfer_section_container" className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden font-sans">
      
      {/* Header Visual */}
      <div className="bg-[#9D1D42] text-white p-6 relative">
        <div className="absolute right-4 top-4 opacity-5 pointer-events-none">
          <Globe className="w-24 h-24 text-white" />
        </div>
        <div className="flex items-center space-x-3">
          <Globe className="w-6 h-6 text-[#C29B38]" />
          <div>
            <h2 className="text-lg font-black tracking-tight">FIRST Outbound Global Transfer</h2>
            <p className="text-xs text-rose-100 font-medium">LRS Outward Remittance Gateway with SWIFT & Correspondent clearance.</p>
          </div>
        </div>
      </div>

      {/* Progress Multi-step Track Bar */}
      <div className="bg-stone-50 border-b border-stone-200 px-6 py-3 flex justify-between items-center text-[10px] uppercase font-bold text-stone-400">
        <span className={step >= 1 ? 'text-[#9D1D42]' : ''}>1. Core Details</span>
        <ArrowRight className="w-3 h-3" />
        <span className={step >= 2 ? 'text-[#9D1D42]' : ''}>2. Regulatory LRS</span>
        <ArrowRight className="w-3 h-3" />
        <span className={step >= 3 ? 'text-[#9D1D42]' : ''}>3. Secure OTP</span>
        <ArrowRight className="w-3 h-3" />
        <span className={step >= 4 ? 'text-[#9D1D42]' : ''}>4. SWIFT Settlement</span>
        <ArrowRight className="w-3 h-3" />
        <span className={step >= 5 ? 'text-emerald-600' : ''}>5. Remitted</span>
      </div>

      <div className="p-8">
        
        {/* Step 1: Transfer Form details */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="space-y-5">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Source account Select */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Source Account (INR Only)</span>
                  {selectedSourceAccount && (
                    <span className="text-emerald-600 lowercase font-medium">Bal: ₹{selectedSourceAccount.balance.toLocaleString()}</span>
                  )}
                </label>
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none"
                >
                  {accounts.filter(a => a.accountType !== 'Credit Card').map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountType} (..{acc.accountNo.slice(-4)}) - ₹{acc.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Country Select */}
              <div>
                <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                  Destination Country
                </label>
                <select
                  value={recipientCountry}
                  onChange={(e) => setRecipientCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none"
                >
                  {Object.keys(countryTemplates).map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>

            </div>

            <div className="border-t border-stone-100 pt-3">
              <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider mb-3 text-[#9D1D42]">Recipient Financial Institution</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Beneficiary Full Name
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="Enter Recipient legal name"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#9D1D42]"
                  />
                  {errors.recipientName && (
                    <span className="text-[10px] text-rose-600 block mt-1">{errors.recipientName}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    Beneficiary Bank Name
                  </label>
                  <input
                    type="text"
                    value={recipientBank}
                    onChange={(e) => setRecipientBank(e.target.value)}
                    placeholder="Enter recipient bank"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#9D1D42]"
                  />
                  {errors.recipientBank && (
                    <span className="text-[10px] text-rose-600 block mt-1">{errors.recipientBank}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex justify-between">
                    <span>Account Number / IBAN</span>
                    <span className="text-[10px] text-stone-400 font-mono italic">
                      {countryTemplates[recipientCountry]?.format}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={recipientAccount}
                    onChange={(e) => setRecipientAccount(e.target.value)}
                    placeholder="IBAN or Account Number"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#9D1D42]"
                  />
                  {errors.recipientAccount && (
                    <span className="text-[10px] text-rose-600 block mt-1">{errors.recipientAccount}</span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1">
                    SWIFT / BIC Code (8 or 11 characters)
                  </label>
                  <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="Enter SWIFT BIC"
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#9D1D42] uppercase font-mono"
                  />
                  {errors.swiftCode && (
                    <span className="text-[10px] text-rose-600 block mt-1">{errors.swiftCode}</span>
                  )}
                </div>

              </div>
            </div>

            <div className="border-t border-stone-100 pt-3">
              <h4 className="text-xs font-bold text-stone-850 uppercase tracking-wider mb-3 text-[#9D1D42]">Remittance Amounts & LRS Category</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                      Transfer Cost
                    </label>
                    <div className="flex space-x-2 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setAmountType('FOREIGN')}
                        className={`px-1.5 py-0.5 rounded ${amountType === 'FOREIGN' ? 'bg-[#9D1D42] text-white' : 'bg-stone-100 text-stone-500'}`}
                      >
                        In {targetCurrency.code}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountType('INR')}
                        className={`px-1.5 py-0.5 rounded ${amountType === 'INR' ? 'bg-[#9D1D42] text-white' : 'bg-stone-100 text-stone-500'}`}
                      >
                        In INR (₹)
                      </button>
                    </div>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2 text-stone-500 font-bold text-xs">
                      {amountType === 'FOREIGN' ? targetCurrency.symbol : '₹'}
                    </span>
                    <input
                      type="number"
                      value={remitAmount}
                      onChange={(e) => setRemitAmount(e.target.value)}
                      placeholder={amountType === 'FOREIGN' ? `0.00 ${targetCurrency.code}` : "0.00 INR"}
                      className="w-full pl-8 pr-16 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-850 font-bold focus:outline-none focus:border-[#9D1D42]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] font-black text-stone-400">
                      {amountType === 'FOREIGN' ? targetCurrency.code : 'INR'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#9D1D42] uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span>LRS Remittance Purpose Code</span>
                  </label>
                  <select
                    value={purposeCode}
                    onChange={(e) => setPurposeCode(e.target.value)}
                    className="w-full px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 focus:outline-none"
                  >
                    {purposeCodes.map(cat => (
                      <option key={cat.code} value={cat.code}>{cat.code} - {cat.desc}</option>
                    ))}
                  </select>
                </div>

              </div>

              {errors.amount && (
                <div className="p-2.5 bg-rose-50 text-rose-700 border border-rose-200 text-xs rounded-lg flex items-center gap-2 mt-3 select-none">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{errors.amount}</span>
                </div>
              )}

              {/* Dynamic conversion calculator display */}
              {inrCost > 0 && (
                <div className="mt-4 p-4 bg-stone-50 border border-stone-200/50 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between text-stone-500 font-medium">
                    <span>Live Interbank Rate ({targetCurrency.code}/INR):</span>
                    <span className="font-extrabold text-stone-700">₹{targetCurrency.rateVsInr}</span>
                  </div>

                  <div className="flex justify-between text-stone-500 font-medium pb-2 border-b border-stone-200/50">
                    <span>Applied SWIFT Wire Fee:</span>
                    <span className="font-extrabold text-stone-700">₹{swiftFeeInr.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-xs font-medium pt-1 text-stone-500">
                    <span>Equivalent Foreign FX Received:</span>
                    <span className="font-extrabold text-[#9D1D42]">
                      {targetCurrency.symbol}{foreignAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} {targetCurrency.code}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs font-black pt-1 border-t border-dashed border-stone-200 text-stone-850 uppercase">
                    <span>Total Debited From INR Balance:</span>
                    <span>₹{(inrCost + swiftFeeInr).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}
            </div>

            <button
              id="continue_remit_btn"
              type="submit"
              className="w-full py-3 bg-[#9D1D42] hover:bg-[#801433] text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-colors text-center flex justify-center items-center gap-1 shadow-sm"
            >
              <span>Validate & Review Declaration</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

          </form>
        )}

        {/* Step 2: LRS Declarations & Legal check */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-stone-850 uppercase tracking-wider flex items-center gap-1.5 text-[#9D1D42]">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              <span>RBI Liberalized Remittance Scheme Declaration</span>
            </h3>

            <p className="text-xs text-stone-500">
              Under RBI Section 10(5) of the Foreign Exchange Management Act (FEMA), 1999, you are required to certify that this international remittance does not violate FEMA limits.
            </p>

            <div className="space-y-4">
              
              <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200/50 rounded-xl cursor-pointer hover:bg-stone-100/40 transition-colors">
                <input
                  type="checkbox"
                  checked={agreeLrs}
                  onChange={(e) => setAgreeLrs(e.target.checked)}
                  className="mt-1 accent-[#9D1D42]"
                />
                <span className="text-xs text-stone-650 leading-relaxed">
                  I hereby declare that the total amount of foreign exchange purchased or remitted through all sources in India during this financial year, including this application, does not exceed <strong>USD 250,000</strong> (Resident Individual FEMA Limit).
                </span>
              </label>

              <label className="flex items-start gap-3 p-3.5 bg-stone-50 border border-stone-200/50 rounded-xl cursor-pointer hover:bg-stone-100/40 transition-colors">
                <input
                  type="checkbox"
                  checked={agreeTax}
                  onChange={(e) => setAgreeTax(e.target.checked)}
                  className="mt-1 accent-[#9D1D42]"
                />
                <span className="text-xs text-stone-650 leading-relaxed">
                  I authorize IDFC FIRST Bank to apply Tax Collected at Source (TCS) provisions of 5% (or 20% if applicable) on outward remittance values exceeding ₹7,00,000 threshold under Section 206C(1G).
                </span>
              </label>

            </div>

            {/* remitted specs summary */}
            <div className="p-4 bg-amber-50/70 border border-amber-200/55 rounded-xl space-y-1.5 text-xs text-stone-700">
              <span className="text-[10px] uppercase font-bold text-amber-800 block">Outbound Transaction Summary</span>
              <div>• Beneficiary: <strong>{recipientName}</strong> ({recipientCountry})</div>
              <div>• Target Bank: <strong>{recipientBank}</strong> (IBAN: {recipientAccount})</div>
              <div>• Total Estimated Debited Cost: <strong>₹{(inrCost + swiftFeeInr).toLocaleString()}</strong></div>
              <div>• Settling equivalent currency: <strong>{targetCurrency.symbol}{foreignAmount.toLocaleString()} {targetCurrency.code}</strong></div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-705 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                id="declaration_confirm_btn"
                disabled={!agreeLrs || !agreeTax}
                onClick={handleStep2Submit}
                className="flex-1 py-2.5 bg-[#9D1D42] hover:bg-[#801433] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sign & Authorize
              </button>
            </div>

          </div>
        )}

        {/* Step 3: SMS Code Sec OTP verification */}
        {step === 3 && (
          <form onSubmit={handleOtpVerify} className="space-y-6">
            
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center p-3 bg-[#9D1D42]/10 text-[#9D1D42] rounded-full">
                <Key className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="text-md font-bold text-stone-850">Two-Factor OTP Remittance Verification</h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                We have transmitted an offline 6-digit cryptographic verification code to your verified mobile number <strong>{user.mobile}</strong> and email <strong>{user.email}</strong>.
              </p>
            </div>

            <div className="max-w-xs mx-auto space-y-2 text-center">
              <label className="block text-[11px] font-bold text-stone-500 uppercase tracking-widest">
                Enter 6-Digit Code
              </label>
              <input
                id="remit_otp_input"
                type="text"
                maxLength={6}
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className="w-full text-center tracking-widest text-2xl font-black py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#9D1D42]/20 focus:border-[#9D1D42]"
              />
              
              {otpError && (
                <span className="text-[11px] text-rose-600 block leading-tight pt-1 font-semibold">{otpError}</span>
              )}
            </div>

            {/* Helpful Helper Alert showing user generated OTP to simplify prototype review */}
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-800 text-[11px] text-center">
              <p className="font-semibold">Prototype Helper Prompt:</p>
              <p>Your simulated SMS Authenticator token is: <strong className="font-mono text-xs">{generatedOtp}</strong> (or enter <span className="font-semibold font-mono">999999</span>)</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 py-2 bg-stone-50 border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Go Back
              </button>
              <button
                id="otp_verify_btn"
                type="submit"
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer flex justify-center items-center gap-1"
              >
                <Check className="w-4.5 h-4.5" />
                <span>Verify Token</span>
              </button>
            </div>

          </form>
        )}

        {/* Step 4: Outward Settlement Clearance animation */}
        {step === 4 && (
          <div className="py-8 space-y-6 text-center select-none">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-[#9D1D42]/20 border-t-[#9D1D42] rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#9D1D42] font-black text-xs font-mono">
                SWIFT
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-md font-bold text-stone-850">Processing Outward SWIFT Clearance</h3>
              <p className="text-xs text-stone-400">Negotiating interbank conversion contracts under regulatory supervision...</p>
            </div>

            {/* Dynamic ledger clearance actions logged */}
            <div className="max-w-md mx-auto text-left bg-stone-900 text-zinc-300 font-mono text-[10px] rounded-xl p-4 space-y-2 border border-zinc-950 shadow-inner">
              {settlementLogs.map((log, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <span className={settlementStep >= index ? 'text-emerald-400' : 'text-zinc-650'}>
                    {settlementStep >= index ? '●' : '○'}
                  </span>
                  <span className={settlementStep >= index ? 'text-[#FAF9F5]' : 'text-zinc-600'}>
                    {log}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Transfer Success Receipt feedback */}
        {step === 5 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-6 py-6"
          >
            <div className="inline-flex items-center justify-center p-4 bg-emerald-50 text-emerald-600 border border-emerald-250 rounded-full">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-stone-850">Remittance Initiated Successfully!</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                The SWIFT Wire Remittance token has cleared the Federal Reserve Corridor network. Funds have been debited from your reserve balance.
              </p>
            </div>

            <div className="max-w-sm mx-auto bg-stone-50 border border-stone-200 rounded-xl p-4 text-xs text-left text-stone-650 space-y-2">
              <div className="flex justify-between">
                <span>Correspondent Netting Code:</span>
                <span className="font-mono font-bold text-stone-800">SHA256-{Math.floor(1000 + Math.random() * 9000)}B</span>
              </div>
              <div className="flex justify-between">
                <span>Beneficiary Customer:</span>
                <span className="font-bold text-stone-800">{recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span>Beneficiary Country:</span>
                <span className="font-bold text-stone-800">{recipientCountry}</span>
              </div>
              <div className="flex justify-between">
                <span>Foreign FX remitted:</span>
                <span className="font-extrabold text-emerald-600">{targetCurrency.symbol}{foreignAmount.toLocaleString()} {targetCurrency.code}</span>
              </div>
              <div className="flex justify-between border-t border-stone-200/50 pt-2 font-bold text-stone-850">
                <span>Total debited (with SWIFT Fee):</span>
                <span>₹{(inrCost + swiftFeeInr).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4 max-w-sm mx-auto">
              <button
                onClick={() => {
                  setRecipientName('');
                  setRecipientAccount('');
                  setSwiftCode('');
                  setRemitAmount('');
                  setStep(1);
                  setAgreeLrs(false);
                  setAgreeTax(false);
                }}
                className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-705 text-xs font-bold uppercase rounded-lg transition-colors cursor-pointer"
              >
                Make Another Transfer
              </button>
            </div>

          </motion.div>
        )}

      </div>

    </div>
  );
}
