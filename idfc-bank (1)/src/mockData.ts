import { UserProfile, BankAccount, Transaction, LoginAuditLog, CurrencyRate, SecuritySetting } from './types';

export const mockUser: UserProfile = {
  id: 'usr_902183',
  email: 'rg24630@gmail.com',
  fullName: 'Rajesh Kumar',
  lastLogin: '2026-05-25T08:14:22Z',
  customerId: 'IDFC7849201',
  mobile: '+91 98765 43210',
  tier: 'First Select',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop'
};

export const mockAccounts: BankAccount[] = [
  {
    id: 'acc_savings',
    accountNo: '1008 3492 8492',
    accountType: 'Savings',
    balance: 482950.75, // ₹4,82,950.75
    currency: 'INR',
    accountHolder: 'Rajesh Kumar',
    interestRate: 6.25 // IDFC FIRST is known for high savings interest rates!
  },
  {
    id: 'acc_checking',
    accountNo: '1008 7208 1930',
    accountType: 'Checking',
    balance: 125000.00, // ₹1,25,000.00
    currency: 'INR',
    accountHolder: 'Rajesh Kumar'
  },
  {
    id: 'acc_credit',
    accountNo: '4532 9912 0048 3829',
    accountType: 'Credit Card',
    balance: -28450.00, // Current Outstanding: ₹28,450.00
    currency: 'INR',
    accountHolder: 'Rajesh Kumar',
    limit: 500000.00 // Card Limit: ₹5,00,000.00
  }
];

export const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    accountId: 'acc_savings',
    type: 'credit',
    description: 'Capco Technologies - Monthly Payroll',
    amount: 175000.00,
    currency: 'INR',
    date: '2026-05-01T10:00:00Z',
    category: 'Salary',
    status: 'Completed',
    referenceNo: 'TXN89123098'
  },
  {
    id: 'tx_002',
    accountId: 'acc_savings',
    type: 'debit',
    description: 'Tata Power Electricity Bill',
    amount: 4350.00,
    currency: 'INR',
    date: '2026-05-05T14:30:00Z',
    category: 'Utilities',
    status: 'Completed',
    referenceNo: 'TXN11200492'
  },
  {
    id: 'tx_003',
    accountId: 'acc_credit',
    type: 'debit',
    description: 'Amazon India Retail',
    amount: 12499.00,
    currency: 'INR',
    date: '2026-05-10T18:15:00Z',
    category: 'Shopping',
    status: 'Completed',
    referenceNo: 'TXN55928301'
  },
  {
    id: 'tx_004',
    accountId: 'acc_checking',
    type: 'debit',
    description: 'Zomato Food Delivery',
    amount: 1250.00,
    currency: 'INR',
    date: '2026-05-12T20:45:00Z',
    category: 'Food',
    status: 'Completed',
    referenceNo: 'TXN99203847'
  },
  {
    id: 'tx_005',
    accountId: 'acc_savings',
    type: 'debit',
    description: 'International Wire - John Smith (USA)',
    amount: 83250.00, // ~$1000 converted
    currency: 'INR',
    date: '2026-05-15T09:15:00Z',
    category: 'Transfer',
    status: 'Completed',
    referenceNo: 'TXN48928039',
    recipientName: 'John Smith',
    recipientBank: 'JPMorgan Chase Bank',
    recipientCountry: 'United States',
    recipientAccount: 'US8923098492038',
    swiftCode: 'CHASEUS33XXX',
    exchangeRate: 83.25,
    feesApplied: 500.00,
    convertedAmount: 1000.00,
    convertedCurrency: 83.25
  },
  {
    id: 'tx_006',
    accountId: 'acc_savings',
    type: 'credit',
    description: 'Zerodha Broking - Dividend payout',
    amount: 15450.00,
    currency: 'INR',
    date: '2026-05-18T11:00:00Z',
    category: 'Investment',
    status: 'Completed',
    referenceNo: 'TXN30491029'
  },
  {
    id: 'tx_007',
    accountId: 'acc_credit',
    type: 'debit',
    description: 'MakeMyTrip flight booking',
    amount: 14500.00,
    currency: 'INR',
    date: '2026-05-22T08:30:00Z',
    category: 'Travel',
    status: 'Completed',
    referenceNo: 'TXN99502910'
  },
  {
    id: 'tx_008',
    accountId: 'acc_checking',
    type: 'debit',
    description: 'International Wire - Sophia Laurent (France)',
    amount: 45250.00, // ~€500 converted
    currency: 'INR',
    date: '2026-05-24T16:20:00Z',
    category: 'Transfer',
    status: 'Pending',
    referenceNo: 'TXN88402941',
    recipientName: 'Sophia Laurent',
    recipientBank: 'BNP Paribas',
    recipientCountry: 'France',
    recipientAccount: 'FR7630004000012345678901234',
    swiftCode: 'BNPAFRPPXXX',
    exchangeRate: 90.50,
    feesApplied: 500.00,
    convertedAmount: 500.00,
    convertedCurrency: 90.50
  }
];

export const mockAuditLogs: LoginAuditLog[] = [
  {
    id: 'log_1',
    timestamp: '2026-05-25T08:14:22Z',
    ipAddress: '103.241.12.89',
    device: 'Chrome on macOS (14.2)',
    location: 'Mumbai, India',
    status: 'Successful'
  },
  {
    id: 'log_2',
    timestamp: '2026-05-24T10:05:12Z',
    ipAddress: '103.241.12.89',
    device: 'Chrome on macOS (14.2)',
    location: 'Mumbai, India',
    status: 'Successful'
  },
  {
    id: 'log_3',
    timestamp: '2026-05-22T19:40:05Z',
    ipAddress: '103.241.12.102',
    device: 'iOS Mobile App (v5.4.1)',
    location: 'Mumbai, India',
    status: 'Successful'
  },
  {
    id: 'log_4',
    timestamp: '2026-05-21T15:22:11Z',
    ipAddress: '198.140.23.4',
    device: 'Firefox on Windows 11',
    location: 'London, UK (VPN)',
    status: 'Failed' // Simulated failed login attempt for high-fidelity security inspection
  }
];

export const currencyRates: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', rateVsInr: 83.25, symbol: '$' },
  { code: 'EUR', name: 'Euro', rateVsInr: 90.50, symbol: '€' },
  { code: 'GBP', name: 'British Pound', rateVsInr: 105.10, symbol: '£' },
  { code: 'SGD', name: 'Singapore Dollar', rateVsInr: 61.80, symbol: 'S$' },
  { code: 'AED', name: 'UAE Dirham', rateVsInr: 22.66, symbol: 'د.إ' },
  { code: 'AUD', name: 'Australian Dollar', rateVsInr: 54.90, symbol: 'A$' }
];

export const initialSecuritySetting: SecuritySetting = {
  twoFactorEnabled: true,
  dailyWireLimit: 1000000, // ₹10,00,000 (10 Lakhs)
  currentWireSpent: 128500, // Spent ₹1,28,500 today
  cardLocked: false,
  loginAlertsEnabled: true
};
