// Hook para efeitos sonoros do jogo
"use client";

import { useCallback, useRef } from "react";

/** Gera sons programaticamente usando Web Audio API (sem arquivos externos) */
export function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  /** Som de explosão (Hit) */
  const playHit = useCallback(() => {
    try {
      const ctx = getContext();
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.type = "sawtooth";
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        50,
        ctx.currentTime + 0.3,
      );

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);

      // Ruído adicional para efeito de explosão
      const noise = ctx.createBufferSource();
      const noiseBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.2,
        ctx.sampleRate,
      );
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < output.length; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.2;
      }
      noise.buffer = noiseBuffer;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);
    } catch {
      // Audio API pode não estar disponível
    }
  }, [getContext]);

  /** Som de splash na água (Miss) — ruído filtrado simulando respingo */
  const playMiss = useCallback(() => {
    try {
      const ctx = getContext();
      const duration = 0.4;

      // 1. Ruído branco filtrado (simula turbulência da água)
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Filtro passa-banda para soar como água (faixa 200-800 Hz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.setValueAtTime(400, ctx.currentTime);
      bandpass.frequency.linearRampToValueAtTime(
        200,
        ctx.currentTime + duration,
      );
      bandpass.Q.value = 1.5;

      // Envelope de volume: ataque rápido, decaimento suave
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.01, ctx.currentTime);
      noiseGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.02);
      noiseGain.gain.exponentialRampToValueAtTime(
        0.01,
        ctx.currentTime + duration,
      );

      noise.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + duration);

      // 2. Tom grave de impacto ("plop" na água)
      const plop = ctx.createOscillator();
      const plopGain = ctx.createGain();
      plop.type = "sine";
      plop.frequency.setValueAtTime(300, ctx.currentTime);
      plop.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.15);
      plopGain.gain.setValueAtTime(0.2, ctx.currentTime);
      plopGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

      plop.connect(plopGain);
      plopGain.connect(ctx.destination);
      plop.start(ctx.currentTime);
      plop.stop(ctx.currentTime + 0.15);

      // 3. Segundo splash levemente atrasado (gotículas)
      const drip = ctx.createBufferSource();
      const dripBuf = ctx.createBuffer(
        1,
        Math.floor(ctx.sampleRate * 0.15),
        ctx.sampleRate,
      );
      const dripData = dripBuf.getChannelData(0);
      for (let i = 0; i < dripData.length; i++) {
        dripData[i] = Math.random() * 2 - 1;
      }
      drip.buffer = dripBuf;

      const dripFilter = ctx.createBiquadFilter();
      dripFilter.type = "highpass";
      dripFilter.frequency.value = 2000;

      const dripGain = ctx.createGain();
      dripGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.08);
      dripGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      drip.connect(dripFilter);
      dripFilter.connect(dripGain);
      dripGain.connect(ctx.destination);
      drip.start(ctx.currentTime + 0.08);
      drip.stop(ctx.currentTime + 0.25);
    } catch {
      // Audio API pode não estar disponível
    }
  }, [getContext]);

  /** Som de navio afundando */
  const playSunk = useCallback(() => {
    try {
      const ctx = getContext();

      // Explosão forte
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(150, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.6);
      gain1.gain.setValueAtTime(0.3, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.6);

      // Segundo tom descendo (efeito de naufrágio)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(400, ctx.currentTime + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.8);
      gain2.gain.setValueAtTime(0.2, ctx.currentTime + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio API pode não estar disponível
    }
  }, [getContext]);

  /** Som de vitória */
  const playVictory = useCallback(() => {
    try {
      const ctx = getContext();
      const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + i * 0.15 + 0.4,
        );
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.4);
      });
    } catch {
      // Audio API pode não estar disponível
    }
  }, [getContext]);

  return { playHit, playMiss, playSunk, playVictory };
}
