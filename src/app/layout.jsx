import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ModalProvider } from '@/context/ModalContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'LearnSphere — Modern Learning Management System',
  description: 'A minimalist, high-impact LMS featuring structured video lessons, instant auto-graded quizzes, and role-based workspaces.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark scroll-smooth" data-scroll-behavior="smooth">
      <body className="bg-[#181826] text-white min-h-screen flex flex-col selection:bg-white selection:text-[#181826]">
        <AuthProvider>
          <ModalProvider>
            <Navbar />
            <div className="flex-1 pt-18">
              {children}
            </div>
            <Footer />
          </ModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
