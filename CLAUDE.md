# CLAUDE.md - XiaoChaGuan Project Guide

> This file provides context for Claude Code to understand and assist with the XiaoChaGuan project.

---

## Project Overview

**XiaoChaGuan (小查馆)** is an AI-powered multilingual fact-checking browser extension designed for users in censorship-restricted environments (primarily mainland China). It helps users verify potentially mistranslated or misrepresented foreign-language news sources on Chinese social media platforms.

### Problem Statement

Chinese self-media frequently mistranslates or distorts non-Chinese news sources, while audiences cannot access original platforms due to GFW (Great Firewall) restrictions. This project provides:

1. Automated claim detection on Chinese social media
2. Cross-lingual verification against original sources
3. Multi-layered network circumvention for reliable access
4. Local-first caching for offline functionality

### Target Users

- Chinese social media users (Weibo, WeChat, Zhihu, Douyin, Xiaohongshu)
- Journalists and content moderators
- Researchers studying misinformation

---

## Repository Structure

```
xiaochaguan/
├── packages/
│   ├── extension/          # Chrome/Edge browser extension (Svelte + Plasmo)
│   ├── web/                # Main website (React + Vite)
│   ├── backend/            # API service (FastAPI + Python)
│   └── shared/             # Shared types and constants
├── docs/                   # Documentation
├── docker-compose.yml      # Container orchestration
└── CLAUDE.md               # This file
```

---

## Tech Stack

### Browser Extension (`packages/extension/`)

| Technology | Purpose |
|------------|---------|
| TypeScript | Primary language |
| Svelte | UI framework |
| Plasmo | Extension framework |
| Tailwind CSS | Styling |
| IndexedDB (Dexie.js) | Local storage |
| @plasmohq/messaging | Extension messaging |

**Key directories:**
- `src/background/` - Service Worker for background tasks
- `src/contents/` - Content scripts injected into web pages
- `src/popup/` - Popup UI components
- `src/lib/network/` - Network circumvention layer
- `src/lib/nlp/` - NLP processing
- `src/lib/cache/` - Cache management

### Web Application (`packages/web/`)

| Technology | Purpose |
|------------|---------|
| TypeScript | Primary language |
| React 18 | UI framework |
| Vite | Build tool |
| TanStack Query | Data fetching |
| Zustand | State management |
| Tailwind CSS | Styling |

### Backend API (`packages/backend/`)

| Technology | Purpose |
|------------|---------|
| Python 3.11+ | Primary language |
| FastAPI | Web framework |
| Pydantic | Data validation |
| jieba | Chinese word segmentation |
| sentence-transformers | Text embeddings |
| Claude API / GPT-4 | LLM analysis |
| Pinecone | Vector database |
| Redis | Caching layer |

**Key directories:**
- `app/api/v1/` - API endpoints
- `app/core/` - RAG pipeline implementation
- `app/nlp/` - NLP processing (jieba, language detection)
- `app/services/` - External service integrations

---

## Core Architecture

### RAG Pipeline Flow

```
User Input → Claim Extraction (jieba) → Language Detection
    → Embedding (sentence-transformers) → Multi-source Retrieval (Pinecone)
    → Re-ranking → LLM Analysis (Claude/GPT-4) → Verification Result
```

### Network Circumvention Layers

Priority order:
1. Direct connection (for overseas users)
2. Shadowsocks (primary)
3. VMess/V2Ray (fallback)
4. Tor + Snowflake (last resort)
5. Offline mode (local cache)

### Caching Strategy

| Layer | Storage | TTL |
|-------|---------|-----|
| L1 | Memory | Session |
| L2 | IndexedDB | 7 days |
| L3 | Redis | 24 hours |
| L4 | Pinecone | 30 days |

---

## Development Commands

### Extension

```bash
cd packages/extension

# Install dependencies
pnpm install

# Development mode (hot reload)
pnpm dev

# Build for production
pnpm build

# Build for Firefox
pnpm build:firefox

# Run tests
pnpm test
```

### Web

```bash
cd packages/web

# Install dependencies
pnpm install

# Development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

### Backend

```bash
cd packages/backend

# Install dependencies (using Poetry)
poetry install

# Or using pip
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Run with Docker
docker-compose up -d
```

---

## Key Files to Understand

### Extension

| File | Purpose |
|------|---------|
| `src/background/index.ts` | Service Worker entry, handles messaging and network |
| `src/contents/analyzer.ts` | Main content script, analyzes page content |
| `src/popup/Popup.svelte` | Main popup UI |
| `src/lib/network/connection-manager.ts` | Multi-layer network management |
| `src/lib/nlp/claim-detector.ts` | Identifies verifiable claims |
| `src/lib/cache/indexed-db.ts` | IndexedDB wrapper using Dexie |

### Backend

| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI entry point |
| `app/core/rag_pipeline.py` | Main RAG verification pipeline |
| `app/core/llm_client.py` | Claude/GPT API wrapper |
| `app/core/embedding.py` | sentence-transformers integration |
| `app/nlp/claim_extractor.py` | Extracts claims using jieba |
| `app/nlp/language_detector.py` | Detects language of text |
| `app/services/pinecone_service.py` | Vector database operations |

---

## API Endpoints

### Verification

```
POST /api/v1/verify
Content-Type: application/json

{
  "text": "日本政府宣布将于2024年禁止所有外国游客入境",
  "language": "zh-CN",
  "options": {
    "cross_lingual": true,
    "max_sources": 5
  }
}
```

Response:
```json
{
  "verdict": "false",
  "confidence": 0.92,
  "summary": "该声明为虚假信息...",
  "evidence_chain": [...],
  "mistranslation_detected": true
}
```

### Search

```
POST /api/v1/search
Content-Type: application/json

{
  "query": "Japan tourism policy 2024",
  "languages": ["en", "ja"],
  "sources": ["news", "official"]
}
```

### Health Check

```
GET /api/v1/health
```

---

## Environment Variables

### Extension (.env.local)

```env
PLASMO_PUBLIC_API_URL=https://api.xiaochaguan.app
PLASMO_PUBLIC_SENTRY_DSN=your-sentry-dsn
```

### Backend (.env)

```env
# LLM APIs
CLAUDE_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx

# Vector Database
PINECONE_API_KEY=xxx
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX=xiaochaguan

# Cache
REDIS_URL=redis://localhost:6379

# Embedding Model
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2
```

---

## Coding Conventions

### TypeScript (Extension & Web)

- Use TypeScript strict mode
- Prefer `interface` over `type` for object shapes
- Use named exports
- Follow Svelte/React best practices

```typescript
// Good
interface VerificationResult {
  verdict: 'true' | 'false' | 'partly_true' | 'unverified';
  confidence: number;
  summary: string;
}

export function verifyClain(text: string): Promise<VerificationResult> {
  // ...
}
```

### Python (Backend)

- Use type hints everywhere
- Follow PEP 8
- Use Pydantic for data validation
- Use async/await for I/O operations

```python
# Good
from pydantic import BaseModel

class VerificationRequest(BaseModel):
    text: str
    language: str = "zh-CN"
    options: dict | None = None

async def verify_claim(request: VerificationRequest) -> VerificationResult:
    ...
```

---

## Testing

### Extension

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

### Backend

```bash
# All tests
pytest

# With coverage
pytest --cov=app

# Specific module
pytest tests/unit/test_rag_pipeline.py
```

---

## Common Tasks

### Adding a New Language

1. Add language code to `packages/shared/constants/languages.ts`
2. Update `claim_extractor.py` with language-specific rules
3. Add test cases for the new language

### Adding a New Data Source

1. Create service in `app/services/`
2. Register in `app/core/retriever.py`
3. Add source credibility score in `data/trusted_sources.json`

### Modifying RAG Pipeline

Key file: `app/core/rag_pipeline.py`

The pipeline follows this structure:
```python
async def verify(text: str) -> VerificationResult:
    claims = await extract_claims(text)
    embeddings = await embed_claims(claims)
    evidence = await retrieve_evidence(embeddings)
    ranked = await rerank_evidence(evidence)
    result = await llm_analyze(claims, ranked)
    return result
```

---

## Performance Targets

| Metric | Target |
|--------|--------|
| Verification accuracy | > 85% |
| Response time (cached) | < 2s |
| Response time (live) | < 8s |
| Cache hit rate | > 60% |
| Network uptime | > 95% |
| False positive rate | < 8% |

---

## Deployment

### Extension

1. Build production version: `pnpm build`
2. Package for Chrome Web Store
3. Also distribute via GitHub Releases

### Backend

```bash
# Build Docker image
docker build -t xiaochaguan-api .

# Run with docker-compose
docker-compose up -d
```

### Web

Deploy to Cloudflare Pages or Vercel:
```bash
pnpm build
# Deploy dist/ folder
```

---

## Troubleshooting

### Extension won't build

1. Clear node_modules: `rm -rf node_modules && pnpm install`
2. Clear Plasmo cache: `rm -rf .plasmo`
3. Check TypeScript errors: `pnpm check`

### Backend tests failing

1. Ensure Redis is running: `docker-compose up redis -d`
2. Check environment variables
3. Run specific test with `-v` flag

### Network connection issues

1. Check `connection-manager.ts` logs
2. Verify proxy server status
3. Test with direct connection first

---

## Resources

- [Plasmo Documentation](https://docs.plasmo.com/)
- [Svelte Documentation](https://svelte.dev/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [sentence-transformers](https://www.sbert.net/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [jieba Chinese NLP](https://github.com/fxsjy/jieba)

---

## Contact & Contributing

- GitHub Issues for bug reports
- Pull Requests welcome
- See `CONTRIBUTING.md` for guidelines

---

*Last updated: 2025-01-29*
