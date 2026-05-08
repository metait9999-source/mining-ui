import React, { useState, useEffect } from "react";
import { useUser } from "../../context/UserContext";
import { API_BASE_URL } from "../../api/getApiURL";
import { useSocketContext } from "../../context/SocketContext";
import toast from "react-hot-toast";
import TransactionList from "./Transactionlist";

const Withdraw = ({ openTransactionHistory }) => {
  const [withdraws, setWithdraws] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const { setLoading, user } = useUser();
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/withdraws/user/${user.id}`);
        const data = await res.json();
        if (res.status !== 404) setWithdraws(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [setLoading, user, refresh]);

  useEffect(() => {
    const handler = (data) => {
      if (data?.withdraw.status === "approved")
        toast.success("Withdraw accepted");
      else toast.error("Withdraw rejected");
      if (["approved", "rejected"].includes(data?.withdraw.status))
        setRefresh((v) => !v);
    };
    socket?.on("updateWithdraw", handler);
    return () => socket?.off("updateWithdraw", handler);
  }, [socket]);

  return (
    <TransactionList
      items={withdraws}
      type="withdraw"
      emptyLabel="No withdrawals found"
      openTransactionHistory={openTransactionHistory}
    />
  );
};

export default Withdraw;
