import React, { useState, useEffect } from 'react';
import { RefreshCw, Check, X, Trophy, Star, Zap, Target, Film, Play } from 'lucide-react';

const TRANSLATIONS = {
  "en-US": {
    "gameTitle": "Movie Quote Charades",
    "gameSubtitle": "Decode emoji clues to reveal iconic movie quotes",
    "playButton": "Play",
    "correctLabel": "Correct",
    "questionsLabel": "Questions",
    "accuracyLabel": "Accuracy",
    "comboLabel": "Combo",
    "resetButton": "Reset",
    "loadingMessage": "Loading next quote...",
    "questionPrompt": "What famous movie quote do these emojis represent?",
    "hintPrefix": "💡",
    "answerPlaceholder": "Enter the movie quote...",
    "submitButton": "Submit",
    "hintButton": "Hint",
    "yourAnswerLabel": "Your answer:",
    "movieLabel": "Movie:",
    "nextQuestionButton": "Next quote",
    "perfectFeedback": "Perfect!",
    "correctFeedback": "Correct!",
    "tryAgainFeedback": "Try again next time!",
    "pointsSuffix": "points",
    "claudePrompt": "Please respond in"
  },
  "es-ES": {
    "gameTitle": "Charadas de Citas de Películas",
    "gameSubtitle": "Decodifica pistas de emojis para revelar citas icónicas de películas",
    "playButton": "Jugar",
    "correctLabel": "Correctas",
    "questionsLabel": "Preguntas",
    "accuracyLabel": "Precisión",
    "comboLabel": "Combo",
    "resetButton": "Reiniciar",
    "loadingMessage": "Cargando siguiente cita...",
    "questionPrompt": "¿Qué cita famosa de película representan estos emojis?",
    "hintPrefix": "💡",
    "answerPlaceholder": "Ingresa la cita de la película...",
    "submitButton": "Enviar",
    "hintButton": "Pista",
    "yourAnswerLabel": "Tu respuesta:",
    "movieLabel": "Película:",
    "nextQuestionButton": "Siguiente cita",
    "perfectFeedback": "¡Perfecto!",
    "correctFeedback": "¡Correcto!",
    "tryAgainFeedback": "¡Inténtalo de nuevo la próxima vez!",
    "pointsSuffix": "puntos",
    "claudePrompt": "Por favor responde en idioma"
  }
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale) => {
  if (TRANSLATIONS[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key) => TRANSLATIONS[locale]?.[key] || TRANSLATIONS['en-US'][key] || key;

const MovieQuoteQuizGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userGuess, setUserGuess] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [usedQuotes, setUsedQuotes] = useState(new Set());
  const [feedback, setFeedback] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [comboMultiplier, setComboMultiplier] = useState(1);

  const generateNewQuestion = async () => {
    setIsLoading(true);
    setShowAnswer(false);
    setUserGuess('');
    setFeedback('');
    setShowHint(false);
    
    try {
      const usedQuotesArray = Array.from(usedQuotes);
      const excludeList = usedQuotesArray.length > 0 
        ? `\n\nDO NOT use any of these previously used quotes: ${usedQuotesArray.join('; ')}`
        : '';
      
      const genres = [
        'action blockbusters',
        'romantic comedies',
        'sci-fi classics',
        'superhero movies',
        'animated films',
        'thrillers',
        'adventure films',
        'dramas',
        'fantasy epics',
        'comedy classics'
      ];
      
      const eras = [
        '1970s-1980s classics',
        '1990s favorites', 
        '2000s hits',
        '2010s blockbusters',
        '2020s releases'
      ];
      
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      const randomEra = eras[Math.floor(Math.random() * eras.length)];
      const randomSeed = Math.floor(Math.random() * 10000);
      
      const prompt = `Generate a fun quiz question that converts a famous movie quote into emojis. 

Focus on: ${randomGenre} from ${randomEra}
Random seed: ${randomSeed}

Requirements:
- Choose an iconic, memorable quote from a well-known movie
- Convert it creatively into 3-8 emojis that represent the meaning or key words
- Make it challenging but solvable for movie fans
- Include popular mainstream movies that most people would recognize
- Be creative and vary your approach${excludeList}

Respond with a JSON object in this exact format:
{
  "quote": "the exact famous movie quote",
  "movie": "the movie title",
  "emojis": "the emoji representation",
  "hint": "a subtle hint about the movie or scene (not too obvious)"
}

Your entire response MUST be a single, valid JSON object. DO NOT include any other text.

${t('claudePrompt')} ${locale} language`;

      const response = await window.claude.complete(prompt);
      const questionData = JSON.parse(response);
      
      setCurrentQuestion(questionData);
      setUsedQuotes(prev => new Set([...prev, questionData.quote]));
      
    } catch (error) {
      console.error('Error generating question:', error);
      const fallbacks = [
        { 
          quote: "May the Force be with you", 
          movie: "Star Wars",
          emojis: "🌟💪🫵", 
          hint: "A galaxy far, far away" 
        },
        { 
          quote: "Here's looking at you, kid", 
          movie: "Casablanca",
          emojis: "👀👶", 
          hint: "Classic romance in Morocco" 
        },
        { 
          quote: "I'll be back", 
          movie: "The Terminator",
          emojis: "🤖🔙", 
          hint: "Cyborg from the future" 
        },
        { 
          quote: "You can't handle the truth", 
          movie: "A Few Good Men",
          emojis: "🚫🤲💡", 
          hint: "Military courtroom drama" 
        }
      ];
      const randomFallback = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setCurrentQuestion(randomFallback);
    }
    
    setIsLoading(false);
  };

  const checkAnswer = () => {
    if (!currentQuestion || !userGuess.trim()) return;
    
    const userAnswer = userGuess.toLowerCase().trim();
    const correctAnswer = currentQuestion.quote.toLowerCase();
    
    const normalizeAnswer = (text) => {
      return text.replace(/[^\w\s]/g, '')
                 .replace(/\b(a|an|the|is|are|was|were|i|you|me|my)\b/g, '')
                 .replace(/\s+/g, ' ')
                 .trim();
    };
    
    const normalizedUser = normalizeAnswer(userAnswer);
    const normalizedCorrect = normalizeAnswer(correctAnswer);
    
    const isExactMatch = userAnswer === correctAnswer;
    const isCloseMatch = normalizedUser === normalizedCorrect ||
                        normalizedCorrect.includes(normalizedUser) ||
                        normalizedUser.includes(normalizedCorrect) ||
                        normalizedUser.split(' ').filter(word => 
                          normalizedCorrect.includes(word) && word.length > 2
                        ).length >= Math.ceil(normalizedCorrect.split(' ').length * 0.6);
    
    setShowAnswer(true);
    setTotalQuestions(prev => prev + 1);
    
    if (isExactMatch || isCloseMatch) {
      const newStreak = streak + 1;
      const points = comboMultiplier;
      
      setScore(prev => prev + points);
      setStreak(newStreak);
      setBestStreak(prev => Math.max(prev, newStreak));
      
      if (newStreak >= 5) setComboMultiplier(3);
      else if (newStreak >= 3) setComboMultiplier(2);
      
      if (isExactMatch) {
        setFeedback(`${t('perfectFeedback')} +${points} ${t('pointsSuffix')}`);
      } else {
        setFeedback(`${t('correctFeedback')} +${points} ${t('pointsSuffix')}`);
      }
    } else {
      setStreak(0);
      setComboMultiplier(1);
      setFeedback(t('tryAgainFeedback'));
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTotalQuestions(0);
    setUsedQuotes(new Set());
    setStreak(0);
    setBestStreak(0);
    setComboMultiplier(1);
    generateNewQuestion();
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentQuestion(null);
    setUserGuess('');
    setShowAnswer(false);
    setScore(0);
    setTotalQuestions(0);
    setUsedQuotes(new Set());
    setFeedback('');
    setShowHint(false);
    setStreak(0);
    setBestStreak(0);
    setComboMultiplier(1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !showAnswer && userGuess.trim()) {
      checkAnswer();
    }
  };

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
          <div className="text-5xl mb-8">🎬🍿</div>
          <h1 className="text-6xl font-bold text-white mb-8">
            {t('gameTitle')}
          </h1>
          <p className="text-2xl text-purple-200 mb-16">
            {t('gameSubtitle')}
          </p>
          
          <button
            onClick={startGame}
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-12 py-6 rounded-2xl font-semibold text-2xl transition-colors flex items-center gap-4 mx-auto border border-yellow-500 shadow-lg"
          >
            <Film size={28} />
            {t('playButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 mb-8 shadow-lg border border-white/20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-8">
              <div>
                <div className="text-3xl font-bold text-white">{score}</div>
                <div className="text-base text-purple-200">{t('correctLabel')}</div>
              </div>
              
              <div>
                <div className="text-3xl font-bold text-white">{totalQuestions}</div>
                <div className="text-base text-purple-200">{t('questionsLabel')}</div>
              </div>
              
              {totalQuestions > 0 && (
                <div>
                  <div className="text-3xl font-bold text-white">
                    {Math.round((score/totalQuestions) * 100)}%
                  </div>
                  <div className="text-base text-purple-200">{t('accuracyLabel')}</div>
                </div>
              )}
              
              {comboMultiplier > 1 && (
                <div className="bg-yellow-400 rounded-lg p-3 border border-yellow-500 shadow-lg">
                  <div className="text-xl font-bold text-gray-900">×{comboMultiplier}</div>
                  <div className="text-sm text-gray-700">{t('comboLabel')}</div>
                </div>
              )}
            </div>
            
            <button
              onClick={resetGame}
              className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition-colors border border-white/30 text-lg backdrop-blur-sm"
            >
              {t('resetButton')}
            </button>
          </div>
        </div>

        {/* Game Area */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-12 shadow-lg border border-white/20">
          {isLoading ? (
            <div className="text-center py-16">
              <RefreshCw className="animate-spin mx-auto mb-6 text-purple-300" size={40} />
              <p className="text-xl text-purple-200">{t('loadingMessage')}</p>
            </div>
          ) : currentQuestion ? (
            <>
              <div className="text-center mb-12">
                <h2 className="text-2xl text-white mb-10">
                  {t('questionPrompt')}
                </h2>
                <div className="text-8xl p-10 bg-white/5 rounded-xl border border-white/20 backdrop-blur-sm">
                  {currentQuestion.emojis}
                  
                  {showHint && currentQuestion.hint && (
                    <div className="text-lg text-purple-200 mt-6">
                      {t('hintPrefix')} {currentQuestion.hint}
                    </div>
                  )}
                </div>
              </div>

              {!showAnswer ? (
                <div className="space-y-6">
                  <input
                    type="text"
                    value={userGuess}
                    onChange={(e) => setUserGuess(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={t('answerPlaceholder')}
                    className="w-full p-6 bg-white/20 border border-white/30 rounded-xl text-xl text-white placeholder-purple-300 focus:outline-none focus:border-yellow-400 backdrop-blur-sm"
                    autoFocus
                  />
                  
                  <div className="flex gap-4">
                    <button
                      onClick={checkAnswer}
                      disabled={!userGuess.trim()}
                      className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-gray-900 py-4 rounded-xl font-semibold text-lg disabled:bg-white/10 disabled:text-purple-300 disabled:cursor-not-allowed transition-colors border border-yellow-500 disabled:border-white/20 shadow-lg"
                    >
                      {t('submitButton')}
                    </button>
                    
                    {currentQuestion.hint && !showHint && (
                      <button
                        onClick={() => setShowHint(true)}
                        className="bg-white/20 text-white px-6 py-4 rounded-xl hover:bg-white/30 transition-colors border border-white/30 text-lg backdrop-blur-sm"
                      >
                        {t('hintButton')}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className="bg-white/10 rounded-xl p-6 border border-white/20 backdrop-blur-sm">
                    <div className="text-2xl font-semibold text-white mb-3">
                      "{currentQuestion.quote}"
                    </div>
                    <div className="text-lg text-purple-200 mb-2">
                      {t('movieLabel')} <span className="font-semibold">{currentQuestion.movie}</span>
                    </div>
                    <div className="text-base text-purple-300">{t('yourAnswerLabel')} "{userGuess}"</div>
                  </div>
                  
                  <div className="text-xl text-yellow-300 font-semibold">
                    {feedback}
                  </div>
                  
                  <button
                    onClick={generateNewQuestion}
                    className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-colors border border-yellow-500 shadow-lg"
                  >
                    {t('nextQuestionButton')}
                  </button>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MovieQuoteQuizGame;