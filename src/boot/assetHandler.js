// Gets decimal from base token extended_symbol { "sym": "4,START", "contract": "token.start" }
const exSymToPrecision = extended_symbol => {
  let idx = extended_symbol.sym.indexOf(",");
  let decimal = extended_symbol.sym.slice(0, idx);
  return decimal;
};

// Gets symbol from base token extended_symbol { "sym": "4,START", "contract": "token.start" }
const exSymToSymbol = extended_symbol => {
  let idx = extended_symbol.sym.indexOf(",") + 1;
  let sym = extended_symbol.sym.slice(idx);
  return sym;
};

// Gets contract from base token extended_symbol { "sym": "4,START", "contract": "token.start" }
const exSymToContract = extended_symbol => {
  return extended_symbol.contract;
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
const assetToPrecision = asset => {
  if (asset.length > 0) {
    let commaidx = asset.indexOf(".") + 1;
    let spaceidx = asset.indexOf(" ");
    const precision = asset.slice(commaidx, spaceidx).length;
    return precision;
  } else return 0;
};

// Asset "5.0000 TLOS" to symbol
const assetToSymbol = asset => {
  try {
    return asset.split(" ")[1];
  } catch (error) {
    return asset;
  }
};

export default async ({ Vue, store }) => {
  Vue.prototype.$exSymToPrecision = exSymToPrecision;
  Vue.prototype.$exSymToSymbol = exSymToSymbol;
  Vue.prototype.$exSymToContract = exSymToContract;
  Vue.prototype.$toAsset = toAsset;
  Vue.prototype.$assetToAmount = assetToAmount;
  Vue.prototype.$assetToPrecision = assetToPrecision;
  Vue.prototype.$assetToSymbol = assetToSymbol;
  store["$exSymToPrecision"] = exSymToPrecision;
  store["$exSymToSymbol"] = exSymToSymbol;
  store["$exSymToContract"] = exSymToContract;
  store["$toAsset"] = toAsset;
  store["$assetToAmount"] = assetToAmount;
  store["$assetToPrecision"] = assetToPrecision;
  store["$assetToSymbol"] = assetToSymbol;
};
