import { useNavigate } from "react-router-dom";
import { createUserRepository } from "../database/repositories";
import { useEffect, useState } from "react";
import { supabase } from "../database/supabase/Client";
import toast, { Toaster } from "react-hot-toast";
import Button from "../components/form/Button";
import InputField from "../components/form/InputField";


export default function ActualizarClave() {
    const navigate = useNavigate();
    const userRepository = createUserRepository();


    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [isRecoveryMode, setIsRecoveryMode] = useState(false);

    useEffect(() => {
        // Escuchamos si Supabase nos dice que venimos del link del correo
        const { data: listener } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === "PASSWORD_RECOVERY") {
                setIsRecoveryMode(true);
            }
        });

        return () => {
            listener?.subscription?.unsubscribe?.();
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            toast.error("La contraseña debe tener al menos 6 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setLoading(true);

        try {
            // Usamos tu repositorio en lugar de llamar a Supabase directo
            const { error } = await userRepository.updatePassword(newPassword);

            if (error) {
                toast.error("Error al actualizar: " + error.message);
            } else {
                toast.success("¡Contraseña actualizada con éxito!");
                // Lo mandamos a iniciar sesión con su nueva clave
                setTimeout(() => navigate("/iniciarSesion"), 2000);
            }
        } catch (error) {
            toast.error("Ocurrió un error inesperado");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center bg-gray-100 min-h-screen">
            <Toaster position="top-center" />

            <div className="w-full max-w-lg p-8 bg-white rounded-2xl shadow-xl m-15">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Crear nueva contraseña</h1>
                    <p className="text-gray-500">
                        {isRecoveryMode
                            ? "Ingresa tu nueva contraseña para recuperar tu cuenta."
                            : "Verificando acceso seguro..."}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <InputField
                            label="Nueva Contraseña"
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>

                    <div>
                        <InputField
                            label="Confirmar Contraseña"
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <div className="pt-4">
                        <Button
                            type="submit"
                            disabled={loading || !isRecoveryMode}
                            className={`w-full py-3 text-white font-medium rounded-lg transition ${loading || !isRecoveryMode ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                                }`}
                        >
                            {loading ? 'Actualizando...' : 'Guardar contraseña'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}