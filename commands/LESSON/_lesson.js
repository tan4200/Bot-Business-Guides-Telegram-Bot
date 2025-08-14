/*CMD
  command: /lesson
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

const escapeHTML = (t) => {
  t = t == null ? '' : String(t);
  return t
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

if (!params) return;

const [lessonIndexStr, stepIndexStr] = params.split(" ");
const lessonIndex = parseInt(lessonIndexStr) || 1;
const stepIndex = parseInt(stepIndexStr ?? -1);

const sheetData = Bot.getProperty("Sheet_" + systemLang) || {};
const sheetDetails = Bot.getProperty("sheetDetails") || {};
const totalLessons = parseInt(sheetDetails.lesson_sheet_size) || 0;

const lessons = Array.isArray(sheetData.lessons) ? sheetData.lessons : [];
const lessonLangData = lessons[Math.max(0, lessonIndex - 1)];
if (!lessonLangData) return;

const lesson = lessonLangData;
const steps = Array.isArray(lesson.steps) ? lesson.steps : [];
const totalSteps = steps.length;
const step = steps[stepIndex];
const isValidStep = step !== undefined;
const isLastStep = stepIndex === totalSteps - 1;
const isFirstStep = stepIndex <= 0;
const isLastLesson = lessonIndex >= totalLessons;

const editMessage = (text, keyboard = [], extra = {}) => {
  const existingMarkup = extra.reply_markup?.inline_keyboard || [];
  extra.reply_markup = { inline_keyboard: [...existingMarkup, ...keyboard] };

  const method = (request?.message?.entities?.length > 0 || !!request?.message?.text)
    ? "editMessageText"
    : "sendMessage";

  Api[method]({
    message_id: request?.message?.message_id,
    text,
    parse_mode: "HTML", // switched to HTML
    ...extra
  });
};

if (isValidStep) {
  const stepHeader = {
    en: `${escapeHTML(lesson.lesson)} : <b>Step</b> <b>${stepIndex + 1}</b> <b>of</b> <b>${totalSteps}</b>`,
    ru: `${escapeHTML(lesson.lesson)} : <b>Шаг</b> <b>${stepIndex + 1}</b> <b>из</b> <b>${totalSteps}</b>`
  }[systemLang];

  const stepText = `${stepHeader}\n\n${escapeHTML(step.text)}`;

  const navButtons = [];
  if (step.video) {
    navButtons.push({
      text: systemLang === "ru" ? "Смотреть видео" : "See Video",
      url: step.video
    });
  }
  if (!isFirstStep) {
    navButtons.push({
      text: systemLang === "ru" ? "Назад" : "Previous",
      callback_data: `/lesson ${lessonIndex} ${stepIndex - 1}`
    });
  }

  const completed = new Set(userStats.lesson.lesson_id);
  if (isLastStep && !completed.has(lessonIndex)) {
    userStats.lesson.total_taken += 1;
    userStats.lesson.lesson_id.push(lessonIndex);
  }
  User.setProperty("userStats", userStats, "json");

  if (!isLastStep) {
    navButtons.push({
      text: systemLang === "ru" ? "Далее" : "Next",
      callback_data: `/lesson ${lessonIndex} ${stepIndex + 1}`
    });
  } else if (!isLastLesson) {
    navButtons.push({
      text: systemLang === "ru" ? "Следующий урок" : "Next Lesson",
      callback_data: `/lesson ${lessonIndex + 1}`
    });
  }

  const keyboard = [];
  if (navButtons.length > 0) keyboard.push(navButtons);

  const hasQuiz = Array.isArray(sheetData.quizzes)
    && sheetData.quizzes.some(q => q.lesson_id === "L" + lessonIndex);

  if (lessonLangData.help) {
    keyboard.push([{ text: "Help", url: lessonLangData.help }]);
  }
  if (isLastStep && hasQuiz) {
    keyboard.push([{
      text: systemLang === "ru" ? "Пройти викторину" : "Quiz me",
      callback_data: `/quiz ${lessonIndex} 0 0`
    }]);
  }

  keyboard.push([{
    text: systemLang === "ru" ? "Назад к урокам" : " Back to Lessons",
    callback_data: `/lessons byLesson`
  }]);

  let extraOptions = {};
  if (step.photo) extraOptions.link_preview_options = { url: step.photo };
  try {
    const parsedExtra = typeof step?.extra === "string" ? JSON.parse(step.extra) : (step?.extra || {});
    extraOptions = { ...extraOptions, ...parsedExtra };
  } catch (e) { }

  editMessage(stepText, keyboard, extraOptions);
  return;
}

const introText = {
  en: `Lesson ${escapeHTML(lesson.id)} <b>${escapeHTML(lesson.lesson)}</b>\n\n${escapeHTML(lesson.description)}\n\n<b>${totalSteps}</b> steps available, click below to get started.`,
  ru: `Урок ${escapeHTML(lesson.id)} <b>${escapeHTML(lesson.lesson)}</b>\n\n${escapeHTML(lesson.description)}\n\n<b>${totalSteps}</b> шагов доступно, нажмите ниже, чтобы начать.`
}[systemLang];

editMessage(
  introText,
  [
    [{ text: systemLang === "ru" ? "Начать" : "Start", callback_data: `/lesson ${lessonIndex} 0` }],
    [{ text: systemLang === "ru" ? " Назад к урокам" : " Back to Lessons", callback_data: `/lessons byLesson` }]
  ],
  { link_preview_options: { is_disabled: false } }
);
