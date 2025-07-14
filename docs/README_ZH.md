# Gemini Balance - Next.js 版本

You can read this document in [English](README.md).

本项目是 `gemini-balance` Python 项目的高性能、功能丰富的 Next.js 实现。它作为一个智能 AI 网关，通过多种 API 格式（包括 OpenAI 兼容格式）接收请求，并将其路由到 Google 的 Gemini 模型。

该版本超越了简单的代理，提供了一套强大的功能集，包括管理仪表盘、持久化配置和高级身份验证，使其成为一个功能强大且灵活的开发解决方案。

## 重要说明

- **项目来源与致谢**: 本项目是原始 Python 项目 [gemini-balance](https://github.com/snailyp/gemini-balance) 的 Next.js 实现。特别感谢原作者的灵感。目前，项目仅实现了核心的 API 转发和管理能力，其他功能正在陆续开发中。
- **AI 生成**: 除了本段声明外，本项目中的所有代码和文档均由 Google 的 Gemini 模型编写。
- **贡献**: 欢迎提交 Pull Request！请注意，PR 也将由 AI 模型进行审查和处理。
- **维护**: 作者本人并非 Python 开发者，不熟悉原项目的具体细节。未来的更新和维护将交由 AI 模型处理。

## 核心功能

- **多 API 接口**:
  - **`/v1beta` 和 `/gemini`**: Gemini 原生代理端点，支持灵活的身份验证（URL 中的 API 密钥、`x-goog-api-key` 请求头或 Bearer 令牌）。
  - **`/openai`**: OpenAI 兼容端点，要求严格的 Bearer 令牌身份验证。
- **智能负载均衡**: 管理一个 Gemini API 密钥池，轮流使用密钥以分配请求负载。
- **自动故障转移与重试**: 如果使用特定密钥的请求失败，系统会自动使用下一个可用密钥重试，确保服务的高可用性。
- **持久化健康跟踪**: 监控密钥失败次数，自动将失败的密钥移出活动池，并将其状态同步到持久化数据库。
- **Web UI 与管理仪表盘**:
  - 一个用于测试的简单聊天界面。
  - 位于 `/admin` 的管理仪表盘，用于查看密钥状态、管理设置和监控日志。
- **数据库持久化**: 使用 Prisma 和 SQLite 数据库存储 API 密钥和应用设置。
- **安全身份验证**:
  - 使用专用的 `AUTH_TOKEN` 保护管理仪表盘。
  - 使用灵活的 `ALLOWED_TOKENS` 系统保护 API 端点。

## 项目结构与代码导览

为了更好地理解本项目，我们建议按以下顺序探索文件：

1.  **`src/middleware.ts`**: 所有传入请求的入口点。该文件处理路由和身份验证逻辑，根据路径将流量引导至正确的处理程序。
2.  **`src/lib/gemini-proxy.ts`**: 核心代理逻辑。它从 API 路由接收请求，获取一个可用的 API 密钥，并将请求转发给 Google Gemini API。
3.  **`src/lib/key-manager.ts`**: `KeyManager` 类，负责所有 API 密钥管理，包括从环境和数据库加载密钥、轮换和失败跟踪。
4.  **`src/app/{gemini,openai,v1beta}`**: 包含 API 路由的目录。这些路由非常轻量，将所有逻辑委托给中间件和代理。
5.  **`src/app/admin`**: 管理仪表盘的代码，包括 UI 组件和用于管理应用的服务器端操作。
6.  **`prisma/schema.prisma`**: 定义用于存储 API 密钥和设置的数据库 schema。

## 快速上手

请按照以下步骤在本地运行本项目。

### 1. 安装依赖

进入项目目录并安装所需依赖包。

```bash
pnpm install
```

### 2. 初始化数据库

本项目使用 Prisma 进行数据库管理。运行以下命令创建 SQLite 数据库并应用 schema。

```bash
pnpm prisma migrate dev
```

这将在 `prisma/` 目录下创建一个 `dev.db` 文件。

### 3. 配置环境变量

- 通过复制示例文件来创建一个 `.env.local` 文件：`cp .env.example .env.local`。
- 打开 `.env.local` 并设置以下变量：

```env
# .env.local

# 1. Gemini API 密钥 (必需)
# 您的 Google AI Gemini API 密钥，以逗号分隔。
# 这些密钥将在首次运行时加载到数据库中。
GEMINI_API_KEYS=your_gemini_key_1,your_gemini_key_2

# 2. 管理仪表盘认证令牌 (必需)
# 用于访问 /admin 管理面板的秘密令牌。
AUTH_TOKEN=a_strong_and_secret_token_for_ui

# 3. API 访问令牌 (可选)
# 允许访问 API 端点的令牌列表，以逗号分隔。
# 如果留空，您仍然可以使用您的 AUTH_TOKEN 访问 API。
ALLOWED_TOKENS=user_token_1,user_token_2

# 4. Google API 主机 (可选, 默认: https://generativelanguage.googleapis.com)
# 可以被覆盖以使用代理或不同的区域端点。
GOOGLE_API_HOST=https://generativelanguage.googleapis.com

# 5. 密钥失败阈值 (可选, 默认: 3)
# 在将密钥标记为无效之前，允许的最大连续失败次数。
MAX_FAILURES=3

# 6. 代理服务器地址 (可选)
# 如果您的服务器位于 Gemini API 不支持的地区，
# 您可以提供一个 HTTP/HTTPS 代理服务器地址来转发请求。
# 示例: PROXY_URL=http://user:pass@host:port
PROXY_URL=
```

### 4. 运行开发服务器

启动 Next.js 开发服务器。

```bash
pnpm dev
```

## 使用 Docker 部署

本项目是一个**有状态应用**，需要一个数据库。提供的 `Dockerfile` 已为生产部署进行了优化，使用了 Next.js 的 `standalone` 输出模式，并包含一个健壮的自动化数据库迁移机制。

### 生产环境部署 (例如，使用 Coolify)

这是在生产环境中运行本应用的推荐方法。

#### 1. 部署原则

- **Standalone 输出**：`Dockerfile` 利用了 Next.js 的 `output: "standalone"` 特性来创建一个最小化的、为生产优化的镜像。`next.config.ts` 文件已配置为可以正确追踪并包含部署所需的 Prisma 文件。
- **自动迁移与权限管理**：镜像使用一个 `entrypoint.sh` 脚本来解决关键的部署挑战：
  1.  它以 `root` 用户身份启动，以修复由部署平台挂载的数据卷的权限问题。
  2.  然后，它以权限较低的 `nextjs` 用户身份运行数据库迁移 (`npx prisma migrate deploy`)。
  3.  最后，它以 `nextjs` 用户身份启动应用服务器。
- **数据与配置分离**：应用被设计为将其数据库存储在一个专用的 `/app/data` 目录中，而 Prisma 的配置文件保留在 `/app/prisma`。这种分离是实现持久化数据存储而无部署错误的关键。

#### 2. 部署平台配置 (Coolify 示例)

当从 GitHub Container Registry 部署预构建的镜像时，您需要在您的服务中配置两个关键设置：

1.  **卷挂载 (Volume Mount)**：

    - 将一个持久化卷挂载到容器的 `/app/data` 目录。
    - **源 (Source)**：`your_persistent_storage` (例如，由 Coolify 管理的卷)
    - **目标/挂载路径 (Target/Mount Path)**：`/app/data`
    - **至关重要**：**不要**将卷挂载到 `/app/prisma`。这样做会隐藏镜像中内置的 schema 文件，并导致迁移命令失败。

2.  **环境变量 (Environment Variables)**：
    - 将 `DATABASE_URL` 设置为指向**卷内**的数据库文件。必需值为 `file:/app/data/prod.db`。
    - 设置所有其他所需的环境变量 (如 `GEMINI_API_KEYS`, `AUTH_TOKEN` 等)。

#### 3. 本地开发与 Docker Compose

对于模拟生产环境的本地测试，您可以使用项目提供的 `docker-compose.yml` 文件。

```bash
# 1. 确保您有一个包含环境变量的 .env 文件
cp .env.local .env

# 2. 在后台构建并运行容器
docker-compose up --build -d
```

`docker-compose.yml` 文件已预先配置为使用生产部署策略：它将本地的 `./data` 目录挂载到容器的 `/app/data`，并相应地设置 `DATABASE_URL`。`entrypoint.sh` 脚本将在首次启动时自动处理数据库迁移。

## 使用 GitHub Actions 进行 CI/CD

本项目包含一个 GitHub Actions 工作流，它会在代码被推送到 `master` 分支时，自动构建一个 Docker 镜像并将其推送到 **GitHub Container Registry (ghcr.io)**。

### 1. Fork 本仓库

首先，将此仓库 fork 到您自己的 GitHub 账户下。

### 2. 配置 GitHub Secrets

工作流需要您在 GitHub 仓库的设置中（`Settings` > `Secrets and variables` > `Actions`）配置一些 secrets，用于构建镜像和触发部署。

**Docker 构建所需 Secrets:**
这些 secrets 会作为构建参数传递给 Docker，并嵌入到您的镜像中。

- `GEMINI_API_KEYS`: 您的 Gemini API 密钥，以逗号分隔。
- `AUTH_TOKEN`: 用于管理仪表盘的秘密令牌。
- `DATABASE_URL`: 您的数据库连接字符串。对于生产环境，应指向持久化卷中的文件，例如 `file:/app/data/prod.db`。
- `ALLOWED_TOKENS` (可选): API 访问令牌，以逗号分隔。
- `MAX_FAILURES` (可选): 密钥失败阈值。
- `GOOGLE_API_HOST` (可选): 自定义的 Google API 主机。

**用于自动重新部署 (可选):**
如果您使用像 Coolify 这样的托管服务，您可以配置 webhook，以便在推送新镜像时自动重新部署您的应用。

- `COOLIFY_WEBHOOK`: Coolify 提供的 webhook URL。
- `COOLIFY_TOKEN`: Coolify webhook 的认证令牌。

### 3. 工作原理

- 工作流定义在 `.github/workflows/deploy.yml` 文件中。
- 每当有代码推送到 `master` 分支时，该 action 将会：
  1. 检出代码。
  2. 登录到 GitHub Container Registry (`ghcr.io`)。
  3. 构建 Docker 镜像，并注入您配置的 secrets。
  4. 将镜像推送到 `ghcr.io`，并将其标记为 `ghcr.io/YOUR_USERNAME/gemini-balance-nextjs:latest` 以及其他基于 git 的标签。
  5. (可选) 通过配置的 webhook 在您的托管服务上触发重新部署。

之后，您可以在您的服务器上拉取此镜像，或配置您的托管服务从 `ghcr.io` 自动拉取，以部署最新版本。

### 5. 探索应用

- **管理仪表盘**: 打开 [http://localhost:3000/admin](http://localhost:3000/admin) 并使用您的 `AUTH_TOKEN` 登录。在这里您可以看到 `GEMINI_API_KEYS` 的状态。
- **API 端点**: 使用 `curl` 或 Postman 等工具与 API 端点交互，请提供 `ALLOWED_TOKENS` 中的令牌或您的 `AUTH_TOKEN`。

**Gemini/v1beta `curl` 示例:**

```bash
curl -X POST http://localhost:3000/v1beta/models/gemini-pro:generateContent?key=user_token_1 \
-H "Content-Type: application/json" \
-d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
```

**OpenAI `curl` 示例:**

```bash
curl -X POST http://localhost:3000/openai/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer user_token_1" \
-d '{"model": "gemini-pro", "messages": [{"role": "user", "content": "Hello!"}]}'
```
