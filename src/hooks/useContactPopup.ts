import { useState } from 'react';

type PopupType = 'account' | 'demo' | 'start' | 'guide';

export const useContactPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popupType, setPopupType] = useState<PopupType>('account');

  const openPopup = (type: PopupType) => {
    setPopupType(type);
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    popupType,
    openPopup,
    closePopup,
  };
};