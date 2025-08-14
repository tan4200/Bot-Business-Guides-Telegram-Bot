/*CMD
  command: /checkAnswer
  help: 
  need_reply: false
  auto_retry_time: 
  folder: QUIZ

  <<ANSWER

  ANSWER

  <<KEYBOARD

  KEYBOARD
  aliases: 
  group: 
CMD*/

const [
  lessonIdStr,
  quizIndexStr,
  selectedIndexStr,
  correctCountStr
] = params.split(" ");

const lessonId = parseInt(lessonIdStr);
const quizIndex = parseInt(quizIndexStr);
const selectedIndex = parseInt(selectedIndexStr);
let correctCount = parseInt(correctCountStr);
let currentQuizSteak = User.getProperty("currentQuizSteak", 0);

const steakDialogue = {
  en: {
    2: ["You're doing good", "Keep it up", "Nice answers"],
    3: ["You're on a roll!", "Great consistency!", "Impressive streak!"],
    4: ["Amazing! Four in a row!", "You're crushing it!", "Fantastic work!"],
    5: ["🔥 You're unstoppable!", "Master level focus!", "Legendary streak!"]
  },
  ru: {
    2: ["Ты молодец", "Так держать", "Хорошие ответы"],
    3: ["Ты в ударе!", "Отличная стабильность!", "Впечатляющая серия!"],
    4: ["Потрясающе! Четыре подряд!", "Ты разрываешь!", "Фантастическая работа!"],
    5: ["🔥 Тебя не остановить!", "Фокус на уровне мастера!", "Легендарная серия!"]
  }
};

const sheetDetails = Bot.getProperty("sheetDetails") || {};
const totalLessons = parseInt(sheetDetails.lesson_sheet_size) || 0;

const sheetData = Bot.getProperty("Sheet_" + systemLang);
if (!sheetData || !sheetData.lessons) return;

function addPointForQuiz(value) {
  if (isNaN(value)) return;

  currentQuizSteak += 1;
  const earnedPoints = Math.max(1, currentQuizSteak * value);

  const dialogues = steakDialogue[systemLang]?.[currentQuizSteak] || [];
  const randomText = dialogues.length > 0
    ? dialogues[Math.floor(Math.random() * dialogues.length)]
    : "";

  let message = systemLang === "ru"
    ? `*Очки получены* +${earnedPoints}`
    : `*Points earned* +${earnedPoints}`;

  if (currentQuizSteak > 1) {
    message = (systemLang === "ru"
      ? `*🔥 Серия* ${currentQuizSteak}\n`
      : `*🔥 Streak* ${currentQuizSteak}\n`) + message;
  }

  if (randomText) {
    message += `\n –_${randomText}_`;
  }

  Api.sendMessage({ text: message, parse_mode: "Markdown" });
  addUserPoints(earnedPoints);
  User.setProperty("currentQuizSteak", currentQuizSteak, "integer");
}


let lessonLangData = sheetData.lessons[lessonId - 1];
if (!lessonLangData) return;


const lessonQuizzes = (sheetData.quizzes || []).filter(
  quiz => quiz.lesson_id === "L" + lessonId
);
if (!lessonQuizzes.length || !lessonQuizzes[quizIndex]) return;

const currentQuiz = lessonQuizzes[quizIndex];

// Check answer
const isCorrect = selectedIndex === currentQuiz.correct_index - 1;
if (isCorrect) {
  correctCount += 1;
  addPointForQuiz(1);
} else {
  currentQuizSteak = 0;
  User.setProperty("currentQuizSteak", 0, "integer");
}

Api.answerCallbackQuery({
  callback_query_id: request.id,
  text: isCorrect
    ? (systemLang === "ru" ? "Верно!" : "Correct!")
    : (systemLang === "ru" ? "Неправильно" : "Wrong Answer"),
  show_alert: false
});


if (lessonQuizzes[quizIndex + 1]) {
  Bot.run({
    command: `/quiz ${lessonId} ${quizIndex + 1} ${correctCount}`
  });
} else {
  // End of lesson quiz
  const totalQuizzes = lessonQuizzes.length;

  user.userStats.quiz.total_taken += 1;
  user.userStats.quiz.correct_answers += correctCount;
  user.userStats.quiz.wrong_answers += totalQuizzes - correctCount;
  user.userStats.quiz.quiz_id.push(lessonId);
  User.setProperty("userStats", user.userStats, "json");
  User.setProperty("currentQuizSteak",0,"integer")

  const completionText = {
    en: {
      completed: "*Quiz Completed!*",
      success: `You have successfully completed the quiz for Lesson ${lessonId}.`,
      score: `*Your Score:* ${correctCount} / ${totalQuizzes}`,
      proceed: "Great job! You can proceed to the next lesson to continue learning.",
      nextLesson: "Next Lesson",
      finalComplete: `You have completed the final quiz of Lesson ${lessonId}.`,
      finalCongrats:
        "Congratulations on completing all lessons and quizzes!\nYou can check your overall progress using /stats."
    },
    ru: {
      completed: "*Викторина завершена!*",
      success: `Вы успешно завершили викторину по уроку ${lessonId}.`,
      score: `*Ваш результат:* ${correctCount} / ${totalQuizzes}`,
      proceed: "Отличная работа! Вы можете перейти к следующему уроку для продолжения обучения.",
      nextLesson: "Следующий урок",
      finalComplete: `Вы завершили последнюю викторину урока ${lessonId}.`,
      finalCongrats:
        "Поздравляем с завершением всех уроков и викторин!\nВы можете проверить свой общий прогресс, используя /stats."
    }
  }[systemLang];

  if (lessonId + 1 <= totalLessons) {
    Api.editMessageText({
      message_id: request.message.message_id,
      text: `${completionText.completed}\n\n${completionText.success}\n\n${completionText.score}\n\n${completionText.proceed}`,
      reply_markup: {
        inline_keyboard: [
          [{ text: completionText.nextLesson, callback_data: `/lesson ${lessonId + 1} 0` }]
        ]
      },
      parse_mode: "Markdown"
    });
  } else {
    Api.editMessageText({
      message_id: request.message.message_id,
      text: `${completionText.completed}\n\n${completionText.finalComplete}\n\n${completionText.score}\n\n${completionText.finalCongrats}`,
      parse_mode: "Markdown"
    });
  }
}
