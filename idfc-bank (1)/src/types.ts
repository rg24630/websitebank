export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  lastLogin: string;
  customerId: string;
  mobile: string;
  avatarUrl?: string;
  tier: 'Signature' | 'First Select' | 'Wealth' | 'Standard';
}

export type AccountType = 'Savings' | 'Checking' | 'Credit Card';

export interface BankAccount {
  id: string;
  accountNo: string;
  accountType: AccountType;
  balance: number;
  currency: string;
  accountHolder: string;
  limit?: number; // for credit card
  interestRate?: number; // for savings
}

export type TransactionType = 'credit' | 'debit';
export type TransactionStatus = 'Completed' | 'Pending' | 'Failed';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  description: string;
  amount: number;
  currency: string;
  date: string; // ISO string
  category: 'Salary' | 'Transfer' | 'Shopping' | 'Food' | 'Utilities' | 'Travel' | 'Investment' | 'Entertainment' | 'Others';
  status: TransactionStatus;
  referenceNo: string;
  
  // Wire/International Transfer specific details
  recipientName?: string;
  recipientBank?: string;
  recipientCountry?: string;
  recipientAccount?: string;
  swiftCode?: string;
  exchangeRate?: number;
  feesApplied?: number;
  convertedAmount?: number;
  convertedCurrency?: number;
}

export interface SecuritySetting {
  twoFactorEnabled: boolean;
  dailyWireLimit: number;
  currentWireSpent: number;
  cardLocked: boolean;
  loginAlertsEnabled: boolean;
}

export interface LoginAuditLog {
  id: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  location: string;
  status: 'Successful' | 'Failed';
}

export interface CurrencyRate {
  code: string;
  name: string;
  rateVsInr: number; // exchange rate vs INR (base currency for IDFC)
  symbol: string;
}
