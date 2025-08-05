// Sample script to demonstrate creating bilingual quizzes
// This can be used as a reference for creating quiz content

const sampleBilingualQuiz = {
  title: {
    en: "Climate Change Fundamentals",
    fr: "Fondamentaux du changement climatique"
  },
  question: {
    en: "What is the primary greenhouse gas responsible for climate change?",
    fr: "Quel est le principal gaz à effet de serre responsable du changement climatique ?"
  },
  choices: {
    en: [
      "Oxygen (O2)",
      "Carbon Dioxide (CO2)", 
      "Nitrogen (N2)",
      "Hydrogen (H2)"
    ],
    fr: [
      "Oxygène (O2)",
      "Dioxyde de carbone (CO2)",
      "Azote (N2)", 
      "Hydrogène (H2)"
    ]
  },
  correctAnswer: 1, // Index-based: CO2 is the correct answer
  associatedODD: "SOME_ODD_ID", // Replace with actual ODD ObjectId
  points: 15,
  difficulty: "EASY",
  defaultLanguage: "en"
};

// Example usage in a seeder or migration:
/*
const Quiz = require('./models/Quiz');

async function createSampleQuiz() {
  try {
    const quiz = new Quiz(sampleBilingualQuiz);
    await quiz.save();
    console.log('Bilingual quiz created successfully!');
    
    // Test localization
    const englishVersion = quiz.getLocalizedContent('en');
    const frenchVersion = quiz.getLocalizedContent('fr');
    
    console.log('English version:', englishVersion);
    console.log('French version:', frenchVersion);
    
  } catch (error) {
    console.error('Error creating quiz:', error);
  }
}
*/

module.exports = { sampleBilingualQuiz };
