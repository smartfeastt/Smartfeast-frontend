import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../store/hooks.js';
import { removeToast, selectToasts } from '../../store/slices/toastSlice.js';

export default function Toast() {
  const toasts = useAppSelector(selectToasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    toasts.forEach((toast) => {
      const timer = setTimeout(() => {
        dispatch(removeToast(toast.id));
      }, 3000);
      return () => clearTimeout(timer);
    });
  }, [toasts, dispatch]);

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-md text-white shadow-md ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-gray-800'
          }`}
        >
          {toast.msg}
        </div>
      ))}
    </div>
  );
}

