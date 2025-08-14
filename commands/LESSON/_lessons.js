/*CMD
  command: /lessons
  help: 
  need_reply: false
  auto_retry_time: 
  folder: LESSON

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/


const sheetData = Bot.getProperty("Sheet_"+systemLang)
const sheetDetails = Bot.getProperty("sheetDetails")



const lessonLength = sheetDetails.lesson_sheet_size;
const userStatsLessonIndice = userStats.lesson.lesson_index;
  

const option_1 = {
  en: {
    text: "<b>No Lessons</b> available for now.",
    parse_mode: "html"
  },
  ru: {
    text: "<b>Нет доступных уроков.</b>",
    parse_mode: "html"
  }
};

const option_2 = {
  en: {
    text: "<b>Select from the following lessons</b> to continue your learning journey.\n\nEach lesson covers essential topics to help you progress step-by-step.\n\nClick on a lesson below to get started.",
    parse_mode: "html"
  },
  ru: {
    text: "<b>Выберите один из следующих уроков</b>, чтобы продолжить обучение.\n\nКаждый урок охватывает важные темы, которые помогут вам продвигаться шаг за шагом.\n\nНажмите на урок ниже, чтобы начать.",
    parse_mode: "html"
  }
};

const selectedOption_1 = option_1[systemLang];
const selectedOption_2 = option_2[systemLang];

if (!lessonLength) {
  if ( (request?.message?.entities?.length > 0 || !!request?.message?.text) && request?.data != "/lessons") {

    Api.editMessageText({
      message_id: request.message.message_id,
      ...selectedOption_1
    });
  } else {
    Api.sendMessage(selectedOption_1);
  }
  return;
}

const inline_keyboard = [];

for (let lesson_id = 1; lesson_id <= lessonLength; lesson_id++) {

let current_lesson_property = sheetData.lessons[Math.floor( lesson_id - 1)]


  if (!current_lesson_property) continue;

  const current_lesson_name = current_lesson_property.lesson
  const inline_txt = "Lesson " + lesson_id + " - " + current_lesson_name;

  inline_keyboard.push([
    { text: inline_txt, callback_data: "/lesson " + lesson_id }
  ]);
}

selectedOption_2.reply_markup = { inline_keyboard };

if ((request?.message?.entities?.length > 0 || !!request?.message?.text) && request?.data != "/lessons") {
// simply requested command, we assume it's not by inline and not edit we can simply give any params to bypass see /lesson command I put a dummy params see start command too you will understand 
  Api.editMessageText({
    message_id: request.message.message_id,
    ...selectedOption_2
  });
} else {
  Api.sendMessage(selectedOption_2);
}
