'use client';

import { useEffect } from 'react';

let lockCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';
let previousBodyPaddingRight = '';

/**
 * Custom hook to lock background scrolling when a modal or dialog is open.
 * Supports nested/concurrent modals via reference counting and prevents layout shift.
 *
 * @param {boolean} lock - Whether scroll lock should currently be active
 */
export default function useScrollLock(lock = true) {
  useEffect(() => {
    if (!lock || typeof document === 'undefined') return;

    if (lockCount === 0) {
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverflow = document.documentElement.style.overflow;
      previousBodyPaddingRight = document.body.style.paddingRight;

      // Prevent content jump when vertical scrollbar vanishes
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    }
    lockCount++;

    return () => {
      lockCount--;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = previousBodyOverflow || '';
        document.documentElement.style.overflow = previousHtmlOverflow || '';
        document.body.style.paddingRight = previousBodyPaddingRight || '';
      }
    };
  }, [lock]);
}
