import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { validateField } from "../../utils/regex";
import Button from "./Button";
import InputField from "./InputField";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { createUserRepository } from "../../database/repositories";
import { useTranslation } from "react-i18next";

interface DatosFormularioProps {
  username: string;
  email: string;
  password: string;
  passwordRepeat: string;
}

interface ErrorsProps {
  username: string;
  email: string;
  password: string;
  passwordRepeat: string;
}

export default function Registro() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const userRepository = createUserRepository();

  const [rol, setRol] = useState<'cliente' | 'empresa'>('cliente');
  const [datosFormulario, setDatosFormulario] = useState<DatosFormularioProps>({ username: "", email: "", password: "", passwordRepeat: "" });
  const [errors, setErrors] = useState<ErrorsProps>({ username: "", email: "", password: "", passwordRepeat: "" });
  const [loading, setLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDatosFormulario((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ErrorsProps]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "passwordRepeat") {
      setErrors((prev) => ({ ...prev, passwordRepeat: value !== datosFormulario.password ? t('validation.passwordsNoMatch') : "" }));
      return;
    }
    const error = validateField(name === "username" ? "nombre" : name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setAvatarFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const newErrors = {
      username: validateField("nombre", datosFormulario.username),
      email: validateField("email", datosFormulario.email),
      password: validateField("password", datosFormulario.password),
      passwordRepeat: datosFormulario.password !== datosFormulario.passwordRepeat ? t('validation.passwordsNoMatch') : "",
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((error) => error !== "")) return;

    setLoading(true);
    try {
      const { data, error } = await userRepository.createUser({
        email: datosFormulario.email,
        password: datosFormulario.password,
        username: datosFormulario.username,
        role: rol,
        avatar_file: avatarFile || undefined,
      });

      if (error) {
        const msg = error.message?.toLowerCase() || "";
        if (msg.includes("already") || msg.includes("registrado") || msg.includes("exists")) {
          setErrors((prev) => ({ ...prev, email: t('auth.register.emailUnavailable') }));
        } else {
          toast.error(t('auth.register.registerError', { message: error.message }));
        }
      } else if (data && data.user) {
        await setSession(data, data.user);
        toast.success(t('auth.register.welcomeUser', { user: data.profile?.username || datosFormulario.username }));
        navigate(rol === 'empresa' ? '/empresa' : '/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      const msg = message.toLowerCase();
      if (msg.includes("already") || msg.includes("registrado") || msg.includes("exists") || msg.includes("422")) {
        setErrors((prev) => ({ ...prev, email: t('auth.register.emailUnavailable') }));
      } else {
        toast.error(message || t('common.unexpectedError'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div>
        <p>{t('auth.register.subtitle')}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div>
          <button type="button" onClick={() => setRol('cliente')}>Soy cliente</button>
          <button type="button" onClick={() => setRol('empresa')}>Tengo un negocio</button>
        </div>

        <InputField id="username" label={t('auth.fields.usernameLabel')} name="username" type="text" placeholder={t('auth.fields.usernamePlaceholder')} value={datosFormulario.username} onChange={handleChange} onBlur={handleBlur} error={errors.username} />
        <InputField id="email" label={t('auth.fields.emailFullLabel')} name="email" type="email" placeholder={t('auth.fields.emailFullPlaceholder')} value={datosFormulario.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} />
        <InputField id="password" label={t('auth.fields.passwordLabel')} name="password" type="password" placeholder={t('auth.fields.passwordPlaceholder')} value={datosFormulario.password} onChange={handleChange} onBlur={handleBlur} error={errors.password} />
        <InputField id="passwordRepeat" label={t('auth.fields.passwordRepeatLabel')} name="passwordRepeat" type="password" placeholder={t('auth.fields.passwordRepeatPlaceholder')} value={datosFormulario.passwordRepeat} onChange={handleChange} onBlur={handleBlur} error={errors.passwordRepeat} />

        <div>
          <label htmlFor="avatar">{t('auth.fields.avatarOptional')}</label>
          <input id="avatar" type="file" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
        </div>

        <div>
          <Button type="button" onClick={() => navigate('/')} variant="secondary">{t('common.cancel')}</Button>
          <Button type="submit" disabled={loading}>{loading ? t('auth.register.submitting') : t('auth.register.submit')}</Button>
        </div>
      </form>
    </div>
  );
}
