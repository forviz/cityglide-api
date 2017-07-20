exports.responseWithSuccess = (data) => {
  return {
    data,
    meta: '....',
  };
};

exports.responseWithError = (errorCode) => {
  let errorStatus = {};
  switch (errorCode) {
    case 404:
      errorStatus = {
        status: errorCode,
        message: '404 Not Found',
      };
      break;
    case 405:
      errorStatus = {
        status: errorCode,
        message: 'Method Not Allowed',
      };
      break;
    case 400:
    default:
      errorStatus = {
        status: errorCode,
        message: 'Bad Request',
      };
      break;
  }
  return errorStatus;
};
