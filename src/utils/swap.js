import moment from 'moment';
const goBackNumberOfDaysExtrapolation = 2;
const daysPerWeek = 7;
const daysPerMonth = 31;

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

function extrapolateStartValueFromPreviousValues(
  data,
  token1Name,
  currentServerTime,
  timeSeries
) {
  let prevValue = 0;
  const previousDateArray = [];
  const startTime = getStartTimeExtrapolation(currentServerTime, timeSeries);

  console.log('Preparing to extrapolateStartValueFromPreviousValues');

  if (timeSeries === 'daily') {
    for (let i = 0; i < 24 * goBackNumberOfDaysExtrapolation; i++) {
      previousDateArray.push(startTime.addHours(i));
    }
  } else {
    for (let i = 0; i < goBackNumberOfDaysExtrapolation; i++) {
      previousDateArray.push(startTime.addDays(i));
    }
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

function getStartTimeExtrapolation(currentServerTime, timeSeries) {
  switch (timeSeries) {
    case 'daily':
      return moment
        .utc(currentServerTime)
        .startOf('hour')
        .add(-(goBackNumberOfDaysExtrapolation + 1), 'days')
        .toDate();
    case 'weekly':
      return moment
        .utc(currentServerTime)
        .startOf('day')
        .add(-(goBackNumberOfDaysExtrapolation + daysPerWeek), 'days')
        .toDate();
    case 'monthly':
      return moment
        .utc(currentServerTime)
        .startOf('day')
        .add(-(goBackNumberOfDaysExtrapolation + daysPerMonth), 'days')
        .toDate();
    default:
      throw new Error('Unknown timeSeries');
  }
}

function getStartTime(currentServerTime, timeSeries) {
  switch (timeSeries) {
    case 'daily':
      return moment
        .utc(currentServerTime)
        .startOf('hour')
        .add(-1, 'days')
        .toDate();
    case 'weekly':
      return moment
        .utc(currentServerTime)
        .startOf('day')
        .add(-daysPerWeek, 'days')
        .toDate();
    case 'monthly':
      return moment
        .utc(currentServerTime)
        .startOf('day')
        .add(-daysPerMonth, 'days')
        .toDate();
    default:
      throw new Error('Unknown timeSeries');
  }
}

export function processData(
  data,
  currentServerTime,
  token1Name,
  currentBlockchainRate,
  timeSeries
) {
  const graphDateArray = [];
  let graphData = [];
  let prevValue = 0;
  let valueAtDate;

  const startTime = getStartTime(currentServerTime, timeSeries);

  if (timeSeries === 'daily') {
    for (let i = 0; i < 24; i++) {
      graphDateArray.push(startTime.addHours(i));
    }
  } else if (timeSeries === 'weekly') {
    for (let i = 0; i < daysPerWeek; i++) {
      graphDateArray.push(startTime.addDays(i));
    }
  } else {
    for (let i = 0; i < daysPerMonth; i++) {
      graphDateArray.push(startTime.addDays(i));
    }
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
      valueAtDate = extrapolateStartValueFromPreviousValues(
        data,
        token1Name,
        currentServerTime,
        timeSeries
      );
    }

    prevValue = valueAtDate;
    return [date, valueAtDate];
  });
  return graphData;
}
