"""
CodeRescue AI — AWS Lambda Backend
Connects all 8 features to Amazon Bedrock (Nova Micro) for real AI responses.
Uses DynamoDB for incident tracking and session persistence.
"""

import json
import os
import uuid
import time
import boto3
from datetime import datetime

# ── AWS Clients ──
bedrock = boto3.client("bedrock-runtime", region_name=os.environ.get("AWS_REGION", "us-east-1"))
dynamodb = boto3.resource("dynamodb", region_name=os.environ.get("AWS_REGION", "us-east-1"))

TABLE_NAME = os.environ.get("TABLE_NAME", "CodeRescueIncidents")
MODEL_ID = os.environ.get("MODEL_ID", "apac.amazon.nova-micro-v1:0")


# ── System Prompts per Feature ──
SYSTEM_PROMPTS = {
    "chat": """You are CodeRescue AI, a 911-style emergency assistant for developers. You help debug code, explain errors, and provide solutions.

Rules:
- Respond in markdown format using **bold**, `code`, and ```code blocks```
- Start with a severity assessment (P0-P4)
- Provide actionable code fixes
- Be concise but thorough
- If the user mentions a specific language, respond with code in that language
- End with a follow-up question or next step suggestion""",

    "dependency": """You are a dependency security analyzer. Given a package name, analyze its risk.

Return a JSON object (and nothing else) with this exact structure:
{
    "score": <number 0-100, higher = more dangerous>,
    "lastCommit": "<time ago string>",
    "cves": <number of known CVEs>,
    "busFactor": <number of active maintainers>,
    "weeklyDownloads": "<formatted string like 12M>",
    "abandoned": <boolean>,
    "modern": "<alternative package name or null>",
    "reason": "<1-2 sentence explanation of the risk assessment>"
}

Be accurate for well-known packages. For unknown ones, provide reasonable estimates.""",

    "ancestry": """You are an error ancestry analyzer. Given a stack trace or error message, trace it back through 4 layers.

Return a JSON array (and nothing else) with exactly 4 objects:
[
    {"type": "root", "label": "<surface error name>", "desc": "<what the visible error is>", "file": "<relevant file/line or null>"},
    {"type": "cause", "label": "<immediate cause>", "desc": "<why this specific failure happened>", "file": "<where to look or null>"},
    {"type": "origin", "label": "<upstream origin>", "desc": "<the assumption or gap that allowed this>", "file": null},
    {"type": "decision", "label": "Root Decision", "desc": "<the original design decision that made this inevitable>", "file": null}
]

Be specific to the actual error provided, not generic.""",

    "capsule": """You are a context capsule generator. Given information about a feature session (what was built, what failed, what the next dev should know), generate a structured handoff document.

Format your response as markdown with these sections:
## 🧬 CONTEXT CAPSULE
### 📦 What Was Built
### ❌ What Was Tried & Failed (if provided)
### 🔑 Next Dev Needs To Know (if provided)
### ⚡ AI Insights
(3-5 bullet points analyzing patterns, potential issues, and recommendations)
### 🏷️ Auto-Tags
(relevant hashtags like #authentication #api-integration #database etc.)""",

    "mentor": """You are The Quiet Mentor — a code coach who reviews sessions like game tape. Given a code diff or session code, provide a debrief.

Return a JSON array (and nothing else) with 2-4 insight objects:
[
    {
        "type": "<critical|warning|tip|positive>",
        "icon": "<single emoji>",
        "title": "<short title>",
        "text": "<detailed explanation in HTML, can use <code> and <strong> tags>",
        "code": "<code suggestion or null>"
    }
]

Always end with an end-of-session reflection tip. Be specific to the actual code provided.""",

    "commitrisk": """You are a commit risk analyzer. Given a git diff, analyze the risk of merging this code.

Return a JSON object (and nothing else):
{
    "score": <0-100 risk score>,
    "verdict": "<SAFE TO MERGE | CAUTION | HIGH RISK | DO NOT MERGE>",
    "warnings": [
        {
            "severity": "<critical|high|medium|low>",
            "icon": "<emoji>",
            "title": "<short title>",
            "text": "<detailed explanation>",
            "line": "<what was detected, or null>"
        }
    ],
    "summary": "<2-3 sentence overall summary>"
}

Check for: SQL injection, auth bypass, hardcoded secrets, debug endpoints, missing error handling, performance regressions, unbounded queries, commented-out security code.""",

    "postmortem": """You are an incident post-mortem generator. Given incident details (what broke, when, root cause, fix, impact), generate a professional post-mortem document.

Format as markdown with these sections:
## 📋 INCIDENT POST-MORTEM
### 📌 Executive Summary
### 🕐 Timeline (6 steps from detection to resolution)
### 🔍 Root Cause Analysis (primary cause + contributing factors)
### 💊 Resolution
### 💥 Impact
### ✅ Action Items (with P0/P1/P2 priorities)
### 📚 Lessons Learned (what went well, what went wrong, where we got lucky, key takeaway)

Be specific and professional. Use the actual details provided.""",

    "rubberduck": """You are a Rubber Duck debugging coach. You help developers think through problems by asking guided questions — you NEVER give direct answers.

Given a problem description, generate exactly 4 probing questions that guide the developer to find their own solution.

Return a JSON array (and nothing else) with exactly 4 objects:
[
    {"q": "<question in markdown with **bold** for emphasis>", "insight": "<insight to reveal after they answer>"}
]

Questions should progressively narrow from broad understanding to specific debugging. Make them specific to the actual problem described.""",
}


def invoke_bedrock(system_prompt, user_message, max_tokens=2048):
    """Call Amazon Bedrock with Nova Micro model."""
    body = {
        "system": [{"text": system_prompt}],
        "messages": [
            {"role": "user", "content": [{"text": user_message}]}
        ],
        "inferenceConfig": {
            "maxTokens": max_tokens,
            "temperature": 0.7,
        },
    }

    response = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType="application/json",
        accept="application/json",
        body=json.dumps(body),
    )

    result = json.loads(response["body"].read())
    return result["output"]["message"]["content"][0]["text"]


def save_incident(incident_data):
    """Save incident to DynamoDB."""
    try:
        table = dynamodb.Table(TABLE_NAME)
        table.put_item(Item={
            "id": str(uuid.uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "ttl": int(time.time()) + 86400 * 30,  # 30-day TTL
            **incident_data,
        })
    except Exception as e:
        print(f"DynamoDB write failed (non-fatal): {e}")


def cors_response(status_code, body):
    """Return response with CORS headers."""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
            "Access-Control-Allow-Methods": "POST,OPTIONS",
        },
        "body": json.dumps(body),
    }


def lambda_handler(event, context):
    """Main Lambda handler — routes to feature-specific logic."""

    # Handle CORS preflight
    if event.get("httpMethod") == "OPTIONS":
        return cors_response(200, {"message": "OK"})

    try:
        body = json.loads(event.get("body", "{}"))
    except json.JSONDecodeError:
        return cors_response(400, {"error": "Invalid JSON"})

    feature = body.get("feature", "chat")
    user_input = body.get("input", "")
    metadata = body.get("metadata", {})

    if not user_input:
        return cors_response(400, {"error": "No input provided"})

    system_prompt = SYSTEM_PROMPTS.get(feature, SYSTEM_PROMPTS["chat"])

    # Build context-aware user message
    if feature == "capsule":
        user_message = f"""Feature: {metadata.get('feature', 'Untitled')}
What was built: {user_input}
What failed: {metadata.get('failed', 'N/A')}
Next dev notes: {metadata.get('nextDev', 'N/A')}"""
    elif feature == "postmortem":
        user_message = f"""What broke: {user_input}
When: {metadata.get('when', 'Not specified')}
Duration: {metadata.get('duration', 'Unknown')}
Root cause: {metadata.get('rootCause', 'Unknown')}
How fixed: {metadata.get('fix', 'Pending')}
Impact: {metadata.get('impact', 'Under assessment')}"""
    elif feature == "dependency":
        user_message = f"Analyze this npm/pip package for risk: {user_input}"
    elif feature == "ancestry":
        user_message = f"Trace the ancestry of this error/stack trace:\n\n{user_input}"
    elif feature == "mentor":
        user_message = f"Review this code session/diff as a mentor:\n\n{user_input}"
    elif feature == "commitrisk":
        user_message = f"Analyze the risk of this git diff:\n\n{user_input}"
    elif feature == "rubberduck":
        user_message = f"The developer is stuck on this problem. Generate 4 guided questions:\n\n{user_input}"
    else:
        user_message = user_input

    # Call Bedrock
    try:
        ai_response = invoke_bedrock(system_prompt, user_message)
    except Exception as e:
        print(f"Bedrock invocation error: {e}")
        return cors_response(500, {
            "error": "AI service temporarily unavailable",
            "fallback": True,
        })

    # Parse JSON responses for structured features
    structured_features = ["dependency", "ancestry", "mentor", "commitrisk", "rubberduck"]
    parsed = None
    if feature in structured_features:
        try:
            # Extract JSON from response (handle markdown code blocks)
            clean = ai_response.strip()
            if clean.startswith("```"):
                clean = clean.split("\n", 1)[1].rsplit("```", 1)[0]
            parsed = json.loads(clean)
        except json.JSONDecodeError:
            parsed = None  # Frontend will use raw text

    # Save to DynamoDB
    save_incident({
        "feature": feature,
        "input_preview": user_input[:200],
        "severity": metadata.get("severity", "unknown"),
        "resolved": True,
    })

    return cors_response(200, {
        "feature": feature,
        "response": parsed if parsed else ai_response,
        "structured": parsed is not None,
        "model": MODEL_ID,
        "timestamp": datetime.utcnow().isoformat(),
    })
