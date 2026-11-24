import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Gráficos 3D: colunas, pizza e grade (itens x notas).
// Cada resposta nova cai como uma esfera de luz na própria coluna.
// itens: [{ chave, nome, n, rotulo, cor, curto, x?, z? }]
const LARGURA = 0.9;
const PASSO = 1.28;
const calmo = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function prisma(l = LARGURA, p = LARGURA, raio = 0.14) {
  const s = new THREE.Shape();
  const [a, b] = [l / 2, p / 2];
  s.moveTo(-a + raio, -b);
  s.lineTo(a - raio, -b); s.quadraticCurveTo(a, -b, a, -b + raio);
  s.lineTo(a, b - raio); s.quadraticCurveTo(a, b, a - raio, b);
  s.lineTo(-a + raio, b); s.quadraticCurveTo(-a, b, -a, b - raio);
  s.lineTo(-a, -b + raio); s.quadraticCurveTo(-a, -b, -a + raio, -b);
  const g = new THREE.ExtrudeGeometry(s, { depth: 1, bevelEnabled: false, curveSegments: 6 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function setor(ini, fim, rExt, rInt, alt) {
  const s = new THREE.Shape();
  const passos = Math.max(2, Math.ceil((fim - ini) * 20));
  for (let i = 0; i <= passos; i++) { const a = ini + ((fim - ini) * i) / passos; s[i ? 'lineTo' : 'moveTo'](Math.cos(a) * rExt, Math.sin(a) * rExt); }
  for (let i = passos; i >= 0; i--) { const a = ini + ((fim - ini) * i) / passos; s.lineTo(Math.cos(a) * rInt, Math.sin(a) * rInt); }
  const g = new THREE.ExtrudeGeometry(s, { depth: alt, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 4 });
  g.rotateX(-Math.PI / 2);
  return g;
}

function texturaPiso() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, 'rgba(57,135,229,0.30)'); g.addColorStop(0.55, 'rgba(57,135,229,0.10)'); g.addColorStop(1, 'rgba(57,135,229,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

export default function Grafico3D({ tipo, itens, colunas = [], linhas = [], descricao, destaque, onDestaque, onFalha }) {
  const raiz = useRef(null);
  const cena = useRef(null);
  const cb = useRef({});
  cb.current = { onDestaque, onFalha };

  useEffect(() => {
    const el = raiz.current;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (e) {
      cb.current.onFalha?.();
      return undefined;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    renderer.domElement.className = 'ac3d-tela';
    el.prepend(renderer.domElement);

    const scene = new THREE.Scene();
    const pm = new THREE.PMREMGenerator(renderer);
    const ambiente = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = ambiente;
    scene.environmentIntensity = 0.28;
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
    scene.add(new THREE.HemisphereLight(0xcfe2ff, 0x0b1224, 0.45));
    const sol = new THREE.DirectionalLight(0xffffff, 2.1);
    sol.position.set(5, 10, 7);
    sol.castShadow = true;
    sol.shadow.mapSize.set(1024, 1024);
    sol.shadow.radius = 5;
    sol.shadow.bias = -0.0006;
    scene.add(sol);

    const piso = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.42 }));
    piso.rotation.x = -Math.PI / 2; piso.receiveShadow = true;
    scene.add(piso);
    const texPiso = texturaPiso();
    const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: texPiso, transparent: true, depthWrite: false }));
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.004;
    scene.add(halo);

    const controles = new OrbitControls(camera, renderer.domElement);
    Object.assign(controles, { enableDamping: true, dampingFactor: 0.08, enableZoom: false, enablePan: false, minPolarAngle: 0.35, maxPolarAngle: 1.5, rotateSpeed: 0.6 });
    renderer.domElement.style.touchAction = 'pan-y';

    const E = {
      scene, camera, controles, sol, halo, raio: new THREE.Raycaster(), geo: prisma(tipo === 'grade' ? 0.74 : LARGURA, tipo === 'grade' ? 0.74 : LARGURA),
      geoGota: new THREE.SphereGeometry(0.17, 20, 16), geoAnel: new THREE.RingGeometry(0.42, 0.5, 40),
      pecas: new Map(), gotas: [], aneis: [], camada: el.querySelector('.ac3d-rotulos'), topo: 3, primeira: true, tempo: 0, mexeu: false, raioCena: 4, alvoCam: new THREE.Vector3(0, 1.2, 0), dir: new THREE.Vector3(0.25, 0.55, 1).normalize()
    };
    cena.current = E;

    const enquadrar = () => {
      const w = el.clientWidth || 1, h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const fv = (camera.fov * Math.PI) / 180;
      const fh = 2 * Math.atan(Math.tan(fv / 2) * camera.aspect);
      const dist = Math.max((E.meiaLargura || 3) / Math.tan(fh / 2), (E.meiaAltura || 2) / Math.tan(fv / 2)) * 1.04 + (E.meiaProf || 0.6);
      const dir = E.mexeu ? camera.position.clone().sub(controles.target).normalize() : E.dir;
      controles.target.copy(E.alvoCam);
      camera.position.copy(E.alvoCam).addScaledVector(dir, dist);
      controles.update();
    };
    E.enquadrar = enquadrar;
    const ro = new ResizeObserver(enquadrar);
    ro.observe(el);
    controles.addEventListener('start', () => { E.mexeu = true; });

    // passar o mouse / tocar
    const ponteiro = new THREE.Vector2();
    const achar = (ev) => {
      const r = renderer.domElement.getBoundingClientRect();
      ponteiro.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      E.raio.setFromCamera(ponteiro, camera);
      const hit = E.raio.intersectObjects([...E.pecas.values()].map((p) => p.malha))[0];
      const k = hit?.object.userData.chave ?? null;
      renderer.domElement.style.cursor = k ? 'pointer' : 'grab';
      cb.current.onDestaque?.(k);
    };
    const sair = () => cb.current.onDestaque?.(null);
    renderer.domElement.addEventListener('pointermove', achar);
    renderer.domElement.addEventListener('pointerleave', sair);

    const v = new THREE.Vector3();
    const posicionar = (no, x, y, z) => {
      v.set(x, y, z).project(camera);
      const w = el.clientWidth, h = el.clientHeight;
      if (tipo !== 'pizza') no.style.opacity = '';
      no.style.transform = `translate(-50%, -50%) translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
    };

    let quadro = 0, antes = performance.now();
    const girar = (agora) => {
      quadro = requestAnimationFrame(girar);
      const dt = Math.min(0.05, (agora - antes) / 1000);
      antes = agora; E.tempo += dt;
      const parado = calmo();

      E.pecas.forEach((p) => {
        if (p.espera && E.tempo >= p.espera.em) { p.alvo = p.espera.alvo; p.vel += p.espera.impulso; p.espera = null; }
        if (E.tempo < p.atraso) return;
        if (parado) { p.valor = p.alvo; p.vel = 0; } else {
          p.vel += (p.alvo - p.valor) * 90 * dt;
          p.vel *= Math.exp(-11 * dt);
          p.valor += p.vel * dt;
        }
        if (tipo !== 'pizza') {
          p.malha.scale.y = Math.max(0.015, p.valor);
          if (p.rotulo) posicionar(p.rotulo, p.malha.position.x, Math.max(0, p.valor) + 0.32, p.malha.position.z);
          if (p.nome) posicionar(p.nome, p.malha.position.x, -0.12, p.malha.position.z + 0.95);
        }
        p.brilho += ((p.aceso ? 0.55 : 0.1) - p.brilho) * Math.min(1, dt * 12);
        p.malha.material.emissiveIntensity = p.brilho;
        p.malha.material.opacity += ((E.algum && !p.aceso ? 0.38 : 1) - p.malha.material.opacity) * Math.min(1, dt * 12);
      });

      if (tipo === 'pizza') {
        let ini = Math.PI / 2;
        E.pecas.forEach((p) => {
          const ang = Math.max(0, p.valor) * Math.PI * 2;
          const fim = ini - ang;
          if (Math.abs((p.ini ?? 99) - ini) > 1e-4 || Math.abs((p.fim ?? 99) - fim) > 1e-4) {
            p.ini = ini; p.fim = fim;
            p.malha.geometry.dispose();
            const folga = Math.min(0.02, ang / 4);
            p.malha.geometry = ang > 0.002 ? setor(fim + folga, ini - folga, 2.4, 1.05, 0.75) : new THREE.BufferGeometry();
          }
          const meio = (ini + fim) / 2;
          p.sobe += ((p.aceso ? 0.28 : 0) - p.sobe) * Math.min(1, dt * 10);
          p.malha.position.set(0, 0.05 + p.sobe, 0);
          if (p.rotulo) { p.rotulo.style.opacity = ang > 0.12 ? 1 : 0; posicionar(p.rotulo, Math.cos(meio) * 1.75, 1.02 + p.sobe, -Math.sin(meio) * 1.75); }
          if (p.nome) { p.nome.style.opacity = ang > 0.02 ? 1 : 0; posicionar(p.nome, Math.cos(meio) * 3.15, 0.35, -Math.sin(meio) * 3.15); }
          ini = fim;
        });
      }

      E.gotas = E.gotas.filter((g) => {
        if (E.tempo < g.em) return true;
        g.malha.visible = true;
        g.vel += 16 * dt;
        g.malha.position.y -= g.vel * dt;
        const chao = tipo === 'pizza' ? 0.95 : Math.max(0.1, g.peca.valor);
        if (g.malha.position.y > chao) return true;
        const anel = new THREE.Mesh(E.geoAnel, new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, depthWrite: false, side: THREE.DoubleSide }));
        anel.rotation.x = -Math.PI / 2;
        anel.position.copy(g.malha.position); anel.position.y = chao + 0.04;
        scene.add(anel); E.aneis.push({ malha: anel, vida: 0 });
        scene.remove(g.malha); g.malha.material.dispose();
        return false;
      });
      E.aneis = E.aneis.filter((a) => {
        a.vida += dt * 1.7;
        a.malha.scale.setScalar(1 + a.vida * 2.2);
        a.malha.material.opacity = Math.max(0, 1 - a.vida);
        if (a.vida < 1) return true;
        scene.remove(a.malha); a.malha.material.dispose();
        return false;
      });

      E.extras?.forEach((x) => posicionar(x.no, x.x, x.y, x.z));
      // respiro lento da câmera até a pessoa girar por conta própria
      if (!E.mexeu && !parado) {
        const a = Math.sin(E.tempo * 0.28) * 0.11;
        const d = camera.position.distanceTo(controles.target);
        camera.position.copy(controles.target).addScaledVector(E.dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), a), d);
        camera.lookAt(controles.target);
      } else controles.update();
      renderer.render(scene, camera);
    };
    quadro = requestAnimationFrame(girar);

    return () => {
      cancelAnimationFrame(quadro);
      ro.disconnect();
      controles.dispose();
      renderer.domElement.removeEventListener('pointermove', achar);
      renderer.domElement.removeEventListener('pointerleave', sair);
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      E.geo.dispose(); E.geoGota.dispose(); E.geoAnel.dispose();
      texPiso.dispose(); ambiente.dispose(); pm.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      E.camada.replaceChildren();
      cena.current = null;
    };
  }, [tipo]);

  // Dados novos: atualiza alturas, rótulos e solta as esferas
  useEffect(() => {
    const E = cena.current;
    if (!E) return;
    const total = itens.reduce((a, i) => a + i.n, 0);
    const maior = Math.max(1, ...itens.map((i) => i.n));
    const nCol = tipo === 'grade' ? colunas.length : itens.length;
    const larg = Math.max(1, nCol - 1) * (tipo === 'grade' ? 1 : PASSO);
    const prof = tipo === 'grade' ? Math.max(0, linhas.length - 1) * 1.15 : 0;
    E.topo = tipo === 'grade' ? 2.2 : Math.min(5.2, Math.max(2.6, larg * 0.5));

    const no = (classe, texto) => {
      const d = document.createElement('div');
      d.className = classe; d.textContent = texto; d.style.opacity = 0;
      E.camada.append(d);
      return d;
    };

    const vivas = new Set(itens.map((i) => i.chave));
    E.pecas.forEach((p, k) => {
      if (vivas.has(k)) return;
      E.scene.remove(p.malha); p.malha.material.dispose(); p.rotulo?.remove(); p.nome?.remove(); E.pecas.delete(k);
    });

    let novas = 0;
    itens.forEach((it, i) => {
      let p = E.pecas.get(it.chave);
      const alvo = tipo === 'pizza' ? (total ? it.n / total : 0) : (it.n / maior) * E.topo;
      if (!p) {
        const mat = new THREE.MeshPhysicalMaterial({ color: it.cor, emissive: it.cor, emissiveIntensity: 0.1, roughness: 0.32, metalness: 0.05, clearcoat: 0.25, clearcoatRoughness: 0.4, transparent: true });
        const malha = new THREE.Mesh(tipo === 'pizza' ? new THREE.BufferGeometry() : E.geo, mat);
        malha.castShadow = true; malha.receiveShadow = true;
        malha.userData.chave = it.chave;
        if (tipo !== 'pizza') malha.scale.y = 0.015;
        E.scene.add(malha);
        p = { malha, valor: 0, vel: 0, brilho: 0.1, sobe: 0, n: it.n, atraso: E.tempo + (E.primeira ? i * (tipo === 'grade' ? 0.018 : 0.06) : 0) };
        if (tipo !== 'grade') p.rotulo = no('ac3d-valor', '');
        if (tipo !== 'grade') p.nome = no(`ac3d-nome ${it.curto ? 'ac3d-chave' : ''}`, '');
        p.alvo = alvo;
        E.pecas.set(it.chave, p);
      } else {
        const delta = it.n - p.n;
        if (delta > 0 && novas < 10 && delta <= 5 && !calmo()) {
          const queda = tipo === 'grade' ? 3.4 : E.topo + 2.4;
          for (let k = 0; k < delta && novas < 10; k++, novas++) {
            const g = new THREE.Mesh(E.geoGota, new THREE.MeshStandardMaterial({ color: 0xfff1c4, emissive: 0xffc53d, emissiveIntensity: 2.2 }));
            g.visible = false;
            const meio = p.ini !== undefined ? (p.ini + p.fim) / 2 : 0;
            if (tipo === 'pizza') g.position.set(Math.cos(meio) * 1.75, 4.6, -Math.sin(meio) * 1.75);
            else g.position.set(p.malha.position.x, queda, p.malha.position.z);
            E.scene.add(g);
            E.gotas.push({ malha: g, peca: p, vel: 1.5, em: E.tempo + k * 0.18 });
          }
          p.espera = { em: E.tempo + 0.62, alvo, impulso: tipo === 'pizza' ? 0 : -2.4 };
        } else if (p.espera) p.espera.alvo = alvo;
        else p.alvo = alvo;
        p.n = it.n;
      }
      p.malha.material.color.set(it.cor);
      p.malha.material.emissive.set(it.cor);
      if (tipo === 'colunas') p.malha.position.set((i - (nCol - 1) / 2) * PASSO, 0, 0);
      if (tipo === 'grade') p.malha.position.set((it.x - (nCol - 1) / 2) * 1, 0, (it.z - (linhas.length - 1) / 2) * 1.15);
      if (p.rotulo) p.rotulo.textContent = it.rotulo;
      if (p.nome) p.nome.textContent = it.curto || it.nome;
    });
    E.primeira = false;

    E.extras?.forEach((x) => x.no.remove());
    E.extras = [];
    if (tipo === 'grade') {
      colunas.forEach((c, i) => E.extras.push({ no: no('ac3d-valor', c), x: i - (nCol - 1) / 2, y: -0.1, z: prof / 2 + 0.95 }));
      linhas.forEach((l, i) => E.extras.push({ no: no('ac3d-nome ac3d-chave', l), x: -larg / 2 - 0.95, y: 0, z: (i - (linhas.length - 1) / 2) * 1.15 }));
    }

    if (tipo === 'pizza') { E.meiaLargura = 3.9; E.meiaAltura = 2.5; E.meiaProf = 1.4; E.alvoCam.set(0, 0.3, 0); E.dir.set(0, 0.95, 1).normalize(); E.halo.scale.setScalar(13); }
    else if (tipo === 'grade') { E.meiaLargura = larg / 2 + 1.7; E.meiaAltura = 1.6 + prof * 0.36; E.meiaProf = prof / 2; E.alvoCam.set(0, 0.5, 0); E.dir.set(0.42, 0.72, 1).normalize(); E.halo.scale.set(larg + 9, prof + 9, 1); }
    else { E.meiaLargura = larg / 2 + 1.15; E.meiaAltura = E.topo / 2 + 1.05; E.meiaProf = 0.6; E.alvoCam.set(0, E.topo / 2 - 0.15, 0); E.dir.set(0.18, 0.2, 1).normalize(); E.halo.scale.set(larg + 9, 9, 1); }
    const sh = Math.max(E.meiaLargura + 1, E.topo + 2, prof);
    Object.assign(E.sol.shadow.camera, { left: -sh, right: sh, top: sh, bottom: -sh, near: 0.5, far: 60 });
    E.sol.shadow.camera.updateProjectionMatrix();
    const assinatura = `${nCol}|${linhas.length}|${tipo}`;
    if (E.assinatura !== assinatura) { E.assinatura = assinatura; E.enquadrar(); }
  }, [itens, colunas, linhas, tipo]);

  useEffect(() => {
    const E = cena.current;
    if (!E) return;
    E.algum = Boolean(destaque);
    E.pecas.forEach((p, k) => {
      p.aceso = Boolean(destaque) && (k === destaque || k.startsWith(`${destaque}|`));
      p.rotulo?.classList.toggle('ac3d-apagado', E.algum && !p.aceso);
      p.nome?.classList.toggle('ac3d-aceso', p.aceso);
    });
  }, [destaque, itens]);

  return (
    <div ref={raiz} className="ac3d" role="img" aria-label={descricao}>
      <div className="ac3d-rotulos" aria-hidden="true" />
    </div>
  );
}
