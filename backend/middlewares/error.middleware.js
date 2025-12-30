export const errorHandler = (err, req, res, next) => {
  try {
    let error = { ...err };
    error.message = err.message;
    console.error(error);

    if (error.name === "CastError") {
      const message = `Resource not found with id of ${error.value}`;
      error = new Error(message);
      error.statusCode = 404;
    }
    if (error.code === 11000) {
      const message = "Duplicate field value entered";
      error = new Error(message);
      error.statusCode = 400;
    }
    if (error.name === "ValidationError") {
      const message = Object.values(error.errors)
        .map((val) => val.message)
        .join(", ");
      error = new Error(message);
      error.statusCode = 400;
    }
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    res
      .status(error.statusCode)
      .json({ success: false, message: error.message });
  } catch (error) {
    next(error);
  }
};
