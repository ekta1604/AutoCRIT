@echo off
title AI Review Bot - Full Startup

REM ----------- Start MongoDB -----------
start "MongoDB" cmd /k "cd C:\Program Files\MongoDB\Server\8.0\bin && mongod"

REM ----------- Start Python Analyzer -----------
start "Python Analyzer" cmd /k "cd python-analyzer && .venv\Scripts\activate && uvicorn main:app --reload --port 8000"

REM ----------- Start Smee Proxy -----------
start "Smee Proxy" cmd /k "npx smee-client --url https://smee.io/RmuaX6iSO7SSbA1t --path /api/github/webhooks --port 3000"

REM ----------- Start Express + Probot Backend -----------
start "Express + Probot" cmd /k "cd ai-review-bot && npm start"

REM ----------- Optional: React Dashboard -----------
start "React Dashboard" cmd /k "cd review-dashboard && npm start"
