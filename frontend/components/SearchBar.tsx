'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { profileAPI } from '@/services/api.service';
import { toast } from 'sonner';

interface SearchResult {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  level: number;
  xp: number;
}

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      searchUsers(query);
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = async (searchQuery: string) => {
    try {
      setLoading(true);
      const response = await profileAPI.searchUsers(searchQuery, 10);
      setResults(response.data.data || []);
      setIsOpen(true);
    } catch (error: any) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (userId: string) => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    router.push(`/profile/${userId}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search users..."
          className="w-full pl-12 pr-12 py-3 bg-background/80 backdrop-blur-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring focus:bg-background text-foreground placeholder-muted-foreground shadow-md transition-all duration-200 font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-popover/95 backdrop-blur-lg border border-border rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <User className="w-14 h-14 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-semibold text-foreground">No users found</p>
              <p className="text-sm mt-1">Try a different search term</p>
            </div>
          ) : (
            <div className="py-2">
              {results.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelectUser(user._id)}
                  className="w-full px-4 py-3 hover:bg-accent transition-all duration-200 flex items-center gap-3 text-left group"
                >
                  <Avatar className="w-11 h-11 ring-2 ring-transparent group-hover:ring-ring transition-all">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback className="bg-gradient-to-br from-green-600 to-teal-600 text-white font-bold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                    {user.bio && (
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5">
                        {user.bio}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-1 text-xs bg-gradient-to-r from-green-100 to-teal-100 text-green-700 px-2.5 py-1 rounded-full font-bold shadow-sm">
                      <span>Lv {user.level}</span>
                    </div>
                    <div className="text-xs text-muted-foreground font-medium">
                      {user.xp.toLocaleString()} XP
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
