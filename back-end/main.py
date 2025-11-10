import pandas as pd
import asyncio
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

lock = asyncio.Lock()

contador_id = 41
produtos_df = pd.read_csv("produtos.csv")


class Produto(BaseModel):
    nome: str
    categoria: str
    preco: float


@app.post("/produtos")
async def criar_produto(produto: Produto):
    async with lock:
        global contador_id, produtos_df

        novo_produto = {
            'id': contador_id,
            'nome': produto.nome,
            'categoria': produto.categoria,
            'preco': produto.preco
        }

        produtos_df = pd.concat([produtos_df, pd.DataFrame([novo_produto])], ignore_index=True)
        contador_id += 1

        produtos_df.to_csv("produtos.csv", index=False)

        return {
            'mensagem': 'Produto cadastrado com sucesso',
            'produto': novo_produto
        }


@app.get("/produtos")
def listar_produtos():
    return produtos_df.to_dict(orient="records")


@app.get("/produtos/maior")
def obter_produto_mais_caro():
    global produtos_df
    produto_mais_caro = produtos_df.loc[produtos_df["preco"].idxmax()]
    return produto_mais_caro.to_dict()


@app.get("/produtos/menor")
def obter_produto_mais_barato():
    global produtos_df
    produto_mais_barato = produtos_df.loc[produtos_df["preco"].idxmin()]
    return produto_mais_barato.to_dict()


@app.get("/produtos/media")
def obter_preco_medio():
    global produtos_df
    media = produtos_df["preco"].mean()
    return {"preco_medio": round(media, 2)}


@app.get("/produtos/acima-da-media")
def obter_produtos_acima_da_media():
    global produtos_df
    media = produtos_df["preco"].mean()
    produto_acima_media = produtos_df[produtos_df["preco"] >= media]
    return produto_acima_media.to_dict(orient="records")


@app.get("/produtos/abaixo-da-media")
def obter_produtos_abaixo_da_media():
    global produtos_df
    media = produtos_df["preco"].mean()
    produto_abaixo_media = produtos_df[produtos_df["preco"] < media]
    return produto_abaixo_media.to_dict(orient="records")


@app.get("/produtos/{id}")
def obter_produto(id: int):
    global produtos_df
    filtro = produtos_df["id"] == id
    produto = produtos_df[filtro]

    if produto.empty:
        raise HTTPException(status_code=404, detail=f"Produto id: {id}, não encontrado")

    return produto.to_dict(orient="records")[0]


@app.put("/produtos/{id}")
async def atualizar_produto(id: int, produto: Produto):
    async with lock:
        global produtos_df
        produto_antigo_idx = produtos_df.index[produtos_df["id"] == id]

        if produto_antigo_idx.empty:
            raise HTTPException(status_code=404, detail=f"Produto id:{id}, não encontrado")

        produtos_df.loc[produto_antigo_idx, ["nome", "categoria", "preco"]] = [
            produto.nome,
            produto.categoria,
            produto.preco
        ]

        produtos_df.to_csv("produtos.csv", index=False)

        return {
            "mensagem": f"Produto {id} atualizado com sucesso!",
            "produto": produtos_df.loc[produto_antigo_idx].to_dict(orient="records")[0]
        }


@app.delete("/produtos/{id}")
async def apagar_produto(id: int):
    async with lock:
        global produtos_df
        produto_apagar_idx = produtos_df.index[produtos_df["id"] == id]

        if produto_apagar_idx.empty:
            raise HTTPException(status_code=404, detail=f"Produto id:{id}, não encontrado")

        produtos_df = produtos_df.drop(produto_apagar_idx).reset_index(drop=True)

        produtos_df.to_csv("produtos.csv", index=False)

        return {"mensagem": f"Produto com {id} apagado com sucesso!"}
