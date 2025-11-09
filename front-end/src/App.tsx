import React, { useState, useEffect } from 'react';
import type { Produto, NovoProduto } from './types';
import * as api from './apiService';

function App() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [resultado, setResultado] = useState<string>("");
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<Produto | null>(null);
  const [novoNome, setNovoNome] = useState("");
  const [novaCategoria, setNovaCategoria] = useState("");
  const [novoPreco, setNovoPreco] = useState(0);

  const carregarProdutos = async () => {
    try {
      const data = await api.listarProdutos();
      setProdutos(data);
      if (!produtoEmEdicao) {
        setResultado(`Total de ${data.length} produtos carregados.`);
      }
    } catch {
      setResultado("Erro ao carregar produtos.");
    }
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const limparFormulario = () => {
    setNovoNome("");
    setNovaCategoria("");
    setNovoPreco(0);
    setProdutoEmEdicao(null);
  };

  const handleSubmitFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    const produtoPayload: NovoProduto = { nome: novoNome, categoria: novaCategoria, preco: novoPreco };

    try {
      if (produtoEmEdicao) {
        const data = await api.atualizarProduto(produtoEmEdicao.id, produtoPayload);
        setResultado(data.mensagem);
      } else {
        const data = await api.criarProduto(produtoPayload);
        setResultado(`Produto "${data.produto.nome}" criado com sucesso!`);
      }

      limparFormulario();
      carregarProdutos();
    } catch {
      setResultado("Erro ao salvar produto.");
    }
  };

  const handleEditar = (produto: Produto) => {
    setProdutoEmEdicao(produto);
    setNovoNome(produto.nome);
    setNovaCategoria(produto.categoria);
    setNovoPreco(produto.preco);
  };

  const handleApagarProduto = async (id: number) => {
    if (window.confirm("Tem certeza que deseja apagar este produto?")) {
      try {
        const data = await api.apagarProduto(id);
        setResultado(data.mensagem);
        carregarProdutos();
      } catch {
        setResultado("Erro ao apagar produto.");
      }
    }
  };

  const handleMaisCaro = async () => {
    try {
      const produto = await api.obterProdutoMaisCaro();
      setResultado(`Mais caro: ${produto.nome} (R$ ${produto.preco})`);
    } catch {
      setResultado("Erro ao buscar produto.");
    }
  };

  const handleMaisBarato = async () => {
    try {
      const produto = await api.obterProdutoMaisBarato();
      setResultado(`Mais barato: ${produto.nome} (R$ ${produto.preco})`);
    } catch {
      setResultado("Erro ao buscar produto.");
    }
  };

  const handleMedia = async () => {
    try {
      const data = await api.obterPrecoMedio();
      setResultado(`Preço médio: R$ ${data.preco_medio}`);
    } catch {
      setResultado("Erro ao buscar média.");
    }
  };

  const handleProdutosAcimaDaMedia = async () => {
    try {
      const produtos = await api.obterProdutosAcimaDaMedia();
      setResultado(`Produtos acima da média: ${produtos.length}`);
      setProdutos(produtos);
    } catch {
      setResultado("Erro ao buscar produtos.");
    }
  };

  const handleProdutosAbaixoDaMedia = async () => {
    try {
      const produtos = await api.obterProdutosAbaixoDaMedia();
      setResultado(`Produtos abaixo da média: ${produtos.length}`);
      setProdutos(produtos);
    } catch {
      setResultado("Erro ao buscar produtos.");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Gestão de Produtos</h1>

      <div className="d-flex justify-content-center flex-wrap gap-2 mb-3">
        <button className="btn btn-primary" onClick={carregarProdutos}>Recarregar Lista</button>
        <button className="btn btn-info" onClick={handleMaisCaro}>Mais Caro</button>
        <button className="btn btn-info" onClick={handleMaisBarato}>Mais Barato</button>
        <button className="btn btn-secondary" onClick={handleMedia}>Preço Médio</button>
        <button className="btn btn-success" onClick={handleProdutosAcimaDaMedia}>Acima da Média</button>
        <button className="btn btn-warning" onClick={handleProdutosAbaixoDaMedia}>Abaixo da Média</button>
      </div>

      {resultado && (
        <div className="alert alert-dark text-center" role="alert">
          {resultado}
        </div>
      )}

      <div className="row">
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-3">
                {produtoEmEdicao ? "Atualizar Produto" : "Novo Produto"}
              </h4>

              <form onSubmit={handleSubmitFormulario}>
                <div className="mb-3">
                  <label className="form-label">Nome</label>
                  <input className="form-control" value={novoNome} required
                    onChange={e => setNovoNome(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Categoria</label>
                  <input className="form-control" value={novaCategoria} required
                    onChange={e => setNovaCategoria(e.target.value)} />
                </div>

                <div className="mb-3">
                  <label className="form-label">Preço</label>
                  <input type="number" step="0.01" className="form-control"
                    value={novoPreco} required
                    onChange={(e) => setNovoPreco(parseFloat(e.target.value))} />
                </div>

                <button type="submit" className="btn btn-success w-100 mb-2">
                  {produtoEmEdicao ? "Atualizar" : "Criar"}
                </button>

                {produtoEmEdicao && (
                  <button type="button" onClick={limparFormulario} className="btn btn-outline-danger w-100">
                    Cancelar
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="mb-3">Lista de Produtos</h4>

              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>Nome</th>
                      <th>Categoria</th>
                      <th>Preço</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map(produto => (
                      <tr key={produto.id}>
                        <td><strong>{produto.nome}</strong></td>
                        <td>{produto.categoria}</td>
                        <td>R$ {produto.preco.toFixed(2)}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => handleEditar(produto)}>
                            Editar
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleApagarProduto(produto.id)}>
                            Apagar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {produtos.length === 0 && (
                  <p className="text-center mt-2 text-muted">Nenhum produto encontrado.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
