import * as actionTypes from "../types/Transactions";
import { zipMap } from "../../utils/Utils";
import _ from 'lodash';

const INITIAL_STATE = {
    isFetchingERC20Transactions : false,
    isFetchingETHTransactions : false,
    isCreatingTransaction : false,

    transactionsByType: {},
    transactionsByHash: {},

    pendingTransaction: {},

    localTransactionsByID: {}
};

function pendingTransactionToLocalTransaction(pendingTransaction, hash){
    let type = null;
    let tokenSymbol = null;

    if(pendingTransaction.currency === "erc20 theta"){
        type = "erc20";
        tokenSymbol = "THETA";
    }
    else if(pendingTransaction.currency === "ethereum"){
        type = "ethereum";
        tokenSymbol = "ETH";
    }

    return {
        from: pendingTransaction.sender,
        to: pendingTransaction.receiver,
        hash: hash,
        type: type,
        token_symbol: tokenSymbol,
        dec_value: pendingTransaction.amount,
        time_stamp: "" + (new Date().getTime() / 1000), //Server returns as a string
        bound: "outbound",
        is_local: true
    };
}

export const transactionsReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        //ERC20 Transactions
        case actionTypes.FETCH_TRANSACTIONS_ERC20_START:{
            return Object.assign({}, state, {
                isFetchingERC20Transactions: true
            });
        }
        case actionTypes.FETCH_TRANSACTIONS_ERC20_END:{
            return Object.assign({}, state, {
                isFetchingERC20Transactions: false
            });
        }
        case actionTypes.FETCH_TRANSACTIONS_ERC20_SUCCESS:{
            let body = action.response.body;
            let transactions = body.transactions;

            return Object.assign({}, state, {
                transactionsByHash: Object.assign({}, state.transactionsByHash, zipMap(transactions.map(({ hash }) => hash), transactions)),
                transactionsByType: Object.assign({}, state.transactionsByType, {"erc20" : transactions})
            });
        }

        //ETH Transactions
        case actionTypes.FETCH_TRANSACTIONS_ETH_START:{
            return Object.assign({}, state, {
                isFetchingETHTransactions: true
            });
        }
        case actionTypes.FETCH_TRANSACTIONS_ETH_END:{
            return Object.assign({}, state, {
                isFetchingETHTransactions: false
            });
        }
        case actionTypes.FETCH_TRANSACTIONS_ETH_SUCCESS:{
            let body = action.response.body;
            let transactions = body.transactions;

            return Object.assign({}, state, {
                transactionsByHash: Object.assign({}, state.transactionsByHash, zipMap(transactions.map(({ hash }) => hash), transactions)),
                transactionsByType: Object.assign({}, state.transactionsByType, {"ethereum" : transactions})
            });
        }

        //Create Transaction
        case actionTypes.CREATE_TRANSACTION_START:{
            return Object.assign({}, state, {
                isCreatingTransaction: true,
                pendingTransaction: action.metadata.transactionData
            });
        }
        case actionTypes.CREATE_TRANSACTION_END:{
            return Object.assign({}, state, {
                isCreatingTransaction: false
            });
        }
        case actionTypes.CREATE_TRANSACTION_SUCCESS:{
            let body = action.response.body;
            let hash = body.hash;
            let localTransaction = pendingTransactionToLocalTransaction(state.pendingTransaction, hash);

            return Object.assign({}, state, {
                localTransactionsByID: Object.assign({}, state.localTransactionsByID, {[hash]: localTransaction}),
                pendingTransaction: null
            });
        }

        //Fetch Transaction
        case actionTypes.FETCH_TRANSACTION_SUCCESS:{
            let body = action.response.body;
            let transactions = body.transactions;
            let transaction = null;

            if(transactions.length > 0){
                transaction = transactions[0];

                return Object.assign({}, state, {
                    //Remove the local transaction from the state since it is in the blockchain now
                    localTransactionsByID: _.omit(state.localTransactionsByID, transaction.hash)
                });
            }

            return state;
        }

        //Reset all state (useful when recovering a wallet which may have another wallet's state stored in memory))
        case actionTypes.RESET:{
            return INITIAL_STATE;
        }

        default:{
            return state
        }
    }
};