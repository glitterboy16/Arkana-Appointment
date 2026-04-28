import { useNavigate } from "react-router-dom";
import Registro from "../components/form/Registro";
import Modal from "../components/modal/Modal";
import { useTranslation } from "react-i18next";

export default function RegistroPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Modal title={t('auth.register.title')} isOpen={true} onClose={() => navigate('/')}>
      <Registro />
    </Modal>
  );
}
