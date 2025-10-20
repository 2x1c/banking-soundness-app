import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function BankingSoundnessApp() {
  const [trend, setTrend] = useState<any[]>([]);
  const [comparison, setComparison] = useState<any[]>([]);
  const [score, setScore] = useState<any>({});
  const [bank, setBank] = useState('Bank BTN');

  useEffect(() => {
    fetch(`${API_BASE}/api/trend?bank=${encodeURIComponent(bank)}`)
      .then((r) => r.json())
      .then((j) => setTrend(j.trend || []));

    fetch(`${API_BASE}/api/comparison`)
      .then((r) => r.json())
      .then((j) => setComparison(j.data || []));

    fetch(`${API_BASE}/api/score?bank=${encodeURIComponent(bank)}`)
      .then((r) => r.json())
      .then((j) => setScore(j));
  }, [bank]);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>🏦 Banking Soundness Dashboard</h1>
      <h2>{bank}</h2>
      <p>Period: {score.period}</p>
      <p>Health Score: <strong>{score.score}</strong> ({score.zone})</p>

      <LineChart width={800} height={400} data={trend}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="CAR" stroke="#8884d8" />
        <Line type="monotone" dataKey="NPL" stroke="#82ca9d" />
        <Line type="monotone" dataKey="ROA" stroke="#ff7300" />
      </LineChart>

      <h3>📊 Comparison</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Bank</th><th>CAR</th><th>NPL</th><th>ROA</th><th>Score</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((r) => (
            <tr key={r.bank}>
              <td>{r.bank}</td><td>{r.CAR}</td><td>{r.NPL}</td><td>{r.ROA}</td><td>{r.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}