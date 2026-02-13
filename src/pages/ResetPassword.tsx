import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Ajusta la ruta si es necesario
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Escucha el evento de recuperación de contraseña de Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      // Importante: Permitimos que entre solo si el evento es 'PASSWORD_RECOVERY' o 'SIGNED_IN'
      if (event !== "PASSWORD_RECOVERY" && event !== "SIGNED_IN") {
        toast({ 
          title: "Atención", 
          description: "Enlace inválido o ha expirado. Por favor, solicita uno nuevo.",
          variant: "destructive" 
        });
        navigate('/super-admin-login');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Éxito", description: "Tu contraseña ha sido actualizada correctamente." });
      navigate('/super-admin-login');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
      <form onSubmit={handlePasswordUpdate} className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border">
        <h2 className="text-2xl font-bold mb-6 text-center">Nueva Contraseña</h2>
        <p className="text-sm text-gray-500 mb-4 text-center">Ingresa tu nueva clave de acceso</p>
        <Input 
          type="password" 
          placeholder="Mínimo 6 caracteres" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          minLength={6} 
          className="mb-4" 
        />
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
        </Button>
      </form>
    </div>
  );
}

