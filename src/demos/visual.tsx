import { useEffect, useId, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check, Layers, Pause, Play, Sparkles } from 'lucide-react';
import { DemoStack, Hint, usePlayback } from './shared';

export function MeshGradient() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const elapsedRef = useRef(0);
  const [palette, setPalette] = useState(0);
  const [flow, setFlow] = useState(1);
  const [fallback, setFallback] = useState(false);
  const { paused, reduced, speed } = usePlayback();
  const id = useId();
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const gl = el.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) {
      setFallback(true);
      return;
    }
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}');
    gl.compileShader(vs);
    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(
      fs,
      `precision mediump float;uniform vec2 resolution;uniform float time;uniform float palette;void main(){vec2 uv=gl_FragCoord.xy/resolution;float t=time*.24;vec2 p=uv*3.;float f=sin(p.x*1.5+t+sin(p.y*2.-t))*.5+.5;float g=sin(p.y*2.+t*.7+cos(p.x*2.+t))*.5+.5;vec3 a=vec3(.98,.78,.57);vec3 b=vec3(.92,.28,.23);vec3 c=vec3(.48,.42,.73);if(palette>.5){a=vec3(.67,.88,.85);b=vec3(.12,.40,.59);c=vec3(.37,.38,.73);}if(palette>1.5){a=vec3(.90,.91,.70);b=vec3(.25,.49,.37);c=vec3(.67,.72,.36);}vec3 color=mix(mix(a,b,f),c,g*.7);float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);color+=(grain-.5)*.04;gl_FragColor=vec4(color,1.);}`,
    );
    gl.compileShader(fs);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFallback(true);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return;
    }
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const a = gl.getAttribLocation(program, 'a');
    gl.enableVertexAttribArray(a);
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const resolution = gl.getUniformLocation(program, 'resolution'),
      time = gl.getUniformLocation(program, 'time'),
      pal = gl.getUniformLocation(program, 'palette');
    let raf = 0,
      visible = true,
      elapsed = elapsedRef.current,
      last = 0;
    const draw = (now: number) => {
      if (last) elapsed += Math.min(now - last, 50) * 0.001 * flow * speed;
      last = now;
      elapsedRef.current = elapsed;
      const ratio = Math.min(window.devicePixelRatio, 1.5);
      const w = Math.round(el.clientWidth * ratio),
        h = Math.round(el.clientHeight * ratio);
      if (el.width !== w || el.height !== h) {
        el.width = w;
        el.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(resolution, w, h);
      gl.uniform1f(time, reduced ? 2 : elapsed);
      gl.uniform1f(pal, palette);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!paused && !reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      last = 0;
      if (visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      restart();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', restart);
    draw(0);
    const lost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(raf);
      setFallback(true);
    };
    el.addEventListener('webglcontextlost', lost);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', restart);
      el.removeEventListener('webglcontextlost', lost);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [palette, flow, paused, reduced, speed]);
  return (
    <div className="mesh-demo">
      <div className={`shader-window palette-${palette}`}>
        <canvas ref={canvas} aria-label="Animated abstract color field" role="img" />
        <div className="shader-label">
          <strong>flow.</strong>
          <small>{fallback ? 'CSS color fallback' : 'A study in continuous color'}</small>
        </div>
        <span className="shader-corner">01 — ∞</span>
      </div>
      <div className="shader-controls">
        <div className="palette-controls">
          {['Terra', 'Tidal', 'Moss'].map((p, i) => (
            <button
              key={p}
              className={palette === i ? 'active' : ''}
              onClick={() => setPalette(i)}
              aria-pressed={palette === i}
            >
              <i className={`palette-dot palette-${i}`} />
              {p}
            </button>
          ))}
        </div>
        <label htmlFor={id}>
          Flow{' '}
          <input
            id={id}
            type="range"
            min="0.2"
            max="2"
            step="0.1"
            value={flow}
            onChange={(e) => setFlow(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
export function ThinkingOrb() {
  const [state, setState] = useState('Thinking');
  return (
    <DemoStack>
      <div className={`thinking-orb orb-${state.toLowerCase()}`} aria-hidden="true">
        <div className="orb-layer orb-one" />
        <div className="orb-layer orb-two" />
        <div className="orb-layer orb-three" />
        <div className="orb-shine" />
      </div>
      <p className="orb-caption" role="status">
        {state === 'Idle'
          ? 'A little space for your thoughts.'
          : state === 'Thinking'
            ? 'Connecting a few interesting dots…'
            : 'An idea is taking shape.'}
      </p>
      <div className="small-segments">
        {['Idle', 'Thinking', 'Speaking'].map((x) => (
          <button
            className={state === x ? 'active' : ''}
            aria-pressed={state === x}
            key={x}
            onClick={() => setState(x)}
          >
            {x}
          </button>
        ))}
      </div>
    </DemoStack>
  );
}
export function ParticleField() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointer = useRef({ x: -999, y: -999 });
  const [density, setDensity] = useState(110);
  const { paused, reduced } = usePlayback();
  const id = useId();
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const ctx = el.getContext('2d');
    if (!ctx) return;
    let raf = 0,
      visible = true;
    const points = Array.from({ length: density }, (_, i) => ({
      x: ((i * 73 + 17) % 997) / 997,
      y: ((i * 137 + 43) % 991) / 991,
    }));
    const draw = () => {
      const w = el.clientWidth,
        h = el.clientHeight;
      const dpr = Math.min(devicePixelRatio, 2);
      if (el.width !== w * dpr || el.height !== h * dpr) {
        el.width = w * dpr;
        el.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      points.forEach((p) => {
        const x = p.x * w,
          y = p.y * h;
        const dx = x - pointer.current.x,
          dy = y - pointer.current.y;
        const distance = Math.hypot(dx, dy);
        const force = reduced ? 0 : Math.max(0, 1 - distance / 95) * 24;
        ctx.beginPath();
        ctx.arc(
          x + (dx / (distance || 1)) * force,
          y + (dy / (distance || 1)) * force,
          1.5,
          0,
          Math.PI * 2,
        );
        ctx.fillStyle = distance < 110 ? '#ee7a50' : '#869993';
        ctx.fill();
      });
      if (!paused && !reduced && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };
    const restart = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) draw();
    };
    const observer = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      restart();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', restart);
    draw();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', restart);
    };
  }, [density, paused, reduced]);
  return (
    <DemoStack className="particle-demo">
      <div className="particle-window">
        <canvas
          ref={canvas}
          role="img"
          aria-label="Decorative interactive particle field"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
          }}
          onPointerLeave={() => {
            pointer.current = { x: -999, y: -999 };
          }}
        />
      </div>
      <label className="range-label" htmlFor={id}>
        Density
        <input
          id={id}
          type="range"
          min={40}
          max={220}
          step={10}
          value={density}
          onChange={(e) => setDensity(Number(e.target.value))}
        />
        <output>{density}</output>
      </label>
    </DemoStack>
  );
}
export function Aurora() {
  const [tone, setTone] = useState('Northern');
  return (
    <DemoStack className="effect-demo">
      <div className={`aurora-window aurora-${tone.toLowerCase()}`}>
        <span className="aurora-ribbon ribbon-one" />
        <span className="aurora-ribbon ribbon-two" />
        <span className="aurora-ribbon ribbon-three" />
        <div className="aurora-title">
          <h3>here & beyond.</h3>
        </div>
      </div>
      <div className="small-segments">
        {['Northern', 'Rose', 'Dusk'].map((x) => (
          <button
            key={x}
            className={tone === x ? 'active' : ''}
            onClick={() => setTone(x)}
            aria-pressed={tone === x}
          >
            {x}
          </button>
        ))}
      </div>
    </DemoStack>
  );
}
export function GrainGradient() {
  const [grain, setGrain] = useState(30);
  const id = useId();
  const filter = useId().replace(/:/g, '');
  return (
    <DemoStack className="effect-demo">
      <div className="grain-window">
        <svg className="grain-svg" aria-hidden="true" style={{ opacity: grain / 100 }}>
          <filter id={filter}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency=".85"
              numOctaves="3"
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter={`url(#${filter})`} />
        </svg>
        <span>
          Imperfect,
          <br />
          <em>in a good way.</em>
        </span>
      </div>
      <label className="range-label" htmlFor={id}>
        Grain
        <input
          id={id}
          type="range"
          min={0}
          max={80}
          value={grain}
          onChange={(e) => setGrain(Number(e.target.value))}
        />
        <output>{grain}%</output>
      </label>
    </DemoStack>
  );
}
export function BorderBeam() {
  const [playing, setPlaying] = useState(true);
  return (
    <DemoStack>
      <div className={`beam-card ${playing ? '' : 'beam-paused'}`}>
        <span className="beam-track beam-glow" aria-hidden="true" />
        <span className="beam-track" aria-hidden="true" />
        <div className="beam-content">
          <Sparkles size={28} />
          <h3>Something exceptional.</h3>
          <p>A little light goes a long way.</p>
          <button
            onClick={() => setPlaying(!playing)}
            className="beam-action"
            aria-pressed={!playing}
          >
            {playing ? 'Pause the light' : 'Let it shine'}{' '}
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>
    </DemoStack>
  );
}
export function ClickRipple() {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const next = useRef(0);
  const { reduced } = usePlayback();
  const add = (x: number, y: number) =>
    setRipples((r) => [...r.slice(-7), { id: next.current++, x, y }]);
  return (
    <DemoStack>
      <button
        className="ripple-canvas"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          add(
            e.detail ? e.clientX - r.left : r.width / 2,
            e.detail ? e.clientY - r.top : r.height / 2,
          );
        }}
      >
        <span>
          Make a little
          <br />
          <em>ripple.</em>
        </span>
        {ripples.map((p) => (
          <motion.i
            key={p.id}
            className="click-ripple"
            style={{ left: p.x, top: p.y }}
            initial={{ opacity: 0.8, transform: 'translate(-50%, -50%) scale(1)' }}
            animate={{ opacity: 0, transform: `translate(-50%, -50%) scale(${reduced ? 1 : 8})` }}
            transition={{ duration: 0.7 }}
            onAnimationComplete={() => setRipples((r) => r.filter((x) => x.id !== p.id))}
          />
        ))}
      </button>
      <Hint>Click, tap, or press Enter.</Hint>
    </DemoStack>
  );
}
export function GlassSurface() {
  const [blur, setBlur] = useState(14);
  const [offset, setOffset] = useState(0);
  const id = useId();
  const move = useId();
  return (
    <DemoStack className="effect-demo">
      <div className="glass-landscape">
        <span className="glass-sun" />
        <i className="glass-hill hill-one" />
        <i className="glass-hill hill-two" />
        <div
          className="glass-panel"
          style={{ backdropFilter: `blur(${blur}px)`, transform: `translateX(${offset}px)` }}
        >
          <Layers size={25} />
          <h3>
            A different
            <br />
            kind of clarity.
          </h3>
          <span>
            THROUGH A NEW LENS <ArrowUpRight size={15} />
          </span>
        </div>
      </div>
      <div className="glass-controls">
        <label className="range-label" htmlFor={id}>
          Blur
          <input
            id={id}
            type="range"
            min={0}
            max={30}
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
          />
        </label>
        <label className="range-label" htmlFor={move}>
          Position
          <input
            id={move}
            type="range"
            min={-45}
            max={45}
            value={offset}
            onChange={(e) => setOffset(Number(e.target.value))}
          />
        </label>
      </div>
    </DemoStack>
  );
}
