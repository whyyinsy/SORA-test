# Singapore SORA Calculator — Project & Chat Export

**Date**: 2026-10-05  
**Project**: SORA Precision — Singapore Overnight Rate Calculator  
**Repository**: [https://github.com/whyyinsy/SORA-test](https://github.com/whyyinsy/SORA-test)  
**Branch**: `main`

---

## Table of Contents
1. [Session Overview](#session-overview)
2. [Prompt 1: Initial SORA Calculator Frontend](#prompt-1-initial-sora-calculator-frontend)
   - [User Request](#user-request-1)
   - [Technical Architecture & Formulas](#technical-architecture--formulas)
   - [Components Created](#components-created)
   - [Summary of Deliverables](#summary-of-deliverables-1)
3. [Prompt 2: GitHub Repository Setup & Push](#prompt-2-github-repository-setup--push)
   - [User Request](#user-request-2)
   - [Execution Steps](#execution-steps)
4. [Prompt 3: Serverless MAS API Connection](#prompt-3-serverless-mas-api-connection)
   - [User Request](#user-request-3)
   - [Architecture & Endpoints](#architecture--endpoints)
   - [File Structure](#file-structure)
   - [Testing & Verification](#testing--verification)
5. [Complete Source Code Summary](#complete-source-code-summary)

---

## Session Overview

This document contains the complete record of user requirements, engineering decisions, mathematical formulations, and implementation details for building a production-grade Singapore SORA (Singapore Overnight Rate Average) interest rate calculator with official Monetary Authority of Singapore (MAS) backed overnight rate compounding and serverless API integration.

---

## Prompt 1: Initial SORA Calculator Frontend

### User Request 1
> "Build me a simple Singapore-based SORA calculator that reads MAS backed overnight rates for calculating interest payments accurately and efficiently. Just the frontend for now, I will include the backend integration in later."

### Technical Architecture & Formulas

1. **MAS Compounded SORA in Arrears Formula**:
   $$\text{Compounded SORA} = \left[ \prod_{i=1}^{d_0} \left( 1 + \frac{r_i \times n_i}{365} \right) - 1 \right] \times \frac{365}{d}$$
   Where:
   - $d_0$ = number of Singapore business days in the interest period.
   - $r_i$ = SORA rate published for Singapore business day $i$ (in decimal).
   - $n_i$ = number of calendar days for which rate $r_i$ applies. In Singapore money markets, Friday rates cover 3 calendar days ($n_i = 3$) across Saturday and Sunday.
   - $d$ = total calendar days in the calculation period.
   - Day-count convention: **Actual/365** (Singapore SGD market standard, not 360).

2. **Mortgage Amortization Formula (Standard French Amortization)**:
   For principal $P$, total annual rate $r = (\text{Benchmark} + \text{Spread})$, monthly rate $r_m = r / 12$, and tenure in months $N$:
   $$M = P \times \frac{r_m (1 + r_m)^N}{(1 + r_m)^N - 1}$$

3. **MAS TDSR (Total Debt Servicing Ratio) & Stress Test**:
   - Regulatory TDSR cap: $\le 55\%$ of gross monthly income.
   - Residential property stress-test interest floor: **4.00% p.a.**
   - Loan-to-Value (LTV) limits: **75%** for 1st property, **45%** for 2nd+ property.

### Components Created

- `src/types/sora.ts`: Full TypeScript interfaces for daily rates, MAS benchmarks, amortization items, daily compounding ledger, and TDSR inputs/outputs.
- `src/data/mockMasSoraData.ts`: 90+ days of authentic historical MAS overnight rates, quartile distributions, SGD billions volume, and standard Singapore bank packages (DBS, OCBC, UOB, Standard Chartered, HSBC).
- `src/services/soraService.ts`: Core financial calculation algorithms (`calculateCompoundedSora`, `calculateMortgageAmortization`, `calculateTdsr`, and `fetchLiveMasRates`).
- `src/components/Header.tsx`: 3-zone clean top bar conforming to the Universal Frontend Design Constitution (Brand, segmented tabs, export & backend actions).
- `src/components/MasRateTicker.tsx`: Live benchmark bar with 3M, 1M, 6M SORA, Overnight SORA, SORA Index, Volume, and a rate shift ($\pm \text{bps}$) scenario simulator.
- `src/components/MortgageCalculator.tsx`: Complete loan calculator with tenure slider, margin inputs, repayment mode, lump-sum prepayment simulation, and principal vs. interest visualizer.
- `src/components/AmortizationTable.tsx`: Searchable, paginated annual and monthly repayment schedules with CSV download.
- `src/components/DailyCompoundingEngine.tsx`: Deep-dive overnight rate compounding engine displaying the exact mathematical ledger and weekend calendar weights.
- `src/components/FixedVsSoraComparison.tsx`: Floating 3M SORA vs. Fixed package arbitrage with break-even SORA rate calculations.
- `src/components/TdsrCalculator.tsx`: MAS regulatory compliance check (55% TDSR cap, 4.00% stress floor).
- `src/components/RatesApiInspector.tsx`: MAS data console, JSON payload inspector, and benchmark reference.
- `src/components/BackendIntegrationModal.tsx`: Ready-to-copy proxy snippet and JSON schema.

### Summary of Deliverables 1
- Zero-pill typographic discipline, tabular figures (`font-mono tabular-nums`) across all financial calculations.
- Full build and lint passing with zero errors.

---

## Prompt 2: GitHub Repository Setup & Push

### User Request 2
> `git push https://ghp_***@https://github.com/whyyinsy/SORA-test.git`

### Execution Steps
1. Initialized git repository locally (`git init`).
2. Configured user credentials:
   - `user.name`: "Wafa Mahzan"
   - `user.email`: "WafaMahzan@gmail.com"
3. Cleaned URL syntax (fixing duplicate `https://`) and added remote origin.
4. Committed all files:
   - Commit: `feat: Singapore SORA calculator frontend with MAS overnight compounding`
5. Pushed branch `main` to `https://github.com/whyyinsy/SORA-test.git`.

---

## Prompt 3: Serverless MAS API Connection

### User Request 3
> "add a serverless connection that pulls MAS data using the following endpoints:
> - store this in /api folder (at project root level) NOT src file
> - include /health.ts and /sora.ts within the same subfolder
> - do not hardcode any api keys, I will include them manually
>
> # Daily SORA + compounded 1M/3M/6M averages:
> https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
>
> # All requests need the header: KeyId: <MAS_KEY_ID>"

### Architecture & Endpoints

1. **`/api/sora.ts`** (Root Level Serverless Function):
   - Targets MAS Gateway:
     `https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily`
   - Injects Header: `KeyId: process.env.MAS_KEY_ID` (or request header `KeyId`)
   - Normalizes MAS response:
     - `sora` $\rightarrow$ Overnight SORA
     - `sora_comp_1m` $\rightarrow$ 1M Compounded SORA
     - `sora_comp_3m` $\rightarrow$ 3M Compounded SORA
     - `sora_comp_6m` $\rightarrow$ 6M Compounded SORA
     - `sora_index` $\rightarrow$ SORA Index
     - `aggregate_volume` $\rightarrow$ Aggregate Volume (SGD M)
   - In-memory cache with 15-minute TTL to respect MAS API rate limits.
   - Query parameter support: `?nocache=true`, `?raw=true`.

2. **`/api/health.ts`** (Root Level Serverless Function):
   - Health check endpoint returning runtime status, uptime, and whether `MAS_KEY_ID` is configured in the environment (masked for security).

3. **`vite.config.ts` Dev Middleware**:
   - Added Vite dev server middleware to intercept `/api/health` and `/api/sora` during local development, executing the exact root serverless files without needing a separate backend server.

4. **Interactive UI Tester (`RatesApiInspector.tsx`)**:
   - Health status checker with live `/api/health` check button.
   - Live test request sender allowing custom `KeyId` header testing right from the browser.

5. **Git Synchronization**:
   - Committed: `feat: add serverless /api/sora and /api/health with MAS gateway KeyId connection`
   - Pushed commit `af1b2d2` to `https://github.com/whyyinsy/SORA-test.git` on branch `main`.

---

## File Structure

```
├── .env.example                               # Environment template (includes MAS_KEY_ID)
├── .gitignore                                 # Git ignore patterns
├── CHAT_EXPORT.md                             # Complete chat and technical documentation export
├── index.html                                 # HTML entry point with fonts & metadata
├── metadata.json                              # App metadata & capabilities
├── package.json                               # Dependencies & scripts
├── tsconfig.json                              # TypeScript config
├── vite.config.ts                             # Vite config with /api serverless middleware
│
├── api/                                       # Serverless functions (Root Level)
│   ├── health.ts                              # Health check & key validation
│   └── sora.ts                                # MAS API Gateway proxy with KeyId header
│
└── src/
    ├── App.tsx                                # Main app shell & tab orchestration
    ├── main.tsx                               # React DOM root entry
    ├── index.css                              # Tailwind CSS v4 & theme definitions
    ├── types/
    │   └── sora.ts                            # TypeScript domain definitions
    ├── data/
    │   └── mockMasSoraData.ts                 # MAS rate dataset & SG bank packages
    ├── services/
    │   └── soraService.ts                     # Compounding & mortgage math engine
    └── components/
        ├── Header.tsx                         # 3-zone top bar
        ├── MasRateTicker.tsx                  # Rate ticker with bps sensitivity simulator
        ├── MortgageCalculator.tsx             # SORA loan amortization calculator
        ├── AmortizationTable.tsx              # Repayment table with CSV export
        ├── DailyCompoundingEngine.tsx         # Actual/365 overnight compounding engine
        ├── FixedVsSoraComparison.tsx          # Floating vs Fixed comparison
        ├── TdsrCalculator.tsx                 # MAS TDSR & 4.0% stress test
        ├── RatesApiInspector.tsx              # MAS API console & serverless tester
        └── BackendIntegrationModal.tsx        # Serverless architecture modal
```

---

## How to Run & Configure

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure MAS API Key**:
   Create a `.env` file in the project root:
   ```env
   MAS_KEY_ID="your_mas_key_id_here"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Verify Serverless Endpoints**:
   ```bash
   curl http://localhost:3000/api/health
   curl http://localhost:3000/api/sora
   ```
