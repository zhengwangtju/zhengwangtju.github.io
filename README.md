# 王征课题组 · 个人主页

天津大学 王征 教授课题组（记忆与推理课题组）主页。基于 **Jekyll**（GitHub Pages 原生支持，无需本地构建工具链），内容与样式解耦、数据驱动，按职责分目录，便于维护与扩展。

## 板块（导航）

首页 · 论文 · 项目 · 成员 · Datasets —— 导航在 `_data/nav.yml` 统一维护。

## 如何更新内容（基本不用碰 HTML / CSS）

| 想做的事 | 改哪个文件 |
|---|---|
| 改个人简介 / 头衔 / 联系方式 | `_data/site_info.yml` |
| 加一条实验室动态 | `_data/news.yml`（在最上面加一项） |
| 加一篇论文 | `_data/publications.yml`（追加一条） |
| 加一项科研课题 | `_data/grants.yml`（追加一条） |
| 加 / 改成员、校友、培养理念 | `_data/members.yml` |
| 加一个项目（含详情页） | 在 `_projects/` 新建一个 `xxx.md`（照现有文件填字段） |
| 加一个数据集（含详情页） | 在 `_datasets/` 新建一个 `xxx.md` |
| **加一个全新板块** | `_data/nav.yml` 加一项 + 在 `pages/` 建一个同名页面（设好 `permalink:`） |

> 加内容 = 编辑数据文件；加板块 = 一条导航 + 一个薄页面。不产生重复、强耦合的代码。

## 目录结构（按职责划分）

```
_config.yml             站点配置（Jekyll 约定，必须在根）
_data/                  内容数据（YAML）—— 站点的“数据库”
_includes/
  ├── layout/           页面外壳组件：head / masthead / nav / footer
  └── components/       可复用 UI 组件：project-card / member-card / publication-item / dataset-card
_layouts/               页面骨架：default / page / project / dataset
pages/                  页面源文件：home / publications / projects / members / datasets / 404
                        （输出 URL 由各文件的 permalink 决定，根目录不再散落 HTML）
_projects/              项目集合：每个 .md = 一个详情页（/projects/<slug>/）并自动进入列表
_datasets/              数据集集合：同上（/datasets/<slug>/）
assets/
  ├── css/site.css      全站样式（设计变量集中在 :root，便于整体视觉改版）
  └── img/              图片（ASCII 命名）
README.md  robots.txt
```

**职责边界一目了然**：配置 / 数据 / 组件（外壳 vs 复用）/ 骨架 / 页面 / 集合 / 资源 各司其职。
URL 为层级化干净路径：`/`、`/publications/`、`/projects/`（列表）+ `/projects/<slug>/`（详情）。

## 本地预览

```bash
jekyll serve        # 浏览 http://localhost:4000
```

GitHub Pages 会在推送到 `master` 后自动用 Jekyll 构建并发布，无需手动操作。

---

> 当前视觉为**基础骨架**（结构正确、响应式、中性配色）。后续整体视觉优化主要调整 `assets/css/site.css` 的设计变量与组件样式，无需改动内容与结构。
