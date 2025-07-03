
import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useData } from '../../context/DataContext';
import Card from '../ui/Card';

const NewAthletesChart: React.FC = () => {
  const { players, loading } = useData();

  const chartData = useMemo(() => {
    const monthlyCounts: { [key: string]: number } = {};
    const last12Months: string[] = [];
    const today = new Date();
    
    // Initialize the last 12 months with 0 counts
    for (let i = 11; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = d.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
        last12Months.push(monthKey);
        monthlyCounts[monthKey] = 0;
    }

    // Populate counts from player data
    players.forEach(player => {
      const joinDate = new Date(player.joinDate);
      const monthKey = joinDate.toLocaleString('es-ES', { month: 'short', year: '2-digit' });
      if (monthlyCounts.hasOwnProperty(monthKey)) {
        monthlyCounts[monthKey]++;
      }
    });

    return last12Months.map(monthKey => ({
      name: monthKey.charAt(0).toUpperCase() + monthKey.slice(1),
      'Nuevos Atletas': monthlyCounts[monthKey],
    }));
  }, [players]);

  if (loading) {
    return <Card className="h-96 flex items-center justify-center"><p>Cargando gráfico...</p></Card>;
  }

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-text-primary">Evolución de Nuevos Atletas (Últimos 12 Meses)</h2>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorNuevos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.7}/>
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" strokeOpacity={0.3} />
            <XAxis dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis stroke="#9CA3AF" allowDecimals={false} />
            <Tooltip
              contentStyle={{ 
                backgroundColor: 'rgba(31, 41, 55, 0.8)', 
                border: '1px solid #4B5563', 
                borderRadius: '0.5rem',
                backdropFilter: 'blur(4px)'
               }}
              labelStyle={{ color: '#F9FAFB' }}
              itemStyle={{ color: '#F87171', fontWeight: 'bold' }}
            />
            <Area type="monotone" dataKey="Nuevos Atletas" stroke="#DC2626" fill="url(#colorNuevos)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default NewAthletesChart;
