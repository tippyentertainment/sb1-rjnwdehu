import React, { useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "./ui/dialog";
import FileViewer from './FileViewer/FileViewer';
import type { Attachment } from '@/types/task';

interface AttachmentSectionProps {
  attachments: string[];
  onUpdate: (attachments: string[]) => void;
  taskId?: string;
}

const AttachmentSection: React.FC<AttachmentSectionProps> = ({ attachments, onUpdate, taskId }) => {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<{ name: string; type: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setIsUploading(true);
      try {
        const newAttachments = [...attachments];
        
        for (const file of Array.from(files)) {
          console.log(`Uploading file: ${file.name} (${file.type})`);
          
          const fileExt = file.name.split('.').pop();
          const filePath = `${taskId}/${Math.random().toString(36).slice(2)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('task-attachments')
            .upload(filePath, file);

          if (uploadError) {
            console.error('Error uploading file:', uploadError);
            throw uploadError;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('task-attachments')
            .getPublicUrl(filePath);

          const { error: dbError } = await supabase
            .from('attachments')
            .insert({
              task_id: taskId,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
              uploaded_by: (await supabase.auth.getUser()).data.user?.id
            });

          if (dbError) {
            console.error('Error saving attachment metadata:', dbError);
            throw dbError;
          }

          newAttachments.push(publicUrl);
        }

        onUpdate(newAttachments);
        
        toast({
          title: "Files attached",
          description: `${files.length} file(s) have been attached successfully`,
        });
      } catch (error) {
        console.error('Error handling file upload:', error);
        toast({
          title: "Error",
          description: "Failed to upload files. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async (index: number) => {
    try {
      const deletedFile = attachments[index];
      // Extract the file path from the URL
      const filePath = deletedFile.split('/').slice(-2).join('/');
      
      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('task-attachments')
        .remove([filePath]);

      if (deleteError) {
        console.error('Error deleting file from storage:', deleteError);
        throw deleteError;
      }

      // Delete from attachments table
      const { error: dbError } = await supabase
        .from('attachments')
        .update({ deleted: true })
        .eq('file_path', filePath);

      if (dbError) {
        console.error('Error updating attachment record:', dbError);
        throw dbError;
      }

      const newAttachments = attachments.filter((_, i) => i !== index);
      onUpdate(newAttachments);

      console.log(`File deleted: ${deletedFile}`);
      toast({
        title: "File removed",
        description: "The attachment has been removed successfully",
      });
    } catch (error) {
      console.error('Error deleting file:', error);
      toast({
        title: "Error",
        description: "Failed to remove file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileType = (filename: string): string => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'tif', 'bmp'].includes(extension)) return 'image';
    if (['pdf', 'doc', 'docx'].includes(extension)) return 'document';
    return 'other';
  };

  const getFileName = (path: string): string => {
    return path.split('/').pop() || path;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Attachments ({attachments.length})</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          className="hover:bg-primary/20"
          disabled={isUploading}
        >
          <label className="cursor-pointer flex items-center gap-2">
            <Paperclip className="h-4 w-4" />
            <input
              type="file"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.tif,.bmp"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
            {isUploading ? 'Uploading...' : 'Add Files'}
          </label>
        </Button>
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {attachments.map((attachment, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <div 
                className="flex items-center justify-between p-2 bg-secondary/20 rounded group hover:bg-secondary/30 cursor-pointer"
                onClick={() => setSelectedFile({ 
                  name: getFileName(attachment), 
                  type: getFileType(attachment)
                })}
              >
                <span className="text-sm truncate flex-1 mr-2">
                  {getFileName(attachment)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(index);
                  }}
                  className="text-destructive hover:bg-destructive/20 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{getFileName(attachment)}</DialogTitle>
                <DialogDescription>
                  Preview of the attached file
                </DialogDescription>
              </DialogHeader>
              {selectedFile && (
                <FileViewer 
                  file={attachment}
                  type={selectedFile.type}
                  className="mt-4"
                />
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default AttachmentSection;