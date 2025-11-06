import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LogOut, 
  User, 
  Settings, 
  Home, 
  Upload, 
  Youtube, 
  Menu, 
  Target,
  BarChart3
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Mobile menu trigger */}
        <div className="md:hidden flex items-center mr-2">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="mr-2">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64">
              <div className="flex flex-col h-full">
                <div className="flex items-center py-4 border-b">
                  <Youtube className="h-6 w-6 text-primary mr-2" />
                  <span className="text-lg font-bold">YTB Pulse Pro</span>
                </div>
                <nav className="flex flex-col space-y-4 py-4 flex-1">
                  <Link 
                    to="/dashboard" 
                    className="flex items-center py-2 px-4 rounded-md hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Home className="mr-2 h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link 
                    to="/upload" 
                    className="flex items-center py-2 px-4 rounded-md hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Upload className="mr-2 h-5 w-5" />
                    <span>Upload</span>
                  </Link>
                  <Link 
                    to="/compare" 
                    className="flex items-center py-2 px-4 rounded-md hover:bg-accent"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Target className="mr-2 h-5 w-5" />
                    <span>Compare Channels</span>
                  </Link>
                </nav>
                {user && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center px-4 py-2">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="" alt={user.name || user.email} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{user.name || user.email}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                    <div className="flex flex-col space-y-2 mt-2 px-4">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start"
                        onClick={() => {
                          navigate('/dashboard');
                          setIsMenuOpen(false);
                        }}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start"
                        onClick={() => {
                          navigate('/settings');
                          setIsMenuOpen(false);
                        }}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="justify-start"
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                )}
                {!user && (
                  <div className="pt-4 border-t">
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => {
                        navigate('/auth');
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign In
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
          
          {/* Mobile brand */}
          <Link className="flex items-center" to="/">
            <Youtube className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold ml-2">YTB</span>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="mr-4 hidden md:flex">
          <Link className="mr-6 flex items-center space-x-2" to="/">
            <Youtube className="h-6 w-6 text-primary" />
            <span className="hidden font-bold sm:inline-block">YTB Pulse Pro</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link to="/dashboard" className="transition-colors hover:text-foreground/80 text-foreground">
              <Home className="mr-2 h-4 w-4 inline" />
              Dashboard
            </Link>
            <Link to="/upload" className="transition-colors hover:text-foreground/80 text-foreground/60">
              <Upload className="mr-2 h-4 w-4 inline" />
              Upload
            </Link>
            <Link to="/compare" className="transition-colors hover:text-foreground/80 text-foreground/60">
              <Target className="mr-2 h-4 w-4 inline" />
              Compare
            </Link>
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          {user ? (
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.name || user.email} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                  <Home className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/upload')}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Upload Content</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/compare')}>
                  <Target className="mr-2 h-4 w-4" />
                  <span>Compare Channels</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/analytics')}>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Analytics</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="hero" onClick={() => navigate('/auth')}>
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;