---
name: playwright-github-actions-ci-cd
description: "Use when setting up GitHub Actions workflows for Playwright test automation. Covers matrix strategies, caching, artifact uploads, parallel sharding, environment secrets, and reusable workflow templates."
---

# Playwright GitHub Actions CI/CD Master

This skill guides you through building production-grade GitHub Actions workflows for Playwright test execution, artifact management, and cross-browser parallelism.

## When to Use This Skill

- Setting up CI/CD pipelines for Playwright runs on PR, push, schedule
- Configuring matrix strategies for cross-browser testing (Chrome, Firefox, WebKit, Chromium)
- Implementing test sharding across multiple runners for parallelism
- Caching node_modules, pip dependencies, Playwright browser binaries
- Uploading test artifacts: HTML reports, traces, screenshots, videos
- Environment-specific configurations (staging vs production)
- Managing secrets and OIDC authentication for cloud deployments
- Creating reusable workflow templates for team standardization

## Key Principles

1. **Always cache** — node_modules, pip packages, Playwright browsers (save 5+ min per run)
2. **Matrix is your friend** — parallelize by browser, OS, or test suite
3. **Artifact transparency** — upload reports, traces, screenshots on failure
4. **Fail-fast: false** — let all matrix jobs run even if one fails (see results across browsers)
5. **Secrets securely** — never hardcode; use GitHub Secrets or OIDC
6. **Trigger variety** — support PR, push, nightly schedule, manual `workflow_dispatch`

## Workflow Steps

### 1. Choose Your Runner & Matrix
```yaml
jobs:
  test:
    runs-on: ubuntu-latest  # or windows-latest, macos-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        node-version: [18, 20]
```

### 2. Cache Dependencies (Critical)
```yaml
- name: Cache npm dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-

- name: Cache Playwright browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-playwright-
```

### 3. Install & Run Tests
```yaml
- name: Install dependencies
  run: npm ci

- name: Install Playwright browsers
  run: npx playwright install --with-deps ${{ matrix.browser }}

- name: Run tests
  run: npx playwright test --project=${{ matrix.browser }}
```

### 4. Upload Artifacts on Failure
```yaml
- name: Upload Playwright report
  uses: actions/upload-artifact@v4
  if: always()
  with:
    name: playwright-report-${{ matrix.browser }}-${{ matrix.node-version }}
    path: playwright-report/
    retention-days: 30

- name: Upload test traces
  uses: actions/upload-artifact@v4
  if: failure()
  with:
    name: traces-${{ matrix.browser }}
    path: test-results/
    retention-days: 7
```

## Complete Example: Multi-Browser CI/CD Workflow

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday at 2 AM UTC
  workflow_dispatch:

jobs:
  test:
    name: Test on ${{ matrix.browser }} - Node ${{ matrix.node-version }}
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
        node-version: [18, 20]
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Cache npm dependencies
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-npm-
      
      - name: Cache Playwright browsers
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: ${{ runner.os }}-playwright-${{ hashFiles('**/package-lock.json') }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      
      - name: Run tests
        run: npx playwright test --project=${{ matrix.browser }}
      
      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}-node${{ matrix.node-version }}
          path: playwright-report/
          retention-days: 30
      
      - name: Upload test results on failure
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: test-results-${{ matrix.browser }}-node${{ matrix.node-version }}
          path: test-results/
          retention-days: 7

  report:
    name: Publish Report
    runs-on: ubuntu-latest
    if: always()
    needs: test
    
    steps:
      - uses: actions/download-artifact@v4
        with:
          path: all-reports
      
      - name: Merge Playwright reports
        run: |
          npx playwright show-report all-reports
```

## Environment Secrets Pattern

For staging vs production tests:
```yaml
env:
  NODE_ENV: ${{ secrets.ENVIRONMENT }}  # Set in GitHub Secrets
  TEST_BASE_URL: ${{ secrets.TEST_BASE_URL }}
  API_TOKEN: ${{ secrets.API_TOKEN }}

jobs:
  test-staging:
    if: github.ref == 'refs/heads/develop'
    env:
      BASE_URL: ${{ secrets.STAGING_URL }}
  
  test-prod:
    if: github.ref == 'refs/heads/main'
    env:
      BASE_URL: ${{ secrets.PROD_URL }}
```

## Python + pytest + Playwright Example

```yaml
- name: Set up Python
  uses: actions/setup-python@v4
  with:
    python-version: '3.11'
    cache: 'pip'

- name: Install dependencies
  run: |
    pip install -r requirements.txt
    playwright install --with-deps

- name: Run pytest with Playwright
  run: pytest tests/ -v --tb=short --html=report.html
```

## Reusable Workflow (for team standardization)

`.github/workflows/playwright-reusable.yml`:
```yaml
name: Reusable Playwright Test Workflow

on:
  workflow_call:
    inputs:
      browsers:
        required: false
        type: string
        default: '[chromium, firefox, webkit]'
      test-path:
        required: false
        type: string
        default: 'tests/'

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: ${{ fromJson(inputs.browsers) }}
    
    steps:
      # ... standard steps ...
```

Call it from another workflow:
```yaml
jobs:
  call-playwright-tests:
    uses: ./.github/workflows/playwright-reusable.yml
    with:
      browsers: '["chromium", "firefox"]'
      test-path: 'tests/e2e/'
```

## Best Practices Checklist

- ✓ Cache node_modules and .cache/ms-playwright
- ✓ Use fail-fast: false to see all browser results
- ✓ Upload reports and traces as artifacts
- ✓ Set meaningful retention-days (30 for reports, 7 for traces)
- ✓ Use matrix for parallelism (browsers, Node versions, OS)
- ✓ Trigger on PR, push, schedule, workflow_dispatch
- ✓ Manage secrets in GitHub Secrets, never hardcode
- ✓ Use `npm ci` (not npm install) for reproducible builds
- ✓ Include timeout-minutes to catch hung tests
- ✓ Test on multiple Node versions if library publishes types

---

**Next Steps**: After setting up CI/CD, consider integrating Allure reports, visual regression testing, or performance budgets.
