import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Key, User, RefreshCw, Eye, EyeOff, AlertCircle, Info, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface LoginProps {
  onLoginSuccess: (user: UserProfile) => void;
  mockUser: UserProfile;
}

export default function Login({ onLoginSuccess, mockUser }: LoginProps) {
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');
  const [captcha, setCaptcha] = useState('');
  const [inputCaptcha, setInputCaptcha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useVirtualKeypad, setUseVirtualKeypad] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simple numeric / alpha-numeric CAPTCHA generator
  const generateCaptcha = () => {
    const chars = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; // exclude confusing chars like 1,0,O,I,l
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
    setInputCaptcha('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Preset demo credentials for quick testing
  const fillDemoCredentials = () => {
    setCustomerId('IDFC7849201');
    setPassword('SecurePass123!');
    setInputCaptcha(captcha);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please enter your Customer ID or Username.');
      return;
    }
    if (!password) {
      setError('Please enter your Password or Secure PIN.');
      return;
    }
    if (inputCaptcha.toUpperCase() !== captcha) {
      setError('Invalid CAPTCHA code. Please try again.');
      generateCaptcha();
      return;
    }

    setIsLoading(true);

    // Simulate elite bank-grade secure handshakes
    setTimeout(() => {
      setIsLoading(false);
      if (customerId === 'IDFC7849201' && password === 'SecurePass123!') {
        onLoginSuccess(mockUser);
      } else {
        setError('Invalid credentials. Check Customer ID or Password. (Tip: Use the "Auto-Fill Demo Credentials" button below)');
        generateCaptcha();
      }
    }, 1200);
  };

  // Keyboard array for secure mouse-only password entry
  const keypadNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
  const handleKeypadClick = (num: number) => {
    setPassword((prev) => prev + num);
  };

  return (
    <div id="login_container" className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between items-center relative overflow-hidden font-sans">
      
      {/* Decorative Brand Circles */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#9D1D42]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#C29B38]/5 blur-3xl pointer-events-none" />

      {/* Security Header Banner */}
      <div className="w-full bg-[#1A1A1A] text-white text-xs py-2 px-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-[#C29B38]" />
          <span>Secure Banking Gateway: 256-bit SSL Encrypted Connection</span>
        </div>
        <div className="hidden sm:flex items-center space-x-3 text-slate-400">
          <span>Official IDFC First Bank Portal</span>
          <span>•</span>
          <span>Tech: Multi-factor Enabled</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center px-4 py-8 z-10">
        
        {/* Brand Identity Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center mb-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#9D1D42]">
              IDFC <span className="text-stone-800 font-light">FIRST</span> <span className="text-[#C29B38] font-bold">Bank</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 uppercase tracking-widest font-semibold flex justify-center items-center gap-1">
            <span>Corporate & Personal</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C29B38]"></span>
            <span>Digital NetBanking Portal</span>
          </p>
        </div>

        {/* Credentials Form Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-stone-200/60 p-8 relative overflow-hidden"
          id="login_card"
        >
          {/* Subtle maroon top stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#9D1D42]" />

          <h2 className="text-lg font-bold text-stone-800 mb-6 flex items-center justify-between">
            <span>Secure Customer Portal</span>
            <span className="px-2 py-0.5 text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Server Active
            </span>
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-start gap-2 animate-shake" id="login_error">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Customer ID / Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-stone-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="customer_id_input"
                  type="text"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  placeholder="Enter Bank Customer ID"
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9D1D42]/20 focus:border-[#9D1D42] transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => setUseVirtualKeypad(!useVirtualKeypad)}
                  className="text-[10px] uppercase font-bold text-[#9D1D42] hover:underline flex items-center gap-1 focus:outline-none"
                >
                  <Lock className="w-3 h-3" />
                  {useVirtualKeypad ? 'Use Keyboard' : 'Secure Keypad'}
                </button>
              </div>

              <div className="relative mb-3">
                <span className="absolute left-3 top-3 text-stone-400">
                  <Key className="w-4 h-4" />
                </span>
                <input
                  id="password_input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Secure NetBanking Password"
                  className="w-full pl-10 pr-10 py-2.5 bg-stone-50/50 border border-stone-200 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9D1D42]/20 focus:border-[#9D1D42] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Secure Virtual Mouse Keypad */}
              <AnimatePresence>
                {useVirtualKeypad && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden bg-stone-50 border border-stone-200 rounded-lg p-3 mb-3"
                  >
                    <p className="text-[10px] text-stone-500 mb-2 font-medium flex items-center gap-1">
                      <Info className="w-3 h-3 text-[#C29B38]" /> Secures against hardware keyloggers.
                    </p>
                    <div className="grid grid-cols-5 gap-1.5">
                      {keypadNumbers.map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleKeypadClick(num)}
                          className="py-1.5 bg-white border border-stone-200 hover:bg-[#9D1D42]/10 hover:border-[#9D1D42] text-sm font-semibold text-stone-700 rounded transition-colors active:scale-95 focus:outline-none"
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setPassword('')}
                        className="col-span-2 py-1.5 bg-stone-200 hover:bg-stone-300 text-xs font-semibold text-stone-700 rounded transition-colors focus:outline-none"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setPassword((prev) => prev.slice(0, -1))}
                        className="col-span-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold rounded transition-colors focus:outline-none"
                      >
                        Backspace
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Captcha System */}
            <div>
              <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5">
                Security Verification (CAPTCHA)
              </label>
              <div className="flex space-x-3 items-center">
                <div className="relative select-none flex items-center justify-center bg-zinc-100 tracking-wider font-mono font-bold text-lg text-stone-700 italic border border-dashed border-stone-300 rounded-lg px-4 py-2 w-32 shadow-inner bg-gradient-to-tr from-zinc-200 via-stone-100 to-zinc-200">
                  {/* Styled anti-bot line indicators */}
                  <div className="absolute inset-0 bg-opacity-20 flex flex-col justify-around pointer-events-none">
                    <div className="w-full h-[1px] bg-red-400 rotate-3"></div>
                    <div className="w-full h-[1px] bg-blue-400 -rotate-3"></div>
                  </div>
                  {captcha}
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="p-2.5 bg-stone-100 hover:bg-stone-200 rounded-lg border border-stone-200 text-stone-600 transition-colors focus:outline-none"
                  title="Generate new CAPTCHA"
                >
                  <RefreshCw className="w-4 h-4 animate-spin-hover" />
                </button>
                <input
                  id="captcha_input"
                  type="text"
                  maxLength={5}
                  value={inputCaptcha}
                  onChange={(e) => setInputCaptcha(e.target.value)}
                  placeholder="Enter Code"
                  className="flex-1 px-3 py-2.5 border border-stone-200 bg-stone-50/50 rounded-lg text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#9D1D42]/20 focus:border-[#9D1D42] uppercase text-center font-mono font-semibold"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              id="login_submit_btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#9D1D42] hover:bg-[#801433] text-white font-bold text-sm tracking-wider uppercase rounded-xl border border-[#9D1D42] transition-all duration-200 shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Shield className="w-4.5 h-4.5" />
                  <span>Secure Login</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Assist */}
          <div className="mt-6 pt-5 border-t border-stone-200">
            <button
              id="demo_fill_btn"
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2 bg-[#C29B38]/10 hover:bg-[#C29B38]/15 border border-[#C29B38]/40 hover:border-[#C29B38] text-[#917122] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 focus:outline-none"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Auto-Fill Demo Credentials & CAPTCHA</span>
            </button>
          </div>
        </motion.div>

        {/* Security reminders below box */}
        <div className="mt-6 flex items-center gap-2 justify-center text-[11px] text-stone-500 text-center">
          <Lock className="w-3 h-3 text-stone-400" />
          <span>Never share your password, OTP, or Secure PIN with anyone.</span>
        </div>
      </div>

      {/* Security Footer Links */}
      <footer className="w-full py-4 bg-stone-100 border-t border-stone-200 text-center text-xs text-stone-500 px-4">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <p>© 2026 IDFC FIRST Bank Ltd. All Rights Reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-[#9D1D42] hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-[#9D1D42] hover:underline">Terms & Conditions</a>
            <span>•</span>
            <a href="#" className="hover:text-[#9D1D42] hover:underline">Security Advisory</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
