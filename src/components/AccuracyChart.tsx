import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  accuracy: number;
  predictions: number;
}

interface AccuracyChartProps {
  data: ChartDataPoint[];
}

const AccuracyChart = ({ data }: AccuracyChartProps) => {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Недостаточно данных для построения графика
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis 
          dataKey="date" 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
        />
        <YAxis 
          stroke="#94a3b8"
          style={{ fontSize: '12px' }}
          domain={[0, 100]}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #475569',
            borderRadius: '8px',
            color: '#fff'
          }}
          formatter={(value: number, name: string) => {
            if (name === 'accuracy') return [`${value.toFixed(1)}%`, 'Точность'];
            return [value, 'Предсказаний'];
          }}
        />
        <Legend 
          wrapperStyle={{ color: '#94a3b8' }}
          formatter={(value) => value === 'accuracy' ? 'Точность' : 'Предсказаний'}
        />
        <Line 
          type="monotone" 
          dataKey="accuracy" 
          stroke="#a78bfa" 
          strokeWidth={3}
          dot={{ fill: '#a78bfa', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="predictions" 
          stroke="#60a5fa" 
          strokeWidth={2}
          dot={{ fill: '#60a5fa', r: 3 }}
          yAxisId={1}
          hide={true}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default AccuracyChart;
