/**
 * Comfort World - Interactive Safe Space for Her
 * Fully vanilla JavaScript with Web Audio API procedural synthesis,
 * canvas interactive particle systems, and swipe-friendly carousel.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  /* ==========================================================================
     STATE MANAGEMENT & VARIABLES
     ========================================================================== */
  const state = {
    audioInitialized: false,
    audioPlaying: false,
    cozyModeActive: false,
    currentCozyMsgIndex: 0,
    carouselIndex: 0,
    lastInteractionTime: Date.now(),
    cursorPos: { x: 0, y: 0 }
  };

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
  
  // Scale for procedurally generated chimes/piano (C Major / Pentatonic)
  const safeNotes = [
    130.81, // C3
    146.83, // D3
    164.81, // E3
    196.00, // G3
    220.00, // A3
    261.63, // C4 (Middle C)
    293.66, // D4
    329.63, // E4
    392.00, // G4
    440.00, // A4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    1046.50 // C6
  ];

  // Cozy chord progressions (Root frequencies)
  const chordProgressions = [
    [130.81, 196.00, 329.63, 392.00, 523.25], // C Major 7/9
    [110.00, 164.81, 261.63, 329.63, 440.00], // A Minor 7/9
    [174.61, 261.63, 329.63, 392.00, 659.25], // F Major 7/9
    [196.00, 293.66, 392.00, 493.88, 587.33]  // G Major 7 (Warm)
  ];

  function initAudio() {
    if (state.audioInitialized) return;
    
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();
      
      // Master Volume setup
      masterVolume = audioCtx.createGain();
      masterVolume.gain.setValueAtTime(0.4, audioCtx.currentTime); // Lower volume for cozy headroom
      masterVolume.connect(audioCtx.destination);

      // Create a gorgeous feedback delay line for a spacious, soothing ambient space
      delayNode = audioCtx.createDelay(3.0);
      const delayFeedback = audioCtx.createGain();
      const delayFilter = audioCtx.createBiquadFilter();

      delayNode.delayTime.setValueAtTime(0.85, audioCtx.currentTime); // Gentle lag
      delayFeedback.gain.setValueAtTime(0.38, audioCtx.currentTime); // Calm feedback loop
      delayFilter.type = 'lowpass';
      delayFilter.frequency.setValueAtTime(320, audioCtx.currentTime); // Felt-filtered echoes

      // Connect feedback loop: delayNode -> delayFilter -> delayFeedback -> delayNode
      delayNode.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(delayNode);

      // Connect delay output directly to master volume
      delayNode.connect(masterVolume);
      
      state.audioInitialized = true;
      console.log('Ambient Web Audio Engine with felt delay initialized.');
    } catch (e) {
      console.error('Failed to initialize Web Audio API:', e);
    }
  }

  // --- 1. Soft Warm Chime Synthesizer ---
  function playChime(freqMultiplier = 1.0) {
    if (!state.audioInitialized) initAudio();
    if (!state.audioPlaying) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    
    // Choose a random note from middle-upper scale for warmer, sweeter chimes
    const baseFreq = safeNotes[Math.floor(Math.random() * 5) + 6]; // D4 to E5
    const freq = baseFreq * freqMultiplier;

    // Create dual oscillators for an ultra-soft music box/bell tone
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);
    
    osc2.type = 'sine'; // Sine waves are much softer than triangles
    osc2.frequency.setValueAtTime(freq * 1.003, now); // Sweet detune

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(750, now); // Low pass filters out metallic high edge
    filter.Q.setValueAtTime(0.8, now);

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.12, now + 0.12); // Padded attack cushion
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.5); // Sweet lingering decay

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gainNode);
    
    gainNode.connect(masterVolume);
    if (delayNode) {
      gainNode.connect(delayNode);
    }

    osc1.start(now);
    osc2.start(now);
    
    osc1.stop(now + 4);
    osc2.stop(now + 4);
  }

  // --- 2. Upgraded Soothing Felt Piano Chord Generator ---
  function playPianoChord() {
    if (!state.audioPlaying || !state.audioInitialized) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    
    // Pick a random calming chord progression
    const chord = chordProgressions[Math.floor(Math.random() * chordProgressions.length)];
    
    chord.forEach((freq, idx) => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      // Warm felt piano: Sine body + very soft detuned triangle highlight
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);
      
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(freq * 1.002, now); // Detune
      
      // Cozy, extremely muffled felt lowpass
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(1.0, now);
      
      // Humanize timing slightly (delays between pressing notes of chord)
      const arpeggioDelay = idx * 0.18 * (Math.random() * 0.2 + 0.9);
      const noteTime = now + arpeggioDelay;
      
      gainNode.gain.setValueAtTime(0.001, noteTime);
      // Beautiful slow ambient swell (attack of 1.5 seconds)
      gainNode.gain.linearRampToValueAtTime(0.045, noteTime + 1.5);
      // Long sweeping decay over 8.5 seconds
      gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + 8.5);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      
      gainNode.connect(masterVolume);
      if (delayNode) {
        gainNode.connect(delayNode);
      }
      
      osc1.start(noteTime);
      osc2.start(noteTime);
      osc1.stop(noteTime + 9.5);
      osc2.stop(noteTime + 9.5);
    });
  }

  // --- 2b. Soothing Drifting Single Melody Note ---
  function playSingleMelodyNote() {
    if (!state.audioPlaying || !state.audioInitialized) return;
    const now = audioCtx.currentTime;

    // Pick a gentle pentatonic note from middle scale
    const baseFreq = safeNotes[Math.floor(Math.random() * 5) + 5]; // C4 to G5
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now); // Warm felt singing note

    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.025, now + 1.8); // Ultra slow swell
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 6.0); // Slow release

    osc.connect(filter);
    filter.connect(gainNode);
    
    gainNode.connect(masterVolume);
    if (delayNode) {
      gainNode.connect(delayNode);
    }

    osc.start(now);
    osc.stop(now + 6.5);
  }

  // --- 3. Calming Procedural Rain Synthesizer ---
  function startRainSynth() {
    if (!state.audioInitialized) initAudio();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;
    
    // 1. Generate White Noise Buffer
    const bufferSize = audioCtx.sampleRate * 2; // 2 seconds of buffer
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    
    rainNoiseNode = audioCtx.createBufferSource();
    rainNoiseNode.buffer = noiseBuffer;
    rainNoiseNode.loop = true;
    
    // 2. Filter the noise to sound like warm cozy rain (deep low pass + bandpass)
    rainFilterNode = audioCtx.createBiquadFilter();
    rainFilterNode.type = 'lowpass';
    rainFilterNode.frequency.setValueAtTime(450, now);
    rainFilterNode.Q.setValueAtTime(1.5, now);
    
    rainVolume = audioCtx.createGain();
    rainVolume.gain.setValueAtTime(0.001, now);
    
    // Connect nodes
    rainNoiseNode.connect(rainFilterNode);
    rainFilterNode.connect(rainVolume);
    rainVolume.connect(masterVolume);
    
    // Smoothly fade rain sound in
    rainNoiseNode.start(now);
    rainVolume.gain.linearRampToValueAtTime(0.12, now + 3.0);
    
    // 3. Gentle wind/rain modulation to make it alive
    modulateRainFilter();
  }

  function stopRainSynth() {
    if (!rainNoiseNode || !rainVolume) return;
    
    const now = audioCtx.currentTime;
    // Fade out rain smoothly
    rainVolume.gain.linearRampToValueAtTime(0.001, now + 1.5);
    setTimeout(() => {
      try {
        if (rainNoiseNode) rainNoiseNode.stop();
        rainNoiseNode = null;
        rainVolume = null;
      } catch (e) {}
    }, 1600);
  }

  function modulateRainFilter() {
    if (!state.cozyModeActive || !rainFilterNode) return;
    
    const now = audioCtx.currentTime;
    // Modulate lowpass filter cutoff to simulate gentle gusts of wind/rain intensity
    const nextFreq = 300 + Math.random() * 250;
    const duration = 2.0 + Math.random() * 3.0;
    
    rainFilterNode.frequency.exponentialRampToValueAtTime(nextFreq, now + duration);
    
    setTimeout(modulateRainFilter, duration * 1000);
  }

  // --- Loop manager for soothing background lullaby ---
  function startBackgroundLullaby() {
    if (lullabyInterval) clearInterval(lullabyInterval);
    if (melodyTimeout) clearTimeout(melodyTimeout);
    
    // Initial chord
    playPianoChord();
    
    // Trigger a felt piano chord every 9.5 seconds (slower tempo!)
    lullabyInterval = setInterval(() => {
      playPianoChord();
    }, 9500);

    // Drifting single melody note loop in between chords
    triggerMelodyNote();
  }

  function triggerMelodyNote() {
    if (!state.audioPlaying || !state.audioInitialized) return;

    // Trigger a single warm drifting note
    playSingleMelodyNote();

    // Schedule next single note at random interval (4.0s - 7.0s)
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

  // Handle Play/Pause UI Button
  const audioBtn = document.getElementById('audio-toggle-btn');
  audioBtn.addEventListener('click', () => {
    initAudio();
    
    if (state.audioPlaying) {
      // Pause
      state.audioPlaying = false;
      audioBtn.classList.remove('playing');
      audioBtn.querySelector('span').innerText = 'Play Soothing Music';
      audioBtn.querySelector('i').setAttribute('data-lucide', 'music');
      if (typeof lucide !== 'undefined') lucide.createIcons();
      stopBackgroundLullaby();
      if (state.cozyModeActive) stopRainSynth();
    } else {
      // Play
      state.audioPlaying = true;
      audioBtn.classList.add('playing');
      audioBtn.querySelector('span').innerText = 'Music Soothing 💗';
      audioBtn.querySelector('i').setAttribute('data-lucide', 'volume-2');
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      startBackgroundLullaby();
      playChime(1.2);
      if (state.cozyModeActive) startRainSynth();
    }
  });

  /* ==========================================================================
     CANVAS PARTICLE ENGINE (Hearts, Sparkles, Fireflies)
     ========================================================================== */
  const canvas = document.getElementById('particle-canvas');
  const ctx = canvas.getContext('2d');
  const particles = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor(x, y, type = 'heart', speedMultiplier = 1.0) {
      this.x = x;
      this.y = y;
      this.type = type;
      this.size = Math.random() * 8 + 6;
      this.speedY = -(Math.random() * 1.5 + 0.5) * speedMultiplier;
      this.speedX = (Math.random() * 2 - 1) * speedMultiplier;
      this.life = 1.0;
      this.decay = Math.random() * 0.01 + 0.008;
      this.color = this.getRandomColor();
      this.angle = Math.random() * 360;
      this.spin = Math.random() * 2 - 1;
    }

    getRandomColor() {
      const colors = [
        'rgba(255, 143, 163, ', // Pink
        'rgba(255, 179, 193, ', // Soft pink
        'rgba(255, 204, 213, ', // Lighter pink
        'rgba(253, 216, 93, ',  // Cozy gold
        'rgba(197, 196, 232, ', // Tulip lavender
        'rgba(254, 243, 199, '  // Cozy cream
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.life -= this.decay;
      this.angle += this.spin;
      
      // Floating wave movement
      this.speedX += Math.sin(this.y / 30) * 0.05;
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.angle * Math.PI) / 180);
      
      if (this.type === 'heart') {
        ctx.fillStyle = this.color + this.life + ')';
        ctx.beginPath();
        // Drawing a beautiful smooth heart path
        const d = this.size;
        ctx.moveTo(0, -d/4);
        ctx.bezierCurveTo(-d/2, -d, -d, -d/2, 0, d/2);
        ctx.bezierCurveTo(d, -d/2, d/2, -d, 0, -d/4);
        ctx.fill();
      } else {
        // Star sparkle
        ctx.fillStyle = this.color + this.life + ')';
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#fef08a';
        ctx.beginPath();
        const s = this.size * 0.7;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  function spawnExplosion(x, y, count = 25, type = 'heart') {
    for (let i = 0; i < count; i++) {
      particles.push(new Particle(x, y, type, 3.5));
    }
  }

  // Animating the particles canvas
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Spawn faint occasional ambient stars in background when scrolling
    if (Math.random() > 0.96 && particles.length < 150) {
      particles.push(new Particle(Math.random() * canvas.width, canvas.height + 20, 'sparkle', 0.8));
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.update();
      p.draw();
      
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }
    requestAnimationFrame(animateParticles);
  }
  animateParticles();

  // --- Interactive Heart Trail ---
  function handlePointerMove(e) {
    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (x === undefined || y === undefined) return;
    
    state.lastInteractionTime = Date.now();
    
    // Throttle cursor heart trail spawn
    if (Math.random() > 0.75) {
      const type = Math.random() > 0.7 ? 'sparkle' : 'heart';
      particles.push(new Particle(x, y, type, 1.0));
    }
  }
  window.addEventListener('mousemove', handlePointerMove);
  window.addEventListener('touchmove', handlePointerMove);

  /* ==========================================================================
     VIRTUAL HUG INTERACTIVE SYSTEM
     ========================================================================== */
  const hugPopup = document.getElementById('hug-popup-overlay');
  const closeHugBtn = document.getElementById('close-hug-popup-btn');
  const heroHugBtn = document.getElementById('hero-hug-btn');
  const finalHugBtn = document.getElementById('final-hug-btn');

  function triggerVirtualHug() {
    // Play warm chord & chime explosion
    playChime(1.0);
    setTimeout(() => playChime(1.2), 150);
    setTimeout(() => playChime(1.5), 300);
    
    if (state.audioPlaying) {
      playPianoChord();
    }

    // Mobil Vibration (if supported)
    if (navigator.vibrate) {
      navigator.vibrate([150, 100, 150]);
    }

    // Show Overlay
    hugPopup.classList.remove('hidden');
    
    // Spawn massive explosion of hearts!
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    spawnExplosion(centerX, centerY, 40, 'heart');
    
    // Continuous slow floating hearts while popup is active
    const hugHeartsInterval = setInterval(() => {
      if (hugPopup.classList.contains('hidden')) {
        clearInterval(hugHeartsInterval);
        return;
      }
      particles.push(new Particle(
        centerX + (Math.random() * 200 - 100), 
        centerY + 100, 
        'heart', 
        1.5
      ));
    }, 120);
  }

  heroHugBtn.addEventListener('click', triggerVirtualHug);
  finalHugBtn.addEventListener('click', triggerVirtualHug);
  
  closeHugBtn.addEventListener('click', () => {
    hugPopup.classList.add('hidden');
    playChime(1.3);
  });

  // Clicking outside hug-card closes it
  hugPopup.addEventListener('click', (e) => {
    if (e.target === hugPopup) {
      hugPopup.classList.add('hidden');
    }
  });

  /* ==========================================================================
     INTERACTIVE TULIP FIELD (BLOOMING FLOWERS)
     ========================================================================== */
  const tulips = document.querySelectorAll('.tulip-card');
  const letterModal = document.getElementById('garden-letter-modal');
  const letterText = document.getElementById('letter-text');
  const closeLetterBtn = letterModal.querySelector('.close-letter-btn');

  tulips.forEach((tulip) => {
    tulip.addEventListener('click', () => {
      const isAlreadyBloomed = tulip.classList.contains('bloomed');
      
      // Bloom tulip
      tulip.classList.add('bloomed');
      
      // Play high chime chord
      playChime(1.2);
      setTimeout(() => playChime(1.4), 100);
      
      // Get message & open love letter
      const msg = tulip.getAttribute('data-message');
      
      setTimeout(() => {
        letterText.innerText = msg;
        letterModal.classList.remove('hidden');
        
        // Spawn hearts on the clicked flower
        const rect = tulip.getBoundingClientRect();
        const flowerX = rect.left + rect.width / 2;
        const flowerY = rect.top + rect.height / 3;
        spawnExplosion(flowerX, flowerY, 15, 'heart');
      }, 500);
    });
  });

  function closeLetter() {
    letterModal.classList.add('hidden');
    playChime(0.9);
  }

  closeLetterBtn.addEventListener('click', closeLetter);
  letterModal.addEventListener('click', (e) => {
    if (e.target === letterModal) closeLetter();
  });

  /* ==========================================================================
     COZY NIGHT SKY STARS INTERACTION
     ========================================================================== */
  const stars = document.querySelectorAll('.interactive-star');
  const starMessageBox = document.getElementById('sky-star-message');
  const starMessageText = document.getElementById('star-message-text');

  stars.forEach((star) => {
    star.addEventListener('click', () => {
      // Remove clicked from all other stars
      stars.forEach(s => s.classList.remove('clicked'));
      
      star.classList.add('clicked');
      playChime(1.6); // Extra high magical chime
      
      const msg = star.getAttribute('data-message');
      
      // Show note box
      starMessageText.innerText = msg;
      starMessageBox.classList.remove('hidden');
      
      // Spawn star sparkles
      const rect = star.getBoundingClientRect();
      spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 12, 'sparkle');
    });
  });

  // Clicking outside star field clears the star message
  document.getElementById('starry-sky').addEventListener('click', (e) => {
    if (e.target === document.getElementById('starry-sky')) {
      starMessageBox.classList.add('hidden');
      stars.forEach(s => s.classList.remove('clicked'));
    }
  });

  /* ==========================================================================
     "REASONS I LOVE YOU" SWIPE CAROUSEL (Mobile First Polaroid Deck)
     ========================================================================== */
  const carousel = document.getElementById('polaroid-carousel');
  const cards = carousel.querySelectorAll('.polaroid-card');
  const indicators = document.querySelectorAll('.carousel-indicators .indicator');
  
  let startX = 0;
  let currentX = 0;
  let isDragging = false;

  function updateCarouselLayout() {
    cards.forEach((card, idx) => {
      card.className = 'polaroid-card'; // reset classes
      
      const diff = idx - state.carouselIndex;
      
      if (diff === 0) {
        card.classList.add('active');
      } else if (diff === -1 || (state.carouselIndex === 0 && idx === cards.length - 1)) {
        card.classList.add('prev');
      } else if (diff === 1 || (state.carouselIndex === cards.length - 1 && idx === 0)) {
        card.classList.add('next');
      } else if (diff < -1) {
        card.classList.add('hidden-left');
      } else {
        card.classList.add('hidden-right');
      }
    });

    // Update active dot indicator
    indicators.forEach((ind, idx) => {
      ind.classList.toggle('active', idx === state.carouselIndex);
    });
  }

  function setCarouselIndex(newIndex) {
    if (newIndex < 0) {
      state.carouselIndex = cards.length - 1;
    } else if (newIndex >= cards.length) {
      state.carouselIndex = 0;
    } else {
      state.carouselIndex = newIndex;
    }
    updateCarouselLayout();
    playChime(1.1);
  }

  // Gesture/Drag Listeners
  function handleDragStart(e) {
    isDragging = true;
    startX = e.clientX || e.touches[0].clientX;
    carousel.style.transition = 'none';
  }

  function handleDragMove(e) {
    if (!isDragging) return;
    currentX = e.clientX || (e.touches && e.touches[0].clientX);
    const deltaX = currentX - startX;
    
    // Give tactile feedback/rotation during drag
    const activeCard = cards[state.carouselIndex];
    if (activeCard) {
      activeCard.style.transform = `translate3d(${deltaX}px, 0, 0) rotate(${deltaX * 0.05}deg)`;
    }
  }

  function handleDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    
    const deltaX = currentX - startX;
    const threshold = 70; // Swipe threshold in pixels
    
    const activeCard = cards[state.carouselIndex];
    if (activeCard) {
      activeCard.style.transform = ''; // Clear inline styled transform
    }

    if (deltaX > threshold) {
      // Swiped right (show previous)
      setCarouselIndex(state.carouselIndex - 1);
    } else if (deltaX < -threshold) {
      // Swiped left (show next)
      setCarouselIndex(state.carouselIndex + 1);
    } else {
      // Elastic snapback
      updateCarouselLayout();
    }
    startX = 0;
    currentX = 0;
  }

  // Event bindings for Dragging/Swiping
  carousel.addEventListener('mousedown', handleDragStart);
  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);

  carousel.addEventListener('touchstart', handleDragStart);
  window.addEventListener('touchmove', handleDragMove);
  window.addEventListener('touchend', handleDragEnd);

  // Indicators Click Event
  indicators.forEach((ind) => {
    ind.addEventListener('click', () => {
      const idx = parseInt(ind.getAttribute('data-index'));
      setCarouselIndex(idx);
    });
  });

  // Init Carousel Card Layouts
  updateCarouselLayout();

  /* ==========================================================================
     EMERGENCY COZY MODE (THE SADNESS SAVIOR)
     ========================================================================== */
  const cozyTrigger = document.getElementById('cozy-trigger-btn');
  const cozyOverlay = document.getElementById('cozy-overlay');
  const closeCozyBtn = cozyOverlay.querySelector('.close-cozy-btn');
  const cozyMsgs = cozyOverlay.querySelectorAll('.cozy-msg');
  const prevMsgBtn = cozyOverlay.querySelector('.prev-msg');
  const nextMsgBtn = cozyOverlay.querySelector('.next-msg');
  const msgCounter = cozyOverlay.querySelector('.cozy-msg-counter');

  function openCozyMode() {
    state.cozyModeActive = true;
    cozyOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
    
    // Play transition sounds
    playChime(0.85);
    setTimeout(() => playChime(0.7), 200);
    
    if (state.audioPlaying) {
      startRainSynth();
    }

    state.currentCozyMsgIndex = 0;
    updateCozyMessages();
    
    // Start dynamic canvas rain inside cozy mode!
    startCozyCanvasRain();
  }

  function closeCozyMode() {
    state.cozyModeActive = false;
    cozyOverlay.classList.add('hidden');
    document.body.style.overflow = ''; // Unlock scrolling
    
    playChime(1.1);
    stopRainSynth();
  }

  function updateCozyMessages() {
    cozyMsgs.forEach((msg, idx) => {
      msg.classList.toggle('active', idx === state.currentCozyMsgIndex);
    });

    msgCounter.innerText = `${state.currentCozyMsgIndex + 1} / ${cozyMsgs.length}`;
    
    prevMsgBtn.disabled = state.currentCozyMsgIndex === 0;
    nextMsgBtn.disabled = state.currentCozyMsgIndex === cozyMsgs.length - 1;
    
    // Soft bell on transition
    playChime(1.0 + (state.currentCozyMsgIndex * 0.05));
  }

  cozyTrigger.addEventListener('click', openCozyMode);
  closeCozyBtn.addEventListener('click', closeCozyMode);

  prevMsgBtn.addEventListener('click', () => {
    if (state.currentCozyMsgIndex > 0) {
      state.currentCozyMsgIndex--;
      updateCozyMessages();
    }
  });

  nextMsgBtn.addEventListener('click', () => {
    if (state.currentCozyMsgIndex < cozyMsgs.length - 1) {
      state.currentCozyMsgIndex++;
      updateCozyMessages();
    }
  });

  // --- Dynamic Cozy Rain Screen effect ---
  let rainInterval = null;
  function startCozyCanvasRain() {
    if (rainInterval) clearInterval(rainInterval);
    
    // Spawn soft rain drops falling down the overlay canvas
    rainInterval = setInterval(() => {
      if (!state.cozyModeActive) {
        clearInterval(rainInterval);
        return;
      }
      
      // Spawn rain-like blue/grey chimes particles
      particles.push(new Particle(
        Math.random() * window.innerWidth,
        -10,
        'sparkle',
        2.5
      ));
    }, 150);
  }

  /* ==========================================================================
     SUNSET FIREFLIES GENERATOR
     ========================================================================== */
  const firefliesContainer = document.getElementById('fireflies');
  
  function spawnFireflies() {
    const fireflyCount = 20;
    for (let i = 0; i < fireflyCount; i++) {
      const fly = document.createElement('div');
      fly.className = 'firefly';
      
      // Random placements
      fly.style.left = `${Math.random() * 100}%`;
      fly.style.top = `${Math.random() * 100}%`;
      
      // Random animation delay & parameters
      const delay = Math.random() * 6;
      const duration = 6 + Math.random() * 6;
      fly.style.animationDelay = `${delay}s`;
      fly.style.animationDuration = `${duration}s`;
      
      // Dynamic move offsets via CSS custom properties
      fly.style.setProperty('--dx', `${Math.random() * 100 - 50}px`);
      fly.style.setProperty('--dy', `${-Math.random() * 120 - 40}px`);
      
      firefliesContainer.appendChild(fly);
    }
  }
  spawnFireflies();

  /* ==========================================================================
     EASTER EGGS (Wave on Inactivity & Hidden Sparkles)
     ========================================================================== */
  const mainTeddy = document.querySelector('.teddy-img');

  function checkInactivity() {
    const timeDiff = Date.now() - state.lastInteractionTime;
    
    // Trigger waving teddy if inactive for 15 seconds
    if (timeDiff >= 15000) {
      if (mainTeddy && !mainTeddy.classList.contains('waving')) {
        mainTeddy.classList.remove('breathing');
        // Let's do a cute bounce wave
        mainTeddy.style.transform = 'scale(1.08) rotate(4deg)';
        
        // Spawn small floating stars
        const rect = mainTeddy.getBoundingClientRect();
        spawnExplosion(rect.left + rect.width/2, rect.top + rect.height/2, 6, 'sparkle');
        
        setTimeout(() => {
          mainTeddy.style.transform = '';
          mainTeddy.classList.add('breathing');
        }, 1500);
      }
      // Reset timer slightly to prevent endless spam
      state.lastInteractionTime = Date.now() - 5000;
    }
  }
  
  // Set inactivity loop interval
  setInterval(checkInactivity, 4000);

  // Hidden Easter Egg: Bloom tulips when double clicking or tapping fast
  tulips.forEach((tulip) => {
    tulip.addEventListener('dblclick', () => {
      spawnExplosion(window.innerWidth / 2, window.innerHeight / 2, 35, 'heart');
      playChime(1.5);
      setTimeout(() => playChime(1.7), 150);
    });
  });

  // Track initial viewport interaction to resume audio context
  document.body.addEventListener('click', () => {
    if (!state.audioInitialized) initAudio();
  }, { once: true });

});
