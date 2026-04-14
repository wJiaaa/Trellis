# Trellis

Trellis 是一个本地优先的 AI 编码工作流 CLI，用来把统一的任务流、规范目录和平台接入层写入目标项目。

当前仓库已经收敛为单包 TypeScript CLI。它的职责很明确：

- 初始化 `.trellis/` 工作流目录
- 按需生成 Claude Code、OpenCode、Codex 的接入文件
- 在一个仓库里维护模板、脚本和测试

---

## 当前定位

- 仓库自身是单包结构，不再使用 `pnpm-workspace.yaml`
- CLI 当前只保留 `init` 和 `update`
- 不再维护并行 worktree / `parallel` 流程
- `brainstorm` 只负责需求澄清与实现方案收敛
- `task-create` 负责创建或更新任务与 `prd.md`
- `task-start` 才是唯一的实现入口

---

## 支持的平台

- Claude Code
- OpenCode
- Codex

---

## CLI 命令

### `trellis init`

初始化目标项目的 Trellis 工作流和平台接入层。

会生成或更新：

- `.trellis/`
- `AGENTS.md`
- 按选择生成的平台目录：
  - `.claude/`
  - `.opencode/`
  - `.codex/`
  - `.agents/`

特点：

- 默认交互式选择平台
- 自动检测单仓/monorepo，可用参数覆盖
- 会创建初始任务 `00-bootstrap-guidelines`

可用参数：

- `-y, --yes`
- `-f, --force`
- `-s, --skip-existing`
- `--monorepo`
- `--no-monorepo`

### `trellis update`

刷新目标项目中的 Trellis 模板和平台接入层。

会做的事：

- 重新选择要保留的平台
- 重置平台接入目录
- 刷新 `.trellis/scripts`
- 刷新 `.trellis/workflow.md`
- 刷新 `.trellis/.gitignore`
- 重新生成 `AGENTS.md`
- 清理旧版残留的 workflow 接入文件

默认保留：

- `.trellis/spec`
- `.trellis/tasks`
- `.trellis/workspace`
- 已存在的 `.trellis/config.yaml`

可用参数：

- `-y, --yes`

---

## 目标项目会生成什么

`trellis init` 后，目标项目通常会得到下面这些内容：

```text
.trellis/
├── scripts/           工作流脚本
├── spec/              项目规范与思考指南
├── tasks/             任务目录
├── workspace/         会话记录
├── workflow.md        工作流说明
└── config.yaml        Trellis 配置

AGENTS.md              根级代理说明
```

如果选择了平台，还会生成对应接入层：

- `.claude/`
- `.opencode/`
- `.codex/`
- `.agents/skills/`

---

## 目标项目中的实际工作流

### 1. 初始化

在目标项目里执行一次：

```bash
trellis init
```

### 2. 新会话开始

每次新会话开始后，手动执行平台对应的 `init` 命令或 skill。

### 3. 需求明确时

- `task-create`
- `task-start`

### 4. 需求不明确时

- `brainstorm`
- `task-create`
- `task-start`

### 5. 实现完成后

- `check`
- 或 `check-cross-layer`

### 6. 收尾

- `finish-work`
- 人工执行 `git commit`
- 需要记录会话时再执行 `record-session`

---

## 当前任务流的关键约束

- `brainstorm` 只做需求澄清、代码库研究和方案收敛，不应创建任务或写 `prd.md`
- `task-create` 负责把确认后的需求写入任务目录和 `prd.md`
- `task-start` 才会激活任务并启动实现子代理
- `check` / `check-cross-layer` 是进入 `finish-work` 之前的显式检查步骤
- `record-session` 不会自动提交 `.trellis` 元数据

---

## 本仓库开发

安装依赖：

```bash
pnpm install
```

构建：

```bash
pnpm build
```

本地运行 CLI：

```bash
node ./bin/trellis.js init
node ./bin/trellis.js update
```

常用校验命令：

```bash
pnpm test
pnpm lint
pnpm typecheck
pnpm lint:py
```

---

## 仓库结构

```text
bin/                     CLI 启动入口
scripts/                 构建辅助脚本
src/cli/                 commander CLI 入口
src/commands/            CLI 命令实现
src/configurators/       平台与 workflow 生成逻辑
src/templates/           生成到目标项目的模板
src/utils/               通用工具函数
test/                    自动化测试
dist/                    构建产物

.trellis/                当前仓库自用的 workflow 源
.claude/                 当前仓库自用的 Claude 模板源
.opencode/               当前仓库自用的 OpenCode 模板源
.codex/                  当前仓库自用的 Codex 模板源
.agents/                 当前仓库自用的共享 skills 源
```

这些根目录下的 dotfiles / dotdirs 不是历史包袱，而是 Trellis 自己用来 dogfood 的模板源。

---

## 这个仓库适合改什么

- `trellis init` / `trellis update` 的行为
- `.trellis/scripts/` 模板
- `spec/` 模板和引导文档
- Claude / OpenCode / Codex 的平台接入方式
- 模板与生成行为的回归测试
