import toast from 'react-hot-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: 'text-green-400',
  error: 'text-red-400',
  warning: 'text-yellow-400',
  info: 'text-blue-400',
};

export function showToast(message, type = 'info') {
  const Icon = icons[type];

  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-slide-up' : 'animate-fade-out'
        } max-w-md w-full bg-bg-secondary border border-border rounded-lg shadow-lg pointer-events-auto flex items-center gap-3 p-4`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${colors[type]}`} />
        <p className="text-text-primary flex-1">{message}</p>
      </div>
    ),
    { duration: 4000 }
  );
}

export function showSuccessToast(message) {
  showToast(message, 'success');
}

export function showErrorToast(message) {
  showToast(message, 'error');
}

export function showWarningToast(message) {
  showToast(message, 'warning');
}

export function showInfoToast(message) {
  showToast(message, 'info');
}

export default {
  show: showToast,
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
};
