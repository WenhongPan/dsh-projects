# dsh-projects

[English](README.en.md) · 简体中文

面向 DeepSeek Harness 的项目式 Workspace/Session 管理插件。

> 状态：`0.1.0-alpha.1`。目前仅在 Windows x64、DSH Desktop 2.0.0、DeepSeek Harness 0.1.0-rc.6 上进行过人工使用；其他平台仍需验证。

## 功能

- 在新会话输入框上方提供可搜索的项目选择器。
- 不选择项目也能开始聊天；自动创建 `~/Documents/DSH-Default/YYYY-MM-DD/new-chat[-N]` 任务目录。
- 创建项目时分别设置显示名称与源文件夹。
- 原生目录选择不可用时回退到应用内目录浏览器。
- 按项目或单列表组织会话，另设“最近”区域。
- 项目与聊天置顶、项目收藏、手动拖动排序。
- 项目和聊天悬停摘要。
- 重命名项目、在文件管理器中打开、归档聊天、移除项目注册。
- 搜索项目名、聊天标题和聊天正文。
- 查看已归档聊天；恢复能力取决于 DSH 是否提供取消归档 API。
- 跟随 DSH 浅色/深色主题。

插件使用 DSH 原生 Workspace 和 Session 数据，不建立第二套项目数据库。卸载插件不会删除项目文件夹或会话记录。

## 安装

公开包发布前，可从本地目录安装：

```powershell
dsh plugin --profile desktop add link:C:/path/to/dsh-projects
```

普通 Web UI 使用：

```bash
dsh plugin --profile web add link:/path/to/dsh-projects
```

安装或升级后重启相应 profile。Desktop 与 Web profile 不会自动互相复制插件。

## 全文搜索（可选）

聊天正文搜索需要 DSH 会话索引。在目标 profile 的 `cordis.patch.yml` 中加入：

```yaml
- id: session-query-sqlite
  config:
    path: !!js dshHomePath('session-search.sqlite')
    openAt: first-search
```

这会在本机生成会话全文索引。它包含由聊天内容派生的数据，应与原始会话数据采用同等隐私保护。

## 开发

```bash
npm install
npm run verify
npm pack --dry-run
```

`npm run verify` 会执行语法检查、单元测试并重新生成 `dist/client.js`。

## 数据与卸载

项目、项目顺序、会话顺序、归档状态和会话正文由 DSH 管理。以下显示偏好保存在浏览器 `localStorage`：

- 按项目/单列表视图
- 排序方式
- 项目置顶与收藏
- 聊天置顶
- 单列表手动顺序

清除站点数据会重置这些偏好，但不会删除 DSH Workspace、Session 或磁盘文件。

## 已知限制

- 当前 DSH 0.1.0-rc.6 只公开归档操作，没有公开取消归档操作；因此官方未提供能力时，归档中心不能可靠恢复聊天。
- 默认任务根目录目前使用 `~/Documents/DSH-Default`。后续版本会增加可配置根目录并完善 Linux XDG 目录支持。
- 远程 Web UI 中的文件夹均位于运行 DSH Host 的机器，而不是浏览器所在机器。
- DeepSeek Harness 仍处于 Developer Preview，升级可能造成兼容性变化。

完整说明见 [兼容性矩阵](docs/compatibility.md) 和 [架构说明](docs/architecture.md)。

## 许可证

MIT。Codex、OpenAI、DeepSeek 和 DeepSeek Harness 的名称与商标归各自权利人所有，仅用于说明兼容关系和设计灵感。
