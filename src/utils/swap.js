const data = require('./daily.json');
const currentServerTime = new Date(
  '2022-07-29T06:31:00.000Z'.substring(0, 13) + ':00:00.000Z'
); // Get the start of the hour

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

function getInvertedTokenOrder(token1Name) {
  // Test only for the first record
  if (data.length > 0) {
    return data[0].token_1 !== token1Name;
  }
  return false;
}

function processData(token1Name = 'EOS', currentBlockchainRate = 2) {
  const graphDateArray = [];
  const invertedTokenOrder = getInvertedTokenOrder(token1Name);
  let graphData = [];
  let prevValue;

  const startTime = currentServerTime.addDays(-1);

  for (let i = 0; i < 24; i++) {
    graphDateArray.push(startTime.addHours(i));
  }

  if (data.length === 0) {
    // If no data retrieved from DB at all, then use the currentBlockchainRate
    graphData = graphDateArray.map((date) => [date, currentBlockchainRate]);
    return graphData;
  }

  graphData = graphDateArray.map((date) => {
    const valueObjectAtDate = data.find(
      (dataOne) =>
        new Date(dataOne.representative_time).getTime() === date.getTime()
    );
    const valueAtDate = valueObjectAtDate
      ? invertedTokenOrder
        ? valueObjectAtDate.price_1 !== 0 // prevent division by zero errors
          ? valueObjectAtDate.price_2 / valueObjectAtDate.price_1
          : prevValue
        : valueObjectAtDate.price_2 !== 0
        ? valueObjectAtDate.price_1 / valueObjectAtDate.price_2
        : prevValue
      : prevValue; // if the current valueObjectAtDate is not found, then use previous value
    prevValue = valueAtDate;
    return [date, valueAtDate];
  });
  return graphData;
}

function main() {
  const graphData = processData();
  console.log('graphData', graphData);
}

function startProcess() {
  try {
    main();
    console.log('All Tasks Done!');
    process.exit();
  } catch (error) {
    console.log(`There's an error with the process: `, error);
  }
}

startProcess();

process.on('unhandledRejection', (err) => {
  console.error(err);
  process.exit(1);
});
