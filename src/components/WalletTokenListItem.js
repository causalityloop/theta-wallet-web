import _ from 'lodash';
import React from "react";
import './WalletTokenListItem.css';
import {NavLink} from 'react-router-dom'
import {Jazzicon} from "@ukstv/jazzicon-react";

class WalletTokenListItem extends React.Component {
    render() {
        const {token, balance} = this.props;
        let balanceStr = balance || "-";

        return (
            <NavLink to={`/wallet/tokens/${token.id}`}
                     className="WalletTokenListItem"
                     activeClassName="WalletTokenListItem--is-active">
                <div className="WalletTokenListItem__token-container">
                    <div className="WalletTokenListItem__active-indicator"/>

                    <div className='WalletTokenListItem__token-icon-wrapper'>
                        {
                            token.iconUrl &&
                            <img src={token.iconUrl}
                                 className="WalletTokenListItem__token-icon"
                            />
                        }
                        {
                            _.isNil(token.iconUrl) &&
                            <Jazzicon address={token.contractAddress} className="WalletTokenListItem__token-icon"/>
                        }
                    </div>
                    <div className="WalletTokenListItem__token-balance-container">
                        <div className="WalletTokenListItem__token-name">
                            {token.symbol}
                        </div>
                        <div className="WalletTokenListItem__token-balance">
                            {balanceStr}
                        </div>
                    </div>
                </div>
            </NavLink>
        );
    }
}

export default WalletTokenListItem;
