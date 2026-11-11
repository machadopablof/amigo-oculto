/**
 * Monta o Google Forms do amigo oculto e vincula à planilha.
 *
 * Como usar (uma vez só):
 * 1. Abra a planilha → Extensões → Apps Script.
 * 2. Apague o que estiver no editor, cole este arquivo inteiro e salve.
 * 3. Escolha a função criarFormulario e clique em Executar. Autorize quando o Google pedir.
 *
 * O script:
 * - usa o formulário de FORM_ID (ou cria um novo, se FORM_ID estiver vazio), apaga as
 *   perguntas que houver nele e coloca o campo Nome (lista com os nomes da aba Presentes)
 *   e 3 pares Presente/Link;
 * - envia as respostas para esta planilha, numa aba chamada "Respostas";
 * - grava na aba "Config" o link do formulário e o link pré-preenchido, que o site usa.
 *
 * Rodar de novo refaz as perguntas do mesmo formulário (as respostas continuam na planilha).
 * Para incluir alguém novo, adicione o nome na aba Presentes e rode atualizarNomes.
 */

// Formulário que você criou. Deixe vazio ('') para o script criar um novo.
const FORM_ID = '1BcN92igTrtI7cQS_vjzlnN68iDQsAvYKVNavwo_jNCU';

const ABA_PARTICIPANTES = 'Presentes';
const ABA_RESPOSTAS = 'Respostas';
const ABA_CONFIG = 'Config';
const QTD_PRESENTES = 3;

function criarFormulario() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nomes = lerNomes_(ss);
  if (!nomes.length) throw new Error('Nenhum nome na aba ' + ABA_PARTICIPANTES + '.');

  const form = FORM_ID ? FormApp.openById(FORM_ID) : FormApp.create('x');
  form.getItems().forEach(function (it) { form.deleteItem(it); });
  form.setTitle('Amigo oculto de Natal: minhas sugestões');
  form.setDescription(
    'Escolha seu nome e deixe suas sugestões de presente. ' +
    'Quer adicionar mais? É só enviar o formulário de novo.'
  );
  form.setConfirmationMessage('Pronto! Suas sugestões já vão aparecer no site em até 1 minuto. 🎄');
  form.setAllowResponseEdits(true);

  const campoNome = form.addListItem()
    .setTitle('Nome')
    .setChoiceValues(nomes)
    .setRequired(true);

  for (let i = 1; i <= QTD_PRESENTES; i++) {
    form.addTextItem()
      .setTitle('Presente ' + i)
      .setHelpText(i === 1 ? 'Ex.: Camiseta Nike · Tamanho G' : '')
      .setRequired(i === 1);
    form.addTextItem()
      .setTitle('Link ' + i)
      .setHelpText('Cole o link do produto (opcional)');
  }

  let jaVinculado = false;
  try { jaVinculado = form.getDestinationId() === ss.getId(); } catch (e) {}
  if (!jaVinculado) {
    try { form.removeDestination(); } catch (e) {}
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  }
  form.setAcceptingResponses(true);
  SpreadsheetApp.flush();
  Utilities.sleep(3000);

  // Acha a aba que o Forms acabou de criar e dá um nome fixo para o site encontrar.
  const ssAtual = SpreadsheetApp.openById(ss.getId());
  const abaForm = ssAtual.getSheets().find(function (s) {
    const url = s.getFormUrl();
    if (!url) return false;
    if (url.indexOf(form.getId()) !== -1) return true;
    try { return FormApp.openByUrl(url).getId() === form.getId(); } catch (e) { return false; }
  });
  let abaRespostas = ABA_RESPOSTAS;
  if (abaForm) {
    const antiga = ssAtual.getSheetByName(ABA_RESPOSTAS);
    if (antiga && antiga.getSheetId() !== abaForm.getSheetId()) {
      antiga.setName(ABA_RESPOSTAS + ' (antiga ' + Date.now() + ')');
    }
    abaForm.setName(ABA_RESPOSTAS);
    abaForm.setFrozenRows(1);
    abaForm.getRange(1, 1, 1, abaForm.getLastColumn())
      .setFontWeight('bold').setBackground('#b3243b').setFontColor('#ffffff');
  } else {
    abaRespostas = 'Respostas ao formulário 1';
  }

  const linkForm = form.getPublishedUrl();
  const linkPreenchido = form.createResponse()
    .withItemResponse(campoNome.createResponse(nomes[0]))
    .toPrefilledUrl()
    .replace(/(entry\.\d+=)[^&]*/, '$1NOME');

  gravarConfig_(ssAtual, [
    ['form_url', linkForm],
    ['prefill_url', linkPreenchido],
    ['responses_tab', abaRespostas],
    ['form_edit_url', form.getEditUrl()]
  ]);

  Logger.log('Formulário para enviar ao grupo: ' + linkForm);
  Logger.log('Editar o formulário: ' + form.getEditUrl());
  SpreadsheetApp.getUi().alert(
    'Formulário pronto e vinculado à planilha!\n\nLink para o grupo:\n' + linkForm +
    '\n\nO link também ficou na aba "' + ABA_CONFIG + '".'
  );
}

/** Atualiza a lista de nomes do formulário com os nomes da aba Presentes. */
function atualizarNomes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const config = lerConfig_(ss);
  if (!config.form_edit_url) throw new Error('Rode criarFormulario primeiro.');
  const form = FormApp.openByUrl(config.form_edit_url);
  const campo = form.getItems(FormApp.ItemType.LIST)
    .find(function (it) { return it.getTitle() === 'Nome'; });
  campo.asListItem().setChoiceValues(lerNomes_(ss));
  SpreadsheetApp.getUi().alert('Nomes atualizados no formulário.');
}

function lerNomes_(ss) {
  const aba = ss.getSheetByName(ABA_PARTICIPANTES);
  if (!aba || aba.getLastRow() < 2) return [];
  const vistos = {};
  return aba.getRange(2, 1, aba.getLastRow() - 1, 1).getValues()
    .map(function (r) { return String(r[0]).trim(); })
    .filter(function (n) {
      const k = n.toLowerCase();
      if (!n || vistos[k]) return false;
      vistos[k] = true;
      return true;
    });
}

function gravarConfig_(ss, linhas) {
  let aba = ss.getSheetByName(ABA_CONFIG);
  if (!aba) aba = ss.insertSheet(ABA_CONFIG);
  aba.clear();
  aba.getRange(1, 1, 1, 2).setValues([['Configuração', 'Valor']]).setFontWeight('bold');
  aba.getRange(2, 1, linhas.length, 2).setValues(linhas);
  aba.setColumnWidth(1, 160);
  aba.setColumnWidth(2, 600);
}

function lerConfig_(ss) {
  const aba = ss.getSheetByName(ABA_CONFIG);
  const out = {};
  if (!aba) return out;
  aba.getDataRange().getValues().forEach(function (r) { out[String(r[0])] = String(r[1]); });
  return out;
}
