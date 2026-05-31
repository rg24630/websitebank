import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Award, DollarSign, PieChart as PieIcon, BarChart2, Briefcase } from 'lucide-react';
import { Transaction } from '../types';

interface VisualAnalyticsProps {
  transactions: Transaction[];
}

export default function VisualAnalytics({ transactions }: VisualAnalyticsProps) {
  // 1. Group transaction sums by category
  const categoriesList = ['Salary', 'Transfer', 'Shopping', 'Food', 'Utilities', 'Travel', 'Investment', 'Entertainment', 'Others'];
  const categoryColors = {
    Salary: '#059669',       // Emerald
    Transfer: '#4F46E5',     // Indigo
    Shopping: '#D97706',     // Amber
    Food: '#EC4899',         // Pink
    Utilities: '#2563EB',    // Blue
    Travel: '#06B6D4',       // Cyan
    Investment: '#C29B38',   // Gold
    Entertainment: '#9D1D42',// Crimson
    Others: '#6B7280'        // Gray
  };

  const categoryData = categoriesList.map(cat => {
    const sum = transactions
      .filter(tx => tx.category === cat && tx.type === 'debit')
      .reduce((acc, tx) => acc + tx.amount, 0);
    return { name: cat, value: Math.round(sum) };
  }).filter(item => item.value > 0);

  // 2. Mock historic Cashflow data (Credits vs Debits) over last 6 months
  const cashflowHistory = [
    { month: 'Dec', Income: 175000, Expense: 84000 },
    { month: 'Jan', Income: 185000, Expense: 98000 },
    { month: 'Feb', Income: 175000, Expense: 112000 },
    { month: 'Mar', Income: 195000, Expense: 95000 },
    { month: 'Apr', Income: 175000, Expense: 142000 },
    { month: 'May (Current)', Income: 190450, Expense: 128500 }
  ];

  const totalMayIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalMayExpense = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Overwrite current month data to reflect real-time active changes
  cashflowHistory[5].Income = Math.round(totalMayIncome);
  cashflowHistory[5].Expense = Math.round(totalMayExpense);

  const formatINRShort = (value: number) => {
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    }
    if (value >= 1000) {
      return `₹${(value / 1000).toFixed(0)}k`;
    }
    return `₹${value}`;
  };

  const hasExpenses = categoryData.length > 0;

  return (
    <div id="analytics_matrix" className="space-y-6">
      
      {/* Title */}
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold text-stone-800">Dynamic Spend Intelligence</h2>
        <p className="text-xs text-stone-500">Live portfolio cashflow streams and automated category profiling.</p>
      </div>

      {/* Primary Cashflow charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly cash flow bar chart (Double column) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl shadow-sm border border-stone-200/60 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-stone-850 flex items-center gap-1.5">
              <BarChart2 className="w-5 h-5 text-[#9D1D42]" /> 
              <span>6-Month Influx vs Remittance</span>
            </h3>
            <span className="text-[10px] uppercase font-extrabold text-stone-400">Monthly Comparative</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={cashflowHistory}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE9E4" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#78716C', fontSize: 10, fontWeight: 600 }}
                  axisLine={{ stroke: '#EBE9E4' }}
                />
                <YAxis 
                  tickFormatter={formatINRShort}
                  tick={{ fill: '#78716C', fontSize: 10 }}
                  axisLine={false}
                />
                <Tooltip 
                  formatter={(value: number) => [`₹${value.toLocaleString()}`]}
                  contentStyle={{ backgroundColor: '#1C1917', borderRadius: '12px', border: 'none', color: '#FFF', fontSize: '11px' }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '10px' }}
                />
                <Bar dataKey="Income" fill="#C29B38" name="Credits / Influx" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expense" fill="#9D1D42" name="Debits / Outflow" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share (Right Column) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-[#EBE9E4] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-stone-850 flex items-center gap-1.5">
                <PieIcon className="w-5 h-5 text-indigo-600" />
                <span>Debit Distribution</span>
              </h3>
              <span className="text-[10px] uppercase text-stone-400 font-extrabold">By Category</span>
            </div>

            {hasExpenses ? (
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={categoryColors[entry.name as keyof typeof categoryColors] || '#A1A1AA'} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`]}
                      contentStyle={{ backgroundColor: '#1C1917', border: 'none', borderRadius: '8px', color: '#FFF', fontSize: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Micro center total label */}
                <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                  <span className="text-[9px] uppercase font-bold text-stone-400">Total May</span>
                  <span className="text-xs font-black text-rose-700">₹{Math.round(totalMayExpense).toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="h-44 flex flex-col justify-center items-center text-stone-400 text-xs">
                <span>No Outflowing Debits in May.</span>
                <span>Transfer some money to see shares!</span>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-4 border-t border-stone-100 max-h-48 overflow-y-auto pr-1">
            {categoryData.length === 0 ? (
              <p className="text-[10px] text-stone-400 text-center">Empty category portfolio matrix.</p>
            ) : (
              categoryData.map((item) => (
                <div key={item.name} className="flex justify-between items-center text-[11px] font-medium">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: categoryColors[item.name as keyof typeof categoryColors] }}
                    />
                    <span className="text-stone-650">{item.name}</span>
                  </div>
                  <span className="font-extrabold text-stone-800">₹{item.value.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Insights row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        
        {/* Savings Growth Insight Card */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 hover:to-emerald-600/10 border border-emerald-250/50 rounded-2xl p-6 transition-all">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-800">FIRST Select Dividend Yield Advisory</h4>
              <p className="text-xs text-emerald-700 leading-relaxed">
                By maintaining an average quarterly balance exceeding ₹5,00,000, you are earning high yield interest rates of 6.25% credited monthly. Keep simulating deposits to watch compound rewards safely grow.
              </p>
            </div>
          </div>
        </div>

        {/* Global Remittance limit progress index */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200/60 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wide">FEMA LRS Remittance Utilization</span>
            <span className="text-xs font-mono font-bold text-indigo-700">₹{transactions.filter(t => t.swiftCode).reduce((s,t) => s + t.amount, 0).toLocaleString()} / ₹2,08,12,500 ($250k Limit)</span>
          </div>
          
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.max(3, Math.min(100, (transactions.filter(t => t.swiftCode).reduce((s,t) => s + t.amount, 0) / 20812500) * 100))}%` 
              }}
            />
          </div>
          <p className="text-[10px] text-stone-400">
            FEMA boundaries authorize up to equivalent USD 250,000 per fiscal year. High status corporate wire clearing will enforce direct TCS levies on limits crossed.
          </p>
        </div>

      </div>

    </div>
  );
}
