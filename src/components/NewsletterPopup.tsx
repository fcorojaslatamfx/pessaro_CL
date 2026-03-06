import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Mail, Phone, User, CheckCircle2, AlertCircle,
  Loader2, BarChart3, DollarSign, Package, Wallet,
  Bitcoin, Newspaper, Globe, MoreHorizontal, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useNewsletter } from '@/hooks/useNewsletter';

interface NewsletterPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'topics' | 'form' | 'success';

const TOPIC_OPTIONS = [
  { id: 'mercados',      label: 'Noticias de Mercado', description: 'Últimas noticias del mundo financiero',     icon: <Newspaper      className="w-4 h-4" /> },
  { id: 'politica',      label: 'Política Económica',  description: 'Bancos centrales y decisiones de gobierno', icon: <Globe          className="w-4 h-4" /> },
  { id: 'acciones',      label: 'Acciones',            description: 'Análisis de empresas y sectores',           icon: <BarChart3       className="w-4 h-4" /> },
  { id: 'divisas',       label: 'Divisas / Forex',     description: 'Pares de divisas y análisis técnico',       icon: <DollarSign     className="w-4 h-4" /> },
  { id: 'materias',      label: 'Materias Primas',     description: 'Oro, petróleo y commodities',               icon: <Package        className="w-4 h-4" /> },
  { id: 'etf',           label: 'ETF',                 description: 'Fondos cotizados y diversificación',        icon: <Wallet         className="w-4 h-4" /> },
  { id: 'criptomonedas', label: 'Criptomonedas',       description: 'Bitcoin, Ethereum y altcoins',              icon: <Bitcoin        className="w-4 h-4" /> },
  { id: 'otros',         label: 'Otros',               description: 'Contenido general y tendencias globales',   icon: <MoreHorizontal className="w-4 h-4" /> },
];

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => /^\+?[\d\s\-().]{7,20}$/.test(v.trim());
const isValidName  = (v: string) => v.trim().length >= 2;

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ isOpen, onClose }) => {
  const { subscribe, loading, error: hookError } = useNewsletter();

  const [step, setStep]       = useState<Step>('topics');
  const [topics, setTopics]   = useState<string[]>([]);
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [phone, setPhone]     = useState('');
  const [errors, setErrors]   = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const resetAll = () => {
    setStep('topics'); setTopics([]); setName(''); setEmail(''); setPhone(''); setErrors({});
  };

  const handleClose = () => {
    if (submitting) return;
    onClose();
    setTimeout(resetAll, 300);
  };

  const toggleTopic = (id: string) => {
    setTopics(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
    setErrors(p => ({ ...p, topics: '' }));
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!isValidName(name))    e.name    = 'Ingresa tu nombre completo.';
    if (!isValidEmail(email))  e.email   = 'Ingresa un email válido.';
    if (!isValidPhone(phone))  e.phone   = 'Ingresa un teléfono válido (mín. 7 dígitos).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setSubmitting(true);
    try {
      await subscribe({ email, name, phone, topics, source: 'newsletter_popup' });
      setStep('success');
      setTimeout(() => handleClose(), 3500);
    } catch (err) {
      console.error('Newsletter error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const stepNum: Record<Step, number> = { topics: 1, form: 2, success: 2 };
  const stepLabel: Record<Step, string> = { topics: 'Temas de interés', form: 'Tus datos', success: '' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          >
            <Card className="shadow-2xl">
              <div className="h-1.5 w-full rounded-t-xl bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500" />

              <CardHeader className="relative pb-3">
                <Button
                  variant="ghost" size="sm" onClick={handleClose}
                  className="absolute right-2 top-2 h-8 w-8 p-0"
                  disabled={submitting}
                >
                  <X className="w-4 h-4" />
                </Button>

                <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl">
                  <div className="w-11 h-11 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  {step === 'success' ? '¡Suscripción confirmada!' : 'Newsletter Exclusivo'}
                </CardTitle>

                {step !== 'success' && (
                  <p className="text-muted-foreground text-sm">
                    Recibe análisis exclusivos y actualizaciones de mercado personalizadas
                  </p>
                )}

                {step !== 'success' && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {(['topics', 'form'] as Step[]).map((s, i) => (
                      <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${stepNum[step] >= i + 1 ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1 shrink-0">
                      Paso {stepNum[step]}/2 — {stepLabel[step]}
                    </span>
                  </div>
                )}
              </CardHeader>

              <CardContent>

                {/* ── ÉXITO ── */}
                {step === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-1">¡Bienvenido/a, {name.split(' ')[0]}!</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Suscripción confirmada. Recibirás noticias en <span className="font-semibold">{email}</span>
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {topics.map(id => {
                        const t = TOPIC_OPTIONS.find(o => o.id === id)!;
                        return (
                          <span key={id} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {t.label}
                          </span>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* ── STEP 1: TEMAS ── */}
                {step === 'topics' && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Selecciona los temas sobre los que te gustaría recibir información.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {TOPIC_OPTIONS.map(t => (
                        <div
                          key={t.id}
                          onClick={() => toggleTopic(t.id)}
                          className={`border rounded-lg p-3.5 cursor-pointer transition-all hover:bg-muted/50 ${
                            topics.includes(t.id) ? 'border-primary bg-primary/5' : 'border-border'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={topics.includes(t.id)}
                              onCheckedChange={() => toggleTopic(t.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-primary shrink-0">{t.icon}</span>
                                <span className="font-medium text-sm">{t.label}</span>
                              </div>
                              <p className="text-xs text-muted-foreground">{t.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.topics && <p className="text-red-500 text-sm">{errors.topics}</p>}
                    <Button
                      className="w-full"
                      onClick={() => {
                        if (topics.length === 0) { setErrors({ topics: 'Selecciona al menos un tema.' }); return; }
                        setStep('form');
                      }}
                    >
                      Continuar <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}

                {/* ── STEP 2: DATOS ── */}
                {step === 'form' && (
                  <div className="space-y-5">
                    <p className="text-sm text-muted-foreground">
                      Completa tus datos para finalizar la suscripción.
                    </p>

                    <div>
                      <Label htmlFor="nl-name">Nombre Completo <span className="text-primary">*</span></Label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="nl-name"
                          placeholder="Ej: Juan Pérez"
                          value={name}
                          onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: '' })); }}
                          className={`pl-9 ${errors.name ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nl-email">Email <span className="text-primary">*</span></Label>
                        <div className="relative mt-1">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="nl-email"
                            type="email"
                            placeholder="tu@email.com"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }}
                            className={`pl-9 ${errors.email ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                      </div>
                      <div>
                        <Label htmlFor="nl-phone">Teléfono <span className="text-primary">*</span></Label>
                        <div className="relative mt-1">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="nl-phone"
                            type="tel"
                            placeholder="+56 9 1234 5678"
                            value={phone}
                            onChange={e => {
                              setPhone(e.target.value.replace(/[^\d\s\-+().]/g, '').slice(0, 20));
                              setErrors(p => ({ ...p, phone: '' }));
                            }}
                            className={`pl-9 ${errors.phone ? 'border-red-500' : ''}`}
                          />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {topics.map(id => {
                        const t = TOPIC_OPTIONS.find(o => o.id === id)!;
                        return (
                          <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {t.label}
                          </span>
                        );
                      })}
                    </div>

                    {hookError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <p className="text-red-800 text-sm">{hookError}</p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setStep('topics')} className="flex-1" disabled={submitting}>
                        ← Volver
                      </Button>
                      <Button onClick={handleSubmit} disabled={submitting || loading} className="flex-1">
                        {submitting || loading
                          ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Suscribiendo...</>
                          : <><Mail className="w-4 h-4 mr-2" />Suscribirme</>
                        }
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center border-t pt-3">
                      Al suscribirte, aceptas recibir emails de Pessaro Capital. Puedes cancelar en cualquier momento.
                      Respetamos tu privacidad y nunca compartimos tu información.
                    </p>
                  </div>
                )}

              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewsletterPopup;