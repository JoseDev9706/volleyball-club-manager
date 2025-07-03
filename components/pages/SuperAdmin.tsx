import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useClub } from '../../context/ClubContext';
import { useToast } from '../../context/ToastContext';
import { ClubSettings } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const ColorInput: React.FC<{ label: string; name: string; value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void }> = ({ label, name, value, onChange }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-text-secondary">{label}</label>
        <div className="flex items-center gap-2 border border-gray-600 rounded-md px-2">
            <input
                type="color"
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                className="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
            <span className="font-mono text-sm">{value}</span>
        </div>
    </div>
);

const SuperAdmin: React.FC = () => {
    const { clubSettings, updateClubSettings, loading: clubLoading } = useClub();
    const { showToast } = useToast();
    const [settings, setSettings] = useState<ClubSettings>(clubSettings);
    const [logoPreview, setLogoPreview] = useState<string>(clubSettings.logoUrl);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(clubSettings);
        setLogoPreview(clubSettings.logoUrl);
    }, [clubSettings]);
    
    useEffect(() => {
        if (typeof (window as any).lucide !== 'undefined') {
          (window as any).lucide.createIcons();
        }
    }, []);

    const handleColorChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, colors: { ...prev.colors, [name]: value } }));
    };

    const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setSettings({ ...settings, logoUrl: base64String });
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateClubSettings(settings);
            showToast('Configuración guardada con éxito', 'success');
        } catch (error) {
            showToast('Error al guardar la configuración', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (clubLoading) {
        return <Card><p>Cargando configuración...</p></Card>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold">Panel de Super Administrador</h2>
            <form onSubmit={handleSubmit}>
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Club Identity */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold text-primary border-b border-gray-700 pb-2">Identidad del Club</h3>
                            <div>
                                <label htmlFor="clubName" className="block text-sm font-medium text-text-secondary mb-1">Nombre del Club</label>
                                <input
                                    type="text"
                                    id="clubName"
                                    value={settings.name}
                                    onChange={e => setSettings({ ...settings, name: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 focus:ring-primary focus:border-primary"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <img src={logoPreview} alt="Logo Preview" className="w-20 h-20 object-contain bg-gray-700 rounded-full p-1" />
                                <div>
                                    <label htmlFor="logo-upload" className="cursor-pointer bg-gray-700 text-text-primary px-3 py-2 text-sm rounded-md hover:bg-gray-600 transition-colors">
                                        Cambiar Logo
                                    </label>
                                    <input id="logo-upload" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                                </div>
                            </div>
                             <div className="space-y-4">
                                <h3 className="text-xl font-bold text-primary border-b border-gray-700 pb-2">Funcionalidades</h3>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-text-secondary">Permitir creación de equipos</span>
                                     <div className="relative">
                                        <input type="checkbox" className="sr-only"
                                            checked={settings.teamCreationEnabled}
                                            onChange={e => setSettings({...settings, teamCreationEnabled: e.target.checked })}
                                        />
                                        <div className={`block w-14 h-8 rounded-full ${settings.teamCreationEnabled ? 'bg-primary' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.teamCreationEnabled ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-text-secondary">Habilitar pago de cuota mensual</span>
                                     <div className="relative">
                                        <input type="checkbox" className="sr-only"
                                            checked={settings.monthlyPaymentEnabled}
                                            onChange={e => setSettings({...settings, monthlyPaymentEnabled: e.target.checked })}
                                        />
                                        <div className={`block w-14 h-8 rounded-full ${settings.monthlyPaymentEnabled ? 'bg-primary' : 'bg-gray-600'}`}></div>
                                        <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.monthlyPaymentEnabled ? 'translate-x-6' : ''}`}></div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Colors */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-primary border-b border-gray-700 pb-2">Paleta de Colores</h3>
                            <ColorInput label="Primario" name="primary" value={settings.colors.primary} onChange={handleColorChange} />
                            <ColorInput label="Secundario" name="secondary" value={settings.colors.secondary} onChange={handleColorChange} />
                            <ColorInput label="Terciario" name="tertiary" value={settings.colors.tertiary} onChange={handleColorChange} />
                            <ColorInput label="Fondo" name="background" value={settings.colors.background} onChange={handleColorChange} />
                            <ColorInput label="Superficie" name="surface" value={settings.colors.surface} onChange={handleColorChange} />
                            <ColorInput label="Texto Primario" name="textPrimary" value={settings.colors.textPrimary} onChange={handleColorChange} />
                            <ColorInput label="Texto Secundario" name="textSecondary" value={settings.colors.textSecondary} onChange={handleColorChange} />
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
};

export default SuperAdmin;