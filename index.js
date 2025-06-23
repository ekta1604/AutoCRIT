import fetch from "node-fetch";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

// ✅ OpenAI v3 compatible setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default (app) => {
  console.log("🤖 Probot app loaded");

  app.on(["pull_request.opened", "pull_request.synchronize"], async (context) => {
    const pr = context.payload.pull_request;
    const user = pr.user.login;
    const repo = context.payload.repository;
    const owner = repo.owner.login;
    const repoName = repo.name;
    const prNumber = pr.number;

    console.log(`🔔 New PR #${prNumber} in ${owner}/${repoName} by ${user}`);

    const files = await context.octokit.pulls.listFiles({
      owner,
      repo: repoName,
      pull_number: prNumber,
    });

    const pyFiles = files.data.filter(file => file.filename.endsWith(".py"));
    if (pyFiles.length === 0) {
      console.log("🚫 No Python files found in PR");
      return;
    }

    let fullComment = `👋 Hello @${user}, here's the AI code analysis for ${pyFiles.length} Python file(s):\n\n`;

    for (const file of pyFiles) {
      try {
        const res = await context.octokit.repos.getContent({
          owner,
          repo: repoName,
          path: file.filename,
          ref: pr.head.sha
        });

        const content = Buffer.from(res.data.content, 'base64').toString('utf8');

        // 🔍 Run static analysis
        const analysisRes = await fetch("http://analyzer:8000/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: content })
        });

        const analysis = await analysisRes.json();
        console.log(`✅ Analysis for ${file.filename}:`, analysis);

        // 💾 Store result
        await fetch("http://backend:3001/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: content,
            pylint_output: analysis.pylint_output,
            bandit_output: analysis.bandit_output
          })
        });

        // ✨ GPT-based suggestion
        let gptSuggestion = "";
        try {
          const gptRes = await openai.createChatCompletion({
            model: "gpt-4",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that reviews Python code."
              },
              {
                role: "user",
                content: `Please review the following Python code and suggest improvements:\n\n${content}`
              }
            ]
          });
          gptSuggestion = gptRes.data.choices[0].message.content;
        } catch (gptErr) {
          console.error("❌ GPT analysis failed:", gptErr);
        }

        fullComment += `📝 **${file.filename}**\n`;
        fullComment += "```txt\n";
        fullComment += (analysis.pylint_output || "").slice(0, 500);
        fullComment += "\n```";
        if (gptSuggestion) {
          fullComment += `💡 GPT Suggestions:\n> ${gptSuggestion.replace(/\n/g, "\n> ")}\n\n`;
        }
      } catch (err) {
        console.error(`❌ Error analyzing file ${file.filename}:`, err);
      }
    }

    try {
      await context.octokit.issues.createComment(context.issue({ body: fullComment }));
      console.log("💬 Comment posted on PR");
    } catch (err) {
      console.error("❌ Failed to post comment on PR:", err);
    }
  });
};
