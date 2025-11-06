import pandas as pd
import asyncio
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException

app = FastAPI()

lock = asyncio.Lock()

contador_id = 41
produto_df = pd.read_csv("produtos.csv")

class Produto(BaseModel):
    nome: str
    categoria: str
    preco: float

@app.post("/produtos")
async def criar_produto(produto: Produto):
    async with lock:
        global contador_id, produto_df

        novo_produto = {
            'id': contador_id,
            'nome': produto.nome,
            'categoria': produto.categoria,
            'preco': produto.preco
        }

        produto_df = pd.concat([produto_df, pd.DataFrame([novo_produto])], ignore_index = True)

        contador_id += 1

        return {
            'mensagem': 'Produto cadastrado com sucesso',
            'produto': novo_produto
        }

@app.get("/produtos")
def listar_alunos():
    return produto_df.to_dict(orient = "records")

@app.get("/produtos/{id}")
def obter_produto(id: int):
    global produto_df
    filtro = produto_df["id"] == id
    produto = produto_df[filtro]

    if produto.empty:
        raise HTTPException(status_code=404, detail = f"Produto id: {id}, não encontrado")
    return produto.to_dict(orient="records")[0] 

@app.put("/produtos/{id}")
async def atualizar_produto(id: int, produto: Produto):
    async with lock:
        global produto_df
        produto_antigo_idx = produto_df.index[produto_df["id"] == id]

        if produto_antigo_idx.empty:
            raise HTTPException(status_code=404, detail=f"Produto id:{id}, não encontrado")
        
        produto_df.loc[produto_antigo_idx, ["nome", "categoria", "preco"]] = [produto.nome, produto.categoria, produto.preco]

        return {
            "mensagem": f"Produto {id} atualizado com sucesso!",
            "produto": produto_df.loc[produto_antigo_idx].to_dict(orient="records")[0]
        }

@app.delete("/produtos/{id}")
async def apagar_produto(id: int):
    async with lock:
        global produto_df
        produto_apagar_idx = produto_df.index[produto_df["id"] == id]

        if produto_apagar_idx.empty:
            raise HTTPException(status_code=404, detail=f"Produto id:{id}, não encontrado")
        
        produto_df = produto_df.drop(produto_apagar_idx).reset_index(drop=True)
        return {"mensagem": f"Produto com {id} apagado com sucesso!"}
