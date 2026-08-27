'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import CourseModal from '@/components/dashboard/CourseModal';
import BlogModal from '@/components/dashboard/BlogModal';

const ModalContext = createContext({
  openCreateCourse: () => { },
  closeCreateCourse: () => { },
  openCreateBlog: () => { },
  closeCreateBlog: () => { },
  triggerRefresh: () => { },
  refreshCount: 0,
});

export function ModalProvider({ children }) {
  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshCount((c) => c + 1);
  }, []);

  const openCreateCourse = useCallback(() => {
    setIsCourseOpen(true);
  }, []);

  const closeCreateCourse = useCallback(() => {
    setIsCourseOpen(false);
  }, []);

  const openCreateBlog = useCallback(() => {
    setIsBlogOpen(true);
  }, []);

  const closeCreateBlog = useCallback(() => {
    setIsBlogOpen(false);
  }, []);

  const handleCourseSaved = () => {
    setIsCourseOpen(false);
    triggerRefresh();
  };

  const handleBlogSaved = () => {
    setIsBlogOpen(false);
    triggerRefresh();
  };

  return (
    <ModalContext.Provider
      value={{
        openCreateCourse,
        closeCreateCourse,
        openCreateBlog,
        closeCreateBlog,
        triggerRefresh,
        refreshCount,
      }}
    >
      {children}

      {/* Global Action Modals */}
      <CourseModal
        isOpen={isCourseOpen}
        onClose={closeCreateCourse}
        course={null}
        onSaved={handleCourseSaved}
      />

      <BlogModal
        isOpen={isBlogOpen}
        onClose={closeCreateBlog}
        post={null}
        onSaved={handleBlogSaved}
      />
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);

