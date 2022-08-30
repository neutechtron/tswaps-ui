const goBackNumberOfDays = 3;

Date.prototype.addDays = function (days) {
  var date = new Date(this.valueOf());
  date.setDate(date.getDate() + days);
  return date;
};

Date.prototype.addHours = function (hours) {
  var date = new Date(this.valueOf());
  date.setHours(date.getHours() + hours);
  return date;
};

function getInvertedTokenOrder(data, token1Name) {
  // Test only for the first record as per the functional requirement
  if (data.length > 0) {
    return data[0].token_1 !== token1Name;
  }
  return false;
}

function getValueFromObjectAtDate(
  data,
  valueObjectAtDate,
  prevValue,
  token1Name
) {
  const invertedTokenOrder = getInvertedTokenOrder(data, token1Name);

  if (!valueObjectAtDate) {
    // if the current valueObjectAtDate is not found, then use previous value
    return prevValue;
  }

  return invertedTokenOrder
    ? valueObjectAtDate.price_1 !== 0 // prevent division by zero errors
      ? valueObjectAtDate.price_2 / valueObjectAtDate.price_1
      : prevValue
    : valueObjectAtDate.price_2 !== 0
    ? valueObjectAtDate.price_1 / valueObjectAtDate.price_2
    : prevValue;
}

function extrapolateStartValueFromPreviousValues(data, token1Name) {
  let prevValue = 0;
  const previousDateArray = [];
  const startTime = currentServerTime.addDays(-1 * goBackNumberOfDays);

  console.log('Preparing to extrapolateStartValueFromPreviousValues');

  for (let i = 0; i < 24 * (goBackNumberOfDays - 1); i++) {
    previousDateArray.push(startTime.addHours(i));
  }

  console.log('previousDateArray', previousDateArray);

  previousDateArray.forEach((date) => {
    const valueObjectAtDate = data.find(
      (dataOne) =>
        new Date(dataOne.representative_time).getTime() === date.getTime()
    );
    const valueAtDate = getValueFromObjectAtDate(
      data,
      valueObjectAtDate,
      prevValue,
      token1Name
    );
    console.log('valueAtDate', valueAtDate);
    prevValue = valueAtDate;
  });
  return prevValue;
}

export function processData(
  data,
  currentServerTime,
  token1Name,
  currentBlockchainRate
) {
  const graphDateArray = [];
  let graphData = [];
  let prevValue = 0;
  let valueAtDate;

  const startTime = currentServerTime.addDays(-1);

  for (let i = 0; i < 24; i++) {
    graphDateArray.push(startTime.addHours(i));
  }

  if (data.length === 0) {
    // If no data retrieved from DB at all, then use the currentBlockchainRate
    graphData = graphDateArray.map((date) => [date, currentBlockchainRate]);
    return graphData;
  }

  graphData = graphDateArray.map((date, idx) => {
    const valueObjectAtDate = data.find(
      (dataOne) =>
        new Date(dataOne.representative_time).getTime() === date.getTime()
    );
    valueAtDate = getValueFromObjectAtDate(
      data,
      valueObjectAtDate,
      prevValue,
      token1Name
    );

    // Special case
    if (idx === 0 && !valueAtDate) {
      valueAtDate = extrapolateStartValueFromPreviousValues(data, token1Name);
    }

    prevValue = valueAtDate;
    return [date, valueAtDate];
  });
  return graphData;
}
