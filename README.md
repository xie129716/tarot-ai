# 🔮 星辰之镜 — AI塔罗牌占卜

> **Star Mirror Tarot** — 百度手势识别 × DeepSeek AI 流式解牌 × 78张RWS塔罗牌

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![DeepSeek](https://img.shields.io/badge/AI-DeepSeek_V3-purple) ![Baidu](https://img.shields.io/badge/Gesture-百度智能云-orange) ![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)

[在线体验](https://tarot-ai.vercel.app) | [GitHub](https://github.com/your-username/tarot-ai)

---

## 目录

- [功能演示](#功能演示)
- [架构说明](#架构说明)
- [关键Prompt与Vibe思路](#关键prompt与vibe思路)
- [AI调用逻辑](#ai调用逻辑)
- [手势识别方案](#手势识别方案)
- [部署步骤](#部署步骤)
- [本地开发](#本地开发)

---

## 功能演示

### 完整流程

```
WELCOME → SHUFFLING → CARD_SELECTION(3D旋转) → READING → COMPLETE → CHAT
```

1. **选择牌阵** (单张 / 三张 / 凯尔特十字)
2. **洗牌动画** → 进入 78 张牌 3D 旋转环
3. **手势选牌**:
   - 🙏 **祈祷 Prayer** — 保持手势让卡牌旋转，松手即停
   - 🖐️ **张手** — 中心卡牌翻转露出 RWS 画面，确认选择
4. **继续旋转** — 已选卡牌打 ✓ 标记虚化，选下一张
5. **全选完毕** → 自动关闭摄像头 → AI 流式解读
6. **追问** — 底部聊天窗口，保持解读上下文连贯

### 手势交互

| 百度手势 | 动作 |
|---------|------|
| 祈祷 Prayer | 卡牌3D旋转（松手即停） |
| 数字5 / 掌心向上 | 确认选择当前卡牌 |
| 拳头 Fist | 备用 |

### 降级方案
- 无摄像头 → 手动按钮控制旋转 / 选择
- 移动端 → 触摸操作

---

## 架构说明

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                    │
│                                                       │
│  ┌──────────┐   ┌────────────┐   ┌───────────────┐  │
│  │ Webcam   │   │  Canvas    │   │ 3D Carousel   │  │
│  │ getUser  │──▶│ 截帧→Base64│   │ 78张牌 旋转环 │  │
│  │ Media    │   │ (每300ms)  │   │ framer-motion │  │
│  └──────────┘   └─────┬──────┘   └───────┬───────┘  │
│                       │                    │          │
│                 POST /api/gesture    POST /api/      │
│                 (Base64图片)         reading/chat    │
│                       │              (流式SSE)       │
└───────────────────────┼────────────────────┬─────────┘
                        │                    │
┌───────────────────────┼────────────────────┼─────────┐
│              Next.js API Routes (Server)              │
│                       │                    │          │
│  ┌────────────────────▼──────┐  ┌─────────▼────────┐ │
│  │  /api/gesture             │  │ /api/reading     │ │
│  │  → 百度手势识别API        │  │ /api/chat        │ │
│  │  → 24种手势分类           │  │ → DeepSeek V3    │ │
│  │  → Prayer/Five/Fist       │  │ → 4层Prompt组装  │ │
│  │  → 映射到App手势          │  │ → Function Call  │ │
│  └───────────────────────────┘  │ → 流式SSE响应   │ │
│                                  └──────────────────┘ │
│                       Deploy: Vercel                  │
└─────────────────────────────────────────────────────┘
```

### 项目结构

```
tarot-ai/
├── app/
│   ├── page.tsx                     # 主流程状态机 (8阶段)
│   ├── layout.tsx                   # SEO + sonner toast
│   ├── globals.css                  # 暗黑神秘主题 + 星空动画
│   ├── api/
│   │   ├── reading/route.ts         # 流式塔罗解牌
│   │   ├── chat/route.ts            # 流式追问 + Function Calling
│   │   └── gesture/route.ts         # 百度手势识别代理
│   └── _components/
│       ├── TarotCarousel.tsx        # 78张牌3D旋转环 (核心)
│       ├── TarotCard.tsx            # 单张卡牌 (3D翻转)
│       ├── TarotSpread.tsx          # 牌阵布局
│       ├── CardDeck.tsx             # 洗牌动画
│       ├── ReadingPanel.tsx         # 逐字流式显示
│       ├── ChatPanel.tsx            # 追问聊天面板
│       ├── GestureOverlay.tsx       # 手势状态指示器
│       └── GestureHint.tsx          # 手势教程
├── hooks/
│   ├── useHandTracking.ts           # 摄像头 + Canvas截帧
│   ├── useGestureClassification.ts  # 手势分类 + 迟滞
│   ├── useCardSelection.ts          # 选牌状态机
│   ├── useTarotReading.ts           # 流式解读 fetch + ReadableStream
│   └── useTarotChat.ts              # 流式聊天 fetch + ReadableStream
├── lib/
│   ├── tarot/
│   │   ├── cards.ts                 # 78张塔罗牌完整数据
│   │   └── spreads.ts               # 3种牌阵定义
│   ├── ai/
│   │   ├── prompts.ts               # System Prompt (5层动态组装)
│   │   ├── context.ts               # 对话上下文剪裁
│   │   ├── tools.ts                 # Function Calling工具
│   │   └── baidu-gesture.ts         # 百度手势API客户端
│   └── gestures/
│       ├── types.ts                 # 手势枚举
│       └── classifier.ts            # 手势分类器(备用)
└── public/
    └── card-images/                  # 78张RWS公共领域塔罗牌图片
```

---

## 关键Prompt与Vibe思路

### 设计理念

Prompt不是一段静态文本，而是 **5层动态组合**，每次解读都针对用户的牌阵定制：

### Layer 1: Persona（人格层）

```
你是"星辰之镜"——一位温柔而充满灵性的AI塔罗占卜师。
你的语调诗意而踏实，充满神秘但不故弄玄虚。
你将塔罗牌视为人类灵魂的镜子，映照内心深处已然存在的真相。
```

**设计思路**:
- "星辰之镜"暗示反观内心，与塔罗作为"镜子"的隐喻一致
- 明确禁止"预测未来"——伦理立场，也避免AI幻觉
- 强调建设性——即使"死神""高塔"也有正向角度

### Layer 2: Spread Context（牌阵上下文）

```typescript
// 根据用户选择的牌阵动态注入每个位置的含义
`本次使用「${spread.name}」牌阵。
牌阵含义：
- 「过去」位置：曾影响你的事件与能量
- 「现在」位置：当前的状态与挑战
- 「未来」位置：潜在的发展方向`
```

### Layer 3: Card Meanings（牌义注入）

```typescript
// 将用户实际抽到的牌(含正逆位)直接注入prompt
`第1张牌 · 过去位置：愚者（正位）
  牌面意义：代表新的开始与无限可能...
  关键词：新的开始、冒险、天真、自由、信念
  象征：悬崖边缘的旅人，带着小小行囊仰望天空`
```

**设计思路**: 78张牌数据作为知识库，但只注入已选牌的上下文，节省token。

### Layer 4: Output Format（输出结构）

```
开场共鸣（2-3句）— 共情求问者心境
逐牌解读（每张3-5句）— 结合位置含义
综融叙事（4-6句）— 串联完整故事线
温柔指引（3-4句）— 可操作的建议
结语（1-2句）— 赋能结束语
字数500-800字。纯文本，禁止Markdown符号和表情符号。
```

**设计思路**: 结构化输出确保体验一致性；禁止格式符号让AI输出更像真人对话。

### Layer 5: Ethical Boundaries（伦理边界）

```
- 如遇自伤/自杀信号，温柔引导寻求专业心理帮助
- 不提供医疗、法律、金融等专业建议
- 塔罗只是参考，最终选择权在求问者
```

### 追问对话的Prompt策略

追问不是简单的对话续接，而是将完整解读上下文作为System Prompt重新注入——保持Persona连贯性并引用之前的解读内容。限制150-300字的精简回答。

---

## AI调用逻辑

### 流式响应 (Streaming)

**服务端** — AI SDK v6 + DeepSeek:

```typescript
// app/api/reading/route.ts
import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

const result = streamText({
  model: deepseek('deepseek-chat'),
  system: systemPrompt,      // 5层动态组装
  messages: [{ role: 'user', content: userContent }],
  maxOutputTokens: 2000,
  temperature: 0.8,          // 创造性解读
  onFinish({ usage }) {      // Token用量追踪
    console.log('[token-usage]', usage.inputTokens, usage.outputTokens);
  },
});

return result.toTextStreamResponse(); // Content-Type: text/plain 流式响应
```

**客户端** — 手动 ReadableStream 解析:

```typescript
// hooks/useTarotReading.ts
const response = await fetch('/api/reading', {
  method: 'POST',
  body: JSON.stringify({ cards, spreadType }),
});

const reader = response.body?.getReader();
const decoder = new TextDecoder();
let fullText = '';

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  fullText += decoder.decode(value, { stream: true });
  setCompletion(fullText); // 实时更新UI
}
```

**为什么不用 `useCompletion` hook**: 手动实现 ReadableStream 展示对底层流式协议的理解，错误处理和 AbortController 控制更灵活。

### Function Calling (工具调用)

追问对话中启用，AI 按需查询卡牌详情:

```typescript
// app/api/chat/route.ts
const result = streamText({
  model: deepseek('deepseek-chat'),
  tools: {
    getCardDetail: tool({
      description: '获取某张塔罗牌的详细含义和关键词',
      inputSchema: z.object({
        cardName: z.string(),
        orientation: z.enum(['upright', 'reversed']),
      }),
      execute: async (input) => {
        return JSON.stringify(getCardDetail(input.cardName, input.orientation));
      },
    }),
  },
  stopWhen: stepCountIs(3),   // 最多3轮工具调用
});
```

**设计理由**: 不在每次请求把所有78张牌数据放入prompt → 节省token成本，AI按需调用工具获取详细信息。

### 上下文管理

```typescript
// lib/ai/context.ts
export function trimConversation(messages, maxTokens = 7000) {
  // 从后向前遍历，保留最近消息
  // 估算: 中文 ~4 chars/token
  let tokenCount = 0;
  const trimmed = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    const estimated = Math.ceil(messages[i].content.length / 4);
    if (tokenCount + estimated > maxTokens) break;
    tokenCount += estimated;
    trimmed.unshift(messages[i]);
  }
  return trimmed;
}
```

### Token 成本

| 场景 | Input | Output | 成本 |
|------|-------|--------|------|
| 3牌解读 | ~2000 | ~700 | $0.0005 |
| 10牌凯尔特十字 | ~6000 | ~1500 | $0.001 |
| 追问对话 | ~3000/轮 | ~400/轮 | $0.0005/轮 |

> DeepSeek V3: $0.14/M input, $0.28/M output

---

## 手势识别方案

### 技术架构

```
摄像头 (30fps)
    │
    ▼
Canvas 截帧 (每300ms)
    │  toDataURL('image/jpeg', 0.7)
    ▼
POST /api/gesture { image: base64 }
    │
    ▼
百度智能云手势识别API
    │  POST https://aip.baidubce.com/rest/2.0/image-classify/v1/gesture
    │  返回: { classname: "Prayer", probability: 0.95, ... }
    ▼
映射到 App 手势
    │  Prayer → PRAYER (旋转)
    │  Five/Palm_up → OPEN_PALM (选择)
    │  Fist → FIST (备用)
    ▼
迟滞过滤 (连续4帧无手势才触发"释放")
    │
    ▼
useCardSelection → UI 更新
```

### 百度API集成

```typescript
// lib/ai/baidu-gesture.ts
// 1. OAuth获取access_token (缓存30天)
// 2. POST图片到手势识别接口
// 3. 解析返回的classname映射到App手势
const BAIDU_TO_GESTURE = {
  Prayer: GestureType.PRAYER,      // 祈祷 → 旋转
  Five: GestureType.OPEN_PALM,     // 数字5 → 选择
  Palm_up: GestureType.OPEN_PALM,  // 掌心向上 → 选择
};
```

### 迟滞机制

```typescript
// hooks/useGestureClassification.ts
const NULL_THRESHOLD = 4; // 连续4帧(~1.2s)无手势才触发"释放"
// 避免百度API偶尔漏检导致旋转意外停止
```

---

## 部署步骤

### 1. GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/your-username/tarot-ai.git
git push -u origin main
```

### 2. Vercel

1. [vercel.com/new](https://vercel.com/new) → Import GitHub repo
2. 自动识别 Next.js，无需配置
3. 添加 Environment Variables:

| Key | 获取地址 |
|-----|---------|
| `DEEPSEEK_API_KEY` | [platform.deepseek.com](https://platform.deepseek.com/api_keys) |
| `BAIDU_API_KEY` | [百度智能云控制台](https://console.bce.baidu.com) |
| `BAIDU_SECRET_KEY` | [百度智能云控制台](https://console.bce.baidu.com) |

4. Deploy → 2分钟构建完成

### 3. 自定义域名 + HTTPS

**Vercel推荐方式**（最简单）:
1. Dashboard → Settings → Domains → 输入你的域名
2. 在域名注册商添加 Vercel 提供的 DNS 记录
3. Vercel 自动签发 Let's Encrypt SSL → HTTPS 就绪

**Cloudflare方式**（有CDN加速）:
1. 域名NS指向Cloudflare
2. DNS添加 CNAME → `cname.vercel-dns.com`
3. SSL/TLS设为"Full"
4. Vercel Domains 添加自定义域名

### 4. 部署架构

```
User → Cloudflare CDN (optional) → Vercel Edge
  ├── / (Static, cached at Edge)
  ├── /api/reading (Serverless, Node.js)
  ├── /api/chat (Serverless, Node.js)
  └── /api/gesture (Serverless, Node.js)
```

---

## 本地开发

### 前置条件
- Node.js 20+
- DeepSeek API Key
- 百度智能云 API Key + Secret Key（开通手势识别服务）

### 启动

```bash
git clone https://github.com/your-username/tarot-ai.git
cd tarot-ai
cp .env.example .env.local
# 编辑 .env.local 填入3个API Key
npm install
npm run dev
# 打开 http://localhost:3000
```

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 (Strict) |
| 样式 | TailwindCSS 4 |
| 动画 | framer-motion 11 |
| AI SDK | Vercel AI SDK v6 (streamText + tool) |
| AI模型 | DeepSeek V3 (deepseek-chat) |
| 手势识别 | 百度智能云 手势识别API |
| 卡牌图片 | Rider-Waite-Smith 1909 (Public Domain) |
| 校验 | Zod 3 |
| 部署 | Vercel (HTTPS自动) |
| Toast | sonner |

## License

MIT — 欢迎参考和二次开发。

---

*Built with Claude Code — AI-first development.*
