
import React, { useState } from 'react';
import { AlarmState } from '../types';

interface AlarmViewProps {
  alarms: AlarmState[];
  onAddAlarm: (time: string, label: string, customAlert?: string) => void;
  onToggleAlarm: (id: string) => void;
  onDeleteAlarm: (id: string) => void;
}

const AlarmView: React.FC<AlarmViewProps> = ({ alarms, onAddAlarm, onToggleAlarm, onDeleteAlarm }) => {
  const [newTime, setNewTime] = useState('08:00');
  const [newLabel, setNewLabel] = useState('');
  const [customAlert, setCustomAlert] = useState('');

  const handleAdd = () => {
    onAddAlarm(newTime, newLabel || 'Alarme', customAlert);
    setNewLabel('');
    setCustomAlert('');
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-6 neon-border">
        <h3 className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] ml-2">Programar Alerta Neural</h3>
        <div className="flex flex-col gap-5">
          <input 
            type="time" 
            value={newTime} 
            onChange={e => setNewTime(e.target.value)}
            className="text-6xl font-black bg-transparent focus:outline-none text-center text-white neon-text tracking-tighter"
          />
          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="Identificador (Ex: Despertar)" 
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-cyan-500 text-sm text-white placeholder-slate-600 font-bold italic"
            />
            <input 
              type="text" 
              placeholder="Script de Voz da IA..." 
              value={customAlert}
              onChange={e => setCustomAlert(e.target.value)}
              className="w-full px-5 py-4 bg-white/5 border border-indigo-500/20 rounded-2xl focus:ring-2 focus:ring-cyan-500 text-sm bg-[#020617] text-cyan-400 placeholder-slate-600 font-black"
            />
          </div>
          <button 
            onClick={handleAdd}
            className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-cyan-900/20 active:scale-95 transition-all"
          >
            Sincronizar Alarme
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Nódulos Agendados</h3>
        {alarms.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-[2.5rem] text-slate-600 text-[10px] font-black uppercase tracking-widest italic">
            Nenhum alarme em espera...
          </div>
        ) : (
          alarms.map(alarm => (
            <div key={alarm.id} className="bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center justify-between shadow-sm group">
              <div className={`max-w-[70%] transition-opacity duration-500 ${alarm.isActive ? 'opacity-100' : 'opacity-30'}`}>
                <div className="text-4xl font-black text-white tracking-tighter neon-text">{alarm.time}</div>
                <div className="text-[9px] text-cyan-500 font-black uppercase tracking-widest truncate mt-1 italic">
                  {alarm.customAlertText || alarm.label}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => onToggleAlarm(alarm.id)}
                  className={`w-14 h-8 rounded-full transition-all relative ${alarm.isActive ? 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-1.5 w-5 h-5 bg-white rounded-full transition-all ${alarm.isActive ? 'right-1.5' : 'left-1.5'}`} />
                </button>
                <button 
                  onClick={() => onDeleteAlarm(alarm.id)}
                  className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlarmView;
