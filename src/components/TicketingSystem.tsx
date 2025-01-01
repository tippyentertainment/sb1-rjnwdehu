import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/components/Settings/Organization/OrganizationContext';
import { useTicketCreation } from './Tickets/hooks/useTicketCreation';
import TicketListContainer from './Tickets/TicketList/TicketListContainer';
import TicketCreationDialog from './Tickets/TicketCreation/TicketCreationDialog';
import TicketTabs from './Tickets/TicketTabs';
import type { Ticket, NewTicketData, TicketAttachment } from './Tickets/types/ticket';

const TicketingSystem = () => {
  const [activeTab, setActiveTab] = useState('my-desk');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicketData, setNewTicketData] = useState<NewTicketData>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    assignees: [],
    attachments: []
  });
  
  const { toast } = useToast();
  const { organization, currentUser } = useOrganization();

  const fetchTickets = useCallback(async () => {
    try {
      if (!organization?.id) {
        console.log('No organization ID available, skipping ticket fetch');
        return;
      }

      console.log('Fetching tickets for organization:', organization.id);
      
      const { data, error } = await supabase
        .from('help_desk_tickets')
        .select(`
          *,
          created_by:profiles!help_desk_tickets_created_by_fkey(
            id,
            full_name,
            avatar_url
          ),
          assigned_to:profiles!help_desk_tickets_assigned_to_fkey(
            id,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .eq('organization_id', organization.id);

      if (error) {
        console.error('Error fetching tickets:', error);
        throw error;
      }

      console.log('Fetched tickets:', data);
      setTickets(data || []);
    } catch (error) {
      console.error('Error in fetchTickets:', error);
      toast({
        title: "Error",
        description: "Failed to load tickets. Please try again.",
        variant: "destructive"
      });
    }
  }, [organization?.id, toast]);

  useEffect(() => {
    if (organization?.id) {
      console.log('Organization loaded, fetching tickets:', organization.id);
      fetchTickets();
    }
  }, [organization?.id, fetchTickets]);

  useEffect(() => {
    if (!organization?.id) {
      console.log('No organization ID available, skipping realtime subscription');
      return;
    }
    
    console.log('Setting up realtime subscription for organization:', organization.id);
    const channel = supabase
      .channel('help-desk-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'help_desk_tickets',
          filter: `organization_id=eq.${organization.id}`
        },
        async (payload) => {
          console.log('Received real-time update for tickets:', payload);
          await fetchTickets();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up help desk tickets subscription');
      supabase.removeChannel(channel);
    };
  }, [organization?.id, fetchTickets]);

  const handleFileUpload = useCallback(async (files: FileList | null) => {
    if (!files) return;

    try {
      const newAttachments: TicketAttachment[] = [];
      
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const filePath = `${Math.random()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('task-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('task-attachments')
          .getPublicUrl(filePath);

        newAttachments.push({
          id: filePath,
          name: file.name,
          type: file.type,
          preview: file.type.startsWith('image/') ? publicUrl : null,
          url: publicUrl
        });
      }

      setNewTicketData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newAttachments]
      }));
      
      toast({
        title: "Success",
        description: "Files uploaded successfully"
      });
    } catch (error) {
      console.error('Error uploading files:', error);
      toast({
        title: "Error",
        description: "Failed to upload files. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handleRemoveAttachment = useCallback(async (attachmentId: string) => {
    try {
      const { error } = await supabase.storage
        .from('task-attachments')
        .remove([attachmentId]);

      if (error) throw error;

      setNewTicketData(prev => ({
        ...prev,
        attachments: prev.attachments.filter(att => att.id !== attachmentId)
      }));

      toast({
        title: "Success",
        description: "Attachment removed successfully"
      });
    } catch (error) {
      console.error('Error removing attachment:', error);
      toast({
        title: "Error",
        description: "Failed to remove attachment. Please try again.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const { handleCreateTicket, isSubmitting } = useTicketCreation(
    (ticket) => {
      fetchTickets();
      setShowNewTicket(false);
      resetNewTicketData();
    },
    () => setShowNewTicket(false)
  );

  const resetNewTicketData = () => {
    setNewTicketData({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      assignees: [],
      attachments: []
    });
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <Button onClick={() => setShowNewTicket(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Ticket
        </Button>
      </div>

      <div className="space-y-6">
        <TicketTabs tickets={tickets} activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            className="pl-10"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <TicketListContainer tickets={tickets} searchQuery={searchQuery} />
      </div>

      <TicketCreationDialog
        open={showNewTicket}
        onOpenChange={setShowNewTicket}
        ticketData={newTicketData}
        onTicketDataChange={(field, value) => setNewTicketData(prev => ({ ...prev, [field]: value }))}
        onCreateTicket={() => handleCreateTicket(newTicketData)}
        isSubmitting={isSubmitting}
        handleFileUpload={handleFileUpload}
        handleRemoveAttachment={handleRemoveAttachment}
      />
    </div>
  );
};

export default TicketingSystem;