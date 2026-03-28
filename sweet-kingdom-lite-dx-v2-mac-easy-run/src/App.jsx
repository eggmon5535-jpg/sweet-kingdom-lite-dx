
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sword, Shield, Home, Heart, Crown, Gem, Wand2, Star } from 'lucide-react';

const Button = ({ children, className = '', variant = 'default', ...props }) => {
  const styles = variant === 'secondary'
    ? 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
    : variant === 'destructive'
    ? 'bg-rose-500 text-white hover:bg-rose-600'
    : variant === 'outline'
    ? 'bg-transparent border border-slate-300 hover:bg-white'
    : 'bg-violet-600 text-white hover:bg-violet-700';
  return <button className={`px-4 py-2 rounded-2xl font-semibold transition shadow-sm ${styles} ${className}`} {...props}>{children}</button>;
};
const Card = ({ children, className = '' }) => <div className={`bg-white rounded-3xl shadow-lg ${className}`}>{children}</div>;
const Badge = ({ children, className = '' }) => <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${className}`}>{children}</span>;

const rarityColor = {
  '일반': 'bg-slate-200 text-slate-700',
  '희귀': 'bg-sky-200 text-sky-800',
  '에픽': 'bg-violet-200 text-violet-800',
  '레전드': 'bg-amber-200 text-amber-800'
};
const rarityMult = { '일반': 1, '희귀': 1.08, '에픽': 1.18, '레전드': 1.35 };
const roles = ['탱커', '딜러', '힐러', '서포터', '광역형', '보스킬러'];
const emojis = ['🍪','🧁','🍰','🍫','🍓','🍮','🍬','🍭','🥐','🍯','🫐','🍋','🍎','🍇','🍨'];
const flavors = ['카라멜','민트','초코','바닐라','딸기','블루베리','레몬','모카','허니','마카롱','캔디','시나몬','코코아','젤리','슈가'];
const titles = ['나이트','싱어','메이지','가디언','러너','블레이드','오라클','위버','샤먼','프린스','프린세스','헌터','스피어','스타','드리머'];

const makeHeroPool = () => {
  const pool = [];
  let id = 1;
  for (let i = 0; i < 125; i++) {
    const rarity = i < 50 ? '일반' : i < 90 ? '희귀' : i < 118 ? '에픽' : '레전드';
    const flavor = flavors[i % flavors.length];
    const title = titles[(i * 3) % titles.length];
    const role = roles[(i * 5) % roles.length];
    pool.push({
      id: `hero-${id++}`,
      name: `${flavor} ${title}`,
      emoji: emojis[i % emojis.length],
      rarity,
      role,
      level: 1,
      copies: 1,
      hp: 70 + (i % 10) * 6 + (rarity === '레전드' ? 40 : rarity === '에픽' ? 20 : 0),
      atk: 12 + (i % 8) * 2 + (rarity === '레전드' ? 12 : rarity === '에픽' ? 6 : 0),
      desc: `${flavor} 속성의 ${role} 영웅`,
      skill: role === '힐러' || flavor === '민트' ? '멜로디 힐' : role === '광역형' ? '스위트 버스트' : '캔디 스트라이크'
    });
  }
  return pool;
};

const HERO_POOL = makeHeroPool();
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const calcPower = (h) => Math.floor((h.hp * 0.55 + h.atk * 8 + (h.level || 1) * 7) * (rarityMult[h.rarity] || 1));
const getRarityMult = (r) => rarityMult[r] || 1;

const ENEMIES = [
  { name: '젤리 슬라임', hp: 80, atk: 12, reward: 55 },
  { name: '쿠키 도적단', hp: 110, atk: 16, reward: 75 },
  { name: '설탕 늑대', hp: 140, atk: 20, reward: 95 },
  { name: '비스킷 거인', hp: 190, atk: 24, reward: 125 },
  { name: '캔디 드래곤', hp: 260, atk: 31, reward: 180 }
];

function BuildingCard({ title, icon, level, desc, cost, onUpgrade }) {
  return (
    <Card className="p-5">
      <div className="text-3xl">{icon}</div>
      <div className="mt-2 text-xl font-bold">{title}</div>
      <div className="mt-1 text-sm text-slate-500">{desc}</div>
      <div className="mt-3 font-semibold">Lv. {level}</div>
      <Button className="mt-4 w-full" onClick={onUpgrade}>업그레이드 ({cost} 골드)</Button>
    </Card>
  );
}

export default function App() {
  const starter = HERO_POOL.slice(0, 6).map(h => ({ ...h }));
  const [gold, setGold] = useState(1000);
  const [gems, setGems] = useState(40);
  const [stage, setStage] = useState(1);
  const [selectedTab, setSelectedTab] = useState('battle');
  const [owned, setOwned] = useState(starter);
  const [party, setParty] = useState(starter.slice(0, 4));
  const [battleLog, setBattleLog] = useState(['디저트 왕국에 오신 것을 환영합니다!']);
  const [equipment, setEquipment] = useState({ sword: 1, charm: 1 });
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [quests, setQuests] = useState({ battle: 0, summon: 0, upgrade: 0 });
  const [showGachaResult, setShowGachaResult] = useState(false);
  const [gachaResult, setGachaResult] = useState([]);
  const [buildings, setBuildings] = useState({ bakery: 1, fountain: 1, castle: 1, lab: 1, market: 1 });

  const incomePerTick = useMemo(() => buildings.bakery * 2 + buildings.fountain * 1 + buildings.castle * 3 + buildings.lab * 2 + buildings.market * 4, [buildings]);
  const kingdomPower = useMemo(() => party.reduce((sum, h) => sum + calcPower(h), 0) + buildings.castle * 20 + buildings.lab * 15 + owned.length * 2 + equipment.sword * 15 + equipment.charm * 12, [party, buildings, owned, equipment]);

  useEffect(() => {
    const saved = localStorage.getItem('sweet-kingdom-lite-save-v2');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.gold !== undefined) setGold(data.gold);
        if (data.gems !== undefined) setGems(data.gems);
        if (data.stage !== undefined) setStage(data.stage);
        if (data.party) setParty(data.party);
        if (data.owned) setOwned(data.owned);
        if (data.buildings) setBuildings(data.buildings);
        if (data.equipment) setEquipment(data.equipment);
        if (typeof data.dailyClaimed === 'boolean') setDailyClaimed(data.dailyClaimed);
        if (data.quests) setQuests(data.quests);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sweet-kingdom-lite-save-v2', JSON.stringify({ gold, gems, stage, party, owned, buildings, equipment, dailyClaimed, quests }));
  }, [gold, gems, stage, party, owned, buildings, equipment, dailyClaimed, quests]);

  useEffect(() => {
    const t = setInterval(() => setGold((g) => g + incomePerTick), 4000);
    return () => clearInterval(t);
  }, [incomePerTick]);

  const enemy = useMemo(() => {
    const base = ENEMIES[(stage - 1) % ENEMIES.length];
    const isBoss = stage % 5 === 0;
    return {
      ...base,
      name: isBoss ? `보스 · ${base.name}` : base.name,
      hp: base.hp + stage * (isBoss ? 18 : 10),
      atk: base.atk + Math.floor(stage * (isBoss ? 1.6 : 1.0)),
      reward: base.reward + stage * 8 + (isBoss ? 120 : 0)
    };
  }, [stage]);

  const toggleParty = (hero) => {
    const active = party.some((h) => h.id === hero.id);
    if (active) setParty((p) => p.filter((h) => h.id !== hero.id));
    else if (party.length < 4) setParty((p) => [...p, hero]);
  };

  const summon = (multi = 1) => {
    setQuests((q) => ({ ...q, summon: q.summon + multi }));
    const cost = multi === 10 ? 27 : 3;
    if (gems < cost) return;
    setGems((g) => g - cost);
    const pulled = [];
    let nextOwned = [...owned];
    let bonusGold = 0;
    for (let i = 0; i < multi; i++) {
      const hero = { ...rand(HERO_POOL) };
      pulled.push(hero);
      const idx = nextOwned.findIndex((h) => h.id === hero.id);
      if (idx >= 0) {
        nextOwned[idx] = { ...nextOwned[idx], copies: (nextOwned[idx].copies || 1) + 1 };
        bonusGold += 40;
      } else {
        nextOwned.push({ ...hero, copies: 1 });
      }
    }
    setOwned(nextOwned);
    setGold((g) => g + bonusGold);
    setGachaResult(pulled);
    setShowGachaResult(true);
  };

  const levelUpHero = (heroId) => {
    setQuests((q) => ({ ...q, upgrade: q.upgrade + 1 }));
    const hero = owned.find((h) => h.id === heroId);
    if (!hero) return;
    const cost = (hero.level || 1) * 30;
    if (gold < cost) return;
    setGold((g) => g - cost);
    const nextOwned = owned.map((h) => h.id === heroId ? { ...h, level: (h.level || 1) + 1, hp: h.hp + 6, atk: h.atk + 2 } : h);
    setOwned(nextOwned);
    setParty((prev) => prev.map((h) => h.id === heroId ? nextOwned.find((x) => x.id === heroId) : h));
  };

  const ascendHero = (heroId) => {
    const hero = owned.find((h) => h.id === heroId);
    if (!hero || (hero.copies || 1) < 3) return;
    const nextOwned = owned.map((h) => h.id === heroId ? { ...h, copies: h.copies - 2, hp: h.hp + 18, atk: h.atk + 6, level: (h.level || 1) + 1 } : h);
    setOwned(nextOwned);
    setParty((prev) => prev.map((h) => h.id === heroId ? nextOwned.find((x) => x.id === heroId) : h));
  };

  const upgradeGear = (key) => {
    const cost = (equipment[key] || 1) * 120;
    if (gold < cost) return;
    setGold((g) => g - cost);
    setEquipment((e) => ({ ...e, [key]: (e[key] || 1) + 1 }));
  };

  const claimDaily = () => {
    if (dailyClaimed) return;
    setGold((g) => g + 500);
    setGems((g) => g + 10);
    setDailyClaimed(true);
  };

  const upgradeBuilding = (key) => {
    const costs = { bakery: 80, fountain: 60, castle: 120, lab: 100, market: 140 };
    const cost = costs[key] * buildings[key];
    if (gold < cost) return;
    setGold((g) => g - cost);
    setBuildings((b) => ({ ...b, [key]: b[key] + 1 }));
  };

  const fight = () => {
    setQuests((q) => ({ ...q, battle: q.battle + 1 }));
    if (!party.length) return;
    let nextEnemyHp = enemy.hp;
    let nextPartyHp = party.map((h) => h.hp + (h.level || 1) * 5);
    const logs = [];
    for (let i = 0; i < party.length; i++) {
      const hero = party[i];
      if (nextPartyHp[i] <= 0) continue;
      const variance = Math.floor(Math.random() * 6);
      const skillBurst = Math.random() < 0.22 ? Math.floor(hero.atk * 1.8) : 0;
      const crit = Math.random() < 0.16;
      const dmg = Math.floor((hero.atk + variance + skillBurst + equipment.sword * 2) * getRarityMult(hero.rarity) * (crit ? 1.5 : 1));
      nextEnemyHp -= dmg;
      logs.push(`${hero.name}의 공격! ${dmg} 피해${crit ? ' 💥크리티컬' : ''}${skillBurst ? ' ✨스킬' : ''}`);
      if (hero.skill.includes('힐') || hero.role === '힐러') {
        nextPartyHp = nextPartyHp.map((hp, idx) => Math.min((party[idx].hp + (party[idx].level || 1) * 5), hp + 5 + equipment.charm));
        logs.push('회복 스킬 발동!');
      }
      if (nextEnemyHp <= 0) break;
      const targetDmg = Math.max(4, enemy.atk - (hero.role === '탱커' ? 3 : 0) - equipment.charm);
      nextPartyHp[i] -= targetDmg;
      logs.push(`${enemy.name}의 반격! ${hero.name}에게 ${targetDmg} 피해`);
    }
    if (nextEnemyHp <= 0) {
      const rewardGems = stage % 3 === 0 ? 2 : 0;
      setGold((g) => g + enemy.reward);
      if (rewardGems) setGems((x) => x + rewardGems);
      setStage((s) => s + 1);
      setBattleLog([`승리! 골드 +${enemy.reward}${rewardGems ? `, 젬 +${rewardGems}` : ''}`, ...logs].slice(0, 10));
    } else {
      setBattleLog([`패배... 파티를 강화해보세요.`, ...logs].slice(0, 10));
    }
  };

  const resetSave = () => {
    localStorage.removeItem('sweet-kingdom-lite-save-v2');
    window.location.reload();
  };

  const tabs = [
    { id: 'battle', label: '전투', icon: Sword },
    { id: 'kingdom', label: '왕국', icon: Home },
    { id: 'summon', label: '영입', icon: Sparkles },
    { id: 'upgrade', label: '강화', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-violet-50 to-sky-100 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden border-0 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 text-white">
            <div className="grid gap-6 p-6 md:grid-cols-[1.4fr_1fr] md:p-8">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold"><Crown className="h-4 w-4" /> Sweet Kingdom Lite DX v2</div>
                <h1 className="mt-4 text-3xl font-black md:text-5xl">오리지널 디저트 왕국 RPG</h1>
                <p className="mt-3 max-w-2xl text-sm text-white/90 md:text-base">귀엽고 중독성 있는 스위트 판타지 세계에서 동료를 영입하고 왕국을 키우고 보스를 쓰러뜨리세요.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <div className="rounded-2xl bg-white/15 px-4 py-3">현재 스테이지 <span className="font-black">{stage}</span></div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3">보유 영웅 <span className="font-black">{owned.length}</span></div>
                  <div className="rounded-2xl bg-white/15 px-4 py-3">파티 전투력 <span className="font-black">{kingdomPower}</span></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Card className="bg-white/15 p-5 text-white"><div className="flex items-center gap-2 text-sm font-semibold"><Crown className="h-4 w-4" /> 골드</div><div className="mt-3 text-3xl font-black">{gold}</div></Card>
                <Card className="bg-white/15 p-5 text-white"><div className="flex items-center gap-2 text-sm font-semibold"><Gem className="h-4 w-4" /> 젬</div><div className="mt-3 text-3xl font-black">{gems}</div></Card>
                <Card className="col-span-2 bg-white/15 p-5 text-white"><div className="flex items-center gap-2 text-sm font-semibold"><Star className="h-4 w-4" /> 오늘 할 일</div><div className="mt-3 text-sm">전투 {quests.battle}/10 · 영입 {quests.summon}/10 · 강화 {quests.upgrade}/5</div></Card>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[260px_1fr]">
          <Card className="p-4">
            <div className="space-y-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = selectedTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setSelectedTab(tab.id)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-4 text-left font-bold transition ${active ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'}`}>
                    <Icon className="h-5 w-5" /> {tab.label}
                  </button>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6">
            {selectedTab === 'battle' && (
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-violet-600">현재 전투</div>
                    <div className="mt-1 text-3xl font-black">{enemy.name}</div>
                    <div className="mt-2 text-sm text-slate-500">HP {enemy.hp} · ATK {enemy.atk} · 보상 {enemy.reward} 골드</div>
                  </div>
                  <Button className="px-6 py-3 text-lg" onClick={fight}><Sword className="mr-2 inline h-5 w-5" /> 전투 시작</Button>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {party.map((hero) => (
                    <Card key={hero.id} className="border border-slate-100 p-5">
                      <div className="text-4xl">{hero.emoji}</div>
                      <div className="mt-3 text-lg font-bold">{hero.name}</div>
                      <Badge className={`mt-2 ${rarityColor[hero.rarity]}`}>{hero.rarity}</Badge>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-2xl bg-slate-50 p-3"><Heart className="mb-1 h-4 w-4" /> HP {hero.hp}</div>
                        <div className="rounded-2xl bg-slate-50 p-3"><Sword className="mb-1 h-4 w-4" /> ATK {hero.atk}</div>
                      </div>
                    </Card>
                  ))}
                </div>
                <Card className="mt-6 bg-slate-900 p-5 text-slate-100">
                  <div className="mb-3 text-lg font-bold">전투 로그</div>
                  <div className="space-y-2 text-sm">
                    {battleLog.map((log, i) => <div key={i} className="rounded-2xl bg-white/5 px-4 py-3">{log}</div>)}
                  </div>
                </Card>
              </Card>
            )}

            {selectedTab === 'kingdom' && (
              <Card className="p-6">
                <div className="mb-4 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl bg-emerald-50 p-5">
                    <div className="text-lg font-bold">일일 미션</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="rounded-2xl bg-white p-3">전투 10회: {quests.battle}/10 {quests.battle >= 10 ? '✅' : ''}</div>
                      <div className="rounded-2xl bg-white p-3">영입 10회: {quests.summon}/10 {quests.summon >= 10 ? '✅' : ''}</div>
                      <div className="rounded-2xl bg-white p-3">강화 5회: {quests.upgrade}/5 {quests.upgrade >= 5 ? '✅' : ''}</div>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-sky-50 p-5">
                    <div className="text-lg font-bold">왕국 정보</div>
                    <div className="mt-3 space-y-2 text-sm">
                      <div className="rounded-2xl bg-white p-3">보유 영웅 수: {owned.length}</div>
                      <div className="rounded-2xl bg-white p-3">현재 파티 전투력: {kingdomPower}</div>
                      <div className="rounded-2xl bg-white p-3">4초마다 자동 수입 +{incomePerTick} 골드</div>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <BuildingCard title="베이커리" icon="🥐" level={buildings.bakery} desc="기본 골드 생산" cost={80 * buildings.bakery} onUpgrade={() => upgradeBuilding('bakery')} />
                  <BuildingCard title="분수 광장" icon="⛲" level={buildings.fountain} desc="소량 골드 생산" cost={60 * buildings.fountain} onUpgrade={() => upgradeBuilding('fountain')} />
                  <BuildingCard title="캔디 캐슬" icon="🏰" level={buildings.castle} desc="전투력과 수입 증가" cost={120 * buildings.castle} onUpgrade={() => upgradeBuilding('castle')} />
                  <BuildingCard title="마법 연구소" icon="🧪" level={buildings.lab} desc="왕국 전투력 증가" cost={100 * buildings.lab} onUpgrade={() => upgradeBuilding('lab')} />
                  <BuildingCard title="디저트 마켓" icon="🛍️" level={buildings.market} desc="대량 골드 생산" cost={140 * buildings.market} onUpgrade={() => upgradeBuilding('market')} />
                </div>
              </Card>
            )}

            {selectedTab === 'summon' && (
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-violet-50 p-5">
                  <div>
                    <div className="text-lg font-semibold">젬으로 동료 영입</div>
                    <div className="text-sm text-slate-600">중복 영입 시 복사본이 쌓여 승급 재료가 됩니다.</div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => summon(1)}><Sparkles className="mr-2 inline h-4 w-4" /> 1회 영입</Button>
                    <Button variant="secondary" onClick={() => summon(10)}><Sparkles className="mr-2 inline h-4 w-4" /> 10회 영입</Button>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {owned.slice().sort((a,b) => calcPower(b)-calcPower(a)).map((hero) => {
                    const active = party.some((h) => h.id === hero.id);
                    return (
                      <motion.div key={hero.id} whileHover={{ y: -4 }}>
                        <Card className="p-5">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="text-3xl">{hero.emoji}</div>
                              <div className="mt-2 text-xl font-bold">{hero.name}</div>
                              <div className="mt-1 text-sm text-slate-500">{hero.role}</div>
                            </div>
                            <Badge className={rarityColor[hero.rarity]}>{hero.rarity}</Badge>
                          </div>
                          <p className="mt-3 text-sm text-slate-600">{hero.desc}</p>
                          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                            <div className="rounded-2xl bg-slate-50 p-3"><Heart className="mb-1 h-4 w-4" /> HP {hero.hp}</div>
                            <div className="rounded-2xl bg-slate-50 p-3"><Sword className="mb-1 h-4 w-4" /> ATK {hero.atk}</div>
                          </div>
                          <div className="mt-2 text-xs text-slate-500">Lv.{hero.level || 1} · 복사본 {hero.copies || 1}</div>
                          <Button variant={active ? 'secondary' : 'default'} className="mt-4 w-full" onClick={() => toggleParty(hero)}>
                            {active ? '파티에서 제외' : '파티에 추가'}
                          </Button>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </Card>
            )}

            {selectedTab === 'upgrade' && (
              <Card className="p-6 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={claimDaily} disabled={dailyClaimed}>출석 보상 받기</Button>
                  <Button variant="destructive" onClick={resetSave}>저장 초기화</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Card className="p-5"><div className="text-xl font-bold">⚔️ 설탕 검</div><div className="mt-1 text-sm text-slate-500">파티 공격력 증가</div><div className="mt-3">레벨 {equipment.sword}</div><Button className="mt-4" onClick={() => upgradeGear('sword')}>업그레이드 ({equipment.sword * 120} 골드)</Button></Card>
                  <Card className="p-5"><div className="text-xl font-bold">✨ 캔디 참</div><div className="mt-1 text-sm text-slate-500">회복/방어 보정</div><div className="mt-3">레벨 {equipment.charm}</div><Button className="mt-4" onClick={() => upgradeGear('charm')}>업그레이드 ({equipment.charm * 120} 골드)</Button></Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {owned.slice().sort((a,b) => calcPower(b)-calcPower(a)).slice(0, 24).map((hero) => (
                    <Card key={hero.id} className="p-5">
                      <div className="flex items-center justify-between"><div className="font-bold">{hero.emoji} {hero.name}</div><Badge className={rarityColor[hero.rarity]}>Lv.{hero.level || 1}</Badge></div>
                      <div className="mt-2 text-sm text-slate-500">복사본 {hero.copies || 1} · 전투력 {calcPower(hero)}</div>
                      <div className="mt-4 flex gap-2">
                        <Button onClick={() => levelUpHero(hero.id)}>레벨업</Button>
                        <Button variant="secondary" onClick={() => ascendHero(hero.id)}>승급</Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {showGachaResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">🎉 영입 결과</h2>
                  <p className="text-sm text-slate-500">새로운 동료들이 합류했어요!</p>
                </div>
                <Button variant="outline" onClick={() => setShowGachaResult(false)}>닫기</Button>
              </div>
              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                {gachaResult.map((hero, idx) => (
                  <motion.div key={`${hero.id}-${idx}`} initial={{ opacity: 0, scale: 0.8, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: idx * 0.04 }}>
                    <Card className="p-5 text-center">
                      <div className="text-4xl">{hero.emoji}</div>
                      <div className="mt-3 text-lg font-bold">{hero.name}</div>
                      <Badge className={`mt-2 ${rarityColor[hero.rarity]}`}>{hero.rarity}</Badge>
                      <div className="mt-3 text-sm text-slate-500">{hero.role}</div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
