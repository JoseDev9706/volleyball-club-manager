import React, { useState, useMemo, useEffect, FormEvent, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { useClub } from '../../context/ClubContext';
import { Player, MainCategory, SubCategory, Position, PlayerStats, Attendance } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

const getLatestStats = (player: Player): PlayerStats => {
    if (!player.statsHistory || player.statsHistory.length === 0) {
        return { attack: 0, defense: 0, block: 0, pass: 0 };
    }
    return [...player.statsHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].stats;
};

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return null;
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

const EditPlayerForm: React.FC<{ player: Player; onSave: (updatedPlayer: Player) => void; onCancel: () => void }> = ({ player, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Player>(player);
    const [avatarPreview, setAvatarPreview] = useState<string>(player.avatarUrl);

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setFormData({ ...formData, avatarUrl: base64String });
                setAvatarPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleStatChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const latestHistoryIndex = formData.statsHistory.map(h => new Date(h.date).getTime()).indexOf(Math.max(...formData.statsHistory.map(h => new Date(h.date).getTime())));
        
        const newStatsHistory = [...formData.statsHistory];
        newStatsHistory[latestHistoryIndex].stats = {
            ...newStatsHistory[latestHistoryIndex].stats,
            [name]: parseInt(value, 10)
        };
        setFormData({ ...formData, statsHistory: newStatsHistory });
    };

    const handleMainCategoriesChange = (category: MainCategory) => {
        const newCategories = formData.mainCategories.includes(category)
            ? formData.mainCategories.filter(c => c !== category)
            : [...formData.mainCategories, category];
        setFormData({ ...formData, mainCategories: newCategories });
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-primary mb-2">Editar Jugador</h3>
                 <div className="flex items-center gap-4">
                    <img src={avatarPreview} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-2 border-primary" />
                    <div>
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-700 text-text-primary px-3 py-2 text-sm rounded-md hover:bg-gray-600 transition-colors">
                            Cambiar Foto
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Nombre</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Fecha de Nacimiento</label>
                        <input type="date" value={formData.birthDate} onChange={(e) => setFormData({...formData, birthDate: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Documento</label>
                        <input type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
                        <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Dirección</label>
                    <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2"/>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Posición</label>
                        <select value={formData.position} onChange={e => setFormData({...formData, position: e.target.value as Position})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                           {Object.values(Position).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Nivel</label>
                        <select value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value as SubCategory})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2">
                           {Object.values(SubCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Categorías Principales</label>
                    <div className="flex flex-wrap gap-4">
                        {Object.values(MainCategory).map(cat => (
                             <label key={cat} className="flex items-center gap-2">
                                <input type="checkbox" checked={formData.mainCategories.includes(cat)} onChange={() => handleMainCategoriesChange(cat)} className="form-checkbox h-4 w-4 bg-gray-900 border-gray-500 text-primary focus:ring-primary" />
                                <span>{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Estadísticas Actuales</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" name="attack" value={getLatestStats(formData).attack} onChange={handleStatChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" placeholder="Ataque" />
                        <input type="number" name="defense" value={getLatestStats(formData).defense} onChange={handleStatChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" placeholder="Defensa" />
                        <input type="number" name="block" value={getLatestStats(formData).block} onChange={handleStatChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" placeholder="Bloqueo" />
                        <input type="number" name="pass" value={getLatestStats(formData).pass} onChange={handleStatChange} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" placeholder="Pase" />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button type="submit">Guardar Cambios</Button>
                </div>
            </form>
        </Card>
    );
};

const PlayerProfile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { players, updatePlayer, recordPlayerPayment, loading } = useData();
    const { showToast } = useToast();
    const { clubSettings } = useClub();
    const [isEditing, setIsEditing] = useState(false);
    const [dateRange, setDateRange] = useState<'quarterly' | 'semiannually' | 'yearly'>('quarterly');
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [attendanceLoading, setAttendanceLoading] = useState(true);

    const player = useMemo(() => players.find(p => p.id === id), [id, players]);

    const isPaidUpToDate = useMemo(() => {
        if (!player?.lastPaymentDate) return false;
        const today = new Date();
        const lastPayment = new Date(player.lastPaymentDate);
        return today.getFullYear() === lastPayment.getFullYear() && today.getMonth() === lastPayment.getMonth();
    }, [player]);

    useEffect(() => {
        if(!loading && typeof (window as any).lucide !== 'undefined') {
            (window as any).lucide.createIcons();
        }
    }, [loading, isEditing, player, isPaidUpToDate]);

    useEffect(() => {
        if (id) {
            setAttendanceLoading(true);
            api.getPlayerAttendances(id)
                .then(data => {
                    setAttendances(data);
                })
                .catch(err => {
                    console.error("Failed to fetch player attendances", err);
                    showToast("No se pudo cargar el historial de asistencias.", "error");
                })
                .finally(() => {
                    setAttendanceLoading(false);
                });
        }
    }, [id, showToast]);
    
    if (loading) return <p>Cargando perfil...</p>;
    if (!player) return <p>Jugador no encontrado. <Button onClick={() => navigate('/dashboard')}>Volver</Button></p>;

    const handleSave = async (updatedPlayer: Player) => {
        await updatePlayer(updatedPlayer);
        setIsEditing(false);
        showToast('Perfil actualizado con éxito.', 'success');
    };

    const handlePayment = async () => {
        if (player) {
            await recordPlayerPayment(player.id);
            showToast(`Pago registrado para ${player.name}`, 'success');
        }
    };
    
    const latestStats = getLatestStats(player);
    const age = calculateAge(player.birthDate);

    const skillDevelopmentData = useMemo(() => {
        const now = new Date();
        const startDate = new Date();

        switch (dateRange) {
          case 'semiannually':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case 'yearly':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
          case 'quarterly':
          default:
            startDate.setMonth(now.getMonth() - 3);
            break;
        }

        const sortedHistory = [...player.statsHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const filteredHistory = sortedHistory.filter(record => new Date(record.date) >= startDate);
        
        return filteredHistory.map(record => ({
            date: new Date(record.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            Ataque: record.stats.attack,
            Defensa: record.stats.defense,
            Bloqueo: record.stats.block,
            Pase: record.stats.pass
        }));
    }, [player.statsHistory, dateRange]);

    const comparativeData = useMemo(() => {
        const peers = players.filter(p => p.position === player.position && p.id !== player.id);
        if (peers.length === 0) return [];
        
        const avgStats = peers.reduce((acc, p) => {
            const stats = getLatestStats(p);
            acc.attack += stats.attack;
            acc.defense += stats.defense;
            acc.block += stats.block;
            acc.pass += stats.pass;
            return acc;
        }, { attack: 0, defense: 0, block: 0, pass: 0 });

        Object.keys(avgStats).forEach(key => {
            avgStats[key as keyof PlayerStats] = parseFloat((avgStats[key as keyof PlayerStats] / peers.length).toFixed(1));
        });

        const statsCategories: (keyof PlayerStats)[] = ['attack', 'defense', 'block', 'pass'];
        const labels: Record<keyof PlayerStats, string> = { attack: 'Ataque', defense: 'Defensa', block: 'Bloqueo', pass: 'Pase' };

        return statsCategories.map(stat => ({
            subject: labels[stat],
            [player.name]: latestStats[stat],
            'Promedio de Pares': avgStats[stat],
            fullMark: 10
        }));
    }, [player, players, latestStats]);
    
    type DateRange = 'quarterly' | 'semiannually' | 'yearly';
    const FilterButton: React.FC<{
        label: string;
        value: DateRange;
        activeValue: DateRange;
        onClick: (value: DateRange) => void;
    }> = ({ label, value, activeValue, onClick }) => (
        <button
            onClick={() => onClick(value)}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeValue === value
                    ? 'bg-primary text-white shadow'
                    : 'bg-transparent text-text-secondary hover:bg-gray-700/50'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    {isEditing ? (
                        <EditPlayerForm player={player} onSave={handleSave} onCancel={() => setIsEditing(false)} />
                    ) : (
                        <Card className="space-y-4">
                            <div className="flex flex-col items-center">
                                <img src={player.avatarUrl} alt={player.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary" />
                                <h2 className="text-2xl font-bold mt-4">{player.name}</h2>
                                <p className="text-text-secondary">{player.position} | {player.subCategory}</p>
                                <div className="flex flex-wrap justify-center gap-2 mt-2">
                                    {player.mainCategories.map(cat => <span key={cat} className="text-xs bg-gray-600 text-text-primary px-2 py-1 rounded-full">{cat}</span>)}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-700 pt-4 space-y-3">
                                <h4 className="font-bold text-lg text-primary">Información Personal</h4>
                                <div className="space-y-2 text-sm text-text-secondary">
                                    <p><strong>Edad:</strong> {age !== null ? `${age} años` : 'N/A'} ({new Date(player.birthDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })})</p>
                                    <p className="flex items-center gap-2"><i data-lucide="scan-line" className="w-4 h-4 text-primary"></i><strong>Documento:</strong> {player.document}</p>
                                    <p className="flex items-center gap-2"><i data-lucide="phone" className="w-4 h-4 text-primary"></i><strong>Teléfono:</strong> {player.phone}</p>
                                    <p className="flex items-center gap-2"><i data-lucide="home" className="w-4 h-4 text-primary"></i><strong>Dirección:</strong> {player.address}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                               <h4 className="font-bold text-lg mb-2 text-primary">Estadísticas Actuales</h4>
                               <div className="grid grid-cols-2 gap-2 text-md">
                                  <p><strong>Ataque:</strong> {latestStats.attack}</p>
                                  <p><strong>Defensa:</strong> {latestStats.defense}</p>
                                  <p><strong>Bloqueo:</strong> {latestStats.block}</p>
                                  <p><strong>Pase:</strong> {latestStats.pass}</p>
                               </div>
                            </div>

                            {clubSettings.monthlyPaymentEnabled && (
                                <div className="border-t border-gray-700 pt-4 space-y-3">
                                    <h4 className="font-bold text-lg text-primary">Administrativo</h4>
                                    <div className="text-sm text-text-secondary">
                                        <p><strong>Último Pago:</strong> {player.lastPaymentDate ? new Date(player.lastPaymentDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Pendiente'}</p>
                                    </div>
                                    {isPaidUpToDate ? (
                                        <div className="w-full text-center py-2 px-3 rounded-md bg-green-500/20 text-green-300 font-semibold flex items-center justify-center gap-2">
                                            <i data-lucide="check-circle" className="w-5 h-5"></i>
                                            Mensualidad al día
                                        </div>
                                    ) : (
                                        <Button onClick={handlePayment} variant="secondary" className="w-full">
                                            <i data-lucide="dollar-sign" className="w-4 h-4 mr-2"></i> Registrar Pago Mensual
                                        </Button>
                                    )}
                                </div>
                            )}

                            <Button onClick={() => setIsEditing(true)} className="w-full">
                                <i data-lucide="edit-3" className="w-4 h-4 mr-2"></i> Editar Perfil
                            </Button>
                        </Card>
                    )}
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="text-xl font-bold text-primary">Desarrollo de Habilidades</h3>
                            <div className="flex gap-1 p-1 bg-gray-800 rounded-md">
                                <FilterButton label="Trimestral" value="quarterly" activeValue={dateRange} onClick={setDateRange} />
                                <FilterButton label="Semestral" value="semiannually" activeValue={dateRange} onClick={setDateRange} />
                                <FilterButton label="Anual" value="yearly" activeValue={dateRange} onClick={setDateRange} />
                            </div>
                        </div>
                        {skillDevelopmentData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={skillDevelopmentData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                                    <XAxis dataKey="date" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" domain={[0, 10]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                                    <Legend />
                                    <Line type="monotone" dataKey="Ataque" stroke="#F97316" />
                                    <Line type="monotone" dataKey="Defensa" stroke="#3B82F6" />
                                    <Line type="monotone" dataKey="Bloqueo" stroke="#10B981" />
                                    <Line type="monotone" dataKey="Pase" stroke="#EC4899" />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-text-secondary">
                                No hay datos de desarrollo para el período seleccionado.
                            </div>
                        )}
                    </Card>
                     {comparativeData.length > 0 && (
                        <Card>
                           <h3 className="text-xl font-bold text-primary mb-4">Comparativa de Posición ({player.position})</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={comparativeData}>
                                    <PolarGrid stroke="#4B5563" />
                                    <PolarAngleAxis dataKey="subject" stroke="#F9FAFB" />
                                    <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#9CA3AF" />
                                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                                    <Legend />
                                    <Radar name={player.name} dataKey={player.name} stroke="#DC2626" fill="#DC2626" fillOpacity={0.6} />
                                    <Radar name="Promedio de Pares" dataKey="Promedio de Pares" stroke="#9CA3AF" fill="#9CA3AF" fillOpacity={0.6} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </Card>
                     )}
                     <Card>
                        <h3 className="text-xl font-bold text-primary mb-4">Historial de Asistencia</h3>
                        {attendanceLoading ? (
                            <div className="flex items-center justify-center h-[250px] text-text-secondary">Cargando asistencias...</div>
                        ) : attendances.length > 0 ? (
                            <div className="max-h-[250px] overflow-y-auto space-y-2 pr-2">
                                {attendances.map((att) => (
                                    <div key={att.date} className={`flex justify-between items-center p-2 rounded-md ${att.status === 'Presente' ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                                        <span className="text-sm text-text-secondary">{new Date(att.date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span className={`text-sm font-bold ${att.status === 'Presente' ? 'text-green-400' : 'text-red-400'}`}>{att.status}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[250px] text-text-secondary">
                                No hay registros de asistencia para este jugador.
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;