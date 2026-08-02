# Recruitment Tables Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add separate PhD and master's recruitment sections to the current remote website without importing the unrelated local repository history.

**Architecture:** Keep `origin/master` as the sole history baseline. Apply a small semantic HTML change to the existing homepage recruitment component and add only the CSS selectors needed for its two subsection headings.

**Tech Stack:** Jekyll, Liquid templates, HTML, CSS, GitHub Pages

## Global Constraints

- Preserve every existing remote commit and current remote visual redesign.
- Modify only `pages/home.html` and `assets/css/site.css` for the feature.
- Do not merge unrelated histories and do not force-push.
- Retain all existing PhD requirements verbatim and add the five approved master's requirements verbatim.

---

### Task 1: Migrate the recruitment tables

**Files:**
- Modify: `pages/home.html` (the `<section id="join">` block)
- Modify: `assets/css/site.css` (the recruitment component rules)

**Interfaces:**
- Consumes: existing `.recruit`, `.recruit__badge`, `.bullet-list`, `.recruit__lead`, and `.recruit__actions` styles
- Produces: two `.recruit__table` containers with `.recruit__table-title` headings

- [ ] **Step 1: Run content assertions and verify they fail on the remote baseline**

```powershell
$home = Get-Content -Raw -Encoding UTF8 pages/home.html
if ($home -notmatch '博士招生 &middot; PhD') { throw 'missing PhD heading' }
if ($home -notmatch '硕士招生 &middot; Master') { throw 'missing master heading' }
if ($home -notmatch '目前 2026 级还有名额') { throw 'missing master recruitment copy' }
```

Expected: FAIL with `missing PhD heading`.

- [ ] **Step 2: Replace the single recruitment paragraph/list with two scoped tables**

In `pages/home.html`, keep the badge, email action, and existing PhD list. Wrap the PhD list in:

```html
<div class="recruit__table">
  <h3 class="recruit__table-title">博士招生 &middot; PhD</h3>
  <ul class="bullet-list">...</ul>
</div>
```

Add the approved master's table immediately afterward:

```html
<div class="recruit__table">
  <h3 class="recruit__table-title">硕士招生 &middot; Master</h3>
  <ul class="bullet-list">
    <li>招收 2026、2027、2028 级学术与工程硕士，目前 2026 级还有名额，欢迎联系。</li>
    <li>985 和西电具有推免资格的生源可以直接进入本人导师团，由导师团面试录取。</li>
    <li>其他学校生源需要经过学院组织的推免考核，包括简历筛选、笔试上机、面试环节。</li>
    <li>实验室为硕士生提供工位、电脑、算力支撑、实验室补助、达标实习、工作推荐的福利。</li>
    <li>意向读博的硕士生可以在研二阶段提出读博申请，硕士提前毕业并攻读博士。</li>
  </ul>
</div>
```

Move the general postdoctoral/research-assistant copy below both tables and retain the existing email action.

- [ ] **Step 3: Add the table title styles**

In `assets/css/site.css`, after the existing recruitment action rules, add:

```css
.recruit__table{position:relative;z-index:1;margin-bottom:1.6rem}
.recruit__table-title{font-family:var(--mono);font-size:.78rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold-2);margin:0 0 .8rem;padding-bottom:.5rem;border-bottom:1px solid var(--line)}
.recruit__table .bullet-list{margin:0;max-width:54rem}
```

- [ ] **Step 4: Re-run the content assertions**

```powershell
$home = Get-Content -Raw -Encoding UTF8 pages/home.html
if ($home -notmatch '博士招生 &middot; PhD') { throw 'missing PhD heading' }
if ($home -notmatch '硕士招生 &middot; Master') { throw 'missing master heading' }
if ($home -notmatch '目前 2026 级还有名额') { throw 'missing master recruitment copy' }
$css = Get-Content -Raw -Encoding UTF8 assets/css/site.css
if ($css -notmatch '\.recruit__table-title') { throw 'missing table title style' }
```

Expected: exit code 0 with no output.

- [ ] **Step 5: Build the Jekyll site**

```powershell
jekyll build
```

Expected: exit code 0 and generated `_site/index.html`.

- [ ] **Step 6: Verify the generated homepage and diff scope**

```powershell
$built = Get-Content -Raw -Encoding UTF8 _site/index.html
if ($built -notmatch '博士招生') { throw 'built page missing PhD heading' }
if ($built -notmatch '硕士招生') { throw 'built page missing master heading' }
git diff --check
git status --short
```

Expected: generated page contains both headings; feature diff is limited to `pages/home.html` and `assets/css/site.css`.

- [ ] **Step 7: Commit the feature**

```powershell
git add -- pages/home.html assets/css/site.css
git commit -m "feat: split PhD and master recruitment details"
```

- [ ] **Step 8: Push and open a draft PR**

```powershell
git push -u origin codex/migrate-recruitment-tables
gh pr create --draft --base master --head codex/migrate-recruitment-tables --title "[codex] migrate recruitment tables" --fill
```

Expected: branch is available on GitHub and a draft PR targets `master`.
