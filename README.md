# 📦 Backend - sharedWalletApp

本ディレクトリは、**Supabase + Hono（Deno）ベースのバックエンド構成**を管理します。API実装、Supabase Functions、DB操作、Authなどの主要バックエンドロジックを含みます。

---

## 📐 使用技術・構成方針

| 項目          | 内容                                                                 |
|---------------|----------------------------------------------------------------------|
| 実行環境      | Supabase Edge Functions（Denoベース）                                |
| 言語          | TypeScript（Deno互換）                                               |
| フレームワーク | [Hono](https://hono.dev/)（軽量TS向け・Supabase公式でも推奨）        |
| BaaS          | Supabase（Auth / DB / Edge Functions を統合）                       |
| 認証          | Supabase Auth（JWTトークン + RLSでユーザーデータを保護）              |
| DB            | PostgreSQL（Supabase内蔵）                                            |
| 型安全        | OpenAPI（自動生成）＋ pgtyped or Zod で担保                          |

---

## 🗂 ディレクトリ構成（Supabase準拠）

```
backend/
├── README.md
├── supabase/                  # Supabaseプロジェクト関連
│   ├── config.toml            # Supabase CLI設定
│   └── functions/             # Edge Function群（Deno + Hono）
│       ├── expenses-add/
│       │   └── index.ts
│       ├── expenses-edit/
│       │   └── index.ts
│       ├── expenses-delete/
│       │   └── index.ts
│       ├── expenses-list/
│       │   └── index.ts
│       ├── categories-add/
│       │   └── index.ts
│       ├── categories-edit/
│       │   └── index.ts
│       ├── categories-delete/
│       │   └── index.ts
│       ├── categories-list/
│       │   └── index.ts
│       ├── auth-signup/
│       │   └── index.ts
│       ├── auth-login/
│       │   └── index.ts
│       ├── auth-logout/
│       │   └── index.ts
│       ├── auth-reset-password/
│       │   └── index.ts
│       ├── pairs-create/
│       │   └── index.ts
│       ├── pairs-join/
│       │   └── index.ts
│       └── pairs-leave/
│           └── index.ts
├── scripts/                   # 自動化・デプロイスクリプト
└── tests/                     # 関数単位のテストコード
```

> 🔍 補足：CLI構成の制約上、**APIごとの分類はディレクトリ名で表現**し、`README`で対応関係を明示します。

---

## 🚀 開発・デプロイフロー

### 🔧 ローカル開発（Supabase CLI）

```bash
# 関数を新規作成
supabase functions new expenses

# ローカル実行・デバッグ（JWT含む場合 --env-file 推奨）
supabase functions serve expenses
```

### 📤 本番デプロイ

```bash
supabase functions deploy expenses
```

---

## 🔄 CI/CD・運用フロー（GitHub Actions + Supabase CLI + Vercel）

### 📚 ブランチ戦略

| ブランチ       | 用途                     |
|----------------|--------------------------|
| `main`         | 本番環境用。マージで本番に反映 |
| `dev`          | 開発環境用。PRのマージでPreview環境へ自動反映 |
| `feature/*`    | 機能開発単位で作成するブランチ |
| `fix/*`        | バグ修正用の個別ブランチ |

---

### ⚙️ 各種自動化と開発フロー

#### 📌 1. API・DB設計の変更フロー

| ステップ | 説明 |
|---------|------|
| 1 | OpenAPI定義（YAML）を更新（`api/openapi/`） |
| 2 | `npm run api:build` で lint / 型生成 / ドキュメントを更新 |
| 3 | Supabase Function 側で該当 API 実装（`backend/supabase/functions/`） |
| 4 | 必要に応じて DB schema（`db/schema/`）や RLSも更新 |
| 5 | Supabase CLI を用いてローカルで検証 (`supabase start`, `supabase db push`) |
| 6 | PRを作成し、GitHub Actions で自動Lint & Test |

---

#### ⚙️ 2. Supabase CLIでの操作例（ローカル）

```bash
# DBスキーマ更新をローカル適用
supabase db push

# 関数の新規作成（Deno + Hono）
supabase functions new expenses

# 関数のローカル実行
supabase functions serve expenses
```

---

### 🚀 開発 → 本番への反映フロー

#### ✅ PR作成〜本番反映までの全体像

```mermaid
graph TD
  Dev[開発者] --> PR[Pull Request作成 (devブランチへ)]
  PR -->|Lint/Test/Build| GitHubActions[GitHub Actions]
  GitHubActions --> DevPreview[Vercel/Supabase Preview]
  DevPreview --> QA[動作確認（Preview環境）]
  QA --> Merge[mainへマージ]

  Merge --> SupaDeploy[Supabase 本番 Functions デプロイ]
  Merge --> VercelDeploy[Vercel 本番デプロイ]
```

#### 🚧 自動化される処理（GitHub Actions）

| 対象ブランチ | 自動化内容 |
|--------------|------------|
| `dev`        | Lint + TypeCheck + Test + Previewデプロイ（Vercel/Supabase） |
| `main`       | Supabase関数本番デプロイ + Vercel本番リリース |

---

### 🔒 認証・セキュリティ運用補足

- 各Edge Functionでは `@hono/jwt` によりJWT検証
- Supabase側DBにはRow-Level Security (RLS) を設定
- 本番・開発で `config.toml` の SupabaseプロジェクトIDを切り替え管理

---

### 🧪 テスト運用方針（予定）

- 単体テストは `tests/` 配下に関数単位で配置
- テストランナーは Deno 標準テスト or Vitest を想定
- CI上で `deno test` を自動実行し、失敗時はPRブロック

---

### 📄 関連ドキュメント

- [OpenAPI仕様](../../api/openapi/)
- [DBスキーマ定義](../../db/schema/)
- [CI/CD構成](../../arch-docs/ci-cd.md)
- [アーキテクチャ設計](../../arch-docs/architecture.md)

---