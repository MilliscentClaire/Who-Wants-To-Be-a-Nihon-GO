import React, { useCallback, useEffect, useState, useRef } from 'react'
import anime from 'animejs'
import './index.css'

// ─── Game Data (5 Rounds) ─────────────────────────────────────────────────────
const gameData = [
  {
    id: 1,
    clues: ["Clue 1 (Materials): This masterpiece utilizes Ukiyo-e, a traditional woodblock printing technique.", "Clue 2 (History): It was created in the 1830s by an artist who was obsessed with Mount Fuji.", "Clue 3 (Visual): It features a massive, claw-like body of water threatening three small boats."],
    options: ["The Blue Tsunami", "The Great Wave off Kanagawa", "The Edo Ocean", "Fuji's Splash"],
    correctAnswer: "The Great Wave off Kanagawa",
    imageSrc: "/images/artwork1.jpg",
    title: "The Great Wave off Kanagawa by Katsushika Hokusai"
  },
  {
    id: 2,
    clues: ["Clue 1 (Technique): This is a piece of architecture, not a painting, heavily adorned with pure gold leaf.", "Clue 2 (History): Originally built as a retirement villa for a shogun in the Muromachi period, it was later converted into a Zen Buddhist temple.", "Clue 3 (Visual): It is a stunning three-story pavilion that reflects perfectly in the pond surrounding it."],
    options: ["Kinkaku-ji (Golden Pavilion)", "The Emperor's Palace", "The Shogun Tent", "Senso-ji Temple"],
    correctAnswer: "Kinkaku-ji (Golden Pavilion)",
    imageSrc: "/images/artwork2.jpg",
    title: "Kinkaku-ji (Golden Pavilion)"
  },
  {
    id: 3,
    clues: ["Clue 1 (Materials): This artwork serves a functional purpose as a byōbu, or folding room screen, covered in gold foil.", "Clue 2 (History): It represents the Rinpa school of art, known for abstract, highly decorative designs.", "Clue 3 (Visual): It depicts two fearsome Shinto deities—one white, one green—controlling the weather."],
    options: ["The Weather Demons", "Wind God and Thunder God Screens", "The Storm Samurai", "Spirits of Edo"],
    correctAnswer: "Wind God and Thunder God Screens",
    imageSrc: "/images/artwork3.jpg",
    title: "Wind God and Thunder God Screens by Tawaraya Sōtatsu"
  },
  {
    id: 4,
    clues: ["Clue 1 (Technique): This is not a single artwork, but a traditional repair technique using lacquer dusted with powdered gold, silver, or platinum.", "Clue 2 (History): Legend says it started when a shogun broke his favorite tea bowl and hated the ugly metal staples used to fix it.", "Clue 3 (Visual): It makes cracked pottery look like it has rivers of gold running through it."],
    options: ["Golden Glue", "Kintsugi", "Origami", "Ikebana"],
    correctAnswer: "Kintsugi",
    imageSrc: "/images/artwork4.jpg",
    title: "Kintsugi (Golden Joinery)"
  },
  {
    id: 5,
    clues: ["Clue 1 (Materials): Made of unglazed clay, this is one of the oldest forms of pottery in human history.", "Clue 2 (History): This comes from prehistoric Japan, named after the 'cord-marked' pattern pressed into the wet clay.", "Clue 3 (Visual): It is a small, slightly alien-looking humanoid figurine often found with broken limbs."],
    options: ["Jōmon Dogu Figurine", "Samurai Clay", "Terracotta Warrior", "Shinto Statue"],
    correctAnswer: "Jōmon Dogu Figurine",
    imageSrc: "/images/artwork5.jpg",
    title: "Jōmon Dogu Figurine"
  }
];

// ─── Components ───────────────────────────────────────────────────────────────

function SakuraPetals() {
  const petals = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    duration: `${8 + Math.random() * 12}s`,
    delay: `${Math.random() * 10}s`,
    size: `${10 + Math.random() * 14}px`,
  }))

  return (
    <div className="sakura-container">
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            width: p.size,
            height: p.size,
            animationDuration: p.duration,
            animationDelay: p.delay,
          }}
        />
      ))}
    </div>
  )
}

function TeamDashboard({ team, score, isActive, lifelines, onUseLifeline, canUseLifeline }) {
  const lifelineDefs = [
    { key: 'fifty', label: '50:50', icon: '½' },
    { key: 'phone', label: 'Phone', icon: '📞' },
    { key: 'audience', label: 'Ask', icon: '👥' },
  ]

  return (
    <div className="flex flex-col items-center gap-3 w-40 shrink-0">
      <div className={`glass-panel w-full flex flex-col items-center py-4 px-2 rounded-2xl border transition-all duration-700
        ${isActive ? 'active-glow border-[rgba(201,162,39,0.5)]' : 'border-white/40 opacity-70'}
      `}>
        <span className="font-cinzel text-xs font-bold uppercase tracking-widest text-muted mb-1">{team}</span>
        <span className={`font-cinzel text-5xl font-black ${isActive ? 'text-warm' : 'text-gray-400'}`}>
          {score}
        </span>
        {isActive && <span className="text-[10px] text-pink-500 font-bold tracking-widest uppercase mt-2 animate-pulse">● Active</span>}
      </div>

      <div className="flex gap-2 justify-center w-full">
        {lifelineDefs.map(ll => {
          const used = lifelines[ll.key]
          return (
            <button
              key={ll.key}
              disabled={used || !isActive || !canUseLifeline}
              onClick={() => onUseLifeline(team, ll.key)}
              className={`flex-1 aspect-square rounded-xl flex flex-col items-center justify-center border transition-all
                ${used
                  ? 'bg-gray-100/50 border-gray-200 text-gray-400 line-through opacity-50 cursor-not-allowed'
                  : isActive && canUseLifeline
                    ? 'bg-white border-pink-200 hover:border-pink-400 hover:shadow-md cursor-pointer text-warm hover:scale-105'
                    : 'bg-white/50 border-white text-gray-400 cursor-not-allowed'
                }`}
              title={ll.label}
            >
              <span className="text-xl leading-none">{ll.icon}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function StartScreen({ onStart, audioManager }) {
  const [showRules, setShowRules] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const titleContainerRef = useRef(null)
  const floatingAnimRef = useRef(null)

  useEffect(() => {
    // Start main theme loop only if we aren't in the starting sequence
    if (!isStarting) {
      audioManager.play('mainTheme', true)
    }

    if (titleContainerRef.current && !isStarting) {
      anime.timeline({ loop: false })
        .add({
          targets: '.title-letter',
          translateY: [40, 0],
          translateZ: 0,
          opacity: [0, 1],
          scale: [0.8, 1],
          easing: "easeOutExpo",
          duration: 1200,
          delay: (el, i) => 50 * i
        })
        .add({
          targets: '.action-buttons',
          opacity: [0, 1],
          translateY: [20, 0],
          easing: "easeOutExpo",
          duration: 800
        }, '-=600')

      floatingAnimRef.current = anime({
        targets: titleContainerRef.current,
        translateY: [-5, 5],
        easing: 'easeInOutSine',
        duration: 2500,
        direction: 'alternate',
        loop: true,
        delay: 1000
      })
    }

    return () => {
      if (!isStarting) {
        audioManager.stop('mainTheme')
      }
      if (floatingAnimRef.current) floatingAnimRef.current.pause()
    }
  }, [audioManager, isStarting])

  const handleStart = () => {
    setIsStarting(true)
    audioManager.stop('mainTheme')
    audioManager.play('start')

    // Stop continuous floating
    if (floatingAnimRef.current) floatingAnimRef.current.pause()

    // Enlarge until envelops screen
    anime.timeline({ loop: false })
      .add({
        targets: '.action-buttons',
        opacity: 0,
        duration: 300,
        easing: 'easeOutQuad'
      })
      .add({
        targets: titleContainerRef.current,
        scale: [1, 50],
        opacity: [1, 0],
        rotate: [0, 15],
        easing: 'easeInCubic',
        duration: 13000
      }, '-=300')

    // Trigger main game after 14 seconds to snap back
    setTimeout(() => {
      onStart()
    }, 14000)
  }

  const handleRulesOpen = () => {
    audioManager.play('rules', true)
    setShowRules(true)
  }

  const handleRulesClose = () => {
    audioManager.stop('rules')
    setShowRules(false)
  }

  const titleText = "WHO WANTS TO BE A NIHON-GO!"
  const words = titleText.split(' ')

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <SakuraPetals />
      
      <div className="z-10 flex flex-col items-center text-center w-full px-4">
        <h1 
          ref={titleContainerRef} 
          className="font-kawaii kawaii-3d-text text-5xl md:text-7xl mb-16 flex flex-wrap justify-center gap-x-4 w-full"
        >
          {words.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split('').map((char, cIdx) => (
                <span key={cIdx} className="title-letter inline-block opacity-0" style={{ transformOrigin: "50% 50%" }}>
                  {char}
                </span>
              ))}
            </span>
          ))}
        </h1>
        
        {!isStarting && (
          <div className="action-buttons flex gap-6 opacity-0">
            <button
              onClick={handleRulesOpen}
              className="glass-panel px-8 py-4 rounded-full border border-pink-300 text-warm font-cinzel font-bold text-lg tracking-widest uppercase hover:bg-white/90 hover:scale-105 transition-all shadow-md active:scale-95"
            >
              Rules & Mechanics
            </button>
            <button
              onClick={handleStart}
              className="glass-panel px-10 py-4 rounded-full border-2 border-pink-400 text-warm font-cinzel font-bold text-xl tracking-widest uppercase hover:bg-pink-50 hover:scale-105 transition-all shadow-xl active:scale-95"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      {/* Rules Modal */}
      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-md modal-enter p-6">
          <div className="glass-panel relative max-w-2xl w-full p-10 rounded-3xl border-2 border-pink-300 shadow-2xl text-warm">
            <button 
              onClick={handleRulesClose}
              className="absolute top-6 right-6 text-pink-400 hover:text-pink-600 font-bold text-2xl transition-colors"
            >
              ✕
            </button>
            <h2 className="font-cinzel text-3xl font-black mb-6 text-center tracking-wide">Welcome to Nihon-GO!</h2>
            <div className="font-inter text-lg space-y-4 leading-relaxed">
              <p>Two teams (Group 2 & Group 3) compete across 5 tie-breaking rounds.</p>
              <p>The Host will assign which team gets to answer first each round.</p>
              <p>The Master Appraiser will reveal 3 historical clues about a Japanese masterpiece.</p>
              <p>Guess correctly from the 4 options to win 1 point.</p>
              <p>Guess incorrectly, and the opposing team gets a chance to STEAL.</p>
              <p>Each team has an independent lifeline pool: 50:50, Phone a Friend (40s timer), and Ask the Audience (involves picking 3 people from the audience to vote, 30s timer).</p>
              <p className="font-semibold text-pink-700 bg-pink-100/50 p-4 rounded-xl border border-pink-200 mt-6">
                Strategic Note: If the 50:50 lifeline is activated, the Steal mechanic is voided for that round!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LandscapeOverlay() {
  return (
    <div id="landscape-overlay" className="fixed inset-0 z-[100] bg-pink-100/95 backdrop-blur-md flex-col items-center justify-center text-center p-8 hidden">
      <div className="text-6xl mb-6 animate-bounce">📱🔄</div>
      <h2 className="font-cinzel text-3xl font-black text-pink-600 mb-4">Please Rotate Your Device</h2>
      <p className="font-inter text-lg text-pink-800/80">This game show is best experienced in landscape mode.</p>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isGameStarted, setIsGameStarted] = useState(false)
  
  // App state
  const [currentRound, setCurrentRound] = useState(0)
  const [scores, setScores] = useState({ 'Group 2': 0, 'Group 3': 0 })
  const [lifelinesG2, setLifelinesG2] = useState({ fifty: false, phone: false, audience: false })
  const [lifelinesG3, setLifelinesG3] = useState({ fifty: false, phone: false, audience: false })

  // Active Team is manually controlled by Game Master (Starts null)
  const [activeTeam, setActiveTeam] = useState(null)
  
  // Bounce back / Steal state
  const [wrongGuessesThisRound, setWrongGuessesThisRound] = useState(0)
  const [lockedWrongAnswers, setLockedWrongAnswers] = useState([])
  
  // 50:50 state
  const [hiddenOptions, setHiddenOptions] = useState([])
  const [isFiftyFiftyUsedThisRound, setIsFiftyFiftyUsedThisRound] = useState(false)

  // Timer modal state
  const [activeModal, setActiveModal] = useState(null) // 'phone' | 'audience' | null
  const [modalTimer, setModalTimer] = useState(null)

  // Turn state
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [flashState, setFlashState] = useState(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [roundCompleted, setRoundCompleted] = useState(false)
  const [clueIndex, setClueIndex] = useState(null) // null = no clue revealed yet
  const [gameOver, setGameOver] = useState(false)
  
  // Manual Options Reveal state
  const [revealedOptions, setRevealedOptions] = useState([])

  // Image Error Fallback
  const [imgError, setImgError] = useState(false)

  // Banner state
  const [bannerMessage, setBannerMessage] = useState(null)

  // Sequence Animation ref
  const seqRefs = useRef([])

  // Audio Manager Setup
  const audioRefs = useRef({})

  useEffect(() => {
    // Initialize audio elements safely on the client
    audioRefs.current = {
      mainTheme: new Audio('/sound/main_theme.mp3'),
      rules: new Audio('/sound/rules.mp3'),
      start: new Audio('/sound/start.mp3'),
      question: new Audio('/sound/question.mp3'),
      finalAnswer: new Audio('/sound/final_answer.mp3'),
      steal: new Audio('/sound/steal.mp3'),
      fifty: new Audio('/sound/50-50.mp3'),
      phone: new Audio('/sound/phone_a_friend.mp3'),
      audience: new Audio('/sound/ask_the_audience.mp3'),
      correctAnswer: new Audio('/sound/correct_answer.mp3'),
      wrongAnswer: new Audio('/sound/wrong_answer.mp3')
    }
  }, [])

  const audioManager = {
    play: (key, loop = false) => {
      let audio = audioRefs.current[key]
      if (!audio) {
        // Fallback initialization if not yet set
        const soundMap = {
          mainTheme: '/sound/main_theme.mp3',
          rules: '/sound/rules.mp3',
          start: '/sound/start.mp3',
          question: '/sound/question.mp3',
          finalAnswer: '/sound/final_answer.mp3',
          steal: '/sound/steal.mp3',
          fifty: '/sound/50-50.mp3',
          phone: '/sound/phone_a_friend.mp3',
          audience: '/sound/ask_the_audience.mp3',
          correctAnswer: '/sound/correct_answer.mp3',
          wrongAnswer: '/sound/wrong_answer.mp3'
        }
        if (soundMap[key]) {
          audio = new Audio(soundMap[key])
          audioRefs.current[key] = audio
        }
      }
      if (audio) {
        audio.loop = loop
        audio.currentTime = 0
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.warn(`Audio playback blocked/failed for ${key}:`, e)
            // Retry with capitalized start.MP3 fallback if start failed
            if (key === 'start') {
              const fallbackAudio = new Audio('/sound/start.MP3')
              fallbackAudio.currentTime = 0
              fallbackAudio.play().catch(err => console.warn('Fallback start.MP3 failed:', err))
            }
          })
        }
      }
    },
    // Play a sound but stop it after maxSeconds seconds
    playTimed: (key, maxSeconds = 4) => {
      let audio = audioRefs.current[key]
      if (audio) {
        audio.loop = false
        audio.currentTime = 0
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch(e => console.warn(`Audio timed playback failed for ${key}:`, e))
        }
        setTimeout(() => {
          if (audio && !audio.paused) {
            audio.pause()
            audio.currentTime = 0
          }
        }, maxSeconds * 1000)
      }
    },
    stop: (key) => {
      const audio = audioRefs.current[key]
      if (audio) {
        audio.pause()
        audio.currentTime = 0
      }
    }
  }

  const round = gameData[currentRound] || gameData[0] // Safe fallback to prevent crash

  // Round Entry Animation & Question Audio Looping
  useEffect(() => {
    if (isGameStarted && !gameOver && seqRefs.current.length > 0) {
      // Loop question audio upon round load
      audioManager.play('question', true)

      // Sequential reveal of round info, clues, and choices
      anime({
        targets: seqRefs.current,
        translateY: [20, 0],
        opacity: [0, 1],
        delay: anime.stagger(400, { start: 500 }),
        easing: 'easeOutExpo',
        duration: 1000
      })
    }
  }, [isGameStarted, currentRound, gameOver]) // eslint-disable-line react-hooks/exhaustive-deps

  // Timer Effect
  useEffect(() => {
    let interval = null
    if (activeModal && modalTimer !== null && modalTimer > 0) {
      interval = setInterval(() => {
        setModalTimer(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeModal, modalTimer])

  const handleNextRound = useCallback(() => {
    if (currentRound >= gameData.length - 1) {
      setGameOver(true)
      audioManager.stop('question')
      audioManager.stop('steal')
      return
    }
    const nextRoundIdx = currentRound + 1
    setCurrentRound(nextRoundIdx)
    setActiveTeam(null)
    setWrongGuessesThisRound(0)
    setLockedWrongAnswers([])
    setHiddenOptions([])
    setRevealedOptions([])
    setIsFiftyFiftyUsedThisRound(false)
    setSelectedAnswer(null)
    setFlashState(null)
    setIsRevealed(false)
    setRoundCompleted(false)
    setClueIndex(null)
    setBannerMessage(null)
    setImgError(false)
    
    // Stop steal & 50-50 audio before new round starts
    // (question.mp3 will resume via the round-entry useEffect)
    audioManager.stop('steal')
    audioManager.stop('fifty')
  }, [currentRound]) // eslint-disable-line react-hooks/exhaustive-deps

  // Spacebar to advance round if completed
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && roundCompleted && !gameOver) {
        e.preventDefault()
        handleNextRound()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [roundCompleted, gameOver, handleNextRound])

  const stopAnyLifelineAudio = () => {
    audioManager.stop('fifty')
    audioManager.stop('phone')
    audioManager.stop('audience')
  }

  const handleUseLifeline = (team, key) => {
    if (team !== activeTeam || roundCompleted || flashState) return
    
    stopAnyLifelineAudio()
    
    if (team === 'Group 2') setLifelinesG2(prev => ({ ...prev, [key]: true }))
    if (team === 'Group 3') setLifelinesG3(prev => ({ ...prev, [key]: true }))

    if (key === 'fifty') {
      audioManager.play('fifty')
      setIsFiftyFiftyUsedThisRound(true)
      const wrongOptions = round.options.filter(opt => opt !== round.correctAnswer && !lockedWrongAnswers.includes(opt))
      const shuffled = [...wrongOptions].sort(() => 0.5 - Math.random())
      
      const newHidden = [...hiddenOptions, ...shuffled.slice(0, 2)]
      setHiddenOptions(newHidden)

      // Ensure hidden options are marked as revealed so they show the X, not a ?
      setRevealedOptions(prev => {
        const set = new Set([...prev, ...newHidden])
        return Array.from(set)
      })

    } else if (key === 'phone') {
      audioManager.play('phone')
      setModalTimer(40)
      setActiveModal('phone')
    } else if (key === 'audience') {
      audioManager.play('audience')
      setModalTimer(30)
      setActiveModal('audience')
    }
  }

  const handleCloseModal = () => {
    setActiveModal(null)
    setModalTimer(null)
    audioManager.stop('phone')
    audioManager.stop('audience')
  }

  const handleSetTurn = (team) => {
    setActiveTeam(team)
  }

  const handleOptionClick = (option) => {
    // If not revealed yet, reveal it and do not select
    if (!revealedOptions.includes(option)) {
      setRevealedOptions(prev => [...prev, option])
      return
    }

    // If it is revealed, handle standard selection
    if (selectedAnswer || flashState || roundCompleted || !activeTeam) return
    setSelectedAnswer(option)
    setFlashState('yellow')
    stopAnyLifelineAudio() // stop 50-50 sound if an answer is clicked
  }

  const handleCheckAnswer = () => {
    if (!selectedAnswer || roundCompleted || !activeTeam) return

    stopAnyLifelineAudio()

    // Stop the question loop and play final answer sound
    audioManager.stop('question')
    audioManager.play('finalAnswer')

    const isCorrect = selectedAnswer === round.correctAnswer

    // Simulate a dramatic pause for checking answer
    setTimeout(() => {
      if (isCorrect) {
        setFlashState('green')
        audioManager.stop('finalAnswer')
        audioManager.playTimed('correctAnswer', 4)
        setTimeout(() => {
          setIsRevealed(true)
          setScores(prev => ({ ...prev, [activeTeam]: prev[activeTeam] + 1 }))
          setRoundCompleted(true)
        }, 1000)
      } else {
        setFlashState('red')
        audioManager.stop('finalAnswer')
        audioManager.playTimed('wrongAnswer', 4)

        const newWrongGuessesCount = wrongGuessesThisRound + 1

        if (isFiftyFiftyUsedThisRound) {
          // 50:50 Exception: DO NOT ALLOW STEALS.
          setTimeout(() => {
            setLockedWrongAnswers(prev => [...prev, selectedAnswer])
            setBannerMessage("NO STEAL CHANCE")
            setTimeout(() => {
              setIsRevealed(true)
              setRoundCompleted(true)
              setBannerMessage(null)
            }, 2500)
          }, 800)
        } else {
          setTimeout(() => {
            setLockedWrongAnswers(prev => [...prev, selectedAnswer])
            setWrongGuessesThisRound(newWrongGuessesCount)
            
            if (newWrongGuessesCount === 1) {
              // Attempt 1: Normal Steal — steal.mp3 loops, question.mp3 stays silent
              audioManager.play('steal', true)
              setBannerMessage("⚡ STEAL MODE")
              setTimeout(() => {
                setActiveTeam(activeTeam === 'Group 2' ? 'Group 3' : 'Group 2')
                setSelectedAnswer(null)
                setFlashState(null)
                setBannerMessage(null)
                // steal.mp3 keeps looping — question.mp3 does NOT resume here
              }, 3000)
            } else if (newWrongGuessesCount === 2) {
              // Attempt 2: Bounce Back — steal.mp3 loops, question.mp3 stays silent
              audioManager.play('steal', true)
              setBannerMessage("🔄 BOUNCE BACK")
              setTimeout(() => {
                setActiveTeam(activeTeam === 'Group 2' ? 'Group 3' : 'Group 2')
                setSelectedAnswer(null)
                setFlashState(null)
                setBannerMessage(null)
                // steal.mp3 keeps looping — question.mp3 does NOT resume here
              }, 3000)
            } else {
              // Attempt 3: All 3 wrong, reveal answer
              audioManager.stop('steal')
              setIsRevealed(true)
              setRoundCompleted(true)
            }
          }, 800)
        }
      }
    }, 1500) // 1.5s dramatic pause after clicking Check Answer
  }

  const restartGame = () => {
    setIsGameStarted(false)
    setCurrentRound(0)
    setScores({ 'Group 2': 0, 'Group 3': 0 })
    setLifelinesG2({ fifty: false, phone: false, audience: false })
    setLifelinesG3({ fifty: false, phone: false, audience: false })
    setActiveTeam(null)
    setWrongGuessesThisRound(0)
    setLockedWrongAnswers([])
    setRevealedOptions([])
    setHiddenOptions([])
    setIsFiftyFiftyUsedThisRound(false)
    setSelectedAnswer(null)
    setFlashState(null)
    setIsRevealed(false)
    setRoundCompleted(false)
    setClueIndex(null)
    setGameOver(false)
    setBannerMessage(null)
    setActiveModal(null)
    setModalTimer(null)
    setImgError(false)
    
    // Stop all audio
    Object.keys(audioRefs.current).forEach(key => audioManager.stop(key))
  }

  if (!isGameStarted) {
    return (
      <>
        <LandscapeOverlay />
        <StartScreen onStart={() => setIsGameStarted(true)} audioManager={audioManager} />
      </>
    )
  }

  return (
    <>
      <LandscapeOverlay />
      <div className="relative min-h-screen flex flex-col pt-6 pb-20 px-6 lg:px-12 xl:px-20">
        <SakuraPetals />

      {/* Floating Banner */}
      {bannerMessage && (
        <div className="floating-banner fixed left-1/2 top-10 z-50 glass-panel px-6 py-3 md:px-12 md:py-5 rounded-full border border-pink-300">
          <p className="font-cinzel text-xl md:text-2xl font-black tracking-widest text-warm">{bannerMessage}</p>
        </div>
      )}

      {/* Timer Modal (Phone or Audience) */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/40 backdrop-blur-sm modal-enter">
          <div className="glass-panel flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-pink-300 shadow-2xl min-w-[400px]">
            <h3 className="font-cinzel text-xl font-bold text-muted uppercase tracking-widest mb-6">
              {activeModal === 'phone' ? 'Phone a Friend' : 'Ask the Audience'}
            </h3>
            <div className={`text-8xl font-black font-cinzel mb-8 transition-colors duration-300
              ${modalTimer === 0 ? 'text-red-500 timer-flash-red' : 'text-warm'}
            `}>
              {modalTimer}
            </div>
            <button
              onClick={handleCloseModal}
              className="px-8 py-3 bg-white/80 border border-pink-300 text-warm font-cinzel font-bold tracking-wider rounded-xl hover:bg-pink-50 transition-all shadow-sm"
            >
              Close Timer
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto flex justify-between items-start mb-8 gap-4">
        <TeamDashboard
          team="Group 2"
          score={scores['Group 2']}
          isActive={activeTeam === 'Group 2'}
          lifelines={lifelinesG2}
          onUseLifeline={handleUseLifeline}
          canUseLifeline={!roundCompleted && !selectedAnswer && !activeModal && activeTeam !== null}
        />

        <div className="flex flex-col items-center justify-center flex-1 pt-4">
           <h1 className="font-kawaii kawaii-3d-text text-4xl md:text-5xl lg:text-6xl text-center mb-6">
             WHO WANTS TO BE A NIHON-GO!
           </h1>
           <div className="flex gap-2">
             {gameData.map((_, i) => (
               <div key={i} className={`rd ${i < currentRound ? 'done' : i === currentRound ? 'active' : ''}`} />
             ))}
           </div>
        </div>

        <TeamDashboard
          team="Group 3"
          score={scores['Group 3']}
          isActive={activeTeam === 'Group 3'}
          lifelines={lifelinesG3}
          onUseLifeline={handleUseLifeline}
          canUseLifeline={!roundCompleted && !selectedAnswer && !activeModal && activeTeam !== null}
        />
      </header>

      {/* Main Game Area */}
      {gameOver ? (
        <div className="relative z-10 m-auto flex flex-col items-center justify-center w-full max-w-2xl glass-panel p-12 rounded-3xl border border-pink-200">
          <div className="gameover-enter text-center">
            <h2 className="font-cinzel text-5xl font-black text-warm mb-4">Spring Tournament Concludes</h2>
            <p className="text-xl text-muted font-cinzel mb-8">
              {scores['Group 2'] > scores['Group 3'] ? 'Group 2 is Victorious!'
               : scores['Group 3'] > scores['Group 2'] ? 'Group 3 is Victorious!'
               : 'It is a Harmonious Tie!'}
            </p>
            <button
              onClick={restartGame}
              className="px-10 py-4 bg-white/80 border-2 border-pink-300 text-warm font-cinzel font-bold text-lg rounded-xl hover:bg-pink-50 transition-all shadow-sm hover:scale-105"
            >
              Return to Start 🌸
            </button>
          </div>
        </div>
      ) : (
        <main className="relative z-10 max-w-6xl w-full mx-auto flex flex-col md:flex-row gap-6 md:gap-8">
          
          {/* Clues Area */}
          <section className="flex-1 flex flex-col gap-4 md:gap-6">
            <div 
              ref={el => el && !seqRefs.current.includes(el) && seqRefs.current.push(el)} 
              className="seq-enter glass-panel p-6 rounded-3xl border border-pink-100 min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <span className="font-cinzel text-pink-600 font-bold text-sm tracking-widest uppercase block mb-3">
                  Round {currentRound + 1} {wrongGuessesThisRound === 1 && "— ⚡ STEAL MODE"} {wrongGuessesThisRound === 2 && "— 🔄 BOUNCE BACK"}
                </span>
                <p className="text-warm text-lg leading-relaxed min-h-[60px] font-semibold italic">
                  {clueIndex === null ? "Waiting for the Master Appraiser to reveal clues..." : round.clues[clueIndex]}
                </p>
              </div>
              
              <div className="flex gap-3 mt-4">
                {round.clues.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setClueIndex(i)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold font-cinzel transition-all border
                      ${clueIndex === i
                        ? 'bg-white border-pink-300 shadow-sm text-warm'
                        : 'bg-white/40 border-white/50 text-muted hover:bg-white/70'
                      }`}
                  >
                    Reveal Clue {i + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {round.options.map((opt, i) => {
                const isRevealed = revealedOptions.includes(opt)
                const isHidden = hiddenOptions.includes(opt)
                const isLocked = lockedWrongAnswers.includes(opt)
                const isSelected = selectedAnswer === opt
                const flash = isSelected ? flashState : null
                const label = String.fromCharCode(65 + i) // A, B, C, D

                let flashClass = ''
                if (flash === 'yellow') flashClass = 'btn-flash-yellow'
                if (flash === 'green')  flashClass = 'btn-flash-green'
                if (flash === 'red')    flashClass = 'btn-flash-red'

                // If 50:50 hid it or wrong answer locked it (after being revealed)
                if (isRevealed && (isHidden || isLocked)) {
                  return (
                    <div 
                      key={opt} 
                      ref={el => el && !seqRefs.current.includes(el) && seqRefs.current.push(el)} 
                      className="seq-enter glass-panel h-20 rounded-2xl flex items-center justify-center border-dashed border-2 border-pink-200/50 opacity-40"
                    >
                      <span className="font-cinzel text-pink-300 text-2xl">{isLocked ? '✗' : '✕'}</span>
                    </div>
                  )
                }

                return (
                  <button
                    key={opt}
                    ref={el => el && !seqRefs.current.includes(el) && seqRefs.current.push(el)} 
                    disabled={roundCompleted || (isRevealed && activeTeam === null) || (flashState === 'red' && !isRevealed)}
                    onClick={() => handleOptionClick(opt)}
                    className={`seq-enter h-20 rounded-2xl border-2 font-semibold text-[15px] transition-all duration-200
                      flex items-center gap-4 px-6 text-left
                      ${!isRevealed ? 'bg-white/80 border-pink-200 text-pink-400 hover:bg-white hover:border-pink-300 cursor-pointer justify-center shadow-sm' 
                        : (activeTeam === null ? 'bg-white/30 border-white/40 text-warm/50 cursor-not-allowed opacity-70' : 'bg-white/60 border-white text-warm hover:bg-white hover:shadow-md hover:-translate-y-1 cursor-pointer')
                      }
                      ${flashClass}
                      ${isSelected && !flash ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-[#fdf8f0]' : ''}
                    `}
                  >
                    {!isRevealed ? (
                      <span className="font-cinzel text-3xl font-black text-pink-300 w-full text-center">?</span>
                    ) : (
                      <>
                        <span className="font-cinzel text-xl font-black text-pink-300 w-6">{label}</span>
                        <span className="flex-1">{opt}</span>
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-4 mt-2">
              <button
                onClick={handleCheckAnswer}
                disabled={!selectedAnswer || roundCompleted || flashState === 'green' || activeTeam === null}
                className="flex-1 py-4 rounded-2xl font-cinzel font-bold tracking-wider text-base
                  transition-all bg-white/80 border-2 border-yellow-200 text-warm hover:bg-yellow-50 hover:border-yellow-400
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white/80 disabled:hover:border-yellow-200 shadow-sm"
              >
                ✓ Check Answer
              </button>

              {roundCompleted && (
                <button
                  onClick={handleNextRound}
                  className="flex-1 py-4 rounded-2xl font-cinzel font-bold tracking-wider text-base shadow-sm
                    transition-all bg-pink-500 border-2 border-pink-600 text-white hover:bg-pink-600 hover:-translate-y-1"
                >
                  {currentRound >= gameData.length - 1 ? 'See Results' : 'Next Round →'}
                </button>
              )}
            </div>
          </section>

          {/* Artwork Panel */}
          <section className="w-full md:w-80 shrink-0">
            <div 
              ref={el => el && !seqRefs.current.includes(el) && seqRefs.current.push(el)} 
              className="seq-enter glass-panel w-full aspect-square rounded-3xl p-3 border border-pink-100 shadow-lg relative overflow-hidden"
            >
              <div className="w-full h-full rounded-2xl overflow-hidden relative bg-white/50 flex items-center justify-center">
                {!isRevealed && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40">
                    <span className="font-cinzel text-6xl font-black text-pink-300 drop-shadow-md mb-2">?</span>
                    <span className="font-cinzel font-bold text-xs tracking-widest text-warm uppercase">Identify the Artwork</span>
                  </div>
                )}
                
                {imgError ? (
                  <div className={`w-full h-full flex flex-col items-center justify-center bg-pink-50/50 ${isRevealed ? 'artwork-visible' : 'artwork-hidden'}`}>
                    <span className="text-4xl mb-2">🏛️</span>
                    <span className="font-cinzel font-bold text-pink-400 text-center px-4 leading-tight">Masterpiece<br/>Vault</span>
                  </div>
                ) : (
                  <img 
                    src={round.imageSrc} 
                    alt={isRevealed ? round.title : 'Mystery Artwork'}
                    onError={() => setImgError(true)}
                    className={`w-full h-full object-cover ${isRevealed ? 'artwork-visible' : 'artwork-hidden'}`}
                  />
                )}
              </div>
              
              {isRevealed && (
                <div className="absolute bottom-6 inset-x-6 text-center">
                  <div className="glass-panel py-2 px-4 rounded-xl border border-white">
                    <p className="font-cinzel text-sm font-bold text-warm leading-tight">{round.title}</p>
                  </div>
                </div>
              )}
            </div>
            {roundCompleted && !gameOver && (
               <p className="text-center text-xs text-muted font-cinzel mt-4 opacity-60">Press Spacebar to advance</p>
            )}
          </section>
        </main>
      )}

      {/* Game Master Controls (Fixed at Bottom) */}
      {!gameOver && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-4 bg-white/60 backdrop-blur-sm p-3 rounded-2xl border border-pink-200 shadow-sm opacity-80 hover:opacity-100 transition-opacity">
          <span className="flex items-center text-xs font-bold uppercase tracking-widest text-pink-600 font-cinzel px-2">Game Master Controls:</span>
          <button 
            onClick={() => handleSetTurn('Group 2')}
            disabled={roundCompleted || selectedAnswer || wrongGuessesThisRound > 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase font-cinzel transition-all border
              ${activeTeam === 'Group 2' ? 'bg-pink-100 border-pink-400 text-pink-800 shadow-sm' : 'bg-white border-pink-200 text-pink-400 hover:bg-pink-50'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Set Turn: Group 2
          </button>
          <button 
            onClick={() => handleSetTurn('Group 3')}
            disabled={roundCompleted || selectedAnswer || wrongGuessesThisRound > 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase font-cinzel transition-all border
              ${activeTeam === 'Group 3' ? 'bg-pink-100 border-pink-400 text-pink-800 shadow-sm' : 'bg-white border-pink-200 text-pink-400 hover:bg-pink-50'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Set Turn: Group 3
          </button>
        </div>
      )}
      </div>
    </>
  )
}
