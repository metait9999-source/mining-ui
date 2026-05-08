import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";
import TransactionList from "./Transactionlist";

const Deposit = ({ openTransactionHistory }) => {
  const [deposits, setDeposits] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { setLoading, user } = useUser();
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/deposits/user/${user.id}`);
        const data = await res.json();
        if (res.status !== 404) setDeposits(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [setLoading, user, refresh]);

  useEffect(() => {
    const handler = (data) => {
      if (data?.deposit.status === "approved")
        toast.success("Deposit accepted");
      else toast.error("Deposit rejected");
      if (["approved", "rejected"].includes(data?.deposit.status))
        setRefresh((v) => !v);
    };
    socket?.on("updateDeposit", handler);
    return () => socket?.off("updateDeposit", handler);
  }, [socket]);

  return (
    <TransactionList
      items={deposits}
      type="deposit"
      emptyLabel="No deposits found"
      openTransactionHistory={openTransactionHistory}
    />
  );
};

export default Deposit;
