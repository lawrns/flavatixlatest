async function until(promiseOrFactory) {
  try {
    const value =
      typeof promiseOrFactory === 'function'
        ? await promiseOrFactory()
        : await promiseOrFactory;

    return [null, value];
  } catch (error) {
    return [error, null];
  }
}

module.exports = {
  until,
};
