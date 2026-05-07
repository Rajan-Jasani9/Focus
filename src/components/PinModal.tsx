import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '../utils/cn';

// Simple synchronous hash for 4-digit PIN (not cryptographically secure, just obfuscation)
const hashPin = (pin: string) => {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
};

export function PinModal({ onUnlock }: { onUnlock: () => void }) {
  const { pinHash, setPinHash } = useTaskStore();
  const [pin, setPin] = useState('');
  const [isSetup, setIsSetup] = useState(!pinHash);
  const [error, setError] = useState(false);

  // If there's no pinHash, user is in setup mode
  useEffect(() => {
    setIsSetup(!pinHash);
  }, [pinHash]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    if (isSetup) {
      setPinHash(hashPin(pin));
      onUnlock();
    } else {
      if (hashPin(pin) === pinHash) {
        onUnlock();
      } else {
        setError(true);
        setPin('');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0f1115] z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-[var(--color-dark-card)] border border-[var(--color-dark-border)] rounded-xl p-6 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-3">
            {isSetup ? <Unlock className="text-[var(--color-accent)]" size={24} /> : <Lock className="text-amber-500" size={24} />}
          </div>
          <h2 className="text-lg font-semibold text-center">
            {isSetup ? 'Setup PIN' : 'Enter PIN'}
          </h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            {isSetup ? 'Create a 4-digit PIN to secure your tasks.' : 'Unlock your productivity space.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            autoFocus
            type="password"
            maxLength={4}
            pattern="\d{4}"
            placeholder="••••"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/\D/g, ''));
              setError(false);
            }}
            className={cn(
              "w-full text-center tracking-[1em] text-2xl bg-[#0f1115] border rounded-lg py-3 focus:outline-none transition-colors",
              error ? "border-red-500/50 focus:border-red-500/50 text-red-400" : "border-[var(--color-dark-border)] focus:border-[var(--color-accent)] text-white"
            )}
          />
          {error && <p className="text-red-400 text-xs text-center mt-2">Incorrect PIN</p>}
          <button
            type="submit"
            disabled={pin.length !== 4}
            className="w-full mt-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] disabled:bg-slate-800 disabled:text-slate-500 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {isSetup ? 'Save PIN' : 'Unlock'}
          </button>
        </form>
        
        {!isSetup && (
          <button 
            onClick={() => {
              if (window.confirm("Reset PIN? This will wipe your data.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}
            className="w-full mt-4 text-xs text-slate-500 hover:text-slate-300 text-center"
          >
            Forgot PIN? (Reset App)
          </button>
        )}
      </div>
    </div>
  );
}
