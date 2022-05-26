import { useState } from 'react';
export default function useModal() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  function openModal() {
    setIsOpen(true);
  }
  function closeModal() {
    setIsOpen(false);
  }
  function toggle() {
    setIsOpen((prevState) => !prevState);
  }

  return { isOpen, openModal, closeModal, toggle };
}
