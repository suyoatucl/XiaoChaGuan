# 小查馆（XiaoChaGuan）项目结构

```
xiaochaguan/
│
├── README.md                           # 项目总览
├── LICENSE                             # 开源许可证 (MIT)
├── CONTRIBUTING.md                     # 贡献指南
├── CHANGELOG.md                        # 版本更新日志
├── .gitignore                          # Git 忽略规则
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                      # CI 流水线
│   │   ├── cd-extension.yml            # 扩展发布流水线
│   │   └── cd-backend.yml              # 后端部署流水线
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/                               # 项目文档
│   ├── PROJECT_BLUEPRINT.md            # 项目蓝图（本文档）
│   ├── ARCHITECTURE.md                 # 架构设计详解
│   ├── API_REFERENCE.md                # API 接口文档
│   ├── DEPLOYMENT.md                   # 部署指南
│   ├── DEVELOPMENT.md                  # 开发指南
│   └── SECURITY.md                     # 安全说明
│
├── CLAUDE.md                           # Claude Code 项目说明文件
│
│
│ ════════════════════════════════════════════════════════════════
│                    CHROME EXTENSION (Svelte + Plasmo)
│ ════════════════════════════════════════════════════════════════
│
├── packages/
│   └── extension/                      # Chrome/Edge 浏览器扩展
│       ├── package.json
│       ├── pnpm-lock.yaml
│       ├── tsconfig.json
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── .env.example                # 环境变量示例
│       ├── .env.local                  # 本地环境变量 (不提交)
│       │
│       ├── assets/                     # 静态资源
│       │   ├── icon16.png
│       │   ├── icon32.png
│       │   ├── icon48.png
│       │   ├── icon128.png
│       │   └── logo.svg
│       │
│       ├── src/
│       │   │
│       │   ├── background/             # Background Service Worker
│       │   │   ├── index.ts            # 入口文件
│       │   │   ├── message-handler.ts  # 消息处理
│       │   │   ├── context-menu.ts     # 右键菜单
│       │   │   └── alarm-handler.ts    # 定时任务
│       │   │
│       │   ├── contents/               # Content Scripts
│       │   │   ├── analyzer.ts         # 页面内容分析 (主 content script)
│       │   │   ├── highlighter.ts      # 高亮标记注入
│       │   │   └── overlay.ts          # 验证结果悬浮层
│       │   │
│       │   ├── popup/                  # Popup 弹出界面
│       │   │   ├── index.html
│       │   │   ├── Popup.svelte        # 主组件
│       │   │   ├── components/
│       │   │   │   ├── QuickVerify.svelte      # 快速验证输入
│       │   │   │   ├── VerifyResult.svelte     # 验证结果展示
│       │   │   │   ├── RecentChecks.svelte     # 最近验证记录
│       │   │   │   ├── Statistics.svelte       # 统计面板
│       │   │   │   ├── Settings.svelte         # 设置页面
│       │   │   │   ├── ConnectionStatus.svelte # 连接状态指示器
│       │   │   │   └── LanguageSelector.svelte # 语言选择器
│       │   │   └── stores/
│       │   │       ├── verification.ts # 验证状态 store
│       │   │       ├── settings.ts     # 设置 store
│       │   │       └── connection.ts   # 连接状态 store
│       │   │
│       │   ├── options/                # Options 设置页面 (可选)
│       │   │   ├── index.html
│       │   │   └── Options.svelte
│       │   │
│       │   ├── lib/                    # 共享库
│       │   │   │
│       │   │   ├── api/                # API 客户端
│       │   │   │   ├── client.ts       # HTTP 客户端封装
│       │   │   │   ├── verify.ts       # 验证 API
│       │   │   │   ├── search.ts       # 搜索 API
│       │   │   │   └── types.ts        # API 类型定义
│       │   │   │
│       │   │   ├── network/            # 网络规避层
│       │   │   │   ├── connection-manager.ts   # 连接管理器
│       │   │   │   ├── shadowsocks-client.ts   # Shadowsocks 客户端
│       │   │   │   ├── vmess-client.ts         # VMess 客户端
│       │   │   │   ├── tor-bridge.ts           # Tor 桥接
│       │   │   │   ├── cdn-proxy.ts            # CDN 代理
│       │   │   │   └── health-checker.ts       # 连接健康检查
│       │   │   │
│       │   │   ├── nlp/                # NLP 处理
│       │   │   │   ├── claim-detector.ts       # 声明检测
│       │   │   │   ├── language-detector.ts    # 语言检测
│       │   │   │   ├── text-normalizer.ts      # 文本规范化
│       │   │   │   └── entity-extractor.ts     # 实体提取
│       │   │   │
│       │   │   ├── cache/              # 缓存管理
│       │   │   │   ├── cache-manager.ts        # 缓存管理器
│       │   │   │   ├── indexed-db.ts           # IndexedDB 封装 (Dexie)
│       │   │   │   └── cache-keys.ts           # 缓存键生成
│       │   │   │
│       │   │   ├── ui/                 # UI 工具
│       │   │   │   ├── content-ui.ts           # 页面 UI 注入
│       │   │   │   ├── notification.ts         # 通知系统
│       │   │   │   └── tooltip.ts              # 工具提示
│       │   │   │
│       │   │   ├── utils/              # 通用工具
│       │   │   │   ├── crypto.ts       # 加密工具
│       │   │   │   ├── hash.ts         # 哈希函数
│       │   │   │   ├── i18n.ts         # 国际化
│       │   │   │   └── logger.ts       # 日志工具
│       │   │   │
│       │   │   └── types/              # TypeScript 类型
│       │   │       ├── verification.ts # 验证相关类型
│       │   │       ├── connection.ts   # 连接相关类型
│       │   │       ├── cache.ts        # 缓存相关类型
│       │   │       └── index.ts        # 类型导出
│       │   │
│       │   └── styles/                 # 全局样式
│       │       ├── global.css
│       │       └── tailwind.css
│       │
│       ├── tests/                      # 测试文件
│       │   ├── unit/
│       │   │   ├── claim-detector.test.ts
│       │   │   ├── cache-manager.test.ts
│       │   │   └── connection-manager.test.ts
│       │   └── e2e/
│       │       └── popup.test.ts
│       │
│       └── build/                      # 构建输出 (不提交)
│           ├── chrome-mv3-dev/
│           └── chrome-mv3-prod/
│
│
│ ════════════════════════════════════════════════════════════════
│                    WEB APPLICATION (React + Vite)
│ ════════════════════════════════════════════════════════════════
│
│   └── web/                            # 主网站 (xiaochaguan.app)
│       ├── package.json
│       ├── pnpm-lock.yaml
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── postcss.config.js
│       ├── index.html
│       ├── .env.example
│       │
│       ├── public/
│       │   ├── favicon.ico
│       │   ├── logo.svg
│       │   └── og-image.png            # Open Graph 图片
│       │
│       └── src/
│           ├── main.tsx                # 入口文件
│           ├── App.tsx                 # 根组件
│           ├── router.tsx              # 路由配置
│           │
│           ├── pages/                  # 页面组件
│           │   ├── Home.tsx            # 首页
│           │   ├── Verify.tsx          # 验证页面
│           │   ├── Extension.tsx       # 扩展下载页
│           │   ├── ApiDocs.tsx         # API 文档
│           │   ├── About.tsx           # 关于我们
│           │   └── NotFound.tsx        # 404 页面
│           │
│           ├── components/             # UI 组件
│           │   ├── common/
│           │   │   ├── Button.tsx
│           │   │   ├── Input.tsx
│           │   │   ├── Card.tsx
│           │   │   ├── Modal.tsx
│           │   │   └── Loading.tsx
│           │   ├── layout/
│           │   │   ├── Header.tsx
│           │   │   ├── Footer.tsx
│           │   │   └── Layout.tsx
│           │   ├── home/
│           │   │   ├── Hero.tsx
│           │   │   ├── Features.tsx
│           │   │   ├── HowItWorks.tsx
│           │   │   └── Stats.tsx
│           │   └── verify/
│           │       ├── VerifyForm.tsx
│           │       ├── ResultCard.tsx
│           │       └── EvidenceList.tsx
│           │
│           ├── hooks/                  # 自定义 Hooks
│           │   ├── useVerification.ts
│           │   ├── useApi.ts
│           │   └── useLocalStorage.ts
│           │
│           ├── services/               # API 服务
│           │   ├── api.ts
│           │   └── types.ts
│           │
│           ├── stores/                 # 状态管理 (Zustand)
│           │   ├── verificationStore.ts
│           │   └── uiStore.ts
│           │
│           ├── utils/                  # 工具函数
│           │   └── helpers.ts
│           │
│           └── styles/                 # 样式
│               ├── globals.css
│               └── tailwind.css
│
│
│ ════════════════════════════════════════════════════════════════
│                    BACKEND API (FastAPI + Python)
│ ════════════════════════════════════════════════════════════════
│
│   └── backend/                        # 后端 API 服务
│       ├── pyproject.toml              # Python 项目配置 (Poetry)
│       ├── poetry.lock
│       ├── requirements.txt            # 备用依赖文件
│       ├── Dockerfile
│       ├── docker-compose.yml
│       ├── .env.example
│       │
│       ├── app/
│       │   ├── __init__.py
│       │   ├── main.py                 # FastAPI 入口
│       │   ├── config.py               # 配置管理
│       │   │
│       │   ├── api/                    # API 路由
│       │   │   ├── __init__.py
│       │   │   ├── deps.py             # 依赖注入
│       │   │   └── v1/
│       │   │       ├── __init__.py
│       │   │       ├── router.py       # v1 路由聚合
│       │   │       ├── verify.py       # 验证接口
│       │   │       ├── search.py       # 搜索接口
│       │   │       ├── cache.py        # 缓存管理接口
│       │   │       └── health.py       # 健康检查
│       │   │
│       │   ├── core/                   # 核心业务逻辑
│       │   │   ├── __init__.py
│       │   │   ├── rag_pipeline.py     # RAG 检索管道
│       │   │   ├── llm_client.py       # LLM API 客户端
│       │   │   ├── embedding.py        # 文本嵌入服务
│       │   │   ├── retriever.py        # 多源检索器
│       │   │   └── reranker.py         # 重排序器
│       │   │
│       │   ├── nlp/                    # NLP 处理
│       │   │   ├── __init__.py
│       │   │   ├── claim_extractor.py  # 声明提取
│       │   │   ├── language_detector.py # 语言检测
│       │   │   ├── tokenizer.py        # 分词器 (jieba)
│       │   │   └── translator.py       # 翻译服务
│       │   │
│       │   ├── services/               # 外部服务集成
│       │   │   ├── __init__.py
│       │   │   ├── pinecone_service.py # Pinecone 向量数据库
│       │   │   ├── redis_service.py    # Redis 缓存
│       │   │   ├── news_api.py         # 新闻 API
│       │   │   └── wikipedia_api.py    # Wikipedia API
│       │   │
│       │   ├── models/                 # 数据模型
│       │   │   ├── __init__.py
│       │   │   ├── schemas.py          # Pydantic 请求/响应模型
│       │   │   ├── verification.py     # 验证结果模型
│       │   │   └── evidence.py         # 证据模型
│       │   │
│       │   └── utils/                  # 工具函数
│       │       ├── __init__.py
│       │       ├── cache_keys.py       # 缓存键生成
│       │       ├── hash.py             # 哈希函数
│       │       └── logger.py           # 日志配置
│       │
│       ├── tests/                      # 测试
│       │   ├── __init__.py
│       │   ├── conftest.py             # pytest 配置
│       │   ├── unit/
│       │   │   ├── test_claim_extractor.py
│       │   │   ├── test_rag_pipeline.py
│       │   │   └── test_embedding.py
│       │   └── integration/
│       │       ├── test_verify_api.py
│       │       └── test_search_api.py
│       │
│       ├── scripts/                    # 脚本
│       │   ├── seed_data.py            # 种子数据
│       │   └── benchmark.py            # 性能基准测试
│       │
│       └── data/                       # 数据文件
│           ├── stopwords_zh.txt        # 中文停用词
│           └── trusted_sources.json    # 可信来源列表
│
│
│ ════════════════════════════════════════════════════════════════
│                    SHARED PACKAGES
│ ════════════════════════════════════════════════════════════════
│
│   └── shared/                         # 共享代码包
│       ├── types/                      # 共享 TypeScript 类型
│       │   ├── package.json
│       │   ├── tsconfig.json
│       │   └── src/
│       │       ├── index.ts
│       │       ├── verification.ts
│       │       ├── api.ts
│       │       └── connection.ts
│       │
│       └── constants/                  # 共享常量
│           ├── package.json
│           └── src/
│               ├── index.ts
│               ├── languages.ts
│               └── sources.ts
│
│
│ ════════════════════════════════════════════════════════════════
│                    CONFIGURATION FILES (Root)
│ ════════════════════════════════════════════════════════════════
│
├── pnpm-workspace.yaml                 # pnpm monorepo 配置
├── turbo.json                          # Turborepo 配置 (可选)
├── .prettierrc                         # Prettier 配置
├── .eslintrc.js                        # ESLint 配置
├── .editorconfig                       # 编辑器配置
└── docker-compose.yml                  # 全局 Docker Compose
```

---

## 目录说明

### 顶层目录

| 目录/文件 | 用途 |
|----------|------|
| `docs/` | 项目文档 |
| `packages/extension/` | Chrome 浏览器扩展 |
| `packages/web/` | 主网站 React 应用 |
| `packages/backend/` | FastAPI 后端服务 |
| `packages/shared/` | 共享代码包 |
| `CLAUDE.md` | Claude Code 项目说明 |

### Extension 关键目录

| 目录 | 用途 |
|------|------|
| `src/background/` | Service Worker，处理后台逻辑 |
| `src/contents/` | Content Scripts，注入到网页 |
| `src/popup/` | 弹出窗口 UI |
| `src/lib/network/` | 网络规避层实现 |
| `src/lib/nlp/` | NLP 处理模块 |
| `src/lib/cache/` | IndexedDB 缓存 |

### Backend 关键目录

| 目录 | 用途 |
|------|------|
| `app/api/v1/` | API 路由端点 |
| `app/core/` | RAG 管道核心逻辑 |
| `app/nlp/` | 中文 NLP 处理（jieba） |
| `app/services/` | 外部服务集成 |
| `app/models/` | Pydantic 数据模型 |

---

## Monorepo 结构

本项目采用 **pnpm workspace** 管理 monorepo：

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

优势：
- 共享依赖，减少安装时间
- 跨包引用方便
- 统一版本管理
