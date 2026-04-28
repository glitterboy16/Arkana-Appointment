export const validateField = (name: string, value: string) => {
  switch (name) {
    case "nombre":
      if (!value.trim()) return "El nombre es obligatorio";
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(value)) return "Solo se permiten letras y espacios";
      return "";

    case "edad":
      if (!value) return "La edad es obligatoria";
      if (Number(value) <= 0) return "Debe ser mayor que 0";
      return "";

    case "password":
      if (value.length < 6) return "Mínimo 6 caracteres";
      return "";

    case "email":
      if (!value.trim()) return "El correo es obligatorio";
      if (!/\S+@\S+\.\S+/.test(value)) return "El formato del correo no es válido";
      return "";

    case "titulo":
      if (!value.trim()) return "El título es obligatorio";
      if (!/^[A-ZÁÉÍÓÚÑ][a-zA-ZÁÉÍÓÚÑáéíóúñ0-9 ]{0,49}$/.test(value)) {
        return "El título debe empezar con mayúscula, permitir nombres compuestos, hasta 50 caracteres, y solo letras, números y espacios.";
      }
      return "";

    case "autor":
      if (!value.trim()) return "El autor es obligatorio";
      if (!/^[A-ZÁÉÍÓÚÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ]*$/.test(value)) {
        return "Debe empezar con mayúscula y contener solo letras mayúsculas y minúsculas";
      }
      return "";

    case "fecha_fin":
      if (!value.trim()) return "La fecha de finalización es obligatoria";
      return "";

    case "puntuacion": {
      if (!value.trim()) return "La puntuación es obligatoria";
      const numero = Number(value);
      if (numero < 0 || numero > 5) return "La puntuación debe estar entre 0 y 5";
      return "";
    }

    case "reseña":
      if (!value.trim()) return "La reseña es obligatoria";
      if (!/^[A-ZÁÉÍÓÚÑ].{0,149}$/.test(value)) return "Debe iniciar con mayúscula y tener máximo 150 caracteres";
      return "";

    case "tipo":
      if (!value.trim()) return "El tipo es obligatorio";
      return "";

    default:
      return "";
  }
};
