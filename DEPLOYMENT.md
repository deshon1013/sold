# Deploying Sold

Two environments: **dev** (auto-deploys on every push to `main`) and
**prod** (manually triggered, gated behind a required reviewer).
Frontend lives on Vercel; backend is Express on AWS Lambda behind a Function
URL; each environment gets its own Supabase project and R2 bucket.

## One-time setup checklist

### 1. Supabase — 1 more project

You already have one project wired up locally (that one becomes **dev**).
Create one more, named e.g. `sold-production`:

- Same steps as your first project (see the build plan artifact for context)
- Run `supabase/migrations/0001_videos.sql` in the new project's SQL Editor
- Note the project's **Project URL**, **anon key**, and **service_role key**
  (Project Settings -> Data API / API Keys)

### 2. Cloudflare R2 — 1 more bucket

Same deal — create a `sold-production` bucket:

- Enable the R2.dev public URL (Settings -> Public access)
- **Add a CORS policy to both buckets** (including your existing dev one, if
  you haven't already) — see the CORS JSON from earlier in this project's
  history. Update `AllowedOrigins` to include each environment's real Vercel
  URL once you have it (step 5).
- You can reuse your existing Account API token (scope it to both buckets) or
  create a second one — either works, one token is simpler.

### 3. AWS — one-time OIDC bootstrap

This lets GitHub Actions deploy without storing AWS access keys as secrets.
Deploy `infra/github-oidc.yaml` **once**, manually, from your own machine
(needs the AWS CLI configured with an account that can create IAM resources):

```sh
aws cloudformation deploy \
  --template-file infra/github-oidc.yaml \
  --stack-name sold-github-oidc \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides GitHubOrg=deshon1013 GitHubRepo=sold
```

Then grab the role ARN it created:

```sh
aws cloudformation describe-stacks \
  --stack-name sold-github-oidc \
  --query "Stacks[0].Outputs[?OutputKey=='DeployRoleArn'].OutputValue" \
  --output text
```

### 4. GitHub — Environments + secrets

Repo Settings -> Environments. Create two, named exactly `dev` and `prod`
(these names must match `.github/workflows/deploy-backend.yml` exactly). On
**prod**, add yourself as a required reviewer (Environment protection
rules) — this is what gates prod deploys behind manual approval.

In **each** environment, add these secrets (using that environment's own
Supabase project + R2 bucket values from steps 1-2):

```
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
R2_ACCOUNT_ID
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
```

Then add one **repository-level** secret (shared across both environments,
since it's the same AWS role regardless of which one is deploying):

```
AWS_DEPLOY_ROLE_ARN   <- the ARN from step 3
```

### 5. Deploy the backend, get its URL

- Push to `main` -> deploys **dev** automatically (see
  `.github/workflows/deploy-backend.yml`)
- For prod: Actions tab -> "Deploy Backend" -> Run workflow

Each deploy prints a `FunctionUrl` output (also visible in the CloudFormation
stack outputs, or the Lambda console) — that's your `VITE_API_URL` for that
environment.

### 6. Vercel — connect the frontend

- Import the GitHub repo into Vercel
- **Root Directory**: `apps/frontend`
- Set environment variables per Vercel environment (Production -> your
  production values; Preview + Development -> your dev values):

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_API_URL     <- the Lambda Function URL from step 5
```

Vercel deploys automatically on push once connected — no custom GitHub Action
needed for the frontend.

### 7. Loop back — tighten CORS

Once you have real Vercel URLs, go back and:

- Add them to each R2 bucket's CORS `AllowedOrigins` (step 2)
- Update `AllowOrigins` in `apps/backend/template.yaml`'s `FunctionUrlConfig`
  (currently `*`) to the real frontend origin(s), then redeploy

## Day to day

- Open a PR -> `ci.yml` runs lint + build on both workspaces
- Merge to `main` -> backend redeploys to dev automatically, Vercel redeploys
  its Production/Preview targets per its own branch config
- Promote to prod -> Actions tab -> "Deploy Backend" -> Run workflow
