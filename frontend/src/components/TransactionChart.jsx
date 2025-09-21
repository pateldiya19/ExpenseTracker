import { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function TransactionChart({ transactions }) {
  const chartData = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const getAmountMinor = (tx) => {
      if (typeof tx.amountMinor === 'number') return tx.amountMinor;
      if (typeof tx.amount === 'number') return Math.round(tx.amount * 100);
      return 0;
    };

    const days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      days.push({ dateObj: d, key, label: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) });
    }

    const map = {};
    days.forEach(d => {
      map[d.key] = { date: d.label, incomeMinor: 0, expensesMinor: 0 };
    });

    transactions.forEach(tx => {
      try {
        const dt = new Date(tx.date);
        if (isNaN(dt.getTime())) return;
        const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
        if (!map[key]) return;
        const amt = getAmountMinor(tx) || 0;
        if (tx.type === 'income') map[key].incomeMinor += amt;
        else if (tx.type === 'expense') map[key].expensesMinor += amt;
      } catch (e) {}
    });

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
    return Math.ceil(max * 1.2);
  }, [chartData]);

  const [hoverIndex, setHoverIndex] = useState(null);

  const SVGChart = () => {
    if (!chartData.length) return <div className="flex items-center justify-center h-full text-muted">No data available</div>;

    const width = 700;
    const height = 280;
    const padding = 48;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const baselineY = height - padding;

    const groupWidth = chartWidth / chartData.length;
    const barInnerWidth = Math.max(14, Math.min(32, groupWidth * 0.35));
    const getGroupX = (index) => padding + index * groupWidth + groupWidth / 2;
    const valueToHeight = (value) => (value / maxValue) * chartHeight;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
        <defs>
          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent-teal,26,188,156))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--accent-teal,26,188,156))" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--accent-pink,236,72,153))" stopOpacity="0.85" />
            <stop offset="100%" stopColor="hsl(var(--accent-pink,236,72,153))" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Bars */}
        {chartData.map((d, i) => {
          const groupX = getGroupX(i);
          const incomeH = valueToHeight(d.income);
          const expenseH = valueToHeight(d.expenses);
          const incomeX = groupX - barInnerWidth - 4;
          const expenseX = groupX + 4;

          return (
            <g key={i}>
              {/* Income */}
              <rect x={incomeX} y={baselineY - incomeH} width={barInnerWidth} height={Math.max(10, incomeH)} rx={6} fill="url(#incomeGradient)"
                onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} />
              <text x={incomeX + barInnerWidth / 2} y={baselineY - incomeH - 6} textAnchor="middle" fill="hsl(var(--accent-teal,26,188,156)/0.85)" fontSize="11">₹{d.income.toFixed(2)}</text>

              {/* Expense */}
              <rect x={expenseX} y={baselineY - expenseH} width={barInnerWidth} height={Math.max(10, expenseH)} rx={6} fill="url(#expenseGradient)"
                onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)} />
              <text x={expenseX + barInnerWidth / 2} y={baselineY - expenseH - 6} textAnchor="middle" fill="hsl(var(--accent-pink,236,72,153)/0.85)" fontSize="11">₹{d.expenses.toFixed(2)}</text>
            </g>
          );
        })}

        {/* X axis */}
        {chartData.map((d, i) => (
          <text key={i} x={getGroupX(i)} y={height - 12} textAnchor="middle" fill="hsl(var(--muted-foreground,100,116,139))" fontSize="12">{d.date}</text>
        ))}

        {/* Y axis */}
        {[0, Math.round(maxValue/2), Math.round(maxValue)].map((v,i) => {
          const y = baselineY - (v/maxValue)*chartHeight;
          return (
            <g key={i}>
              <line x1={padding} x2={width-padding} y1={y} y2={y} stroke="hsl(var(--chart-grid,203,213,225)/0.18)" />
              <text x={12} y={y+4} fill="hsl(var(--muted-foreground,100,116,139))" fontSize="12">₹{v}</text>
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:0.5}} className="pro-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-foreground">Weekly Trend</h3>
          <p className="text-sm text-muted">Income vs Expenses (Last 7 days · INR)</p>
        </div>
      </div>
      <div className="h-64"><SVGChart /></div>
      <div className="flex items-center justify-center space-x-6 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor:'hsl(var(--accent-teal,26,188,156))'}}></div>
          <span className="text-sm text-muted">Income (₹)</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{backgroundColor:'hsl(var(--accent-pink,236,72,153))'}}></div>
          <span className="text-sm text-muted">Expenses (₹)</span>
        </div>
      </div>
    </motion.div>
  );
}
