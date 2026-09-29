import { celebrate, Joi } from 'celebrate';

export const validateCreateProduct = celebrate({
  body: Joi.object().keys({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object()
      .keys({
        fileName: Joi.string().required(),
        originalName: Joi.string().required(),
      })
      .required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }),
});
