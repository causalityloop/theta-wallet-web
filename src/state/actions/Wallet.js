import Api from '../../services/Api'
import { reduxFetch } from'./Api'
import {FETCH_WALLET_BALANCES, SET_GAS_PRICE, SET_WALLET_ADDRESS, SET_WALLET_NAME, RESET} from "../types/Wallet";
import Wallet from '../../services/Wallet'
import TemporaryState from "../../services/TemporaryState";
import {resetTransactionsState} from './Transactions'

export function fetchWalletBalances(){
    let address = Wallet.getWallet().address;

    return reduxFetch(FETCH_WALLET_BALANCES, function(){
        return Api.fetchWallet(address);
    });
}

export function resetWalletState(){
    return {
        type: RESET,
    }
}

export function setWalletAddress(address){
    return {
        type: SET_WALLET_ADDRESS,
        address: address
    }
}

export function setWalletName(name){
    return {
        type: SET_WALLET_NAME,
        name: name
    }
}

export function setGasPrice(gasPrice){
    return {
        type: SET_GAS_PRICE,
        gasPrice: gasPrice
    }
}

export function restoreWallet(){
    return async function(dispatch, getState){
        //Fetch the wallet address from storage
        let address = await Wallet.getAddress();
        let name = await Wallet.getName();

        //Update state
        if(address){
            dispatch(setWalletAddress(address));
            dispatch(setWalletName(name));
        }
    };
}

export function storeWallet(wallet){
    return async function(dispatch, getState){
        let { address, privateKey, name } = wallet;

        //Store the wallet
        await Wallet.setAddress(address);
        await Wallet.setPrivateKey(privateKey);
        await Wallet.setName(name);

        //Delete the temp state
        TemporaryState.setMnemonic(null);
        TemporaryState.setWallet(null);

        //Update state
        dispatch(setWalletAddress(address));
        dispatch(setWalletName(name));
    };
}

export function clearWallet(){
    return async function(dispatch, getState){
        //Clear the wallet
        await Wallet.setAddress(null);
        await Wallet.setPrivateKey(null);
        await Wallet.setName(null);
        await Wallet.setPinCode(null);

        //Delete the temp state
        TemporaryState.setMnemonic(null);
        TemporaryState.setWallet(null);

        //Reset wallet state
        dispatch(resetWalletState());

        //Reset transactions state
        dispatch(resetTransactionsState());
    };
}