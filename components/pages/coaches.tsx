
import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useToast } from '../../context/ToastContext';
import { CoachCreationData } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const initialFormData: CoachCreationData = {
    firstName: '',
    lastName: '',
    document: '',
    avatarUrl: 'https://picsum.photos/seed/newcoach/100/100', // Default avatar
};

const Coaches: React.FC = () => {
    const { coaches, loading, createCoach } = useData();
    const { showToast } = useToast();
    const [formData, setFormData] = useState<CoachCreationData>(initialFormData);
    const [avatarPreview, setAvatarPreview] = useState<string>(initialFormData.avatarUrl);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (typeof (window as any).lucide !== 'undefined') {
          (window as any).lucide.createIcons();
        }
    }, [coaches]);

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
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.document.trim()) {
            setError('Todos los campos son obligatorios.');
            return;
        }
        
        setIsSaving(true);
        try {
            await createCoach(formData);
            showToast('¡Entrenador registrado exitosamente!', 'success');
            setFormData(initialFormData);
            setAvatarPreview(initialFormData.avatarUrl);
        } catch (err: any) {
            setError(err.message || 'Error al registrar al entrenador.');
            showToast(err.message || 'Error al registrar al entrenador.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Listado de Entrenadores</h2>
                    {loading ? (
                        <p>Cargando entrenadores...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-surface text-xs text-text-secondary uppercase">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Nombre</th>
                                        <th scope="col" className="px-6 py-3">Documento</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coaches.map(coach => (
                                        <tr key={coach.id} className="border-b border-gray-800 hover:bg-gray-800/60">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={coach.avatarUrl} alt={`${coach.firstName} ${coach.lastName}`} className="w-10 h-10 rounded-full object-cover" />
                                                    <span className="font-medium text-text-primary">{`${coach.firstName} ${coach.lastName}`}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-text-secondary">{coach.document}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                             {coaches.length === 0 && <p className="text-center py-8 text-text-secondary">No hay entrenadores registrados.</p>}
                        </div>
                    )}
                </Card>
            </div>
            <div>
                 <Card>
                    <h2 className="text-2xl font-bold text-text-primary mb-4">Añadir Entrenador</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex items-center gap-4">
                            <img src={avatarPreview} alt="Avatar Preview" className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                             <div>
                                <label htmlFor="avatar-upload" className="cursor-pointer bg-gray-700 text-text-primary px-3 py-2 text-sm rounded-md hover:bg-gray-600 transition-colors">
                                    Cambiar Foto
                                </label>
                                <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-text-secondary mb-1">Nombres</label>
                            <input id="firstName" type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" required />
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-text-secondary mb-1">Apellidos</label>
                            <input id="lastName" type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" required />
                        </div>
                        <div>
                            <label htmlFor="document" className="block text-sm font-medium text-text-secondary mb-1">Documento</label>
                            <input id="document" type="text" value={formData.document} onChange={e => setFormData({...formData, document: e.target.value})} className="w-full bg-gray-800 border border-gray-600 rounded-md p-2" required />
                        </div>
                        <div className="text-xs text-amber-300 bg-amber-900/50 p-2 rounded-md">
                            <p><strong>Nota:</strong> La contraseña inicial será el número de documento.</p>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <Button type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Registrar Entrenador'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Coaches;
