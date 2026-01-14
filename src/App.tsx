import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
// Imports do Tauri v2
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { open } from '@tauri-apps/plugin-dialog';
// Import do Componente Visual
import { WindowHeader } from './components/WindowHeader';

// --- TIPAGEM ---
interface ReportMeta {
  data_scan: string;
  url: string;
}

interface SupabaseReport {
  meta: ReportMeta;
  tabelas_encontradas: Record<string, any[]>;
  tabelas_vazias: string[];
  tabelas_bloqueadas: string[];
}

const LISTA_SUSPEITOS: string[] = [
  'prospector_config', 'user_sessions', 'approach_messages',
  'workspace_credit_transactions', 'credits_config', 'classroom_assignments',
  'workspace_access_control', 'workspace_contracts', 'user_invites',
  'users', 'profiles', 'accounts', 'posts', 'products', 'subscriptions', 'plans',
  'audit_logs', 'notifications', 'messages'
];

const App: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [key, setKey] = useState<string>('');
  const [savePath, setSavePath] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleSelectFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Selecione a pasta para salvar o Dump',
      });

      if (selected && typeof selected === 'string') {
        setSavePath(selected);
      } else if (Array.isArray(selected) && selected.length > 0) {
        setSavePath(selected[0]);
      }
    } catch (err) {
      console.error(err);
      addLog("❌ Erro ao abrir seletor de pasta.");
    }
  };

  const handleStartScan = async () => {
    if (!url || !key || !savePath) {
      addLog("⚠️ ERRO: Preencha todos os campos.");
      return;
    }

    setIsScanning(true);
    setLogs([]);
    addLog("🚀 Iniciando Жиоване Byte Scanner..."); // Mantendo o toque Russo ;)

    const supabase = createClient(url, key);

    const relatorioFinal: SupabaseReport = {
      meta: { data_scan: new Date().toISOString(), url: url },
      tabelas_encontradas: {},
      tabelas_vazias: [],
      tabelas_bloqueadas: []
    };

    let tabelasParaVerificar: string[] = [];

    // --- MODO INTELIGENTE ---
    try {
      addLog("📡 Tentando interceptar API REST...");
      const response = await fetch(`${url}/rest/v1/?apikey=${key}`);
      const json = await response.json();

      if (json.definitions) {
        const tabelasOficiais = Object.keys(json.definitions);
        addLog(`📡 Sucesso! API expôs ${tabelasOficiais.length} tabelas.`);
        tabelasParaVerificar = tabelasOficiais;
      }
    } catch (e) {
      addLog("⚠️ API REST protegida. Ativando força bruta na lista de suspeitos.");
    }

    const listaCombinada = Array.from(new Set([...tabelasParaVerificar, ...LISTA_SUSPEITOS]));

    for (const tabela of listaCombinada) {
      addLog(`🔍 Scanning: ${tabela}`);

      const { data, error } = await supabase
        .from(tabela)
        .select('*')
        .limit(100);

      if (error) {
        if (error.code !== '42P01') {
          relatorioFinal.tabelas_bloqueadas.push(tabela);
        }
      } else if (data && data.length > 0) {
        addLog(`✅ DATA FOUND: ${tabela} (${data.length} registros)`);
        relatorioFinal.tabelas_encontradas[tabela] = data;
      } else {
        relatorioFinal.tabelas_vazias.push(tabela);
      }
    }

    try {
      const fileName = `dump_${new Date().getTime()}.json`;
      // Fix para Windows/Unix path
      const separator = navigator.userAgent.includes("Windows") ? "\\" : "/";
      const fullPath = `${savePath}${separator}${fileName}`;

      await writeTextFile(fullPath, JSON.stringify(relatorioFinal, null, 2));

      addLog("-------------------------------------");
      addLog(`💾 DUMP COMPLETO!`);
      addLog(`📂 ${fullPath}`);
    } catch (err: any) {
      addLog(`❌ Falha na escrita: ${err.message || err}`);
    }

    setIsScanning(false);
  };

  return (
    <>
   
    
    <div className="h-screen bg-cyber-black flex flex-col overflow-hidden text-gray-200 font-sans selection:bg-cyber-green selection:text-cyber-black" >
      <div data-tauri-drag-region> <WindowHeader title="Жиоване Byte  Dump Tool" /></div>
        




      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto">

          {/* Header Visual */}
          <div className="mb-8 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyber-green/10 border border-cyber-green/20 mb-4">
              <span className="w-1.5 h-1.5 bg-cyber-green rounded-full animate-pulse" />
              <span className="text-xs text-cyber-green font-mono font-bold tracking-widest">SYSTEM READY</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              Extração de Dados <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyber-green to-cyber-blue">Supabase</span>
            </h1>
            <p className="text-cyber-gray">Ferramenta avançada para auditoria de segurança.</p>
          </div>

          {/* Card Principal */}
          <div className="bg-cyber-card border border-cyber-border rounded-xl p-8 shadow-2xl shadow-black/50 mb-6 backdrop-blur-sm">
            <div className="grid gap-6">

              {/* Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-cyber-green font-mono font-bold uppercase tracking-wider mb-2 block">URL</label>
                  <input
                    type="text"
                    className="w-full bg-cyber-input border border-cyber-border rounded-lg px-4 py-3 text-white focus:border-cyber-green focus:outline-none focus:ring-1 focus:ring-cyber-green/50 transition-all font-mono text-sm placeholder-gray-700"
                    placeholder="https://xxx.supabase.co"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-cyber-blue font-mono font-bold uppercase tracking-wider mb-2 block">Service / Anon Key</label>
                  <input
                    type="password"
                    className="w-full bg-cyber-input border border-cyber-border rounded-lg px-4 py-3 text-white focus:border-cyber-blue focus:outline-none focus:ring-1 focus:ring-cyber-blue/50 transition-all font-mono text-sm placeholder-gray-700"
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs text-cyber-gray font-mono font-bold uppercase tracking-wider mb-2 block">Pasta de Saída</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      readOnly
                      className="flex-1 bg-cyber-input/50 border border-cyber-border rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed font-mono text-sm"
                      placeholder="Selecione a pasta..."
                      value={savePath}
                    />
                    <button
                      onClick={handleSelectFolder}
                      className="px-6 bg-cyber-border hover:bg-cyber-border/80 border border-white/5 text-white rounded-lg font-bold text-xs tracking-wider transition-all uppercase"
                    >
                      Browse
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartScan}
                disabled={isScanning}
                className={`w-full mt-4 py-4 rounded-lg font-bold text-sm tracking-widest uppercase transition-all relative overflow-hidden group 
                  ${isScanning
                    ? "bg-cyber-input text-gray-600 cursor-not-allowed border border-cyber-border"
                    : "bg-gradient-to-r from-cyber-green to-cyber-blue text-cyber-black hover:shadow-[0_0_20px_rgba(0,255,157,0.4)]"
                  }`}
              >
                {isScanning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-600 border-t-cyber-green rounded-full animate-spin" />
                    Executando Dump...
                  </span>
                ) : (
                  "Iniciar Extração"
                )}
              </button>
            </div>
          </div>

          {/* Console Logs */}
          <div className="bg-cyber-black border border-cyber-border rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-cyber-card/50 border-b border-cyber-border px-4 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">TERMINAL_OUTPUT</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500/20" />
                <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
                <div className="w-2 h-2 rounded-full bg-green-500/80 animate-pulse" />
              </div>
            </div>
            <div className="p-4 h-64 overflow-y-auto font-mono text-xs custom-scrollbar bg-[#050508]">
              {logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-800">
                  <span className="text-2xl mb-2 opacity-20">⚡</span>
                  <span>Aguardando execução...</span>
                </div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 text-cyber-green/80 border-l-2 border-transparent hover:border-cyber-green pl-2 transition-all">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div></>

  );
};

export default App;