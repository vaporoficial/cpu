
import React, { useState } from 'react';
import { TimerState, SavedTimer, VOICE_STYLES } from '../types';

interface TimerViewProps {
  timers: TimerState[];
  onAdd: (s: number, l: string, c: string, lp: boolean) => void;
  onAction: (id: string, type: 'del' | 'toggle') => void;
  savedTimers: SavedTimer[];
  onSaveTimer: (m: number, s: number, l: string, c: string, lp: boolean) => void;
  onDeleteSaved: (id: string) => void;
}

const TimerView: React.FC<TimerViewProps> = ({ timers, onAdd, onAction, savedTimers, onSaveTimer, onDeleteSaved }) => {
  const [mins, setMins] = useState(1);
  const [secs, setSecs] = useState(0);
  const [label, setLabel] = useState('');
  const [script, setScript] = useState('');
  const [activeStyle, setActiveStyle] = useState('normal');

  const format = (s: number) => {
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  };

  const getFullScript = () => {
    const style = VOICE_STYLES.find(s => s.id === activeStyle);
    return `${style?.prefix || ''}${script || 'O tempo acabou'}`;
  };

  const handleStart = () => {
    const total = mins * 60 + secs;
    if (total <= 0) return;
    onAdd(total, label || `${mins}m ${secs}s`, getFullScript(), false);
  };

  const handleSave = () => {
    const total = mins * 60 + secs;
    if (total <= 0) return;
    onSaveTimer(mins, secs, label || `${mins}:${secs}`, getFullScript(), false);
  };

  return (
    <div className="py-6 space-y-10 pb-40">
      {/* Bloco de Comando Cyberpunk */}
      <section className="cyber-card p-8 rounded-[3rem] space-y-8 border-t-2 border-[#00f2ff]/40 shadow-[0_0_40px_rgba(0,242,255,0.1)]">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-[#00f2ff] uppercase tracking-[0.4em] flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#00f2ff] rounded-full animate-pulse"></span>
            Interface de Tempo
          </h3>
          <div className="flex gap-2">
             <button onClick={handleSave} className="p-3 bg-white/5 border border-white/10 rounded-2xl text-[#00f2ff] hover:bg-[#00f2ff]/20 transition-all active:scale-90">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
            </button>
          </div>
        </div>

        {/* Input Digital de Tempo */}
        <div className="flex justify-center items-center gap-6 py-6 bg-black/30 rounded-[2rem] border border-white/5 inset-shadow">
          <div className="flex flex-col items-center">
            <input 
              type="number" value={mins} onChange={e => setMins(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 text-6xl font-black bg-transparent text-center text-white outline-none neon-text"
            />
            <span className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-widest">MINS</span>
          </div>
          <span className="text-5xl font-black text-[#00f2ff]/30 mb-8">:</span>
          <div className="flex flex-col items-center">
            <input 
              type="number" value={secs} onChange={e => setSecs(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              className="w-24 text-6xl font-black bg-transparent text-center text-white outline-none neon-text"
            />
            <span className="text-[10px] font-black text-slate-500 uppercase mt-2 tracking-widest">SECS</span>
          </div>
        </div>

        {/* Customização de Som/Voz */}
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {VOICE_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setActiveStyle(style.id)}
                className={`shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${activeStyle === style.id ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'bg-white/5 text-slate-500 border-white/10'}`}
              >
                {style.label}
              </button>
            ))}
          </div>
          <input 
            type="text" placeholder="Nome do Ciclo..." value={label} onChange={e => setLabel(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold placeholder-slate-600 focus:border-[#00f2ff]/50 outline-none transition-all"
          />
          <textarea 
            placeholder="Script de Voz (O som personalizado da IA)..." 
            value={script} onChange={e => setScript(e.target.value)}
            className="w-full h-20 bg-[#00f2ff]/5 border border-[#00f2ff]/20 rounded-2xl px-6 py-4 text-sm text-[#00f2ff] placeholder-cyan-900 focus:border-[#00f2ff] outline-none font-bold resize-none"
          />
        </div>

        <button onClick={handleStart} className="w-full bg-gradient-to-r from-[#00f2ff] to-[#0066ff] text-black font-black py-6 rounded-[2rem] text-xl uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(0,242,255,0.4)] hover:shadow-[0_0_50px_rgba(0,242,255,0.6)] active:scale-95 transition-all">
          Ativar
        </button>
      </section>

      {/* Sistemas Operantes (Timers Ativos) */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-4 flex items-center justify-between">
          <span>Motores Ativos</span>
          <span className="text-[#00f2ff] font-orbitron">{timers.length}</span>
        </h3>
        <div className="space-y-4">
          {timers.map(t => (
            <div key={t.id} className={`cyber-card p-6 rounded-[2.5rem] flex items-center justify-between transition-all ${t.isActive ? 'neon-border-active' : 'opacity-40 grayscale'}`}>
              <div className="flex-1">
                <div className="text-[10px] font-black text-[#00f2ff] uppercase mb-1">{t.label}</div>
                <div className="text-4xl font-black font-mono tracking-tighter text-white tabular-nums">
                  {format(t.remainingSeconds)}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => onAction(t.id, 'toggle')} className={`w-14 h-14 flex items-center justify-center rounded-2xl ${t.isActive ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'}`}>
                  {t.isActive ? 
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg> : 
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  }
                </button>
                <button onClick={() => onAction(t.id, 'del')} className="w-14 h-14 flex items-center justify-center bg-red-500/10 text-red-500 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Banco de Memória (Salvos) */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-4">Arquivos Salvos</h3>
        <div className="grid grid-cols-2 gap-4">
          {savedTimers.map(s => (
            <div key={s.id} className="cyber-card p-5 rounded-[2rem] relative group border-b-4 border-b-transparent hover:border-b-[#00f2ff] transition-all cursor-pointer" onClick={() => onAdd((s.minutes * 60) + s.seconds, s.label, s.customAlertText, s.isLooping)}>
              <button onClick={(e) => { e.stopPropagation(); onDeleteSaved(s.id); }} className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 shadow-lg transition-all z-10">
                <span className="text-sm font-black">×</span>
              </button>
              <div className="text-[9px] font-black text-[#00f2ff]/60 uppercase mb-1 truncate">{s.label}</div>
              <div className="text-2xl font-black text-white">{s.minutes.toString().padStart(2, '0')}:{s.seconds.toString().padStart(2, '0')}</div>
              <div className="mt-2 text-[8px] text-slate-500 italic truncate italic">"{s.customAlertText.substring(0, 20)}..."</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TimerView;
