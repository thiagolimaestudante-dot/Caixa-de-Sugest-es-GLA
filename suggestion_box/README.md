# Sistema de Caixa de Sugestões - GLA ADVOGADOS

Sistema web para coleta e gerenciamento de sugestões de melhorias dos colaboradores do escritório GLA ADVOGADOS.

## Funcionalidades

- **Envio de Sugestões**: Colaboradores podem enviar sugestões identificados ou anonimamente
- **Visualização**: Todos podem visualizar as sugestões enviadas
- **Votação**: Sistema de votação para as melhores sugestões
- **Comentários**: Possibilidade de comentar nas sugestões (com identificação obrigatória)
- **Ranking**: Ranking das sugestões mais votadas
- **Persistência**: Dados salvos em banco SQLite local (desenvolvimento) ou PostgreSQL (produção)

## Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Frontend**: HTML, CSS, JavaScript
- **Banco de Dados**: SQLite (desenvolvimento), PostgreSQL (produção)
- **Estilo**: CSS moderno com gradientes e animações

## Como Executar Localmente

### Pré-requisitos
- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)

### Instalação e Execução

1. **Extrair os arquivos**
   ```bash
   # Extrair o arquivo ZIP em uma pasta de sua escolha
   ```

2. **Navegar para o diretório**
   ```bash
   cd suggestion_box
   ```

3. **Criar ambiente virtual (recomendado)**
   ```bash
   python -m venv venv
   ```

4. **Ativar o ambiente virtual**
   - **Windows:**
     ```bash
     venv\Scripts\activate
     ```
   - **Linux/Mac:**
     ```bash
     source venv/bin/activate
     ```

5. **Instalar dependências**
   ```bash
   pip install -r requirements.txt
   ```

6. **Executar o sistema**
   ```bash
   python src/main.py
   ```

7. **Acessar o sistema**
   - Abra seu navegador e acesse: `http://localhost:5000`

## Estrutura do Projeto

```
suggestion_box/
├── src/
│   ├── models/          # Modelos do banco de dados
│   │   ├── user.py      # Modelo de usuário (template)
│   │   └── suggestion.py # Modelos de sugestão e comentário
│   ├── routes/          # Rotas da API
│   │   ├── user.py      # Rotas de usuário (template)
│   │   └── suggestion.py # Rotas de sugestões e comentários
│   ├── static/          # Arquivos estáticos (frontend)
│   │   ├── index.html   # Página principal
│   │   ├── style.css    # Estilos CSS
│   │   └── script.js    # Lógica JavaScript
│   ├── database/        # Banco de dados SQLite
│   │   └── app.db       # Arquivo do banco (criado automaticamente)
│   └── main.py          # Arquivo principal do Flask
├── venv/                # Ambiente virtual Python
├── requirements.txt     # Dependências do projeto
└── README.md           # Este arquivo
```

## API Endpoints

### Sugestões
- `GET /api/suggestions` - Listar todas as sugestões
- `POST /api/suggestions` - Criar nova sugestão
- `POST /api/suggestions/{id}/vote` - Votar em uma sugestão
- `GET /api/suggestions/ranking` - Obter ranking das mais votadas

### Comentários
- `POST /api/suggestions/{id}/comments` - Adicionar comentário a uma sugestão

## Características do Sistema

### Interface
- Design moderno e responsivo
- Navegação por abas (Enviar, Visualizar, Ranking)
- Notificações toast para feedback do usuário
- Modal para visualização de comentários
- Animações suaves e transições

### Funcionalidades de Negócio
- Sugestões podem ser enviadas anonimamente ou com identificação
- Campos obrigatórios: título e descrição
- Campo opcional: como implementar
- Votação simples (um clique = um voto)
- Comentários requerem identificação do autor
- Ranking automático baseado no número de votos

### Persistência
- Banco SQLite local para armazenamento
- Dados persistem entre reinicializações
- Backup automático através do arquivo de banco

## Como Hospedar no Render (Recomendado)

O Render é uma plataforma de nuvem unificada que permite hospedar facilmente aplicações web, bancos de dados e outros serviços. É ideal para este projeto, pois suporta tanto o backend Flask quanto um banco de dados PostgreSQL.

### 1. Criar um Repositório Git

Primeiro, você precisará ter seu código em um repositório Git (GitHub, GitLab ou Bitbucket). Se ainda não tem, crie um novo repositório e faça o upload de todos os arquivos do projeto `suggestion_box` para ele.

### 2. Configurar o Banco de Dados PostgreSQL no Render

a. Acesse o [Render Dashboard](https://dashboard.render.com/) e faça login.
b. Clique em `New` -> `PostgreSQL`.
c. Dê um nome ao seu banco de dados (ex: `gla-suggestions-db`).
d. Escolha a região mais próxima de você.
e. Clique em `Create Database`.
f. Após a criação, vá para a página do seu banco de dados e copie a `Internal Database URL` e a `External Database URL`. Você usará a `External Database URL` para migrar os dados e a `Internal Database URL` para a conexão do seu aplicativo Flask.

### 3. Migrar o Banco de Dados (Opcional, se tiver dados existentes)

Se você já tem dados no seu banco SQLite local que deseja migrar para o PostgreSQL, você precisará de uma ferramenta de migração. Uma opção é usar o `pgloader` ou exportar os dados para CSV e importá-los. Para um projeto novo, você pode pular esta etapa e deixar o Flask criar as tabelas no PostgreSQL na primeira execução.

### 4. Configurar o Serviço Web Flask no Render

a. No [Render Dashboard](https://dashboard.render.com/), clique em `New` -> `Web Service`.
b. Conecte seu repositório Git onde o código do `suggestion_box` está hospedado.
c. **Nome**: Dê um nome ao seu serviço (ex: `gla-suggestions-app`).
d. **Região**: Escolha a mesma região do seu banco de dados.
e. **Branch**: Selecione a branch principal (ex: `main` ou `master`).
f. **Root Directory**: Deixe em branco se o seu projeto estiver na raiz do repositório, ou especifique `suggestion_box` se você compactou o projeto dentro de uma pasta.
g. **Runtime**: `Python 3`.
h. **Build Command**: `pip install -r requirements.txt`
i. **Start Command**: `python src/main.py`
j. **Environment Variables**: Adicione as seguintes variáveis de ambiente:
    - `DATABASE_URL`: Cole a `Internal Database URL` que você copiou do seu serviço PostgreSQL no Render.
    - `SECRET_KEY`: Uma string longa e aleatória para a chave secreta do Flask (ex: use um gerador de senhas).
    - `PYTHON_VERSION`: `3.11.0` (ou a versão que você usou no desenvolvimento).

k. Clique em `Create Web Service`.

O Render irá automaticamente construir e implantar sua aplicação. Você poderá acompanhar o progresso nos logs. Uma vez que o deploy esteja completo, o Render fornecerá uma URL pública para acessar seu sistema.

### 5. Acessar o Sistema

Após o deploy bem-sucedido, você poderá acessar seu sistema através da URL fornecida pelo Render. O Flask se conectará automaticamente ao banco de dados PostgreSQL que você configurou.

## Como Hospedar no Netlify/Vercel (Apenas Frontend)

Netlify e Vercel são excelentes para hospedar frontends estáticos. No entanto, como seu projeto tem um backend Flask, você teria que separar o frontend do backend e hospedar o backend em outro lugar (como o Render ou uma VM).

### Passos (Simplificados para Frontend Estático):

1.  **Separe o Frontend**: Mova a pasta `src/static` para a raiz do seu projeto ou para um repositório Git separado.
2.  **Deploy no Netlify/Vercel**: Conecte seu repositório Git (contendo apenas o frontend) à plataforma e configure o diretório de build (que seria a pasta `static`).
3.  **Configure a API**: Você precisaria configurar o frontend para apontar para a URL pública do seu backend Flask (hospedado em outro lugar).

**Conclusão**: Para este projeto específico com backend Flask e banco de dados, o Render é a opção mais direta e recomendada. Netlify/Vercel seriam mais adequados se o seu backend fosse reescrito como funções serverless ou se você tivesse uma arquitetura de microserviços mais complexa.

