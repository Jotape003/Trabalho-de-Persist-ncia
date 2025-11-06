#pip install httpx
import httpx

BASE_URL = "http://127.0.0.1:8000"

def criar_produto(produto):
    resp = httpx.post(
        f"{BASE_URL}/produto",
        json = {"nome":produto.get("nome"),"categoria":produto.get("categoria"),"preco":produto.get("preco")}
    )
    return resp.json()

def listar_produtos():
    resp = httpx.get(f"{BASE_URL}/produto")
    print(resp.json())

def obter_produto(id):
    resp = httpx.get(f"{BASE_URL}/produto/{id}")
    return resp.json()

def atualizar_produto(id, produto):
    resp = httpx.put(
        f"{BASE_URL}/produto/{id}",
        json = {"nome": produto.get("nome"), "categoria": produto.get("categoria"), "preco": produto.get("preco")}
    )
    print(resp.json())

def apagar_produto(id):
    resp = httpx.delete(f"{BASE_URL}/produto/{id}")
    return resp.json()

listar_produtos()
print("\n")
print(criar_produto({"nome":"Mouse Gamer RGB", "categoria": "Categoria Periféricos", "preco": 159.90}))
# print(obter_produto(2))
# print("\n")
# print(criar_produto({"nome":"Leite", "categoria": "Categoria Teste", "preco": 3.0}))
# print("\n")
# listar_produtos()
# print("\n")
# atualizar_produto(2, {"nome":"Celular", "categoria": "Categoria Teste", "preco": 324})
# print("\n")
# listar_produtos()
# print("\n")
# apagar_produto(2)
# print("\n")
# print("----------")
# listar_produtos()