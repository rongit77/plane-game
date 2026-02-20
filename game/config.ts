export const BULLET_SPEED = 12;
export const COIN_SIZE = 25;
export const POWERUP_SIZE = 30;
export const SCROLL_SPEED = 3;
export const PLANE_WIDTH = 120;
export const PLANE_HEIGHT = 50;
export const PICKUP_RADII = { coin: 45, powerup: 40, heart: 40, bomb: 40, shield: 40 } as const;
export const WEAPON_DURATION = 15000;

export const LEVELS = [
  { duration: 20000, enemyRate: 0.02, theme: 'sky', enemyTypes: ['basic'] },
  { duration: 20000, enemyRate: 0.025, theme: 'desert', enemyTypes: ['basic', 'shooter'] },
  { duration: 20000, enemyRate: 0.03, theme: 'ocean', enemyTypes: ['basic', 'fast'] },
  { duration: 20000, enemyRate: 0.035, theme: 'forest', enemyTypes: ['basic', 'shooter', 'tank'] },
  { duration: 20000, enemyRate: 0.04, theme: 'snow', enemyTypes: ['basic', 'fast', 'zigzag'] },
  { duration: 20000, enemyRate: 0.045, theme: 'city', enemyTypes: ['shooter', 'tank', 'zigzag'] },
  { duration: 20000, enemyRate: 0.05, theme: 'volcano', enemyTypes: ['fast', 'shooter', 'kamikaze'] },
  { duration: 20000, enemyRate: 0.055, theme: 'space', enemyTypes: ['tank', 'zigzag', 'kamikaze'] }
] as const;

export const BOSS_CONFIG = [
  { health: 25, shootRate: 0.02, bulletSpeed: 4, points: 200 },
  { health: 35, shootRate: 0.025, bulletSpeed: 4.5, points: 300 },
  { health: 45, shootRate: 0.03, bulletSpeed: 5, points: 400 },
  { health: 55, shootRate: 0.035, bulletSpeed: 5.5, points: 500 },
  { health: 65, shootRate: 0.04, bulletSpeed: 6, points: 600 },
  { health: 75, shootRate: 0.045, bulletSpeed: 6.5, points: 700 },
  { health: 85, shootRate: 0.05, bulletSpeed: 7, points: 800 },
  { health: 100, shootRate: 0.055, bulletSpeed: 7.5, points: 1000 }
] as const;

export const THEMES = {
  sky: { sky1: '#87CEEB', sky2: '#E0F6FF', ground: '#3a8c3a', sun: '#FFD700' },
  desert: { sky1: '#f4a460', sky2: '#ffe4b5', ground: '#daa520', sun: '#ff6347' },
  ocean: { sky1: '#4682b4', sky2: '#87ceeb', ground: '#1e90ff', sun: '#FFD700' },
  forest: { sky1: '#228b22', sky2: '#90ee90', ground: '#006400', sun: '#ffd700' },
  snow: { sky1: '#b0c4de', sky2: '#f0f8ff', ground: '#fffafa', sun: '#e6e6fa' },
  city: { sky1: '#1a1a2e', sky2: '#16213e', ground: '#0f0f23', sun: '#f0e68c' },
  volcano: { sky1: '#8b0000', sky2: '#2f0000', ground: '#1a0000', sun: '#ff4500' },
  space: { sky1: '#0a0a1a', sky2: '#000005', ground: '#1a0a2e', sun: '#9370db' }
} as const;

export const COUNTRIES = [
  { code: 'IL', name: { he: '🇮🇱 ישראל', en: '🇮🇱 Israel', es: '🇮🇱 Israel', pt: '🇮🇱 Israel' } },
  { code: 'US', name: { he: '🇺🇸 ארה״ב', en: '🇺🇸 USA', es: '🇺🇸 EE.UU.', pt: '🇺🇸 EUA' } },
  { code: 'BR', name: { he: '🇧🇷 ברזיל', en: '🇧🇷 Brazil', es: '🇧🇷 Brasil', pt: '🇧🇷 Brasil' } },
  { code: 'ES', name: { he: '🇪🇸 ספרד', en: '🇪🇸 Spain', es: '🇪🇸 España', pt: '🇪🇸 Espanha' } },
  { code: 'PT', name: { he: '🇵🇹 פורטוגל', en: '🇵🇹 Portugal', es: '🇵🇹 Portugal', pt: '🇵🇹 Portugal' } },
  { code: 'OTHER', name: { he: '🌍 אחר', en: '🌍 Other', es: '🌍 Otro', pt: '🌍 Outro' } }
] as const;

export const WEAPONS = {
  basic: { name: 'בסיסי', color: '#FF6600', bullets: 1 },
  double: { name: 'כפול', color: '#00BFFF', bullets: 2 },
  triple: { name: 'משולש', color: '#00FF00', bullets: 3 }
} as const;

export const PLANE_COLORS = [
  { id: 'gray', name: { he: 'אפור', en: 'Gray', es: 'Gris', pt: 'Cinza' }, body: '#4a4a4a', wing: '#333333', accent: '#666666' },
  { id: 'green', name: { he: 'ירוק', en: 'Green', es: 'Verde', pt: 'Verde' }, body: '#2d5a27', wing: '#1a3d15', accent: '#4a8c3f' },
  { id: 'blue', name: { he: 'כחול', en: 'Blue', es: 'Azul', pt: 'Azul' }, body: '#2d4a8a', wing: '#1a2d5f', accent: '#4a7fcf' },
  { id: 'red', name: { he: 'אדום', en: 'Red', es: 'Rojo', pt: 'Vermelho' }, body: '#8a2d2d', wing: '#5f1a1a', accent: '#cf4a4a' }
] as const;

export const UPGRADES = {
  health: { max: 5, baseCost: 100, costMult: 1.5, icon: '❤️', effect: 20 },
  armor: { max: 5, baseCost: 150, costMult: 1.6, icon: '🛡️', effect: 10 },
  weapon: { max: 2, baseCost: 300, costMult: 2, icon: '🔫', effect: 1 },
  bombs: { max: 3, baseCost: 200, costMult: 1.8, icon: '💣', effect: 1 },
  speed: { max: 3, baseCost: 250, costMult: 1.7, icon: '⚡', effect: 0.3 },
  magnet: { max: 3, baseCost: 200, costMult: 1.8, icon: '🧲', effect: 50 }
} as const;

export const DEFAULT_USER = { odometer: 0, upgrades: { health: 0, armor: 0, weapon: 0, bombs: 0, speed: 0, magnet: 0 } };

export const TRANSLATIONS = {
  he: {
    gameTitle: '✈️ משחק המטוסים', subtitle: 'אסוף מטבעות, חסל אויבים!', startGame: 'התחל משחק',
    enterName: '✈️ הכנס שם', namePlaceholder: 'השם שלך...', continue: 'המשך',
    password: 'סיסמה (4+ תווים)', passwordPlaceholder: 'בחר סיסמה...', wrongPassword: 'סיסמה שגויה!',
    userExists: 'שם תפוס!', userNotFound: 'משתמש לא נמצא', register: 'הרשמה', login: 'התחברות',
    haveAccount: 'יש לי חשבון', noAccount: 'משתמש חדש', createAccount: 'צור חשבון',
    choosePlane: '✈️ בחר מטוס', letsGo: 'יאללה! 🚀', play: 'שחק!',
    shop: 'חנות', buy: 'קנה', maxLevel: 'מקס', yourMoney: 'הכסף שלך', back: 'חזור',
    victory: '🎉 ניצחת!', crashed: '💥 התרסקת!', playAgain: 'שחק שוב', total: 'סה״כ',
    leaderboard: '🏆 שיאים', globalBoard: '🌍 עולמי', countryBoard: '🏳️ מדינה', noScores: 'אין שיאים',
    selectCountry: 'בחר מדינה', logout: 'התנתק', credits: '* נוצר ע״י איתן בניטה, 2026',
    volume: 'נפח',
    levels: ['שמיים', 'מדבר', 'אוקיינוס', 'יער', 'שלג', 'עיר', 'הר געש', 'חלל'],
    bosses: ['השד האדום', 'מלך המדבר', 'קראקן', 'שומר היער', 'מלך הקרח', 'לורד הצללים', 'אדון האש', 'הקיסר האפל'],
    upgradeNames: { health: 'חיים', armor: 'שריון', weapon: 'נשק', bombs: 'פצצות', speed: 'מהירות', magnet: 'מגנט' }
  },
  en: {
    gameTitle: '✈️ Plane Game', subtitle: 'Collect coins, destroy enemies!', startGame: 'Start Game',
    enterName: '✈️ Enter Name', namePlaceholder: 'Your name...', continue: 'Continue',
    password: 'Password (4+ chars)', passwordPlaceholder: 'Choose password...', wrongPassword: 'Wrong password!',
    userExists: 'Name taken!', userNotFound: 'User not found', register: 'Register', login: 'Login',
    haveAccount: 'I have an account', noAccount: 'New user', createAccount: 'Create Account',
    choosePlane: '✈️ Choose Plane', letsGo: "Let's Go! 🚀", play: 'Play!',
    shop: 'Shop', buy: 'Buy', maxLevel: 'Max', yourMoney: 'Your money', back: 'Back',
    victory: '🎉 Victory!', crashed: '💥 Crashed!', playAgain: 'Play Again', total: 'Total',
    leaderboard: '🏆 Leaderboard', globalBoard: '🌍 Global', countryBoard: '🏳️ Country', noScores: 'No scores',
    selectCountry: 'Select Country', logout: 'Logout', credits: '* Created by Eitan Benita, 2026',
    volume: 'Volume',
    levels: ['Sky', 'Desert', 'Ocean', 'Forest', 'Snow', 'City', 'Volcano', 'Space'],
    bosses: ['Red Devil', 'Desert King', 'Kraken', 'Forest Guardian', 'Ice King', 'Shadow Lord', 'Fire Master', 'Dark Emperor'],
    upgradeNames: { health: 'Health', armor: 'Armor', weapon: 'Weapon', bombs: 'Bombs', speed: 'Speed', magnet: 'Magnet' }
  },
  es: {
    gameTitle: '✈️ Juego de Aviones', subtitle: '¡Recoge monedas, destruye enemigos!', startGame: 'Comenzar',
    enterName: '✈️ Tu Nombre', namePlaceholder: 'Tu nombre...', continue: 'Continuar',
    password: 'Contraseña (4+ chars)', passwordPlaceholder: 'Elige contraseña...', wrongPassword: '¡Contraseña incorrecta!',
    userExists: '¡Nombre ocupado!', userNotFound: 'Usuario no encontrado', register: 'Registrar', login: 'Entrar',
    haveAccount: 'Tengo cuenta', noAccount: 'Nuevo usuario', createAccount: 'Crear Cuenta',
    choosePlane: '✈️ Elige Avión', letsGo: '¡Vamos! 🚀', play: '¡Jugar!',
    shop: 'Tienda', buy: 'Comprar', maxLevel: 'Máx', yourMoney: 'Tu dinero', back: 'Volver',
    victory: '🎉 ¡Victoria!', crashed: '💥 ¡Destruido!', playAgain: 'Jugar de Nuevo', total: 'Total',
    leaderboard: '🏆 Récords', globalBoard: '🌍 Global', countryBoard: '🏳️ País', noScores: 'Sin récords',
    selectCountry: 'Elegir País', logout: 'Salir', credits: '* Creado por Eitan Benita, 2026',
    volume: 'Volumen',
    levels: ['Cielo', 'Desierto', 'Océano', 'Bosque', 'Nieve', 'Ciudad', 'Volcán', 'Espacio'],
    bosses: ['Diablo Rojo', 'Rey Desierto', 'Kraken', 'Guardián', 'Rey Hielo', 'Lord Sombra', 'Maestro Fuego', 'Emperador'],
    upgradeNames: { health: 'Salud', armor: 'Armadura', weapon: 'Arma', bombs: 'Bombas', speed: 'Velocidad', magnet: 'Imán' }
  },
  pt: {
    gameTitle: '✈️ Jogo de Aviões', subtitle: 'Colete moedas, destrua inimigos!', startGame: 'Começar',
    enterName: '✈️ Seu Nome', namePlaceholder: 'Seu nome...', continue: 'Continuar',
    password: 'Senha (4+ chars)', passwordPlaceholder: 'Escolha senha...', wrongPassword: 'Senha errada!',
    userExists: 'Nome ocupado!', userNotFound: 'Usuário não encontrado', register: 'Registrar', login: 'Entrar',
    haveAccount: 'Tenho conta', noAccount: 'Novo usuário', createAccount: 'Criar Conta',
    choosePlane: '✈️ Escolha Avião', letsGo: 'Vamos! 🚀', play: 'Jogar!',
    shop: 'Loja', buy: 'Comprar', maxLevel: 'Máx', yourMoney: 'Seu dinheiro', back: 'Voltar',
    victory: '🎉 Vitória!', crashed: '💥 Destruído!', playAgain: 'Jogar Novamente', total: 'Total',
    leaderboard: '🏆 Recordes', globalBoard: '🌍 Global', countryBoard: '🏳️ País', noScores: 'Sem recordes',
    selectCountry: 'Escolher País', logout: 'Sair', credits: '* Criado por Eitan Benita, 2026',
    volume: 'Volume',
    levels: ['Céu', 'Deserto', 'Oceano', 'Floresta', 'Neve', 'Cidade', 'Vulcão', 'Espaço'],
    bosses: ['Diabo Vermelho', 'Rei Deserto', 'Kraken', 'Guardião', 'Rei Gelo', 'Lord Sombra', 'Mestre Fogo', 'Imperador'],
    upgradeNames: { health: 'Saúde', armor: 'Armadura', weapon: 'Arma', bombs: 'Bombas', speed: 'Velocidade', magnet: 'Ímã' }
  }
} as const;

