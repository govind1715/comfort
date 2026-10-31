
  /* ==========================================================================
     WEB AUDIO SYNTH ENGINE (Procedural Calming Sound Design)
     ========================================================================== */

  let audioCtx = null;
  let masterVolume = null;
  let delayNode = null;

  // Synthesizer Node References
  let lullabyInterval = null;
  let melodyTimeout = null;
  let rainNoiseNode = null;
  let rainFilterNode = null;
  let rainVolume = null;

  // Scale for procedurally generated chimes/piano
  const safeNotes = [
    130.81, 146.83, 164.81, 196.00,
    220.00, 261.63, 293.66, 329.63,
    392.00, 440.00, 523.25, 587.33,
    659.25, 783.99, 880.00, 1046.50
  ];

  // Cozy chord progressions
  const chordProgressions = [
    [130.81, 196.00, 329.63, 392.00, 523.25],
    [110.00, 164.81, 261.63, 329.63, 440.00],
    [174.61, 261.63, 329.63, 392.00, 659.25],
    [196.00, 293.66, 392.00, 493.88, 587.33]
  ];

  // Initialize Audio Engine
  async function initAudio() {
    try {
      if (!audioCtx) {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;

        if (!AudioContextClass) {
          throw new Error("Web Audio API is not supported.");
        }

        audioCtx = new AudioContextClass();

        masterVolume = audioCtx.createGain();
        masterVolume.gain.setValueAtTime(0.4, audioCtx.currentTime);
        masterVolume.connect(audioCtx.destination);

        delayNode = audioCtx.createDelay(3.0);

        const delayFeedback = audioCtx.createGain();
        const delayFilter = audioCtx.createBiquadFilter();

        delayNode.delayTime.setValueAtTime(0.85, audioCtx.currentTime);
        delayFeedback.gain.setValueAtTime(0.38, audioCtx.currentTime);

        delayFilter.type = "lowpass";
        delayFilter.frequency.setValueAtTime(320, audioCtx.currentTime);

        delayNode.connect(delayFilter);
        delayFilter.connect(delayFeedback);
        delayFeedback.connect(delayNode);
        delayNode.connect(masterVolume);

        state.audioInitialized = true;

        console.log("Ambient Audio Engine initialized.");
      }

      if (audioCtx.state === "suspended") {
        await audioCtx.resume();
      }

      return audioCtx.state === "running";

    } catch (error) {
      console.error("Audio initialization failed:", error);
      return false;
    }
  }

  // --- 1. Soft Warm Chime Synthesizer ---
  function playChime(freqMultiplier = 1.0) {
    if (!state.audioInitialized || !audioCtx) return;
    if (!state.audioPlaying) return;

    if (audioCtx.state !== "running") return;

    const now = audioCtx.currentTime;

    const baseFreq = safeNotes[Math.floor(Math.random() * 5) + 6];
    const freq = baseFreq * freqMultiplier;

    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = "sine";
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = "sine";
    osc2.frequency.setValueAtTime(freq * 1.003, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(750, now);
    filter.Q.setValueAtTime(0.8, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.12);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);

    gainNode.connect(masterVolume);
    gainNode.connect(delayNode);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 4);
    osc2.stop(now + 4);
  }

  // --- 2. Felt Piano Chord Generator ---
  function playPianoChord() {
    if (!state.audioPlaying || !state.audioInitialized) return;
    if (audioCtx.state !== "running") return;

    const now = audioCtx.currentTime;

    const chord = chordProgressions[
      Math.floor(Math.random() * chordProgressions.length)
    ];

    chord.forEach((freq, idx) => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(freq * 1.002, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(1.0, now);

      const arpeggioDelay = idx * 0.18 * (Math.random() * 0.2 + 0.9);
      const noteTime = now + arpeggioDelay;

      gainNode.gain.setValueAtTime(0.001, noteTime);
      gainNode.gain.linearRampToValueAtTime(0.045, noteTime + 1.5);
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 8.5);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);

      gainNode.connect(masterVolume);
      gainNode.connect(delayNode);

      osc1.start(noteTime);
      osc2.start(noteTime);

      osc1.stop(noteTime + 9.5);
      osc2.stop(noteTime + 9.5);
    });
  }

  // --- 2b. Single Melody Note ---
  function playSingleMelodyNote() {
    if (!state.audioPlaying || !state.audioInitialized) return;
    if (audioCtx.state !== "running") return;

    const now = audioCtx.currentTime;
    const baseFreq = safeNotes[Math.floor(Math.random() * 5) + 5];

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(baseFreq, now);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(300, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.025, now + 1.8);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 6.0);

    osc.connect(filter);
    filter.connect(gainNode);

    gainNode.connect(masterVolume);
    gainNode.connect(delayNode);

    osc.start(now);
    osc.stop(now + 6.5);
  }

  // --- 3. Procedural Rain Synthesizer ---
  function startRainSynth() {
    if (!state.audioInitialized || !audioCtx || rainNoiseNode) return;

    if (audioCtx.state !== "running") return;

    const now = audioCtx.currentTime;

    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(
      1, bufferSize, audioCtx.sampleRate
    );

    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    rainNoiseNode = audioCtx.createBufferSource();
    rainNoiseNode.buffer = noiseBuffer;
    rainNoiseNode.loop = true;

    rainFilterNode = audioCtx.createBiquadFilter();
    rainFilterNode.type = "lowpass";
    rainFilterNode.frequency.setValueAtTime(450, now);
    rainFilterNode.Q.setValueAtTime(1.5, now);

    rainVolume = audioCtx.createGain();
    rainVolume.gain.setValueAtTime(0.001, now);

    rainNoiseNode.connect(rainFilterNode);
    rainFilterNode.connect(rainVolume);
    rainVolume.connect(masterVolume);

    rainNoiseNode.start(now);

    rainVolume.gain.linearRampToValueAtTime(0.12, now + 3.0);

    modulateRainFilter();
  }

  function stopRainSynth() {
    if (!rainNoiseNode || !rainVolume || !audioCtx) return;

    const nodeToStop = rainNoiseNode;
    const volumeToStop = rainVolume;

    const now = audioCtx.currentTime;

    volumeToStop.gain.cancelScheduledValues(now);
    volumeToStop.gain.setTargetAtTime(0.001, now, 0.35);

    rainNoiseNode = null;
    rainVolume = null;
    rainFilterNode = null;

    setTimeout(() => {
      try {
        nodeToStop.stop();
        nodeToStop.disconnect();
        volumeToStop.disconnect();
      } catch (error) {
        console.warn("Rain audio cleanup:", error);
      }
    }, 1600);
  }

  function modulateRainFilter() {
    if (!state.cozyModeActive || !rainFilterNode || !audioCtx) return;

    const now = audioCtx.currentTime;

    const nextFreq = 300 + Math.random() * 250;
    const duration = 2.0 + Math.random() * 3.0;

    rainFilterNode.frequency.exponentialRampToValueAtTime(
      nextFreq, now + duration
    );

    setTimeout(modulateRainFilter, duration * 1000);
  }

  // --- Background Lullaby ---
  function startBackgroundLullaby() {
    stopBackgroundLullaby();

    playPianoChord();

    lullabyInterval = setInterval(() => {
      playPianoChord();
    }, 9500);

    triggerMelodyNote();
  }

  function triggerMelodyNote() {
    if (!state.audioPlaying || !state.audioInitialized) return;

    playSingleMelodyNote();

    const nextDelay = 4000 + Math.random() * 3000;

    melodyTimeout = setTimeout(triggerMelodyNote, nextDelay);
  }

  function stopBackgroundLullaby() {
    if (lullabyInterval) {
      clearInterval(lullabyInterval);
      lullabyInterval = null;
    }

    if (melodyTimeout) {
      clearTimeout(melodyTimeout);
      melodyTimeout = null;
    }
  }

  // --- Play/Pause Button ---
  const audioBtn = document.getElementById("audio-toggle-btn");

  async function handleAudioToggle() {
    if (!audioBtn) return;

    if (state.audioPlaying) {
      state.audioPlaying = false;

      audioBtn.classList.remove("playing");
      audioBtn.querySelector("span").innerText = "Play Soothing Music";
      audioBtn.querySelector("i").setAttribute("data-lucide", "music");

      if (typeof lucide !== "undefined") lucide.createIcons();

      stopBackgroundLullaby();

      if (state.cozyModeActive) {
        stopRainSynth();
      }

      return;
    }

    const ready = await initAudio();

    if (!ready) {
      console.error("Unable to start ambient music.");
      return;
    }

    state.audioPlaying = true;

    audioBtn.classList.add("playing");
    audioBtn.querySelector("span").innerText = "Pause Soothing Music";
    audioBtn.querySelector("i").setAttribute("data-lucide", "volume-2");

    if (typeof lucide !== "undefined") lucide.createIcons();

    playChime(1.2);
    startBackgroundLullaby();

    if (state.cozyModeActive) {
      startRainSynth();
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener("click", handleAudioToggle);
  }

  // Resume suspended audio after subsequent user interactions
  const autoResumeAudio = () => {
    if (
      state.audioPlaying &&
      audioCtx &&
      audioCtx.state === "suspended"
    ) {
      audioCtx.resume().catch(error => {
        console.error("Audio resume failed:", error);
      });
    }
  };

  window.addEventListener("click", autoResumeAudio, { passive: true });
  window.addEventListener("touchstart", autoResumeAudio, { passive: true });
