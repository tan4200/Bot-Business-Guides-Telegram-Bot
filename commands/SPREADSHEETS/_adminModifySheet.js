/*CMD
  command: /adminModifySheet
  help: 
  need_reply: false
  auto_retry_time: 
  folder: SPREADSHEETS

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

if (!isAdmin(user.telegramid)) return;

function clearLessonsProperty(lessonSize) {
  for (let i = 0; i < lessonSize; i++) {
    Bot.setProperty("lesson" + i, null);
  }
}

let sheetDetails = Bot.getProperty("sheetDetails") || {};
const currentSheetLink = sheetDetails.sheet_link || "Empty";
const method = "sendMessage";

const option_1 = {
  en: {
    text: `<b>Current Sheet is Linked to</b> <code>${currentSheetLink}</code>.\n\nUse <code>/adminModifySheet {Sheet_Link}</code> to update your sheet.\n\nYour sheet must have exactly 3 tabs in the following order: <b>Lessons</b>, <b>Quizzes</b>, and <b>Meta</b>.`,
    parse_mode: "html"
  },
  ru: {
    text: `<b>Текущий лист привязан к</b> <code>${currentSheetLink}</code>.\n\nИспользуйте <code>/adminModifySheet {Ссылка}</code>, чтобы обновить свой лист.\n\nВаш лист должен содержать ровно 3 вкладки в следующем порядке: <b>Lessons</b>, <b>Quizzes</b> и <b>Meta</b>.`,
    parse_mode: "html"
  }
};

const option_2 = {
  en: {
    text: "<b>Please wait</b> updating sheets..\nIt can be extremely slow.\nThe system will automatically retry on an error. If the process takes more than 5 minutes, retry manually.",
    parse_mode: "html"
  },
  ru: {
    text: "<b>Пожалуйста, подождите</b> обновление листов...\nСистема автоматически повторит попытку в случае ошибки. Если это займёт больше 5 минут, попробуйте повторить вручную.",
    parse_mode: "html"
  }
};

if (!params) {
  Api[method](option_1[systemLang]);
  return;
}

const providedSheetLink = params.trim();
options = { ...options, providedSheetLink, languageSupportAvailable };

function GACode() {

  // Normalize language codes to ISO-639-1
  // just in case
  function normalizeLangCode(code) {
    const map = {
      rus: "ru", eng: "en", spa: "es", fra: "fr", deu: "de",
      hin: "hi", ara: "ar", jpn: "ja", kor: "ko", chi: "zh"
    };
    return map[(code || "").toLowerCase()] || (code || "en").toLowerCase();
  }

  
  const translateCache = Object.create(null);
  function cachedTranslate(text, fromLang, toLang) {
    if (!text || !text.trim()) return text;
    const f = fromLang || "auto";
    const t = toLang;
    if (!translateCache[f]) translateCache[f] = Object.create(null);
    if (!translateCache[f][t]) translateCache[f][t] = Object.create(null);
    const bucket = translateCache[f][t];
    if (bucket[text] != null) return bucket[text];
    const out = LanguageApp.translate(text, f, t);
    bucket[text] = out;
    return out;
  }

  const ss = SpreadsheetApp.openByUrl(options.providedSheetLink);

  const lessonsSheet = ss.getSheets()[0];
  const quizzesSheet = ss.getSheets()[1];
  const metaSheet    = ss.getSheets()[2];

  const lessonsData = lessonsSheet.getDataRange().getValues();
  const quizzesData = quizzesSheet.getDataRange().getValues();
  const metaData    = metaSheet.getDataRange().getValues();

  const lessonsHeaders = lessonsData[0].map(h => String(h).trim().toLowerCase());
  const quizzesHeaders = quizzesData[0].map(h => String(h).trim().toLowerCase());

  const lessons = [];
  const quizzes = [];
  const lessonMap = {};

  let lastId = "", lastLesson = "", lastDescription = "", lastYoutube = "", lastHelp = "";

  // ---- Process lessons (single pass) ----
  for (let i = 1; i < lessonsData.length; i++) {
    const row = lessonsData[i];
    const rowData = {};
    for (let j = 0; j < lessonsHeaders.length; j++) {
      rowData[lessonsHeaders[j]] = row[j];
    }

    const id = rowData["id"] || lastId;
    if (!id) continue;

    if (rowData["id"]) lastId = rowData["id"];
    if (rowData["lesson"]) lastLesson = rowData["lesson"];
    if (rowData["description"]) lastDescription = rowData["description"];
    if (rowData["youtube video"]) lastYoutube = rowData["youtube video"];
    if (rowData["help"]) lastHelp = rowData["help"];

    if (!lessonMap[id]) {
      lessonMap[id] = {
        id: id,
        lesson: lastLesson,
        description: lastDescription || "",
        youtube: lastYoutube || "",
        help: lastHelp || "",
        steps: []
      };
      lessons.push(lessonMap[id]);
    }

    const stepNumber = parseInt(rowData["step"], 10);
    const stepText  = String(rowData["text"] || "").trim();
    const stepPhoto = String(rowData["photo"] || "").trim();
    const stepVideo = String(rowData["youtube video"] || "").trim();
    const stepExtra = String(rowData["extra"] || "").trim();

    if (stepPhoto && stepPhoto.length > 200)
      return JSON.stringify({ error: true, result: "Photo URL exceeds 200 characters." });
    if (stepVideo && stepVideo.length > 200)
      return JSON.stringify({ error: true, result: "Video URL exceeds 200 characters." });

    if ((stepPhoto || stepVideo) && stepText.length > 1024)
      return JSON.stringify({ error: true, result: "Step text exceeds Telegram caption limit (1024 characters)." });
    if (!stepPhoto && !stepVideo && stepText.length > 4096)
      return JSON.stringify({ error: true, result: "Step text exceeds Telegram message limit (4096 characters)." });

    if (!isNaN(stepNumber) && stepText) {
      lessonMap[id].steps.push({
        step: stepNumber,
        text: stepText,
        photo: stepPhoto,
        video: stepVideo,
        extra: stepExtra || {}
      });
    }
  }


  for (let k = 0; k < lessons.length; k++) {
    lessons[k].steps.sort((a, b) => a.step - b.step);
  }


  for (let i = 1; i < quizzesData.length; i++) {
    const row = quizzesData[i];
    const quiz = {};
    for (let j = 0; j < quizzesHeaders.length; j++) {
      quiz[quizzesHeaders[j]] = row[j];
    }

    if (quiz.id && quiz.lesson_id && quiz.question && quiz.answers && quiz.correct_index !== undefined) {
      const answersArr = String(quiz.answers)
        .split(/\n?\d+\.\s/)
        .map(ans => ans.trim())
        .filter(Boolean);

      quizzes.push({
        id: quiz.id,
        lesson_id: quiz.lesson_id,
        question: String(quiz.question).trim(),
        answers: answersArr,
        correct_index: parseInt(quiz.correct_index, 10)
      });
    }
  }


  const meta = {};
  for (let i = 0; i < metaData.length; i++) {
    const row = metaData[i];
    const key = row[0];
    const value = row[1];
    if (key != null) meta[key] = value;
  }


  let expectation_keys = ["id", "lesson_id"]; 

function deepTranslate(obj, fromLang, toLang) {
  if (Array.isArray(obj)) {
    return obj.map(item => deepTranslate(item, fromLang, toLang));
  }
  
  if (obj && typeof obj === "object") {
    const out = {};
    for (const k in obj) {
      if (k === "meta" || expectation_keys.includes(k)) {

        out[k] = obj[k];
      } else {
        out[k] = deepTranslate(obj[k], fromLang, toLang);
      }
    }
    return out;
  }
  
  if (typeof obj === "string") {
    const s = obj.trim();
    if (!s) return obj;
    return cachedTranslate(s, fromLang || "auto", toLang);
  }
  
  return obj;
}

  const baseLang = normalizeLangCode(meta.lang || "en");
  const baseData = { lessons: lessons, quizzes: quizzes, meta: meta };
  const resultObj = {};
  resultObj[baseLang] = baseData;

  // Translate to the other languages (normalized), skipping base
  const targets = (options.languageSupportAvailable || [])
    .map(normalizeLangCode)
    .filter(function(l) { return l && l !== baseLang; });

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const translated = deepTranslate(baseData, baseLang, t);
    translated.meta = Object.assign({}, baseData.meta, { lang: t });
    resultObj[t] = translated;
  }

  return JSON.stringify(resultObj);
}

Bot.setProperty("sheetDetails", sheetDetails, "json");
Api[method](option_2[systemLang]);

Libs.GoogleApp.run({
  code: GACode,
  onRun: "/updateSheet",
  debug: false
});
