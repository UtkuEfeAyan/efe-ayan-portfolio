/* WebGL2 Shadertoy-style player for Whirlpool Sun (Shadertoy WfcyWS). */

const IMAGE_SHADER = String.raw`/*
    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓

    ▓     🌟  Whirlpool by @YoheiNishitsuji   🌟

    ▓
    ▓  Original x
    ▓  https://x.com/YoheiNishitsuji/status/1945367810097733982

    ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
*/

// modified/forked from using above whirpool code

// noise and galaxy background

float hash1(float x) {
    return fract(sin(x) * 152754.742);
}

float hash2(vec2 x) {
    return hash1(x.x + hash1(x.y));
}

float value(vec2 p, float f)
{
    float bl = hash2(floor(p * f + vec2(0.0, 0.0)));
    float br = hash2(floor(p * f + vec2(1.0, 0.0)));
    float tl = hash2(floor(p * f + vec2(0.0, 1.0)));
    float tr = hash2(floor(p * f + vec2(1.0, 1.0)));

    vec2 fr = fract(p * f);
    fr = (3.0 - 2.0 * fr) * fr * fr;
    float b = mix(bl, br, fr.x);
    float t = mix(tl, tr, fr.x);
    return mix(b, t, fr.y);
}

vec4 galaxyBackground(vec3 ray)
{
    vec2 uv = ray.xy;

    if (abs(ray.x) > 0.5)
        uv.x = ray.z;
    else if (abs(ray.y) > 0.5)
        uv.y = ray.z;

    float brightness = value(uv * 3.0, 100.0);
    float colNoise   = value(uv * 2.0, 20.0);
    brightness = pow(brightness, 256.0);
    brightness = clamp(brightness * 100.0, 0.0, 1.0);

    vec3 stars = brightness *
        mix(vec3(1.0, 0.6, 0.2), vec3(0.2, 0.6, 1.0), colNoise);

    vec4 nebulae = texture(iChannel0, uv * 1.5);
    nebulae.xyz += nebulae.xxx + nebulae.yyy + nebulae.zzz;
    nebulae.xyz *= 0.25;

    nebulae *= nebulae;
    nebulae *= nebulae;
    nebulae *= nebulae;
    nebulae *= nebulae;

    nebulae.xyz += stars;
    return nebulae;
}

// simple rotation

void Rotate(inout vec3 v, vec2 angle)
{
    v.yz = cos(angle.y) * v.yz + sin(angle.y) * vec2(-1.0, 1.0) * v.zy;
    v.xz = cos(angle.x) * v.xz + sin(angle.x) * vec2(-1.0, 1.0) * v.zx;
}

// whirl field

vec3 whirlField(vec2 p, float time)
{
    vec2 p01 = p * 0.5 + 0.5;

    float phase = 0.5 + 0.5 * sin(time * 0.6);
    vec3 colA = vec3(0.9, 0.35, 0.4);
    vec3 colB = vec3(0.2, 0.75, 1.3);
    vec3 ink  = mix(colA, colB, phase);

    vec4 whirl = vec4(0.0);

    float e = 0.0;
    float R = 1.0;
    float s;

    vec3 q  = vec3(0.0, -1.0, -1.0);
    vec3 pw;
    vec3 dv = vec3((-p01.yx * 0.9 + vec2(0.25, 1.5)), 1.0);

    for (float i = 0.0; i < 110.0; i++)
    {
        whirl.rgb += 0.01 - exp(-e * 400.0) * 0.025 * ink;

        pw = q += dv * e * R * 0.09;
        R = length(pw + vec3(p * 0.23, 0.0));

        pw = vec3(
            log(R) - time * 0.5,
            exp(-pw.x / R - pw.z / R),
            atan(pw.x - 0.4, pw.y)
        );

        e = --pw.y;

        for (s = 4.0; s < 200.0; s += s) {
            e += dot(sin(pw.zx * s), cos(pw.xx * s + time)) / s;
        }
    }

    return whirl.rgb;
}

// warm sun color from whirl

vec3 sunColorFromWhirl(vec2 p, float time)
{
    float t = time * 0.35;

    vec3 w1 = whirlField(p, t);
    vec3 w2 = whirlField(p * 1.25 + vec2(0.4, -0.3), t * 1.2);

    float d1 = clamp(dot(w1, vec3(0.3333)), 0.0, 1.0);
    float d2 = clamp(dot(w2, vec3(0.3333)), 0.0, 1.0);

    vec3 c1 = mix(vec3(0.75, 0.10, 0.02),
                  vec3(1.00, 0.45, 0.05),
                  d1);

    vec3 c2 = mix(vec3(1.00, 0.45, 0.05),
                  vec3(1.30, 1.05, 0.40),
                  d2);

    return c1 * 0.6 + c2 * 0.7;
}

// main

void mainImage(out vec4 fragColor, in vec2 fragCoord)
{
    float aspect = iResolution.x / iResolution.y;
    vec2 uvNdc   = fragCoord / iResolution.xy;

    // mouse controls: x = temperature, y = radius
    vec2 m = iMouse.xy / iResolution.xy;
    if (iMouse.z < 0.0) m = vec2(0.5, 0.5);   // default center if no mouse
    float tempCtrl  = clamp(m.x, 0.0, 1.0);
    float sizeCtrl  = clamp(m.y, 0.0, 1.0);

    // centered coords
    vec2 p = uvNdc * 2.0 - 1.0;
    p.x *= aspect;
    float rScreen = length(p);

    // galaxy background
    vec3 ray = normalize(vec3(p, 1.5));
    vec2 camAngle = vec2(iTime * 0.02, 0.2);
    camAngle.x += (m.x - 0.5) * 3.14159 * 0.5;
    camAngle.y += (m.y - 0.5) * 3.14159 * 0.5;
    Rotate(ray, camAngle);

    vec3 color = galaxyBackground(ray).rgb;

    // dynamic sphere radius
    float sphereRadius = mix(0.30, 0.60, sizeCtrl);
    float insideSphere = step(rScreen, sphereRadius);

    // bloom color depends on temperature (mouse x)
    vec3 bloomColCool = vec3(0.9, 0.3, 0.05);
    vec3 bloomColHot  = vec3(1.3, 1.1, 0.5);
    vec3 bloomCol     = mix(bloomColCool, bloomColHot, tempCtrl);

    float bloom = 1.0 - smoothstep(sphereRadius * 0.95,
                                   sphereRadius * 2.0,
                                   rScreen);
    bloom = pow(max(bloom, 0.0), 1.8);
    color += bloomCol * bloom * (1.0 - insideSphere);

    // whirl sun sphere
    if (insideSphere > 0.5)
    {
        vec2 su = p / sphereRadius;
        float r2 = dot(su, su);
        float z  = sqrt(max(0.0, 1.0 - r2));

        float rotH = 6.283185 * (m.x - 0.5) * 0.5 + iTime * 0.25;
        float rotV = 3.141592 * (m.y - 0.5) * 0.6 + 0.1;

        mat3 rotY = mat3(
            cos(rotH), 0.0, sin(rotH),
            0.0,       1.0, 0.0,
           -sin(rotH), 0.0, cos(rotH)
        );

        mat3 rotX = mat3(
            1.0, 0.0,        0.0,
            0.0, cos(rotV), -sin(rotV),
            0.0, sin(rotV),  cos(rotV)
        );

        vec3 rotatedPos = rotY * rotX * vec3(su, z);

        vec3 col = sunColorFromWhirl(rotatedPos.xy, iTime);

        // temperature also scales brightness
        float heatScale = mix(0.8, 1.4, tempCtrl);
        col *= heatScale;

        float bump  = clamp(dot(col, vec3(0.3333)), 0.0, 1.0);
        float zBump = mix(z * 0.6 + 0.4, 1.0, bump);
        float spec  = pow(max(zBump, 0.0), 24.0) * 0.6;
        col += spec * vec3(1.3, 1.2, 1.0);

        col *= 2.0;
        col = pow(col, vec3(0.9));

        color = col;
    }

    fragColor = vec4(color, 1.0);
}
`;

const VERT_SRC = `#version 300 es
in vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_SRC = `#version 300 es
precision highp float;
precision highp int;
out vec4 outColor;
uniform vec3 iResolution;
uniform float iTime;
uniform vec4 iMouse;
uniform sampler2D iChannel0;

${IMAGE_SHADER}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  outColor = color;
}
`;

function fail(message) {
  const el = document.createElement('div');
  el.className = 'error';
  el.textContent = message;
  document.body.appendChild(el);
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh) || 'Shader compile failed';
    gl.deleteShader(sh);
    throw new Error(log);
  }
  return sh;
}

function hash2(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x, y) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(ix, iy);
  const b = hash2(ix + 1, iy);
  const c = hash2(ix, iy + 1);
  const d = hash2(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm(x, y) {
  let v = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < 5; i++) {
    v += a * valueNoise(x * f, y * f);
    f *= 2.02;
    a *= 0.5;
  }
  return v;
}

function makeNebulaTexture(gl, size) {
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = x / size;
      const v = y / size;
      const n0 = fbm(u * 6.0, v * 6.0);
      const n1 = fbm(u * 6.0 + 17.2, v * 6.0 + 9.1);
      const n2 = fbm(u * 6.0 + 4.7, v * 6.0 + 31.3);
      const i = (y * size + x) * 4;
      data[i] = Math.min(255, n0 * 255);
      data[i + 1] = Math.min(255, n1 * 255);
      data[i + 2] = Math.min(255, n2 * 255);
      data[i + 3] = 255;
    }
  }
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return tex;
}

function start() {
  if (window.self !== window.top) {
    document.documentElement.classList.add('in-iframe');
  }

  const canvas = document.getElementById('gl');
  const hud = document.getElementById('hud');
  const gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  });
  if (!gl) {
    fail('WebGL2 is required to run this shader.');
    return;
  }

  let program;
  try {
    const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC);
    program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  } catch (err) {
    fail(String(err.message || err));
    return;
  }

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1, 1, -1, -1, 1,
    -1, 1, 1, -1, 1, 1,
  ]), gl.STATIC_DRAW);
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  const loc = gl.getAttribLocation(program, 'aPos');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const nebula = makeNebulaTexture(gl, 256);
  gl.useProgram(program);
  gl.uniform1i(gl.getUniformLocation(program, 'iChannel0'), 0);

  const uResolution = gl.getUniformLocation(program, 'iResolution');
  const uTime = gl.getUniformLocation(program, 'iTime');
  const uMouse = gl.getUniformLocation(program, 'iMouse');

  const mouse = { x: 0, y: 0, z: -1, w: 0, down: false };
  let visible = true;
  let iTimeMs = 0;
  let last = performance.now();

  function cssToShader(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / Math.max(rect.width, 1));
    const y = (rect.bottom - clientY) * (canvas.height / Math.max(rect.height, 1));
    return { x, y };
  }

  function onDown(e) {
    mouse.down = true;
    const p = cssToShader(e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
    mouse.z = p.x;
    mouse.w = p.y;
    hud?.classList.add('fade');
    canvas.setPointerCapture?.(e.pointerId);
  }

  function onMove(e) {
    if (!mouse.down) return;
    const p = cssToShader(e.clientX, e.clientY);
    mouse.x = p.x;
    mouse.y = p.y;
  }

  function onUp(e) {
    mouse.down = false;
    mouse.z = -Math.abs(mouse.z || 1);
    if (e.pointerId != null) canvas.releasePointerCapture?.(e.pointerId);
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);
  canvas.addEventListener('pointerleave', (e) => {
    if (mouse.down) onUp(e);
  });

  const io = new IntersectionObserver((entries) => {
    visible = entries.some((en) => en.isIntersecting);
  }, { threshold: 0.05 });
  io.observe(canvas);

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cssW = Math.max(1, window.innerWidth);
    const cssH = Math.max(1, window.innerHeight);
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const w0 = Math.max(1, Math.floor(cssW * dpr));
    const h0 = Math.max(1, Math.floor(cssH * dpr));
    const maxPixels = 1280 * 720;
    const pixels = w0 * h0;
    const scale = pixels > maxPixels ? Math.sqrt(maxPixels / pixels) : 1;
    const w = Math.max(1, Math.floor(w0 * scale));
    const h = Math.max(1, Math.floor(h0 * scale));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (document.hidden || !visible) {
      last = now;
      return;
    }
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    iTimeMs += dt * 1000;
    resize();

    gl.useProgram(program);
    gl.bindVertexArray(vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, nebula);
    gl.uniform3f(uResolution, canvas.width, canvas.height, 1);
    gl.uniform1f(uTime, iTimeMs / 1000);
    gl.uniform4f(uMouse, mouse.x, mouse.y, mouse.z, mouse.w);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  setTimeout(() => hud?.classList.add('fade'), 5000);
  resize();
  requestAnimationFrame(frame);
}

start();
