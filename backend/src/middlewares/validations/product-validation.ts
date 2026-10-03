import { celebrate, Joi } from 'celebrate';

const imageSchema = Joi.object().keys({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

export const validateCreateProduct = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: imageSchema.required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }),
});

export const validateUpdateProduct = celebrate({
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30),
    image: imageSchema,
    category: Joi.string(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }),
});

export const validateDeleteProduct = celebrate({
  params: Joi.object().keys({
    productId: Joi.string().hex().length(24).required(),
  }),
});
