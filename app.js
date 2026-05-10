const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
const html = document.documentElement;

const langBtn = $('#lang-btn'), themeBtn = $('#theme-btn');
const sLang = localStorage.getItem('pl-lang') || 'en';
const sTheme = localStorage.getItem('pl-theme') || 'dark';
html.setAttribute('data-lang', sLang);
html.setAttribute('data-theme', sTheme);
langBtn.textContent = sLang === 'en' ? 'EN' : '中';
langBtn.addEventListener('click', () => {
  const n = html.getAttribute('data-lang') === 'en' ? 'zh' : 'en';
  html.setAttribute('data-lang', n);
  localStorage.setItem('pl-lang', n);
  langBtn.textContent = n === 'en' ? 'EN' : '中';
});
themeBtn.addEventListener('click', () => {
  const n = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', n);
  localStorage.setItem('pl-theme', n);
});

// Hero timeline-branch SVG
$('#timeline-viz').innerHTML = `
  <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g1" x1="0" x2="1" y1="0" y2="0">
        <stop offset="0%" stop-color="var(--parallel)" stop-opacity="0.85"/>
        <stop offset="100%" stop-color="var(--era)" stop-opacity="0.85"/>
      </linearGradient>
    </defs>
    <line x1="50" y1="250" x2="450" y2="250" stroke="var(--parallel)" stroke-width="2.4" opacity="0.7"/>
    ${[100, 180, 250, 320, 400].map(x => `
      <circle cx="${x}" cy="250" r="6" fill="var(--parallel)"/>
      <line x1="${x}" y1="250" x2="${x}" y2="${100 + Math.random()*80}" stroke="var(--era)" stroke-width="1" opacity="0.5"/>
      <line x1="${x}" y1="250" x2="${x}" y2="${320 + Math.random()*80}" stroke="var(--mortality)" stroke-width="1" opacity="0.5"/>
    `).join('')}
    ${Array.from({length: 14}, (_, i) => {
      const x = 50 + Math.random() * 400;
      const y1 = 250;
      const y2 = 250 + (Math.random() - 0.5) * 320;
      return `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${i%3===0 ? 'var(--era)' : i%3===1 ? 'var(--rose)' : 'var(--fate)'}" stroke-width="0.8" opacity="0.45"/>
              <circle cx="${x}" cy="${y2}" r="2.5" fill="${i%3===0 ? 'var(--era)' : i%3===1 ? 'var(--rose)' : 'var(--fate)'}" opacity="0.85"/>`;
    }).join('')}
    <text x="250" y="40" text-anchor="middle" font-family="Spectral" font-style="italic" font-size="14" fill="var(--muted)">parallel branches</text>
    <text x="250" y="475" text-anchor="middle" font-family="JetBrains Mono" font-size="10" fill="var(--dim)" letter-spacing="3">160 SCENARIOS</text>
  </svg>`;

// dimensions
const dims = [
  { glow: 'parallel', en_t: 'Career attractor', zh_t: '职业吸引子',
    en_p: 'Pre-modern eras have a few high-attractor paths (court, clerisy, merchant guild) and dense low-attractor distribution. Modern eras flip this.',
    zh_p: '前现代年代少数高吸引子路径（朝廷、士大夫、商会）与密集的低吸引子分布。现代年代将其翻转。' },
  { glow: 'rose', en_t: 'Mate selection', zh_t: '配偶选择',
    en_p: 'Kinship structure dominates. The "love match" register most readers assume is a 19th–21st century industrial-era artifact; in most parallel lives, the question doesn\'t apply.',
    zh_p: '亲缘结构主导。多数读者默认的"爱情匹配"语域是 19–21 世纪工业时代的产物；在多数平行人生中，这问题并不适用。' },
  { glow: 'gold', en_t: 'Status mobility', zh_t: '地位流动性',
    en_p: 'A single number — how much status can move in one lifetime — that decides almost everything else about the felt texture of a life. Most pre-1800 worlds: low. Most post-1980 worlds: high but volatile.',
    zh_p: '一个数字——一生中地位能移动多少——它几乎决定了一段人生其余被感受到的质地。多数 1800 年前的世界：低。多数 1980 年后的世界：高但不稳。' },
  { glow: 'mortality', en_t: 'Emotional weather', zh_t: '情绪气候',
    en_p: 'Eras have signature affect. Late-Soviet life carried a flat, ironic register; Meiji a pressurized self-construction; Mars-2120 something we can only guess at — but probably loneliness against vast indoor architectures.',
    zh_p: '年代有签名性的情感。晚苏联人生带有平直、反讽的语域；明治带有受压的自我建构；火星 2120 我们只能猜测——但很可能是面对巨大室内建筑的孤独。' },
  { glow: 'fate', en_t: 'Death scenario', zh_t: '死亡情境',
    en_p: 'The hardest counterfactual to face honestly. Every era has a most-probable cause of death and a most-probable age range. The body that you are now would be subject to that distribution there. Most popular alternate-history media skips this.',
    zh_p: '最难诚实面对的反事实。每个年代都有最可能的死因与最可能的年龄区间。你此刻的这副身体在那里也会服从那一分布。多数大众平行历史媒体跳过此项。' },
];

function renderDims() {
  $('#dim-grid').innerHTML = dims.map(d => `
    <div class="card glow-${d.glow}">
      <h3><span lang="en">${d.en_t}</span><span lang="zh">${d.zh_t}</span></h3>
      <p><span lang="en">${d.en_p}</span><span lang="zh">${d.zh_p}</span></p>
    </div>`).join('');
}
renderDims();

// simulator
const eras = {
  song: {
    en_label: 'Song Dynasty China · 1100', zh_label: '宋朝中国 · 1100',
    en_career: 'a clerk in the salt monopoly bureau, with a chance — perhaps one in twenty — at the imperial examination',
    zh_career: '盐铁专卖司的一名小吏，有约二十分之一的机会能进入科举',
    en_relation: 'a marriage arranged by your aunt to consolidate two cousin lineages; affection grew or did not grow downstream of the contract',
    zh_relation: '由姑母安排、为巩固两支堂亲血脉的婚姻；情感是合约的下游产物，长出来或不长出来',
    en_status: 'mostly fixed by birth; a single examination success would lift the family for two generations',
    zh_status: '大体由出身决定；一次科举成功可让家族抬升两代',
    en_mood: 'a slow, river-paced melancholy; the empire feels permanent and you feel small',
    zh_mood: '一种缓慢、河流节奏的忧郁；帝国显得永恒而你显得渺小',
    en_death: 'fever in your forties, after a season of unusual rains',
    zh_death: '四十多岁时的一场热病，发生在一个雨水反常的季节后',
  },
  ottoman: {
    en_label: 'Ottoman Constantinople · 1620', zh_label: '奥斯曼君士坦丁堡 · 1620',
    en_career: 'a guild-trained tanner in a Greek-speaking quarter, paying a tax to the janissary garrison three times a year',
    zh_career: '希腊语街区里行会培训出的鞣皮匠，每年向禁卫军营纳三次税',
    en_relation: 'a wife from the same quarter; a long correspondence with a cousin in Smyrna; one child who survived past three',
    zh_relation: '同街区的妻子；一位与士麦那表亲的长期通信；一个活过三岁的孩子',
    en_status: 'capped by religious millet; mobility happens through trade, not state',
    zh_status: '由宗教米利特封顶；流动通过贸易、不通过国家',
    en_mood: 'cosmopolitan but anxious; the empire is wealthy but the next plague is always one ship away',
    zh_mood: '世界主义但焦虑；帝国富裕，但下一场瘟疫总在下一艘船上',
    en_death: 'plague in your fifties; you survive the first round, not the second',
    zh_death: '五十多岁时的瘟疫；你活过第一轮，没活过第二轮',
  },
  meiji: {
    en_label: 'Meiji Tokyo · 1880', zh_label: '明治东京 · 1880',
    en_career: 'a clerk at one of the new Western-style trading houses; a part-time student at an English-language night school',
    zh_career: '新设西式商社的一名职员；夜校的英语兼职学生',
    en_relation: 'a marriage your parents and the family go-between negotiated, with a brief courtship of five visits; sentiment in this era was being publicly invented',
    zh_relation: '父母与媒人协商的婚事，有五次拜访的短暂交往；这个年代正在公共发明"情感"',
    en_status: 'high mobility for the talented and lucky; the modernization machine devours generations as input',
    zh_status: '对有才者与运气好者流动性高；现代化机器把世代当作输入吞噬',
    en_mood: 'pressurized self-construction; you spend evenings rewriting yourself in three languages',
    zh_mood: '受压的自我建构；你花夜晚以三种语言重写自己',
    en_death: 'tuberculosis in your sixties, in a Tokyo whose skyline you would not have recognized at twenty',
    zh_death: '六十多岁时的肺结核，那时东京的天际线已是你二十岁时认不出的',
  },
  soviet: {
    en_label: 'Late Soviet Moscow · 1980', zh_label: '晚苏联莫斯科 · 1980',
    en_career: 'an engineer at a research institute; access to the canteen, the union flat, the summer dacha; bread is plentiful, oranges are not',
    zh_career: '研究所的一名工程师；可去食堂、工会公寓、夏日别墅；面包充足，橘子不是',
    en_relation: 'a marriage from university; a divorce in your thirties; a long affair that no one above forty mentions',
    zh_relation: '大学时期的婚姻；三十多岁的离婚；一段四十岁以上的人都不提的长久外遇',
    en_status: 'a horizontal society pretending to be flat; the real coordinates are guild and party, not class',
    zh_status: '一个假装扁平的横向社会；真实坐标是行会与党，不是阶级',
    en_mood: 'flat ironic register; private warmth, public deadpan; the system claims to know what you want',
    zh_mood: '平直反讽的语域；私下温热，公开面无表情；系统声称知道你想要什么',
    en_death: 'a heart attack in your seventies, after a winter you found unusually quiet',
    zh_death: '七十多岁的一次心脏病发作，发生在你觉得异常安静的一个冬天后',
  },
  future: {
    en_label: 'Mars Colony · 2120', zh_label: '火星殖民地 · 2120',
    en_career: 'a third-generation life-support technician in a domed sector of 14,000 people; the Earth contract is renewed every seven years',
    zh_career: '一个 14,000 人穹顶分区的第三代生命支持技师；地球合约每七年续签',
    en_relation: 'a partnership that resembles older Earth marriages but is not legally one; both of you have grandparents you have never met in person',
    zh_relation: '一段与旧地球婚姻相似但法律上不同的伴侣关系；你俩都有素未谋面的祖辈',
    en_status: 'mobility runs along skill ladders entirely internal to the colony; Earth-rank means little here',
    zh_status: '流动性沿完全内部于殖民地的技能阶梯运行；地球级别在此意义不大',
    en_mood: 'loneliness against vast indoor architectures; the sky is a screen most days; you grew up with this and only sometimes notice',
    zh_mood: '面对巨大室内建筑的孤独；天空多数日子是一面屏幕；你在此长大，只偶尔注意到',
    en_death: 'a slow respiratory decline in your nineties; you ask, and are not granted, return-to-Earth in your last year',
    zh_death: '九十多岁的缓慢呼吸衰退；你在最后一年请求返回地球，未获批准',
  },
};
const placeMods = {
  capital: { en: 'closer to power, farther from the soil', zh: '离权力更近，离土地更远' },
  port: { en: 'oriented to the next ship, not the next harvest', zh: '面向下一艘船，不面向下一次收成' },
  border: { en: 'most years quiet, the few that aren\'t define the rest', zh: '多数年份平静，少数不平静的定义其他一切' },
  village: { en: 'three families decide everything; they have for centuries', zh: '三个家族决定一切；他们已决定数百年' },
  monastery: { en: 'time is measured in liturgy; the world arrives by letter', zh: '时间以礼仪丈量；世界以信件抵达' },
  frontier: { en: 'cheaper land, harder winters; rules thinner, prices higher', zh: '土地更便宜、冬天更艰难；规则更稀薄、价格更高' },
  university: { en: 'books cheap, careers narrow; you marry into the institution', zh: '书便宜、职业窄；你嫁娶进入这座制度' },
  market: { en: 'a calendar built around fair days; status updates every season', zh: '一份围绕集市日构建的日历；地位每季更新' },
};
const endowMods = {
  literate: { en: 'your reading buys you nothing here at first; it pays in your forties', zh: '你识的字起初在这里买不到任何东西；它在你四十多岁时才支付' },
  merchant: { en: 'a small starting capital and a network worth more than the capital', zh: '一份起始的小资本，以及一份比资本更值钱的网络' },
  craft: { en: 'a guild that protects you and constrains you, in roughly equal parts', zh: '一个保护你也约束你的行会，比例大致相当' },
  peasant: { en: 'land you do not own and a family that has worked it for nine generations', zh: '不属于你的土地，以及已在其上劳作九代人的家族' },
};

function runSim() {
  const era = $('#s-era').value;
  const place = $('#s-place').value;
  const endow = $('#s-endow').value;
  const e = eras[era];
  const lang = html.getAttribute('data-lang');
  const k = lang === 'en' ? 'en' : 'zh';
  const placeMod = placeMods[place][k];
  const endowMod = endowMods[endow][k];

  if (lang === 'en') {
    $('#sim-out').innerHTML = `
      <h4>${e.en_label}</h4>
      <p style="color: var(--muted); font-style: italic;">A life ${placeMod}; ${endowMod}.</p>
      <div class="dim">Career</div><p>You are ${e.en_career}.</p>
      <div class="dim">Relationships</div><p>You enter ${e.en_relation}.</p>
      <div class="dim">Status mobility</div><p>${e.en_status[0].toUpperCase() + e.en_status.slice(1)}.</p>
      <div class="dim">Emotional weather</div><p>${e.en_mood[0].toUpperCase() + e.en_mood.slice(1)}.</p>
      <div class="dim">Death scenario</div><p>You die of ${e.en_death}.</p>`;
  } else {
    $('#sim-out').innerHTML = `
      <h4>${e.zh_label}</h4>
      <p style="color: var(--muted); font-style: italic;">一段${placeMod}的人生；${endowMod}。</p>
      <div class="dim">职业</div><p>你是${e.zh_career}。</p>
      <div class="dim">关系</div><p>你进入${e.zh_relation}。</p>
      <div class="dim">地位流动性</div><p>${e.zh_status}。</p>
      <div class="dim">情绪气候</div><p>${e.zh_mood}。</p>
      <div class="dim">死亡情境</div><p>你死于${e.zh_death}。</p>`;
  }
}
$('#sim-go').addEventListener('click', runSim);

// counterfactual probes
const probes = [
  { id: 'born-elsewhere',
    en_t: 'Born Elsewhere', zh_t: '生于他处',
    en_h: 'How much of who I am would survive being born in a different place?',
    zh_h: '生在不同的地方，"我是谁"中有多少会幸存？',
    en_a: `Less than the romantic answer suggests, more than the deterministic one does.

The body — its baseline temperament, its sensory thresholds, its endocrine register — would travel. The personality you have built on top of it would not. Personality is a context-conditioned policy network; change the context, and a different policy network forms over the same base. The rough estimate from twin studies is that around 40–50% of the variance in adult traits would track the body across worlds. The other half is being made on site.

Three things that would specifically break. (1) Most of your tastes. Tastes are a product of what was available, what was prestigious, and what your local network reinforced; almost none of those would carry. (2) Most of your defenses. Defensive patterns are calibrated to the rooms you actually walked into; a different set of rooms produces a different set of defenses. (3) The narrative shape of your life. We tell ourselves we are the choices we made; in fact we are mostly the constraint sets we navigated, and a different set produces a different shape almost regardless of the choices.

What would survive: the body's tempo, the underlying temperament, and a particular kind of attentional grain — the way you tend to look at the world. That last one is small, but it is durable, and it is the closest thing to "you" that a counterfactual leaves intact.

What this engine refuses to pretend: that the answer is comforting. Most of what you think of as essential to you is downstream of constraint. That is not a tragedy; it is the nature of being a particular animal in a particular world. Other lives would have been different in ways you would mostly approve of and would not be able to imagine in advance.`,
    zh_a: `比浪漫答案所暗示的少；比决定论答案所暗示的多。

身体——它的基线性情、感官阈值、内分泌语域——会随行。建在它之上的人格不会。人格是随语境切换的策略网络；换语境，同一身体之上会形成另一组策略网络。双胞胎研究的粗略估计是：成人特质方差中约 40–50% 会带着身体跨越世界。另一半是当场制造的。

三种会专门碎裂的东西。(1) 你的多数品味。品味是"可得之物 × 有声望之物 × 本地网络强化之物"的产物；这几乎没有一项可以带走。(2) 你的多数防御。防御模式是对你实际走进过的房间所做的校准；另一组房间产生另一组防御。(3) 你人生的叙事形状。我们告诉自己"我是我做出的选择"；事实上我们多半是"我们所穿越的约束集"，另一组约束集产生另一种形状，几乎与选择无关。

什么会幸存：身体的节奏、底层性情，以及一种特定的注意力颗粒——你看世界的方式。最后这一项很小，但耐久，是反事实留下完整无缺的、最接近"你"的东西。

本引擎拒绝假装的事：答案是令人安慰的。你以为自己最本质的部分，多半是约束的下游。这不是悲剧，是"特定动物在特定世界"的本性。其他人生会以你大体会赞许、但事先无法想象的方式不同。` },
  { id: 'mortality',
    en_t: 'Mortality Field', zh_t: '死亡场',
    en_h: 'Why does popular alternate-history skip how I would have died?',
    zh_h: '为何大众平行历史跳过"我会怎样死去"？',
    en_a: `Because it sells less.

The genre's reader is usually picturing themselves as the protagonist, and the protagonist needs to survive long enough to have the adventure. Honest mortality fields are mostly fatal. In 1620 Constantinople, a non-trivial fraction of any cohort would not see thirty; in 1100 Song China, the figure is worse. The honest counterfactual most often ends with you dead before the interesting part of the story begins.

Three things popular alternate-history hides. (1) Childhood mortality. Pre-1900 worlds lose 20–40% of children before five. The "you" that arrives at the era's adult adventure is a survivorship-biased "you." (2) Female mortality in childbirth. In most pre-modern eras, women died at childbirth at rates that rearranged whole social structures and that fiction tends to obscure. (3) Cause-of-death banality. Most people died of fevers, diarrhea, complications from minor wounds, and slow respiratory decline. Heroic deaths are statistically rare. A truthful counterfactual reads small, not epic.

What this engine offers instead: a death scenario that matches the era's actual mortality profile, picked from the most-probable bin rather than the most-narratively-satisfying one. It will rarely flatter; that is the point.

What this engine will not pretend: that the alternative is morbid. Including mortality is what distinguishes a counterfactual from a costume drama. If the simulator's life ends in a quiet fever rather than an empire-shaking event, that is the simulator being honest, not pessimistic.`,
    zh_a: `因为这卖得少。

类型的读者通常把自己想象成主角，主角必须活得足够久才能开展冒险。诚实的死亡场多半是致命的。在 1620 年的君士坦丁堡，任何一个出生群体中不平凡的一部分活不到三十；在 1100 年的宋代中国，这数字更糟。诚实的反事实多数以你在故事最有趣的部分开始之前就死去而告终。

大众平行历史隐藏的三件事。(1) 儿童死亡率。1900 年前的世界在五岁前损失 20–40% 的儿童。能抵达年代成人冒险的"你"，是经过幸存者偏差筛选的"你"。(2) 产妇死亡率。多数前现代年代里，女性产时死亡率会重排整个社会结构，而虚构倾向于遮蔽。(3) 死因的平庸。多数人死于发热、痢疾、小伤口的并发症与缓慢呼吸衰退。英雄式死亡在统计上罕见。诚实的反事实读起来小，不史诗。

本引擎所提供的替代：一份匹配年代真实死亡剖面的死亡情境，从最可能的桶里挑——而非从叙事上最令人满足的桶里挑。它很少奉承；这正是要点。

本引擎不会假装的事：替代是阴郁的。把死亡纳入，是把反事实与历史戏装剧区分开的关键。如果模拟器的人生以一场安静的发热结束，而不是以撼动帝国的事件结束，那是模拟器在诚实，不是悲观。` },
  { id: 'self-stays',
    en_t: 'What Stays', zh_t: '什么会留下',
    en_h: 'Across all eras, what part of me actually doesn\'t change?',
    zh_h: '跨越所有年代，我身上真正不变的部分是什么？',
    en_a: `Probably four things, in declining order of confidence.

(1) Sensory grain. The way you process colour, sound, texture, distance — your particular set of just-noticeable differences and your particular registers of beautiful — appears to be largely body-resident and travels almost intact. Whether the world contains baroque music or only flute is up to the era; the way your body listens does not change. (2) Tempo. Some bodies move quickly through tasks and slowly through transitions; some are the inverse. This pattern is built into the nervous system, and the era cannot reach into the nervous system to rewrite it. (3) Tolerance for solitude. The variance is large, the distribution is durable, and most lives end up reorganising themselves around it within a decade no matter what the era expects. (4) The kind of question you find interesting. This is the most surprising one to most readers; whether you are a person who asks "why" questions or "how" questions or "who-decides" questions appears to be remarkably stable across imagined lives.

What does not stay: most opinions, most aesthetic preferences in their specific content, most defenses, most ambitions, and the entire narrative through-line of your current life.

What this engine refuses to pretend: that the four are reassuringly large. They are small. But they are also durable, and over the course of a lifetime the small durable things win. The fact that something this thin survives across worlds is, in its own way, more interesting than the romantic claim that "the real you" survives intact.`,
    zh_a: `大概有四件事，按置信度递减排列。

(1) 感官颗粒。你处理颜色、声音、质地、距离的方式——你特定的"恰可注意差异"集合，你特定的"美"的语域——大体上驻留于身体之中，几乎完整地随行。世界中是否有巴洛克音乐还是只有横笛由年代决定；你的身体如何聆听不会改变。(2) 节奏。某些身体快速通过任务、缓慢通过过渡；某些相反。这一模式被嵌入神经系统，年代无法伸手进神经系统去改写。(3) 对独处的耐受。方差很大，分布持久，多数人生在十年内会围绕它重组自己——无论年代期待什么。(4) 你觉得有趣的那种问题。这对多数读者最意外；你是问"为什么"的人，还是问"如何"，还是问"谁来决定"——这一点在想象的人生间显得异常稳定。

不会留下的：多数观点、多数审美偏好的具体内容、多数防御、多数野心，以及你当前人生的全部叙事主线。

本引擎拒绝假装的事：这四项大到令人安心。它们很小。但它们也持久，而在一生的尺度上，小而持久的事物胜出。"如此稀薄的东西居然能跨越世界幸存"，比"真实的你完整无损地幸存"这种浪漫主张，以它自己的方式更有趣。` },
  { id: 'best-era',
    en_t: 'Best Era To Live In', zh_t: '最适合活的年代',
    en_h: 'Which simulated era would actually be best for me?',
    zh_h: '哪一个模拟年代实际上对我最合适？',
    en_a: `The honest answer is the one most people don't want: probably the era you already live in.

Three reasons you should distrust your own preference here. (1) Survivorship bias. The eras you romanticise are the ones whose surviving documents are over-represented in your reading. Song poetry survives because Song printers were good; the lives behind the poetry mostly didn't. You are reading the postcards, not the labour. (2) The constraint match. The era that suits you best is the one whose constraint set lets your particular body and particular temperament reach the highest sustained equilibrium. The current era fits your body's medical baseline (vaccines, dentistry, surgery), your temperament's tolerance band (most people in this era can choose how social to be), and your particular taste-grain (most aesthetics from history are, for the first time, simultaneously available). (3) The future-shock discount. Reading about another era is cheap; living in it costs the entire interior of your inherited assumptions.

What other eras would offer: lower opportunity volatility (most pre-modern lives), slower metabolic load on the nervous system (most pre-1900 lives), and a more legible status hierarchy (almost all). The trade is mortality, mobility loss, and the specific freedoms that turn out — once you imagine losing them — to be the ones you actually want.

What this engine will not pretend: that the answer is the same for every reader. Some specific bodies and temperaments would in fact be better matched to a specific past era. But the reflexive "I would have been better off in [era]" is usually a complaint about the present dressed as a counterfactual, not a real diagnosis.`,
    zh_a: `诚实的答案是多数人不想听到的：大概是你已身处的这个年代。

三个理由让你不信任此处自己的偏好。(1) 幸存者偏差。你浪漫化的年代，是其幸存文献在你阅读中被过度代表的年代。宋诗能幸存，因为宋代刻工出色；诗背后的人生多数未能。你读的是明信片，不是劳作。(2) 约束匹配。最适合你的年代，是其约束集允许你这副特定身体与特定性情达到最高持续均衡的那个年代。当前年代匹配你身体的医疗基线（疫苗、牙科、外科）、你性情的容忍带（此年代多数人可选择多社交化），以及你特定的味道颗粒（历史上的多数美学，史上首次同时可得）。(3) 未来冲击折扣。读别的年代便宜；活在其中要花掉你继承假设的全部内里。

其他年代会提供的：更低的机会波动（多数前现代人生）、神经系统更慢的代谢负荷（多数 1900 年前的人生），以及更可读的地位层级（几乎全部）。交易代价是死亡率、流动性的丧失，以及一旦想象失去就会发现你真正想要的那些具体自由。

本引擎不会假装的事：答案对每位读者都相同。某些特定身体与性情，确实会更匹配某个具体过去年代。但反射性地说"我若生于 [某年代] 会更好"，通常是穿着反事实外衣的、对当下的抱怨——不是真正的诊断。` },
  { id: 'identity',
    en_t: 'Identity Across Lives', zh_t: '跨人生的身份',
    en_h: 'Are these "alternate me"s actually me, or someone else with my body?',
    zh_h: '这些"另一个我"真的是我，还是借用我身体的别人？',
    en_a: `The honest answer is closer to "someone else with your body" than most readers want.

The continuity that makes you you is autobiographical: it is the chain of memories, the settled tastes, the defended commitments, the friendships in their actual form. None of that survives transposition. The Song clerk in the simulator above shares your body's tempo and your particular sensory grain — he does not share a single specific memory you have, a single relationship you have built, or a single commitment you have ratified. He is, in the technical sense most philosophers of personal identity use, a different person who happens to be biologically continuous with you in a counterfactual world that does not exist.

What this means in practice: the simulator is not a window into "what you would have been." It is a window into what a body like yours could have grown into under a different constraint set. The grammar of "you" in those sentences is loose, and the looseness is the point. Treat the alternate biographies the way you treat photographs of distant cousins: there is family resemblance, but the life is theirs, not yours.

The interesting consequence: the version of you reading this paragraph right now is not the unique result of your body. It is one of many possible adult forms that body could have settled into, and the path that produced this particular form is mostly luck. That observation, taken seriously, tends to make people slightly kinder to themselves. The current self is not the destination of a long meritocratic process; it is a contingent outcome that the body and the constraint set co-produced. There is no one to compete with across the worlds.

What this engine will not pretend: that this is a comforting frame for everyone. Some readers will find the looseness liberating; others will find it disorienting. Both reactions are reasonable; the looseness is empirical.`,
    zh_a: `诚实的答案，比多数读者想要的更接近"借用你身体的别人"。

让你成为你的连续性是自传式的：它是记忆链、稳定的品味、被守护的承诺、以实际形式存在的友谊。这些没有一项可以经移位幸存。上面模拟器里的宋代小吏，分享你身体的节奏与你特定的感官颗粒——他不分享你拥有的任何一段具体记忆、你建立的任何一段关系、你批准过的任何一项承诺。在多数人格同一性哲学家所用的技术意义上，他是一个与你在一个不存在的反事实世界中"生物上连续"的不同的人。

这在实践中的意思：模拟器不是窥见"你本会成为什么"的窗口。它是窥见"像你这样的身体在不同约束集下能长成什么"的窗口。这些句子里"你"的语法是松的，松散正是要点。把另一些小传当远房表亲的照片对待：有家族相似，但生活是他们的，不是你的。

有趣的推论：此刻在读这段的你，不是你身体的唯一结果。它是那副身体本可以稳定下来的众多可能成人形态之一，而产生这个特定形态的路径多半是运气。这一观察被认真对待时，常让人对自己稍微仁慈一点。当前的自我不是一个漫长精英化过程的终点，是身体与约束集共同生产的偶然结果。没有谁可以跨越各世界与你争。

本引擎不会假装的事：这个框架对所有人都安慰。有些读者会觉得松散是解放的；有些会觉得它令人迷失方向。两种反应都合理；松散是经验性的。` },
];

function renderProbes() {
  $('#prompt-grid').innerHTML = probes.map(p => `
    <button class="prompt-btn" data-id="${p.id}">
      <span class="pt-tag">probe</span>
      <strong><span lang="en">${p.en_t}</span><span lang="zh">${p.zh_t}</span></strong>
      <div style="margin-top:6px; color: var(--muted); font-size: 12px;"><span lang="en">${p.en_h}</span><span lang="zh">${p.zh_h}</span></div>
    </button>`).join('');
  $$('.prompt-btn').forEach(b => b.addEventListener('click', () => {
    const p = probes.find(x => x.id === b.dataset.id);
    const lang = html.getAttribute('data-lang');
    $('#mirror-out').textContent = lang === 'en' ? p.en_a : p.zh_a;
  }));
}
renderProbes();

function heuristicProject(text) {
  const lang = html.getAttribute('data-lang');
  const t = text.toLowerCase();
  const has_year = /\d{4}/.test(t);
  const has_place = /(china|tokyo|moscow|rome|london|paris|new york|shanghai|beijing|mumbai|cairo|中国|日本|俄|罗马|伦敦|巴黎|上海|北京|开罗)/.test(t);
  const has_what = /(if|would|could|might|如果|本会|可能)/.test(t);

  if (lang === 'en') {
    return `Heuristic projection · era anchored: ${has_year ? 'yes' : 'no'} · place anchored: ${has_place ? 'yes' : 'no'} · counterfactual register: ${has_what ? 'yes' : 'no'}.

Three things to consider:

(1) ${has_year && has_place ? `Both era and place are named. The simulator above has eight places × five eras templated; pick the closest pair and run it for the structured output, then return here for the counterfactual you actually want answered.` : has_year ? `Year named, place not. The same year produces wildly different lives in different places — capital vs. countryside is often a larger axis than century. Pick a place and re-ask.` : has_place ? `Place named, year not. Same place across two centuries can be unrecognisable. Pick a year and re-ask.` : `Neither era nor place anchored. The free-text mode can't project without coordinates; pick at least one.`}

(2) ${has_what ? `Counterfactual register present. Note: the more specific your "if," the cheaper the projection. "If I had been born in 1880 Tokyo to a merchant family" produces a sharper output than "if I had been born somewhere else."` : `No counterfactual register detected. If you're describing a real concern dressed as a counterfactual, the simulator can't help — the canned probes about identity-across-lives or best-era are closer.`}

(3) The probes above are cleaner than this fallback. Pick the closest one for a fully written response.`;
  } else {
    return `启发式投射 · 年代锚定：${has_year ? '有' : '无'} · 地点锚定：${has_place ? '有' : '无'} · 反事实语域：${has_what ? '有' : '无'}。

三点可考虑的：

(1) ${has_year && has_place ? `年代与地点都已命名。上方的模拟器有 8 地点 × 5 年代的模板；挑最贴近的一对运行得到结构化输出，再回到此处询问你真正想问的反事实。` : has_year ? `命名了年份，未命名地点。同一年在不同地点产出截然不同的人生——首都对比乡村，常比世纪是更大的轴。挑一个地点再问。` : has_place ? `命名了地点，未命名年份。同一地点跨两世纪可能不可辨认。挑一年再问。` : `年代与地点都未锚定。自由文本模式没有坐标无法投射；至少挑其一。`}

(2) ${has_what ? `存在反事实语域。注意：你的"如果"越具体，投射越便宜。"如果我生于 1880 年东京一个商人家庭"产生的输出比"如果我生在别处"更锋利。` : `未检测到反事实语域。若你在用反事实外衣描述一个现实关切，模拟器帮不上——关于"跨人生身份"或"最适合的年代"的预设探针更贴近。`}

(3) 上方的探针比这个回退更干净。挑最贴近的一个，可得到完整成型的回答。`;
  }
}

$('#mirror-go').addEventListener('click', () => {
  const text = $('#mirror-input').value.trim();
  if (!text) return;
  $('#mirror-out').textContent = heuristicProject(text);
});
