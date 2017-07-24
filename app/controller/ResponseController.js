exports.responseWithSuccess = (data) => {
  return {
    data,
    meta: '....',
  };
};

exports.responseWithError = (errorCode, errorMessage) => {
  let errorStatus = {};
  switch (errorCode) {
    case 401:
      errorStatus = {
        status: 400,
        message: `Google Map Api: ${errorMessage}`,
      };
      break;
    case 404:
      errorStatus = {
        status: 404,
        message: '404 Not Found',
      };
      break;
    case 405:
      errorStatus = {
        status: 405,
        message: 'Method Not Allowed',
      };
      break;
    case 400:
      errorStatus = {
        status: 400,
        message: 'Bad Request',
      };
      break;
    default:
      errorStatus = {
        status: errorCode,
        message: errorCode,
      };
      break;
  }
  return errorStatus;
};
