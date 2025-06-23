import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BarChart3, Database, Settings, User, ChevronDown, Package, ClipboardCheck, UserCheck, TrendingUp, Wrench, HelpCircle, FileText, PenTool as Tool } from 'lucide-react';

interface NavigationProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Navigation({ isOpen, setIsOpen }: NavigationProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [maintenanceDropdownOpen, setMaintenanceDropdownOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleMaintenanceDropdown = () => setMaintenanceDropdownOpen(!maintenanceDropdownOpen);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3 },
    { path: '/registry', label: 'Asset Registry', icon: Database },
    { path: '/analytics', label: 'Analytics', icon: TrendingUp },
  ];

  const assetManagementItems = [
    { path: '/generate-assets', label: 'Generate Assets', icon: Package },
    { path: '/audit-tasks', label: 'Audit Tasks', icon: ClipboardCheck },
    { path: '/assign-assets', label: 'Assign Assets', icon: UserCheck },
  ];

  const maintenanceItems = [
    { path: '/maintenance-portal', label: 'Submit Request', icon: FileText },
    { path: '/maintenance-requests', label: 'Manage Requests', icon: Tool },
    { path: '/help-desk', label: 'Help Desk', icon: HelpCircle },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AssetFlow</h1>
                <p className="text-xs text-slate-300">Enterprise</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-2 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50 ${
                      isActive(item.path) 
                        ? 'text-blue-400 bg-slate-800/50' 
                        : 'text-slate-300 hover:text-blue-400'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Asset Management Dropdown */}
              <div className="relative">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <Package className="w-4 h-4" />
                  <span className="font-medium">Asset Management</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl py-2 z-40">
                    {assetManagementItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Maintenance Dropdown */}
              <div className="relative group">
                <button 
                  onClick={toggleMaintenanceDropdown}
                  className="flex items-center space-x-2 text-slate-300 hover:text-blue-400 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50"
                >
                  <Wrench className="w-4 h-4" />
                  <span className="font-medium">Maintenance</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${maintenanceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {maintenanceDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-lg border border-slate-700/50 rounded-xl shadow-xl py-2 z-40">
                    {maintenanceItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-2 px-4 py-2 text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 transition-colors duration-200"
                          onClick={() => setMaintenanceDropdownOpen(false)}
                        >
                          <IconComponent className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link
                to="/settings"
                className={`flex items-center space-x-2 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-slate-800/50 ${
                  isActive('/settings') 
                    ? 'text-blue-400 bg-slate-800/50' 
                    : 'text-slate-300 hover:text-blue-400'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="font-medium">Settings</span>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors duration-200"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={toggleSidebar} />
      <aside className={`fixed top-0 left-0 h-full w-80 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 z-50 lg:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AssetFlow</h1>
              <p className="text-xs text-slate-300">Enterprise</p>
            </div>
          </Link>
          
          <nav className="space-y-2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 transition-colors duration-200 px-4 py-3 rounded-lg ${
                    isActive(item.path) 
                      ? 'text-blue-400 bg-slate-800/50' 
                      : 'text-slate-300 hover:text-blue-400 hover:bg-slate-800/50'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
            
            <div>
              <button 
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 transition-colors duration-200 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-5 h-5" />
                  <span className="font-medium">Asset Management</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  {assetManagementItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-slate-800/30"
                        onClick={() => setIsOpen(false)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Maintenance Items */}
            <div>
              <button 
                onClick={toggleMaintenanceDropdown}
                className="w-full flex items-center justify-between text-slate-300 hover:text-blue-400 hover:bg-slate-800/50 transition-colors duration-200 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Wrench className="w-5 h-5" />
                  <span className="font-medium">Maintenance</span>
                </div>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${maintenanceDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {maintenanceDropdownOpen && (
                <div className="ml-8 mt-2 space-y-1">
                  {maintenanceItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex items-center space-x-2 text-slate-400 hover:text-blue-400 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-slate-800/30"
                        onClick={() => setIsOpen(false)}
                      >
                        <IconComponent className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              className={`flex items-center space-x-3 transition-colors duration-200 px-4 py-3 rounded-lg ${
                isActive('/profile') 
                  ? 'text-blue-400 bg-slate-800/50' 
                  : 'text-slate-300 hover:text-blue-400 hover:bg-slate-800/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5" />
              <span className="font-medium">Profile</span>
            </Link>
            <Link
              to="/settings"
              className={`flex items-center space-x-3 transition-colors duration-200 px-4 py-3 rounded-lg ${
                isActive('/settings') 
                  ? 'text-blue-400 bg-slate-800/50' 
                  : 'text-slate-300 hover:text-blue-400 hover:bg-slate-800/50'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium">Settings</span>
            </Link>
          </nav>
        </div>
      </aside>
    </>
  );
}