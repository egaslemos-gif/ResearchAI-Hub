import { NextRequest, NextResponse } from "next/server";

// Node.js runtime for better env var loading

interface ExecutionRequest {
  prompt: string;
  engine?: "claude" | "gemini" | "glm" | "openrouter" | "google" | "openai" | "nvidia-glm" | "nvidia-deepseek";
  task?: {
    type?: string;
    objective?: string;
    expectedOutput?: string;
  };
  profile?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    outputStyle?: string;
  };
  variables?: Record<string, string>;
}

interface EngineConfig {
  apiKey: string | undefined;
  model: string;
  endpoint: string;
  protocol: "anthropic" | "openai" | "gemini";
  extraParams?: Record<string, any>;
}

function getEngineConfig(engine: string, profileModel?: string): EngineConfig | null {
  switch (engine) {
    case "claude":
      return {
        apiKey: process.env.ANTHROPIC_API_KEY,
        model: profileModel ?? process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
        endpoint: "https://api.anthropic.com/v1/messages",
        protocol: "anthropic",
      };
    case "google":
      // Google Gemini direct API
      return {
        apiKey: process.env.GOOGLE_API_KEY,
        model: profileModel ?? "gemini-2.0-flash",
        endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
        protocol: "gemini",
      };
    case "gemini":
      // Gemini via OpenRouter (fallback if no Google key)
      return {
        apiKey: process.env.OPENROUTER_API_KEY ?? process.env.GOOGLE_API_KEY,
        model: profileModel ?? "google/gemini-2.5-flash",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        protocol: "openai",
      };
    case "glm":
      // GLM via OpenRouter
      return {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: profileModel ?? "z-ai/glm-4.5",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        protocol: "openai",
      };
    case "openrouter":
      return {
        apiKey: process.env.OPENROUTER_API_KEY,
        model: profileModel ?? "anthropic/claude-sonnet-4",
        endpoint: "https://openrouter.ai/api/v1/chat/completions",
        protocol: "openai",
      };
    case "nvidia-glm":
      return {
        apiKey: process.env.NVIDIA_API_KEY_GLM,
        model: profileModel ?? "z-ai/glm-5.2",
        endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
        protocol: "openai",
      };
    case "nvidia-deepseek":
      return {
        apiKey: process.env.NVIDIA_API_KEY_DEEPSEEK,
        model: profileModel ?? "deepseek-ai/deepseek-v4-pro",
        endpoint: "https://integrate.api.nvidia.com/v1/chat/completions",
        protocol: "openai",
        extraParams: { chat_template_kwargs: { thinking: false } },
      };
    case "openai":
      return {
        apiKey: process.env.OPENAI_API_KEY,
        model: profileModel ?? "gpt-4o",
        endpoint: "https://api.openai.com/v1/chat/completions",
        protocol: "openai",
      };
    default:
      return null;
  }
}

async function callAnthropic(config: EngineConfig, prompt: string, temperature: number, maxTokens: number) {
  const res = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  const content = data?.content?.[0]?.text ?? "[No response from Claude]";
  const usage = data?.usage ?? {};

  return {
    content,
    tokensUsed: (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0),
    model: config.model,
  };
}

async function callOpenAICompatible(config: EngineConfig, prompt: string, temperature: number, maxTokens: number) {
  const res = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      temperature,
      max_tokens: maxTokens,
      top_p: 0.95,
      stream: false,
      messages: [{ role: "user", content: prompt }],
      ...config.extraParams,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API error (${config.model}): ${res.status} — ${errText}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content ?? "[No response from model]";
  const usage = data?.usage ?? {};

  return {
    content,
    tokensUsed: usage.total_tokens ?? (usage.prompt_tokens ?? 0) + (usage.completion_tokens ?? 0),
    model: config.model,
  };
}

async function callGemini(config: EngineConfig, prompt: string, temperature: number, maxTokens: number) {
  // Google direct API: endpoint is base URL, append model + generateContent
  const url = config.endpoint.includes("generativelanguage.googleapis.com")
    ? `${config.endpoint}/${config.model}:generateContent?key=${config.apiKey}`
    : `${config.endpoint}?key=${config.apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.95,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error: ${res.status} — ${errText}`);
  }

  const data = await res.json();
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[No response from Gemini]";
  const usage = data?.usageMetadata ?? {};

  return {
    content,
    tokensUsed: (usage.promptTokenCount ?? 0) + (usage.candidatesTokenCount ?? 0),
    model: config.model,
  };
}

export async function POST(req: NextRequest) {
  const body: ExecutionRequest = await req.json();

  if (!body.prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const engine = body.engine ?? "google";
  const config = getEngineConfig(engine, body.profile?.model);

  if (!config) {
    return NextResponse.json(
      { error: `Unknown engine: ${engine}. Supported: claude, gemini, google, glm, openai, openrouter, nvidia-glm, nvidia-deepseek` },
      { status: 400 }
    );
  }

  if (!config.apiKey) {
    return NextResponse.json(
      { error: `API key not configured for engine "${engine}". Check .env.local` },
      { status: 500 }
    );
  }

  const temperature = body.profile?.temperature ?? 0.2;
  let maxTokens = body.profile?.maxTokens ?? 8192;

  // Validate prompt size
  const estimatedPromptTokens = Math.ceil(body.prompt.length / 4);
  const modelContextLimit = engine === "claude" ? 200000 : 128000;
  if (estimatedPromptTokens + maxTokens > modelContextLimit) {
    maxTokens = Math.max(100, Math.min(maxTokens, modelContextLimit - estimatedPromptTokens - 1000));
  }

  try {
    let result;

    try {
      switch (config.protocol) {
        case "anthropic":
          result = await callAnthropic(config, body.prompt, temperature, maxTokens);
          break;
        case "gemini":
          result = await callGemini(config, body.prompt, temperature, maxTokens);
          break;
        case "openai":
          result = await callOpenAICompatible(config, body.prompt, temperature, maxTokens);
          break;
        default:
          return NextResponse.json({ error: `Unsupported protocol: ${config.protocol}` }, { status: 500 });
      }
    } catch (primaryErr) {
      const isRateLimit = primaryErr instanceof Error && (primaryErr.message.includes("429") || primaryErr.message.includes("Quota exceeded") || primaryErr.message.includes("RESOURCE_EXHAUSTED"));
      
      // Auto-Failover Strategy: Gemini -> NVIDIA DeepSeek -> NVIDIA GLM
      if (isRateLimit) {
        console.warn(`[Failover Activated] Primary engine ${engine} hit rate limit (429). Falling back to nvidia-deepseek...`);
        const deepseekConfig = getEngineConfig("nvidia-deepseek");
        
        try {
          if (!deepseekConfig?.apiKey) throw new Error("Missing DeepSeek key");
          result = await callOpenAICompatible(deepseekConfig, body.prompt, temperature, maxTokens);
          result.model = `[Failover: DeepSeek] ${result.model}`;
        } catch (fallbackErr) {
          console.warn(`[Failover Activated] DeepSeek also failed. Falling back to nvidia-glm...`);
          const glmConfig = getEngineConfig("nvidia-glm");
          if (!glmConfig?.apiKey) throw primaryErr; // Rethrow original if no GLM key
          
          result = await callOpenAICompatible(glmConfig, body.prompt, temperature, maxTokens);
          result.model = `[Failover: GLM] ${result.model}`;
        }
      } else {
        throw primaryErr; // Not a rate limit error, bubble up
      }
    }

    return NextResponse.json({
      ...result,
      engine,
      success: true,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error(`[Execution API Error] Engine: ${engine}, Model: ${config.model}, Prompt Length: ${body.prompt.length}, Estimated Tokens: ${Math.ceil(body.prompt.length / 4)}`);
    console.error(err);
    return NextResponse.json({ error: message, engine, success: false }, { status: 500 });
  }
}
