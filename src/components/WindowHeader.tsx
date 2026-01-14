import { useState } from "react"
import { Minus, Square, X, Zap } from "lucide-react"
import { getCurrentWindow } from '@tauri-apps/api/window'

interface WindowHeaderProps {
    title: string
}

export function WindowHeader({ title }: WindowHeaderProps) {
    const [hoveredButton, setHoveredButton] = useState<string | null>(null)

    const handleMinimize = () => getCurrentWindow().minimize()
    const handleMaximize = () => getCurrentWindow().toggleMaximize()
    const handleClose = () => getCurrentWindow().close()

    return (
        <header className="h-12 border-b border-cyber-border backdrop-blur-xl relative select-none active:cursor-grabbing">
            
            {/* === CAMADA 0: VISUAL (Backgrounds e Efeitos) === 
                Repare que removi o 'group' e hover complexos daqui para simplificar o teste, 
                mas você pode manter se não interferir no layout. O importante é que isso é só visual.
            */}
            <div className="absolute inset-0 bg-cyber-header z-0" />
            
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-green/10 to-transparent h-[2px] animate-scan-line" />
            </div>

            {/* === CAMADA 10: A ZONA DE ARRASTE (O segredo) === 
                Este div cobre TUDO. Ele é quem realmente recebe o comando de arrastar.
            */}
            <div 
                className="absolute inset-0 z-10" 
                data-tauri-drag-region 
            />

            {/* === CAMADA 20: CONTEÚDO (Título e Ícone) === 
                Pointer-events-none para garantir que o mouse "fure" isso e pegue a Camada 10
            */}
            <div className="absolute inset-0 flex items-center px-4 pointer-events-none z-20">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-cyber-green/10 border border-cyber-green/20 rounded-full">
                        <Zap className="w-3.5 h-3.5 text-cyber-green animate-pulse" />
                        <span className="text-xs font-mono text-cyber-green font-bold">Жиоване</span>
                    </div>
                    <div className="h-4 w-px bg-cyber-border" />
                    <h1 className="text-sm font-medium text-white tracking-wide">{title}</h1>
                </div>
            </div>

            {/* === CAMADA 30: BOTÕES (Interação) === 
                Eles precisam de z-30 para ficar ACIMA da zona de arraste (z-10).
                Se não tiver z-index maior, você não consegue clicar neles.
            */}
            <div className="absolute right-0 top-0 h-full flex items-center pr-4 gap-1 z-30">
                <button
                    onClick={handleMinimize}
                    onMouseEnter={() => setHoveredButton("minimize")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="group/btn relative w-11 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-cyber-green/10 active:scale-95 cursor-pointer"
                >
                    <div className={`absolute inset-0 rounded-lg bg-cyber-green/20 blur transition-opacity ${hoveredButton === "minimize" ? "opacity-100" : "opacity-0"}`} />
                    <Minus className={`w-4 h-4 relative z-10 transition-all ${hoveredButton === "minimize" ? "text-cyber-green scale-110" : "text-cyber-gray"}`} />
                </button>

                <button
                    onClick={handleMaximize}
                    onMouseEnter={() => setHoveredButton("maximize")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="group/btn relative w-11 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-cyber-blue/10 active:scale-95 cursor-pointer"
                >
                    <div className={`absolute inset-0 rounded-lg bg-cyber-blue/20 blur transition-opacity ${hoveredButton === "maximize" ? "opacity-100" : "opacity-0"}`} />
                    <Square className={`w-4 h-4 relative z-10 transition-all ${hoveredButton === "maximize" ? "text-cyber-blue scale-110 rotate-180" : "text-cyber-gray"}`} />
                </button>

                <button
                    onClick={handleClose}
                    onMouseEnter={() => setHoveredButton("close")}
                    onMouseLeave={() => setHoveredButton(null)}
                    className="group/btn relative w-11 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-red-500/10 active:scale-95 cursor-pointer"
                >
                    <div className={`absolute inset-0 rounded-lg bg-red-500/20 blur transition-opacity ${hoveredButton === "close" ? "opacity-100" : "opacity-0"}`} />
                    <X className={`w-4 h-4 relative z-10 transition-all ${hoveredButton === "close" ? "text-red-500 scale-110 rotate-90" : "text-cyber-gray"}`} />
                </button>
            </div>
        </header>
    )
}