import { supabase } from '@/integrations/supabase/client';
import { Tag } from '@/types/task';

export const fetchTags = async (organizationId: string): Promise<Tag[]> => {
  try {
    console.log('Fetching tags for organization:', organizationId);
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('organization_id', organizationId);

    if (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }

    const formattedTags: Tag[] = tags.map(tag => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      organization_id: tag.organization_id,
      created_at: tag.created_at,
      created_by: tag.created_by
    }));

    console.log('Successfully fetched tags:', formattedTags);
    return formattedTags;
  } catch (error) {
    console.error('Error in fetchTags:', error);
    throw error;
  }
};

export const createTag = async (
  name: string,
  color: string,
  organizationId: string
): Promise<Tag> => {
  try {
    console.log('Creating new tag:', { name, color, organizationId });
    
    const { data: tag, error } = await supabase
      .from('tags')
      .insert([
        {
          name,
          color,
          organization_id: organizationId,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating tag:', error);
      throw error;
    }

    console.log('Successfully created tag:', tag);
    return tag;
  } catch (error) {
    console.error('Error in createTag:', error);
    throw error;
  }
};

export const associateTagWithTask = async (taskId: string, tagId: string): Promise<void> => {
  try {
    console.log('Associating tag with task:', { taskId, tagId });
    
    const { error } = await supabase
      .from('task_tags')
      .insert([{ task_id: taskId, tag_id: tagId }]);

    if (error) {
      console.error('Error associating tag with task:', error);
      throw error;
    }

    console.log('Successfully associated tag with task');
  } catch (error) {
    console.error('Error in associateTagWithTask:', error);
    throw error;
  }
};

export const removeTagFromTask = async (taskId: string, tagId: string): Promise<void> => {
  try {
    console.log('Removing tag from task:', { taskId, tagId });
    
    const { error } = await supabase
      .from('task_tags')
      .delete()
      .match({ task_id: taskId, tag_id: tagId });

    if (error) {
      console.error('Error removing tag from task:', error);
      throw error;
    }

    console.log('Successfully removed tag from task');
  } catch (error) {
    console.error('Error in removeTagFromTask:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const fetchTaskTags = fetchTags;