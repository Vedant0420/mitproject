import { useApp } from '../context/AppContext.jsx';
import { CheckCircle, XCircle, Info } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error:   XCircle,
  info:    Info,
};

export default function ToastContainer() {
  const { toasts } = useApp();

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const Icon = iconMap[t.type] || Info;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={16} />
            {t.message}
          </div>
        );
      })}
    </div>
  );
}
