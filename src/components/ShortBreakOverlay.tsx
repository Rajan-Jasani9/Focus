import { useEffect, useState } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { Coffee, Play } from 'lucide-react';

export function ShortBreakOverlay() {
  const { breakEndTime, endBreak, dailyBreakCount } = useTaskStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!breakEndTime) return;

    const updateTimer = () => {
      const remaining = Math.max(0, breakEndTime - Date.now());
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        endBreak(); // Auto end when timer reaches 0
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [breakEndTime, endBreak]);

  if (!breakEndTime || timeLeft <= 0) return null;

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const getSarcasticMessage = (count: number) => {
    if (count <= 1) return "Step away from the screen. Let your subconscious process the work.";
    if (count === 2) return "Another break? Alright, pacing is important. Don't push it.";
    if (count === 3) return "Three breaks today. Are we doing Pomodoro or just 'avoiding work'?";
    if (count === 4) return "Four breaks. I'm starting to think 'Current Focus' was an ironic title.";
    if (count === 5) return "Taking a break from what, exactly? Staring at the TaskForm?";
    if (count === 6) return "Statistically speaking, you're now spending more time resting than working.";
    return "If you take another break, I'm going to start deleting your tasks.";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0f1115]/95 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="flex flex-col items-center max-w-md w-full px-6">
        <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700"></div>
          <svg className="absolute inset-0 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="48"
              fill="transparent"
              stroke="var(--color-accent)"
              strokeWidth="4"
              strokeDasharray="301.59"
              strokeDashoffset={301.59 * (1 - timeLeft / (5 * 60000))} // Defaulting scale to 5 min for visual effect, rough approx
              className="transition-all duration-1000 linear"
            />
          </svg>
          <Coffee size={32} className="text-slate-300 relative z-10" />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Mental Reset</h2>
        <p className="text-slate-400 text-center mb-8">
          {getSarcasticMessage(dailyBreakCount)}
        </p>

        <div className="text-6xl font-mono font-bold text-white mb-12 tracking-tighter">
          {timeString}
        </div>

        <button
          onClick={endBreak}
          className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
        >
          <Play size={18} /> Resume Work Early
        </button>
      </div>
    </div>
  );
}
