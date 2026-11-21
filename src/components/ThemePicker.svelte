<script lang="ts">
  type ThemeId = 'aurora' | 'keycaps' | 'patchbay' | 'warp';

  interface ThemeOption {
    id: ThemeId;
    num: string;
    name: string;
    tagline: string;
    hint: string;
    dot: string;
  }

  const THEMES: ThemeOption[] = [
    {
      id: 'aurora',
      num: '0',
      name: 'Current',
      tagline: 'Aurora Grain',
      hint: 'Current live CSS aurora + monochrome film grain',
      dot: 'linear-gradient(135deg, #c4b5fd, #fcd34d, #5eead4)',
    },
    {
      id: 'keycaps',
      num: '1',
      name: 'Keycap Matrix',
      tagline: 'Interactive 3D Keys',
      hint: 'Hover to press keys · Click or type on your keyboard for shockwaves!',
      dot: 'linear-gradient(135deg, #f9a8d4, #93c5fd, #fde68a)',
    },
    {
      id: 'patchbay',
      num: '2',
      name: 'Patchbay Lab',
      tagline: 'Industrial Synth',
      hint: 'Move mouse to patch live cables · Click anywhere to fire signal bursts!',
      dot: 'linear-gradient(135deg, #ff4d00, #2563eb)',
    },
    {
      id: 'warp',
      num: '3',
      name: 'Warp Drive',
      tagline: 'Dark Hyperdrive',
      hint: 'Move mouse to steer · Hold click anywhere to engage WARP SPEED!',
      dot: 'linear-gradient(135deg, #38bdf8, #a855f7)',
    },
  ];

  let theme = $state<ThemeId>('aurora');
  let minimized = $state(false);
  let canvasEl = $state<HTMLCanvasElement | null>(null);
  let coords = $state({ x: 0, y: 0, pulses: 0 });
  let warping = $state(false);

  const activeMeta = $derived(
    THEMES.find((t) => t.id === theme) ?? THEMES[0],
  );

  function applyTheme(next: ThemeId) {
    theme = next;
    if (typeof document !== 'undefined') {
      document.documentElement.dataset.hfTheme = next;
    }
    try {
      localStorage.setItem('hf-theme', next);
      const url = new URL(window.location.href);
      if (next === 'aurora') {
        url.searchParams.delete('theme');
      } else {
        url.searchParams.set('theme', next);
      }
      window.history.replaceState({}, '', url.toString());
    } catch {}
  }

  // Initialize from URL param or localStorage on mount
  $effect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('theme') as ThemeId | null;
    const fromStorage = (() => {
      try {
        return localStorage.getItem('hf-theme') as ThemeId | null;
      } catch {
        return null;
      }
    })();
    const valid: ThemeId[] = ['aurora', 'keycaps', 'patchbay', 'warp'];
    const initial =
      (fromUrl && valid.includes(fromUrl) && fromUrl) ||
      (fromStorage && valid.includes(fromStorage) && fromStorage) ||
      'aurora';
    theme = initial;
    document.documentElement.dataset.hfTheme = initial;
  });

  // Canvas animation engines per active theme
  $effect(() => {
    const current = theme;
    const canvas = canvasEl;
    warping = false;

    if (!canvas || current === 'aurora') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = window.innerWidth;
    let H = window.innerHeight;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = Math.floor(W * dpr);
      canvas!.height = Math.floor(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();

    let rafId = 0;
    const cleanups: (() => void)[] = [];

    // =========================================================================
    // THEME 1: LIVING KEYCAP MATRIX
    // =========================================================================
    if (current === 'keycaps') {
      const LEGENDS = [
        '⌘', '⌥', '⌃', '⇧', 'f18', '⇥', '⎋', '↵',
        'w', 't', 'c', 'g', 'v', 's', 'r', 'l',
        'h', 'j', 'k', 'm', 'a', 'e', 'f', 'd',
      ];
      const GLOWS = [
        [196, 181, 253], // lavender
        [252, 211, 77],  // sunlit gold
        [94, 234, 212],  // mint
        [125, 211, 252], // sky
        [249, 168, 212], // rose
        [253, 186, 116], // peach
      ];

      const CELL = 66;
      const GAP = 9;
      let cols = 0;
      let rows = 0;
      let offsetX = 0;
      let offsetY = 0;

      interface KeyCell {
        cx: number;
        cy: number;
        x: number;
        y: number;
        w: number;
        h: number;
        legend: string;
        depth: number;
        vel: number;
        glow: number;
        color: [number, number, number];
      }

      interface Ripple {
        x: number;
        y: number;
        r: number;
        maxR: number;
        color: [number, number, number];
      }

      interface FloatingKey {
        x: number;
        y: number;
        vy: number;
        alpha: number;
        label: string;
        color: [number, number, number];
      }

      let keys: KeyCell[] = [];
      let ripples: Ripple[] = [];
      let floats: FloatingKey[] = [];
      let mx = -9999;
      let my = -9999;

      function buildGrid() {
        cols = Math.ceil(W / CELL) + 1;
        rows = Math.ceil(H / CELL) + 1;
        offsetX = (W - cols * CELL) / 2;
        offsetY = (H - rows * CELL) / 2;
        keys = [];
        for (let r = 0; r < rows; r++) {
          // Subtle keyboard row stagger!
          const stagger = (r % 3) * 14 - 14;
          for (let c = 0; c < cols; c++) {
            const x = offsetX + c * CELL + stagger + GAP / 2;
            const y = offsetY + r * CELL + GAP / 2;
            const size = CELL - GAP;
            const idx = (r * 13 + c * 7) % LEGENDS.length;
            const cIdx = (r + c) % GLOWS.length;
            keys.push({
              cx: x + size / 2,
              cy: y + size / 2,
              x,
              y,
              w: size,
              h: size,
              legend: LEGENDS[idx],
              depth: 0,
              vel: 0,
              glow: 0,
              color: GLOWS[cIdx] as [number, number, number],
            });
          }
        }
      }

      buildGrid();

      function triggerRipple(
        x: number,
        y: number,
        label?: string,
        color?: [number, number, number],
      ) {
        const col =
          color ??
          (GLOWS[Math.floor(Math.random() * GLOWS.length)] as [
            number,
            number,
            number,
          ]);
        ripples.push({
          x,
          y,
          r: 8,
          maxR: Math.max(W, H) * 0.65,
          color: col,
        });
        if (label) {
          floats.push({
            x,
            y: y - 10,
            vy: -1.6,
            alpha: 1,
            label,
            color: col,
          });
        }
      }

      const onResize = () => {
        resize();
        buildGrid();
      };
      const onMove = (e: PointerEvent) => {
        mx = e.clientX;
        my = e.clientY;
      };
      const onLeave = () => {
        mx = -9999;
        my = -9999;
      };
      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.closest('[data-theme-picker]')) return;
        triggerRipple(e.clientX, e.clientY);
        for (const k of keys) {
          const dist = Math.hypot(k.cx - e.clientX, k.cy - e.clientY);
          if (dist < 110) {
            k.vel += (1 - dist / 110) * 0.48;
            k.glow = Math.max(k.glow, 1);
          }
        }
      };
      const onKeyDown = (e: KeyboardEvent) => {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        ) {
          return;
        }
        const label =
          e.key === ' '
            ? 'SPACE'
            : e.key === 'Meta'
              ? '⌘'
              : e.key === 'Alt'
                ? '⌥'
                : e.key === 'Control'
                  ? '⌃'
                  : e.key === 'Shift'
                    ? '⇧'
                    : e.key === 'Enter'
                      ? '↵'
                      : e.key === 'Escape'
                        ? '⎋'
                        : e.key.length === 1
                          ? e.key.toUpperCase()
                          : e.key.slice(0, 4).toUpperCase();

        // Pick a keycap matching legend or a random visible one
        const matches = keys.filter(
          (k) =>
            k.legend.toUpperCase() === label &&
            k.cx > 40 &&
            k.cx < W - 40 &&
            k.cy > 40 &&
            k.cy < H - 40,
        );
        const visible = keys.filter(
          (k) => k.cx > 60 && k.cx < W - 60 && k.cy > 60 && k.cy < H - 60,
        );
        const target =
          matches.length > 0
            ? matches[Math.floor(Math.random() * matches.length)]
            : visible[Math.floor(Math.random() * visible.length)];

        if (target) {
          target.vel += 0.65;
          target.glow = 1.2;
          triggerRipple(target.cx, target.cy, label, target.color);
        }
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerleave', onLeave);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('keydown', onKeyDown);
      cleanups.push(() => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('keydown', onKeyDown);
      });

      function roundRect(
        x: number,
        y: number,
        w: number,
        h: number,
        r: number,
      ) {
        ctx!.beginPath();
        ctx!.roundRect(x, y, w, h, r);
      }

      let t = 0;
      function frame() {
        t += 0.014;
        // Warm porcelain deskmat background
        ctx!.fillStyle = '#f5f3ee';
        ctx!.fillRect(0, 0, W, H);

        // Update ripples
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rp = ripples[i];
          rp.r += 11;
          for (const k of keys) {
            const dist = Math.hypot(k.cx - rp.x, k.cy - rp.y);
            if (Math.abs(dist - rp.r) < 34) {
              const strength = Math.max(0, 1 - rp.r / rp.maxR);
              k.vel += 0.16 * strength;
              k.glow = Math.max(k.glow, strength * 1.15);
              k.color = rp.color;
            }
          }
          if (rp.r > rp.maxR) ripples.splice(i, 1);
        }

        // Gentle autonomous ambient wave if user hasn't interacted recently
        const ambientX = W * (0.5 + Math.cos(t * 0.45) * 0.36);
        const ambientY = H * (0.45 + Math.sin(t * 0.35) * 0.32);

        for (const k of keys) {
          const dMouse = Math.hypot(k.cx - mx, k.cy - my);
          let targetDepth = 0;

          if (dMouse < 150) {
            const f = 1 - dMouse / 150;
            targetDepth = Math.max(targetDepth, f * f * 0.95);
            k.glow = Math.max(k.glow, f * 0.95);
          }

          if (!reducedMotion) {
            const dAmb = Math.hypot(k.cx - ambientX, k.cy - ambientY);
            if (dAmb < 210) {
              const fa = 1 - dAmb / 210;
              targetDepth = Math.max(targetDepth, fa * fa * 0.25);
              k.glow = Math.max(k.glow, fa * 0.28);
            }
          }

          // Spring physics
          const force = (targetDepth - k.depth) * 0.18;
          k.vel = (k.vel + force) * 0.78;
          k.depth = Math.max(-0.15, Math.min(1.2, k.depth + k.vel));
          k.glow *= 0.945;

          const pressPx = k.depth * 4.5;
          const [r, g, b] = k.color;

          // Underglow peeking from switch housing
          if (k.glow > 0.03) {
            ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(0.65, k.glow * 0.52)})`;
            roundRect(k.x - 2, k.y - 2, k.w + 4, k.h + 5, 13);
            ctx!.fill();
          }

          // Keycap bottom skirt / 3D shadow
          const skirt = Math.max(0.5, 4.5 - pressPx);
          ctx!.fillStyle =
            k.glow > 0.08
              ? `rgba(${Math.round(r * 0.65)}, ${Math.round(g * 0.65)}, ${Math.round(b * 0.65)}, ${0.14 + k.glow * 0.22})`
              : 'rgba(17, 24, 39, 0.075)';
          roundRect(k.x, k.y + pressPx + skirt, k.w, k.h - 1, 11);
          ctx!.fill();

          // Keycap body
          const bodyY = k.y + pressPx;
          ctx!.fillStyle =
            k.glow > 0.05
              ? `rgba(${Math.round(255 - (255 - r) * k.glow * 0.22)}, ${Math.round(254 - (254 - g) * k.glow * 0.22)}, ${Math.round(251 - (251 - b) * k.glow * 0.22)}, 0.92)`
              : 'rgba(255, 254, 250, 0.78)';
          roundRect(k.x, bodyY, k.w, k.h, 11);
          ctx!.fill();

          ctx!.strokeStyle =
            k.glow > 0.1
              ? `rgba(${r}, ${g}, ${b}, ${0.35 + k.glow * 0.45})`
              : 'rgba(17, 24, 39, 0.075)';
          ctx!.lineWidth = 1;
          ctx!.stroke();

          // Subtle sculpted top dish
          ctx!.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          roundRect(k.x + 4, bodyY + 3, k.w - 8, k.h - 9, 8);
          ctx!.stroke();

          // Keycap legend
          ctx!.font = '500 11px ui-monospace, SFMono-Regular, Menlo, monospace';
          ctx!.fillStyle =
            k.glow > 0.12
              ? `rgba(17, 24, 39, ${0.28 + Math.min(0.55, k.glow * 0.5)})`
              : 'rgba(17, 24, 39, 0.19)';
          ctx!.textAlign = 'left';
          ctx!.textBaseline = 'top';
          ctx!.fillText(k.legend, k.x + 10, bodyY + 8);
        }

        // Floating typed-key sparks
        for (let i = floats.length - 1; i >= 0; i--) {
          const fl = floats[i];
          fl.y += fl.vy;
          fl.alpha *= 0.955;
          const [r, g, b] = fl.color;
          ctx!.save();
          ctx!.globalAlpha = fl.alpha;
          ctx!.font = '700 13px ui-monospace, SFMono-Regular, Menlo, monospace';
          const tw = ctx!.measureText(fl.label).width;
          const bw = tw + 18;
          const bh = 26;
          ctx!.fillStyle = `rgb(${r}, ${g}, ${b})`;
          roundRect(fl.x - bw / 2, fl.y - bh / 2, bw, bh, 8);
          ctx!.fill();
          ctx!.fillStyle = '#111827';
          ctx!.textAlign = 'center';
          ctx!.textBaseline = 'middle';
          ctx!.fillText(fl.label, fl.x, fl.y + 0.5);
          ctx!.restore();
          if (fl.alpha < 0.04) floats.splice(i, 1);
        }

        rafId = requestAnimationFrame(frame);
      }

      rafId = requestAnimationFrame(frame);
    }

    // =========================================================================
    // THEME 2: PATCHBAY LAB (TEENAGE ENGINEERING / MODULAR SIGNAL GRAPH)
    // =========================================================================
    if (current === 'patchbay') {
      const LABELS = [
        'F18', 'W:LEFT', 'W:MAX', 'TERM', 'CODE', 'GIT',
        'RAY', 'URL', 'CMD', 'LUA', 'MENU', 'TXT',
        'HOME', 'WORK', 'RELOAD', 'INPUT', 'SHORT', 'APP',
      ];
      const COLORS = ['#ff4d00', '#2563eb', '#16a34a'];

      interface Node {
        x: number;
        y: number;
        bx: number;
        by: number;
        phase: number;
        label: string;
        pulse: number;
        color: string;
      }

      interface Packet {
        from: number;
        to: number;
        p: number;
        speed: number;
        color: string;
        size: number;
      }

      let nodes: Node[] = [];
      let edges: [number, number][] = [];
      let packets: Packet[] = [];
      let mx = -9999;
      let my = -9999;
      let pulseCount = 0;

      function initGraph() {
        const count = Math.max(12, Math.min(20, Math.floor((W * H) / 68000)));
        nodes = [];
        edges = [];
        packets = [];

        // Distribute evenly around viewport with bias toward edges so center text stays clean
        const cols = Math.ceil(Math.sqrt((count * W) / H));
        const rows = Math.ceil(count / cols);
        let idx = 0;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (idx >= count) break;
            const bx = ((c + 0.5) / cols) * W + (Math.sin(idx * 4.3) * W) / (cols * 4);
            const by = ((r + 0.5) / rows) * H + (Math.cos(idx * 3.1) * H) / (rows * 4);
            nodes.push({
              x: bx,
              y: by,
              bx,
              by,
              phase: idx * 1.1,
              label: LABELS[idx % LABELS.length],
              pulse: 0,
              color: COLORS[idx % COLORS.length],
            });
            idx++;
          }
        }

        // Connect each node to 2 nearest neighbors
        for (let i = 0; i < nodes.length; i++) {
          const sorted = nodes
            .map((n, j) => ({
              j,
              d: Math.hypot(n.bx - nodes[i].bx, n.by - nodes[i].by),
            }))
            .filter((o) => o.j !== i)
            .sort((a, b) => a.d - b.d)
            .slice(0, 2);

          for (const s of sorted) {
            const a = Math.min(i, s.j);
            const b = Math.max(i, s.j);
            if (!edges.some(([ea, eb]) => ea === a && eb === b)) {
              edges.push([a, b]);
            }
          }
        }

        // Seed ambient packets
        for (let i = 0; i < Math.min(10, edges.length); i++) {
          const [a, b] = edges[i];
          packets.push({
            from: a,
            to: b,
            p: Math.random(),
            speed: 0.004 + Math.random() * 0.004,
            color: COLORS[i % COLORS.length],
            size: 3.5,
          });
        }
      }

      initGraph();

      const onResize = () => {
        resize();
        initGraph();
      };
      const onMove = (e: PointerEvent) => {
        mx = e.clientX;
        my = e.clientY;
        coords = { x: Math.round(mx), y: Math.round(my), pulses: pulseCount };
      };
      const onLeave = () => {
        mx = -9999;
        my = -9999;
      };
      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.closest('[data-theme-picker]')) return;
        pulseCount++;
        coords = {
          x: Math.round(e.clientX),
          y: Math.round(e.clientY),
          pulses: pulseCount,
        };
        // Find 3 nearest nodes and launch cascading signal bursts!
        const nearest = nodes
          .map((n, i) => ({ i, d: Math.hypot(n.x - e.clientX, n.y - e.clientY) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, 3);

        for (const { i } of nearest) {
          nodes[i].pulse = 1;
          for (const [a, b] of edges) {
            if (a === i || b === i) {
              const to = a === i ? b : a;
              packets.push({
                from: i,
                to,
                p: 0,
                speed: 0.022 + Math.random() * 0.012,
                color: '#ff4d00',
                size: 5,
              });
            }
          }
        }
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerleave', onLeave);
      window.addEventListener('pointerdown', onDown);
      cleanups.push(() => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('pointerdown', onDown);
      });

      let t = 0;
      function drawCable(
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        stroke: string,
        width: number,
        dashed = false,
      ) {
        const sag = Math.min(55, Math.hypot(x2 - x1, y2 - y1) * 0.14);
        const cx = (x1 + x2) / 2;
        const cy = (y1 + y2) / 2 + sag;
        ctx!.beginPath();
        ctx!.setLineDash(dashed ? [4, 5] : []);
        ctx!.moveTo(x1, y1);
        ctx!.quadraticCurveTo(cx, cy, x2, y2);
        ctx!.strokeStyle = stroke;
        ctx!.lineWidth = width;
        ctx!.stroke();
        ctx!.setLineDash([]);
        return { cx, cy };
      }

      function quadPoint(
        x1: number,
        y1: number,
        cx: number,
        cy: number,
        x2: number,
        y2: number,
        u: number,
      ) {
        const inv = 1 - u;
        return {
          x: inv * inv * x1 + 2 * inv * u * cx + u * u * x2,
          y: inv * inv * y1 + 2 * inv * u * cy + u * u * y2,
        };
      }

      function frame() {
        t += reducedMotion ? 0 : 0.012;

        // Warm Teenage Engineering drafting paper base
        ctx!.fillStyle = '#eeece6';
        ctx!.fillRect(0, 0, W, H);

        // Engineering drafting grid (28px)
        ctx!.strokeStyle = 'rgba(24, 24, 27, 0.048)';
        ctx!.lineWidth = 1;
        const step = 28;
        ctx!.beginPath();
        for (let x = 0; x < W; x += step) {
          ctx!.moveTo(x + 0.5, 0);
          ctx!.lineTo(x + 0.5, H);
        }
        for (let y = 0; y < H; y += step) {
          ctx!.moveTo(0, y + 0.5);
          ctx!.lineTo(W, y + 0.5);
        }
        ctx!.stroke();

        // Ruler ticks along left and top edges
        ctx!.fillStyle = 'rgba(24, 24, 27, 0.16)';
        for (let x = 0; x < W; x += 14) {
          const h = x % 70 === 0 ? 8 : 4;
          ctx!.fillRect(x, 0, 1, h);
        }
        for (let y = 0; y < H; y += 14) {
          const w = y % 70 === 0 ? 8 : 4;
          ctx!.fillRect(0, y, w, 1);
        }

        // Gently animate nodes
        for (const n of nodes) {
          n.x = n.bx + Math.sin(t + n.phase) * 9;
          n.y = n.by + Math.cos(t * 0.8 + n.phase) * 9;
          n.pulse *= 0.93;
        }

        // Draw static patch cables
        for (const [a, b] of edges) {
          const na = nodes[a];
          const nb = nodes[b];
          drawCable(na.x, na.y, nb.x, nb.y, 'rgba(24, 24, 27, 0.11)', 1.25);
        }

        // Dynamic live patch cables from cursor to 3 nearest nodes!
        if (mx > 0 && my > 0) {
          const nearest = nodes
            .map((n, i) => ({ n, i, d: Math.hypot(n.x - mx, n.y - my) }))
            .filter((o) => o.d < 340)
            .sort((a, b) => a.d - b.d)
            .slice(0, 3);

          for (const { n, d } of nearest) {
            const alpha = Math.max(0.12, (1 - d / 340) * 0.65);
            drawCable(
              mx,
              my,
              n.x,
              n.y,
              `rgba(255, 77, 0, ${alpha})`,
              1.6,
              true,
            );
          }

          // Cursor crosshair jack
          ctx!.strokeStyle = 'rgba(255, 77, 0, 0.65)';
          ctx!.lineWidth = 1.25;
          ctx!.beginPath();
          ctx!.arc(mx, my, 7, 0, Math.PI * 2);
          ctx!.stroke();
          ctx!.fillStyle = '#ff4d00';
          ctx!.beginPath();
          ctx!.arc(mx, my, 2.5, 0, Math.PI * 2);
          ctx!.fill();
        }

        // Update & draw glowing data packets
        for (let i = packets.length - 1; i >= 0; i--) {
          const pk = packets[i];
          pk.p += pk.speed;
          const na = nodes[pk.from];
          const nb = nodes[pk.to];
          if (!na || !nb) {
            packets.splice(i, 1);
            continue;
          }
          const sag = Math.min(55, Math.hypot(nb.x - na.x, nb.y - na.y) * 0.14);
          const cx = (na.x + nb.x) / 2;
          const cy = (na.y + nb.y) / 2 + sag;
          const pt = quadPoint(na.x, na.y, cx, cy, nb.x, nb.y, Math.min(1, pk.p));

          ctx!.fillStyle = pk.color;
          ctx!.beginPath();
          ctx!.arc(pt.x, pt.y, pk.size, 0, Math.PI * 2);
          ctx!.fill();

          if (pk.p >= 1) {
            nb.pulse = Math.max(nb.pulse, pk.size > 4 ? 0.9 : 0.45);
            // Keep ambient packets circulating; decay burst packets
            if (pk.size <= 4) {
              const adj = edges
                .filter(([a, b]) => a === pk.to || b === pk.to)
                .map(([a, b]) => (a === pk.to ? b : a));
              pk.from = pk.to;
              pk.to = adj[Math.floor(Math.random() * adj.length)] ?? pk.from;
              pk.p = 0;
            } else {
              packets.splice(i, 1);
            }
          }
        }

        // Draw hardware jack nodes
        ctx!.font = '600 9.5px ui-monospace, SFMono-Regular, Menlo, monospace';
        ctx!.textBaseline = 'middle';
        ctx!.textAlign = 'left';
        for (const n of nodes) {
          // Outer jack ring
          if (n.pulse > 0.05) {
            ctx!.strokeStyle = `rgba(255, 77, 0, ${n.pulse * 0.6})`;
            ctx!.lineWidth = 1.5;
            ctx!.beginPath();
            ctx!.arc(n.x, n.y, 9 + (1 - n.pulse) * 14, 0, Math.PI * 2);
            ctx!.stroke();
          }

          ctx!.fillStyle = '#f8f7f3';
          ctx!.strokeStyle =
            n.pulse > 0.2 ? '#ff4d00' : 'rgba(24, 24, 27, 0.28)';
          ctx!.lineWidth = 1.4;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, 6, 0, Math.PI * 2);
          ctx!.fill();
          ctx!.stroke();

          ctx!.fillStyle = n.pulse > 0.2 ? '#ff4d00' : n.color;
          ctx!.beginPath();
          ctx!.arc(n.x, n.y, 2.3, 0, Math.PI * 2);
          ctx!.fill();

          ctx!.fillStyle = 'rgba(24, 24, 27, 0.34)';
          ctx!.fillText(n.label, n.x + 10, n.y + 0.5);
        }

        rafId = requestAnimationFrame(frame);
      }

      rafId = requestAnimationFrame(frame);
    }

    // =========================================================================
    // THEME 3: WARP DRIVE (FULL DARK-MODE 3D STARFIELD + SYNTH HORIZON)
    // =========================================================================
    if (current === 'warp') {
      const STAR_COUNT = 220;
      const STAR_COLORS = ['#38bdf8', '#a855f7', '#f472b6', '#e2e8f0', '#5eead4'];

      interface Star {
        x: number;
        y: number;
        z: number;
        pz: number;
        color: string;
      }

      const stars: Star[] = Array.from({ length: STAR_COUNT }, (_, i) => {
        const z = Math.random() * 1400 + 80;
        return {
          x: (Math.random() - 0.5) * 2200,
          y: (Math.random() - 0.5) * 1500,
          z,
          pz: z,
          color: STAR_COLORS[i % STAR_COLORS.length],
        };
      });

      let targetSteerX = 0;
      let targetSteerY = 0;
      let steerX = 0;
      let steerY = 0;
      let speed = 5.5;
      let gridOffset = 0;
      let holding = false;

      const onResize = () => resize();
      const onMove = (e: PointerEvent) => {
        targetSteerX = (e.clientX / W - 0.5) * 2;
        targetSteerY = (e.clientY / H - 0.5) * 2;
      };
      const onDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.closest('[data-theme-picker]')) return;
        holding = true;
        warping = true;
      };
      const onUp = () => {
        holding = false;
        warping = false;
      };

      window.addEventListener('resize', onResize);
      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      window.addEventListener('pointercancel', onUp);
      cleanups.push(() => {
        window.removeEventListener('resize', onResize);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
      });

      function frame() {
        steerX += (targetSteerX - steerX) * 0.06;
        steerY += (targetSteerY - steerY) * 0.06;

        const targetSpeed = reducedMotion ? 1.2 : holding ? 34 : 5.5;
        speed += (targetSpeed - speed) * 0.09;

        // Deep obsidian space + subtle nebula wash
        const bgGrad = ctx!.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, '#060712');
        bgGrad.addColorStop(0.55, '#0b0a1f');
        bgGrad.addColorStop(1, '#120b29');
        ctx!.fillStyle = bgGrad;
        ctx!.fillRect(0, 0, W, H);

        // Ambient nebula glows
        const neb1 = ctx!.createRadialGradient(
          W * (0.25 - steerX * 0.05),
          H * 0.25,
          20,
          W * 0.25,
          H * 0.25,
          W * 0.45,
        );
        neb1.addColorStop(0, 'rgba(56, 189, 248, 0.14)');
        neb1.addColorStop(1, 'transparent');
        ctx!.fillStyle = neb1;
        ctx!.fillRect(0, 0, W, H);

        const neb2 = ctx!.createRadialGradient(
          W * (0.78 - steerX * 0.05),
          H * 0.35,
          20,
          W * 0.78,
          H * 0.35,
          W * 0.45,
        );
        neb2.addColorStop(0, 'rgba(168, 85, 247, 0.16)');
        neb2.addColorStop(1, 'transparent');
        ctx!.fillStyle = neb2;
        ctx!.fillRect(0, 0, W, H);

        // Perspective synth horizon grid at bottom
        const horizonY = H * (0.62 - steerY * 0.05);
        const vanishX = W * (0.5 - steerX * 0.12);
        gridOffset = (gridOffset + speed * 0.008) % 1;

        ctx!.save();
        ctx!.beginPath();
        ctx!.rect(0, horizonY, W, H - horizonY);
        ctx!.clip();

        // Horizon glow line
        const hGlow = ctx!.createLinearGradient(0, horizonY, 0, horizonY + 90);
        hGlow.addColorStop(0, 'rgba(244, 114, 182, 0.24)');
        hGlow.addColorStop(1, 'transparent');
        ctx!.fillStyle = hGlow;
        ctx!.fillRect(0, horizonY, W, 90);

        // Vertical perspective lines
        ctx!.strokeStyle = holding
          ? 'rgba(56, 189, 248, 0.32)'
          : 'rgba(168, 85, 247, 0.2)';
        ctx!.lineWidth = 1;
        for (let i = -14; i <= 14; i++) {
          const bottomX = vanishX + i * (W * 0.12);
          ctx!.beginPath();
          ctx!.moveTo(vanishX, horizonY);
          ctx!.lineTo(bottomX, H);
          ctx!.stroke();
        }

        // Horizontal moving depth lines
        const rows = 12;
        for (let i = 0; i < rows; i++) {
          const p = (i + gridOffset) / rows;
          const y = horizonY + Math.pow(p, 2.3) * (H - horizonY);
          ctx!.strokeStyle = `rgba(56, 189, 248, ${0.06 + p * 0.24})`;
          ctx!.beginPath();
          ctx!.moveTo(0, y);
          ctx!.lineTo(W, y);
          ctx!.stroke();
        }
        ctx!.restore();

        // 3D Starfield
        const cx = W * 0.5 - steerX * 90;
        const cy = H * 0.45 - steerY * 60;
        const fov = 420;

        for (const s of stars) {
          s.pz = s.z;
          s.z -= speed;
          if (s.z <= 8) {
            s.x = (Math.random() - 0.5) * 2200;
            s.y = (Math.random() - 0.5) * 1500;
            s.z = 1400;
            s.pz = 1400;
          }

          const sx = (s.x / s.z) * fov + cx;
          const sy = (s.y / s.z) * fov + cy;
          const px = (s.x / s.pz) * fov + cx;
          const py = (s.y / s.pz) * fov + cy;

          if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) continue;

          const depthAlpha = Math.min(1, (1400 - s.z) / 900);
          const radius = Math.max(0.7, (1 - s.z / 1400) * 2.5);

          ctx!.strokeStyle = s.color;
          ctx!.globalAlpha = depthAlpha * (holding ? 0.95 : 0.78);
          ctx!.lineWidth = holding ? radius * 1.15 : radius;
          ctx!.beginPath();
          ctx!.moveTo(px, py);
          ctx!.lineTo(sx, sy);
          ctx!.stroke();
        }
        ctx!.globalAlpha = 1;

        rafId = requestAnimationFrame(frame);
      }

      rafId = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(rafId);
      for (const fn of cleanups) fn();
    };
  });
</script>

<!-- Interactive Background Canvas (active for themes 1-3) -->
{#if theme !== 'aurora'}
  <canvas
    bind:this={canvasEl}
    class="hf-canvas"
    aria-hidden="true"
  ></canvas>
{/if}

<!-- Teenage Engineering Telemetry HUD for Patchbay Lab -->
{#if theme === 'patchbay'}
  <div class="te-hud" aria-hidden="true">
    <span>HF-02 // PATCHBAY</span>
    <span>X:{String(coords.x).padStart(4, '0')} Y:{String(coords.y).padStart(4, '0')}</span>
    <span>PULSES:{String(coords.pulses).padStart(2, '0')}</span>
  </div>
{/if}

<!-- Warp Speed indicator -->
{#if theme === 'warp' && warping}
  <div class="warp-badge" aria-hidden="true">⚡ HYPERSPACE ENGAGED</div>
{/if}

<!-- Floating Theme Picker Dock (temporary — easy to remove once you choose!) -->
<div class="picker-wrap" data-theme-picker>
  {#if minimized}
    <button
      class="picker-fab"
      onclick={() => (minimized = false)}
      title="Open theme picker"
    >
      <span class="dot" style="background: {activeMeta.dot}"></span>
      Themes
    </button>
  {:else}
    <div class="picker-hint">
      <span>{activeMeta.hint}</span>
    </div>
    <div class="picker-dock" role="tablist" aria-label="Site theme preview picker">
      {#each THEMES as opt}
        <button
          role="tab"
          aria-selected={theme === opt.id}
          class="picker-btn"
          class:active={theme === opt.id}
          onclick={() => applyTheme(opt.id)}
        >
          <span class="dot" style="background: {opt.dot}"></span>
          <span class="num">{opt.num}</span>
          <span class="name">{opt.name}</span>
        </button>
      {/each}
      <button
        class="picker-close"
        onclick={() => (minimized = true)}
        title="Minimize picker"
        aria-label="Minimize picker"
      >
        ×
      </button>
    </div>
  {/if}
</div>

<style>
  .hf-canvas {
    position: fixed;
    inset: 0;
    width: 100vw;
    height: 100vh;
    z-index: -1;
    pointer-events: none;
    display: block;
  }

  .te-hud {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 40;
    pointer-events: none;
    display: none;
    gap: 14px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px;
    letter-spacing: 0.08em;
    color: rgba(24, 24, 27, 0.55);
    background: rgba(248, 247, 243, 0.78);
    border: 1px solid rgba(24, 24, 27, 0.14);
    padding: 3px 10px;
    border-radius: 4px;
    backdrop-filter: blur(6px);
  }

  @media (min-width: 768px) {
    .te-hud {
      display: inline-flex;
    }
  }

  .warp-badge {
    position: fixed;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 50;
    pointer-events: none;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    color: #38bdf8;
    background: rgba(7, 8, 17, 0.85);
    border: 1px solid rgba(56, 189, 248, 0.6);
    padding: 5px 14px;
    border-radius: 999px;
    box-shadow: 0 0 24px rgba(56, 189, 248, 0.45);
  }

  .picker-wrap {
    position: fixed;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    max-width: calc(100vw - 20px);
  }

  .picker-hint {
    font-size: 11.5px;
    font-weight: 500;
    color: #f8fafc;
    background: rgba(15, 23, 42, 0.84);
    border: 1px solid rgba(255, 255, 255, 0.14);
    backdrop-filter: blur(12px);
    padding: 4px 12px;
    border-radius: 999px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
    text-align: center;
    white-space: nowrap;
    max-width: calc(100vw - 24px);
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .picker-dock {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.88);
    border: 1px solid rgba(255, 255, 255, 0.16);
    backdrop-filter: blur(16px);
    box-shadow: 0 12px 36px rgba(0, 0, 0, 0.28);
    overflow-x: auto;
    max-width: 100%;
  }

  .picker-btn {
    appearance: none;
    border: 1px solid transparent;
    background: transparent;
    color: #cbd5e1;
    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 12.5px;
    font-weight: 500;
    padding: 7px 11px;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  }

  .picker-btn:hover {
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
  }

  .picker-btn.active {
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    border-color: rgba(255, 255, 255, 0.24);
  }

  .picker-btn .num {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10.5px;
    opacity: 0.6;
  }

  .dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    display: inline-block;
    flex-shrink: 0;
  }

  .picker-close {
    appearance: none;
    border: none;
    background: transparent;
    color: #94a3b8;
    font-size: 16px;
    line-height: 1;
    padding: 6px 8px;
    border-radius: 8px;
    cursor: pointer;
  }

  .picker-close:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }

  .picker-fab {
    appearance: none;
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: rgba(15, 23, 42, 0.88);
    color: #f8fafc;
    font-size: 12.5px;
    font-weight: 600;
    padding: 8px 14px;
    border-radius: 999px;
    backdrop-filter: blur(12px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.24);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
</style>
