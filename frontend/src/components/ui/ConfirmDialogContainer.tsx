import React from 'react';
import ConfirmDialog from './ConfirmDialog';
import { useConfirmStore } from '@/hooks/useConfirm';

const ConfirmDialogContainer: React.FC = () => {
  const { isOpen, options, handleConfirm, handleCancel } = useConfirmStore();

  if (!options) return null;

  return (
    <ConfirmDialog
      isOpen={isOpen}
      type={options.type}
      title={options.title}
      message={options.message}
      confirmText={options.confirmText}
      cancelText={options.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
};

export default ConfirmDialogContainer;
