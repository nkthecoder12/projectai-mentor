import './globals.css';

export const metadata = {
  title: 'AI Project Mentor - Understand your codebase. Discover what to build next.',
  description: 'AI Project Mentor analyzes your project structure, detects technologies and modules, explains architecture, and helps you learn and build next features.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
