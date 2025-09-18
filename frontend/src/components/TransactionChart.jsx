import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

// Light pastel-like colors
const COLORS = ['#93c5fd','#fca5a5','#86efac','#fde68a','#c4b5fd','#f9a8d4','#99f6e4','#bef264'];

export default function TransactionChart({ transactions }) {
  const [period, setPeriod] = useState('7'); // days: '7' | '30' | '60'
  const [chartView, setChartView] = useState('both'); // 'both' | 'bar' | 'pie'

  const filtered = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    const days = parseInt(period, 10);
    const now = new Date();
    const since = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (isFinite(days) ? days - 1 : 6));
    return transactions.filter(tx => {
      const d = new Date(tx.date);
      return d >= since && d <= now;
    });
  }, [transactions, period]);

  const expenseByCategory = useMemo(() => {
    const map = new Map();
    (filtered || []).forEach(tx => {
      if (tx.type !== 'expense') return;
      const name = tx.category || 'Uncategorized';
      const amount = typeof tx.amountMinor === 'number' ? tx.amountMinor : Math.round((tx.amount || 0) * 100);
      map.set(name, (map.get(name) || 0) + amount);
    });
    const arr = Array.from(map.entries()).map(([name, minor]) => ({ name, amount: Math.round(minor/100) }));
    arr.sort((a,b)=> b.amount - a.amount);
    return arr;
  }, [filtered]);

  const totalExpense = useMemo(() => expenseByCategory.reduce((s, d) => s + d.amount, 0), [expenseByCategory]);

  const formatCurrency = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);

  return (
    <Card>
      <CardHeader className="space-y-0 pb-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle>Spending Analytics</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={chartView} onValueChange={setChartView}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Chart View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="both">Both</SelectItem>
                <SelectItem value="bar">Bar Only</SelectItem>
                <SelectItem value="pie">Pie Only</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="60">Last 60 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {expenseByCategory.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted">No expense data available</div>
        ) : (
          <div className={`grid gap-6 ${chartView === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
            {(chartView === 'both' || chartView === 'bar') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="pro-card p-4">
                <h3 className="font-heading font-semibold mb-3">Spending by Category (Bar)</h3>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseByCategory} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted/20" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v)=>formatCurrency(v)} />
                      <Bar dataKey="amount" fill="#fbcfe8" stroke="#ec4899" strokeOpacity={0.35} radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}
            {(chartView === 'both' || chartView === 'pie') && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="pro-card p-4">
                <h3 className="font-heading font-semibold mb-3">Spending Distribution (Pie)</h3>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={expenseByCategory} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v)=>formatCurrency(v)} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-3 text-sm text-muted">Total: {formatCurrency(totalExpense)}</div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}