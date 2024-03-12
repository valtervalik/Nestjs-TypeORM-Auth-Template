export const apiResponseHandler = (
  message: string,
  statusCode: number,
  data?: any,
) => {
  return {
    message,
    statusCode,
    data,
  };
};
