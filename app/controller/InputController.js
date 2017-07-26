const _ = require('lodash');

exports.checkInputFormat = (type, value, inputName) => {
  let bool = true;
  let message = '';
  if (!value) {
    const eInvalid = {
      message: 400,
      eMessage: `Parameter ${inputName} is require`,
    };
    throw eInvalid;
  }
  switch (type) {
    case 'int':
      bool = !_.isNaN(_.toNumber(value));
      message = `${inputName} must be integer`;
      break;
    case 'float':
      bool = !_.isNaN(_.toNumber(value));
      message = `${inputName} must be float`;
      break;
    default:

      break;
  }
  if (!bool) {
    const e = {
      message: 422,
      eMessage: message,
    };
    throw e;
  } else {
    return value;
  }
};
