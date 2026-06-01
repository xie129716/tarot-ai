import type { TarotCard } from '@/types';

const MAJOR_ARCANA: TarotCard[] = [
  {
    id: 0, name: '愚者', arcana: 'major',
    keywords: ['新的开始', '冒险', '天真', '自由', '信念'],
    meaningUpright: '代表新的开始与无限可能。你正站在一段旅程的起点，怀着赤子之心，未来充满未知但令人期待。相信你的直觉，勇敢迈出第一步。',
    meaningReversed: '可能代表鲁莽冲动或不愿面对现实。提醒你审视自己的选择，避免天真地忽略风险。也许你正在逃避某个重要的决定。',
    symbolism: '悬崖边缘的旅人，带着小小行囊仰望天空。脚边的小狗象征着直觉与警觉。',
    imagePath: '/card-images/rws-major-00.jpg',
  },
  {
    id: 1, name: '魔术师', arcana: 'major',
    keywords: ['创造力', '行动', '专注', '技能', '意志力'],
    meaningUpright: '你拥有实现目标所需的全部资源与能力。现在是行动的时刻，集中意志力，将想法转化为现实。你手中的工具远比你意识到的强大。',
    meaningReversed: '可能暗示能力未被善用，或是在欺骗与操纵之中。检视自己的动机，确保你正以诚实的方式运用自己的力量。',
    symbolism: '桌前站立着举起魔杖的魔术师，桌上摆放着代表四元素的圣杯、宝剑、权杖与星币。',
    imagePath: '/card-images/rws-major-01.jpg',
  },
  {
    id: 2, name: '女祭司', arcana: 'major',
    keywords: ['直觉', '潜意识', '智慧', '神秘', '内省'],
    meaningUpright: '倾听内心的声音。有些答案无法在外部世界找到，它们深藏在你的潜意识中。保持静默与观察，让直觉引导你。',
    meaningReversed: '你可能正在忽略直觉的警告。或是隐藏了太多秘密，导致内心失去平衡。是时候面对被你压抑的真实感受。',
    symbolism: '坐在神殿入口的女祭司，手捧知识卷轴，身后帷幕垂落。黑白双柱象征二元对立。',
    imagePath: '/card-images/rws-major-02.jpg',
  },
  {
    id: 3, name: '皇后', arcana: 'major',
    keywords: ['丰饶', '母性', '自然', '感官', '创造力'],
    meaningUpright: '繁荣与丰盛的时期已经到来。拥抱你感性的一面，在自然中寻找滋养。无论是创作、关系还是事业，都在生长与蓬勃。',
    meaningReversed: '可能提醒不要过度依赖他人，或是在照顾他人时忽略了自己。也可能是创造力的枯竭期，需要重新连接内心。',
    symbolism: '皇冠加冕的女性坐在丰饶的自然之中，周围环绕成熟的麦穗与茂密的森林。金星符号出现在她的脚下。',
    imagePath: '/card-images/rws-major-03.jpg',
  },
  {
    id: 4, name: '皇帝', arcana: 'major',
    keywords: ['权威', '结构', '秩序', '掌控', '领导力'],
    meaningUpright: '现在需要纪律与结构。建立秩序，承担责任，以坚定的意志引领自己或他人。规则与边界为你提供安全的基础。',
    meaningReversed: '可能代表权力的滥用，过度控制，或是权威人物的负面影响。也可能是你需要放松对事物的掌控。',
    symbolism: '端坐于石座上的皇帝，身披铠甲与红袍，手握权杖。背后是荒芜的山脉，象征他征服的领域。',
    imagePath: '/card-images/rws-major-04.jpg',
  },
  {
    id: 5, name: '教皇', arcana: 'major',
    keywords: ['传统', '信仰', '教导', '智慧', '精神指引'],
    meaningUpright: '向传统与智慧寻求指引。或许你需要一位导师，或是在既定的体系内学习。坚守你的价值观，它们会带给你力量。',
    meaningReversed: '挑战传统观念的时刻。你或许感到被教条所束缚，需要找到自己独特的信仰之路。不要盲目追随权威。',
    symbolism: '头戴三重冠冕的教皇坐在双柱之间，两名信徒跪于面前。两把交叉的钥匙象征通往天国的权柄。',
    imagePath: '/card-images/rws-major-05.jpg',
  },
  {
    id: 6, name: '恋人', arcana: 'major',
    keywords: ['爱', '结合', '选择', '和谐', '价值观'],
    meaningUpright: '真挚的连接正在形成——无论是对人还是对你所热爱的事业。一个重要的选择摆在你面前，追随你的内心与价值观。',
    meaningReversed: '可能代表关系中的不和谐，或是一个错误的选择。你需要审视自己的价值观，避免因冲动做出违背本心的决定。',
    symbolism: '伊甸园中的男女，天使拉斐尔在上方展开双臂。远处的高山象征抉择后的旅程。',
    imagePath: '/card-images/rws-major-06.jpg',
  },
  {
    id: 7, name: '战车', arcana: 'major',
    keywords: ['胜利', '意志', '决心', '控制', '奋进'],
    meaningUpright: '通过意志力与自律，你将克服眼前的障碍。前进的势能已无法阻挡。但记住，真正的力量来自内心的平衡，而非单纯的强硬。',
    meaningReversed: '你可能正在失去对局势的掌控。内部分歧或对立的欲望拖住了你的脚步。停下整顿，找回内心的方向感。',
    symbolism: '战士驾驭着黑白双兽牵引的战车，星冠加身。战车没有缰绳，全靠意志力驱动。',
    imagePath: '/card-images/rws-major-07.jpg',
  },
  {
    id: 8, name: '力量', arcana: 'major',
    keywords: ['勇气', '内在力量', '耐心', '同情', '驯服'],
    meaningUpright: '真正的力量不是暴力，而是耐心与慈悲。你拥有驯服内心野兽的能力。以温柔而坚定的方式面对挑战。',
    meaningReversed: '你可能正感到脆弱无力，或是被恐惧所支配。提醒你重新连接内在的力量源泉——它从未消失。',
    symbolism: '身着白衣的女子轻抚狮子的口鼻，头上是无尽符号。背景一片祥和宁静。',
    imagePath: '/card-images/rws-major-08.jpg',
  },
  {
    id: 9, name: '隐士', arcana: 'major',
    keywords: ['内省', '独处', '智慧', '指引', '寻求'],
    meaningUpright: '暂时从喧嚣中退隐，在独处中寻找智慧。你手中的灯火会照亮前路。这段内省期将带给你宝贵的洞见。',
    meaningReversed: '可能代表过度的孤立，或是在需要帮助时拒绝与他人联系。也可能是你已经找到了答案，却仍在犹豫不前。',
    symbolism: '手持提灯的老者独自站在雪山之巅，灯光照亮眼前一步之地。',
    imagePath: '/card-images/rws-major-09.jpg',
  },
  {
    id: 10, name: '命运之轮', arcana: 'major',
    keywords: ['命运', '周期', '转折', '运气', '变化'],
    meaningUpright: '命运之轮正在转动。变化已经不可阻挡，无论你喜不喜欢。拥抱这个转折点，好运正向你走来。',
    meaningReversed: '可能代表厄运期，或是对变化的抗拒。记住，轮子总是会再转的——没有永久的低谷。',
    symbolism: '巨轮上刻画着各种符号，三只神兽环绕其中，四角落的天使守望着。',
    imagePath: '/card-images/rws-major-10.jpg',
  },
  {
    id: 11, name: '正义', arcana: 'major',
    keywords: ['公正', '真相', '因果', '平衡', '责任'],
    meaningUpright: '真相将被揭示，公正会到来。你过去的行为正在产生相应的结果。做出合乎道德的决定，为自己的选择负责。',
    meaningReversed: '可能指向不公、偏见，或是在逃避后果。也许是时候坦诚面对某个被你回避的真相了。',
    symbolism: '手持天秤与宝剑的女性端坐于帷幕之间。天秤衡量真相，宝剑裁断是非。',
    imagePath: '/card-images/rws-major-11.jpg',
  },
  {
    id: 12, name: '倒吊人', arcana: 'major',
    keywords: ['牺牲', '暂停', '新视角', '放手', '臣服'],
    meaningUpright: '以全新的角度看待事物。暂停行动，接受当下的局限。有时候，最大的智慧在于放手与臣服。',
    meaningReversed: '你或许在做无谓的牺牲，或是不愿从新的角度看待问题。也可能是你已停滞太久，需要挣脱束缚向前走。',
    symbolism: '男子被倒吊在T形木架上，一只脚悬在树上，面容安详。他选择以倒转的视角看世界。',
    imagePath: '/card-images/rws-major-12.jpg',
  },
  {
    id: 13, name: '死神', arcana: 'major',
    keywords: ['结束', '转变', '重生', '放手', '蜕变'],
    meaningUpright: '一个重要的阶段正在结束。虽然告别令人痛苦，但这是新生的前提。放下那些已不再服务于你的人事物。',
    meaningReversed: '你正在抗拒必要的改变。紧抓过去不肯放手只会延长痛苦。接受"结束"本身就是生命的一部分。',
    symbolism: '身披黑甲的骷髅骑士骑着白马，面前倒下的人象征着旧我的消亡。远处太阳正在升起。',
    imagePath: '/card-images/rws-major-13.jpg',
  },
  {
    id: 14, name: '节制', arcana: 'major',
    keywords: ['平衡', '调和', '耐心', '中庸', '融合'],
    meaningUpright: '找到平衡点。不极端、不偏执，在调和之中发现真正的力量。耐心等待，让事物自然融合。',
    meaningReversed: '可能代表失衡或过度放纵。你的生活某个方面也许已经失控，需要重新校准。',
    symbolism: '天使将圣杯中的水在两杯之间倒换，一脚踏入水面，一脚踏在岸边。',
    imagePath: '/card-images/rws-major-14.jpg',
  },
  {
    id: 15, name: '恶魔', arcana: 'major',
    keywords: ['束缚', '欲望', '成瘾', '物质主义', '阴影'],
    meaningUpright: '审视你的依赖与执念。那些看似吸引你的事物，实则困住了你的自由。你拥有挣脱枷锁的力量。',
    meaningReversed: '解脱正在发生。你正从一段有毒的关系、习惯或思维模式中挣脱。这是重获自由的曙光。',
    symbolism: '半人半兽的恶魔端坐于祭坛之上，亚当夏娃被锁链束缚但其颈环并不紧。',
    imagePath: '/card-images/rws-major-15.jpg',
  },
  {
    id: 16, name: '高塔', arcana: 'major',
    keywords: ['突然改变', '崩解', '觉醒', '震撼', '启示'],
    meaningUpright: '一个突然的转变正在冲击你的生活。你以为坚固的东西正在崩塌——但这摧毁是为了更真实的建设。闪电中也带有觉悟的光芒。',
    meaningReversed: '你可能正在试图避免一场不可避免的转变。或者，你已经经历了冲击并正在重建。相信这个过程。',
    symbolism: '高塔被闪电击中，火焰与碎片四散，两人从塔中坠落。',
    imagePath: '/card-images/rws-major-16.jpg',
  },
  {
    id: 17, name: '星星', arcana: 'major',
    keywords: ['希望', '治愈', '灵感', '宁静', '信念'],
    meaningUpright: '暴风雨已经过去，希望之星在夜空中闪耀。你正在被治愈。这是一个信任宇宙、重新开始的美丽时刻。',
    meaningReversed: '你可能正感到失去希望，或者不信任自己的未来。重新找到内心的信念——即使在黑暗中，星星也从未离开。',
    symbolism: '裸身女子在星空下将水罐中的水倒入水池与大地，一颗大星与七颗小星点缀夜空。',
    imagePath: '/card-images/rws-major-17.jpg',
  },
  {
    id: 18, name: '月亮', arcana: 'major',
    keywords: ['幻象', '恐惧', '潜意识', '梦境', '不确定性'],
    meaningUpright: '前方的道路笼罩在迷雾之中。不要被表象所迷惑，恐惧常常来自于未知。跟随你内在的月光前行。',
    meaningReversed: '迷雾正在散去，真相开始浮现。从恐惧与幻象中走出来，你即将抵达清澈明朗的境地。',
    symbolism: '月光下，两只狗与一只狼嗥叫。水中的蝎子代表潜意识深处的暗流。一条狭窄小径通向远方。',
    imagePath: '/card-images/rws-major-18.jpg',
  },
  {
    id: 19, name: '太阳', arcana: 'major',
    keywords: ['快乐', '成功', '活力', '光明', '成就'],
    meaningUpright: '阳光明媚的时刻！成功、快乐与满足正在照耀你。享受这段美好时光，你值得拥有这一切。',
    meaningReversed: '也许你正经历暂时的低落，或者成功在即但还需要一点耐心。不要让小挫折遮住你内心的阳光。',
    symbolism: '大太阳下，一个孩童骑着白马，手持红旗，向日葵环绕四周。',
    imagePath: '/card-images/rws-major-19.jpg',
  },
  {
    id: 20, name: '审判', arcana: 'major',
    keywords: ['觉醒', '重生', '召唤', '评估', '和解'],
    meaningUpright: '一个深层的觉醒正在发生。是时候回顾过去，接受评判，然后带着智慧重新出发。一个重要的召唤正在等待你的回应。',
    meaningReversed: '你可能在逃避某种召唤，或是对过去耿耿于怀不愿释然。允许自己放下审判，迎接新生。',
    symbolism: '天使加百列吹响号角，棺材中的人们伸开双臂回应召唤。',
    imagePath: '/card-images/rws-major-20.jpg',
  },
  {
    id: 21, name: '世界', arcana: 'major',
    keywords: ['完成', '圆满', '整合', '成就', '旅程'],
    meaningUpright: '一个重要的周期已经圆满结束。你已整合了所有经验，准备好以完整的姿态进入下一段旅程。这是庆祝的时刻。',
    meaningReversed: '眼见终点却迟迟未能抵达。也许是某个未了之事在拖住你，或是你对"完成"有着不切实际的期望。',
    symbolism: '花环中起舞的女性，四周围绕着四活物，代表元素与方向的整合。',
    imagePath: '/card-images/rws-major-21.jpg',
  },
];

// ─── Minor Arcana ───

const SUITS: Array<{
  key: NonNullable<TarotCard['suit']>;
  name: string;
  element: string;
}> = [
  { key: 'wands', name: '权杖', element: '火' },
  { key: 'cups', name: '圣杯', element: '水' },
  { key: 'swords', name: '宝剑', element: '风' },
  { key: 'pentacles', name: '星币', element: '土' },
];

const RANK_NAMES: Record<number, string> = {
  1: '王牌', 2: '二', 3: '三', 4: '四', 5: '五',
  6: '六', 7: '七', 8: '八', 9: '九', 10: '十',
  11: '侍从', 12: '骑士', 13: '皇后', 14: '国王',
};

const SUIT_KEYWORDS: Record<string, string[]> = {
  wands: ['灵感', '行动', '事业', '冒险', '激情'],
  cups: ['情感', '直觉', '关系', '爱', '内在'],
  swords: ['思维', '真理', '冲突', '决定', '公正'],
  pentacles: ['物质', '稳定', '健康', '财富', '自然'],
};

const SUIT_MEANINGS: Record<string, Record<number, { upright: string; reversed: string; symbolism: string }>> = {
  wands: {
    1: { upright: '一个充满灵感的开始。新的创意、事业或激情项目正在萌芽。抓住这个火种。', reversed: '创意受阻，或是迟迟未能启动。你可能有很多想法但没有付诸行动。', symbolism: '一只手从云中伸出，握着一根发芽的权杖。' },
    2: { upright: '展望未来，制定计划。你拥有实现愿景所需的远见。保持信心。', reversed: '对未来的不安，计划不够清晰。暂时的迷茫。', symbolism: '手持地球的男子站在城堡高墙上远眺。' },
    3: { upright: '最初的成果正在显现。你的努力带来了可见的进展。继续保持势头。', reversed: '进展不均，或是在项目初期遇到了阻碍。', symbolism: '男子站在悬崖边望向远方，三根权杖稳稳立于地面。' },
    4: { upright: '庆祝与稳定的时刻。一个阶段性的成就值得被标记。享受这片刻的安宁。', reversed: '虽然稳定但也可能缺乏激情。安逸区正在限制你的成长。', symbolism: '四根权杖搭建的花环凉亭下，人们在欢庆。' },
    5: { upright: '竞争与冲突正在展开。不同观点之间的碰撞虽然激烈，但也能推动进步。', reversed: '冲突升级为不必要的内耗。学习合作比对抗更有智慧。', symbolism: '五个人挥舞着权杖，仿佛在比试较量。' },
    6: { upright: '胜利与认可正在到来。他人的赞赏将加强你的信心。', reversed: '自信受挫，或是对胜利的过度依赖。', symbolism: '手持权杖的骑手头戴桂冠凯旋归来。' },
    7: { upright: '坚持信念，守住立场。面对挑战，你的勇气将是你的盾牌。', reversed: '防守过当，或是在无谓的战斗中消耗自己。', symbolism: '男子站在高处用一根权杖抵挡来自下方的攻击。' },
    8: { upright: '一切都正快速推进。消息、行动、变化都近在咫尺。', reversed: '计划受阻，或是前进的方向需要重新评估。', symbolism: '八根权杖在空中齐飞，势头迅猛。' },
    9: { upright: '你已经经历了许多，变得坚韧而强大。但不要忘记休息。', reversed: '心力交瘁，过度防卫。允许自己偶尔脆弱。', symbolism: '头缠绷带的男子倚着权杖，身后八根权杖如栅栏般排列。' },
    10: { upright: '负担过重。是时候学会授权与放下，不要把所有责任都扛在自己肩上。', reversed: '即将卸下重担，或是正在学习拒绝不必要的责任。', symbolism: '男子抱着十根沉重的权杖，被压得难以抬头。' },
    11: { upright: '一个年轻的、富有创造力的灵魂。探索与尝试新事物的热情。', reversed: '创意方向不定，或是天真的乐观主义。', symbolism: '身着华丽外衣的年轻侍从手持权杖。' },
    12: { upright: '充满魅力与行动力。你将带着热情勇往直前。', reversed: '方向冲动，或是热情有余而计划不足。', symbolism: '骑士骑在跃起的马上，高举权杖。' },
    13: { upright: '一个温暖而自信的女性形象。她知晓如何培育创造力并将其转化为可见的成果。', reversed: '创造力被抑制，或是在掌控中失去了温暖。', symbolism: '权杖皇后坐在向日葵环绕的宝座上。' },
    14: { upright: '果断的领导力与远见。以热情激励他人，带领团队走向共同目标。', reversed: '独断专行，或是创意方向的迷失。', symbolism: '权杖国王端坐宝座，手握发芽的权杖。' },
  },
  cups: {
    1: { upright: '一段新的情感联结或创意灵感。打开心扉，让爱与直觉流淌。', reversed: '情感封闭，或是创意枯竭。你需要重新连接你的内心。', symbolism: '一只手从云中伸出，托着一只满溢圣杯的圣杯。' },
    2: { upright: '一段和谐的关系正在形成。无论是友情还是爱情，这种联结是双向的。', reversed: '关系中的失衡，或是情感上的不对等。', symbolism: '一男一女彼此举起圣杯相敬。' },
    3: { upright: '庆祝、友谊与共享。享受与朋友们在一起的快乐时光。', reversed: '社交过载，或是表面的快乐掩盖了内心的空虚。', symbolism: '三个少女高举圣杯欢庆起舞。' },
    4: { upright: '冷漠或不满。你或许对眼前的选择视而不见，需要重新审视自己的内心。', reversed: '从消沉中苏醒，重新看到生活的美好可能。', symbolism: '树下坐着的男子面前放着三只圣杯，云中伸出一只手递来第四只。' },
    5: { upright: '对失去的哀悼。是时候感受这份悲伤，但也别忘了你仍然拥有的。', reversed: '从悲痛中走出，或是重新发现希望。', symbolism: '披斗篷的人低头看着倒在地上、各剩一半的三只圣杯。' },
    6: { upright: '童真、回忆与简单的快乐。回顾往昔，那些纯真的记忆仍能滋养你。', reversed: '被困在过去，无法拥抱现在。', symbolism: '孩童将花朵放入装满往昔象征物的圣杯中。' },
    7: { upright: '幻想与现实之间的选择。多项可能摆在你面前，选那个真正符合你内心的。', reversed: '沉迷幻想忽略了现实。脚踏实地做出选择。', symbolism: '男子面前七只圣杯浮于云中，载着各种幻想之物。' },
    8: { upright: '放下不再服务你的人事物，走向新的方向。有时候，离开是更好的选择。', reversed: '害怕离开，或是在放弃后犹豫不决。', symbolism: '男子背对八只叠放的圣杯，走向远方的山川。' },
    9: { upright: '愿望即将实现。你内在的富足正在向外界显现。', reversed: '愿望实现但可能是表面的满足。问问自己究竟想要什么。', symbolism: '衣着华贵的男子坐在九只圣杯前，双臂交叉，面带满足微笑。' },
    10: { upright: '情感的最高满足。爱、家庭、归属感——你正体验着人生的丰盛。', reversed: '家庭关系中可能存在张力，或是对完美幸福的理想化。', symbolism: '彩虹下，夫妻相拥，两个孩子在他们身边跳舞。' },
    11: { upright: '一个敏感的梦想者。直觉与创意的年轻使者。', reversed: '不切实际的幻想家，或是不愿面对现实的天真。', symbolism: '手持圣杯的侍从，杯中跃出一条小鱼。' },
    12: { upright: '浪漫的追求者。带着爱与理想前行的旅人。', reversed: '过度理想化某人某事，或是情感上的不成熟。', symbolism: '身骑白马的骑士高举圣杯如高举圣物。' },
    13: { upright: '深刻的直觉与同理心。她用情感的智慧滋养周围每一个人。', reversed: '情感过于依赖他人，或是在共情中迷失了自己。', symbolism: '圣杯皇后坐在水边的宝座上，凝视手中精美的圣杯。' },
    14: { upright: '情感上的成熟与平衡。他知晓如何管理自己的情绪而不被它们淹没。', reversed: '情感压抑，或在权威外表下隐藏着不安。', symbolism: '圣杯国王坐在海上宝座，手握圣杯与权杖。' },
  },
  swords: {
    1: { upright: '清晰的思维与真理的利刃。一个关键的决定需要做出，使用你的理性。', reversed: '思维混乱，或对真相的回避。', symbolism: '一只手从云中伸出，高举一柄双刃宝剑。' },
    2: { upright: '面临两难抉择。暂时的僵局需要你在两个选项中找到平衡。', reversed: '犹豫不决的结束，或是被外界推动做出选择。', symbolism: '蒙眼女子双手交叉各持一剑，坐在月下海边。' },
    3: { upright: '心碎与痛苦，但这也是疗愈的起点。允许自己感受悲伤，然后释放它。', reversed: '从悲伤中恢复，但对伤痛仍然念念不忘。', symbolism: '三把剑刺穿一颗心，背景是阴雨的天空。' },
    4: { upright: '休息与恢复。退后一步，让身心重新积蓄力量。', reversed: '恢复期即将结束，准备重新投入世界。', symbolism: '墓室中沉睡的骑士，三把剑悬挂于上。' },
    5: { upright: '胜败分明，但胜利可能带有苦涩。这种胜利是否值得？', reversed: '和解的意愿，或是从冲突中学习。', symbolism: '男子拾起失败者的剑，留下两人落寞的背影。' },
    6: { upright: '从艰难中渡越，向前方更平静的水域前进。', reversed: '旅程受阻，或是在过渡期中感到迷茫。', symbolism: '摆渡人载着两人（代表思想）渡向对岸。' },
    7: { upright: '机敏与策略。有时候迂回比直进更有效。', reversed: '计划不周全，或是小聪明被识破。', symbolism: '男子蹑手蹑脚地抱着五把剑离开，回头望向后方的帐篷。' },
    8: { upright: '自困于思维牢笼。你感觉被困住，但其实钥匙一直在你手中。', reversed: '从限制性的信念中解脱。重新找回自由思考的能力。', symbolism: '被绑住、蒙着眼的女子站在八把剑的围栏之中。' },
    9: { upright: '过度担忧与焦虑——但最大的折磨并非现实，而是你脑海中的想象。', reversed: '从焦虑中开始恢复，或是过度的担忧正在消退。', symbolism: '坐于床上的女子以手掩面，墙上悬挂九把利剑。' },
    10: { upright: '思维模式的终结。一个痛苦的认知循环终于走到尽头。黎明就在前方。', reversed: '紧抓痛苦记忆不肯放手，或者正在逐渐恢复。', symbolism: '男子俯卧地上，背上插着十把剑，远处海平线上曙光乍现。' },
    11: { upright: '敏锐的观察者。以清晰头脑审视信息的年轻学者。', reversed: '轻率的言论，或是以知识为武器攻击他人。', symbolism: '手持宝剑的侍从，警觉地注视着周遭。' },
    12: { upright: '果敢的行动者。以逻辑与正义感为指引，不惧挑战。', reversed: '冲动无谋，或是在战斗中失去了方向。', symbolism: '全副武装的骑士骑着骏马，高举宝剑冲锋。' },
    13: { upright: '清晰的判断力与洞察力。她用智慧之剑切穿迷雾，看到本质。', reversed: '以挑刺为招牌，或是智慧变成了尖刻。', symbolism: '宝剑皇后坐于王座，一手握剑，一手前伸如宣判。' },
    14: { upright: '客观的权威与清醒的判断。他以理性为法则，以公正为准则。', reversed: '理性过头忽略了情感，或在权威面具下掩盖着私心。', symbolism: '宝剑国王端坐宝座，手中的宝剑直指前方。' },
  },
  pentacles: {
    1: { upright: '一个新的物质或事业机会。稳固的开始，脚踏实地便能成事。', reversed: '错失良机，或是对基础的不够重视。', symbolism: '从云中伸出的手托着一枚巨大的星币，下方花园盛开。' },
    2: { upright: '平衡多项事务。你正在学习周旋于不同责任之间。', reversed: '失衡，或是在过多事务中分散了精力。', symbolism: '杂耍者手持无限符号∞，两枚星币于其中穿梭。' },
    3: { upright: '团队合作与技艺。通过协作而获得的成果，比单打独斗更丰盛。', reversed: '合作不顺，或是团队成员之间缺乏默契。', symbolism: '石匠在教堂内工作，三人各自贡献着自己的技艺。' },
    4: { upright: '对财富与稳定的执着掌控。安全感的固守——但别忘了流动。', reversed: '过度吝啬，或是在物质上抓得太紧。', symbolism: '男子将四枚星币紧抱在胸前，头上、脚下各有一枚。' },
    5: { upright: '物质或情感上的匮乏感。你可能感到被遗弃或缺少支持。', reversed: '从匮乏中开始关注你所拥有的。转变视角。', symbolism: '两个人在风雪中走过教堂彩色玻璃窗前。' },
    6: { upright: '慷慨与接受。给予与接受同样重要。资源正在流通。', reversed: '给予的不平衡，或在物质上过度依赖于他人。', symbolism: '富商将星币分给两个跪在地上的穷人。' },
    7: { upright: '耐心等待收获。你播下的种子正在土中生长，虽然暂时还看不到。', reversed: '对成果的过度焦躁，或是时间投入与回报不成正比。', symbolism: '男子倚锄而立，他面前的小树上结着星币。' },
    8: { upright: '专注于技艺与细节。日复一日的打磨正在将你变成大师。', reversed: '沦为机械化的重复，或是在细节中迷失了方向。', symbolism: '工匠低头专注地雕刻一枚星币，墙上挂着六枚完成品。' },
    9: { upright: '物质与精神的丰盛享受。你在这片属于你的花园中安然自在。', reversed: '表面富足下却是孤独，或是在物质中迷失了自我。', symbolism: '贵妇在花园中悠闲纳凉，手边停留着一只猎鹰。' },
    10: { upright: '家族的繁荣与传承。物质与情感上的双重富足。', reversed: '遗产上的纠纷，或是在家族重担中失去自我。', symbolism: '白发长者在城门之下，儿孙绕膝。' },
    11: { upright: '扎实的学习者。耐心而踏实的年轻建设者。', reversed: '学习上的倦怠，或是对物质世界的过度关注。', symbolism: '年轻侍从双手捧着星币，专注且安静。' },
    12: { upright: '稳步前进的建设者。可靠而实际，不疾不徐地走向目标。', reversed: '固步自封，或是在务实中失去了想象力。', symbolism: '黑马骑士手捧星币，在田间驻足。' },
    13: { upright: '丰饶的女性力量。她养育生命，也精通财富之道。', reversed: '物质的焦虑，或在照料他人中忽略了自己。', symbolism: '星币皇后坐在花园宝座上，怀中抱着一枚星币。' },
    14: { upright: '物质世界的成功与掌控。稳健与繁荣的最高境界。', reversed: '物质主义的陷阱，或是在成功中迷失了初心。', symbolism: '星币国王端坐宝座，周身环绕累累星币与葡萄藤。' },
  },
};

function buildMinorArcana(): TarotCard[] {
  const cards: TarotCard[] = [];
  let id = 22;

  for (const suit of SUITS) {
    for (let rank = 1; rank <= 14; rank++) {
      const meanings = SUIT_MEANINGS[suit.key]![rank]!;
      cards.push({
        id: id++,
        name: `${suit.name}${RANK_NAMES[rank]}`,
        arcana: 'minor',
        suit: suit.key,
        number: rank,
        keywords: [...SUIT_KEYWORDS[suit.key]!, ...(rank <= 10 ? [`第${rank}阶段`] : ['宫廷'])],
        meaningUpright: meanings.upright,
        meaningReversed: meanings.reversed,
        symbolism: meanings.symbolism,
        imagePath: `/card-images/rws-minor-${suit.key}-${String(rank).padStart(2, '0')}.jpg`,
      });
    }
  }

  return cards;
}

const MINOR_ARCANA = buildMinorArcana();

export const ALL_CARDS: TarotCard[] = [...MAJOR_ARCANA, ...MINOR_ARCANA];

export function getCardById(id: number): TarotCard | undefined {
  return ALL_CARDS.find((c) => c.id === id);
}

export function getCardByName(name: string): TarotCard | undefined {
  return ALL_CARDS.find((c) => c.name === name);
}

export function shuffleDeck(): TarotCard[] {
  const deck = [...ALL_CARDS];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export function drawCards(count: number): Array<{ card: TarotCard; orientation: 'upright' | 'reversed' }> {
  const deck = shuffleDeck();
  return deck.slice(0, count).map((card) => ({
    card,
    orientation: Math.random() > 0.5 ? 'upright' : 'reversed',
  }));
}
