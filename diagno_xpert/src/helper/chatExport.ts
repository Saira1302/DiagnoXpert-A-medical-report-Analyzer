import type { ChatDetail, ChatHistoryMessage } from "@/ApiServices/chatHistoryApi";

function formatScanResult(result: unknown): string {
  if (!result || typeof result !== "object") return "";
  const r = result as {
    total_tests?: number;
    tests?: Array<{
      test_name?: string;
      result?: string;
      unit?: string;
      reference_value?: string;
    }>;
    ai_interpretation?: string;
  };

  const lines: string[] = [];
  if (typeof r.total_tests === "number") {
    lines.push(`**Total tests:** ${r.total_tests}`);
  }
  if (Array.isArray(r.tests) && r.tests.length > 0) {
    lines.push("", "| Test | Result | Reference |", "| --- | --- | --- |");
    for (const t of r.tests) {
      const name = (t.test_name || "—").replace(/\|/g, "\\|");
      const value = `${t.result ?? "—"}${t.unit ? " " + t.unit : ""}`.replace(/\|/g, "\\|");
      const ref = (t.reference_value || "—").replace(/\|/g, "\\|");
      lines.push(`| ${name} | ${value} | ${ref} |`);
    }
  }
  if (r.ai_interpretation) {
    lines.push("", "**AI Interpretation**", "", r.ai_interpretation);
  }
  return lines.join("\n");
}

function messageToMarkdown(msg: ChatHistoryMessage): string {
  const heading = msg.role === "user" ? "### 🧑 User" : "### 🤖 Assistant";
  const ts = msg.createdAt ? ` _(${new Date(msg.createdAt).toLocaleString()})_` : "";
  const parts: string[] = [`${heading}${ts}`];

  if (msg.type === "text") {
    parts.push(msg.content || "");
  } else if (msg.type === "scan") {
    if (msg.role === "user") {
      if (msg.fileName) parts.push(`📎 **Attached:** ${msg.fileName}`);
      if (msg.userQuestion) parts.push("", msg.userQuestion);
    } else {
      const formatted = formatScanResult(msg.result);
      parts.push(formatted || "_No interpretation available_");
    }
  }

  return parts.join("\n");
}

export function chatToMarkdown(chat: ChatDetail): string {
  const header = [
    `# ${chat.title || "Chat"}`,
    "",
    `_Created: ${new Date(chat.createdAt).toLocaleString()}_`,
    `_Updated: ${new Date(chat.updatedAt).toLocaleString()}_`,
    "",
    "---",
    "",
  ].join("\n");

  const body = (chat.messages || []).map(messageToMarkdown).join("\n\n---\n\n");
  return header + body + "\n";
}

function safeFilename(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]+/g, "").trim();
  return cleaned.slice(0, 60) || "chat";
}

export function downloadChatAsMarkdown(chat: ChatDetail) {
  const md = chatToMarkdown(chat);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFilename(chat.title || "chat")}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function scanResultToHtml(result: unknown): string {
  if (!result || typeof result !== "object") return "";
  const r = result as {
    total_tests?: number;
    tests?: Array<{
      test_name?: string;
      result?: string;
      unit?: string;
      reference_value?: string;
    }>;
    ai_interpretation?: string;
  };

  const parts: string[] = [];
  if (typeof r.total_tests === "number") {
    parts.push(`<p><strong>Total tests:</strong> ${r.total_tests}</p>`);
  }
  if (Array.isArray(r.tests) && r.tests.length > 0) {
    const rows = r.tests
      .map((t) => {
        const value = `${t.result ?? "—"}${t.unit ? " " + t.unit : ""}`;
        return `<tr><td>${escapeHtml(t.test_name || "—")}</td><td>${escapeHtml(value)}</td><td>${escapeHtml(t.reference_value || "—")}</td></tr>`;
      })
      .join("");
    parts.push(
      `<table><thead><tr><th>Test</th><th>Result</th><th>Reference</th></tr></thead><tbody>${rows}</tbody></table>`,
    );
  }
  if (r.ai_interpretation) {
    parts.push(
      `<p class="label">AI Interpretation</p><p class="interpretation">${escapeHtml(r.ai_interpretation).replace(/\n/g, "<br/>")}</p>`,
    );
  }
  return parts.join("");
}

function messageToHtml(msg: ChatHistoryMessage): string {
  const isUser = msg.role === "user";
  const roleLabel = isUser ? "User" : "Assistant";
  const ts = msg.createdAt
    ? `<span class="timestamp">${escapeHtml(new Date(msg.createdAt).toLocaleString())}</span>`
    : "";

  let body = "";
  if (msg.type === "text") {
    body = `<p>${escapeHtml(msg.content || "").replace(/\n/g, "<br/>")}</p>`;
  } else if (msg.type === "scan") {
    if (isUser) {
      const bits: string[] = [];
      if (msg.fileName) bits.push(`<p>📎 <strong>Attached:</strong> ${escapeHtml(msg.fileName)}</p>`);
      if (msg.userQuestion) bits.push(`<p>${escapeHtml(msg.userQuestion)}</p>`);
      body = bits.join("") || "<p><em>(file attached)</em></p>";
    } else {
      body = scanResultToHtml(msg.result) || "<p><em>No interpretation available</em></p>";
    }
  }

  return `
    <section class="msg ${isUser ? "user" : "assistant"}">
      <header><span class="role">${roleLabel}</span>${ts}</header>
      <div class="body">${body}</div>
    </section>
  `;
}

function buildChatHtml(chat: ChatDetail): string {
  const messagesHtml = (chat.messages || []).map(messageToHtml).join("");
  const title = escapeHtml(chat.title || "Chat");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>${title}</title>
<style>
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    color: #1f2937;
    margin: 32px;
    line-height: 1.5;
    font-size: 12px;
  }
  h1 { font-size: 22px; margin: 0 0 4px 0; color: #2563eb; }
  .meta { color: #6b7280; font-size: 11px; margin-bottom: 16px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 16px 0; }
  .msg { margin: 12px 0; padding: 10px 14px; border-radius: 10px; page-break-inside: avoid; }
  .msg.user { background: #eff6ff; border-left: 3px solid #2563eb; }
  .msg.assistant { background: #f9fafb; border-left: 3px solid #9ca3af; }
  .msg header { display: flex; gap: 8px; align-items: baseline; margin-bottom: 4px; }
  .msg .role { font-weight: 600; color: #111827; font-size: 12px; }
  .msg .timestamp { color: #9ca3af; font-size: 10px; }
  .msg .body p { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; }
  th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; font-weight: 600; }
  .label { font-weight: 600; margin-top: 10px; color: #374151; }
  .interpretation { background: #fff; border: 1px solid #e5e7eb; padding: 8px 10px; border-radius: 6px; }
  @media print {
    body { margin: 18mm; }
    .msg { break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    Created: ${escapeHtml(new Date(chat.createdAt).toLocaleString())}<br/>
    Updated: ${escapeHtml(new Date(chat.updatedAt).toLocaleString())}
  </div>
  <hr/>
  ${messagesHtml}
</body>
</html>`;
}

export function downloadChatAsPdf(chat: ChatDetail) {
  const html = buildChatHtml(chat);

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  document.body.appendChild(iframe);

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1500);
  };

  const triggerPrint = () => {
    const cw = iframe.contentWindow;
    if (!cw) {
      cleanup();
      return;
    }
    try {
      cw.focus();
      cw.print();
    } catch (err) {
      console.error("Print failed:", err);
    } finally {
      cleanup();
    }
  };

  iframe.onload = () => {
    // Wait a tick for layout / fonts to settle before printing.
    setTimeout(triggerPrint, 250);
  };

  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) {
    cleanup();
    throw new Error("Unable to create print frame.");
  }

  doc.open();
  doc.write(html);
  doc.close();
}
