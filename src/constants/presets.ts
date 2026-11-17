import { DialoguePreset, EmotionType, VoiceOption } from '../types';

export const VOICES: VoiceOption[] = [
  // Italian Voices
  { id: 'it-IT-DiegoNeural', name: 'Diego (Naturale, Vivace)', gender: 'male', lang: 'it-IT', langLabel: 'Italiano', source: 'edge-neural' },
  { id: 'it-IT-GiuseppeNeural', name: 'Giuseppe (Profondo, Rilassato)', gender: 'male', lang: 'it-IT', langLabel: 'Italiano', source: 'edge-neural' },
  { id: 'it-IT-ElsaNeural', name: 'Elsa (Brillante, Espressiva)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano', source: 'edge-neural' },
  { id: 'it-IT-IsabellaNeural', name: 'Isabella (Dolce, Calda)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano', source: 'edge-neural' },
  { id: 'google-tts:it', name: 'Google TTS Italiano (MP3 Server)', gender: 'female', lang: 'it-IT', langLabel: 'Italiano', source: 'google-tts' },
  // Japanese (Giapponese)
  { id: 'ja-JP-NanamiNeural', name: 'Nanami (七海 - Chiara, Espressiva)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese', source: 'edge-neural' },
  { id: 'ja-JP-KeitaNeural', name: 'Keita (圭太 - Caldo, Giovanile)', gender: 'male', lang: 'ja-JP', langLabel: 'Giapponese', source: 'edge-neural' },
  { id: 'ja-JP-AoiNeural', name: 'Aoi (葵 - Dolce, Delicata)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese', source: 'edge-neural' },
  { id: 'ja-JP-NaokiNeural', name: 'Naoki (直樹 - Autorevole, Calmo)', gender: 'male', lang: 'ja-JP', langLabel: 'Giapponese', source: 'edge-neural' },
  { id: 'google-tts:ja', name: 'Google TTS Giapponese (日本語 MP3)', gender: 'female', lang: 'ja-JP', langLabel: 'Giapponese', source: 'google-tts' },
  // Korean (Coreano)
  { id: 'ko-KR-SunHiNeural', name: 'Sun-Hi (선희 - Vivace, Melodica)', gender: 'female', lang: 'ko-KR', langLabel: 'Coreano', source: 'edge-neural' },
  { id: 'ko-KR-InJoonNeural', name: 'In-Joon (인준 - Profondo, Raffinato)', gender: 'male', lang: 'ko-KR', langLabel: 'Coreano', source: 'edge-neural' },
  { id: 'google-tts:ko', name: 'Google TTS Coreano (한국어 MP3)', gender: 'female', lang: 'ko-KR', langLabel: 'Coreano', source: 'google-tts' },
  // Chinese Mandarin (Cinese Mandarino)
  { id: 'zh-CN-XiaoxiaoNeural', name: 'Xiaoxiao (晓晓 - Dolce, Naturale)', gender: 'female', lang: 'zh-CN', langLabel: 'Cinese', source: 'edge-neural' },
  { id: 'zh-CN-YunxiNeural', name: 'Yunxi (云希 - Dinamico, Giovanile)', gender: 'male', lang: 'zh-CN', langLabel: 'Cinese', source: 'edge-neural' },
  { id: 'zh-CN-YunjianNeural', name: 'Yunjian (云健 - Narrativo, Serio)', gender: 'male', lang: 'zh-CN', langLabel: 'Cinese', source: 'edge-neural' },
  { id: 'google-tts:zh-CN', name: 'Google TTS Cinese (普通话 MP3)', gender: 'female', lang: 'zh-CN', langLabel: 'Cinese', source: 'google-tts' },
  // Cantonese (Hong Kong)
  { id: 'zh-HK-HiuMaanNeural', name: 'HiuMaan (曉曼 - Femminile)', gender: 'female', lang: 'zh-HK', langLabel: 'Cantonese', source: 'edge-neural' },
  { id: 'zh-HK-WanLungNeural', name: 'WanLung (雲龍 - Maschile)', gender: 'male', lang: 'zh-HK', langLabel: 'Cantonese', source: 'edge-neural' },
  // Vietnamese (Vietnamita)
  { id: 'vi-VN-HoaiMyNeural', name: 'Hoài My (Femminile Melodica)', gender: 'female', lang: 'vi-VN', langLabel: 'Vietnamita', source: 'edge-neural' },
  { id: 'vi-VN-NamMinhNeural', name: 'Nam Minh (Maschile Calmo)', gender: 'male', lang: 'vi-VN', langLabel: 'Vietnamita', source: 'edge-neural' },
  // Thai (Tailandese)
  { id: 'th-TH-PremwadeeNeural', name: 'Premwadee (เปรมวดี - Femminile)', gender: 'female', lang: 'th-TH', langLabel: 'Tailandese', source: 'edge-neural' },
  { id: 'th-TH-NiwatNeural', name: 'Niwat (นิวัฒน์ - Maschile)', gender: 'male', lang: 'th-TH', langLabel: 'Tailandese', source: 'edge-neural' },
  // Hindi (Indiano)
  { id: 'hi-IN-SwaraNeural', name: 'Swara (स्वरा - Femminile Dolce)', gender: 'female', lang: 'hi-IN', langLabel: 'Hindi', source: 'edge-neural' },
  { id: 'hi-IN-MadhurNeural', name: 'Madhur (मधुर - Maschile Caldo)', gender: 'male', lang: 'hi-IN', langLabel: 'Hindi', source: 'edge-neural' },
  // Arabic (Arabo)
  { id: 'ar-SA-ZariyahNeural', name: 'Zariyah (زريعة - Femminile Espressiva)', gender: 'female', lang: 'ar-SA', langLabel: 'Arabo', source: 'edge-neural' },
  { id: 'ar-SA-HamedNeural', name: 'Hamed (حامد - Maschile Profondo)', gender: 'male', lang: 'ar-SA', langLabel: 'Arabo', source: 'edge-neural' },
  // English Voices
  { id: 'en-US-GuyNeural', name: 'Guy (American Male, Natural)', gender: 'male', lang: 'en-US', langLabel: 'Inglese', source: 'edge-neural' },
  { id: 'en-US-ChristopherNeural', name: 'Christopher (Warm Storyteller)', gender: 'male', lang: 'en-US', langLabel: 'Inglese', source: 'edge-neural' },
  { id: 'en-US-JennyNeural', name: 'Jenny (Clear & Friendly)', gender: 'female', lang: 'en-US', langLabel: 'Inglese', source: 'edge-neural' },
  { id: 'en-US-AriaNeural', name: 'Aria (Dynamic & Expressive)', gender: 'female', lang: 'en-US', langLabel: 'Inglese', source: 'edge-neural' },
  { id: 'google-tts:en', name: 'Google TTS English (MP3 Server)', gender: 'female', lang: 'en-US', langLabel: 'Inglese', source: 'google-tts' },
  // Spanish
  { id: 'es-ES-AlvaroNeural', name: 'Álvaro (Spagnolo Naturale)', gender: 'male', lang: 'es-ES', langLabel: 'Spagnolo', source: 'edge-neural' },
  { id: 'es-ES-ElviraNeural', name: 'Elvira (Spagnolo Espressiva)', gender: 'female', lang: 'es-ES', langLabel: 'Spagnolo', source: 'edge-neural' },
  // French
  { id: 'fr-FR-HenriNeural', name: 'Henri (Francese Maschile)', gender: 'male', lang: 'fr-FR', langLabel: 'Francese', source: 'edge-neural' },
  { id: 'fr-FR-DeniseNeural', name: 'Denise (Francese Femminile)', gender: 'female', lang: 'fr-FR', langLabel: 'Francese', source: 'edge-neural' },
  // German
  { id: 'de-DE-ConradNeural', name: 'Conrad (Tedesco Maschile)', gender: 'male', lang: 'de-DE', langLabel: 'Tedesco', source: 'edge-neural' },
  { id: 'de-DE-KatjaNeural', name: 'Katja (Tedesco Femminile)', gender: 'female', lang: 'de-DE', langLabel: 'Tedesco', source: 'edge-neural' },
];

export const EMOTIONS: Array<{
  id: EmotionType;
  label: string;
  emoji: string;
  description: string;
  badgeClass: string;
}> = [
  { id: 'neutro', label: 'Neutro', emoji: '😐', description: 'Equilibrato, naturale e colloquiale', badgeClass: 'bg-[var(--btn-primary)] text-[var(--btn-ink)]' },
  { id: 'entusiasta', label: 'Entusiasta', emoji: '😃', description: 'Tono vivace, cadenza brillante e ritmo sostenuto', badgeClass: 'bg-[#d97706] text-[#fffbeb]' },
  { id: 'calmo', label: 'Calmo', emoji: '😌', description: 'Tono morbido, ritmo disteso e pause meditative', badgeClass: 'bg-[#0f766e] text-[#ecfdf5]' },
  { id: 'serio', label: 'Serio', emoji: '👔', description: 'Tono profondo, autorevole e perentorio', badgeClass: 'bg-[#2563eb] text-[#eff6ff]' },
  { id: 'sorpreso', label: 'Sorpreso', emoji: '😲', description: 'Picco di tono ascendente ed enfasi esclamativa', badgeClass: 'bg-[#7c3aed] text-[#f5f3ff]' },
  { id: 'triste', label: 'Malinconico', emoji: '🌧️', description: 'Tono sommesso, voce leggermente velata e ritmo lento', badgeClass: 'bg-[#0891b2] text-[#ecfeff]' },
  { id: 'ironico', label: 'Ironico', emoji: '😏', description: 'Cadenza pungente con inflessione canzonatoria', badgeClass: 'bg-[#be185d] text-[#fdf2f8]' },
];

export const COLOR_CONFIGS = {
  indigo: {
    bg: 'bg-[var(--bg-card)]',
    border: 'border-[#6b8af2]',
    text: 'text-[var(--ink-main)]',
    accent: 'bg-[#3b5bdb] hover:bg-[#324ec2] text-[#f5f8ff]',
    avatarBg: 'bg-[#3b5bdb] text-[#f5f8ff]',
    waveColor: '#3b5bdb',
  },
  rose: {
    bg: 'bg-[var(--bg-card)]',
    border: 'border-[#e85d8a]',
    text: 'text-[var(--ink-main)]',
    accent: 'bg-[#be185d] hover:bg-[#9d174d] text-[#fff1f6]',
    avatarBg: 'bg-[#be185d] text-[#fff1f6]',
    waveColor: '#be185d',
  },
  emerald: {
    bg: 'bg-[var(--bg-card)]',
    border: 'border-[#2fb88c]',
    text: 'text-[var(--ink-main)]',
    accent: 'bg-[#0f766e] hover:bg-[#0c5e58] text-[#ecfdf5]',
    avatarBg: 'bg-[#0f766e] text-[#ecfdf5]',
    waveColor: '#0f766e',
  },
  amber: {
    bg: 'bg-[var(--bg-card)]',
    border: 'border-[#f2bc41]',
    text: 'text-[var(--ink-main)]',
    accent: 'bg-[#d97706] hover:bg-[#b45309] text-[#fffbeb]',
    avatarBg: 'bg-[#d97706] text-[#fffbeb]',
    waveColor: '#d97706',
  },
  cyan: {
    bg: 'bg-[var(--bg-card)]',
    border: 'border-[#38bdf8]',
    text: 'text-[var(--ink-main)]',
    accent: 'bg-[#0284c7] hover:bg-[#0369a1] text-[#f0f9ff]',
    avatarBg: 'bg-[#0284c7] text-[#f0f9ff]',
    waveColor: '#0284c7',
  },
  violet: {
    bg: 'bg-[var(--bg-card)]',
    border: 'border-[#a78bfa]',
    text: 'text-[var(--ink-main)]',
    accent: 'bg-[#7c3aed] hover:bg-[#6d28d9] text-[#f5f3ff]',
    avatarBg: 'bg-[#7c3aed] text-[#f5f3ff]',
    waveColor: '#7c3aed',
  },
};

export const SAMPLE_PRESETS: DialoguePreset[] = [
  {
    id: 'cinema-mf',
    title: 'L’Inchiesta Notturna (M - F)',
    description: 'Dialogo drammatico ad alta tensione tra un detective e una testimone chiave.',
    pairingType: 'mf',
    char1: { name: 'Marco', gender: 'male', voice: 'it-IT-DiegoNeural', color: 'indigo' },
    char2: { name: 'Giulia', gender: 'female', voice: 'it-IT-ElsaNeural', color: 'rose' },
    lines: [
      { characterId: 'char1', text: 'Giulia, so esattamente a che ora sei uscita da quell’edificio ieri notte.', emotion: 'serio', pauseAfterSec: 0.8 },
      { characterId: 'char2', text: 'Stai insinuando qualcosa, Marco? Non ho niente a che vedere con quella storia.', emotion: 'sorpreso', pauseAfterSec: 0.6 },
      { characterId: 'char1', text: 'Allora spiegami perché la tua macchina è stata ripresa dalle telecamere del porto alle tre.', emotion: 'calmo', pauseAfterSec: 0.9 },
      { characterId: 'char2', text: 'Perché qualcuno mi ha teso una trappola! E se non mi aiuti adesso, siamo entrambi nei guai.', emotion: 'entusiasta', pauseAfterSec: 0.7 },
      { characterId: 'char1', text: 'D’accordo. Siediti e raccontami ogni minimo dettaglio. Senza tralasciare nulla.', emotion: 'serio', pauseAfterSec: 0.5 },
    ],
  },
  {
    id: 'festival-ff',
    title: 'Organizzazione del Festival (F - F)',
    description: 'Conversazione vivace e collaborativa tra due amiche che organizzano un grande evento.',
    pairingType: 'ff',
    char1: { name: 'Elena', gender: 'female', voice: 'it-IT-ElsaNeural', color: 'rose' },
    char2: { name: 'Sofia', gender: 'female', voice: 'it-IT-IsabellaNeural', color: 'emerald' },
    lines: [
      { characterId: 'char1', text: 'Sofia, non puoi capire! Il comune ha appena approvato tutti i permessi per la piazza!', emotion: 'entusiasta', pauseAfterSec: 0.6 },
      { characterId: 'char2', text: 'Ma dai, sul serio?! Credevo avremmo dovuto aspettare almeno un’altra settimana!', emotion: 'sorpreso', pauseAfterSec: 0.7 },
      { characterId: 'char1', text: 'Hanno apprezzato moltissimo il nostro piano di sicurezza e sostenibilità.', emotion: 'calmo', pauseAfterSec: 0.5 },
      { characterId: 'char2', text: 'Fantastico! Ora dobbiamo subito confermare i musicisti prima che accettino altre date.', emotion: 'entusiasta', pauseAfterSec: 0.6 },
      { characterId: 'char1', text: 'Ci penso io oggi pomeriggio. Tu riesci a sentire i fornitori dell’impianto luci?', emotion: 'neutro', pauseAfterSec: 0.5 },
      { characterId: 'char2', text: 'Già fatto, sono prontissimi. Sarà un evento memorabile!', emotion: 'entusiasta', pauseAfterSec: 0.6 },
    ],
  },
  {
    id: 'startup-mm',
    title: 'Strategia Startup (M - M)',
    description: 'Confronto analitico tra due co-founder prima della presentazione agli investitori.',
    pairingType: 'mm',
    char1: { name: 'Matteo', gender: 'male', voice: 'it-IT-DiegoNeural', color: 'indigo' },
    char2: { name: 'Luca', gender: 'male', voice: 'it-IT-GiuseppeNeural', color: 'amber' },
    lines: [
      { characterId: 'char1', text: 'Luca, hai controllato le metriche di crescita dell’ultimo trimestre?', emotion: 'neutro', pauseAfterSec: 0.6 },
      { characterId: 'char2', text: 'Sì, e i numeri parlano chiaro: abbiamo un tasso di fidelizzazione superiore al quaranta per cento.', emotion: 'calmo', pauseAfterSec: 0.8 },
      { characterId: 'char1', text: 'Gli investitori vorranno sapere come intendiamo scalare l’infrastruttura nei prossimi sei mesi.', emotion: 'serio', pauseAfterSec: 0.7 },
      { characterId: 'char2', text: 'La nostra architettura cloud è già pronta per reggere un traffico dieci volte superiore senza costi aggiuntivi.', emotion: 'entusiasta', pauseAfterSec: 0.6 },
      { characterId: 'char1', text: 'Perfetto. Concentriamoci su questo punto e chiuderemo il round di finanziamento.', emotion: 'calmo', pauseAfterSec: 0.5 },
    ],
  },
  {
    id: 'bar-mf',
    title: 'Caffè tra Vecchi Amici (M - F)',
    description: 'Scambio informale con battute, ricordi e leggerezza al bar.',
    pairingType: 'mf',
    char1: { name: 'Andrea', gender: 'male', voice: 'it-IT-GiuseppeNeural', color: 'cyan' },
    char2: { name: 'Chiara', gender: 'female', voice: 'it-IT-IsabellaNeural', color: 'rose' },
    lines: [
      { characterId: 'char1', text: 'Chiara! Da quanti anni non ci incontravamo per un caffè?', emotion: 'entusiasta', pauseAfterSec: 0.6 },
      { characterId: 'char2', text: 'Troppi, Andrea! E vedo che non hai perso il vizio di ordinare il cappuccino a mezzogiorno.', emotion: 'ironico', pauseAfterSec: 0.7 },
      { characterId: 'char1', text: 'Ehi, le buone abitudini non si toccano mai! Piuttosto, raccontami di te.', emotion: 'entusiasta', pauseAfterSec: 0.5 },
      { characterId: 'char2', text: 'Ho appena cambiato casa e adottato un gattino che passa la giornata a distruggere i cuscini.', emotion: 'calmo', pauseAfterSec: 0.6 },
      { characterId: 'char1', text: 'Sembra una vita tranquilla e rilassante, devo dire!', emotion: 'ironico', pauseAfterSec: 0.5 },
    ],
  },
  {
    id: 'anime-ja',
    title: '🇯🇵 Anime Drama - Tokyo (Giapponese)',
    description: 'Dialogo drammatico ed espressivo in lingua giapponese tra Keita e Nanami.',
    pairingType: 'mf',
    char1: { name: 'Keita (圭太)', gender: 'male', voice: 'ja-JP-KeitaNeural', color: 'indigo' },
    char2: { name: 'Nanami (七海)', gender: 'female', voice: 'ja-JP-NanamiNeural', color: 'rose' },
    lines: [
      { characterId: 'char1', text: '七海、本当に東京を離れるつもりなのか？', emotion: 'serio', pauseAfterSec: 0.8 },
      { characterId: 'char2', text: 'ええ。ここでの夢はもう終わったの。新しい場所でやり直したい。', emotion: 'calmo', pauseAfterSec: 0.7 },
      { characterId: 'char1', text: '僕たちが一緒に過ごした時間は、君にとって何だったんだ？', emotion: 'triste', pauseAfterSec: 0.9 },
      { characterId: 'char2', text: '決して忘れない大切な思い出よ。でも、自分の道を歩まなきゃいけないの。', emotion: 'entusiasta', pauseAfterSec: 0.8 },
      { characterId: 'char1', text: '分かった。君の決意を止めることはできないな。元気でね。', emotion: 'calmo', pauseAfterSec: 0.6 },
    ],
  },
  {
    id: 'kdrama-ko',
    title: '🇰🇷 K-Drama - Seoul (Coreano)',
    description: 'Confronto romantico ed emotivo in lingua coreana tra In-Joon e Sun-Hi.',
    pairingType: 'mf',
    char1: { name: 'In-Joon (인준)', gender: 'male', voice: 'ko-KR-InJoonNeural', color: 'cyan' },
    char2: { name: 'Sun-Hi (선희)', gender: 'female', voice: 'ko-KR-SunHiNeural', color: 'rose' },
    lines: [
      { characterId: 'char1', text: '선희 씨, 그때 왜 아무 말 없이 떠난 거예요?', emotion: 'serio', pauseAfterSec: 0.7 },
      { characterId: 'char2', text: '미안해요, 인준 씨. 그때는 제가 너무 어렸고 두려웠어요.', emotion: 'triste', pauseAfterSec: 0.8 },
      { characterId: 'char1', text: '하지만 우리는 함께 이겨낼 수 있었잖아요.', emotion: 'entusiasta', pauseAfterSec: 0.6 },
      { characterId: 'char2', text: '지금이라도 늦지 않았다면, 다시 시작할 수 있을까요?', emotion: 'calmo', pauseAfterSec: 0.8 },
      { characterId: 'char1', text: '당연하죠. 저는 항상 여기서 기다리고 있었어요.', emotion: 'entusiasta', pauseAfterSec: 0.5 },
    ],
  },
  {
    id: 'manhua-zh',
    title: '⚔️ Manhua Xianxia - Monte Qingyun (Cinese)',
    description: 'Dialogo epico stile manhua wuxia/xianxia in cinese mandarino tra Yunxi e Xiaoxiao.',
    pairingType: 'mf',
    char1: { name: 'Yunxi (云希)', gender: 'male', voice: 'zh-CN-YunxiNeural', color: 'amber' },
    char2: { name: 'Xiaoxiao (晓晓)', gender: 'female', voice: 'zh-CN-XiaoxiaoNeural', color: 'emerald' },
    lines: [
      { characterId: 'char1', text: '晓晓，魔教的人已经封锁了青云山，你现在必须立刻离开！', emotion: 'serio', pauseAfterSec: 0.7 },
      { characterId: 'char2', text: '什么？难道连护山大阵也被他们攻破了吗？', emotion: 'sorpreso', pauseAfterSec: 0.6 },
      { characterId: 'char1', text: '大阵最多只能再撑一炷香的时间。拿着这把玄冰剑，去寻找宗主。', emotion: 'calmo', pauseAfterSec: 0.8 },
      { characterId: 'char2', text: '不！要走一起走，我绝对不会丢下你一个人在这里迎战的！', emotion: 'entusiasta', pauseAfterSec: 0.7 },
      { characterId: 'char1', text: '好！既然如此，今天我们就联手，让他们见识一下青云剑法的真正威力！', emotion: 'serio', pauseAfterSec: 0.6 },
    ],
  },
];
