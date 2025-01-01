import { supabase } from '@/integrations/supabase/client';
import { notifyMentionedUser } from '@/services/notificationService';
import { User } from '@/types/task';

export const handleMentions = async (content: string, users: User[]) => {
  const mentionRegex = /@(\w+)/g;
  const mentions = content.match(mentionRegex) || [];
  const mentionedUsers: User[] = [];

  for (const mention of mentions) {
    const username = mention.slice(1);
    const user = users.find(u => 
      u.username?.toLowerCase() === username.toLowerCase() ||
      u.name?.toLowerCase() === username.toLowerCase()
    );
    
    if (user) {
      mentionedUsers.push(user);
      console.log(`Notifying mentioned user: ${user.name}`);
      notifyMentionedUser(user, 'Someone mentioned you in a comment');
    }
  }

  return mentionedUsers;
};

export const uploadCommentAttachment = async (
  file: File,
  taskId: string,
  userId: string
): Promise<string> => {
  console.log('Uploading comment attachment:', file.name);
  
  const fileExt = file.name.split('.').pop();
  const filePath = `${taskId}/${Math.random().toString(36).slice(2)}.${fileExt}`;
  
  const { error: uploadError } = await supabase.storage
    .from('task-attachments')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('task-attachments')
    .getPublicUrl(filePath);

  // Save attachment metadata
  const { error: dbError } = await supabase
    .from('attachments')
    .insert({
      task_id: taskId,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: userId
    });

  if (dbError) {
    console.error('Error saving attachment metadata:', dbError);
    throw dbError;
  }

  console.log('File uploaded successfully:', publicUrl);
  return publicUrl;
};