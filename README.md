# amigo-oculto

Site da lista de presentes do amigo oculto de Natal. A lista é lida de uma planilha do Google
e o site se atualiza sozinho (a cada minuto, e sempre que a aba volta a ficar visível).

## Planilha

https://docs.google.com/spreadsheets/d/1X9mC3HA2twC6HrUx4U5Kei5QBo5o0_qY4nrX5s87qUM/edit

| Nome | Presente | Link | Loja |
|------|----------|------|------|
| Pablo | Faca Churrasco Artesanal | https://br.shp.ee/... | Shopee |

- Uma linha por presente; repita o nome para adicionar mais de um.
- Uma linha só com o nome mostra a pessoa como "Ainda sem sugestões".
- "Loja" é opcional: se ficar vazia, o site descobre pelo link.

A planilha precisa estar em **Compartilhar → Acesso geral → Qualquer pessoa com o link**
(como **Editor**, para que cada participante possa adicionar as próprias sugestões).

Para usar outra planilha, troque `SHEET_ID` no `index.html`.

## Publicar

GitHub → Settings → Pages → Deploy from a branch → escolha a branch e a pasta `/ (root)`.

## Google Forms (opcional)

1. Crie um formulário com as perguntas **Nome** (lista suspensa com os participantes),
   **Presente 1**, **Link 1**, **Presente 2**, **Link 2**... (resposta curta; só o Nome obrigatório).
2. Em **Respostas → Vincular ao Planilhas → Selecionar planilha existente**, escolha esta planilha.
   O Forms cria a aba `Respostas ao formulário 1`, que o site também lê.
3. No `index.html`, preencha `FORM_URL` com o link do formulário. Para um botão "+ sugerir"
   em cada pessoa, gere um link pré-preenchido com `NOME` no campo Nome e cole em `FORM_PREFILL_URL`.

Para corrigir ou apagar uma sugestão enviada pelo formulário, edite a aba de respostas na planilha.
