Iniciar repositorio - mongod
iniciar db - node server.js
iniciar landing page - npm start


Fluxo de Dados:
	Usuário acessa o frontend (React).
	frontend faz requisições HTTP para o backend (Express).
	backend manipula dados no MongoDB e responde ao frontend.
	componentes React exibem, adicionam e removem produtos e saídas.

Resumo Visual (para slides):

º Backend (Node.js + Express + MongoDB)
	ºserver.js: rotas, modelos, conexão
	ºRotas: /produtos, /saidas

Frontend (React):

	Componentes: Adicionar Produto, Listar Produtos, Saída, Impressão
	Navegação via React Router
	comunicação via Axios


Projeto Estoque
│
├── backend/
│   ├── package.json
│   └── server.js
│        │
│        ├── Rotas:
│        │    ├── /produtos  (GET, POST)
│        │    └── /saidas    (GET, POST)
│        │
│        ├── Modelos:
│        │    ├── Produto
│        │    └── Saida
│        │
│        └── Conexão MongoDB
│
└── frontend/
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── App.jsx
        ├── index.js
        ├── components/
        │   ├── addNewProd/
        │   │   └── index.jsx
        │   └── listProduct/
        │       └── index.jsx
        └── pages/
            ├── Home/
            │   └── index.jsx
            ├── AdicionarProduto/
            │   └── index.jsx
            ├── SaidaProdutos/
            │   └── index.jsx
            └── ImpressaoSaida/
                └── index.jsx


                
