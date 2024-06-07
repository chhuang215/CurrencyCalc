import { useState, useEffect, ChangeEvent } from 'react';
// import reactLogo from './assets/react.svg';
// import viteLogo from '/vite.svg';
// import './App.css';

interface KeyValues {
  amt: number;
  buyRate: number;
  sellRate: number;
  localCurrencyTransferFee: number;
  transferFee: number;
}

function App() {
  // Function to load initial values from sessionStorage
  const kv = ((): KeyValues => {
    const storedResults = window.localStorage.getItem('keyvalues');
    if (storedResults) {
      return JSON.parse(storedResults) as KeyValues;
    } else {
      return { amt: 0, buyRate: 0, sellRate: 0, localCurrencyTransferFee: 0, transferFee: 0 };
    }
  })();

  const [amt, setAmt] = useState(kv.amt ?? 0);
  const [buyRate, setBuyRate] = useState(kv.buyRate ?? 0);
  const [sellRate, setSellRate] = useState(kv.sellRate ?? 0);
  const [localCurrencyTransferFee, setLocalCurrencyTransferFee] = useState(kv.localCurrencyTransferFee ?? 0);
  const [transferFee, setTransferFee] = useState(kv.transferFee ?? 0);

  const [afterSellRateAmt, setAfterSellRateAmt] = useState(amt * sellRate);
  const [afterSellBuyAmt, setAfterSellBuyAmt] = useState(afterSellRateAmt / buyRate);
  const [minAmtForTransfer, setMinAmtForTransfer] = useState((-transferFee * buyRate) / (sellRate - buyRate));

  const handleChangeAmt = (e: ChangeEvent<HTMLInputElement>) => {
    setAmt(parseFloat(e.target.value) || 0);
  };

  const handleChangeBuyRate = (e: ChangeEvent<HTMLInputElement>) => {
    setBuyRate(parseFloat(e.target.value) || 0);
  };
  const handleChangeSellRate = (e: ChangeEvent<HTMLInputElement>) => {
    setSellRate(parseFloat(e.target.value) || 0);
  };
  const handleChangeLocalCurrencyTransferFee = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalCurrencyTransferFee(parseFloat(e.target.value) || 0);
  };
  const handleChangeTransferFee = (e: ChangeEvent<HTMLInputElement>) => {
    setTransferFee(parseFloat(e.target.value) || 0);
  };

  useEffect(() => {
    // if (isNaN(transferFee) || isNaN(buyRate) || isNaN(sellRate)) return;
    setMinAmtForTransfer((-transferFee * buyRate + localCurrencyTransferFee) / (sellRate - buyRate));
  }, [buyRate, sellRate, localCurrencyTransferFee, transferFee]);

  useEffect(() => {
    const v = amt * sellRate;
    setAfterSellRateAmt(parseFloat(v.toFixed(5)));
  }, [amt, sellRate]);

  useEffect(() => {
    const v = (afterSellRateAmt - localCurrencyTransferFee) / buyRate;
    setAfterSellBuyAmt(parseFloat(v.toFixed(5)));
  }, [afterSellRateAmt, buyRate, localCurrencyTransferFee]);

  useEffect(() => {
    if (amt >= 0 && buyRate >= 0 && sellRate >= 0 && transferFee >= 0) {
      window.localStorage.setItem(
        'keyvalues',
        JSON.stringify({
          amt,
          buyRate,
          sellRate,
          localCurrencyTransferFee,
          transferFee,
        })
      );
    }
  }, [amt, buyRate, sellRate, localCurrencyTransferFee, transferFee]);

  return (
    <>
      <h3>What is this?</h3>
      <p>
        This is a simple calculator to help you decide whether to transfer between foreign currencies via exchange or
        through a direct transfer.
      </p>

      <label>Amount $</label>
      <input type="number" defaultValue={kv.amt} onChange={handleChangeAmt} />
      <article>
        <h4>Sell and Buy</h4>
        <label>Sell (Bank A) </label>
        {amt} * <input type="number" defaultValue={kv.sellRate} onChange={handleChangeSellRate} /> = {afterSellRateAmt}
        <label>Bank A to B transfer fee</label>
        {afterSellRateAmt} -{' '}
        <input
          type="number"
          defaultValue={kv.localCurrencyTransferFee}
          onChange={handleChangeLocalCurrencyTransferFee}
        />{' '}
        = {afterSellRateAmt - localCurrencyTransferFee}
        <label>Buy (Bank B)</label>
        {afterSellRateAmt - localCurrencyTransferFee} /{' '}
        <input type="number" defaultValue={kv.buyRate} onChange={handleChangeBuyRate} /> = <b>{afterSellBuyAmt}</b>
        <br />
        <b>Loss: {afterSellBuyAmt - amt}</b>
      </article>

      <article>
        <h4>Direct foreign currency transfer</h4>
        <label>Transfer Fee </label>
        {amt} - <input type="number" defaultValue={kv.transferFee} onChange={handleChangeTransferFee} /> ={' '}
        <b>{amt - transferFee}</b>
        <br />
        <b>Loss: {-transferFee}</b>
      </article>

      <article>
        <p>
          Better to transfer by: <strong>{afterSellBuyAmt - amt > -transferFee ? 'SellAndBuy' : 'transfer'}</strong>
          <br />
          Minimum amount for direct transfer: ${minAmtForTransfer}
        </p>
      </article>
    </>
  );
}

export default App;
