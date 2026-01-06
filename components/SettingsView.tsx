
import React, { useState } from 'react';
import { VOICES } from '../types';
import { generateTTS, decodeBase64, decodeAudioData, pcmToWavBlob } from '../services/geminiService';

interface SettingsViewProps {
  currentVoice: string;
  onVoiceChange: (v: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ currentVoice, onVoiceChange }) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAction = async (isDownload: boolean) => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const base64 = await generateTTS(text, currentVoice);
      const bytes = decodeBase64(base64);
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(bytes, ctx);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);

      if (isDownload) {
        const blob = pcmToWavBlob(bytes);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Voz_${currentVoice}_${Date.now()}.wav`;
        link.click();
      }
    } catch (err) {
      alert("Falha na geração neural.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 space-y-8 pb-32">
      <section className="space-y-4">
        <h3 className="text-xs font-black text-cyan-500 uppercase tracking-widest px-2">Laboratório de Bios</h3>
        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 space-y-5">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="O que a IA deve falar?"
            className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold placeholder-slate-600 focus:border-cyan-500/50 outline-none transition-all"
          />
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => handleAction(false)}
              disabled={loading}
              className="bg-white/5 text-cyan-400 py-4 rounded-xl font-black text-xs uppercase hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Testar Voz
            </button>
            <button 
              onClick={() => handleAction(true)}
              disabled={loading}
              className="bg-cyan-500 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg shadow-cyan-500/20 active:scale-95 transition-all disabled:opacity-50"
            >
              Baixar .WAV
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Configurações de Voz</h3>
        <div className="grid grid-cols-1 gap-3">
          {VOICES.map(v => (
            <button
              key={v.name}
              onClick={() => onVoiceChange(v.name)}
              className={`p-5 rounded-2xl border transition-all flex items-center justify-between ${currentVoice === v.name ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400' : 'border-white/5 bg-white/5 text-slate-400'}`}
            >
              <span className="font-bold">{v.label}</span>
              {currentVoice === v.name && <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_cyan]"></div>}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SettingsView;
