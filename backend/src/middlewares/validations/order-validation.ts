import { celebrate, Joi } from 'celebrate';

// eslint-disable-next-line import/prefer-default-export
export const validateCreateOrder = celebrate({
  body: Joi.object().keys({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().required().email(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().required()).min(1).required(),
  }),
});
