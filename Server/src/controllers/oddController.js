const ODD = require('../models/ODD');
const ActivityLog = require('../models/ActivityLog');

const getAllODDs = async (req, res, next) => {
  try {
    const odds = await ODD.find({}).sort({ oddId: 1 });
    res.json({ odds });
  } catch (error) {
    next(error);
  }
};

const getODDById = async (req, res, next) => {
  try {
    const odd = await ODD.findById(req.params.id);
    if (!odd) {
      return res.status(404).json({ error: 'ODD not found' });
    }
    
    res.json({ odd });
  } catch (error) {
    next(error);
  }
};

const getClimateFocusedODDs = async (req, res, next) => {
  try {
    const odds = await ODD.getClimateFocused();
    res.json({ odds });
  } catch (error) {
    next(error);
  }
};

const createODD = async (req, res, next) => {
  try {
    const odd = new ODD(req.body);
    await odd.save();
    
    res.status(201).json({ odd });
  } catch (error) {
    next(error);
  }
};

const createMultipleODDs = async (req, res, next) => {
  try {
    const { odds } = req.body;

    if (!Array.isArray(odds) || odds.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'Request body must contain an array of ODDs'
      });
    }

    // Validate each ODD before processing
    const validationErrors = [];
    const oddIds = new Set();
    
    odds.forEach((oddData, index) => {
      // Check for duplicate oddId within the request
      if (oddIds.has(oddData.oddId)) {
        validationErrors.push(`Duplicate oddId ${oddData.oddId} at index ${index}`);
      } else {
        oddIds.add(oddData.oddId);
      }

      // Basic validation
      if (!oddData.oddId || oddData.oddId < 1 || oddData.oddId > 17) {
        validationErrors.push(`Invalid oddId at index ${index}: must be between 1 and 17`);
      }
      
      // Validate multilingual name
      if (!oddData.name || typeof oddData.name !== 'object') {
        validationErrors.push(`Invalid name at index ${index}: must be an object with 'en' and 'fr' properties`);
      } else {
        if (!oddData.name.en || oddData.name.en.trim().length < 3) {
          validationErrors.push(`Invalid English name at index ${index}: must be at least 3 characters`);
        }
        if (!oddData.name.fr || oddData.name.fr.trim().length < 3) {
          validationErrors.push(`Invalid French name at index ${index}: must be at least 3 characters`);
        }
      }
      
      // Validate multilingual icon
      if (!oddData.icon || typeof oddData.icon !== 'object') {
        validationErrors.push(`Invalid icon at index ${index}: must be an object with 'en' and 'fr' properties`);
      } else {
        if (!oddData.icon.en) {
          validationErrors.push(`Missing English icon at index ${index}`);
        }
        if (!oddData.icon.fr) {
          validationErrors.push(`Missing French icon at index ${index}`);
        }
      }
      if (!oddData.color || !/^#[0-9A-F]{6}$/i.test(oddData.color)) {
        validationErrors.push(`Invalid color at index ${index}: must be a valid hex color`);
      }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: 'Validation errors',
        details: validationErrors
      });
    }

    // Check for existing ODDs with the same oddId
    const existingOddIds = await ODD.find({
      oddId: { $in: Array.from(oddIds) }
    }).select('oddId');

    if (existingOddIds.length > 0) {
      const conflictingIds = existingOddIds.map(odd => odd.oddId);
      return res.status(409).json({
        error: 'Duplicate ODDs',
        message: `ODDs with the following IDs already exist: ${conflictingIds.join(', ')}`
      });
    }

    // Create all ODDs
    const createdODDs = [];
    const errors = [];

    for (let i = 0; i < odds.length; i++) {
      try {
        const odd = new ODD(odds[i]);
        const savedODD = await odd.save();
        createdODDs.push(savedODD);
      } catch (error) {
        errors.push({
          index: i,
          oddId: odds[i].oddId,
          error: error.message
        });
      }
    }

    // If some ODDs failed to create, return partial success
    if (errors.length > 0) {
      return res.status(207).json({
        message: 'Partial success',
        created: createdODDs,
        errors: errors,
        summary: {
          total: odds.length,
          created: createdODDs.length,
          failed: errors.length
        }
      });
    }

    res.status(201).json({
      message: 'All ODDs created successfully',
      odds: createdODDs,
      summary: {
        total: odds.length,
        created: createdODDs.length
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateODD = async (req, res, next) => {
  try {
    const { id } = req.params;
    const allowedUpdates = ['name', 'icon', 'color', 'weight', 'isClimateFocus', 'description'];
    
    const updates = {};
    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid updates provided' });
    }

    const odd = await ODD.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!odd) {
      return res.status(404).json({ error: 'ODD not found' });
    }

    res.json({ odd });
  } catch (error) {
    next(error);
  }
};

const deleteODD = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const odd = await ODD.findByIdAndDelete(id);
    if (!odd) {
      return res.status(404).json({ error: 'ODD not found' });
    }

    res.json({ message: 'ODD deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const getODDChallenges = async (req, res, next) => {
  try {
    const Challenge = require('../models/Challenge');
    
    const odd = await ODD.findById(req.params.id);
    if (!odd) {
      return res.status(404).json({ error: 'ODD not found' });
    }

    const challenges = await Challenge.find({ 
      associatedODD: req.params.id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({ challenges });
  } catch (error) {
    next(error);
  }
};

const seedDefaultODDs = async (req, res, next) => {
  try {
    // Check if ODDs already exist
    const existingCount = await ODD.countDocuments();
    if (existingCount > 0) {
      return res.status(409).json({
        error: 'ODDs already exist',
        message: `Database already contains ${existingCount} ODDs. Use DELETE /api/odds/seed to reset first.`
      });
    }

    // Default 17 UN Sustainable Development Goals with multilingual support
    const defaultODDs = [
      {
        oddId: 1,
        name: {
          en: "No Poverty",
          fr: "Pas de pauvreté"
        },
        icon: {
          en: "/src/img/en/E_WEB_01.png",
          fr: "/src/img/fr/F-WEB-Goal-01.png"
        },
        color: "#E5243B",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "End poverty in all its forms everywhere",
          fr: "Éliminer la pauvreté sous toutes ses formes et partout dans le monde"
        }
      },
      {
        oddId: 2,
        name: {
          en: "Zero Hunger",
          fr: "Faim zéro"
        },
        icon: {
          en: "/src/img/en/E_WEB_02.png",
          fr: "/src/img/fr/F-WEB-Goal-02.png"
        },
        color: "#DDA63A",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "End hunger, achieve food security and improved nutrition and promote sustainable agriculture",
          fr: "Éliminer la faim, assurer la sécurité alimentaire, améliorer la nutrition et promouvoir l'agriculture durable"
        }
      },
      {
        oddId: 3,
        name: {
          en: "Good Health and Well-being",
          fr: "Bonne santé et bien-être"
        },
        icon: {
          en: "/src/img/en/E_WEB_03.png",
          fr: "/src/img/fr/F-WEB-Goal-03.png"
        },
        color: "#4C9F38",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "Ensure healthy lives and promote well-being for all at all ages",
          fr: "Permettre à tous de vivre en bonne santé et promouvoir le bien-être de tous à tout âge"
        }
      },
      {
        oddId: 4,
        name: {
          en: "Quality Education",
          fr: "Éducation de qualité"
        },
        icon: {
          en: "/src/img/en/E_WEB_04.png",
          fr: "/src/img/fr/F-WEB-Goal-04.png"
        },
        color: "#C5192D",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "Ensure inclusive and equitable quality education and promote lifelong learning opportunities for all",
          fr: "Assurer l'accès de tous à une éducation de qualité, sur un pied d'égalité, et promouvoir les possibilités d'apprentissage tout au long de la vie"
        }
      },
      {
        oddId: 5,
        name: {
          en: "Gender Equality",
          fr: "Égalité entre les sexes"
        },
        icon: {
          en: "/src/img/en/E_WEB_05.png",
          fr: "/src/img/fr/F-WEB-Goal-05.png"
        },
        color: "#FF3A21",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "Achieve gender equality and empower all women and girls",
          fr: "Parvenir à l'égalité des sexes et autonomiser toutes les femmes et les filles"
        }
      },
      {
        oddId: 6,
        name: {
          en: "Clean Water and Sanitation",
          fr: "Eau propre et assainissement"
        },
        icon: {
          en: "/src/img/en/E_WEB_06.png",
          fr: "/src/img/fr/F-WEB-Goal-06.png"
        },
        color: "#26BDE2",
        weight: 8,
        isClimateFocus: true,
        description: {
          en: "Ensure availability and sustainable management of water and sanitation for all",
          fr: "Garantir l'accès de tous à l'eau et à l'assainissement et assurer une gestion durable des ressources en eau"
        }
      },
      {
        oddId: 7,
        name: {
          en: "Affordable and Clean Energy",
          fr: "Énergie propre et d'un coût abordable"
        },
        icon: {
          en: "/src/img/en/E_WEB_07.png",
          fr: "/src/img/fr/F-WEB-Goal-07.png"
        },
        color: "#FCC30B",
        weight: 10,
        isClimateFocus: true,
        description: {
          en: "Ensure access to affordable, reliable, sustainable and modern energy for all",
          fr: "Garantir l'accès de tous à des services énergétiques fiables, durables et modernes, à un coût abordable"
        }
      },
      {
        oddId: 8,
        name: {
          en: "Decent Work and Economic Growth",
          fr: "Travail décent et croissance économique"
        },
        icon: {
          en: "/src/img/en/E_WEB_08.png",
          fr: "/src/img/fr/F-WEB-Goal-08.png"
        },
        color: "#A21942",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "Promote sustained, inclusive and sustainable economic growth, full and productive employment and decent work for all",
          fr: "Promouvoir une croissance économique soutenue, partagée et durable, le plein emploi productif et un travail décent pour tous"
        }
      },
      {
        oddId: 9,
        name: {
          en: "Industry, Innovation and Infrastructure",
          fr: "Industrie, innovation et infrastructure"
        },
        icon: {
          en: "/src/img/en/E_WEB_09.png",
          fr: "/src/img/fr/F-WEB-Goal-09.png"
        },
        color: "#FD6925",
        weight: 6,
        isClimateFocus: false,
        description: {
          en: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation",
          fr: "Bâtir une infrastructure résiliente, promouvoir une industrialisation durable qui profite à tous et encourager l'innovation"
        }
      },
      {
        oddId: 10,
        name: {
          en: "Reduced Inequality",
          fr: "Inégalités réduites"
        },
        icon: {
          en: "/src/img/en/E_WEB_10.png",
          fr: "/src/img/fr/F-WEB-Goal-10.png"
        },
        color: "#DD1367",
        weight: 5,
        isClimateFocus: false,
        description: {
          en: "Reduce inequality within and among countries",
          fr: "Réduire les inégalités dans les pays et d'un pays à l'autre"
        }
      },
      {
        oddId: 11,
        name: {
          en: "Sustainable Cities and Communities",
          fr: "Villes et communautés durables"
        },
        icon: {
          en: "/src/img/en/E_WEB_11.png",
          fr: "/src/img/fr/F-WEB-Goal-11.png"
        },
        color: "#FD9D24",
        weight: 8,
        isClimateFocus: true,
        description: {
          en: "Make cities and human settlements inclusive, safe, resilient and sustainable",
          fr: "Faire en sorte que les villes et les établissements humains soient ouverts à tous, sûrs, résilients et durables"
        }
      },
      {
        oddId: 12,
        name: {
          en: "Responsible Consumption and Production",
          fr: "Consommation et production responsables"
        },
        icon: {
          en: "/src/img/en/E_WEB_12.png",
          fr: "/src/img/fr/F-WEB-Goal-12.png"
        },
        color: "#BF8B2E",
        weight: 9,
        isClimateFocus: true,
        description: {
          en: "Ensure sustainable consumption and production patterns",
          fr: "Établir des modes de consommation et de production durables"
        }
      },
      {
        oddId: 13,
        name: {
          en: "Climate Action",
          fr: "Mesures relatives à la lutte contre les changements climatiques"
        },
        icon: {
          en: "/src/img/en/E_WEB_13.png",
          fr: "/src/img/fr/F-WEB-Goal-13.png"
        },
        color: "#3F7E44",
        weight: 15,
        isClimateFocus: true,
        description: {
          en: "Take urgent action to combat climate change and its impacts",
          fr: "Prendre d'urgence des mesures pour lutter contre les changements climatiques et leurs répercussions"
        }
      },
      {
        oddId: 14,
        name: {
          en: "Life Below Water",
          fr: "Vie aquatique"
        },
        icon: {
          en: "/src/img/en/E_WEB_14.png",
          fr: "/src/img/fr/F-WEB-Goal-14.png"
        },
        color: "#0A97D9",
        weight: 10,
        isClimateFocus: true,
        description: {
          en: "Conserve and sustainably use the oceans, seas and marine resources for sustainable development",
          fr: "Conserver et exploiter de manière durable les océans, les mers et les ressources marines aux fins du développement durable"
        }
      },
      {
        oddId: 15,
        name: {
          en: "Life on Land",
          fr: "Vie terrestre"
        },
        icon: {
          en: "/src/img/en/E_WEB_15.png",
          fr: "/src/img/fr/F-WEB-Goal-15.png"
        },
        color: "#56C02B",
        weight: 10,
        isClimateFocus: true,
        description: {
          en: "Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss",
          fr: "Préserver et restaurer les écosystèmes terrestres, en veillant à les exploiter de façon durable, gérer durablement les forêts, lutter contre la désertification, enrayer et inverser le processus de dégradation des sols et mettre fin à l'appauvrissement de la biodiversité"
        }
      },
      {
        oddId: 16,
        name: {
          en: "Peace and Justice Strong Institutions",
          fr: "Paix, justice et institutions efficaces"
        },
        icon: {
          en: "/src/img/en/E_WEB_16.png",
          fr: "/src/img/fr/F-WEB-Goal-16.png"
        },
        color: "#00689D",
        weight: 4,
        isClimateFocus: false,
        description: {
          en: "Promote peaceful and inclusive societies for sustainable development, provide access to justice for all and build effective, accountable and inclusive institutions at all levels",
          fr: "Promouvoir l'avènement de sociétés pacifiques et ouvertes à tous aux fins du développement durable, assurer l'accès de tous à la justice et mettre en place, à tous les niveaux, des institutions efficaces, responsables et ouvertes à tous"
        }
      },
      {
        oddId: 17,
        name: {
          en: "Partnerships for the Goals",
          fr: "Partenariats pour la réalisation des objectifs"
        },
        icon: {
          en: "/src/img/en/E_WEB_INVERTED_17.png",
          fr: "/src/img/fr/F-WEB-Goal-17.png"
        },
        color: "#19486A",
        weight: 6,
        isClimateFocus: false,
        description: {
          en: "Strengthen the means of implementation and revitalize the global partnership for sustainable development",
          fr: "Renforcer les moyens de mettre en œuvre le Partenariat mondial pour le développement durable et le revitaliser"
        }
      }
    ];

    const createdODDs = await ODD.insertMany(defaultODDs);

    res.status(201).json({
      message: 'Default ODDs seeded successfully',
      odds: createdODDs,
      summary: {
        total: createdODDs.length,
        climateFocused: createdODDs.filter(odd => odd.isClimateFocus).length
      }
    });
  } catch (error) {
    next(error);
  }
};

const resetODDs = async (req, res, next) => {
  try {
    const deletedCount = await ODD.deleteMany({});
    
    res.json({
      message: 'All ODDs deleted successfully',
      deletedCount: deletedCount.deletedCount
    });
  } catch (error) {
    next(error);
  }
};

const getWeightedRandomODD = async (req, res, next) => {
  try {
    const odd = await ODD.getWeightedRandom();
    if (!odd) {
      return res.status(404).json({ error: 'No ODDs found' });
    }
    
    res.json({ odd });
  } catch (error) {
    next(error);
  }
};

exports.spinWheel = async (req, res, next) => {
  try {
    const DailySpin = require('../models/DailySpin');
    const Quiz = require('../models/Quiz');
    const Challenge = require('../models/Challenge');
    const { cleanupOldChallenges } = require('../utils/scheduler');

    // Clean up any old challenges for this user before spinning
    await cleanupOldChallenges(req.user._id);

    // Check if user can spin today
    const canSpin = await DailySpin.canUserSpinToday(req.user._id);
    if (!canSpin) {
      return res.status(429).json({
        message: 'You have already spun the wheel today. Come back tomorrow!',
        nextSpinTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      });
    }
    
    // Get all ODDs for random selection
    const odds = await ODD.find({});
    if (!odds.length) return res.status(404).json({ message: 'No ODDs found' });
    
    // Random selection of ODD
    const randomIndex = Math.floor(Math.random() * odds.length);
    const chosenODD = odds[randomIndex];
    
    // Randomly choose scenario: 66% quiz, 33% challenge (2:1 ratio)
    // Inverted logic: values > 0.33 give QUIZ (66%), values <= 0.33 give CHALLENGE (33%)
    const randomValue = Math.random();
    const scenarioType = randomValue > 0.33 ? 'QUIZ' : 'CHALLENGE';
    
    console.log(`🎲 Random value: ${randomValue}, Scenario: ${scenarioType}, ODD: ${chosenODD.oddId}`);
    
    let item = null;
    let itemType = '';
    
    if (scenarioType === 'QUIZ') {
      // Get random quiz for this ODD
      const quiz = await Quiz.getRandomByODD(chosenODD._id);
      console.log(`🧠 Quiz found for ODD ${chosenODD.oddId}:`, quiz ? 'YES' : 'NO');
      if (!quiz) {
        // Fallback to challenge if no quiz found
        console.log(`⚠️ No quiz found for ODD ${chosenODD.oddId}, falling back to challenge`);
        item = await Challenge.getRandomByODD(chosenODD._id);
        itemType = 'CHALLENGE';
      } else {
        item = quiz;
        itemType = 'QUIZ';
      }
    } else {
      // Get random challenge for this ODD
      const challenge = await Challenge.getRandomByODD(chosenODD._id);
      console.log(`💪 Challenge found for ODD ${chosenODD.oddId}:`, challenge ? 'YES' : 'NO');
      if (!challenge) {
        // Fallback to quiz if no challenge found
        console.log(`⚠️ No challenge found for ODD ${chosenODD.oddId}, falling back to quiz`);
        item = await Quiz.getRandomByODD(chosenODD._id);
        itemType = 'QUIZ';
      } else {
        item = challenge;
        itemType = 'CHALLENGE';
      }
    }
    
    console.log(`✅ Final result: ${itemType} for ODD ${chosenODD.oddId}`);
    
    if (!item) {
      return res.status(404).json({ 
        message: 'No quizzes or challenges found for this ODD' 
      });
    }
    
    // Record the spin in daily tracking
    await DailySpin.recordSpin(req.user._id, chosenODD._id, itemType, item._id);
    
    // Log the action
    await ActivityLog.create({
      type: 'wheel_spin',
      user: req.user._id,
      action: 'Wheel spun',
      details: `Landed on ODD ${chosenODD.oddId}: ${chosenODD.name.en} - Got ${itemType}`,
      target: chosenODD._id,
      targetModel: 'ODD',
    });
    
    res.json({ 
      odd: chosenODD,
      scenarioType: itemType,
      quiz: itemType === 'QUIZ' ? item : null,
      challenge: itemType === 'CHALLENGE' ? item : null,
      canSpinAgain: false,
      nextSpinTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    next(error);
  }
};

// Get today's spin status for user
exports.getTodaysSpinStatus = async (req, res, next) => {
  try {
    const DailySpin = require('../models/DailySpin');
    const PendingChallenge = require('../models/PendingChallenge');
    const { cleanupOldChallenges } = require('../utils/scheduler');

    // Clean up any old challenges for this user before checking status
    await cleanupOldChallenges(req.user._id);

    const todaysSpin = await DailySpin.getTodaysSpin(req.user._id);
    const canSpin = await DailySpin.canUserSpinToday(req.user._id);
    const pendingChallenges = await PendingChallenge.getUserPendingChallenges(req.user._id);

    res.json({
      canSpinToday: canSpin,
      todaysSpin: todaysSpin,
      pendingChallenges: pendingChallenges,
      nextSpinTime: canSpin ? null : new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  } catch (error) {
    next(error);
  }
};

// Submit quiz answer
exports.submitQuizAnswer = async (req, res, next) => {
  try {
    const DailySpin = require('../models/DailySpin');
    const User = require('../models/User');
    const { answer } = req.body;
    
    // Get today's spin
    const todaysSpin = await DailySpin.getTodaysSpin(req.user._id);
    if (!todaysSpin || todaysSpin.scenarioType !== 'QUIZ' || todaysSpin.isCompleted) {
      return res.status(400).json({ message: 'No active quiz found for today' });
    }
    
    // Check if answer is correct
    const isCorrect = todaysSpin.quizId.correctAnswer === answer;
    const pointsAwarded = isCorrect ? 20 : 0;
    
    // Update daily spin record
    todaysSpin.quizAnswer = answer;
    todaysSpin.isQuizCorrect = isCorrect;
    todaysSpin.isCompleted = true;
    todaysSpin.pointsAwarded = pointsAwarded;
    await todaysSpin.save();
    
    // Award points to user if correct
    if (isCorrect) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { totalPoints: pointsAwarded }
      });
    }
    
    // Log the action
    await ActivityLog.create({
      type: 'quiz_completion',
      user: req.user._id,
      action: isCorrect ? 'Quiz answered correctly' : 'Quiz answered incorrectly',
      details: `Quiz for ODD ${todaysSpin.selectedODD.oddId} - ${isCorrect ? 'Correct' : 'Incorrect'} answer`,
      target: todaysSpin.quizId._id,
      targetModel: 'Quiz',
    });
    
    res.json({
      isCorrect: isCorrect,
      correctAnswer: todaysSpin.quizId.correctAnswer,
      pointsAwarded: pointsAwarded,
      explanation: `The correct answer was: ${todaysSpin.quizId.choices[todaysSpin.quizId.correctAnswer]}`
    });
  } catch (error) {
    next(error);
  }
};

// Accept challenge
exports.acceptChallenge = async (req, res, next) => {
  try {
    const DailySpin = require('../models/DailySpin');
    const PendingChallenge = require('../models/PendingChallenge');
    
    // Get today's spin
    const todaysSpin = await DailySpin.getTodaysSpin(req.user._id);
    if (!todaysSpin || todaysSpin.scenarioType !== 'CHALLENGE') {
      return res.status(400).json({ message: 'No active challenge found for today' });
    }
    
    // Accept the challenge
    const pendingChallenge = await PendingChallenge.acceptChallenge(todaysSpin._id, req.user._id);
    
    // Update daily spin
    todaysSpin.challengeAccepted = true;
    await todaysSpin.save();
    
    // Log the action
    await ActivityLog.create({
      type: 'challenge_accepted',
      user: req.user._id,
      action: 'Challenge accepted',
      details: `Challenge for ODD ${todaysSpin.selectedODD.oddId} accepted`,
      target: todaysSpin.challengeId._id,
      targetModel: 'Challenge',
    });
    
    res.json({
      message: 'Challenge accepted! You can upload proof anytime.',
      pendingChallenge: pendingChallenge
    });
  } catch (error) {
    next(error);
  }
};

// Decline challenge
exports.declineChallenge = async (req, res, next) => {
  try {
    const DailySpin = require('../models/DailySpin');
    
    // Get today's spin
    const todaysSpin = await DailySpin.getTodaysSpin(req.user._id);
    if (!todaysSpin || todaysSpin.scenarioType !== 'CHALLENGE') {
      return res.status(400).json({ message: 'No active challenge found for today' });
    }
    
    // Mark challenge as declined
    todaysSpin.challengeAccepted = false;
    todaysSpin.isCompleted = true;
    await todaysSpin.save();
    
    // Log the action
    await ActivityLog.create({
      type: 'challenge_declined',
      user: req.user._id,
      action: 'Challenge declined',
      details: `Challenge for ODD ${todaysSpin.selectedODD.oddId} declined`,
      target: todaysSpin.challengeId._id,
      targetModel: 'Challenge',
    });
    
    res.json({
      message: 'Challenge declined. See you tomorrow for another spin!'
    });
  } catch (error) {
    next(error);
  }
};

// Get spin statistics for all ODDs
exports.getSpinStats = async (req, res, next) => {
  try {
    const DailySpin = require('../models/DailySpin');
    const ActivityLog = require('../models/ActivityLog');
    
    // Get all ODDs
    const odds = await ODD.find({}).sort({ oddId: 1 });
    console.log(`Found ${odds.length} ODDs in database`);
    
    // Check total spin count for debugging
    const totalSpins = await DailySpin.countDocuments({});
    console.log(`Total spins in DailySpin: ${totalSpins}`);
    
    // If DailySpin is empty, fall back to ActivityLog
    if (totalSpins === 0) {
      console.log('No DailySpin records found, using ActivityLog...');
      
      const stats = await Promise.all(odds.map(async (odd) => {
        // Count wheel spins for this ODD from ActivityLog
        const spinCount = await ActivityLog.countDocuments({ 
          type: 'wheel_spin',
          target: odd._id
        });
        
        return {
          id: odd._id,
          oddId: odd.oddId,
          title: odd.name,
          name: odd.name,
          description: odd.description || { 
            en: `Sustainable Development Goal ${odd.oddId}: ${odd.name.en}`, 
            fr: `Objectif de développement durable ${odd.oddId}: ${odd.name.fr}` 
          },
          color: odd.color,
          totalSpins: spinCount,
          spinCount: spinCount,
          quizSpins: 0, // Can't differentiate from ActivityLog easily
          challengeSpins: 0
        };
      }));
      
      console.log(`Returning ${stats.length} SDG stats from ActivityLog`);
      return res.json({ 
        data: stats,
        stats: stats 
      });
    }
    
    // Use DailySpin records if available
    const stats = await Promise.all(odds.map(async (odd) => {
      const spinCount = await DailySpin.countDocuments({ selectedODD: odd._id });
      const quizCount = await DailySpin.countDocuments({ 
        selectedODD: odd._id, 
        scenarioType: 'QUIZ' 
      });
      const challengeCount = await DailySpin.countDocuments({ 
        selectedODD: odd._id, 
        scenarioType: 'CHALLENGE' 
      });
      
      return {
        id: odd._id,
        oddId: odd.oddId,
        title: odd.name,
        name: odd.name,
        description: odd.description || { 
          en: `Sustainable Development Goal ${odd.oddId}: ${odd.name.en}`, 
          fr: `Objectif de développement durable ${odd.oddId}: ${odd.name.fr}` 
        },
        color: odd.color,
        totalSpins: spinCount,
        spinCount: spinCount,
        quizSpins: quizCount,
        challengeSpins: challengeCount
      };
    }));
    
    console.log(`Returning ${stats.length} SDG stats from DailySpin`);
    
    // Return data in the format expected by frontend
    res.json({ 
      data: stats,
      stats: stats 
    });
  } catch (error) {
    console.error('Error in getSpinStats:', error);
    next(error);
  }
};

module.exports = {
  getAllODDs,
  getODDById,
  getClimateFocusedODDs,
  createODD,
  createMultipleODDs,
  updateODD,
  deleteODD,
  getODDChallenges,
  seedDefaultODDs,
  resetODDs,
  getWeightedRandomODD,
  spinWheel: exports.spinWheel,
  getTodaysSpinStatus: exports.getTodaysSpinStatus,
  getSpinStats: exports.getSpinStats,
  submitQuizAnswer: exports.submitQuizAnswer,
  acceptChallenge: exports.acceptChallenge,
  declineChallenge: exports.declineChallenge
};