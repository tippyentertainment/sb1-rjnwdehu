import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import { UserCircle2, Users2, Building2, Building, Search } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from '../components/ThemeToggle';
import NotificationInbox from '../components/NotificationInbox';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MainNav } from '@/components/MainNav';

const plans = [
  {
    name: "Small Team",
    price: "$10",
    description: "1-5 people",
    priceDetail: "per person/month",
    features: ["All core features", "Basic support", "5GB storage"],
    icon: UserCircle2
  },
  {
    name: "Medium Team",
    price: "$80",
    description: "10 people",
    priceDetail: "per month total",
    features: ["All core features", "Priority support", "20GB storage"],
    icon: Users2
  },
  {
    name: "Large Team",
    price: "$100",
    description: "20 people",
    priceDetail: "per month total",
    features: ["All core features", "24/7 support", "50GB storage"],
    icon: Building2
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "50+ people",
    priceDetail: "Contact sales",
    features: ["All core features", "Dedicated support", "Custom storage"],
    icon: Building
  }
];

const Subscription = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      console.log('Searching for:', searchQuery);
      
      const query = searchQuery.toLowerCase();
      if (query.includes('task') || query.includes('todo')) {
        navigate('/');
      } else if (query.includes('run') || query.includes('sprint')) {
        navigate('/runs');
      } else if (query.includes('scope') || query.includes('project')) {
        navigate('/scopes');
      } else if (query.includes('help') || query.includes('faq')) {
        navigate('/faq');
      } else {
        toast({
          title: "Searching all sections",
          description: `Searching for "${searchQuery}" across tasks, runs, and scopes`,
        });
      }
    }
  };

  const handleSubscribe = (plan: string) => {
    console.log("Subscribing to plan:", plan);
    toast({
      title: "Coming Soon",
      description: "Subscription functionality will be available soon.",
    });
  };

  const handleContactSales = () => {
    console.log("Contacting sales for Enterprise plan");
    toast({
      title: "Contact Sales",
      description: "Please email sales@company.com for Enterprise pricing.",
    });
  };

  return (
    <div>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center hover:opacity-80 transition-opacity -ml-4">
              <h1 className="text-3xl font-bold whitespace-nowrap">
                <span className="text-[#1A1F2C] dark:text-white [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff,_0px_2px_0_#fff,_2px_0px_0_#fff,_0px_-2px_0_#fff,_-2px_0px_0_#fff] dark:[text-shadow:none]">tasking</span>
                <span className="text-[#F97316] [text-shadow:_-2px_-2px_0_#fff,_2px_-2px_0_#fff,_-2px_2px_0_#fff,_2px_2px_0_#fff,_0px_2px_0_#fff,_2px_0px_0_#fff,_0px_-2px_0_#fff,_-2px_0px_0_#fff] dark:[text-shadow:none]">.tech</span>
                <span className="text-xs align-super">®</span>
              </h1>
            </Link>
            <MainNav />
          </div>

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Search className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <form className="relative p-2">
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="w-full pl-8"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                </form>
              </PopoverContent>
            </Popover>
            <NotificationInbox />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
          <p className="text-muted-foreground">Select the perfect plan for your team</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const IconComponent = plan.icon;
            return (
              <Card key={plan.name} className="flex flex-col">
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4 flex justify-center">
                    <IconComponent className="h-24 w-24 text-primary" />
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.priceDetail}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    onClick={() =>
                      plan.name === "Enterprise"
                        ? handleContactSales()
                        : handleSubscribe(plan.name)
                    }
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Subscribe Now"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Subscription;
