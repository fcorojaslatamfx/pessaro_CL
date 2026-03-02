-- =============================================
-- CMS OPTIMIZADO - PARTE 6: DATOS INICIALES
-- Fecha: 2026-02-23 17:38 UTC
-- =============================================

-- Insertar servicios iniciales
INSERT INTO public.cms_services_2026_02_23_17_38 (service_id, title, description, icon_name, benefits, order_index) VALUES
('forex-trading', 'Forex Trading', 'Opere con las principales divisas del mundo con spreads desde 0.0 pips y ejecución instantánea.', 'LineChart', ARRAY['Spreads desde 0.0 pips', 'Ejecución en milisegundos', 'Más de 50 pares de divisas', 'Análisis técnico avanzado'], 1),
('commodities', 'Materias Primas', 'Invierta en oro, plata, petróleo y commodities agrícolas con apalancamiento flexible.', 'Briefcase', ARRAY['Oro y metales preciosos', 'Energías (petróleo, gas)', 'Commodities agrícolas', 'Cobertura contra inflación'], 2),
('indices', 'Índices Bursátiles', 'Acceda a los principales índices mundiales: S&P 500, NASDAQ, DAX, FTSE y más.', 'TrendingUp', ARRAY['Índices globales principales', 'Diversificación automática', 'Horarios extendidos', 'Análisis fundamental'], 3),
('crypto', 'Criptomonedas', 'Trade Bitcoin, Ethereum y las principales criptomonedas con tecnología institucional.', 'Zap', ARRAY['Bitcoin y Ethereum', 'Altcoins principales', 'Custodia segura', 'Trading 24/7'], 4)
ON CONFLICT (service_id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    benefits = EXCLUDED.benefits,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();

-- Insertar FAQs iniciales
INSERT INTO public.cms_faqs_2026_02_23_17_38 (faq_id, question, answer, category, order_index) VALUES
('faq-forex', '¿Qué es el Forex Trading?', 'El mercado de divisas (Forex) es el mercado financiero más grande del mundo, donde se intercambian monedas de diferentes países. Con Pessaro Capital, puede operar EUR/USD, GBP/JPY y más de 50 pares con spreads competitivos desde 0.0 pips.', 'servicios', 1),
('faq-commodities', '¿Cómo invertir en Materias Primas?', 'Las materias primas incluyen metales preciosos (oro, plata), energías (petróleo, gas natural) y productos agrícolas. Son excelentes para diversificar su portafolio y protegerse contra la inflación. Ofrecemos acceso directo con apalancamiento flexible.', 'servicios', 2),
('faq-indices', '¿Qué son los Índices Bursátiles?', 'Los índices representan el rendimiento de un grupo de acciones. Por ejemplo, el S&P 500 incluye las 500 empresas más grandes de EE.UU. Al invertir en índices, obtiene exposición diversificada a mercados completos con una sola operación.', 'servicios', 3),
('faq-crypto', '¿Es seguro invertir en Criptomonedas?', 'Con Pessaro Capital, sus criptomonedas están protegidas por custodia institucional y tecnología de grado bancario. Ofrecemos Bitcoin, Ethereum y las principales altcoins con spreads competitivos y ejecución 24/7.', 'servicios', 4)
ON CONFLICT (faq_id) DO UPDATE SET
    question = EXCLUDED.question,
    answer = EXCLUDED.answer,
    category = EXCLUDED.category,
    order_index = EXCLUDED.order_index,
    updated_at = NOW();