import { execSync } from "child_process";
import fetch from "node-fetch";

const githubToken = process.env.GITHUB_TOKEN;
const openaiKey = process.env.OPENAI_API_KEY;

async function getDiff() {
  const diff = execSync("git diff origin/main...HEAD", {
    encoding: "utf-8",
  });
  return diff;
}

async function callAI(diff) {
  const prompt = `
Você é uma engenheira backend sênior extremamente criteriosa.

Revise o código abaixo:

${diff}

Aponte:
- Bugs possíveis
- Problemas de performance
- Problemas de arquitetura
- Falta de testes
- Melhorias práticas

Seja direta e técnica.
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${openaiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();
  return data.choices[0].message.content;
}

async function commentOnPR(comment) {
  const prUrl = process.env.GITHUB_EVENT_PATH;
  const event = JSON.parse(require("fs").readFileSync(prUrl, "utf-8"));

  const { repository, number } = {
    repository: event.repository.full_name,
    number: event.pull_request.number,
  };

  await fetch(`https://api.github.com/repos/${repository}/issues/${number}/comments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ body: comment }),
  });
}

(async () => {
  const diff = await getDiff();

  if (!diff.trim()) {
    console.log("No changes to review");
    return;
  }

  const review = await callAI(diff);
  await commentOnPR(review);
})();