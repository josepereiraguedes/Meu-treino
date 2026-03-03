import React, { useEffect, useState } from 'react';
import { Download, Share } from 'lucide-react';
import { Button, Card } from './ui';

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }

    // Check if iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isStandalone) return null;

  if (isIOS) {
    return (
      <Card className="mb-6 border-blue-500/30 bg-blue-500/10">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1">
            <Share size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Instalar no iPhone</h3>
            <p className="text-xs text-gray-300 mt-1">
              Para instalar o FocusFit, toque no botão <strong>Compartilhar</strong> do navegador e selecione <strong>"Adicionar à Tela de Início"</strong>.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (!deferredPrompt) return null;

  return (
    <Card className="mb-6 border-green-500/30 bg-green-500/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg text-green-400">
            <Download size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Instalar Aplicativo</h3>
            <p className="text-xs text-gray-300">Acesso rápido e offline</p>
          </div>
        </div>
        <Button size="sm" onClick={handleInstallClick} className="bg-green-600 hover:bg-green-500 text-white border-none">
          Instalar
        </Button>
      </div>
    </Card>
  );
}
