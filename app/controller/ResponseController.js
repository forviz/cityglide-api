exports.responseWithSuccess = (data) => {
  return {
    data,
    meta: '....',
  };
};

exports.responseWithError = (e) => {
  const errorCode = e.message || e;
  let errorStatus = {};
  switch (errorCode) {
    case 401:
      errorStatus = {
        status: 400,
        message: `Google Map Api: ${e.eMessage}`,
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
        message: e.eMessage,
      };
      break;
    default:
      errorStatus = {
        status: errorCode,
        message: e.eMessage,
      };
      break;
  }
  return errorStatus;
};
