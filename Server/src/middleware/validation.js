const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.error('Joi Validation Error:', error.details);
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Query validation error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Multilingual text schema for name and description
const multilingualTextSchema = Joi.object({
  en: Joi.string().trim().required().messages({
    'string.empty': 'English text is required',
    'any.required': 'English text is required'
  }),
  fr: Joi.string().trim().required().messages({
    'string.empty': 'French text is required',
    'any.required': 'French text is required'
  })
});

// Multilingual icon schema
const multilingualIconSchema = Joi.object({
  en: Joi.string().required().messages({
    'string.empty': 'English icon is required',
    'any.required': 'English icon is required'
  }),
  fr: Joi.string().required().messages({
    'string.empty': 'French icon is required',
    'any.required': 'French icon is required'
  })
});

// Auth validation schemas
const registerSchema = Joi.object({
  username: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(30).required().messages({
    'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be no more than 30 characters long'
  }),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  avatar: Joi.alternatives().try(
    Joi.string().uri(),
    Joi.string().pattern(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/),
    Joi.string().allow('', null)
  ).optional(),
  country: Joi.string().max(100).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// User validation schemas
const userUpdateSchema = Joi.object({
  username: Joi.string().pattern(/^[a-zA-Z0-9_-]+$/).min(3).max(30).optional().messages({
    'string.pattern.base': 'Username can only contain letters, numbers, underscores, and hyphens',
    'string.min': 'Username must be at least 3 characters long',
    'string.max': 'Username must be no more than 30 characters long'
  }),
  avatar: Joi.string().uri().optional(),
  country: Joi.string().max(100).optional()
});

// Challenge validation schemas
const challengeCreateSchema = Joi.object({
  title: Joi.string().min(5).max(200).required(),
  description: Joi.string().min(10).max(1000).required(),
  type: Joi.string().valid('DAILY', 'WEEKLY', 'MONTHLY', 'SPECIAL').required(),
  difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD', 'EXPERT').required(),
  points: Joi.number().integer().min(1).max(1000).required(),
  associatedODD: Joi.string().hex().length(24).required()
});

// Proof validation schemas
const proofCreateSchema = Joi.object({
  challenge: Joi.string().hex().length(24).required(),
  mediaType: Joi.string().valid('IMAGE', 'VIDEO', 'DOCUMENT').required(),
  url: Joi.string().uri().required()
});

const proofUpdateStatusSchema = Joi.object({
  status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  rejectionReason: Joi.string().when('status', {
    is: 'REJECTED',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Badge validation schemas
const badgeCreateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  imageUrl: Joi.string().uri().required(),
  requiredPoints: Joi.number().integer().min(1).required(),
  associatedODD: Joi.string().hex().length(24).required()
});

// ODD validation schemas with multilingual support
const oddCreateSchema = Joi.object({
  oddId: Joi.number().integer().min(1).max(17).required(),
  name: multilingualTextSchema.keys({
    en: Joi.string().trim().min(3).max(200).required(),
    fr: Joi.string().trim().min(3).max(200).required()
  }).required(),
  icon: multilingualIconSchema.required(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).required().messages({
    'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF0000)'
  }),
  weight: Joi.number().integer().min(1).max(100).default(1),
  isClimateFocus: Joi.boolean().default(false),
  description: multilingualTextSchema.keys({
    en: Joi.string().trim().max(1000).optional(),
    fr: Joi.string().trim().max(1000).optional()
  }).optional()
});

// Multiple ODDs validation schema
const multipleODDsCreateSchema = Joi.object({
  odds: Joi.array().items(oddCreateSchema).min(1).max(17).required().messages({
    'array.min': 'At least one ODD is required',
    'array.max': 'Maximum 17 ODDs can be created at once',
    'any.required': 'ODDs array is required'
  })
});

// ODD update schema (allows partial updates)
const oddUpdateSchema = Joi.object({
  name: multilingualTextSchema.keys({
    en: Joi.string().trim().min(3).max(200).optional(),
    fr: Joi.string().trim().min(3).max(200).optional()
  }).optional(),
  icon: multilingualIconSchema.optional(),
  color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional().messages({
    'string.pattern.base': 'Color must be a valid hex color code (e.g., #FF0000)'
  }),
  weight: Joi.number().integer().min(1).max(100).optional(),
  isClimateFocus: Joi.boolean().optional(),
  description: multilingualTextSchema.keys({
    en: Joi.string().trim().max(1000).optional(),
    fr: Joi.string().trim().max(1000).optional()
  }).optional()
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

module.exports = {
  validateRequest,
  validateQuery,
  registerSchema,
  loginSchema,
  userUpdateSchema,
  challengeCreateSchema,
  proofCreateSchema,
  proofUpdateStatusSchema,
  badgeCreateSchema,
  oddCreateSchema,
  oddUpdateSchema,
  multipleODDsCreateSchema,
  multilingualTextSchema,
  multilingualIconSchema
};