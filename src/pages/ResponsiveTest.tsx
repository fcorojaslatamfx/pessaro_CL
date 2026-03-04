import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ResponsiveTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Test Header */}
      <header className="bg-primary text-primary-foreground py-mobile-md">
        <div className="container-wide">
          <h1 className="text-fluid-2xl font-bold">Prueba Responsive</h1>
          <p className="text-fluid-base opacity-90">Verificación de breakpoints y márgenes</p>
        </div>
      </header>

      {/* Test Sections */}
      <main className="py-mobile-lg space-mobile-xl">
        {/* Container Tests */}
        <section className="py-mobile-md bg-muted/30">
          <div className="container-wide">
            <h2 className="text-fluid-xl font-bold mb-mobile-md">Contenedores Responsive</h2>
            <div className="grid grid-responsive-3 gap-mobile-md">
              <Card className="card-mobile-sm">
                <CardHeader>
                  <CardTitle className="text-fluid-lg">Container Wide</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fluid-base">Contenedor amplio con padding responsive</p>
                </CardContent>
              </Card>
              
              <Card className="card-mobile-sm">
                <CardHeader>
                  <CardTitle className="text-fluid-lg">Container Narrow</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fluid-base">Contenedor estrecho centrado</p>
                </CardContent>
              </Card>
              
              <Card className="card-mobile-sm">
                <CardHeader>
                  <CardTitle className="text-fluid-lg">Container Fluid</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-fluid-base">Contenedor fluido sin máximo</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Button Tests */}
        <section className="py-mobile-md">
          <div className="container-narrow">
            <h2 className="text-fluid-xl font-bold mb-mobile-md">Botones Responsive</h2>
            <div className="flex flex-col sm:flex-row gap-mobile-sm">
              <Button className="btn-mobile-sm">Botón Pequeño</Button>
              <Button className="btn-mobile-md">Botón Mediano</Button>
              <Button className="btn-mobile-lg">Botón Grande</Button>
            </div>
          </div>
        </section>

        {/* Typography Tests */}
        <section className="py-mobile-md bg-card">
          <div className="container-wide px-mobile-md">
            <h2 className="text-fluid-3xl font-bold mb-mobile-md">Tipografía Fluida</h2>
            <div className="space-mobile-md">
              <h3 className="text-fluid-2xl font-semibold">Título Fluido 2XL</h3>
              <h4 className="text-fluid-xl font-semibold">Título Fluido XL</h4>
              <h5 className="text-fluid-lg font-semibold">Título Fluido LG</h5>
              <p className="text-fluid-base">Párrafo con texto fluido base que se adapta a diferentes tamaños de pantalla.</p>
              <p className="text-fluid-sm">Texto pequeño fluido para detalles y notas.</p>
            </div>
          </div>
        </section>

        {/* Grid Tests */}
        <section className="py-mobile-md">
          <div className="container-wide">
            <h2 className="text-fluid-xl font-bold mb-mobile-md">Grids Responsive</h2>
            
            <h3 className="text-fluid-lg font-semibold mb-mobile-sm">Grid Auto (1-2-3-4)</h3>
            <div className="grid grid-mobile-auto gap-mobile-sm mb-mobile-md">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <Card key={i} className="card-mobile-sm">
                  <CardContent className="text-center">
                    <p className="text-fluid-base font-semibold">Item {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-fluid-lg font-semibold mb-mobile-sm">Grid Blog (1-2-3)</h3>
            <div className="grid grid-responsive-blog gap-mobile-md mb-mobile-md">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <Card key={i} className="card-mobile-md">
                  <CardContent className="text-center">
                    <p className="text-fluid-base font-semibold">Blog {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="text-fluid-lg font-semibold mb-mobile-sm">Grid Features (1-2-4)</h3>
            <div className="grid grid-responsive-features gap-mobile-lg">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="card-mobile-lg">
                  <CardContent className="text-center">
                    <p className="text-fluid-base font-semibold">Feature {i}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Spacing Tests */}
        <section className="py-mobile-md bg-muted/20">
          <div className="container-narrow">
            <h2 className="text-fluid-xl font-bold mb-mobile-md">Espaciado Responsive</h2>
            <div className="space-mobile-lg">
              <Card className="card-mobile-sm">
                <CardContent>
                  <p className="text-fluid-base">Elemento con espaciado mobile-lg</p>
                </CardContent>
              </Card>
              <Card className="card-mobile-sm">
                <CardContent>
                  <p className="text-fluid-base">Segundo elemento</p>
                </CardContent>
              </Card>
              <Card className="card-mobile-sm">
                <CardContent>
                  <p className="text-fluid-base">Tercer elemento</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Visibility Tests */}
        <section className="py-mobile-md">
          <div className="container-wide">
            <h2 className="text-fluid-xl font-bold mb-mobile-md">Visibilidad por Breakpoint</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-mobile-md">
              <Card className="card-mobile-sm show-mobile">
                <CardContent className="text-center">
                  <p className="text-fluid-base font-semibold text-green-600">Solo Móvil</p>
                  <p className="text-fluid-sm">Visible solo en móviles</p>
                </CardContent>
              </Card>
              
              <Card className="card-mobile-sm show-tablet">
                <CardContent className="text-center">
                  <p className="text-fluid-base font-semibold text-blue-600">Solo Tablet</p>
                  <p className="text-fluid-sm">Visible solo en tablets</p>
                </CardContent>
              </Card>
              
              <Card className="card-mobile-sm show-desktop">
                <CardContent className="text-center">
                  <p className="text-fluid-base font-semibold text-purple-600">Solo Desktop</p>
                  <p className="text-fluid-sm">Visible solo en desktop</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Test Footer */}
      <footer className="bg-secondary text-secondary-foreground py-mobile-lg">
        <div className="container-wide text-center">
          <p className="text-fluid-base">Footer responsive con padding mobile</p>
        </div>
      </footer>
    </div>
  );
};

export default ResponsiveTest;