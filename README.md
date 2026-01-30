# 小查馆 (XiaoChaGuan)

> AI-Powered Multilingual Fact-Checking Browser Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-green.svg)](https://www.python.org/)

## 概述

小查馆是一个面向中国大陆用户的多语种事实核查浏览器扩展。通过 RAG（检索增强生成）架构和多层网络规避策略，帮助用户验证社交媒体上可能被误译或曲解的外文新闻来源。

## 功能特性

- 🔍 **自动检测** - 浏览时自动识别可疑声明
- 🌐 **跨语言验证** - 支持 10+ 语言的原文对比
- 🛡️ **网络规避** - 多层代理确保稳定访问
- 💾 **离线模式** - 本地缓存支持离线使用
- 🔒 **隐私优先** - 数据最小化，本地优先

## 技术栈

| 组件 | 技术 |
|------|------|
| 浏览器扩展 | TypeScript, Svelte, Plasmo, Tailwind CSS |
| 主网站 | React, TypeScript, Vite |
| 后端 API | Python, FastAPI, Pydantic |
| AI/NLP | Claude API, jieba, sentence-transformers |
| 数据存储 | Pinecone, Redis, IndexedDB |

## 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+
- Python 3.11+
- Docker (可选)

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-username/xiaochaguan.git
cd xiaochaguan

# 安装前端依赖
pnpm install

# 安装后端依赖
cd packages/backend
poetry install
```

### 开发

```bash
# 启动扩展开发服务器
pnpm --filter extension dev

# 启动后端 API
pnpm --filter backend dev

# 启动主网站
pnpm --filter web dev
```

### 构建

```bash
# 构建所有包
pnpm build

# 仅构建扩展
pnpm --filter extension build
```

## 项目结构

```
xiaochaguan/
├── packages/
│   ├── extension/      # Chrome 浏览器扩展
│   ├── web/            # 主网站
│   ├── backend/        # FastAPI 后端
│   └── shared/         # 共享代码
├── docs/               # 文档
└── CLAUDE.md           # AI 助手项目说明
```

## 文档

- [项目蓝图](docs/PROJECT_BLUEPRINT.md)
- [项目结构](docs/PROJECT_STRUCTURE.md)
- [开发指南](docs/DEVELOPMENT.md)
- [API 文档](docs/API_REFERENCE.md)

## 贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详情。

## 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 免责声明

本项目仅供学习和研究使用。使用者需自行承担在受限网络环境下使用的风险。
