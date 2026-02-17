(() => {
  const canvas = document.getElementById("staffCanvas");
  const playBtn = document.getElementById("staffPlay");
  if (!canvas || !playBtn) return;

  const ctx = canvas.getContext("2d", { alpha: true });

  // Load clef SVG
  const clefSrc = canvas.dataset.clefSrc;
const clefImg = new Image();
if (clefSrc) {
  clefImg.onload = () => draw();   // <— redraw once loaded
  clefImg.onerror = () => draw();  // <— still redraw (without clef)
  clefImg.src = clefSrc;
}



  // Make canvas crisp on HiDPI screens
  function resizeCanvasToDisplaySize() {
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const dpr = window.devicePixelRatio || 1;

    const newW = Math.round(cssWidth * dpr);
    const newH = Math.round(cssHeight * dpr);

    if (canvas.width !== newW || canvas.height !== newH) {
      canvas.width = newW;
      canvas.height = newH;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Staff geometry
  const padX = 0;
  const padY = 8;
  const staffLineGap = 6; // tighter lines
  const staffLines = 5;

  // Notes: stored as { x, stepIndex }
  // stepIndex: integer where 0 is bottom line, 1 is space above, etc.
  // We'll allow a range slightly beyond staff (ledger-ish) for fun.
  let notes = [];

  // Helpers
  function staffTop() { return padY; }
  function staffBottom() { return padY + staffLineGap * (staffLines - 1); }

  function stepToY(step) {
    // bottom line is step 0
    // each step is half a line gap (line/space)
    return staffBottom() - (step * (staffLineGap / 2));
  }

  function yToNearestStep(y) {
    const step = Math.round((staffBottom() - y) / (staffLineGap / 2));
    // clamp range: from -2 (a bit above) to 12 (a bit below)
    return Math.max(-2, Math.min(12, step));
  }

  function draw() {
    resizeCanvasToDisplaySize();

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.clearRect(0, 0, w, h);

    // Background (transparent; the strip styling comes from CSS)
    // Draw staff lines
    ctx.save();
    ctx.lineWidth = 1;

    for (let i = 0; i < staffLines; i++) {
      const y = padY + i * staffLineGap;
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.beginPath();
      ctx.moveTo(padX, y);
      ctx.lineTo(w - padX, y);
      ctx.stroke();
    }

        // Draw clef (SVG) on the left
    if (clefImg.complete && clefImg.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.80;                 // subtle
      ctx.fillStyle = "transparent";
      ctx.strokeStyle = "rgba(255,255,255)";

      // Position and size
      const clefH = staffLineGap * 4 + 42;   // taller
      const clefW = clefH * 0.55 + 40;
      const x = padX - 14;
      const y = padY - 20;

      // The SVG uses currentColor; canvas drawImage ignores it,
      // but our SVG is stroke="currentColor". To control color reliably,
      // we keep it subtle by opacity and let your dark theme do the rest.
      ctx.drawImage(clefImg, x, y, clefW, clefH);
      ctx.restore();
    }


    // Draw notes
    for (const n of notes) {
      const y = stepToY(n.stepIndex);

      // note head
      ctx.save();
      ctx.fillStyle = "rgba(241,245,255,0.92)";
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.ellipse(n.x, y, 6.5, 5, -0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // stem (up stem if below middle-ish)
      const middleStep = 4; // around the center line
      ctx.strokeStyle = "rgba(241,245,255,0.70)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (n.stepIndex <= middleStep) {
        // stem up on right
        ctx.moveTo(n.x + 6, y);
        ctx.lineTo(n.x + 6, y - 22);
      } else {
        // stem down on left
        ctx.moveTo(n.x - 6, y);
        ctx.lineTo(n.x - 6, y + 22);
      }
      ctx.stroke();

      // ledger lines if outside staff
      ctx.strokeStyle = "rgba(255,255,255,0.10)";
      ctx.lineWidth = 1;
      const minStep = 0;
      const maxStep = 8; // top line is 8 (since 5 lines => 8 steps from bottom line to top line)
      if (n.stepIndex < minStep) {
        for (let s = minStep - 2; s >= n.stepIndex; s -= 2) {
          const ly = stepToY(s);
          ctx.beginPath();
          ctx.moveTo(n.x - 12, ly);
          ctx.lineTo(n.x + 12, ly);
          ctx.stroke();
        }
      } else if (n.stepIndex > maxStep) {
        for (let s = maxStep + 2; s <= n.stepIndex; s += 2) {
          const ly = stepToY(s);
          ctx.beginPath();
          ctx.moveTo(n.x - 12, ly);
          ctx.lineTo(n.x + 12, ly);
          ctx.stroke();
        }
      }

      ctx.restore();
    }
  }

  // Toggle note on click (add/remove nearest note if within radius)
  function findNoteNear(x, y) {
    for (let i = 0; i < notes.length; i++) {
      const ny = stepToY(notes[i].stepIndex);
      const dx = notes[i].x - x;
      const dy = ny - y;
      if (Math.hypot(dx, dy) < 10) return i;
    }
    return -1;
  }

  canvas.addEventListener("click", (ev) => {
    const rect = canvas.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;

    // ignore clicks on clef area
    if (x < padX + 18) return;

    const idx = findNoteNear(x, y);
    if (idx >= 0) {
      notes.splice(idx, 1);
      draw();
      return;
    }

    const stepIndex = yToNearestStep(y);
    notes.push({ x, stepIndex });

    // Keep notes ordered left-to-right for playback
    notes.sort((a, b) => a.x - b.x);

    draw();
  });

  // Audio (simple synth)
  let audioCtx = null;

  function midiFromStep(step) {
    // Map staff step to pitch (treble-ish around E4–F5).
    // bottom line step 0 -> E4 (MIDI 64)
    // each step is one diatonic step: E F G A B C D E ...
    // We'll approximate with a C-major diatonic scale mapping.
    const diatonicOffsets = [0, 1, 3, 5, 7, 8, 10]; // from E: E,F,G,A,B,C,D in semitones
    // Calculate degree relative to E
    const degree = step; // 0.. etc
    const octaveShift = Math.floor(degree / 7);
    const degreeInOct = ((degree % 7) + 7) % 7;

    const baseMidi = 64; // E4
    return baseMidi + octaveShift * 12 + diatonicOffsets[degreeInOct];
  }

  function freqFromMidi(m) {
    return 440 * Math.pow(2, (m - 69) / 12);
  }

  async function playNotes() {
    if (notes.length === 0) return;

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === "suspended") await audioCtx.resume();

    const now = audioCtx.currentTime;
    const dur = 0.22;      // each note duration
    const gap = 0.06;      // gap between notes
    let t = now;

    // very soft master gain
    const master = audioCtx.createGain();
    master.gain.value = 0.12;
    master.connect(audioCtx.destination);

    for (const n of notes) {
      const midi = midiFromStep(n.stepIndex);
      const f = freqFromMidi(midi);

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sine"; // clean and subtle
      osc.frequency.setValueAtTime(f, t);

      // simple envelope
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(1.0, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(gain);
      gain.connect(master);

      osc.start(t);
      osc.stop(t + dur);

      t += dur + gap;
    }
  }

  playBtn.addEventListener("click", () => {
    playNotes().catch(() => {});
  });

  // Redraw on resize
  window.addEventListener("resize", draw);

  // Initial draw
  draw();
})();
