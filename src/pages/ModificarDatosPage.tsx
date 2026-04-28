import { useNavigate } from "react-router-dom";
import ModificarDatos from "../components/form/ModificarDatos";
import Modal from "../components/modal/Modal";
import { useTranslation } from "react-i18next";

export default function ModificarDatosPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal title={t('profile.editModalTitle')} isOpen={true} onClose={() => navigate('/perfil')}>
      <ModificarDatos />
    </Modal>
  );
}
