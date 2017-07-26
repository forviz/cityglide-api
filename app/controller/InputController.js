const _ = require('lodash');

exports.checkInputFormat = (type, value) => {
  let bool = true;
  switch (type) {
    case 'int':
    case 'float':
      bool = !_.isNaN(_.toNumber(value));
      break;
    default:

      break;
  }
  if (!bool) {
    throw new Error(400);
  } else {
    return value;
  }
};
