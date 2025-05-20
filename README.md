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

## 🗂 ディレクトリ構成（予定）

```
backend/
├── README.md
├── supabase/                  # Supabaseプロジェクト関連
│   ├── config.toml           # Supabase CLI設定
│   └── functions/            # Edge Function群（Deno + Hono）
│       ├── expenses/
│       │   └── index.ts
│       ├── auth/
│       │   └── signup.ts
│       └── ...
├── scripts/                   # 自動化・デプロイスクリプト
└── tests/                     # 関数単位のテストコード
```

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

## 🔄 CI/CDフロー（GitHub Actions）

```mermaid
graph TD
  Dev[開発者] --> PR[Pull Request 作成]
  PR -->|Lint/Test| GitHubActions[GitHub Actions]
  GitHubActions -->|OK| Merge[main ブランチへマージ]
  Merge --> SupaDeploy[Supabase Edge Functionデプロイ]
  Merge --> VercelDeploy[Vercelデプロイ（フロント）]

  PR --> DevPreview[開発環境へPreviewデプロイ]
  DevPreview --> "Supabase Dev Project"
  DevPreview --> "Vercel Preview"
```

### GitHub Actionsで自動化される処理

- `dev` ブランチ：
  - Lint / Test / TypeCheck 実行
  - Vercel Preview環境に自動デプロイ
- `main` ブランチ：
  - Supabase Edge Functions本番デプロイ
  - Vercel本番環境デプロイ

---

## 🔐 認証・セキュリティ

- Supabase Auth により JWT を発行
- 各関数では JWT を Hono Middleware で検証
- DB へのアクセスは RLS（Row-Level Security）で制御

---

## 📄 関連ドキュメント

- [アーキテクチャ設計](../arch-docs/architecture.md)
- [API仕様・OpenAPI](../api/openapi/)
- [DBスキーマ定義](../db/schema/)
- [CI/CD構成](../arch-docs/ci-cd.md)

---