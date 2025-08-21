/*CMD
  command: /updateSheet
  help: 
  need_reply: false
  auto_retry_time: 1
  folder: SPREADSHEETS
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

let resultRoot = JSON.parse(JSON.parse(content).result)

if (!resultRoot) return;

let option_1 = {
  en: {text: "<b>Updated sheet in all languages.</b>",parse_mode: "html"},
  ru: {text: "<b>Обновленный лист на всех языках.</b>",parse_mode: "html"}
}
let method = "sendMessage"

if (resultRoot?.error && resultRoot.error === true) {
  Api.sendMessage({ text: resultRoot.error.result });
  return;
}


Object.keys(resultRoot).forEach(key => {
  Bot.setProperty("Sheet_" + key, JSON.stringify(resultRoot[key]), "json");
});

Api[method](option_1[systemLang])


  let sheetDetails = Bot.getProperty("sheetDetails",{})
let systemLangResultRoot = resultRoot[systemLang]
sheetDetails.lesson_sheet_size = systemLangResultRoot.lessons.length
sheetDetails.quiz_sheet_size = systemLangResultRoot.quizzes.length
Bot.setProperty("sheetDetails",sheetDetails,"json")
