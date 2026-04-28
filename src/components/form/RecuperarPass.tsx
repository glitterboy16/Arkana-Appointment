import { useState } from 'react';
import { validateField } from '../../utils/regex';
import InputFieldClase from './InputField';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { createUserRepository } from '../../database/repositories';
import toast from 'react-hot-toast';

export default function RecuperarPass() {
    const navigate = useNavigate();
    const userRepository = createUserRepository();

    const [formData, setFormData] = useState({ email: "" });
    const [errors, setErrors] = useState({ email: "" });

    const [enviado, setEnviado] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: validateField("email", value) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validateField("email", formData.email);
        if (error) {
            setErrors({ email: error });
            return;
        }

        setLoading(true);

        try {
            if (!formData.email) {
                toast.error('Error al obtener el email');
                setLoading(false);
                return;
            }

            const result = await userRepository.resetPasswordForEmail(formData.email);

            if (result.error) {
                toast.error('Error al restablecer la contraseña');
                setLoading(false);
                return;
            }

            toast.success('Se ha enviado un enlace a tu correo');
            setEnviado(true);
        } catch (error) {
            toast.error('Ocurrió un error inesperado');
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-surface rounded-2xl border p-4 shadow-sm">
            {!enviado ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="text-left">
                        <h2 className="text-xl font-bold">Recuperar Acceso</h2>
                        <p className="app-muted mt-1 text-sm">
                            Te enviaremos un enlace para restablecer tu contraseña.
                        </p>
                    </div>

                    <InputFieldClase
                        label="Correo Electrónico"
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                    />

                    <div className="flex flex-col gap-3 pt-1 sm:flex-row">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => navigate('/iniciarSesion')}
                            className="w-full"
                        >
                            Volver
                        </Button>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Enviando...' : 'Enviar Email'}
                        </Button>
                    </div>
                </form>
            ) : (
                <div className="text-center">
                    <p className="text-base font-medium text-success-700">
                        Revisa tu bandeja de entrada
                    </p>

                    <Button
                        variant="primary"
                        onClick={() => navigate("/")}
                        className="mt-4 w-full"
                    >
                        Volver al Inicio
                    </Button>
                </div>
            )}
        </div>
    );
}
