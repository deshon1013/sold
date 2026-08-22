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

**Production tracks a dedicated `release` branch, not `main`** — this is what
keeps Production from redeploying on every ordinary merge to `main` (Preview
still redeploys on every branch/PR push, that part needs no changes). Set
this up once:

- Settings -> Environments -> **Production** -> Branch Tracking -> change
  from `main` to `release` (the branch doesn't need to exist yet -- Vercel
  will just have no deployments there until something pushes to it)
- Settings -> Build and Deployment -> Ignored Build Step -> leave as
  **Automatic** (don't use "Only build preview" here -- it also blocks
  deployments triggered by pushing to `release`, not just ones from `main`)

Promoting to prod (see `deploy-backend.yml`) fast-forwards `release` to
whatever's currently on `main` as its last step, which is what actually
triggers the Vercel Production build -- Vercel deploys on that push exactly
the way it always deploys on a push to its tracked branch, no webhook or
custom script involved.

### 7. Loop back — tighten CORS

Once you have real Vercel URLs, go back and:

- Add them to each R2 bucket's CORS `AllowedOrigins` (step 2)
- Update `AllowOrigins` in `apps/backend/template.yaml`'s `FunctionUrlConfig`
  (currently `*`) to the real frontend origin(s), then redeploy

## Day to day

- Open a PR -> `ci.yml` runs lint + build on both workspaces; Vercel also
  builds a Preview deployment for the branch
- Merge to `main` -> backend redeploys to dev automatically; Vercel Preview
  redeploys too, but **Production doesn't move** (it tracks `release`, not
  `main`)
- Promote to prod -> Actions tab -> "Deploy Backend" -> Run workflow ->
  deploys the backend to prod, then fast-forwards `release` to `main`,
  which triggers Vercel's Production deploy
