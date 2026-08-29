'use client';

import Swal from 'sweetalert2';

// Base dark-themed SweetAlert2 instance matching LearnSphere styling
export const darkSwal = Swal.mixin({
  customClass: {
    popup: '!bg-[#1f1f33] !text-white !border !border-white/10 !rounded-3xl !p-6 !shadow-2xl !backdrop-blur-xl',
    title: '!text-white !text-lg !font-bold !tracking-tight',
    htmlContainer: '!text-white/70 !text-xs !mt-2 !leading-relaxed',
    confirmButton: '!px-5 !py-2.5 !rounded-xl !font-bold !text-xs !bg-rose-500 !hover:bg-rose-600 !text-white !shadow-lg !shadow-rose-500/25 !transition-all !mx-1.5 cursor-pointer',
    cancelButton: '!px-5 !py-2.5 !rounded-xl !font-semibold !text-xs !bg-white/10 !hover:bg-white/15 !text-white/80 !border !border-white/10 !transition-all !mx-1.5 cursor-pointer',
    denyButton: '!px-5 !py-2.5 !rounded-xl !font-semibold !text-xs !bg-amber-500 !hover:bg-amber-600 !text-white !transition-all !mx-1.5 cursor-pointer',
    actions: '!mt-6 !gap-2',
  },
  buttonsStyling: false,
  background: '#1f1f33',
  color: '#ffffff',
});

/**
 * Confirmation dialog for destructive actions (e.g. Delete).
 * Returns true if confirmed, false otherwise.
 */
export const confirmDelete = async ({
  title = 'Are you sure?',
  text = 'This action cannot be undone and will permanently remove this item.',
  confirmText = 'Yes, delete',
  cancelText = 'Cancel',
} = {}) => {
  const result = await darkSwal.fire({
    title,
    text,
    icon: 'warning',
    iconColor: '#f43f5e',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    focusCancel: true,
  });

  return result.isConfirmed;
};

/**
 * Generic confirmation dialog for important or prompt actions.
 * Returns true if confirmed, false otherwise.
 */
export const confirmAction = async ({
  title = 'Are you sure?',
  text = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  icon = 'question',
  isDanger = false,
} = {}) => {
  const result = await darkSwal.fire({
    title,
    text,
    icon,
    iconColor: isDanger ? '#f43f5e' : '#818cf8',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
    customClass: {
      popup: '!bg-[#1f1f33] !text-white !border !border-white/10 !rounded-3xl !p-6 !shadow-2xl',
      title: '!text-white !text-lg !font-bold',
      htmlContainer: '!text-white/70 !text-xs !mt-2',
      confirmButton: isDanger
        ? '!px-5 !py-2.5 !rounded-xl !font-bold !text-xs !bg-rose-500 !hover:bg-rose-600 !text-white !shadow-lg !shadow-rose-500/25 !transition-all !mx-1.5 cursor-pointer'
        : '!px-5 !py-2.5 !rounded-xl !font-bold !text-xs !bg-indigo-600 !hover:bg-indigo-500 !text-white !shadow-lg !shadow-indigo-500/25 !transition-all !mx-1.5 cursor-pointer',
      cancelButton: '!px-5 !py-2.5 !rounded-xl !font-semibold !text-xs !bg-white/10 !hover:bg-white/15 !text-white/80 !border !border-white/10 !transition-all !mx-1.5 cursor-pointer',
      actions: '!mt-6 !gap-2',
    },
  });

  return result.isConfirmed;
};

export default darkSwal;
