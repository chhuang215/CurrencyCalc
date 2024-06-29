import { useState, useEffect, ChangeEvent } from 'react';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
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
  return (
    <>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="calc1" element={<Calc1 />} />
          <Route path="calc2" element={<Calc2 />} />

          {/* Using path="*"" means "match anything", so this route
                acts like a catch-all for URLs that we don't have explicit
                routes for. */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </>
  );
}

function Layout() {
  return (
    <header>
      {/* A "layout route" is a good place to put markup you want to
          share across all the pages on your site, like navigation. */}
      <nav>
        <Link to="/">/</Link>
        <Link to="/calc1">1</Link>
        <Link to="/calc2">2</Link>
      </nav>

      <hr />

      {/* An <Outlet> renders whatever child route is currently active,
          so you can think about this <Outlet> as a placeholder for
          the child routes we defined above. */}
      <Outlet />
    </header>
  );
}

function Home() {
  return (
    <div>
      <h2>Home</h2>
    </div>
  );
}

function Calc1() {
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

function Calc2() {
  const RATES = {
    '1': {
      regular: 0.0305,
      special: 0.06,
    },
    '3': {
      regular: 0.0345,
      special: 0.054,
    },
  };

  const [termDepositAmt, setTermDepositAmt] = useState<number>(0);
  const [buyRate, setBuyRate] = useState<number>(0);
  const [sellRate, setSellRate] = useState<number>(0);

  const [buyRateAmt, setByRateAmt] = useState<number>(0);
  const [sellRateAmt, setSellRateAmt] = useState<number>(0);

  const [sellBuyLossAmt, setSellBuyLossAmt] = useState<number>(0);

  const [regularInterestAmt3m, setRegularInterestAmt3m] = useState<number>(0);
  const [specialInterestAmt3m, setSpecialInterestAmt3m] = useState<number>(0);

  const [regularInterestAmt1m, setRegularInterestAmt1m] = useState<number>(0);
  const [specialInterestAmt1m, setSpecialInterestAmt1m] = useState<number>(0);

  const handleChangeBuyRate = (e: ChangeEvent<HTMLInputElement>) => {
    setBuyRate(parseFloat(e.target.value) || 0);
  };
  const handleChangeSellRate = (e: ChangeEvent<HTMLInputElement>) => {
    setSellRate(parseFloat(e.target.value) || 0);
  };

  const updateSellRateAmt = () => {
    const v = sellRate * termDepositAmt;
    setSellRateAmt(parseFloat(v.toFixed(5)));
  };

  const updateBuyRateAmt = () => {
    const v = buyRate * termDepositAmt;
    setByRateAmt(parseFloat(v.toFixed(5)));
  };

  const updateSellBuyLossAmt = () => {
    const v = (buyRate - sellRate) * termDepositAmt;
    setSellBuyLossAmt(parseFloat(v.toFixed(5)));
  };

  useEffect(() => {
    setRegularInterestAmt3m(parseFloat((termDepositAmt * ((RATES['3'].regular / 12) * 3)).toFixed(5)));
    setSpecialInterestAmt3m(parseFloat((termDepositAmt * ((RATES['3'].special / 12) * 3)).toFixed(5)));
    setRegularInterestAmt1m(parseFloat((termDepositAmt * (RATES['1'].regular / 12)).toFixed(5)));
    setSpecialInterestAmt1m(parseFloat((termDepositAmt * (RATES['1'].special / 12)).toFixed(5)));
  }, [termDepositAmt]);

  useEffect(updateSellRateAmt, [termDepositAmt, sellRate]);

  useEffect(updateBuyRateAmt, [termDepositAmt, buyRate]);

  useEffect(updateSellBuyLossAmt, [termDepositAmt, sellRate, buyRate]);
  return (
    <>
      <article>
        <h4>Sell and Buy term deposit</h4>
        <label>Deposit amount</label>
        <input
          type="number"
          onChange={(e) => {
            setTermDepositAmt(parseFloat(e.target.value) || 0);
          }}
        />
        <label>Sell Rate </label>
        <input type="number" defaultValue={sellRate} onChange={handleChangeSellRate} /> * {termDepositAmt} ={' '}
        {sellRateAmt}
        <label>Buy Rate </label>
        <input type="number" defaultValue={buyRate} onChange={handleChangeBuyRate} /> * {termDepositAmt} = {buyRateAmt}
        <br />
        (Loss: {sellBuyLossAmt})
        <br />
        <br />
        <h5>3m</h5>
        <label>Regular Interest {RATES['3'].regular * 100}%</label>
        {termDepositAmt} * ({RATES['3'].regular * 100}% / 3 months) = {regularInterestAmt3m} (
        {regularInterestAmt3m * sellRate})
        <br />
        <label>Special Interest {RATES['3'].special * 100}%</label>
        {termDepositAmt} * ({RATES['3'].special * 100}% / 3 months) = {specialInterestAmt3m} (
        {Math.round(specialInterestAmt3m * sellRate * 100000) / 100000} - {sellBuyLossAmt} ={' '}
        {specialInterestAmt3m * sellRate - sellBuyLossAmt})
        <br />
        <h5>1m</h5>
        <label>Regular Interest {RATES['1'].regular * 100}%</label>
        {termDepositAmt} * ({RATES['1'].regular * 100}% / 1 month) = {regularInterestAmt1m} (
        {regularInterestAmt1m * sellRate})
        <br />
        <label>Special Interest {RATES['1'].special * 100}%</label>
        {termDepositAmt} * ({RATES['1'].special * 100}% / 1 month) = {specialInterestAmt1m} (
        {Math.round(specialInterestAmt1m * sellRate * 100000) / 100000} - {sellBuyLossAmt} ={' '}
        {specialInterestAmt1m * sellRate - sellBuyLossAmt})
        <br />
      </article>
    </>
  );
}

export default App;
