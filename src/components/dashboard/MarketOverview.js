"use client";

import { formatCurrency } from "@/constants/markets";

export default function MarketOverview({ quotes, tickers, currency = "USD" }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
      {tickers.map((ticker) => {
        const q = quotes[ticker.ticker || ticker];
        if (!q) return null;

        const key = ticker.ticker || ticker;
        const isUp = q.change >= 0;
        const color = isUp ? "text-emerald-600" : "text-red-500";
        const bgColor = isUp ? "bg-emerald-50" : "bg-red-50";
        const arrow = isUp ? "\u25B2" : "\u25BC";

        return (
          <div
            key={key}
            className="flex-shrink-0 w-[150px] card !p-3 hover:border-accent transition-colors cursor-default"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-mono text-[12px] font-bold text-text">
                {(ticker.ticker || ticker).split(".")[0]}
              </span>
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${bgColor} ${color}`}>
                {arrow} {Math.abs(q.changePct).toFixed(1)}%
              </span>
            </div>
            <p className={`font-mono text-[16px] font-bold ${color}`}>
              {formatCurrency(q.price, q.currency || currency)}
            </p>
            <p className={`font-mono text-[10px] ${color}`}>
              {isUp ? "+" : ""}{q.change?.toFixed(2)}
            </p>
          </div>
        );
      })}
    </div>
  );
}
