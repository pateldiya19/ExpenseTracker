import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

export default function TransactionChart({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Helper to get amountMinor robustly
    const getAmountMinor = (tx) => {
      if (typeof tx.amountMinor === 'number') return tx.amountMinor;
      // fallback if tx.amount is stored in rupees
      if (typeof tx.amount === 'number') return Math.round(tx.amount * 100);
      return 0;
    };

    // Build last 7 days (local dates)
    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      days.push({ dateObj: d, key, label: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) });
    }

    // Initialize map
    const map = {};
    days.forEach(d => {
      map[d.key] = { date: d.label, incomeMinor: 0, expensesMinor: 0 };
    });

    // Accumulate transactions into map by local date
    transactions.forEach(tx => {
      try {
        const dt = new Date(tx.date);
        if (isNaN(dt.getTime())) return; // skip invalid dates
        const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        if (!map[key]) return; // transaction not in last 7 days
        const amt = getAmountMinor(tx) || 0;
        if (tx.type === 'income') map[key].incomeMinor += amt;
        else if (tx.type === 'expense') map[key].expensesMinor += amt;
      } catch (e) {
        // ignore malformed tx
      }
    });

    // Build chartData from map
    return days.map(d => {
      const entry = map[d.key] || { incomeMinor: 0, expensesMinor: 0 };
      const income = entry.incomeMinor / 100;
      const expenses = entry.expensesMinor / 100;
      return { date: d.label, income, expenses, net: income - expenses };
    });
  }, [transactions]);

  const maxValue = useMemo(() => {
    if (!chartData.length) return 100;
    const values = chartData.flatMap(d => [d.income, d.expenses]).filter(v => v > 0);
    if (!values.length) return 100;
    
    const max = Math.max(...values);
    const min = Math.min(...values);
    
    // Smart scaling based on data range
    if (max <= 10) return Math.ceil(max * 1.5);
    if (max <= 100) return Math.ceil(max * 1.3);
    if (max <= 1000) return Math.ceil(max * 1.2);
    
    // For larger values, use a more sophisticated scaling
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    const scaledMax = Math.ceil(max / magnitude) * magnitude;
    return Math.max(scaledMax * 1.1, min * 2);
  }, [chartData]);

  const [hoverIndex, setHoverIndex] = useState(null);

  // Debugging: log chartData and incoming transactions (helps detect date/amount issues)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug('TransactionChart: transactions count=', transactions?.length, 'chartData=', chartData);
  }, [transactions, chartData]);

  const SVGChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted">No data available</p>
        </div>
      );
    }
    const width = 700; // virtual width
    const height = 280; // virtual height
    const padding = 48;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const baselineY = height - padding; // y coordinate for zero

    const groupWidth = chartWidth / chartData.length;
    const barInnerWidth = Math.max(14, Math.min(32, groupWidth * 0.35));

    const getGroupX = (index) => padding + index * groupWidth + groupWidth / 2;
    const valueToHeight = (value) => (value / maxValue) * chartHeight;

    const incomeGradientId = 'incomeGradient';
    const expenseGradientId = 'expenseGradient';

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
        <defs>
          <linearGradient id={incomeGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent-teal))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--accent-teal))" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={expenseGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent-pink))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--accent-pink))" stopOpacity="0.2" />
          </linearGradient>
          <pattern id="chartGrid" width="56" height="32" patternUnits="userSpaceOnUse">
            <path d="M 56 0 L 0 0 0 32" fill="none" stroke={`hsl(var(--chart-grid) / 0.22)`} strokeWidth="1" />
          </pattern>
        </defs>

        <rect x={padding} y={padding} width={chartWidth} height={chartHeight} fill="url(#chartGrid)" rx="8" />

        {/* Bars */}
        {chartData.map((d, i) => {
          const groupX = getGroupX(i);
          const incomeH = valueToHeight(d.income);
          const expenseH = valueToHeight(d.expenses);
          const incomeX = groupX - barInnerWidth - 4;
          const expenseX = groupX + 4;
          const incomeBarH = Math.max(10, incomeH);
          const expenseBarH = Math.max(10, expenseH);
          return (
            <g key={i}>
              {/* Income bar */}
              <rect
                x={incomeX}
                y={baselineY - incomeBarH}
                width={barInnerWidth}
                height={incomeBarH}
                rx={6}
                fill={`url(#${incomeGradientId})`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {/* Income label */}
              <text x={incomeX + barInnerWidth / 2} y={baselineY - incomeBarH - 6} textAnchor="middle" fill={`hsl(var(--accent-teal) / 0.85)`} fontSize="11">{`₹${Number(d.income).toFixed(2)}`}</text>

              {/* Expense bar */}
              <rect
                x={expenseX}
                y={baselineY - expenseBarH}
                width={barInnerWidth}
                height={expenseBarH}
                rx={6}
                fill={`url(#${expenseGradientId})`}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
              />
              {/* Expense label */}
              <text x={expenseX + barInnerWidth / 2} y={baselineY - expenseBarH - 6} textAnchor="middle" fill={`hsl(var(--accent-pink) / 0.85)`} fontSize="11">{`₹${Number(d.expenses).toFixed(2)}`}</text>
            </g>
          );
        })}

        {/* Hover tooltip */}
        {hoverIndex !== null && (
          (() => {
            const i = hoverIndex;
            const groupX = getGroupX(i);
            const tooltipW = 160;
            const tooltipX = Math.min(Math.max(padding, groupX - tooltipW / 2), width - padding - tooltipW);
            const tooltipY = padding + 8;
            return (
              <g>
                <line x1={getGroupX(i)} x2={getGroupX(i)} y1={padding} y2={height - padding} stroke={`hsl(var(--chart-axis) / 0.35)`} strokeDasharray="4 4" />
                <rect x={tooltipX} y={tooltipY} width={tooltipW} height={86} rx={10} fill={`hsl(var(--chart-tooltip-bg))`} stroke={`hsl(var(--chart-tooltip-border))`} />
                <text x={tooltipX + tooltipW / 2} y={tooltipY + 22} textAnchor="middle" fill={`hsl(var(--chart-tooltip-text))`} fontSize="12" fontWeight="600">{chartData[i].date}</text>
                <text x={tooltipX + 12} y={tooltipY + 42} fill="hsl(var(--accent-teal))" fontSize="11">Income</text>
                <text x={tooltipX + tooltipW - 12} y={tooltipY + 42} fill={`hsl(var(--chart-tooltip-text))`} fontSize="11" textAnchor="end">₹{Number(chartData[i].income).toFixed(2)}</text>
                <text x={tooltipX + 12} y={tooltipY + 62} fill="hsl(var(--accent-pink))" fontSize="11">Expense</text>
                <text x={tooltipX + tooltipW - 12} y={tooltipY + 62} fill={`hsl(var(--chart-tooltip-text))`} fontSize="11" textAnchor="end">₹{Number(chartData[i].expenses).toFixed(2)}</text>
                <text x={tooltipX + tooltipW - 12} y={tooltipY + 78} fill={`hsl(var(--accent-teal))`} fontSize="11" textAnchor="end">Net: ₹{Number(chartData[i].net).toFixed(2)}</text>
              </g>
            );
          })()
        )}

        {/* X axis labels */}
        {chartData.map((d, i) => (
          <text key={i} x={getGroupX(i)} y={height - 12} textAnchor="middle" fill="hsl(var(--muted-foreground))" fontSize="12">{d.date}</text>
        ))}

        {/* Y axis ticks */}
        {[0, Math.round(maxValue / 2), Math.round(maxValue)].map((value, i) => {
          const y = baselineY - (value / maxValue) * chartHeight;
          return (
            <g key={i}>
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke={`hsl(var(--chart-grid) / 0.18)`} />
              <text x={12} y={y + 4} fill="hsl(var(--muted-foreground))" fontSize="12">₹{value}</text>
            </g>
          );
        })}

  </svg>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="pro-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">
            Weekly Trend
          </h3>
          <p className="text-sm text-muted">Income vs Expenses (Last 7 days · INR)</p>
        </div>
      </div>

      <div className="h-64">
        <SVGChart />
      </div>

      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--accent-teal))' }}></div>
          <span className="text-sm text-muted">Income (₹)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--accent-pink))' }}></div>
          <span className="text-sm text-muted">Expenses (₹)</span>
        </div>
      </div>
    </motion.div>
  );
}