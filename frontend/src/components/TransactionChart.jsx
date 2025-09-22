import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

// Adaptive pastel colors
const BAR_COLOR = '#3b82f6'; // Blue bar visible in light/dark

export default function TransactionChart({ transactions }) {

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    (transactions || []).forEach(tx => {
      if (tx.type !== 'expense') return;
      const name = tx.category || 'Uncategorized';
      const amount = typeof tx.amountMinor === 'number' ? tx.amountMinor : Math.round((tx.amount || 0) * 100);
      map.set(name, (map.get(name) || 0) + amount);
    });
    return Array.from(map.entries()).map(([name, minor]) => ({ name, amount: Math.round(minor/100) }));
  }, [transactions]);

  const formatCurrency = (v) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  if (expenseByCategory.length === 0) {
    return (
      <Card className="bg-white dark:bg-gray-800">
        <CardContent className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          No expense data available
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="text-gray-800 dark:text-gray-100">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={expenseByCategory} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" className="dark:stroke-gray-600" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'currentColor' }} interval={0} angle={-15} textAnchor="end" height={60} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12, fill: 'currentColor' }} />
              <Tooltip formatter={(v)=>formatCurrency(v)} contentStyle={{ backgroundColor: 'white', color: 'black' }} itemStyle={{ color: 'black' }} />
              <Bar dataKey="amount" fill={BAR_COLOR} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
