# 星辰之镜 — AI塔罗牌占卜

> 手势识别选牌 × DeepSeek AI 流式解牌 × 78张RWS塔罗牌

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![DeepSeek](https://img.shields.io/badge/AI-DeepSeek_V3-purple)](https://platform.deepseek.com)
[![MediaPipe](https://img.shields.io/badge/Gesture-MediaPipe_30fps-orange)](https://developers.google.com/mediapipe)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black)](https://vercel.com)

**线上地址：[soe.9vvn.com](https://soe.9vvn.com)**

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

1. **选择牌阵** — 单张指引 / 过去现在未来(3张) / 凯尔特十字(10张)
2. **洗牌动画** — 78张卡牌3D旋转环就绪
3. **手势选牌**:
   - 🖐️ **张手(数字5)** — 卡牌旋转（松手即停，反向吸附到最近卡牌）
   - ☝️ **食指(数字1)** — 中心卡牌翻转为RWS正面，确认选择
4. **继续旋转** — 已选卡牌打✓虚化，继续选下一张
5. **全选完毕** → 自动关闭摄像头 → **AI流式解读**（逐行实时渲染）
6. **追问** — 底部聊天窗口，保持解读上下文连贯，支持Function Calling查牌

### 降级方案
- 无摄像头 → 手动按钮控制旋转/选择
- 移动端 → 触摸操作 + 手势均可

---

## 架构说明

```
┌─────────────────────────────────────────────────────┐
│                   Browser (Client)                    │
│                                                       │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │ Webcam   │   │  MediaPipe   │   │ 3D Carousel  │  │
│  │ 640×480  │──▶│  Hands WASM  │   │ 78张牌旋转环 │  │
│  │ 30fps    │   │  21 landmarks│   │ CSS 3D       │  │
│  └──────────┘   └──────┬───────┘   └──────┬──────┘  │
│                        │                    │         │
│                 手势分类器               POST /api/   │
│                 (browser端)            reading/chat   │
│                 PRAYER/OPEN_PALM       (流式SSE)      │
└────────────────────────┼────────────────────┬────────┘
                         │                    │
┌────────────────────────┼────────────────────┼────────┐
│              Next.js API Routes (Server)              │
│                        │                    │         │
│  ┌─────────────────────▼──────────────────────┐      │
│  │  /api/reading  — 流式塔罗解牌              │      │
│  │  /api/chat     — 流式追问 + Function Call  │      │
│  │                                              │      │
│  │  → DeepSeek V3 (via Vercel AI SDK v6)       │      │
│  │  → 5层动态Prompt组装                        │      │
│  │  → streamText() → toTextStreamResponse()    │      │
│  │  → Function Calling: getCardDetail          │      │
│  │  → Token用量追踪                             │      │
│  └──────────────────────────────────────────────┘      │
│                                                       │
│  Deploy: Vercel (HTTPS + Custom Domain)               │
└───────────────────────────────────────────────────────┘
```

### 项目结构

```
tarot-ai/
├── app/
│   ├── page.tsx                     # 主流程状态机 (6阶段)
│   ├── layout.tsx                   # SEO元数据 + sonner toast
│   ├── globals.css                  # 暗黑神秘主题
│   ├── api/
│   │   ├── reading/route.ts         # 流式塔罗解牌 DeepSeek
│   │   ├── chat/route.ts            # 流式追问 + Function Calling
│   │   └── gesture/route.ts         # 手势识别代理(备用)
│   └── _components/
│       ├── TarotCarousel.tsx        # 78张牌CSS 3D旋转环
│       ├── TarotCard.tsx            # 单张卡牌3D翻转
│       ├── TarotSpread.tsx          # 牌阵Grid布局
│       ├── CardDeck.tsx             # 洗牌动画
│       ├── ReadingPanel.tsx         # 流式文字渲染
│       ├── ChatPanel.tsx            # 追问聊天面板
│       ├── GestureOverlay.tsx       # 摄像头预览+手势状态
│       └── GestureHint.tsx          # 手势教程
├── hooks/
│   ├── useHandTracking.ts           # 摄像头 + MediaPipe WASM
│   ├── useGestureClassification.ts  # 手势分类 (30fps)
│   ├── useCardSelection.ts          # 选牌状态机
│   ├── useTarotReading.ts           # 流式解读 ReadableStream
│   └── useTarotChat.ts              # 流式聊天 ReadableStream
├── lib/
│   ├── tarot/
│   │   ├── cards.ts                 # 78张塔罗牌完整数据
│   │   └── spreads.ts               # 3种牌阵定义
│   ├── ai/
│   │   ├── prompts.ts               # System Prompt (5层动态组装)
│   │   ├── context.ts               # 对话上下文裁剪
│   │   ├── tools.ts                 # Function Calling工具定义
│   │   └── baidu-gesture.ts         # 百度手势API客户端(备用)
│   └── gestures/
│       ├── types.ts                 # 手势枚举
│       └── classifier.ts            # 手势分类器(备用)
└── public/
    └── card-images/                  # 78张RWS公共领域塔罗牌
```

---

## 关键Prompt与Vibe思路

### 设计理念

Prompt 采用 **5层动态组合** 架构：静态层定义人格边界，动态层注入每次占卜的具体上下文。

### Layer 1: Persona（人格层）— 静态

```
你是"星辰之镜"——一位温柔而充满灵性的AI塔罗占卜师。
你将塔罗牌视为人类灵魂的镜子，映照内心深处已然存在的真相。

关键原则：
- 你解读符号与能量，从不声称预测未来
- 塔罗是镜子而非预言书
- 即使"死神""高塔"也以"蜕变""觉醒"角度解读
- 承认塔罗只是参考，最终选择权在求问者
```

设计要点: "星辰之镜"暗示反观内心；明确禁止预测未来既是伦理立场也避免AI幻觉；建设性视角让负面牌也有正向解读。

### Layer 2: Spread Context（牌阵层）— 动态

根据用户选择的牌阵动态注入每个位置的含义，让AI理解每张牌在牌阵中的角色。

### Layer 3: Card Meanings（牌义层）— 动态

将用户实际抽到的牌(含正逆位、关键词、象征意义)完整注入。78张牌数据作为知识库，但只注入已选牌以节省token。

### Layer 4: Output Format（输出结构）

```
开场共鸣 — 共情求问者心境
逐牌解读 — 结合位置含义分析每张牌
综融叙事 — 串联完整故事线
温柔指引 — 可操作的具体建议
结语 — 赋能结束语
字数500-800字，纯文本，禁止Markdown符号和表情符号
```

### Layer 5: Ethical Boundaries（伦理边界）

```
- 遇自伤/自杀信号，温柔引导寻求专业心理帮助
- 不提供医疗、法律、金融等专业建议
- 保持积极正面但不过度承诺
```

### 追问对话Prompt策略

追问时将**完整解读上下文作为System Prompt重新注入**，保持Persona连贯。限制150-300字精简回答，要求像微信聊天一样自然表达，禁止所有格式符号。

---

## AI调用逻辑

### 流式响应 (Server → Client SSE)

**服务端** (Vercel AI SDK v6):

```typescript
// app/api/reading/route.ts
import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

const result = streamText({
  model: deepseek('deepseek-chat'),
  system: systemPrompt,            // 5层动态组装
  messages: [{ role: 'user', content: userContent }],
  maxOutputTokens: 2000,
  temperature: 0.8,
  onFinish({ usage }) {
    // Token用量追踪
    console.log('[token-usage]', usage.inputTokens, usage.outputTokens);
  },
});
return result.toTextStreamResponse(); // Content-Type: text/plain
```

**客户端** (手动ReadableStream):

```typescript
// hooks/useTarotReading.ts
const response = await fetch('/api/reading', {
  method: 'POST',
  body: JSON.stringify({ cards, spreadType }),
});
const reader = response.body.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const text = decoder.decode(value, { stream: true });
  setCompletion(prev => prev + text); // 实时逐段更新
}
```

选择手动实现而非`useCompletion` hook：展示对流式协议的底层理解，更灵活的AbortController控制。

### Function Calling (工具调用)

追问对话中启用，AI按需查询卡牌详情而非每次请求携带全部78张牌数据:

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
  stopWhen: stepCountIs(3), // 最多3轮工具调用
});
```

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

### Token成本

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
摄像头 640×480 @30fps
    ↓
MediaPipe HandLandmarker (WASM, GPU)
    ↓ 21个3D关键点 × 2只手
手指状态分类器 (PIP关节角度 > 155°)
    ↓
手势判定:
  🖐️ 五指全伸直 → PRAYER (旋转)
  ☝️ 仅食指伸直 → OPEN_PALM (选择)
    ↓
迟滞过滤 (8帧/250ms无手势才触发释放)
    ↓
useCardSelection → Carousel UI
```

### 为什么用MediaPipe而不是云端API

| | MediaPipe | 云端API (百度等) |
|------|-----------|-----------------|
| 延迟 | 0ms（本地） | 200-500ms |
| 帧率 | 30fps | ~1fps (QPS限制) |
| 成本 | 免费 | 按量计费 |
| 离线 | 支持 | 不支持 |
| 稳定性 | 无网络依赖 | 依赖网络 |

### 手势分类核心代码

```typescript
// hooks/useGestureClassification.ts
function classifyFromLandmarks(hands: DetectedHand[]): GestureType | null {
  if (hands.length === 0) return null;
  const fingers = getFingerStates(hands[0].landmarks);
  // 五指全伸直 → 旋转
  if (Object.values(fingers).every(f => f === true)) return GestureType.PRAYER;
  // 仅食指伸直 → 选择
  if (fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky)
    return GestureType.OPEN_PALM;
  return null;
}
```

---

## 部署步骤

### 1. GitHub

```bash
git init
git add .
git commit -m "feat: AI tarot app"
git remote add origin https://github.com/your-username/tarot-ai.git
git push -u origin main
```

### 2. Vercel 部署

1. 打开 [vercel.com/new](https://vercel.com/new)
2. Import GitHub 仓库，自动识别 Next.js
3. 添加 Environment Variables:

| Key | 获取地址 |
|-----|---------|
| `DEEPSEEK_API_KEY` | [platform.deepseek.com/api_keys](https://platform.deepseek.com/api_keys) |

> MediaPipe 手势识别在浏览器端运行，无需额外API Key。

4. 点击 Deploy，2分钟构建完成

### 3. 自定义域名 + HTTPS

**添加域名**:
1. Vercel Dashboard → Settings → Domains → 输入域名（如 `tarot.example.com`）
2. 在域名注册商添加 Vercel 提供的 DNS 记录（CNAME指向 `cname.vercel-dns.com`）
3. Vercel 自动签发 Let's Encrypt SSL → HTTPS就绪

**DNS配置示例**:

| Type | Name | Value |
|------|------|-------|
| CNAME | tarot | cname.vercel-dns.com |

### 4. 部署架构

```
User → HTTPS → Vercel Edge Network
  ├── / (Static, cached at Edge)
  ├── /api/reading (Serverless Function, Node.js)
  └── /api/chat (Serverless Function, Node.js)
```

### 5. 成本

| 项目 | 费用 |
|------|------|
| Vercel Hosting | 免费 (100GB带宽/月) |
| DeepSeek API | ~$0.0005/次解读 |
| MediaPipe | 免费 (浏览器端) |
| 域名 | ~$12/年 |

---

## 本地开发

```bash
git clone https://github.com/your-username/tarot-ai.git
cd tarot-ai
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY=sk-xxx
npm install
npm run dev
# 打开 http://localhost:3000
```

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Next.js 16 (App Router) |
| 语言 | TypeScript 5 |
| 样式 | TailwindCSS 4 |
| 动画 | framer-motion 11 |
| AI SDK | Vercel AI SDK v6 |
| AI模型 | DeepSeek V3 |
| 手势识别 | MediaPipe Hands (WASM, 30fps) |
| 卡牌图片 | Rider-Waite-Smith 1909 (Public Domain) |
| 部署 | Vercel |

---

*Built with Claude Code.*
