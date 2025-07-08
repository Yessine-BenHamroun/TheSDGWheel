const mongoose = require('mongoose');

const oddSchema = new mongoose.Schema({
  oddId: {
    type: Number,
    required: true,
    unique: true,
    min: 1,
    max: 17
  },
  name: {
    en: { type: String, required: true, trim: true, maxlength: 200 },
    fr: { type: String, required: true, trim: true, maxlength: 200 }
  },
  icon: {
    en: { type: String, required: true },
    fr: { type: String, required: true }
  },
  color: {
    type: String,
    required: true,
    match: /^#[0-9A-F]{6}$/i
  },
  weight: {
    type: Number,
    required: true,
    min: 1,
    max: 100,
    default: 1
  },
  isClimateFocus: {
    type: Boolean,
    default: false
  },
  description: {
    en: { type: String, maxlength: 1000 },
    fr: { type: String, maxlength: 1000 }
  }
}, {
  timestamps: true
});

// Index for performance
oddSchema.index({ oddId: 1 });
oddSchema.index({ isClimateFocus: 1 });
oddSchema.index({ weight: -1 });

// Static method to get climate-focused ODDs
oddSchema.statics.getClimateFocused = function() {
  return this.find({ isClimateFocus: true })
    .sort({ weight: -1 });
};

// Static method to get weighted random ODD
oddSchema.statics.getWeightedRandom = async function() {
  const odds = await this.find({});
  const totalWeight = odds.reduce((sum, odd) => sum + odd.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const odd of odds) {
    random -= odd.weight;
    if (random <= 0) {
      return odd;
    }
  }
  
  return odds[0]; // Fallback
};

module.exports = mongoose.model('ODD', oddSchema);