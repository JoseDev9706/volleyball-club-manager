import React, { useMemo, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { Player } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Link } from 'react-router-dom';

const calculateOverdueMonths = (player: Player): number => {
    const today = new Date();
    const joinDate = new Date(player.joinDate);
    
    if (joinDate > today) return 0;

    // Player joined this month, no payment is due yet.
    if (joinDate.getFullYear() === today.getFullYear() && joinDate.getMonth() === today.getMonth()) {
        return 0;
    }

    const lastPaymentDate = player.lastPaymentDate ? new Date(player.lastPaymentDate) : null;

    // Paid this month
    if (lastPaymentDate && lastPaymentDate.getFullYear() === today.getFullYear() && lastPaymentDate.getMonth() === today.getMonth()) {
        return 0; 
    }
    
    // Calculate the first month for which payment was due and not made
    const firstUnpaidMonth = lastPaymentDate 
        ? new Date(lastPaymentDate.getFullYear(), lastPaymentDate.getMonth() + 1, 1) 
        : new Date(joinDate.getFullYear(), joinDate.getMonth() + 1, 1);
    
    if (firstUnpaidMonth > today) return 0;

    const endMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const months = (endMonth.getFullYear() - firstUnpaidMonth.getFullYear()) * 12 + (endMonth.getMonth() - firstUnpaidMonth.getMonth()) + 1;

    return months > 0 ? months : 0;
};


const OverduePayments: React.FC = () => {
    const { players, loading, deletePlayer } = useData();
    const { showToast } = useToast();

    useEffect(() => {
        if(!loading && typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }, [loading, players]);

    const overduePlayers = useMemo(() => {
        if (!players) return [];

        return players.map(player => ({
            player,
            debtInMonths: calculateOverdueMonths(player)
        }))
        .filter(item => item.debtInMonths > 0)
        .sort((a, b) => b.debtInMonths - a.debtInMonths);

    }, [players]);

    const handleExpel = (player: Player) => {
        if (window.confirm(`¿Estás seguro de que quieres expulsar a ${player.name} del club? Esta acción no se puede deshacer.`)) {
            deletePlayer(player.id).then(() => {
                showToast(`${player.name} ha sido expulsado del club.`, 'success');
            }).catch(() => {
                showToast(`No se pudo expulsar a ${player.name}.`, 'error');
            });
        }
    };

    if (loading) {
        return <Card className="h-full flex items-center justify-center"><p>Cargando datos de pagos...</p></Card>;
    }

    if (overduePlayers.length === 0) {
        return (
            <Card>
                <h2 className="text-xl font-bold mb-4 text-text-primary">Pagos Pendientes</h2>
                <div className="text-center py-4 text-text-secondary flex flex-col items-center gap-2">
                    <i data-lucide="party-popper" className="w-8 h-8 text-emerald-400"></i>
                    <p className="font-semibold">¡Excelente!</p>
                    <p>Todos los jugadores están al día con sus pagos.</p>
                </div>
            </Card>
        );
    }


    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-text-primary">Pagos Pendientes</h2>
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {overduePlayers.map(({ player, debtInMonths }) => (
                    <li key={player.id} className="flex items-center gap-3 p-2 rounded-md bg-gray-800/70">
                        <Link to={`/player/${player.id}`}>
                            <img src={player.avatarUrl} alt={player.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-600"/>
                        </Link>
                        <div className="flex-1">
                            <Link to={`/player/${player.id}`} className="font-semibold text-text-primary hover:text-primary transition-colors">{player.name}</Link>
                            <p className="text-sm text-yellow-400 font-semibold">
                                {debtInMonths} {debtInMonths > 1 ? 'meses de adeudo' : 'mes de adeudo'}
                            </p>
                        </div>
                        {debtInMonths >= 3 && (
                            <Button
                                onClick={() => handleExpel(player)}
                                className="!bg-red-800 hover:!bg-red-700 !text-white !px-2 !py-1 text-xs flex items-center gap-1"
                                title={`Expulsar a ${player.name}`}
                            >
                               <i data-lucide="user-x" className="w-4 h-4"></i>
                               <span>Expulsar</span>
                            </Button>
                        )}
                    </li>
                ))}
            </ul>
        </Card>
    );
};

export default OverduePayments;
