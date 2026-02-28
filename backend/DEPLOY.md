# CodeRescue AI — AWS Backend Deployment Guide

## Quick Setup (5 minutes)

### Step 1: Install Prerequisites
```bash
# Install AWS CLI
# Windows: Download from https://awscli.amazonaws.com/AWSCLIV2.msi
# Mac: brew install awscli

# Install SAM CLI
# Windows: Download from https://github.com/aws/aws-serverless-application-model/releases
# Mac: brew install aws-sam-cli

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
```

### Step 2: Enable Bedrock Model Access
1. Open AWS Console → **Amazon Bedrock**
2. Click **Model access** in left sidebar
3. Click **Manage model access**
4. Check **Anthropic → Claude 3 Haiku**
5. Click **Save changes**
6. Wait for status to show "Access granted" (usually instant)

### Step 3: Deploy Backend
```bash
cd backend

# Build the Lambda function
sam build

# Deploy with guided prompts (first time only)
sam deploy --guided
# When prompted:
#   Stack Name: coderescue-ai
#   AWS Region: us-east-1
#   Confirm changes: Y
#   Allow SAM CLI IAM role creation: Y
#   Save arguments to samconfig.toml: Y
```

### Step 4: Connect Frontend
After deployment, SAM outputs the API endpoint URL. Copy it.

Open `js/api.js` and update:
```javascript
const API_CONFIG = {
    endpoint: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/api/rescue',
    timeout: 15000,
    enabled: true,  // ← Change from false to true
};
```

### Step 5: Test
```bash
# Test the API directly
curl -X POST https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/api/rescue \
  -H "Content-Type: application/json" \
  -d '{"feature": "chat", "input": "I have a TypeError in my React component"}'
```

---

## Architecture Diagram (for PPT)

```
User (Browser)
    │
    ▼
GitHub Pages / S3 + CloudFront (Static Frontend)
    │
    │ HTTPS POST /api/rescue
    ▼
Amazon API Gateway (REST API + CORS)
    │
    ▼
AWS Lambda (Python 3.12)
    ├── Feature Router
    ├── System Prompt Selector (8 prompts)
    ├── Response Parser (JSON/Markdown)
    │
    ├──► Amazon Bedrock (Claude 3 Haiku)
    │    └── Foundation Model Inference
    │
    └──► Amazon DynamoDB
         └── Incident Storage (TTL: 30 days)
```

## Cost Estimate (hackathon usage)
- **Lambda:** Free tier (1M requests/month free)
- **API Gateway:** Free tier (1M calls/month free)
- **DynamoDB:** Free tier (25GB storage, 25 WCU/RCU free)
- **Bedrock (Claude 3 Haiku):** ~$0.00025/1K input tokens, ~$0.00125/1K output tokens
  - Estimated hackathon demo: < $5 total

## Troubleshooting
- **403 from Bedrock:** Model access not enabled → check Step 2
- **CORS errors:** API Gateway CORS not configured → redeploy with SAM
- **Timeout:** Increase Lambda timeout in template.yaml (default: 30s)
- **Region mismatch:** Bedrock + Lambda must be in same region
