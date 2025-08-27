import React, { useEffect, useState } from "react";
import "./polish.css";
import Paywall from "./components/Paywall/Paywall";
import MainApp from "./components/MainApp";

export default function App() {
  const [isPro, setIsPro] = useState(
    typeof window !== "undefined" && localStorage.getItem("isPro") === "1"
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const pay = new URLSearchParams(window.location.search).get("pay");
    if(pay === "success") {
      localStorage.setItem("isPro", "1");
      setIsPro(true);
    }
  },[]);

  return (
    <main className="max-w-5xl mx-auto px-4 py-3">
      {isPro ? <MainApp /> : <Paywall />}
    </main>
  );
}