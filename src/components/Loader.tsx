import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo o Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-primary rounded-full opacity-20"></div>
          </div>
        </div>
        
        {/* Texto de carga */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Cargando Pessaro Capital
          </h2>
          <p className="text-sm text-muted-foreground">
            Preparando tu experiencia de trading...
          </p>
        </div>
        
        {/* Barra de progreso animada */}
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;