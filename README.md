# Trellis

一个本地优先的 AI 编码工作流 CLI。

这个仓库当前已经收敛成单包结构，核心目标很简单：

- 用 `trellis init` 在项目里生成 `.trellis/` 工作流目录
- 按需生成 Claude、OpenCode、Codex 的接入文件
- 把模板、脚本和测试都放在一个仓库里维护

现在它不是 monorepo，也不包含发布流程配置。仓库定位是“本地开发中的核心实现”。

## 当前能力

- 初始化 Trellis 工作流目录
- 生成 `.trellis/` 基础结构、脚本和模板
- 生成平台接入层：
  - `.claude/`
  - `.opencode/`
  - `.codex/`
  - `.agents/`
  - `AGENTS.md`
- 维护模板到 `dist/templates/` 的构建产物

当前 CLI 入口只有一个命令：

```bash
trellis init
```

可用参数：

- `--claude`
- `--opencode`
- `--codex`
- `-y, --yes`
- `-f, --force`
- `-s, --skip-existing`
- `--monorepo`
- `--no-monorepo`

## 本地开发

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
```

如果要生成特定平台配置：

```bash
node ./bin/trellis.js init --claude --codex
```

## 校验命令

单元测试：

```bash
pnpm test
```

TypeScript lint：

```bash
pnpm lint
```

类型检查：

```bash
pnpm typecheck
```

Python 静态检查：

```bash
pnpm lint:py
```

全部常用检查：

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
pnpm lint:py
```

## 目录说明

```text
bin/                     CLI 启动入口
scripts/                 构建辅助脚本
src/cli/                 commander CLI 入口
src/commands/            CLI 命令实现
src/configurators/       各平台初始化逻辑
src/templates/           生成到用户项目的模板
src/utils/               通用工具函数
test/                    测试
.trellis/                当前仓库自己的 Trellis 工作流目录
.claude/                 当前仓库自己的 Claude 接入配置
```

## 当前约束

- 仓库自身已经改成单包结构，不再依赖 `pnpm-workspace.yaml`
- 发布脚本和 GitHub CI 已移除
- Python 相关检查仍然保留，因为 `.trellis/scripts/` 和模板里还有 Python 文件

## 适合什么时候改这个仓库

- 你要调整 `trellis init` 的生成内容
- 你要修改 `.trellis` 脚本模板
- 你要改 Claude / OpenCode / Codex 的模板接入方式
- 你要补测试，确保生成行为不回退
