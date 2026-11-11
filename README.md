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

## Google Forms

O formulário é criado pelo script `criar-formulario.gs`, rodado uma vez dentro da planilha:

1. Planilha → **Extensões → Apps Script**.
2. Apague o conteúdo do editor, cole o `criar-formulario.gs` inteiro e salve.
3. Escolha a função `criarFormulario` → **Executar** → autorize.

O script usa o formulário de `FORM_ID` (ou cria um, se estiver vazio): coloca Nome em lista + 3 pares Presente/Link), vincula as respostas à aba
`Respostas` e grava os links na aba `Config`. O site lê essa aba: o botão "Adicionar minhas
sugestões" abre o formulário, e cada pessoa ganha um botão "+ sugerir" com o nome já escolhido.

Para incluir um participante: adicione o nome na aba `Presentes` e rode `atualizarNomes`.
Para corrigir ou apagar uma sugestão enviada, edite a aba `Respostas`.
