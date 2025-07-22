# Gemini Balance Next.js 迁移项目 - 继续工作指南

你好！我是 Cline，本项目的前期高级全栈开发工程师。我已经完成了项目的初始化和基础架构搭建 (P0 阶段)。现在，我将把后续的开发工作交接给你。请严格遵循以下指南，以确保项目质量和开发流程的一致性。

## 1. 项目核心理念

在开始编码前，请务必理解本项目的核心设计哲学：

- **开源优先**: 我们的目标是创建一个对开源社区友好、易于理解、部署和贡献的项目。
- **简化配置**: 最大程度地减少用户在部署前需要手动配置的步骤。我们的目标是实现“零环境变量”的“开箱即用”体验。
- **减少依赖**: 审慎引入外部依赖。优先使用平台原生能力 (Next.js, Vercel/Cloudflare) 和 Web Standards API。
- **灵活部署**: 虽然我们优先为边缘平台（Vercel/Cloudflare + D1）优化，但架构设计必须保留在 Docker 环境中使用标准 Postgres 自托管的能力。

## 2. 当前项目状态

- **Git 分支**: 你当前应该在 `develop` 分支上。所有开发工作都应在此分支上进行。
- **已完成工作**:
  - 项目已使用 Next.js (App Router, no-src), TypeScript, Tailwind CSS, pnpm 初始化。
  - Drizzle ORM 已集成，数据库 Schema (`lib/db/schema.ts`) 和配置文件 (`drizzle.config.ts`) 已创建。
  - API 路由重写规则已在 `next.config.js` 中配置，以确保与原项目 100% 兼容。
  - 核心服务层 (`key.service.ts`, `chat.service.ts`) 和配置服务 (`config.ts`) 的骨架已搭建完毕。
  - 所有 P0 阶段的工作已完成并已作为一次 commit 提交。

## 3. 你的工作流程 (必须严格遵守)

这是我们与项目所有者共同制定的工作流程，请务必遵守：

1.  **查阅工作清单**: 打开 `docs/WORK_PLAN.md` 文件。这是你后续所有工作的唯一任务来源。
2.  **选择任务**: 从清单中选择**优先级最高**的、**未完成**的任务开始工作。
3.  **执行开发**: 按照任务描述和《Project_Migration_Proposal_NextJS_v2_ZH.md》中的详细设计，完成编码工作。
4.  **代码质量检查**:
    a. **Linting**: 在提交前，必须在项目根目录运行 `pnpm lint`，并修复所有 ESLint 报告的错误和警告。
    b. **构建验证**: 运行 `pnpm build`，确保项目可以成功编译，没有任何 TypeScript 或其他构建错误。
5.  **创建 Git 提交**:
    a. **一次提交对应一项任务**: 确保你的每次提交都只包含一个已完成的任务。这有助于保持 Git 历史的清晰。
    b. **遵循提交规范**: 使用**约定式提交 (Conventional Commits)** 规范来撰写 commit message。格式为：`feat(P1): implement LRU logic in KeyService` 或 `fix(config): resolve type error in settings`。
6.  **更新工作清单**: 提交后，回到 `docs/WORK_PLAN.md` 文件，将你刚刚完成的任务标记为已完成 (`[x]`)。

## 4. 下一步工作 (你的起点)

你的第一个任务是 **任务 1.1**。

- **任务**: `[ ] **任务 1.1**: 实现 key.service.ts 中的密钥管理逻辑 (LRU 轮询, 故障处理)。`
- **实现细节参考**:
  - **文件**: `lib/services/key.service.ts`
  - **方案**: 查阅 `docs/Project_Migration_Proposal_NextJS_v2_ZH.md` 的 **6.1 节** 和 **6.2 节**。
  - **关键逻辑**:
    - `getNextWorkingKey`: 实现基于 `lastUsedAt` 的 LRU 策略。
    - `handleApiFailure`: 实现基于 `failureCount` 的原子性递增。

祝你工作顺利！这个项目有巨大的潜力，你的贡献至关重要。
