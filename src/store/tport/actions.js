import { ethers } from "ethers";
import erc20Abi from 'erc-20-abi';

// Get evm bridge tokens from tokens table of tport.start
export const updateTPortTokens = async function ({ commit, getters }) {
    try {
        let tokens = [];
        const tableResults = await this.$api.getTableRows({
            code: process.env.TPORT_ADDRESS,
            scope: process.env.TPORT_ADDRESS,
            table: "tokens",
            limit: 10000,
            reverse: false,
            show_payer: false,
        });
        for (let asset of tableResults.rows) {
            asset = {
                ...asset,
                symbol: this.$getSymFromAsset(asset.token),
                decimals: this.$getDecimalFromAsset(asset.token),
                contract: asset.token.contract,
                amount: 0,
            };
            tokens.push(asset);
        }
        commit("setTPortTokens", { tokens });
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateTeleports = async function ({ commit }, account) {
    try {
        if (account !== null) {
            let res = await this.$api.getTableRows({
                code: process.env.TPORT_ADDRESS,
                scope: process.env.TPORT_ADDRESS,
                table: "teleports",
                key_type: "i64",
                index_position: 2,
                lower_bound: account,
                upper_bound: account,
                limit: 10000,
                reverse: true,
                show_payer: false,
            });

            let teleports = [];
            res.rows.forEach((r) => {
                r.processing = r.oracles.length <= 1;
                teleports.push(r);
            });

            var options = {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
            };
            teleports = teleports
                .map((t) => {
                    if (t.date) {
                        t.time = new Date(t.date + "Z").valueOf();
                        t.displaydate = new Date(t.date + "Z");
                    } else {
                        t.displaydate = new Date(t.time * 1000).toLocaleDateString(
                            "en-US",
                            options
                        );
                    }
                    return t;
                })
                .sort((a, b) => (a.time < b.time ? 1 : -1));

            // console.log("Teleports:", teleports);
            commit("setTeleports", { teleports });
        }
    } catch (error) {
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateNativeTransactions = async function ({ 
    getters,
    commit
 }) {
    try {
        if (getters.getEvmAccountName) {
            commit("setEvmTransactionsUpdating",true);
            const hyperion = this.$api.hyperion;
            let path = `/v2/evm/get_transactions?address=${getters.getEvmAccountName}`;
            let res = await hyperion.get(path);
            let contractHash = "0xc2c93abca2f643a466435433928f08ce53d4f09d";
            let contractAbi = [{"inputs":[{"internalType":"string","name":"_symbol","type":"string"},{"internalType":"string","name":"_name","type":"string"},{"internalType":"uint8","name":"_decimals","type":"uint8"},{"internalType":"uint256","name":"__totalSupply","type":"uint256"},{"internalType":"uint8","name":"_threshold","type":"uint8"},{"internalType":"uint8","name":"_thisChainId","type":"uint8"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"tokenOwner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"uint64","name":"id","type":"uint64"},{"indexed":false,"internalType":"address","name":"toAddress","type":"address"},{"indexed":false,"internalType":"address","name":"tokenAddress","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"Claimed","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"_from","type":"address"},{"indexed":true,"internalType":"address","name":"_to","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":false,"internalType":"string","name":"to","type":"string"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"chainId","type":"uint256"}],"name":"Teleport","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"Transfer","type":"event"},{"inputs":[],"name":"_totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"acceptOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"remaining","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"}],"name":"approveAndCall","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenOwner","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"balance","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes","name":"sigData","type":"bytes"},{"internalType":"bytes[]","name":"signatures","type":"bytes[]"}],"name":"claim","outputs":[{"internalType":"address","name":"toAddress","type":"address"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint64","name":"","type":"uint64"}],"name":"claimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"newOwner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"bytes32","name":"message","type":"bytes32"},{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"recoverSigner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"bytes","name":"sig","type":"bytes"}],"name":"splitSignature","outputs":[{"internalType":"uint8","name":"","type":"uint8"},{"internalType":"bytes32","name":"","type":"bytes32"},{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"string","name":"source","type":"string"}],"name":"stringToBytes32","outputs":[{"internalType":"bytes32","name":"result","type":"bytes32"}],"stateMutability":"pure","type":"function"},{"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"string","name":"to","type":"string"},{"internalType":"uint256","name":"tokens","type":"uint256"},{"internalType":"uint256","name":"chainid","type":"uint256"}],"name":"teleport","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"thisChainId","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"threshold","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"tokenAddress","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferAnyERC20Token","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"tokens","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"_newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"newChainId","type":"uint8"}],"name":"updateChainId","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint8","name":"newThreshold","type":"uint8"}],"name":"updateThreshold","outputs":[{"internalType":"bool","name":"success","type":"bool"}],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
            let contractTrxs = res.data.transactions.filter((trx) => trx.to === contractHash);
            var tokenTransfersInfo = [];
            for (var i = 0; i < contractTrxs.length; i++) {
                var trx = contractTrxs[i];
                var logs = trx.logs;
                for (var j = 0; j < logs.length; j++) {
                    var log = logs[j];
                    var data = log.data;
                    var topics = log.topics;
                    var iface = new ethers.utils.Interface(contractAbi);
                    try {
                        var tokenTrxReturn = iface.parseLog({ data, topics });
                        function hex_to_ascii(str1) {
                            var hex  = str1.toString();
                            var str = '';
                            for (var n = 0; n < hex.length; n += 2) {
                                str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
                            }
                            return str;
                        }
                        if (tokenTrxReturn.name == "Teleport") {
                            tokenTransfersInfo.push({...tokenTrxReturn.args, ref: trx.hash});
                        }
                    }
                    catch (error) {

                    }
                }
            }
            var refs = tokenTransfersInfo.map((tokenTransferInfo) => { return tokenTransferInfo.ref});
            let receipts = await this.$api.getTableRows({
                code: process.env.TPORT_ADDRESS,
                scope: process.env.TPORT_ADDRESS,
                table: "receipts",
                key_type: "i64",
                limit: 10000,
                reverse: true,
                show_payer: false,
            });
            var obj = {};
            receipts.rows.map((row)=>{
                if (refs.includes(`0x${row.ref}`)) {
                    var newRowObj = {...row};
                    delete newRowObj.ref;
                    obj[row.ref] = newRowObj;
                }
            });
            console.log(obj);
            let tokenTransfersInfoFinal = tokenTransfersInfo.map((tti) => {
                var ref = tti.ref.replace("0x","");
                return {
                    ...tti,
                    quantity: obj[ref].quantity,
                    date: obj[ref].date,
                    // chain_id: obj[ref].from_chain_id,
                };
            });
            commit("setEvmTransactions",{transactions:tokenTransfersInfoFinal});
            commit("setEvmTransactionsUpdating",false);
        }
    }
    catch (error) {
    }
};

export const updateTportTokenBalances12 = async function (
    { rootGetters, dispatch },
    injectedWeb3,
    web3,
    erc20abi
) {
    if (rootGetters["bridge/getToNative"]) {
        return dispatch("updateTportTokenBalancesEvm", {
            injectedWeb3,
            web3,
            erc20abi,
        });
    } else {
        return dispatch("updateTportTokenBalancesNative");
    }
};

export const updateTportTokenBalances = async function ({
    commit,
    getters,
    rootGetters,
}) {
    try {
        var accountName = rootGetters["account/accountName"];
        if (accountName !== null) {
            let tokens = getters.getTPortTokens;
            const rpc = this.$api.getRpc();
            for (const token of tokens) {
                try {
                    let balance = (
                        await rpc.get_currency_balance(
                            token.contract,
                            accountName,
                            token.symbol
                        )
                    )[0];
                    // console.log("balance:")
                    // console.log(balance)
                    if (balance !== undefined) {
                        let precision = this.$assetToPrecision(balance);
                        if (token.token.decimals === 0) {
                            commit("setTokenPrecision", {
                                token: token,
                                precision: precision,
                            });
                        }
                        commit("setTokenAmount", {
                            token: token,
                            amount: this.$assetToAmount(balance),
                        });
                    } else {
                        commit("setTokenAmount", { token: token, amount: 0 });
                    }
                } catch (error) {
                    commit("setTokenAmount", { token: token, amount: 0 });
                }
            }
        }
    } catch (error) {
        console.log("Error getting chain token balance:", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

export const updateTportTokenBalancesEvm = async function (
    { commit, getters, rootGetters }
) {
    try {
        if (getters.getEvmChainId && getters.getEvmAccountName) {
            const { injectedWeb3, web3 } = await this._vm.$web3();
            let tokens = getters.getTPortTokens;
            let balance = 0;
            for (const token of tokens) {
                try {
                    if (injectedWeb3) {
                        if (
                            wrongNetwork(
                                getters.getEvmNetwork,
                                rootGetters["bridge/getFromChain"]
                            )
                        )
                            balance = 0;
                        else {
                            // console.log("TPort token:", token);
                            if (typeof token === "undefined") {
                                console.error("TPort Token not found");
                            } else {
                                const remoteContractAddress = token.remote_contracts.find(
                                    (el) => el.key === getters.getEvmRemoteId
                                ).value;
                                // console.log("remoteContractAddress:", remoteContractAddress);
                                const remoteInstance = new web3.eth.Contract(
                                    this._vm.$erc20Abi,
                                    remoteContractAddress
                                ); // TODO Add check to validate abi
                                // console.log("remoteInstance:", remoteInstance);
                                const remotebalance = await remoteInstance.methods
                                    .balanceOf(getters.getEvmAccountName)
                                    .call();
                                balance = Number(
                                    parseFloat(
                                        ethers.utils
                                            .formatUnits(
                                                remotebalance,
                                                await remoteInstance.methods.decimals().call()
                                            )
                                            .toString()
                                    ).toFixed(token.decimals)
                                );
                                // console.log("Balance is:", balance);

                            }
                        }
                    }

                    if (balance !== undefined) {
                        let precision = this.$assetToPrecision(balance);
                        if (token.token.decimals === 0) {
                            commit("setTokenPrecision", {
                                token: token,
                                precision: precision,
                            });
                        }
                        commit("setTokenAmount", {
                            token: token,
                            amount: this.$assetToAmount(balance),
                        });
                    } else {
                        commit("setTokenAmount", { token: token, amount: 0 });
                    }
                } catch (error) {
                    commit("setTokenAmount", { token: token, amount: 0 });
                }
                // console.log("balance:", balance);
            }
        }
    } catch (error) {
        console.log("Error getting chain token balance:", error);
        commit("general/setErrorMsg", error.message || error, { root: true });
    }
};

function wrongNetwork(evmNetwork, selectedNetwork) {
    if (evmNetwork) {
        return (
            evmNetwork.name.toUpperCase() !==
            selectedNetwork.NETWORK_NAME.toUpperCase()
        );
    } else return true;
}

export const updateWeb3 = async function ({ commit }, web3, injectedWeb3) {
    commit("setWeb3", web3);
    commit("setInjectedWeb3", injectedWeb3);
};
