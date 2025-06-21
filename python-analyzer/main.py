from fastapi import FastAPI
from pydantic import BaseModel
import subprocess, tempfile, os

app = FastAPI()

class CodeRequest(BaseModel):
    code: str

@app.post("/analyze")
async def analyze_code(request: CodeRequest):
    code = request.code
    if not code:
        return {"error": "No code provided"}

    with tempfile.NamedTemporaryFile(delete=False, suffix=".py", mode="w") as tmp:
        tmp.write(code)
        tmp_path = tmp.name

    pylint_result = subprocess.run(["pylint", tmp_path], capture_output=True, text=True)
    bandit_result = subprocess.run(["bandit", "-f", "json", tmp_path], capture_output=True, text=True)
    os.remove(tmp_path)

    return {
        "pylint_output": pylint_result.stdout,
        "bandit_output": bandit_result.stdout
    }
