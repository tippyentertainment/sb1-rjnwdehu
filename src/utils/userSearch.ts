import { User } from '@/types/task';

export const searchUsers = (query: string, users: User[]): User[] => {
  const searchTerm = query.toLowerCase();
  return users.filter(user => 
    user.name.toLowerCase().includes(searchTerm) || 
    (user.username && user.username.toLowerCase().includes(searchTerm))
  );
};

export const getInitials = (name: string = ''): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};