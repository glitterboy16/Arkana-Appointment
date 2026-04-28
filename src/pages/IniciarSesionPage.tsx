import { useNavigate } from "react-router-dom";
import IniciarSesion from "../components/form/IniciarSesion";
import Modal from "../components/modal/Modal";
import { useTranslation } from "react-i18next";

export default function IniciarSesionPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal title={t('auth.login.title')} isOpen={true} onClose={() => navigate('/')}>
      <IniciarSesion />
    </Modal>
  );
}
