import React, { useState, FormEvent, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { MainCategory, SubCategory, Position, PlayerStats } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

// Initial state for the form
const initialFormData = {
    name: '',
    birthDate: '',
    document: '',
    address: '',
    phone: '',
    mainCategories: [] as MainCategory[],
    subCategory: SubCategory.Basico,
    position: Position.Setter,
    avatarUrl: 'https://picsum.photos/seed/newplayer/100/100', // Default avatar
};
const initialStats: PlayerStats = { attack: 5, defense: 5, block: 5, pass: 5 };

const RegisterPlayer: React.FC = () => {
    const { createPlayer } = useData();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [formData, setFormData] = useState(initialFormData);
    const [stats, setStats] = useState<PlayerStats>(initialStats);
    const [avatarPreview, setAvatarPreview] = useState<string>(initialFormData.avatarUrl);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

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

    const handleMainCategoriesChange = (category: MainCategory) => {
        const newCategories = formData.mainCategories.includes(category)
            ? formData.mainCategories.filter(c => c !== category)
            : [...formData.mainCategories, category];
        setFormData({ ...formData, mainCategories: newCategories });
    };


    const handleStatChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setStats({ ...stats, [name]: parseInt(value, 10) || 0 });
    };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.name.trim() || !formData.birthDate || !formData.document.trim() || !formData.phone.trim() || !formData.address.trim()) {
            setError('Todos los campos de información personal son obligatorios.');
            return;
        }
        if (formData.mainCategories.length === 0) {
            setError('Selecciona al menos una categoría principal.');
            return;
        }
        
        setIsLoading(true);

        try {
            const newPlayerData = {
                ...formData,
                statsHistory: [{
                    date: new Date().toISOString(),
                    stats: stats
                }]
            };
            const newPlayer = await createPlayer(newPlayerData);
            showToast('¡Jugador registrado exitosamente!', 'success');
            navigate(`/player/${newPlayer.id}`);
        } catch (err) {
            setError('Error al registrar al jugador.');
            showToast('Error al registrar al jugador.', 'error');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
                 <div className="flex flex-col sm:flex-row items-center gap-6">
                    <img src={avatarPreview} alt="Avatar Preview" className="w-28 h-28 rounded-full object-cover border-4 border-primary" />
                    <div>
                        <h3 className="text-lg font-semibold text-text-primary">Foto de Perfil</h3>
                        <p className="text-sm text-text-secondary mb-2">Sube una foto para el jugador.</p>
                        <label htmlFor="avatar-upload" className="cursor-pointer bg-primary text-white px-4 py-2 text-sm rounded-md hover:bg-red-700 transition-colors">
                            Subir Foto
                        </label>
                        <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Información Personal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1">Nombre Completo</label>
                            <input id="name" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label htmlFor="birthDate" className="block text-sm font-medium text-text-secondary mb-1">Fecha de Nacimiento</label>
                            <input id="birthDate" type="date" value={formData.birthDate} onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-text-secondary mb-1">Documento</label>
                            <input id="document" type="text" value={formData.document} onChange={(e) => setFormData({ ...formData, document: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-text-secondary mb-1">Teléfono</label>
                            <input id="phone" type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-text-secondary mb-1">Dirección de Residencia</label>
                            <input id="address" type="text" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" required />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-700 pt-6">
                     <h3 className="text-lg font-semibold text-text-primary mb-4">Información Deportiva</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-2">Categorías Principales</label>
                            <div className="flex flex-col gap-2">
                                {Object.values(MainCategory).map(cat => (
                                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={formData.mainCategories.includes(cat)} onChange={() => handleMainCategoriesChange(cat)} className="form-checkbox h-4 w-4 bg-gray-900 border-gray-500 text-primary focus:ring-primary" />
                                        <span>{cat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label htmlFor="subCategory" className="block text-sm font-medium text-text-secondary mb-1">Nivel</label>
                                <select id="subCategory" value={formData.subCategory} onChange={e => setFormData({...formData, subCategory: e.target.value as SubCategory})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary">
                                    {Object.values(SubCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="position" className="block text-sm font-medium text-text-secondary mb-1">Posición</label>
                                <select id="position" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value as Position})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary">
                                    {Object.values(Position).map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 pt-6">
                    <label className="block text-sm font-medium text-text-secondary mb-2">Estadísticas Iniciales</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label htmlFor="attack" className="block text-xs font-medium text-text-secondary mb-1">Ataque</label>
                            <input id="attack" type="number" name="attack" value={stats.attack} onChange={handleStatChange} min="0" max="100" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="defense" className="block text-xs font-medium text-text-secondary mb-1">Defensa</label>
                            <input id="defense" type="number" name="defense" value={stats.defense} onChange={handleStatChange} min="0" max="100" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="block" className="block text-xs font-medium text-text-secondary mb-1">Bloqueo</label>
                            <input id="block" type="number" name="block" value={stats.block} onChange={handleStatChange} min="0" max="100" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label htmlFor="pass" className="block text-xs font-medium text-text-secondary mb-1">Pase</label>
                            <input id="pass" type="number" name="pass" value={stats.pass} onChange={handleStatChange} min="0" max="100" className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button type="submit" disabled={isLoading} className="w-full !mt-8 text-lg py-3">
                    {isLoading ? 'Registrando...' : 'Registrar Jugador'}
                </Button>
            </form>
        </Card>
    );
};

export default RegisterPlayer;