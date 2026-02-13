import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Facebook, Linkedin, MessageCircle, Link, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { BlogPost } from '@/lib/index';

interface SocialShareProps {
  post: BlogPost;
  className?: string;
}

const SocialShare: React.FC<SocialShareProps> = ({ post, className = '' }) => {
  const [copied, setCopied] = useState(false);

  // Generar URL del artículo (en producción sería la URL real)
  const articleUrl = `${window.location.origin}/blog/${post.id}`;
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(post.title);
  const encodedExcerpt = encodeURIComponent(post.excerpt);

  // URLs para compartir en redes sociales
  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodedTitle}&summary=${encodedExcerpt}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
  };

  const handleShare = (platform: keyof typeof shareUrls) => {
    const url = shareUrls[platform];
    window.open(url, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes');
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = articleUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`flex items-center gap-2 hover:bg-primary/10 transition-colors ${className}`}
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">Compartir</span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
          Compartir artículo
        </div>
        <DropdownMenuSeparator />
        
        {/* Facebook */}
        <DropdownMenuItem
          onClick={() => handleShare('facebook')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <Facebook className="w-4 h-4 text-white" />
          </div>
          <span>Facebook</span>
        </DropdownMenuItem>

        {/* LinkedIn */}
        <DropdownMenuItem
          onClick={() => handleShare('linkedin')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
            <Linkedin className="w-4 h-4 text-white" />
          </div>
          <span>LinkedIn</span>
        </DropdownMenuItem>

        {/* WhatsApp */}
        <DropdownMenuItem
          onClick={() => handleShare('whatsapp')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <span>WhatsApp</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Copiar URL */}
        <DropdownMenuItem
          onClick={handleCopyUrl}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            {copied ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Link className="w-4 h-4 text-white" />
            )}
          </div>
          <span>{copied ? 'URL Copiada!' : 'Copiar URL'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShare;