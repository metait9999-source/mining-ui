import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/getApiURL";

const useDepositAddresses = (userId) => {
  const [addresses, setAddresses] = useState(null);

  useEffect(() => {
    if (!userId) return;
    axios
      .get(`${API_BASE_URL}/users/${userId}/deposit-addresses`)
      .then((res) => setAddresses(res.data))
      .catch(() => setAddresses(null));
  }, [userId]);

  return { addresses };
};

export default useDepositAddresses;
