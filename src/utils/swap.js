/* Logic of processData()
/* ==============================================
/* Note: all times are relative to DB's current timestamp. The data fetched from
/* the DB contains a column 'representative_time'. This column contains the
/* timestamp that represents the price values of that particular record.
/* It is the start of the hour in the case of 'daily', and start of the day in
/* case of 'weekly' or 'monthly' time series. In order words, the record fetched
/* will contain the closing values for that particular hour or day.
/*
/* 1. We have to calculate the start and end date of the data for the graph.
/*    End date - for daily, is the (start of the current hour - 1 hour).
/*               For weekly/monthly, it is the (start of the current day - 1 day)
/*    Start date - for daily, it is (End date - 1 day). For weekly, it is
/*                 (End date - 7 days). For monthly, it is (End date - 31 days).
/*
/* 2. We check to see if there are any records returned from the DB. If yes,
/*    proceed to the next step. If not, use the current value coming from the
/*    blockchain as a constant value for all the values in the graph.
/*
/* 3. We check to see if there is a record from DB for the start date. If yes,
/*    use that value and proceed to check for the next hour or day until we reach
/*    End date. If an intermediate value is missing, then simply use the previous
/*    value instead.
/*
/* 4. If there was no record for the start date, then we need to look at the
/*    previous values (for the duration of the constant
/*   'goBackNumberOfDaysExtrapolation'), to see if there are any values to be found.
/*    If not, then use zero as the starting value for step 3.
/*
/* Underlying assumption:
/* ======================
/* The DB will only have records for either (token1 = EOS and token2 = TLOS) or
/* (token1 = TLOS and token2 = EOS), but not a mixture of both types.
*/

import moment from 'moment';
const goBackNumberOfDaysExtrapolation = 2;
const daysPerWeek = 7;
const daysPerMonth = 31;

const debugModeOn = false;

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

  debugModeOn &&
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

  debugModeOn && console.log('previousDateArray', previousDateArray);

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
    prevValue = valueAtDate;
  });
  debugModeOn && console.log('extrapolated Start Value', prevValue);
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
