
import React, { useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import Card from '../ui/Card';

const StatCard: React.FC<{ icon: string; label: string; value: string | number; color: string }> = ({ icon, label, value, color }) => {
    return (
        <Card className="flex items-center p-4">
            <div className={`p-3 rounded-full mr-4 ${color}`}>
                <i data-lucide={icon} className="w-6 h-6 text-white"></i>
            </div>
            <div>
                <p className="text-sm text-text-secondary">{label}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </Card>
    );
};


const DashboardSummary: React.FC = () => {
    const { players, teams, attendances, loading } = useData();

    useEffect(() => {
        if (!loading && typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }, [loading, players, teams, attendances]);

    const summaryData = useMemo(() => {
        if (loading) return { totalPlayers: '...', totalTeams: '...', attendanceRate: '...' };

        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendances.filter(a => a.date === today);
        const presentCount = todayAttendance.filter(a => a.status === 'Presente').length;
        
        const attendanceRate = players.length > 0 ? Math.round((presentCount / players.length) * 100) : 0;

        return {
            totalPlayers: players.length,
            totalTeams: teams.length,
            attendanceRate: `${attendanceRate}%`,
        };
    }, [players, teams, attendances, loading]);

    if(loading) {
        return <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="h-24 animate-pulse bg-gray-800"><></></Card>
            <Card className="h-24 animate-pulse bg-gray-800"><></></Card>
            <Card className="h-24 animate-pulse bg-gray-800"><></></Card>
        </div>
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
                icon="users" 
                label="Total de Jugadores" 
                value={summaryData.totalPlayers} 
                color="bg-blue-500" 
            />
            <StatCard 
                icon="shield" 
                label="Total de Equipos" 
                value={summaryData.totalTeams}
                color="bg-emerald-500"
            />
            <StatCard 
                icon="calendar-check" 
                label="Asistencia Hoy" 
                value={summaryData.attendanceRate}
                color="bg-amber-500"
            />
        </div>
    );
};

export default DashboardSummary;
