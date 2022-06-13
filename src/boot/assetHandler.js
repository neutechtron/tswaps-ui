// Gets decimal from base token extended_asset {quantity: '2000.0000 AB', contract: 'notslptokens'}
const exAssToPrecision = (extended_asset) => {
  let idx = extended_asset.quantity.indexOf(" ");
  let quantity = extended_asset.quantity.slice(0, idx);
  return decimalCount(quantity);
};

// Gets symbol from base token extended_asset {quantity: '2000.0000 AB', contract: 'notslptokens'}
const exAssToSymbol = (extended_asset) => {
  let idx = extended_asset.quantity.indexOf(" ") + 1;
  let sym = extended_asset.quantity.slice(idx);
  return sym;
};

// Returns decimal count of number to determine precision: 2000.0000 => 4
const decimalCount = (num) => {
  // Convert to String
  const numStr = String(num);
  // String Contains Decimal
  if (numStr.includes(".")) {
    return numStr.split(".")[1].length;
  }
  // String Does Not Contain Decimal
  return 0;
};

// Gets quantity from base token extended_asset {quantity: '2000.0000 AB', contract: 'notslptokens'}
const getQuantity = (extended_asset) => {
  let idx = extended_asset.quantity.indexOf(" ");
  let quantity = extended_asset.quantity.slice(0, idx);
  return parseFloat(quantity);
};

// Gets contract from base token extended_symbol { "sym": "4,START", "contract": "token.start" }
const exSymToContract = (extended_symbol) => {
  return extended_symbol.contract;
};

// Gets symbol from base token extended_symbol { "sym": "4,START", "contract": "token.start" }
const getSymFromAsset = (extended_asset) => {
  let idx = extended_asset.sym.indexOf(",") + 1;
  let sym = extended_asset.sym.slice(idx);
  return sym;
};

// Gets symbol from base token extended_symbol { "sym": "4,START", "contract": "token.start" }
const getDecimalFromAsset = (extended_asset) => {
  let idx = extended_asset.sym.indexOf(",");
  let quantity = extended_asset.sym.slice(0, idx);
  return parseFloat(quantity);
};

// Takes value to Telos asset format of "5.0000 TLOS"
const toAsset = (number, decimals, symbol) => {
  return String(parseFloat(number).toFixed(decimals)) + String(" " + symbol);
};

// Asset "5.0000 TLOS" to amount
const assetToAmount = (asset, decimals = -1) => {
  try {
    let qty = asset.split(" ")[0];
    qty = parseFloat(qty);
    if (decimals > -1) qty = qty.toFixed(decimals);
    return qty;
  } catch (error) {
    return asset;
  }
};

// Asset "5.0000 TLOS" to precision
const assetToPrecision = (asset) => {
  if (asset.length > 0) {
    let commaidx = asset.indexOf(".") + 1;
    let spaceidx = asset.indexOf(" ");
    const precision = asset.slice(commaidx, spaceidx).length;
    return precision;
  } else return 0;
};

// Gets symbol from chain string e.g. TLOS from "0.0000 TLOS"
const chainToSym = function (str) {
  try {
    return str.split(" ")[1];
  } catch (error) {
    return str;
  }
};

// Gets amount of decimal from chain string e.g. 4 from "0.0000 TLOS"
const chainToDecimals = function (str) {
  if (str.length > 0) {
    let commaidx = str.indexOf(".") + 1;
    let spaceidx = str.indexOf(" ");
    const precision = str.slice(commaidx, spaceidx).length;
    return precision;
  } else return 0;
};

// Asset "5.0000 TLOS" to symbol
const assetToSymbol = (asset) => {
  try {
    return asset.split(" ")[1];
  } catch (error) {
    return asset;
  }
};

const truncate = (n, digits) => {
  var step = Math.pow(10, digits || 0);
  var temp = Math.trunc(step * n);

  return temp / step;
};

const chainToQty = function (str, decimals = -1) {
  try {
    let qty = str.split(" ")[0];
    qty = parseFloat(qty);
    if (decimals > -1) qty = qty.toFixed(decimals);
    return qty;
  } catch (error) {
    return str;
  }
};

export default async ({ Vue, store }) => {
  Vue.prototype.$exAssToPrecision = exAssToPrecision;
  Vue.prototype.$exAssToSymbol = exAssToSymbol;
  Vue.prototype.$exSymToContract = exSymToContract;
  Vue.prototype.$toAsset = toAsset;
  Vue.prototype.$assetToAmount = assetToAmount;
  Vue.prototype.$assetToPrecision = assetToPrecision;
  Vue.prototype.$assetToSymbol = assetToSymbol;
  Vue.prototype.$getQuantity = getQuantity;
  Vue.prototype.$truncate = truncate;
  Vue.prototype.$getSymFromAsset = getSymFromAsset;
  Vue.prototype.$getDecimalFromAsset = getDecimalFromAsset;
  Vue.prototype.$chainToQty = chainToQty;
  Vue.prototype.$chainToSym = chainToSym;
  Vue.prototype.$chainToDecimals = chainToDecimals;
  store["$exAssToPrecision"] = exAssToPrecision;
  store["$exAssToSymbol"] = exAssToSymbol;
  store["$exSymToContract"] = exSymToContract;
  store["$toAsset"] = toAsset;
  store["$assetToAmount"] = assetToAmount;
  store["$assetToPrecision"] = assetToPrecision;
  store["$assetToSymbol"] = assetToSymbol;
  store["$getQuantity"] = getQuantity;
  store["$truncate"] = truncate;
  store["$getSymFromAsset"] = getSymFromAsset;
  store["$getDecimalFromAsset"] = getDecimalFromAsset;
  store["$chainToQty"] = chainToQty;
  store["$chainToSym"] = chainToSym;
  store["$chainToDecimals"] = chainToDecimals;
};
