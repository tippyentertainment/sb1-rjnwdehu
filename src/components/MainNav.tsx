import React, { useState, useEffect } from 'react';
import { Menu, Search } from 'lucide-react';
import { NavigationMenu, NavigationMenuList } from "@/components/ui/navigation-menu";
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Link, useNavigate } from 'react-router-dom';
import { OnlineStatus } from './Settings/OnlineStatusSelector';
import { UserDropdown } from './Navigation/UserDropdown';
import { NavItems } from './Navigation/NavItems';
import NotificationInbox from './NotificationInbox';
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ThemeToggle } from './ThemeToggle';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { notificationSound } from '@/utils/sound';
import { useUserProfile } from './Navigation/UserProfile';

export const MainNav = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<OnlineStatus>('online');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: profile } = useUserProfile();

  useEffect(() => {
    const updateProfileStatus = async () => {
      try {
        console.log('Attempting to update user status to:', status);
        const { error } = await supabase.rpc('update_user_status', {
          p_user_id: (await supabase.auth.getUser()).data.user?.id,
          p_status: status
        });

        if (error) throw error;
        
        console.log('Profile status updated:', status);
      } catch (error) {
        console.error('Error updating profile status:', error);
        toast({
          title: "Error",
          description: "Failed to update status",
          variant: "destructive",
        });
      }
    };

    updateProfileStatus();
  }, [status, toast]);

  const getStatusColor = (status: OnlineStatus) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
        return 'bg-gray-400';
    }
  };

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log('Searching for:', searchQuery);
    
    if (searchQuery.trim()) {
      const { data: articleTags } = await supabase
        .from('tags')
        .select('id, name')
        .textSearch('name', searchQuery.trim())
        .limit(1);

      if (articleTags && articleTags.length > 0) {
        navigate(`/faq?tag=${articleTags[0].id}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
          <h1 className="text-2xl md:text-3xl font-bold whitespace-nowrap">
            <span className="text-[#1A1F2C] dark:text-white [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff,_0px_2px_0_#fff,_2px_0px_0_#fff,_0px_-2px_0_#fff,_-2px_0px_0_#fff] dark:[text-shadow:none]">tasking</span>
            <span className="text-[#F97316] [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff,_0px_2px_0_#fff,_2px_0px_0_#fff,_0px_-2px_0_#fff,_-2px_0px_0_#fff] dark:[text-shadow:none]">.tech</span>
            <span className="text-xs align-super">®</span>
          </h1>
        </Link>

        <div className="hidden md:flex items-center">
          <NavigationMenu>
            <NavigationMenuList>
              <NavItems />
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 md:h-10 md:w-10">
                <Search className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <form onSubmit={handleSearch} className="relative p-2">
                <Input
                  type="search"
                  placeholder="Search chat, tasks, reports, scopes, articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </form>
            </PopoverContent>
          </Popover>
          <ThemeToggle />
          <NotificationInbox />
          <UserDropdown 
            status={profile?.status as OnlineStatus || status}
            setStatus={setStatus}
            getStatusColor={getStatusColor}
          />
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10 md:hidden"
                onClick={() => setIsOpen(true)}
              >
                <Menu className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <div className="flex flex-col space-y-3 mt-8">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};
