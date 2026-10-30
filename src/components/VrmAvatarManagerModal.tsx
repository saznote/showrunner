import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  CheckCircle2,
  FileBox,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  RotateCcw,
  Volume2,
  Smile,
  Eye,
  Info,
} from 'lucide-react';

interface VrmAvatarManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
  currentVrmInfo: { title?: string; author?: string; version?: string } | null;
  onResetToDefault: () => void;
  is3dActive: boolean;
  onToggle3d: (active: boolean) => void;
}

export const VrmAvatarManagerModal: React.FC<VrmAvatarManagerModalProps> = ({
  isOpen,
  onClose,
  onFileSelected,
  currentVrmInfo,
  onResetToDefault,
  is3dActive,
  onToggle3d,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setFileError(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.vrm')) {
        onFileSelected(file);
        onToggle3d(true);
      } else {
        setFileError('Format non supporté : Veuillez sélectionner un fichier avec l\'extension .vrm (VRM 0.0 ou VRM 1.0).');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith('.vrm')) {
        onFileSelected(file);
        onToggle3d(true);
      } else {
        setFileError('Format non supporté : Veuillez sélectionner un fichier .vrm.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* File Error Notification */}
        {fileError && (
          <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center justify-between">
            <span>{fileError}</span>
            <button
              onClick={() => setFileError(null)}
              className="text-red-400 hover:text-white font-bold ml-2 uppercase text-[10px]"
            >
              Fermer
            </button>
          </div>
        )}
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <FileBox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Gestionnaire d'Avatar 3D (.VRM) avec Lipsync
              </h3>
              <p className="text-xs text-slate-400">
                Charge ton avatar 3D personnalisé depuis ton PC avec synchronisation labiale automatique.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Mode Switcher (2D Cyber vs 3D VRM) */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm text-white block">Mode d'affichage de l'Avatar :</span>
            <span className="text-xs text-slate-400">
              {is3dActive
                ? 'Mode 3D VRM Actif (Lipsync temps réel & expressions)'
                : 'Mode 2D Cyber Stylisé (SVG studio)'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggle3d(false)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                !is3dActive
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              2D Stylisé
            </button>
            <button
              onClick={() => onToggle3d(true)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                is3dActive
                  ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-900/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              3D VRM 🤖
            </button>
          </div>
        </div>

        {/* Drag and Drop Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-3 ${
            isDragging
              ? 'border-purple-500 bg-purple-950/30 scale-[1.01]'
              : 'border-slate-700 hover:border-purple-500/70 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".vrm"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg">
            <Upload className="w-7 h-7" />
          </div>

          <div>
            <p className="font-heading font-bold text-sm text-white">
              Glisse-dépose ton fichier <span className="text-purple-400 font-mono">.vrm</span> ici
            </p>
            <p className="text-xs text-slate-400 mt-1">
              ou clique pour parcourir les dossiers de ton ordinateur
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Compatible VRM 0.0 & VRM 1.0
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
              Blendshapes : aa, ih, ou, ee, oh, blink
            </span>
          </div>
        </div>

        {/* Active VRM Metadata Card (if loaded) */}
        {currentVrmInfo && (
          <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-bold text-sm text-white">{currentVrmInfo.title || 'Avatar VRM Actif'}</p>
                <p className="text-xs text-slate-400">
                  Auteur : {currentVrmInfo.author || 'Créateur personnalisé'} • {currentVrmInfo.version}
                </p>
              </div>
            </div>

            <button
              onClick={onResetToDefault}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Revenir à l'avatar par défaut"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        )}

        {/* Tips & Free VRM Sources */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-white font-bold">
            <Info className="w-4 h-4 text-purple-400" />
            <span>Où trouver ou créer ton avatar 3D .VRM gratuitement ?</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Tu peux créer ton propre avatar virtuel 3D avec des cheveux, vêtements et expressions en 5 minutes avec le logiciel gratuit <strong>VRoid Studio</strong>, ou télécharger des milliers de modèles gratuits sur <strong>VRoid Hub</strong> et <strong>Booth.pm</strong>.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <a
              href="https://vroid.com/en/studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Créer avec VRoid Studio (Gratuit) <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-600">•</span>
            <a
              href="https://hub.vroid.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:underline flex items-center gap-1 font-semibold"
            >
              Explorer les modèles sur VRoid Hub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-900/30 cursor-pointer"
          >
            Fermer & Retourner au Studio
          </button>
        </div>
      </div>
    </div>
  );
};
