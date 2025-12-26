import { useState, useCallback } from 'react';
import {
  shouldShowEmailCapture,
  markTriggerShown,
  markAsSubscribed,
  trackDismissal,
} from '../utils/emailCaptureManager';

type TriggerType = 'guestMilestone' | 'optimizerSuccess' | 'exportAttempt';

interface UseEmailCaptureResult {
  showModal: boolean;
  currentSource: 'landing' | 'value_moment' | 'export_prompt';
  triggerEmailCapture: (trigger: TriggerType) => boolean;
  closeModal: (subscribed?: boolean) => void;
}

/**
 * Hook for managing email capture modal state
 * Call triggerEmailCapture() at value moments to potentially show the modal
 */
export function useEmailCapture(): UseEmailCaptureResult {
  const [showModal, setShowModal] = useState(false);
  const [currentSource, setCurrentSource] = useState<'landing' | 'value_moment' | 'export_prompt'>('value_moment');

  const triggerEmailCapture = useCallback((trigger: TriggerType): boolean => {
    if (shouldShowEmailCapture(trigger)) {
      markTriggerShown(trigger);
      setCurrentSource(trigger === 'exportAttempt' ? 'export_prompt' : 'value_moment');
      setShowModal(true);
      return true;
    }
    return false;
  }, []);

  const closeModal = useCallback((subscribed = false) => {
    if (subscribed) {
      markAsSubscribed();
    } else {
      trackDismissal();
    }
    setShowModal(false);
  }, []);

  return {
    showModal,
    currentSource,
    triggerEmailCapture,
    closeModal,
  };
}
