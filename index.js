import fetch from "node-fetch";
import crypto from "crypto";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
}));

export default (app) => {
  console.log("🤖 Probot app loaded");

  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {
    const pr = context.payload.pull_request;
    const user = pr.user.login;
    const repo = context.payload.repository;
    const owner = repo.owner.login;
    const repoName = repo.name;
    const prNumber = pr.number;

    const files = await context.octokit.pulls.listFiles({
      owner,
      repo: repoName,
      pull_number: prNumber,
    });

    const pyFiles = files.data.filter(file => file.filename.endsWith(".py"));
    if (pyFiles.length === 0) return;

    let fullComment = `👋 Hello @${user}, here's the AI code analysis for ${pyFiles.length} Python file(s):\n\n`;

    for (const file of pyFiles) {
      try {
        const res = await context.octokit.repos.getContent({
          owner,
          repo: repoName,
          path: file.filename,
          ref: pr.head.sha
        });

        let content = Buffer.from(res.data.content, 'base64').toString('utf8');
        const codeHash = crypto.createHash("sha256").update(content).digest("hex");

        const checkRes = await fetch("http://backend:3001/api/analysis/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code_hash: codeHash })
        });
        const { exists, result } = await checkRes.json();

        let gptSuggestion = result?.gpt_suggestion || "";

        if (!gptSuggestion) {
          if (content.length > 4000) content = content.slice(0, 4000);

          let retries = 3;
          while (retries > 0) {
            try {
              const gptRes = await openai.createChatCompletion({
                model: "gpt-4o",
                messages: [
                  { role: "system", content: "You are a helpful assistant that reviews Python code." },
                  { role: "user", content: `Please review the following Python code and suggest improvements:\n\n${content}` }
                ]
              });
              gptSuggestion = gptRes.data.choices[0].message.content;
              break;
            } catch (err) {
              if (err.response?.status === 429) {
                console.warn("⏳ Rate limited. Retrying GPT in 5s...");
                await new Promise(r => setTimeout(r, 5000));
                retries--;
              } else {
                console.error("❌ GPT error:", err.message);
                break;
              }
            }
          }

          if (!gptSuggestion) {
            gptSuggestion = "⚠️ GPT suggestion could not be generated due to rate limits or errors.";
          }
        }

        const analysisRes = await fetch("http://analyzer:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: content })
        });
        const analysis = await analysisRes.json();

        if (!exists) {
          try {
            await fetch("http://backend:3001/api/analysis", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                code: content,
                pylint_output: analysis.pylint_output,
                bandit_output: analysis.bandit_output,
                gpt_suggestion: gptSuggestion,
                code_hash: codeHash
              })
            });
            console.log("✅ Saved analysis");
          } catch (saveErr) {
            console.error("❌ Save failed:", saveErr.message);
          }
        } else {
          console.log("⚠️ Duplicate skipped: already saved");
        }

        // Build PR comment
        fullComment += `📝 **${file.filename}**\n\`\`\`txt\n`;
        fullComment += (analysis.pylint_output || "").slice(0, 500);
        fullComment += "\n```\n";
        fullComment += `💡 **GPT Suggestions**:\n> ${gptSuggestion.replace(/\n/g, "\n> ")}\n\n`;

      } catch (err) {
        console.error(`❌ File analysis failed: ${file.filename}`, err.message);
      }
    }

    await context.octokit.issues.createComment(context.issue({ body: fullComment }));
  });
};
