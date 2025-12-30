import { useState } from 'react';

// Hook to manage guest panel state
export function useMobileGuestPanel() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
  };
}
