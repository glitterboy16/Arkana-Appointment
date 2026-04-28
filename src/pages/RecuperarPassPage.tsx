import { useNavigate } from "react-router-dom";
import RecuperarPass from "../components/form/RecuperarPass";
import Modal from "../components/modal/Modal";
import { useTranslation } from "react-i18next";

export default function PageRecuperarPassPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal title={t('auth.recover.title')} isOpen={true} onClose={() => navigate('/iniciarSesion')}>
      <RecuperarPass />
    </Modal>
  );
}
