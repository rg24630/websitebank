import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, AlertTriangle, Monitor, Lock, Unlock, 
  MapPin, CheckCircle, Smartphone, Sliders, BellDot 
} from 'lucide-react';
import { LoginAuditLog, SecuritySetting } from '../types';
import { mockAuditLogs } from '../mockData';

interface SecurityCenterProps {
  securitySettings: SecuritySetting;
  onUpdateSettings: (newSettings: SecuritySetting) => void;
  cardLocked: boolean;
  onToggleCardLock: () => void;
}

export default function SecurityCenter({
  securitySettings,
  onUpdateSettings,
  cardLocked,
  onToggleCardLock
}: SecurityCenterProps) {
  const [logs, setLogs] = useState<LoginAuditLog[]>(mockAuditLogs);
  const [dailyWireLimit, setDailyWireLimit] = useState(securitySettings.dailyWireLimit);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleUpdateLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...securitySettings,
      dailyWireLimit
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const toggle2fa = () => {
    onUpdateSettings({
      ...securitySettings,
      twoFactorEnabled: !securitySettings.twoFactorEnabled
    });
  };

  const toggleAlerts = () => {
    onUpdateSettings({
      ...securitySettings,
      loginAlertsEnabled: !securitySettings.loginAlertsEnabled
    });
  };

  const formatINR = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="security_gateway" className="space-y-6 font-sans">
      
      {/* Title */}
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold text-stone-800">Secure Vault Configuration</h2>
        <p className="text-xs text-stone-500">Manage real-time anti-fraud protocols, card locks, and session audits.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Anti-Fraud Controllers (Left Column) */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200/60 p-6 space-y-5">
            <h3 className="text-sm font-bold text-stone-850 flex items-center gap-1.5 uppercase tracking-wider text-[#9D1D42]">
              <Sliders className="w-5 h-5" /> 
              <span>Limits & Approvals</span>
            </h3>

            {/* Slider Config for Outboard Remittance Limit */}
            <form onSubmit={handleUpdateLimitSubmit} className="space-y-4 pt-1">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-605">Outbound Daily Remittance Boundary</span>
                  <span className="font-mono font-bold text-[#9D1D42] bg-rose-50 px-2 py-0.5 border border-rose-100 rounded text-xs">
                    {formatINR(dailyWireLimit)}
                  </span>
                </div>
                <input
                  id="limit_range_slider"
                  type="range"
                  min="100000" // 1 Lakh min
                  max="5000000" // 50 Lakh max (₹50,00,000)
                  step="50000"
                  value={dailyWireLimit}
                  onChange={(e) => setDailyWireLimit(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-stone-150 rounded-lg appearance-none cursor-pointer accent-[#9D1D42]"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                  <span>Min: ₹1,00,000</span>
                  <span>Max: ₹50,00,000 (FEMA Limit cap)</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <div className="text-[11px] text-stone-400">
                  Daily remittance spent today: <strong>{formatINR(securitySettings.currentWireSpent)}</strong>
                </div>
                <button
                  id="save_limit_btn"
                  type="submit"
                  className="px-4 py-2 bg-[#9D1D42] hover:bg-[#801433] text-white font-bold text-xs uppercase rounded-lg transition-colors cursor-pointer"
                >
                  Save Limit Changes
                </button>
              </div>

              <AnimatePresence>
                {saveSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-250 text-xs rounded-lg text-center font-bold"
                  >
                    Outward bounds limit altered successfully. Safeguard locked.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Custom security checkboxes */}
            <div className="space-y-4 pt-4 border-t border-stone-105">
              
              <div className="flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-stone-800">Two-Factor Remittance (OTP Challenge)</h4>
                  <p className="text-[11px] text-stone-400">Force numeric OTP keys on any outward remittances over ₹10k.</p>
                </div>
                <button
                  type="button"
                  onClick={toggle2fa}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none ${
                    securitySettings.twoFactorEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    securitySettings.twoFactorEnabled ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              <div className="flex justify-between items-center text-xs pt-3 border-t border-stone-50">
                <div>
                  <h4 className="font-bold text-stone-800">Automatic SMS & Email Log Notifications</h4>
                  <p className="text-[11px] text-stone-400">Transmit real-time telemetry records on profile access.</p>
                </div>
                <button
                  type="button"
                  onClick={toggleAlerts}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors focus:outline-none ${
                    securitySettings.loginAlertsEnabled ? 'bg-emerald-600' : 'bg-stone-300'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    securitySettings.loginAlertsEnabled ? 'translate-x-5' : ''
                  }`} />
                </button>
              </div>

              {/* Card freeze status */}
              <div className="flex justify-between items-center text-xs pt-3 border-t border-stone-100">
                <div>
                  <h4 className="font-bold text-stone-800">FIRST Select Card State</h4>
                  <p className="text-[11px] text-stone-400">Instantly halt merchant online API integrations.</p>
                </div>
                <button
                  type="button"
                  onClick={onToggleCardLock}
                  className={`px-3.5 py-1.5 text-[11px] font-black uppercase rounded-lg border flex items-center gap-1 transition-all ${
                    cardLocked 
                      ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100/50' 
                      : 'bg-[#9D1D42]/10 text-[#9D1D42] border-[#9D1D42]/20 hover:bg-[#9D1D42]/20'
                  }`}
                >
                  {cardLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                  <span>{cardLocked ? 'LOCKED (Halted)' : 'Active (unlocked)'}</span>
                </button>
              </div>

            </div>

          </div>

          {/* Secure advisory disclaimer */}
          <div className="p-4 bg-yellow-50 border border-yellow-200/60 rounded-2xl flex gap-3 text-xs text-yellow-800 leading-relaxed font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong>Compliance Regulatory Advisory:</strong> This portal utilizes 256-bit symmetric security key wrappers. Our security engine checks your operating coordinates. If VPN services from hostile countries are routed, transactional clearance weights are modified in real-time.
            </div>
          </div>

        </div>

        {/* Security / Audit Log History (Right Column) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-stone-200/60 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-stone-850 flex items-center gap-1.5 uppercase tracking-wider text-[#9D1D42]">
                <Monitor className="w-5 h-5 text-indigo-600" />
                <span>Session Access Audits</span>
              </h3>
              <span className="text-[10px] uppercase text-stone-400 font-extrabold flex items-center gap-0.5">
                <BellDot className="w-3 h-3 text-[#9D1D42] animate-pulse" /> Live Tracker
              </span>
            </div>

            <p className="text-xs text-stone-500 mb-4">
              Detailed tracking logs of recent telemetry logins. Secure systems flag any unknown devices.
            </p>

            <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
              {logs.map((log) => (
                <div key={log.id} className="p-3 border border-stone-105 rounded-xl bg-stone-50/50 space-y-1.5 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-stone-800">{log.device}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[9px] font-bold ${
                      log.status === 'Successful' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {log.status === 'Successful' ? 'Cleansed' : 'BLOCKED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 text-[10px] text-stone-500 font-medium">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span>{log.location}</span>
                    </div>
                    <div className="text-right font-mono">
                      {log.ipAddress}
                    </div>
                  </div>

                  <div className="text-[9px] text-stone-400 font-semibold font-mono">
                    Session Registered: {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 w-4 text-emerald-600" /> Authorized browsers only
            </span>
            <button 
              onClick={() => {
                const refreshed: LoginAuditLog = {
                  id: 'log_' + Math.floor(Math.random() * 1000),
                  timestamp: new Date().toISOString(),
                  ipAddress: '127.0.0.1 (Localhost IP)',
                  device: 'Chrome on Secure Client Node',
                  location: 'Sandbox Secure System',
                  status: 'Successful'
                };
                setLogs(prev => [refreshed, ...prev]);
              }} 
              className="text-indigo-600 font-bold hover:underline cursor-pointer focus:outline-none"
            >
              Force Audit Refresh
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
