import React from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Home,
  Calculator,
  History,
  BookOpen,
  HelpCircle,
  Shield,
  Scale,
  MessageSquare,
  Moon,
  Sun,
  User,
  LogOut,
  Gamepad2,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import { useDarkMode } from "@/contexts/DarkModeContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarContext,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { title: "Home", url: "/", icon: Home, protected: false },
  { title: "Math Arcade", url: createPageUrl("Arcade"), icon: Gamepad2, protected: false },
  { title: "Flashcards", url: createPageUrl("Flashcards"), icon: Sparkles, protected: false },
  { title: "Solver", url: createPageUrl("Solver"), icon: Calculator, protected: true },
  { title: "Quiz", url: createPageUrl("Quiz"), icon: BookOpen, protected: true },
  { title: "My Progress", url: createPageUrl("Progress"), icon: History, protected: true },
  { title: "Math Community", url: createPageUrl("Community"), icon: MessageSquare, protected: true },
  { title: "User Manual", url: createPageUrl("UserManual"), icon: BookOpen, protected: false },
  { title: "FAQ", url: createPageUrl("FAQ"), icon: HelpCircle, protected: false },
  { title: "Feedback & Support", url: createPageUrl("Feedback"), icon: MessageSquare, protected: false },
  { title: "Privacy Policy", url: createPageUrl("PrivacyPolicy"), icon: Shield, protected: false },
  { title: "Profile", url: createPageUrl("Profile"), icon: User, protected: true },
];

export default function Layout({ user, setUser }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isOpen } = React.useContext(SidebarContext);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-[#0B0F19] transition-all duration-300">
      {/* Sidebar */}
      <Sidebar role="navigation">
        <SidebarHeader className="border-b border-[var(--border)] p-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/favicon.png" alt="Logo" className="w-10 h-10 rounded-xl" />
            <div>
              <h2 className="font-bold text-base" style={{ color: 'var(--foreground)' }}>
                Maths Solver
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Learn math with confidence</p>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="p-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems
                  .filter(item => !item.protected || (item.protected && user))
                  .map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={`hover:bg-[var(--muted)] transition-all duration-200 rounded-lg mb-1 ${
                          location.pathname === item.url
                            ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                            : ''
                        }`}
                        style={{ color: location.pathname === item.url ? 'var(--primary-foreground)' : 'var(--sidebar-foreground)' }}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white dark:bg-[#0F172A] border-b border-gray-200 dark:border-[#2A3550] px-4 py-3 flex justify-between items-center shadow-lg" style={{ height: '64px' }}>
        <SidebarTrigger className="hover:bg-gray-100 dark:hover:bg-[var(--muted)] p-2 rounded-lg transition-colors duration-200" style={{ color: 'var(--foreground)' }} />
        <div className="flex items-center gap-2">
          {!user ? (
            <>
              <button onClick={toggleDarkMode} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--muted)] transition-colors duration-200" style={{ color: 'var(--foreground)' }}>
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/login" className="btn btn-primary btn-sm">
                Login
              </Link>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <img src={user.photoURL || "/default-profile.png"} alt="Profile" className="w-8 h-8 rounded-full" />
                  <span style={{ color: 'var(--foreground)' }}>{user.displayName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[var(--card)] border-[var(--border)]">
                <DropdownMenuItem onClick={() => navigate(createPageUrl("Profile"))} className="focus:bg-[var(--muted)]" style={{ color: 'var(--foreground)' }}>
                  <User className="w-4 h-4 mr-2" /> Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleDarkMode} className="focus:bg-[var(--muted)]" style={{ color: 'var(--foreground)' }}>
                  {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />} Theme
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="focus:bg-[var(--destructive)]/10" style={{ color: 'var(--destructive)' }}>
                  <LogOut className="w-4 h-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </header>

      {/* Main area */}
      <div className="flex-1 flex flex-col pt-16">
        <div className={`flex-1 flex flex-col transition-all duration-300 min-h-[calc(100vh-4rem)] ${isOpen ? "ml-60" : "ml-0"}`}>
          <main className="flex-1 overflow-auto p-4 md:p-6 transition-all duration-300">
            <div className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
              <Outlet />
            </div>
          </main>

          <footer className="border-t border-[var(--border)] px-4 py-3 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Maths Solver v1.1.0 © 2025 | <Link to={createPageUrl("PrivacyPolicy")} className="hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</Link> | <Link to={createPageUrl("Feedback")} className="hover:underline" style={{ color: 'var(--primary)' }}>Feedback</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}

