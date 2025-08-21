/*CMD
  command: /quiz
  help: 
  need_reply: false
  auto_retry_time: 
  folder: QUIZ
  answer: 
  keyboard: 
  aliases: 
  group: 
CMD*/

const [lessonIdStr, quizIndexStr, correctCountStr] = params.split(" ")
const lessonId = parseInt(lessonIdStr)
const quizIndex = parseInt(quizIndexStr || 0)
const correctCount = parseInt(correctCountStr || 0)
const currentQuizSteak = User.getProperty("currentQuizSteak", 0)

const sheetData = Bot.getProperty("Sheet_" + systemLang)
const lessonLangData = sheetData.lessons[Math.floor(lessonId - 1)]
if (!lessonLangData) return


const lessonQuizzes = sheetData?.quizzes?.filter(
  quiz => quiz.lesson_id === "L" + lessonId
) || []


if (!lessonQuizzes.length || !lessonQuizzes[quizIndex]) return

if ((userStats.quiz?.quiz_id || []).includes(lessonId)) {
  Api.answerCallbackQuery({
    callback_query_id: request.id,
    text:
      systemLang === "ru"
        ? "Вы уже проходили этот тест."
        : "You've already taken this quiz once.",
    show_alert: false
  })
  return
}

const currentQuiz = lessonQuizzes[quizIndex]
if (!currentQuiz) return

const langText = {
  en: {
    title: `Lesson ${lessonId} — Quiz Question ${quizIndex + 1}`,
    instruction:
      "Please choose the correct answer from the options below. Read the question carefully before selecting. Your response will be evaluated instantly.",
    progress: `Progress: Question ${quizIndex + 1} of ${lessonQuizzes.length}`
  },
  ru: {
    title: `Урок ${lessonId} — Вопрос викторины ${quizIndex + 1}`,
    instruction:
      "Пожалуйста, выберите правильный ответ из вариантов ниже. Внимательно прочитайте вопрос перед выбором. Ваш ответ будет оценен мгновенно.",
    progress: `Прогресс: Вопрос ${quizIndex + 1} из ${lessonQuizzes.length}`
  }
}[systemLang]

const reply_markup_ = {
  inline_keyboard: currentQuiz.answers.map((answer, index) => [
    {
      text: answer,
      callback_data: `/checkAnswer ${lessonId} ${quizIndex} ${index} ${correctCount}`
    }
  ])
}

Api.editMessageText({
  message_id: request.message.message_id,
  text: `*${langText.title}*\n\n${currentQuiz.question}\n\n${langText.instruction}\n\n*${langText.progress}*`,
  parse_mode: "Markdown",
  reply_markup: reply_markup_
})
