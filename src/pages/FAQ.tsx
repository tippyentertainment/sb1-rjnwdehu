import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CoreConceptsFAQ from '@/components/FAQ/CoreConceptsFAQ';
import FeaturesFAQ from '@/components/FAQ/FeaturesFAQ';
import WorkflowFAQ from '@/components/FAQ/WorkflowFAQ';
import { ArticleList } from '@/components/FAQ/KnowledgeArticles/ArticleList';
import { ArticleEditor } from '@/components/FAQ/KnowledgeArticles/ArticleEditor';
import { supabase } from '@/integrations/supabase/client';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: '🚀' },
    { id: 'features', name: 'Features', icon: '⚡' },
    { id: 'workflows', name: 'Workflows', icon: '🔄' },
    { id: 'integrations', name: 'Integrations', icon: '🔌' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: '🔧' },
  ];

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('No authenticated user found, redirecting to login');
          navigate('/login');
          return;
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      toast({
        title: "Search",
        description: `Searching for: ${searchQuery}`,
      });
    }
  };

  const handleCreateArticle = () => {
    setIsCreateDialogOpen(true);
  };

  const handleArticleSaved = () => {
    setIsCreateDialogOpen(false);
    toast({
      title: "Success",
      description: "Article saved successfully",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Help Center</h2>
            <p className="text-muted-foreground">
              Find answers and manage knowledge base articles
            </p>
          </div>
          <Button onClick={handleCreateArticle} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Article
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Categories Sidebar */}
          <div className="col-span-3 space-y-4">
            <h3 className="font-semibold mb-4">Categories</h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center space-x-2
                    ${selectedCategory === category.id 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted'
                    }`}
                >
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-9">
            <Tabs defaultValue="knowledge" className="space-y-4">
              <TabsList>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
                <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
              </TabsList>
              
              <TabsContent value="faq" className="space-y-8">
                <CoreConceptsFAQ />
                <FeaturesFAQ />
                <WorkflowFAQ />
              </TabsContent>
              
              <TabsContent value="knowledge">
                <ArticleList selectedCategory={selectedCategory} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <ArticleEditor onSave={handleArticleSaved} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
