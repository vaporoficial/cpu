
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { TimerState, AlarmState, ViewMode, SavedTimer } from './types';
import FloatingBubble from './components/FloatingBubble';
import TimerView from './components/TimerView';
import AlarmView from './components/AlarmView';
import SettingsView from './components/SettingsView';
import { generateTTS, decodeBase64, decodeAudioData } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>(ViewMode.FULL);
  const [activeTab, setActiveTab] = useState<'timer' | 'alarm' | 'settings'>('timer');
  const [timers, setTimers] = useState<TimerState[]>([]);
  const [alarms, setAlarms] = useState<AlarmState[]>([]);
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>(() => {
    const s = localStorage.getItem('focus_saved_timers_v2');
    return s ? JSON.parse(s) : [];
  });
  const [voiceName, setVoiceName] = useState('Zephyr');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [speakingText, setSpeakingText] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const lastTriggered = useRef<string>("");

  useEffect(() => {
    localStorage.setItem('focus_saved_timers_v2', JSON.stringify(savedTimers));
  }, [savedTimers]);

  const ensureAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  }, []);

  const playVoice = useCallback(async (text: string) => {
    setSpeakingText(text);
    setTimeout(() => setSpeakingText(null), 7000);
    try {
      const ctx = await ensureAudio();
      const base64 = await generateTTS(text, voiceName);
      const bytes = decodeBase64(base64);
      const buffer = await decodeAudioData(bytes, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
    } catch (err) {
      console.error("Voz falhou:", err);
    }
  }, [voiceName, ensureAudio]);

  const unlockApp = async () => {
    await ensureAudio();
    setIsUnlocked(true);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (!t.isActive) return t;
        const rem = t.remainingSeconds - 1;
        if (rem <= 0) {
          playVoice(t.customAlertText || "Ciclo concluído!");
          return t.isLooping ? { ...t, remainingSeconds: t.totalSeconds } : { ...t, remainingSeconds: 0, isActive: false };
        }
        return { ...t, remainingSeconds: rem };
      }));

      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      if (now.getSeconds() === 0 && lastTriggered.current !== timeStr) {
        setAlarms(prev => {
          let hasMatch = false;
          prev.forEach(a => {
            if (a.isActive && a.time === timeStr) {
              hasMatch = true;
              playVoice(a.customAlertText || a.label);
            }
          });
          if (hasMatch) lastTriggered.current = timeStr;
          return prev;
        });
      } else if (now.getSeconds() !== 0) {
        lastTriggered.current = "";
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [playVoice]);

  return (
    <div className="h-full w-full overflow-hidden select-none">
      {!isUnlocked && (
        <div className="fixed inset-0 z-[1000] bg-[#020617] flex flex-col items-center justify-center p-10">
          <div className="w-32 h-32 bg-[#00f2ff]/10 rounded-[3rem] flex items-center justify-center mb-10 border border-[#00f2ff]/30 shadow-[0_0_50px_rgba(0,242,255,0.2)] animate-pulse">
            <svg className="w-16 h-16 text-[#00f2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-5xl font-black mb-4 neon-text text-white tracking-tighter">FOCUS <span className="text-[#00f2ff]">IA</span></h1>
          <p className="text-slate-500 mb-12 text-sm font-bold uppercase tracking-[0.2em] text-center max-w-[200px]">Ativando Sincronia Neural...</p>
          <button onClick={unlockApp} className="w-full max-w-xs bg-gradient-to-r from-[#00f2ff] to-[#0066ff] text-black py-6 rounded-2xl font-black text-xl tracking-widest uppercase shadow-2xl">
            Sincronizar
          </button>
        </div>
      )}

      {speakingText && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[500] w-[85%] max-w-sm cyber-card p-5 rounded-[2rem] flex items-center gap-5 shadow-[0_0_40px_rgba(0,242,255,0.3)] border border-[#00f2ff]/30 animate-in slide-in-from-top-10">
          <div className="w-12 h-12 bg-[#00f2ff] rounded-full flex items-center justify-center animate-bounce shadow-[0_0_20px_#00f2ff]">
            <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
          </div>
          <div className="flex-1 truncate">
            <div className="text-[10px] font-black text-[#00f2ff] uppercase tracking-widest">Transmitindo</div>
            <div className="font-bold text-sm text-white italic truncate">"{speakingText}"</div>
          </div>
        </div>
      )}

      <FloatingBubble 
        onClick={() => setView(v => v === ViewMode.FULL ? ViewMode.BUBBLE : ViewMode.FULL)} 
        isActive={timers.some(t => t.isActive)}
        remainingSeconds={timers.find(t => t.isActive)?.remainingSeconds}
        totalSeconds={timers.find(t => t.isActive)?.totalSeconds}
      />

      {view === ViewMode.FULL && (
        <div className="h-full flex flex-col max-w-md mx-auto relative bg-transparent app-container">
          <header className="px-8 pt-16 pb-8 flex justify-between items-end">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-white neon-text uppercase">Console</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]"></div>
                <span className="text-[10px] font-bold text-[#00f2ff]/60 uppercase tracking-[0.2em]">Neural Link: Ativo</span>
              </div>
            </div>
            <button onClick={() => setView(ViewMode.BUBBLE)} className="w-12 h-12 cyber-card flex items-center justify-center rounded-2xl text-[#00f2ff]">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
            </button>
          </header>

          <main className="flex-1 overflow-y-auto px-6">
            {activeTab === 'timer' && (
              <TimerView 
                timers={timers} 
                savedTimers={savedTimers}
                onAdd={(s, l, c, lp) => setTimers(prev => [{ id: Math.random().toString(36).substr(2, 9), totalSeconds: s, remainingSeconds: s, isActive: true, label: l, customAlertText: c, isLooping: lp }, ...prev])} 
                onAction={(id, type) => {
                  if (type === 'del') setTimers(prev => prev.filter(t => t.id !== id));
                  if (type === 'toggle') setTimers(prev => prev.map(t => t.id === id ? { ...t, isActive: !t.isActive } : t));
                }}
                onSaveTimer={(m, s, l, c, lp) => setSavedTimers(prev => [{ id: Math.random().toString(36).substr(2, 9), minutes: m, seconds: s, label: l, customAlertText: c, isLooping: lp }, ...prev])}
                onDeleteSaved={id => setSavedTimers(prev => prev.filter(s => s.id !== id))}
              />
            )}
            {activeTab === 'alarm' && (
              <AlarmView 
                alarms={alarms} 
                onAddAlarm={(t, l, c) => setAlarms(prev => [{ id: Math.random().toString(36).substr(2, 9), time: t, label: l, customAlertText: c, isActive: true }, ...prev])} 
                onToggleAlarm={(id) => setAlarms(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a))}
                onDeleteAlarm={(id) => setAlarms(prev => prev.filter(a => a.id !== id))}
              />
            )}
            {activeTab === 'settings' && (
              <SettingsView 
                currentVoice={voiceName} 
                onVoiceChange={setVoiceName} 
              />
            )}
          </main>

          <nav className="h-32 bg-[#020617]/90 backdrop-blur-2xl border-t border-white/5 flex items-center justify-around px-8 pb-10">
            {[
              { id: 'timer', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'alarm', icon: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
              { id: 'settings', icon: 'M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`p-5 rounded-[1.5rem] transition-all duration-300 ${activeTab === tab.id ? 'bg-[#00f2ff] text-black shadow-[0_0_30px_#00f2ff] -translate-y-3' : 'text-slate-600 hover:text-[#00f2ff]'}`}
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={tab.icon} /></svg>
              </button>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
};

export default App;
