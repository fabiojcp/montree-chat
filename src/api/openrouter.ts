import axios from "axios";

export interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
  error?: {
    message: string;
    code?: number;
  };
}

const client = axios.create({
  baseURL: "",
  timeout: 30000,
});

const DEFAULT_ERROR =
  "Não foi possível obter uma resposta do assistente. Verifique sua conexão e tente novamente.";

export async function sendToAI(messages: OpenRouterMessage[]): Promise<string> {
  try {
    const { data } = await client.post<OpenRouterResponse>("/api/chat", {
      model: "poolside/laguna-xs-2.1:free",
      messages,
      temperature: 0.7,
    });

    if (data.error) {
      throw new Error(data.error.message || DEFAULT_ERROR);
    }

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error(DEFAULT_ERROR);
    }

    return content;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const data = err.response?.data as { error?: string } | undefined;

      if (status === 401 || status === 403) {
        throw new Error("Chave da API não configurada ou inválida.");
      }
      if (status === 429) {
        throw new Error("Muitas requisições. Aguarde um momento e tente novamente.");
      }
      if (status && status >= 500) {
        throw new Error("O serviço de IA está temporariamente indisponível. Tente novamente em instantes.");
      }
      if (data?.error) {
        throw new Error(data.error);
      }
      if (!status && err.code === "ERR_NETWORK") {
        throw new Error("Sem conexão com o servidor. Verifique sua internet.");
      }
    }
    throw err instanceof Error ? err : new Error(DEFAULT_ERROR);
  }
}
