import React from 'react';
import { generateAbsoluteUrl, getMainSiteUrl, getAdminUrl } from '@/lib/domains';

interface ExternalLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  rel?: string;
  forceMainDomain?: boolean;
  forceAdminDomain?: boolean;
}

/**
 * Componente para enlaces externos que apuntan a dominios específicos
 * Útil para enlaces que deben apuntar a pessaro.cl o login.pessaro.cl desde cualquier contexto
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  children,
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer',
  forceMainDomain = false,
  forceAdminDomain = false
}) => {
  let finalUrl = href;

  if (forceMainDomain) {
    finalUrl = getMainSiteUrl(href);
  } else if (forceAdminDomain) {
    finalUrl = getAdminUrl(href);
  } else {
    finalUrl = generateAbsoluteUrl(href);
  }

  return (
    <a
      href={finalUrl}
      className={className}
      target={target}
      rel={rel}
    >
      {children}
    </a>
  );
};

/**
 * Componente específico para enlaces al sitio principal (pessaro.cl)
 */
export const MainSiteLink: React.FC<Omit<ExternalLinkProps, 'forceMainDomain' | 'forceAdminDomain'>> = (props) => (
  <ExternalLink {...props} forceMainDomain={true} />
);

/**
 * Componente específico para enlaces administrativos (login.pessaro.cl)
 */
export const AdminLink: React.FC<Omit<ExternalLinkProps, 'forceMainDomain' | 'forceAdminDomain'>> = (props) => (
  <ExternalLink {...props} forceAdminDomain={true} />
);

export default ExternalLink;