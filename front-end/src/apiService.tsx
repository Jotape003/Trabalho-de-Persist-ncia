import type { NovoProduto, Produto } from "./types";


const BASE_URL = "http://127.0.0.1:8000";

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Algo deu errado");
  }
  return response.json() as Promise<T>;
}

// GET /produtos
export async function listarProdutos(): Promise<Produto[]> {
  const response = await fetch(`${BASE_URL}/produtos`);
  return handleResponse<Produto[]>(response);
}

// POST /produtos
export async function criarProduto(produto: NovoProduto): Promise<{ mensagem: string, produto: Produto }> {
  const response = await fetch(`${BASE_URL}/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(produto),
  });
  return handleResponse<{ mensagem: string, produto: Produto }>(response);
}

// DELETE /produtos/{id}
export async function apagarProduto(id: number): Promise<{ mensagem: string }> {
  const response = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: 'DELETE',
  });
  return handleResponse<{ mensagem: string }>(response);
}

// PUT /produtos/{id}
export async function atualizarProduto(id: number, produto: NovoProduto): Promise<{ mensagem: string, produto: Produto }> {
    const response = await fetch(`${BASE_URL}/produtos/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(produto),
  });
  return handleResponse<{ mensagem: string, produto: Produto }>(response);
}

// GET /produtos/maior
export async function obterProdutoMaisCaro(): Promise<Produto> {
    const response = await fetch(`${BASE_URL}/produtos/maior`);
    return handleResponse<Produto>(response);
}

// GET /produtos/menor
export async function obterProdutoMaisBarato(): Promise<Produto> {
    const response = await fetch(`${BASE_URL}/produtos/menor`);
    return handleResponse<Produto>(response);
}

// GET /produtos/media
export async function obterPrecoMedio(): Promise<{ preco_medio: number }> {
    const response = await fetch(`${BASE_URL}/produtos/media`);
    return handleResponse<{ preco_medio: number }>(response);
}

// GET /produtos/acima-da-media
export async function obterProdutosAcimaDaMedia(): Promise<Produto[]> {
    const response = await fetch(`${BASE_URL}/produtos/acima-da-media`);
    return handleResponse<Produto[]>(response);
}
// GET /produtos/abaixo-da-media
export async function obterProdutosAbaixoDaMedia(): Promise<Produto[]> {
    const response = await fetch(`${BASE_URL}/produtos/abaixo-da-media`);
    return handleResponse<Produto[]>(response);
}