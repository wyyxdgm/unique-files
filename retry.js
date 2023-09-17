function retry(promiseFn, retryCount, retryIntervalSeconds, errorCallback) {
  return new Promise((resolve, reject) => {
    const executePromiseFn = attempt => {
      promiseFn()
        .then(resolve)
        .catch(error => {
          if (attempt < retryCount) {
            console.log(`尝试失败，重试 (${attempt + 1}/${retryCount})`, error);
            setTimeout(() => executePromiseFn(attempt + 1), retryIntervalSeconds * 1000);
          } else {
            if (errorCallback && typeof errorCallback === 'function') {
              const callbackResult = errorCallback(error);
              resolve(callbackResult);
            } else {
              reject(error);
            }
          }
        });
    };

    executePromiseFn(0);
  });
}
module.exports = { retry };