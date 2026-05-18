import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

const useCryptoTradeConverter = () => {
  const [usdt, setUsdt] = useState(1);
  const { setLoading } = useUser();
  const [error, setError] = useState(null);

  const fetchCoinData = async (coin_id) => {
    const apiUrl = `https://api.coinlore.net/api/ticker/?id=${coin_id}`;
    try {
      const response = await fetch(apiUrl);
      const data = await response.json();
      if (data && data.length > 0) {
        return data[0];
      }
    } catch (err) {
      setError(err.message);
    }
    return null;
  };

  const getUSDTMarket = async () => {
    const usdtData = await fetchCoinData(518);
    if (usdtData) {
      setUsdt(usdtData.price_usd);
      return usdtData.price_usd; // ✅ return the value directly
    }
    return 1;
  };

  const convertCoinToUSDT = async (balance, coin_id) => {
    const usdtPrice = await getUSDTMarket();
    const coin = await fetchCoinData(coin_id);
    if (coin && usdtPrice) {
      const raw =
        (parseFloat(balance) * parseFloat(coin.price_usd)) /
        parseFloat(usdtPrice);
      return parseFloat(raw.toFixed(7)); // ✅ raw number, not formatted string
    }
    return 0;
  };

  const convertUSDTToCoin = async (amount, coin_id) => {
    const usdtPrice = await getUSDTMarket();
    const coin = await fetchCoinData(coin_id);
    if (coin && usdtPrice) {
      const raw =
        (parseFloat(amount) * parseFloat(usdtPrice)) /
        parseFloat(coin.price_usd);
      return parseFloat(raw.toFixed(7)); // ✅ raw number, not formatted string
    }
    return 0;
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await getUSDTMarket();
      setLoading(false);
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    usdt,
    error,
    convertCoinToUSDT,
    convertUSDTToCoin,
  };
};

export default useCryptoTradeConverter;
