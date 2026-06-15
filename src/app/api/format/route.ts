import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { raw, apiKey } = await req.json()

    if (!raw || !apiKey) {
      return NextResponse.json(
        { error: "Missing raw text or API key" },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a helpful assistant that formats "Today I Learned" notes.

Given raw notes from a user, rewrite them into a clear, well-structured TIL entry.

Rules:
- Return ONLY GitHub-flavored Markdown (no preamble, no commentary)
- Use markdown headings with ## for major sections (H2)
- Use bullet lists where appropriate
- Use triple-backtick fenced code blocks for code (include language when known)
- Put inline code in backticks
- Add a one-line bold summary at the top (first line), like: **Summary...**
- Keep it concise but complete
- Do NOT use emojis`

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: raw },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      return NextResponse.json(
        { error: `OpenAI API error: ${error}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const formatted = data.choices[0].message.content

    return NextResponse.json({ formatted })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

