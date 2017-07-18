exports.checkInputFormat = (type, value) => {
  let bool = true;
  switch (type) {
    case "int":
      bool = (parseInt(value) == value);
      break;
    case "float":
      bool = (parseFloat(value) == value);
      break;
    default:

      break;
  }
  if (!bool) {
    throw 400;
  } else {
    return value;
  }
}

