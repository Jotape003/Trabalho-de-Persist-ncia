export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
}

export type NovoProduto = Omit<Produto, 'id'>;