import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BULLET_SPEED,
  COIN_SIZE,
  POWERUP_SIZE,
  SCROLL_SPEED,
  WEAPON_DURATION,
  STARTER_COINS,
  LEVELS,
  BOSS_CONFIG,
  THEMES,
  COUNTRIES,
  WEAPONS,
  PLANE_COLORS,
  UPGRADES,
  DEFAULT_USER,
  TRANSLATIONS,
  PLANE_WIDTH,
  PLANE_HEIGHT,
  PICKUP_RADII
} from './game/config';

function checkPickupCollision(
  planeX: number,
  planeY: number,
  planeWidth: number,
  planeHeight: number,
  itemX: number,
  itemY: number,
  itemSize: number,
  pickupRadius: number
): boolean {
  const planeCenterX = planeX + planeWidth / 2;
  const planeCenterY = planeY + planeHeight / 2;
  const itemCenterX = itemX + itemSize / 2;
  const itemCenterY = itemY + itemSize / 2;
  const dx = planeCenterX - itemCenterX;
  const dy = planeCenterY - itemCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < pickupRadius;
}

function SoundControl({ sound, muted, setMuted, t, className = '', size = 'md' }) {
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolume] = useState(() => sound.getMasterVolume());
  useEffect(() => {
    if (showVolume) setVolume(sound.getMasterVolume());
  }, [showVolume, sound]);
  const btnClass = size === 'sm'
    ? 'w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-xl'
    : 'w-12 h-12 rounded-full bg-white/80 hover:bg-white flex items-center justify-center text-2xl transition-transform hover:scale-110';
  return (
    <div
      className={`relative ${className}`}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <button
        type="button"
        onClick={() => { sound.resume(); sound.toggleMute(); setMuted(sound.isMuted()); }}
        className={btnClass}
        title={muted ? 'Unmute' : 'Mute'}
        aria-label={muted ? 'Unmute' : 'Mute'}
      >
        {muted ? '🔇' : '🔊'}
      </button>
      {showVolume && (
        <div className="absolute right-0 top-full mt-1 p-3 rounded-xl bg-black/85 shadow-xl border border-white/20 min-w-[140px] z-50">
          <p className="text-white text-xs font-bold mb-2">{t.volume}</p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { const v = Math.max(0, volume - 0.1); sound.setMasterVolume(v); setVolume(v); }}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white font-bold text-lg leading-none"
              aria-label="-"
            >−</button>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round(volume * 100)}
              onChange={e => { const v = Number(e.target.value) / 100; sound.setMasterVolume(v); setVolume(v); }}
              className="flex-1 h-2 rounded-full accent-sky-400"
            />
            <button
              type="button"
              onClick={() => { const v = Math.min(1, volume + 0.1); sound.setMasterVolume(v); setVolume(v); }}
              className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 text-white font-bold text-lg leading-none"
              aria-label="+"
            >+</button>
          </div>
          <p className="text-white/80 text-xs mt-1 text-center">{Math.round(volume * 100)}%</p>
        </div>
      )}
    </div>
  );
}
import { GameCanvas } from './components/GameCanvas';
import { ErrorBoundary } from './components/ErrorBoundary';
import { getSoundManager } from './game/sounds';
import { ParticleSystem } from './game/particles';

export default function PlaneGame() {
  const [gameState, setGameState] = useState('menu');
  const [lang, setLang] = useState('he');
  const [playerCountry, setPlayerCountry] = useState('IL');
  const [playerName, setPlayerName] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState('register');
  const [authError, setAuthError] = useState('');
  const [userData, setUserData] = useState(null);
  const [selectedColor, setSelectedColor] = useState(PLANE_COLORS[0]);
  const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
  const [countryLeaderboard, setCountryLeaderboard] = useState([]);
  const [leaderboardTab, setLeaderboardTab] = useState('global');
  
  const [gameWidth] = useState(800);
  const [gameHeight] = useState(500);
  const [planeX, setPlaneX] = useState(100);
  const [planeY, setPlaneY] = useState(250);
  const [bullets, setBullets] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [coins, setCoins] = useState([]);
  const [powerups, setPowerups] = useState([]);
  const [hearts, setHearts] = useState([]);
  const [bombs, setBombs] = useState(0);
  const [bombPickups, setBombPickups] = useState([]);
  const [shieldPickups, setShieldPickups] = useState([]);
  const [shieldActive, setShieldActive] = useState(false);
  const [shieldTimer, setShieldTimer] = useState(0);
  const [currentWeapon, setCurrentWeapon] = useState('basic');
  const [weaponTimer, setWeaponTimer] = useState(0);
  const [money, setMoney] = useState(0);
  const [points, setPoints] = useState(0);
  const [health, setHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [bgOffset, setBgOffset] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [levelTimer, setLevelTimer] = useState(0);
  const [bossActive, setBossActive] = useState(false);
  const [boss, setBoss] = useState(null);
  const [bossBullets, setBossBullets] = useState([]);
  const [enemyBullets, setEnemyBullets] = useState([]);
  const [bombFlash, setBombFlash] = useState(false);
  const [muted, setMuted] = useState(() => (typeof window !== 'undefined' ? getSoundManager().isMuted() : false));
  const [levelOverlay, setLevelOverlay] = useState(null);
  const [bossWarningOverlay, setBossWarningOverlay] = useState(false);
  const [screenFade, setScreenFade] = useState(true);
  
  const keysPressed = useRef({});
  const gameLoopRef = useRef();
  const levelStartRef = useRef(0);
  const weaponStartRef = useRef(0);
  const shieldStartRef = useRef(0);
  const healthRef = useRef(100);
  const particleSystemRef = useRef(new ParticleSystem());
  const lastTimeRef = useRef(0);
  
  const t = TRANSLATIONS[lang];

  // Simple storage wrapper: uses window.storage if available, otherwise falls back to localStorage
  const storage = {
    get: async (key, global = false) => {
      try {
        if (typeof window !== 'undefined' && (window as any).storage?.get) {
          return await (window as any).storage.get(key, global);
        }
        const value = window.localStorage.getItem(key);
        return value ? { value } : null;
      } catch {
        return null;
      }
    },
    set: async (key, value, global = false) => {
      if (typeof window !== 'undefined' && (window as any).storage?.set) {
        return (window as any).storage.set(key, value, global);
      }
      window.localStorage.setItem(key, value);
    }
  };
  const sanitizeName = (n) => n.replace(/[^a-zA-Z0-9\u0590-\u05FF ]/g, '').trim().slice(0, 15);
  const createGuestUser = () => {
    const suffix = Math.floor(Math.random() * 9000 + 1000);
    return { ...DEFAULT_USER, name: `Guest${suffix}`, password: '', isGuest: true };
  };

  useEffect(() => {
    if (gameState === 'menu') {
      sound.init();
      if (!sound.isMuted()) sound.playBackgroundMusic('menu');
      return () => { sound.stopMusic(); };
    }
  }, [gameState]);

  // Fade transition when switching screens (0.3s)
  useEffect(() => {
    setScreenFade(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setScreenFade(true));
    });
    return () => cancelAnimationFrame(id);
  }, [gameState]);

  useEffect(() => {
    fetch('https://ipapi.co/json/').then(r => r.json()).then(d => {
      const c = d.country_code;
      if (COUNTRIES.find(x => x.code === c)) setPlayerCountry(c);
      if (c === 'IL') setLang('he');
      else if (c === 'BR' || c === 'PT') setLang('pt');
      else if (c === 'ES' || c === 'MX' || c === 'AR') setLang('es');
      else setLang('en');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const loadBoards = async () => {
      try {
        const g = await storage.get('plane-global-lb', true);
        if (g?.value) setGlobalLeaderboard(JSON.parse(g.value));
        const c = await storage.get(`plane-country-${playerCountry}`, true);
        if (c?.value) setCountryLeaderboard(JSON.parse(c.value));
      } catch (e) {}
    };
    loadBoards();
  }, [playerCountry]);

  const handleAuth = async () => {
    const name = sanitizeName(playerName);
    if (name.length < 2 || password.length < 4) return;
    setAuthError('');
    
    const key = `plane-user-${name.toLowerCase()}`;
    let existingUser = null;
    
    try {
      const result = await storage.get(key);
      if (result?.value) existingUser = JSON.parse(result.value);
    } catch (e) {
      // Key doesn't exist - that's ok for registration
    }
    
    try {
      if (authMode === 'register') {
        if (existingUser) { setAuthError(t.userExists); return; }
        const newUser = { ...DEFAULT_USER, name, password };
        await storage.set(key, JSON.stringify(newUser));
        setUserData(newUser);
        setGameState('lobby');
      } else {
        if (!existingUser) { setAuthError(t.userNotFound); return; }
        if (existingUser.password !== password) { setAuthError(t.wrongPassword); return; }
        const migratedUser = existingUser.odometer >= STARTER_COINS
          ? existingUser
          : { ...existingUser, odometer: STARTER_COINS };
        if (migratedUser !== existingUser) {
          await storage.set(key, JSON.stringify(migratedUser));
        }
        setUserData(migratedUser);
        setGameState('lobby');
      }
    } catch (e) { setAuthError(t?.wrongPassword || 'Storage error'); }
  };

  const getUpgradeCost = (key, lvl) => Math.floor(UPGRADES[key].baseCost * Math.pow(UPGRADES[key].costMult, lvl));

  const buyUpgrade = async (key) => {
    if (!userData || userData.isGuest) return;
    const lvl = userData.upgrades[key];
    if (lvl >= UPGRADES[key].max) return;
    const cost = getUpgradeCost(key, lvl);
    if (userData.odometer < cost) return;
    const newData = { ...userData, odometer: userData.odometer - cost, upgrades: { ...userData.upgrades, [key]: lvl + 1 } };
    setUserData(newData);
    await storage.set(`plane-user-${userData.name.toLowerCase()}`, JSON.stringify(newData));
  };

  const startGame = () => {
    sound.resume();
    sound.init();
    sound.stopMusic();
    if (!sound.isMuted()) {
      sound.playLevelStart();
      setTimeout(() => sound.playBackgroundMusic('gameplay'), 1500);
    }
    const u = userData?.upgrades || DEFAULT_USER.upgrades;
    const startHealth = 100 + u.health * UPGRADES.health.effect;
    const startBombs = u.bombs * UPGRADES.bombs.effect;
    const startWeapon = u.weapon >= 2 ? 'triple' : u.weapon >= 1 ? 'double' : 'basic';
    
    setPlaneX(100); setPlaneY(250);
    setBullets([]); setEnemies([]); setCoins([]); setPowerups([]);
    setHearts([]); setBombs(startBombs); setBombPickups([]); setShieldPickups([]);
    setShieldActive(false); setShieldTimer(0); shieldStartRef.current = 0;
    setBossBullets([]); setEnemyBullets([]);
    setCurrentWeapon(startWeapon); setWeaponTimer(0); weaponStartRef.current = 0;
    setMoney(STARTER_COINS); setPoints(0);
    setHealth(startHealth); setMaxHealth(startHealth); healthRef.current = startHealth;
    setBgOffset(0); setCurrentLevel(0); setLevelTimer(LEVELS[0].duration);
    setBossActive(false); setBoss(null); setBombFlash(false);
    levelStartRef.current = performance.now();
    setLevelOverlay(`Level 1: ${TRANSLATIONS[lang].levels[0]}`);
    setTimeout(() => setLevelOverlay(null), 2000);
    setGameState('playing');
  };

  const startQuickPlay = () => {
    const guestUser = createGuestUser();
    setUserData(guestUser);
    setPlayerName(guestUser.name);
    setPassword('');
    setAuthError('');
    setGameState('lobby');
  };

  const endGame = useCallback(async (won) => {
    sound.stopMusic();
    if (!sound.isMuted()) {
      if (won) sound.playLevelComplete();
      else {
        sound.playPlayerDeath();
        setTimeout(() => sound.playGameOver(), 800);
      }
    }
    if (userData && !userData.isGuest) {
      const newData = { ...userData, odometer: userData.odometer + money };
      setUserData(newData);
      await storage.set(`plane-user-${userData.name.toLowerCase()}`, JSON.stringify(newData));
    }
    const entry = { name: userData?.name || playerName, score: money + points, country: playerCountry };
    const newGlobal = [...globalLeaderboard, entry].sort((a, b) => b.score - a.score).slice(0, 50);
    setGlobalLeaderboard(newGlobal);
    storage.set('plane-global-lb', JSON.stringify(newGlobal), true);
    setGameState(won ? 'victory' : 'gameOver');
  }, [money, points, userData, playerName, playerCountry, globalLeaderboard]);

  const sound = getSoundManager();
  const onMenuClick = (fn?: () => void) => {
    sound.resume();
    sound.init();
    if (!sound.isMuted()) sound.playButtonClick();
    fn?.();
  };

  const shoot = useCallback(() => {
    sound.resume();
    if (!sound.isMuted()) sound.playShoot();
    const w = WEAPONS[currentWeapon];
    const newBullets = [];
    const y = planeY + 20;
    if (w.bullets >= 1) newBullets.push({ id: Date.now(), x: planeX + 70, y, color: w.color, angle: 0 });
    if (w.bullets >= 2) newBullets.push({ id: Date.now() + 1, x: planeX + 70, y: y - 10, color: w.color, angle: -0.1 });
    if (w.bullets >= 3) newBullets.push({ id: Date.now() + 2, x: planeX + 70, y: y + 10, color: w.color, angle: 0.1 });
    setBullets(prev => [...prev, ...newBullets]);
  }, [planeX, planeY, currentWeapon]);

  const useBomb = useCallback(() => {
    if (bombs <= 0) return;
    sound.resume();
    if (!sound.isMuted()) sound.playBombExplode();
    particleSystemRef.current.emit(gameWidth / 2, gameHeight / 2, 20, { color: ['#fff', '#ff0', '#f80'], size: [3, 8], life: 0.6, speed: [2, 10] });
    setBombs(b => b - 1);
    setBombFlash(true);
    setTimeout(() => setBombFlash(false), 200);
    setEnemies(prev => { prev.forEach(e => setPoints(p => p + (e.points || 5))); return []; });
    setBossBullets([]); setEnemyBullets([]);
    if (boss) setBoss(prev => prev ? { ...prev, health: Math.max(0, prev.health - 10) } : null);
  }, [bombs, boss, gameWidth, gameHeight]);

  useEffect(() => {
    const kd = (e) => { keysPressed.current[e.code] = true; if (e.code === 'Space' && gameState === 'playing') { e.preventDefault(); useBomb(); } };
    const ku = (e) => { keysPressed.current[e.code] = false; };
    const md = () => { if (gameState === 'playing') shoot(); };
    window.addEventListener('keydown', kd);
    window.addEventListener('keyup', ku);
    window.addEventListener('mousedown', md);
    return () => { window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); window.removeEventListener('mousedown', md); };
  }, [gameState, shoot, useBomb]);

  const spawnEnemy = useCallback(() => {
    const types = LEVELS[currentLevel].enemyTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    const base = { id: Date.now() + Math.random(), x: gameWidth + 50, y: Math.random() * (gameHeight - 100) + 50, verticalDir: Math.random() > 0.5 ? 1 : -1 };
    switch (type) {
      case 'fast': return { ...base, type, width: 25, height: 25, speed: 6, health: 1, verticalSpeed: 3, points: 8, color: '#00ff88', emoji: '⚡' };
      case 'tank': return { ...base, type, width: 55, height: 55, speed: 1.5, health: 4, verticalSpeed: 0.8, points: 25, color: '#4a4a4a', emoji: '🛡️' };
      case 'shooter': return { ...base, type, width: 35, height: 35, speed: 2.5, health: 2, verticalSpeed: 1.5, points: 15, color: '#ff00ff', emoji: '🔫', canShoot: true };
      case 'zigzag': return { ...base, type, width: 30, height: 30, speed: 3, health: 1, verticalSpeed: 4, points: 12, color: '#ffff00', emoji: '〰️' };
      case 'kamikaze': return { ...base, type, width: 28, height: 28, speed: 5, health: 1, verticalSpeed: 0, points: 10, color: '#ff4444', emoji: '💀' };
      default: return { ...base, type: 'basic', width: 35, height: 35, speed: 3, health: 1, verticalSpeed: 2, points: 5, color: '#FF4444', emoji: '👾' };
    }
  }, [currentLevel, gameWidth, gameHeight]);

  const spawnBoss = useCallback(() => {
    const c = BOSS_CONFIG[currentLevel];
    return { x: gameWidth - 120, y: gameHeight / 2 - 50, width: 100, height: 100, health: c.health, maxHealth: c.health, shootRate: c.shootRate, bulletSpeed: c.bulletSpeed, points: c.points, direction: 1 };
  }, [currentLevel, gameWidth, gameHeight]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const loop = (time) => {
      const dt = lastTimeRef.current ? Math.min(time - lastTimeRef.current, 200) : 16;
      lastTimeRef.current = time;
      particleSystemRef.current.update(dt);
      const speedMult = 1 + (userData?.upgrades?.speed || 0) * UPGRADES.speed.effect;
      if (keysPressed.current['KeyW']) setPlaneY(y => Math.max(20, y - 5 * speedMult));
      if (keysPressed.current['KeyS']) setPlaneY(y => Math.min(gameHeight - 60, y + 5 * speedMult));
      if (keysPressed.current['KeyA']) setPlaneX(x => Math.max(20, x - 5 * speedMult));
      if (keysPressed.current['KeyD']) setPlaneX(x => Math.min(gameWidth - 100, x + 5 * speedMult));

      if (!bossActive) {
        const elapsed = time - levelStartRef.current;
        const remaining = LEVELS[currentLevel].duration - elapsed;
        if (remaining <= 0) {
          sound.stopMusic();
          if (!sound.isMuted()) {
            sound.playBossIntro();
            setTimeout(() => sound.playBackgroundMusic('boss'), 1500);
          }
          setBossWarningOverlay(true);
          setTimeout(() => setBossWarningOverlay(false), 1500);
          setBossActive(true);
          setBoss(spawnBoss());
          setEnemies([]);
          setLevelTimer(0);
        } else setLevelTimer(remaining);
      }

      if (currentWeapon !== 'basic' && weaponStartRef.current > 0) {
        const rem = WEAPON_DURATION - (time - weaponStartRef.current);
        if (rem <= 0) { setCurrentWeapon('basic'); setWeaponTimer(0); weaponStartRef.current = 0; }
        else setWeaponTimer(rem);
      }

      if (shieldActive && shieldStartRef.current > 0) {
        const rem = 20000 - (time - shieldStartRef.current);
        if (rem <= 0) { setShieldActive(false); setShieldTimer(0); shieldStartRef.current = 0; }
        else setShieldTimer(rem);
      }

      setBgOffset(o => (o + SCROLL_SPEED) % 200);
      setBullets(prev => prev.map(b => ({ ...b, x: b.x + BULLET_SPEED, y: b.y + (b.angle || 0) * BULLET_SPEED })).filter(b => b.x < gameWidth + 20));

      if (!bossActive) {
        setEnemies(prev => {
          let updated = prev.map(e => {
            let newY = e.y;
            if (e.type === 'kamikaze') newY += (planeY > e.y ? 2 : -2);
            else if (e.type === 'zigzag') newY = e.y + Math.sin(e.x * 0.05) * e.verticalSpeed;
            else {
              newY = e.y + e.verticalDir * e.verticalSpeed;
              if (newY < 20 || newY > gameHeight - 60) e.verticalDir *= -1;
            }
            return { ...e, x: e.x - e.speed, y: newY };
          }).filter(e => e.x > -60);
          return updated;
        });
        if (Math.random() < LEVELS[currentLevel].enemyRate) setEnemies(prev => [...prev, spawnEnemy()]);
        setEnemies(prev => {
          prev.forEach(e => {
            if (e.canShoot && Math.random() < 0.015) {
              if (!sound.isMuted()) sound.playEnemyShoot();
              setEnemyBullets(b => [...b, { id: Date.now() + Math.random(), x: e.x, y: e.y + e.height / 2, speed: 5 }]);
            }
          });
          return prev;
        });
        if (Math.random() < 0.03) setCoins(prev => [...prev, { id: Date.now(), x: gameWidth + 50, y: Math.random() * (gameHeight - 100) + 50 }]);
        if (Math.random() < 0.005) setPowerups(prev => [...prev, { id: Date.now(), x: gameWidth + 50, y: Math.random() * (gameHeight - 100) + 50, type: Math.random() > 0.5 ? 'double' : 'triple' }]);
        if (Math.random() < 0.003) setHearts(prev => [...prev, { id: Date.now(), x: gameWidth + 50, y: Math.random() * (gameHeight - 100) + 50, type: Math.random() < 0.5 ? 'pink' : Math.random() < 0.7 ? 'orange' : 'green' }]);
        if (Math.random() < 0.002) setBombPickups(prev => [...prev, { id: Date.now(), x: gameWidth + 50, y: Math.random() * (gameHeight - 100) + 50 }]);
        if (Math.random() < 0.003) setShieldPickups(prev => [...prev, { id: Date.now(), x: gameWidth + 50, y: Math.random() * (gameHeight - 100) + 50 }]);
      }

      setCoins(prev => prev.map(c => ({ ...c, x: c.x - SCROLL_SPEED })).filter(c => c.x > -30));
      
      // Magnet pull effect
      const magnetLvl = userData?.upgrades?.magnet || 0;
      if (magnetLvl > 0) {
        const magnetRange = 30 + magnetLvl * UPGRADES.magnet.effect;
        const planeCenterX = planeX;
        const planeCenterY = planeY;
        setCoins(prev => prev.map(coin => {
          const coinCenterX = coin.x + COIN_SIZE / 2;
          const coinCenterY = coin.y + COIN_SIZE / 2;
          const dx = planeCenterX - coinCenterX;
          const dy = planeCenterY - coinCenterY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < magnetRange && dist > 15) {
            const pullSpeed = 3 + magnetLvl * 2;
            return { ...coin, x: coin.x + (dx / dist) * pullSpeed, y: coin.y + (dy / dist) * pullSpeed };
          }
          return coin;
        }));
      }
      
      setPowerups(prev => prev.map(p => ({ ...p, x: p.x - SCROLL_SPEED })).filter(p => p.x > -30));
      setHearts(prev => prev.map(h => ({ ...h, x: h.x - SCROLL_SPEED })).filter(h => h.x > -30));
      setBombPickups(prev => prev.map(b => ({ ...b, x: b.x - SCROLL_SPEED })).filter(b => b.x > -30));
      setShieldPickups(prev => prev.map(s => ({ ...s, x: s.x - SCROLL_SPEED })).filter(s => s.x > -30));
      setEnemyBullets(prev => prev.map(b => ({ ...b, x: b.x - b.speed })).filter(b => b.x > -20));

      if (bossActive && boss) {
        setBoss(prev => {
          if (!prev) return null;
          let newY = prev.y + prev.direction * 2;
          if (newY < 20 || newY > gameHeight - prev.height - 20) prev.direction *= -1;
          return { ...prev, y: newY, direction: prev.direction };
        });
        if (Math.random() < boss.shootRate) {
          if (!sound.isMuted()) sound.playBossShoot();
          setBossBullets(prev => [...prev,
            { id: Date.now(), x: boss.x, y: boss.y + 50, speed: boss.bulletSpeed },
            { id: Date.now() + 1, x: boss.x, y: boss.y + 30, speed: boss.bulletSpeed, angle: -0.1 },
            { id: Date.now() + 2, x: boss.x, y: boss.y + 70, speed: boss.bulletSpeed, angle: 0.1 }
          ]);
        }
      }
      setBossBullets(prev => prev.map(b => ({ ...b, x: b.x - b.speed * 2, y: b.y + (b.angle || 0) * b.speed })).filter(b => b.x > -20));

      gameLoopRef.current = requestAnimationFrame(loop);
    };
    gameLoopRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [gameState, bossActive, boss, currentLevel, currentWeapon, spawnEnemy, spawnBoss, planeX, planeY, userData, gameWidth, gameHeight]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    const armorReduction = (userData?.upgrades?.armor || 0) * 10;
    const magnetRange = 25 + (userData?.upgrades?.magnet || 0) * 20;

    bullets.forEach(bullet => {
      enemies.forEach(enemy => {
        if (bullet.x > enemy.x && bullet.x < enemy.x + enemy.width && bullet.y > enemy.y && bullet.y < enemy.y + enemy.height) {
          if (!sound.isMuted()) {
            if (enemy.health <= 1) sound.playEnemyDestroy();
            else sound.playEnemyHit();
          }
          if (enemy.health <= 1) particleSystemRef.current.emit(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 10, { color: ['#ff4400', '#ff8800', '#ff0'], size: [2, 6], life: 0.3, speed: [1, 5] });
          setEnemies(prev => prev.map(e => e.id === enemy.id ? { ...e, health: e.health - 1 } : e).filter(e => {
            if (e.id === enemy.id && e.health <= 0) { setPoints(p => p + (e.points || 5)); return false; }
            return true;
          }));
          setBullets(prev => prev.filter(b => b.id !== bullet.id));
        }
      });
      if (boss && bullet.x > boss.x && bullet.x < boss.x + boss.width && bullet.y > boss.y && bullet.y < boss.y + boss.height) {
        if (!sound.isMuted()) {
          if (boss.health <= 1) {
            sound.playBossDestroy();
            particleSystemRef.current.emit(boss.x + boss.width / 2, boss.y + boss.height / 2, 18, { color: ['#f00', '#f80', '#ff0', '#fff'], size: [3, 10], life: [0.4, 1], speed: [2, 12] });
          } else sound.playBossHit();
        }
        setBoss(prev => {
          if (!prev) return null;
          const newHealth = prev.health - 1;
          if (newHealth <= 0) {
            setPoints(p => p + prev.points);
            setBossActive(false);
            setBossBullets([]);
            if (!sound.isMuted()) {
              sound.stopMusic();
              setTimeout(() => sound.playBackgroundMusic('gameplay'), 1500);
            }
            if (currentLevel < LEVELS.length - 1) {
              const nextLevel = currentLevel + 1;
              const levelName = TRANSLATIONS[lang]?.levels[nextLevel] ?? LEVELS[nextLevel]?.theme ?? '';
              setCurrentLevel(l => l + 1);
              levelStartRef.current = performance.now();
              setLevelTimer(LEVELS[nextLevel].duration);
              setLevelOverlay(`Level ${nextLevel + 1}: ${levelName}`);
              setTimeout(() => setLevelOverlay(null), 2000);
            } else setTimeout(() => endGame(true), 500);
            return null;
          }
          return { ...prev, health: newHealth };
        });
        setBullets(prev => prev.filter(b => b.id !== bullet.id));
      }
    });

    const planeLeft = planeX - PLANE_WIDTH / 2;
    const planeTop = planeY - PLANE_HEIGHT / 2;

    coins.forEach(coin => {
      if (checkPickupCollision(planeLeft, planeTop, PLANE_WIDTH, PLANE_HEIGHT, coin.x, coin.y, COIN_SIZE, PICKUP_RADII.coin)) {
        if (!sound.isMuted()) sound.playCoinCollect();
        particleSystemRef.current.emit(coin.x + COIN_SIZE / 2, coin.y + COIN_SIZE / 2, 5, { color: ['#FFD700', '#ff0'], size: [2, 4], life: 0.25, speed: [0.5, 2] });
        setCoins(prev => prev.filter(c => c.id !== coin.id));
        setMoney(m => m + 20);
      }
    });

    powerups.forEach(p => {
      if (checkPickupCollision(planeLeft, planeTop, PLANE_WIDTH, PLANE_HEIGHT, p.x, p.y, POWERUP_SIZE, PICKUP_RADII.powerup)) {
        if (!sound.isMuted()) sound.playPowerupCollect();
        setPowerups(prev => prev.filter(x => x.id !== p.id));
        setCurrentWeapon(p.type);
        weaponStartRef.current = performance.now();
        setWeaponTimer(WEAPON_DURATION);
      }
    });

    hearts.forEach(h => {
      if (checkPickupCollision(planeLeft, planeTop, PLANE_WIDTH, PLANE_HEIGHT, h.x, h.y, 25, PICKUP_RADII.heart)) {
        if (!sound.isMuted()) sound.playHeartCollect();
        setHearts(prev => prev.filter(x => x.id !== h.id));
        const heal = h.type === 'green' ? 25 : h.type === 'orange' ? 15 : 10;
        setHealth(hp => { const n = Math.min(maxHealth, hp + heal); healthRef.current = n; return n; });
      }
    });

    bombPickups.forEach(b => {
      if (checkPickupCollision(planeLeft, planeTop, PLANE_WIDTH, PLANE_HEIGHT, b.x, b.y, POWERUP_SIZE, PICKUP_RADII.bomb)) {
        if (!sound.isMuted()) sound.playBombPickup();
        setBombPickups(prev => prev.filter(x => x.id !== b.id));
        setBombs(n => Math.min(5, n + 1));
      }
    });

    shieldPickups.forEach(s => {
      if (checkPickupCollision(planeLeft, planeTop, PLANE_WIDTH, PLANE_HEIGHT, s.x, s.y, POWERUP_SIZE, PICKUP_RADII.shield)) {
        if (!sound.isMuted()) sound.playShieldActivate();
        setShieldPickups(prev => prev.filter(x => x.id !== s.id));
        setShieldActive(true);
        shieldStartRef.current = performance.now();
        setShieldTimer(20000);
      }
    });

    enemies.forEach(enemy => {
      if (planeX + 70 > enemy.x && planeX < enemy.x + enemy.width && planeY + 40 > enemy.y && planeY < enemy.y + enemy.height) {
        setEnemies(prev => prev.filter(e => e.id !== enemy.id));
        if (!shieldActive) {
          if (!sound.isMuted()) sound.playPlayerHit();
          particleSystemRef.current.emit(planeX + 35, planeY + 20, 4, { color: ['#f00', '#f80'], size: [2, 4], life: 0.2, speed: [1, 3] });
          const baseDmg = enemy.type === 'kamikaze' ? 30 : enemy.type === 'tank' ? 25 : 15;
          const dmg = Math.max(5, baseDmg - armorReduction);
          setHealth(hp => { const n = Math.max(0, hp - dmg); healthRef.current = n; if (n <= 0) endGame(false); return n; });
        }
      }
    });

    [...bossBullets, ...enemyBullets].forEach(bullet => {
      if (planeX + 70 > bullet.x && planeX < bullet.x + 10 && planeY + 40 > bullet.y && planeY < bullet.y + 8) {
        setBossBullets(prev => prev.filter(b => b.id !== bullet.id));
        setEnemyBullets(prev => prev.filter(b => b.id !== bullet.id));
        if (!shieldActive) {
          if (!sound.isMuted()) sound.playPlayerHit();
          particleSystemRef.current.emit(planeX + 35, planeY + 24, 3, { color: ['#f00', '#f80'], size: [2, 3], life: 0.2, speed: [1, 3] });
          const dmg = Math.max(5, 15 - armorReduction);
          setHealth(hp => { const n = Math.max(0, hp - dmg); healthRef.current = n; if (n <= 0) endGame(false); return n; });
        }
      }
    });
  }, [bullets, enemies, coins, powerups, hearts, bombPickups, shieldPickups, bossBullets, enemyBullets, planeX, planeY, boss, bossActive, currentLevel, shieldActive, maxHealth, userData, endGame, gameState]);

  const currentTheme = THEMES[LEVELS[currentLevel]?.theme || 'sky'];

  // MENU
  if (gameState === 'menu') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-sky-200 p-6 overflow-hidden transition-opacity duration-300" style={{ opacity: screenFade ? 1 : 0 }}>
        {/* Animated background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-64 h-24 bg-white/20 rounded-full blur-2xl top-1/4 left-1/4 animate-pulse" />
          <div className="absolute w-48 h-20 bg-white/15 rounded-full blur-xl bottom-1/3 right-1/4 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} />
          {['he', 'en', 'es', 'pt'].map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 ${lang === l ? 'bg-yellow-400 ring-4 ring-yellow-200 shadow-lg' : 'bg-white/70 hover:bg-white/90'}`}
              title={l}
            >
              {l === 'he' ? '🇮🇱' : l === 'en' ? '🇺🇸' : l === 'es' ? '🇪🇸' : '🇧🇷'}
            </button>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
          <span className="text-6xl mb-2" role="img" aria-hidden>✈️</span>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-3 drop-shadow-2xl" style={{ textShadow: '0 0 20px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2)' }}>
            {t.gameTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/95 mb-8 drop-shadow">{t.subtitle}</p>
          <label className="sr-only" htmlFor="country-select">{t.selectCountry}</label>
          <select
            id="country-select"
            value={playerCountry}
            onChange={e => setPlayerCountry(e.target.value)}
            className="mb-6 px-5 py-3 rounded-xl bg-white/95 border-2 border-white shadow-lg text-gray-800 font-medium text-base focus:ring-4 focus:ring-sky-300 focus:outline-none"
          >
            {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name[lang]}</option>)}
          </select>
          <button
            onClick={() => onMenuClick(() => setGameState('enterName'))}
            className="min-w-[220px] px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-bold rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-100 transition-all duration-200 ring-4 ring-green-300/50 hover:ring-green-400/60 animate-pulse"
          >
            {t.startGame}
          </button>
          <button
            onClick={() => onMenuClick(startQuickPlay)}
            className="mt-3 min-w-[220px] px-8 py-3 bg-white/90 text-slate-900 text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all duration-200 ring-2 ring-white/60"
          >
            {t.quickPlay}
          </button>
        </div>
        <p className="absolute bottom-4 left-0 right-0 text-center text-sm text-white/70 z-10">{t.credits}</p>
        <span className="absolute bottom-4 left-4 text-xs text-white/50 z-10">v1.0</span>
      </div>
    );
  }

  // ENTER NAME
  if (gameState === 'enterName') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-sky-400 to-sky-200 p-4">
        <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} className="fixed top-3 right-3 z-40" />
        <h1 className="text-3xl font-bold text-white mb-4">{t.enterName}</h1>
        <input
          type="text"
          value={playerName}
          onChange={e => setPlayerName(e.target.value)}
          placeholder={t.namePlaceholder}
          maxLength={15}
          autoFocus
          className="w-64 px-4 py-3 text-xl text-center rounded-lg border-2 border-[#4a90d9] bg-white text-[#1a1a2e] placeholder:text-gray-500 focus:outline-none focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/50 mb-4"
          style={{ padding: '12px 16px', borderRadius: 8 }}
        />
        <button onClick={() => { if (sanitizeName(playerName).length >= 2) { onMenuClick(() => { setAuthError(''); setPassword(''); setGameState('auth'); }); } }}
          disabled={sanitizeName(playerName).length < 2}
          className={`px-6 py-3 text-white text-xl font-bold rounded-lg ${sanitizeName(playerName).length >= 2 ? 'bg-green-500' : 'bg-gray-400'}`}>
          {t.continue} →
        </button>
      </div>
    );
  }

  // AUTH (Register/Login)
  if (gameState === 'auth') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-500 to-purple-600 p-4">
        <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} className="fixed top-3 right-3 z-40" />
        <h1 className="text-3xl font-bold text-white mb-2">{authMode === 'register' ? t.register : t.login}</h1>
        <p className="text-white/80 mb-4">👤 {playerName}</p>
        <div className="bg-white/20 rounded-xl p-6 w-80">
          <label className="text-white text-sm block mb-2">{t.password}</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            maxLength={20}
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter' && password.length >= 4) handleAuth(); }}
            className="w-full px-4 py-3 text-lg rounded-lg border-2 border-[#4a90d9] bg-white text-[#1a1a2e] placeholder:text-gray-500 focus:outline-none focus:border-[#00e5ff] focus:ring-2 focus:ring-[#00e5ff]/50 mb-2"
            style={{ padding: '12px 16px', borderRadius: 8 }}
          />
          <div className="text-white/60 text-xs mb-2">{password.length}/20 {password.length >= 4 && '✓'}</div>
          {authError && <p className="text-red-300 text-center font-bold mb-2">{authError}</p>}
          <button onClick={() => onMenuClick(handleAuth)} disabled={password.length < 4}
            className={`w-full py-3 text-white font-bold rounded-lg ${password.length >= 4 ? 'bg-green-500' : 'bg-gray-500'}`}>
            {authMode === 'register' ? t.createAccount : t.login} {authMode === 'register' ? '✨' : '🔓'}
          </button>
        </div>
        <button onClick={() => onMenuClick(() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(''); })} className="mt-4 text-white/80 underline text-sm">
          {authMode === 'register' ? t.haveAccount : t.noAccount}
        </button>
        <button onClick={() => onMenuClick(() => setGameState('enterName'))} className="mt-2 text-white/60 text-sm">← {t.back}</button>
      </div>
    );
  }

  // LOBBY
  if (gameState === 'lobby') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-800 to-gray-900 p-4">
        <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} className="fixed top-3 right-3 z-40" size="md" />
        <h1 className="text-2xl font-bold text-white mb-1">{t.choosePlane}</h1>
        <p className="text-green-400">✓ {userData?.name}</p>
        <p className="text-yellow-400 text-xl mb-3">💰 {userData?.odometer || 0}</p>
        <div className="flex gap-2 mb-4 flex-wrap justify-center">
          {PLANE_COLORS.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedColor(c)}
              className={`p-2 rounded-lg ${selectedColor.id === c.id ? 'ring-2 ring-yellow-400 bg-gray-700' : 'bg-gray-700/50'}`}
              style={{ cursor: 'pointer', border: selectedColor.id === c.id ? '2px solid gold' : '2px solid transparent', borderRadius: 8 }}
            >
              <svg width={80} height={35} viewBox="-60 -25 120 50" className="block mx-auto">
                <defs>
                  {c.id === 'gray' && (
                    <filter id="preview-plane-gray">
                      <feColorMatrix type="saturate" values="0.3" />
                      <feComponentTransfer>
                        <feFuncR type="linear" slope="0.8" intercept="0.15" />
                        <feFuncG type="linear" slope="0.8" intercept="0.15" />
                        <feFuncB type="linear" slope="0.8" intercept="0.15" />
                      </feComponentTransfer>
                    </filter>
                  )}
                  {c.id === 'green' && (
                    <filter id="preview-plane-green">
                      <feComponentTransfer>
                        <feFuncR type="linear" slope="0.6" />
                        <feFuncG type="linear" slope="1.3" />
                        <feFuncB type="linear" slope="0.5" />
                      </feComponentTransfer>
                    </filter>
                  )}
                  {c.id === 'blue' && (
                    <filter id="preview-plane-blue">
                      <feComponentTransfer>
                        <feFuncR type="linear" slope="0.5" />
                        <feFuncG type="linear" slope="0.8" />
                        <feFuncB type="linear" slope="1.4" />
                      </feComponentTransfer>
                    </filter>
                  )}
                  {c.id === 'red' && (
                    <filter id="preview-plane-red">
                      <feComponentTransfer>
                        <feFuncR type="linear" slope="1.4" />
                        <feFuncG type="linear" slope="0.5" />
                        <feFuncB type="linear" slope="0.5" />
                      </feComponentTransfer>
                    </filter>
                  )}
                </defs>
                <image
                  href="/assets/plane.png"
                  x={-60}
                  y={-25}
                  width={120}
                  height={50}
                  filter={`url(#preview-plane-${c.id})`}
                  style={{ imageRendering: 'auto' }}
                />
              </svg>
              <p className="text-xs text-white mt-1 text-center">{c.name[lang]}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-3 mb-3">
          <button onClick={() => onMenuClick(() => setGameState('shop'))} className="px-4 py-2 bg-yellow-500 text-black font-bold rounded-lg">🛒 {t.shop}</button>
          <button onClick={() => onMenuClick(startGame)} className="px-6 py-3 bg-green-500 text-white text-xl font-bold rounded-lg">{t.play}</button>
        </div>
        <button onClick={() => onMenuClick(() => { setUserData(null); setPlayerName(''); setPassword(''); setGameState('menu'); })} className="text-gray-400 text-sm">🚪 {t.logout}</button>
      </div>
    );
  }

  // SHOP
  if (gameState === 'shop') {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 p-4">
        <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} className="fixed top-3 right-3 z-40" />
        <h1 className="text-2xl font-bold text-white mb-2">🛒 {t.shop}</h1>
        <p className="text-yellow-400 text-lg mb-4">💰 {userData?.odometer || 0}</p>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {Object.entries(UPGRADES).map(([key, up]) => {
            const lvl = userData?.upgrades?.[key] || 0;
            const cost = getUpgradeCost(key, lvl);
            const canBuy = (userData?.odometer || 0) >= cost && lvl < up.max;
            return (
              <div key={key} className="bg-black/40 rounded-lg p-3 text-center">
                <div className="text-2xl">{up.icon}</div>
                <div className="text-white text-sm">{t.upgradeNames[key]}</div>
                <div className="text-yellow-400 text-xs">Lv.{lvl}/{up.max}</div>
                {lvl >= up.max ? (
                  <span className="text-green-400 text-xs">{t.maxLevel} ✓</span>
                ) : (
                  <button onClick={() => buyUpgrade(key)} disabled={!canBuy}
                    className={`mt-2 px-3 py-1 rounded text-sm font-bold ${canBuy ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-gray-400'}`}>
                    {t.buy} 💰{cost}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={() => onMenuClick(() => setGameState('lobby'))} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg">← {t.back}</button>
      </div>
    );
  }

  // GAME OVER / VICTORY
  if (gameState === 'gameOver' || gameState === 'victory') {
    return (
      <div className={`relative flex flex-col items-center justify-center min-h-screen p-4 ${gameState === 'victory' ? 'bg-gradient-to-b from-yellow-500 to-orange-500' : 'bg-gradient-to-b from-red-900 to-red-700'}`}>
        <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} className="fixed top-3 right-3 z-40" />
        <h1 className="text-3xl font-bold text-white mb-2">{gameState === 'victory' ? t.victory : t.crashed}</h1>
        <p className="text-xl text-yellow-400">{userData?.name}</p>
        <div className="bg-black/30 p-4 rounded-lg my-3 text-white text-center">
          <p>💰 +{money} | ⭐ {points}</p>
          <p className="text-yellow-400 font-bold">{t.total}: {money + points}</p>
          <p className="text-green-300 text-sm mt-2">{t.yourMoney}: 💰{userData?.odometer || 0}</p>
        </div>
        <button onClick={() => onMenuClick(() => setGameState('lobby'))} className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg">{t.playAgain}</button>
      </div>
    );
  }

  // PLAYING
  return (
    <ErrorBoundary>
    <div className="relative transition-opacity duration-300" style={{ opacity: screenFade ? 1 : 0 }}>
      <SoundControl sound={sound} muted={muted} setMuted={setMuted} t={t} className="fixed top-3 right-3 z-30" size="sm" />
    <GameCanvas
      gameWidth={gameWidth}
      gameHeight={gameHeight}
      currentLevel={currentLevel}
      bossActive={bossActive}
      boss={boss}
      money={money}
      points={points}
      health={health}
      maxHealth={maxHealth}
      shieldActive={shieldActive}
      shieldTimer={shieldTimer}
      bombs={bombs}
      coins={coins}
      powerups={powerups}
      hearts={hearts}
      bombPickups={bombPickups}
      shieldPickups={shieldPickups}
      bullets={bullets}
      enemies={enemies}
      bossBullets={bossBullets}
      enemyBullets={enemyBullets}
      planeX={planeX}
      planeY={planeY}
      selectedColor={selectedColor}
      userData={userData}
      lang={lang}
      t={t}
      levelTimer={levelTimer}
      bombFlash={bombFlash}
      particleSystemRef={particleSystemRef}
      levelOverlay={levelOverlay}
      bossWarningOverlay={bossWarningOverlay}
    />
    </div>
    </ErrorBoundary>
  );
}