import { useEffect, useState } from "react"
import { supabase } from "./lib/supabaseClient";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

const consumptionData = [
  { hora: "00h", inteligente: 18, convencional: 42 },
  { hora: "02h", inteligente: 12, convencional: 42 },
  { hora: "04h", inteligente: 10, convencional: 42 },
  { hora: "06h", inteligente: 22, convencional: 42 },
  { hora: "08h", inteligente: 38, convencional: 42 },
  { hora: "10h", inteligente: 45, convencional: 42 },
  { hora: "12h", inteligente: 50, convencional: 42 },
  { hora: "14h", inteligente: 48, convencional: 42 },
  { hora: "16h", inteligente: 42, convencional: 42 },
  { hora: "18h", inteligente: 60, convencional: 42 },
  { hora: "20h", inteligente: 72, convencional: 100 },
  { hora: "22h", inteligente: 55, convencional: 100 },
]

const posteDefinitions = [
  { id: "P-001", rua: "Av. Brasil, 1240" },
  { id: "P-002", rua: "Rua das Flores, 88" },
  { id: "P-003", rua: "Praça Central, 5" },
  { id: "P-004", rua: "Av. Paulista, 320" },
  { id: "P-005", rua: "Rua da Paz, 77" },
  { id: "P-006", rua: "Alameda Santos, 12" },
]

type Poste = (typeof posteDefinitions)[number] & {
  aceso: boolean
  intensidade: number
  pir: boolean
  ultima: string
}

const navItems = [
  { icon: GridIcon, label: "Dashboard Geral" },
  { icon: MapIcon, label: "Mapa de Postes" },
  { icon: ChartIcon, label: "Relatórios" },
  { icon: BellIcon, label: "Alertas" },
  { icon: SettingsIcon, label: "Configurações" },
]

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  )
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3,6 9,3 15,6 21,3 21,18 15,21 9,18 3,21"/>
      <line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/>
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2"/>
    </svg>
  )
}

function LampIcon({ active }: { active: boolean }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21h6" stroke={active ? "#f5a623" : "#4a5a7a"} strokeWidth="2"/>
      <path d="M12 3a6 6 0 0 0-3 11.22V17h6v-2.78A6 6 0 0 0 12 3z"
        fill={active ? "rgba(245,166,35,0.18)" : "rgba(74,90,122,0.2)"}
        stroke={active ? "#f5a623" : "#4a5a7a"} strokeWidth="1.8"/>
      {active && (
        <>
          <line x1="12" y1="0.5" x2="12" y2="2" stroke="#f5a623" strokeWidth="1.5"/>
          <line x1="4.5" y1="3.5" x2="5.5" y2="4.5" stroke="#f5a623" strokeWidth="1.5"/>
          <line x1="19.5" y1="3.5" x2="18.5" y2="4.5" stroke="#f5a623" strokeWidth="1.5"/>
          <line x1="2" y1="9" x2="3.5" y2="9" stroke="#f5a623" strokeWidth="1.5"/>
          <line x1="22" y1="9" x2="20.5" y2="9" stroke="#f5a623" strokeWidth="1.5"/>
        </>
      )}
    </svg>
  )
}

function KpiCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2" style={{ background: "#0d1b36", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "#8a9bbf" }}>{label}</span>
      <span className="text-3xl font-bold leading-none mono" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: "#8a9bbf" }}>{sub}</span>
    </div>
  )
}

function IntensityBar({ value, active }: { value: number; active: boolean }) {
  return (
    <div className="w-full rounded-full h-1.5" style={{ background: "rgba(255,255,255,0.08)" }}>
      <div
        className="h-1.5 rounded-full transition-all duration-500"
        style={{
          width: `${value}%`,
          background: active
            ? `linear-gradient(90deg, #c47f0e, #f5a623)`
            : "#4a5a7a",
        }}
      />
    </div>
  )
}

function PosteCard({ poste, onSelect }: { poste: Poste; onSelect: (poste: Poste) => void }) {
  const { id, rua, aceso, intensidade, pir, ultima } = poste
  return (
    <button
      type="button"
      onClick={() => onSelect(poste)}
      aria-label={`Abrir detalhes do poste ${id}`}
      style={{
        borderRadius: 14,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        boxSizing: "border-box",
        transition: "transform 0.2s",
        cursor: "pointer",
        color: "inherit",
        textAlign: "left",
        background: aceso ? "linear-gradient(145deg, #0d1b36, #112047)" : "#0d1b36",
        border: aceso ? "1px solid rgba(245,166,35,0.25)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: aceso ? "0 0 20px rgba(245,166,35,0.06)" : "none",
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.015)")}
      onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
    >
      {/* Top: id + badge + lamp */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: aceso ? "#f5a623" : "#8a9bbf" }}>{id}</span>
            <span style={{
              fontSize: 10, padding: "2px 7px", borderRadius: 20, fontWeight: 500,
              background: aceso ? "rgba(245,166,35,0.15)" : "rgba(74,90,122,0.2)",
              color: aceso ? "#f5a623" : "#4a5a7a",
            }}>
              {aceso ? "ACESO" : "APAGADO"}
            </span>
          </div>
          <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>{rua}</p>
        </div>
        <LampIcon active={aceso} />
      </div>

      {/* Middle: intensity */}
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, color: "#8a9bbf" }}>Intensidade</span>
          <span className="mono" style={{ fontSize: 10, fontWeight: 500, color: aceso ? "#f5a623" : "#4a5a7a" }}>{intensidade}%</span>
        </div>
        <IntensityBar value={intensidade} active={aceso} />
      </div>

      {/* Bottom: PIR + timestamp */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ fontSize: 10, color: "#8a9bbf" }}>Sensor PIR</span>
          <div style={{
            width: 7, height: 7, borderRadius: "50%",
            background: pir ? "#22c55e" : "#4a5a7a",
            boxShadow: pir ? "0 0 5px rgba(34,197,94,0.6)" : "none",
          }} />
          <span style={{ fontSize: 10, fontWeight: 500, color: pir ? "#22c55e" : "#4a5a7a" }}>
            {pir ? "Ativo" : "Inativo"}
          </span>
        </div>
        <span style={{ fontSize: 10, color: "#4a5a7a" }}>{ultima}</span>
      </div>
    </button>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "#112047", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="font-semibold mb-2" style={{ color: "#e2e8f5" }}>{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: "#8a9bbf" }}>{p.name}:</span>
            <span className="mono font-medium" style={{ color: p.color }}>{p.value} kWh</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function App() {
  const [activeNav, setActiveNav] = useState("Dashboard Geral")
  const [selectedPosteId, setSelectedPosteId] = useState<string | null>(null)
  const [autoMode, setAutoMode] = useState(true)
  const [pirMode, setPirMode] = useState(true)
  const [ldrValue, setLdrValue] = useState(1200)
  const [pirUntil, setPirUntil] = useState<number[]>(() => posteDefinitions.map(() => 0))
  const [now, setNow] = useState(() => Date.now())
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [supabasePoleIntensities, setSupabasePoleIntensities] = useState<number[] | null>(null);
useEffect(() => {
  let mounted = true;

  async function loadState() {
    const { data, error } = await supabase
      .from("luzsmart_estado")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      console.error("Erro ao ler Supabase:", error.message);
      return;
    }

    if (!mounted || !data) return;

    if (typeof data.ldr_value === "number") {
      setLdrValue(data.ldr_value);
    }

    if (Array.isArray(data.pir_states)) {
      setPirUntil(
        data.pir_states.map((active: boolean) =>
          active ? Date.now() + 10_000 : 0
        )
      );
    }

    if (Array.isArray(data.pole_intensities) && data.pole_intensities.length === 6) {
      setSupabasePoleIntensities(
        data.pole_intensities.map((value: number) =>
          Math.max(0, Math.min(100, Number(value) || 0))
        )
      );
    }

    setSupabaseConnected(true);
  }

  loadState();

  const channel = supabase
    .channel("luzsmart-estado")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "luzsmart_estado",
        filter: "id=eq.1",
      },
      (payload) => {
        const data = payload.new as {
          ldr_value?: number;
          pir_states?: boolean[];
          pole_intensities?: number[];
        };

        if (!mounted) return;

        if (typeof data.ldr_value === "number") {
          setLdrValue(data.ldr_value);
        }

        if (Array.isArray(data.pir_states)) {
          setPirUntil(
            data.pir_states.map((active) =>
              active ? Date.now() + 10_000 : 0
            )
          );
        }

        if (Array.isArray(data.pole_intensities) && data.pole_intensities.length === 6) {
          setSupabasePoleIntensities(
            data.pole_intensities.map((value) =>
              Math.max(0, Math.min(100, Number(value) || 0))
            )
          );
        }

        setSupabaseConnected(true);
      }
    )
    .subscribe((status) => {
      if (mounted && status === "SUBSCRIBED") {
        setSupabaseConnected(true);
      }
    });

  return () => {
    mounted = false;
    supabase.removeChannel(channel);
  };
}, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 500)
    return () => window.clearInterval(timer)
  }, [])

 const isDay = ldrValue >= 1800;
 const activePirs = pirUntil.map((expiry) => expiry > now);

  const postes: Poste[] = posteDefinitions.map((definition, index) => {
    const neighbourActive = activePirs[index - 1] || activePirs[index + 1];

    const localIntensity = !autoMode || isDay
      ? 0
      : activePirs[index]
        ? 100
        : neighbourActive
          ? 60
          : 30;

    const intensidade = supabasePoleIntensities !== null
      ? (supabasePoleIntensities[index] ?? 0)
      : localIntensity;

    return {
      ...definition,
      aceso: intensidade > 0,
      intensidade,
      pir: activePirs[index],
      ultima: supabasePoleIntensities !== null
        ? (activePirs[index] ? "movimento detetado" : "atualizado via Supabase")
        : (activePirs[index] ? "movimento agora" : "valor simulado"),
    };
  });

const selectedPoste = postes.find((poste) => poste.id === selectedPosteId) ?? null;
  const totalPostes = postes.length
  const acesos = postes.filter((p) => p.aceso).length
  const apagados = totalPostes - acesos
  const economiaPercent = 38
  const pageDescriptions: Record<string, string> = {
    "Dashboard Geral": "Visão geral da rede de iluminação pública inteligente",
    "Mapa de Postes": "Localização e estado demonstrativo dos seis postes",
    Relatórios: "Indicadores de consumo e eficiência energética",
    Alertas: "Histórico de eventos e ocorrências da rede",
    Configurações: "Parâmetros e preferências do sistema",
  }

  const openPage = (label: string) => {
    setSelectedPosteId(null)
    setActiveNav(label)
  }

  const openPoste = (poste: Poste) => setSelectedPosteId(poste.id)

  const triggerPir = (index: number) => {
    setPirUntil((current) => current.map((expiry, position) => position === index ? Date.now() + 10_000 : expiry))
    setNow(Date.now())
  }

  const panelStyle = {
    borderRadius: 14,
    background: "#0d1b36",
    border: "1px solid rgba(255,255,255,0.07)",
  }

  const renderKpis = () => (
    <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, height: 80 }}>
      {[
        { label: "Total de Postes", value: String(totalPostes), sub: "Dados de demonstração", color: "#e2e8f5" },
        { label: "Postes Acesos", value: String(acesos), sub: `${Math.round((acesos / totalPostes) * 100)}% da rede ativa`, color: "#f5a623" },
        { label: "Postes Apagados", value: String(apagados), sub: `${Math.round((apagados / totalPostes) * 100)}% da rede inativa`, color: "#4a5a7a" },
        { label: "Economia de Energia", value: `${economiaPercent}%`, sub: "Estimativa demonstrativa", color: "#22c55e" },
      ].map(({ label, value, sub, color }) => (
        <div key={label} style={{ ...panelStyle, padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase", color: "#8a9bbf" }}>{label}</span>
          <span className="mono" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color }}>{value}</span>
          <span style={{ fontSize: 10, color: "#8a9bbf" }}>{sub}</span>
        </div>
      ))}
    </div>
  )

  const renderDashboard = () => (
    <div className="page-frame dashboard-page" style={{ display: "grid", gridTemplateRows: "80px 1fr", gap: 14, minHeight: 0 }}>
      {renderKpis()}
      <div style={{ display: "grid", gridTemplateRows: "24px 1fr", gap: 8, minHeight: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: 12, fontWeight: 600, color: "#e2e8f5" }}>Postes de Iluminação</h2>
          <span style={{ fontSize: 10, color: "#8a9bbf" }}>Selecione um cartão para ver os detalhes</span>
        </div>
        <div className="post-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(2, 1fr)", gap: 12, minHeight: 0 }}>
          {postes.map((poste) => (
            <PosteCard key={poste.id} poste={poste} onSelect={openPoste} />
          ))}
        </div>
      </div>
    </div>
  )

  const renderMap = () => (
    <div className="page-frame map-layout" style={{ display: "grid", gridTemplateColumns: "1fr 290px", gap: 16, minHeight: 0 }}>
      <div style={{ ...panelStyle, position: "relative", overflow: "hidden", minHeight: 0 }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.28, backgroundImage: "linear-gradient(rgba(74,90,122,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(74,90,122,.35) 1px, transparent 1px)", backgroundSize: "42px 42px" }} />
        <svg viewBox="0 0 800 620" width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
          <path d="M30 480 C180 380 245 430 350 315 S570 240 770 105" fill="none" stroke="#203458" strokeWidth="34" />
          <path d="M30 480 C180 380 245 430 350 315 S570 240 770 105" fill="none" stroke="#4a5a7a" strokeWidth="2" strokeDasharray="8 10" />
          <path d="M150 30 C195 180 310 210 415 280 S590 400 720 590" fill="none" stroke="#203458" strokeWidth="25" />
          <path d="M150 30 C195 180 310 210 415 280 S590 400 720 590" fill="none" stroke="#4a5a7a" strokeWidth="2" strokeDasharray="8 10" />
        </svg>
        {[
          { poste: postes[0], left: "17%", top: "65%" },
          { poste: postes[1], left: "43%", top: "43%" },
          { poste: postes[2], left: "62%", top: "34%" },
          { poste: postes[3], left: "79%", top: "18%" },
          { poste: postes[4], left: "36%", top: "73%" },
          { poste: postes[5], left: "69%", top: "70%" },
        ].map(({ poste, left, top }) => (
          <button
            key={poste.id}
            type="button"
            onClick={() => openPoste(poste)}
            aria-label={`Abrir detalhes do poste ${poste.id}`}
            style={{ position: "absolute", left, top, transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer", color: "#e2e8f5" }}
          >
            <span style={{ width: 34, height: 34, borderRadius: "50%", display: "grid", placeItems: "center", background: poste.aceso ? "#f5a623" : "#4a5a7a", boxShadow: poste.aceso ? "0 0 20px rgba(245,166,35,.45)" : "none" }}>
              <LampIcon active={poste.aceso} />
            </span>
            <span className="mono" style={{ fontSize: 10, fontWeight: 600, padding: "3px 7px", borderRadius: 6, background: "#0a1528" }}>{poste.id}</span>
          </button>
        ))}
        <span style={{ position: "absolute", left: 18, bottom: 16, fontSize: 10, color: "#8a9bbf" }}>Representação visual demonstrativa · não georreferenciada</span>
      </div>
      <div style={{ ...panelStyle, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
        <div>
          <h2 style={{ fontSize: 12, fontWeight: 600 }}>Postes na simulação</h2>
          <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>Estado atual de demonstração</p>
        </div>
        {postes.map((poste) => (
          <button key={poste.id} type="button" onClick={() => openPoste(poste)} style={{ padding: "10px", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", textAlign: "left", background: "#112047", border: "1px solid rgba(255,255,255,.06)", color: "#e2e8f5" }}>
            <div>
              <div className="mono" style={{ fontSize: 11, color: poste.aceso ? "#f5a623" : "#8a9bbf" }}>{poste.id}</div>
              <div style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>{poste.rua}</div>
            </div>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: poste.aceso ? "#f5a623" : "#4a5a7a" }} />
          </button>
        ))}
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="page-frame reports-page" style={{ display: "grid", gridTemplateRows: "80px 1fr", gap: 14, minHeight: 0 }}>
      {renderKpis()}
      <div className="reports-layout" style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 16, minHeight: 0 }}>
        <div style={{ ...panelStyle, padding: "16px 18px", display: "grid", gridTemplateRows: "42px 1fr 20px", minHeight: 0 }}>
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 600 }}>Consumo de Energia</h2>
            <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>Inteligente vs. convencional · dados de demonstração (kWh)</p>
          </div>
          <div style={{ minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={consumptionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorInt" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f5a623" stopOpacity={0.25} /><stop offset="95%" stopColor="#f5a623" stopOpacity={0} /></linearGradient>
                  <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="hora" tick={{ fontSize: 9, fill: "#4a5a7a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "#4a5a7a" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Area type="monotone" dataKey="inteligente" name="Inteligente" stroke="#f5a623" strokeWidth={2} fill="url(#colorInt)" dot={false} />
                <Area type="monotone" dataKey="convencional" name="Convencional" stroke="#3b82f6" strokeWidth={2} fill="url(#colorConv)" dot={false} strokeDasharray="5 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <span style={{ fontSize: 10, color: "#4a5a7a" }}>Período simulado de 24 horas</span>
        </div>
        <div style={{ ...panelStyle, padding: "18px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 600 }}>Índice de Economia</h2>
            <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>Estimativa demonstrativa</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative", height: 150 }}>
            <svg width="260" height="128" viewBox="0 0 260 128">
              <path d="M 18 118 A 112 112 0 0 1 242 118" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="14" strokeLinecap="round" />
              <path d="M 18 118 A 112 112 0 0 1 242 118" fill="none" stroke="#22c55e" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${(economiaPercent / 100) * 352} 352`} />
            </svg>
            <div style={{ position: "absolute", bottom: 12, textAlign: "center" }}>
              <div className="mono" style={{ fontSize: 30, fontWeight: 700, color: "#22c55e" }}>{economiaPercent}%</div>
              <div style={{ fontSize: 10, color: "#8a9bbf" }}>economia estimada</div>
            </div>
          </div>
          {[
            ["Consumo inteligente", "312 kWh", "#f5a623"],
            ["Consumo convencional", "503 kWh", "#3b82f6"],
            ["Poupança mensal", "R$ 1.847,00", "#22c55e"],
          ].map(([label, value, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <span style={{ fontSize: 11, color: "#8a9bbf" }}>{label}</span>
              <span className="mono" style={{ fontSize: 11, color }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAlerts = () => {
    const alerts = [
      { time: "22:34", title: "Movimento detetado", detail: "P-002 · Rua das Flores, 88", tone: "#3b82f6", status: "Informativo" },
      { time: "22:27", title: "Poste apagado", detail: "P-003 · Praça Central, 5", tone: "#f5a623", status: "Atenção" },
      { time: "22:12", title: "Intensidade ajustada", detail: "P-004 · 80% para 60%", tone: "#22c55e", status: "Resolvido" },
      { time: "21:58", title: "Movimento detetado", detail: "P-001 · Av. Brasil, 1240", tone: "#3b82f6", status: "Informativo" },
      { time: "21:49", title: "Movimento detetado", detail: "P-006 · Alameda Santos, 12", tone: "#3b82f6", status: "Informativo" },
      { time: "21:42", title: "Simulação iniciada", detail: "Cenário demonstrativo com seis postes", tone: "#22c55e", status: "Resolvido" },
    ]
    return (
      <div className="page-frame alerts-panel" style={{ ...panelStyle, padding: "18px 20px", minHeight: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 600 }}>Alertas / Histórico</h2>
            <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>Eventos de demonstração · ESP32 não ligado</p>
          </div>
          <span style={{ fontSize: 10, color: "#8a9bbf" }}>Últimas 24 horas</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {alerts.map((alert) => (
            <div key={`${alert.time}-${alert.title}`} style={{ display: "grid", gridTemplateColumns: "62px 12px 1fr auto", alignItems: "center", gap: 12, padding: "15px 8px", borderTop: "1px solid rgba(255,255,255,.06)" }}>
              <span className="mono" style={{ fontSize: 11, color: "#8a9bbf" }}>{alert.time}</span>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: alert.tone, boxShadow: `0 0 8px ${alert.tone}` }} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 500 }}>{alert.title}</div>
                <div style={{ fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>{alert.detail}</div>
              </div>
              <span style={{ fontSize: 10, color: alert.tone, padding: "4px 8px", borderRadius: 12, background: `${alert.tone}18` }}>{alert.status}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderSettings = () => (
    <div className="page-frame settings-layout" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignContent: "start" }}>
      <div style={{ ...panelStyle, padding: 20 }}>
        <h2 style={{ fontSize: 12, fontWeight: 600 }}>Automação da iluminação</h2>
        <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 4, marginBottom: 16 }}>Preferências locais de demonstração</p>
        {[
          { label: "Modo automático", detail: "Ajustar a iluminação conforme o período", value: autoMode, setValue: setAutoMode },
          { label: "Sensores PIR", detail: "Aumentar intensidade quando há movimento", value: pirMode, setValue: setPirMode },
        ].map((setting) => (
          <label key={setting.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.06)", cursor: "pointer" }}>
            <span>
              <span style={{ display: "block", fontSize: 12 }}>{setting.label}</span>
              <span style={{ display: "block", fontSize: 10, color: "#8a9bbf", marginTop: 3 }}>{setting.detail}</span>
            </span>
            <input type="checkbox" checked={setting.value} onChange={(event) => setting.setValue(event.target.checked)} style={{ accentColor: "#f5a623", width: 16, height: 16 }} />
          </label>
        ))}
      </div>
      <div style={{ ...panelStyle, padding: 20 }}>
        <h2 style={{ fontSize: 12, fontWeight: 600 }}>Parâmetros da rede</h2>
        <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 4, marginBottom: 16 }}>Valores demonstrativos, ainda não enviados ao ESP32</p>
        {[
          ["Limiar LDR", "1800"],
          ["Intensidade noturna", "30% · PWM 77"],
          ["Intensidade dos vizinhos", "60% · PWM 153"],
          ["Intensidade com movimento", "100%"],
          ["Tempo de permanência", "10 s"],
        ].map(([label, value]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderTop: "1px solid rgba(255,255,255,.06)" }}>
            <span style={{ fontSize: 11, color: "#8a9bbf" }}>{label}</span>
            <span className="mono" style={{ fontSize: 11, color: "#e2e8f5" }}>{value}</span>
          </div>
          ))}
      </div>
      <div className="simulation-panel" style={{ ...panelStyle, padding: 20, gridColumn: "1 / -1" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h2 style={{ fontSize: 12, fontWeight: 600 }}>Simulação local da lógica ESP32</h2>
            <p style={{ fontSize: 10, color: "#8a9bbf", marginTop: 4 }}>Controlos demonstrativos; não existe comunicação serial ativa.</p>
          </div>
          <span className="mono" style={{ fontSize: 11, color: isDay ? "#3b82f6" : "#f5a623" }}>
            LDR {ldrValue} · {isDay ? "DIA · convencionais 0%" : "NOITE · convencionais 100%"}
          </span>
        </div>
        <div className="simulation-controls" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 22, marginTop: 16 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={() => setLdrValue(2200)} style={{ flex: 1, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, color: isDay ? "#060e1f" : "#8a9bbf", background: isDay ? "#3b82f6" : "#112047", border: "1px solid rgba(255,255,255,.08)" }}>Simular dia</button>
            <button type="button" onClick={() => setLdrValue(1200)} style={{ flex: 1, padding: "9px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11, color: !isDay ? "#060e1f" : "#8a9bbf", background: !isDay ? "#f5a623" : "#112047", border: "1px solid rgba(255,255,255,.08)" }}>Simular noite</button>
          </div>
          <div className="pir-controls" style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
            {postes.map((poste, index) => (
              <button
                key={poste.id}
                type="button"
                onClick={() => triggerPir(index)}
                disabled={!pirMode || isDay || !autoMode}
                style={{ padding: "9px 8px", borderRadius: 8, cursor: !pirMode || isDay || !autoMode ? "not-allowed" : "pointer", fontSize: 10, color: poste.pir ? "#060e1f" : "#8a9bbf", background: poste.pir ? "#22c55e" : "#112047", border: "1px solid rgba(255,255,255,.08)", opacity: !pirMode || isDay || !autoMode ? 0.45 : 1 }}
              >
                PIR {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderPosteDetail = (poste: Poste) => (
    <div className="page-frame detail-page" style={{ display: "grid", gridTemplateRows: "auto 1fr", gap: 14, minHeight: 0 }}>
      <button type="button" onClick={() => setSelectedPosteId(null)} style={{ justifySelf: "start", display: "flex", alignItems: "center", gap: 8, color: "#8a9bbf", fontSize: 11, cursor: "pointer" }}>
        <span aria-hidden="true">←</span> Voltar a {activeNav}
      </button>
      <div className="detail-layout" style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 16, minHeight: 0 }}>
        <div style={{ ...panelStyle, padding: 24, display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <span className="mono" style={{ fontSize: 12, color: "#f5a623" }}>POSTE INTELIGENTE · SIMULAÇÃO</span>
              <h2 className="mono" style={{ fontSize: 28, fontWeight: 700, marginTop: 7 }}>{poste.id}</h2>
              <p style={{ fontSize: 12, color: "#8a9bbf", marginTop: 5 }}>{poste.rua}</p>
            </div>
            <LampIcon active={poste.aceso} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              ["Estado", poste.aceso ? "Aceso" : "Apagado", poste.aceso ? "#f5a623" : "#8a9bbf"],
              ["Intensidade", `${poste.intensidade}%`, "#e2e8f5"],
              ["Sensor PIR", poste.pir ? "Ativo" : "Inativo", poste.pir ? "#22c55e" : "#8a9bbf"],
            ].map(([label, value, color]) => (
              <div key={label} style={{ padding: 16, borderRadius: 12, background: "#112047" }}>
                <div style={{ fontSize: 10, color: "#8a9bbf", textTransform: "uppercase" }}>{label}</div>
                <div className="mono" style={{ fontSize: 18, fontWeight: 600, color, marginTop: 8 }}>{value}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: "#8a9bbf" }}>Nível de intensidade</span>
              <span className="mono" style={{ fontSize: 11 }}>{poste.intensidade}%</span>
            </div>
            <IntensityBar value={poste.intensidade} active={poste.aceso} />
          </div>
          <p style={{ fontSize: 10, color: "#4a5a7a" }}>Dados de demonstração · última atualização {poste.ultima}</p>
        </div>
        <div style={{ ...panelStyle, padding: 20 }}>
          <h2 style={{ fontSize: 12, fontWeight: 600 }}>Informação técnica</h2>
          {[
            ["Controlador", "ESP32 · simulado"],
            ["Comunicação", "À espera de ligação"],
            ["Potência nominal", "120 W"],
            ["Tensão", "220 V"],
            ["PWM demonstrativo", String(Math.round(poste.intensidade * 2.55))],
          ].map(([label, value]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,.06)" }}>
              <span style={{ fontSize: 10, color: "#8a9bbf" }}>{label}</span>
              <span className="mono" style={{ fontSize: 10 }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPage = () => {
    if (selectedPoste) return renderPosteDetail(selectedPoste)
    if (activeNav === "Mapa de Postes") return renderMap()
    if (activeNav === "Relatórios") return renderReports()
    if (activeNav === "Alertas") return renderAlerts()
    if (activeNav === "Configurações") return renderSettings()
    return renderDashboard()
  }

  const pageTitle = selectedPoste ? `Detalhe do Poste ${selectedPoste.id}` : activeNav
  const pageDescription = selectedPoste
    ? `${selectedPoste.rua} · dados de demonstração`
    : pageDescriptions[activeNav]

  return (
    /* Root: CSS grid locks sidebar and main into the viewport */
    <div
      className="app-shell"
      style={{
        display: "grid",
        gridTemplateColumns: "216px 1fr",
        height: "100vh",
        overflow: "hidden",
        background: "#060e1f",
      }}
    >
      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside
        className="sidebar"
        style={{
          display: "grid",
          gridTemplateRows: "auto 1fr auto",
          height: "100vh",
          overflow: "hidden",
          background: "#0a1528",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.3)",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f5a623" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2a7 7 0 0 0-4 12.8V17h8v-2.2A7 7 0 0 0 12 2z"/>
              <line x1="9" y1="21" x2="15" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f5", lineHeight: 1.3 }}>LuzSmart</p>
            <p style={{ fontSize: 11, color: "#4a5a7a" }}>Iluminação Pública</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav" style={{ padding: "12px 10px", display: "flex", flexDirection: "column", gap: 2, overflow: "hidden" }}>
          <p className="menu-label" style={{ fontSize: 10, fontWeight: 500, color: "#4a5a7a", letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 10px", marginBottom: 6 }}>Menu</p>
          {navItems.map(({ icon: Icon, label }) => {
            const isActive = activeNav === label
            return (
              <button
                key={label}
                onClick={() => openPage(label)}
                aria-current={isActive && !selectedPoste ? "page" : undefined}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 10,
                  fontSize: 13, fontWeight: 500, textAlign: "left", width: "100%",
                  cursor: "pointer", transition: "all 0.15s",
                  background: isActive ? "rgba(245,166,35,0.1)" : "transparent",
                  color: isActive ? "#f5a623" : "#8a9bbf",
                  border: isActive ? "1px solid rgba(245,166,35,0.2)" : "1px solid transparent",
                }}
              >
                <Icon />
                {label}
              </button>
            )
          })}
        </nav>

        {/* Status */}
        <div className="system-status" style={{ padding: "14px 12px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ borderRadius: 10, padding: "10px 14px", background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.15)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: supabaseConnected ? "#22c55e" : "#f5a623", boxShadow: supabaseConnected ? "0 0 6px rgba(34,197,94,0.5)" : "0 0 6px rgba(245,166,35,0.5)" }} />
              <span style={{ fontSize: 11, fontWeight: 500, color: supabaseConnected ? "#22c55e" : "#f5a623" }}>
                {supabaseConnected ? "Supabase conectado" : "Aguardando Supabase"}
              </span>
            </div>
            <p style={{ fontSize: 11, color: "#4a5a7a", marginTop: 4 }}>
              {supabasePoleIntensities !== null ? "Dados recebidos do Supabase" : "Aguardando estado dos postes"}
            </p>
          </div>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <main
        className="main-area"
        style={{
          display: "grid",
          gridTemplateRows: "54px 1fr",
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Header — fixed 54px */}
        <header
          className="app-header"
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "0 28px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f5", lineHeight: 1.2 }}>{pageTitle}</h1>
            <p style={{ fontSize: 11, color: "#4a5a7a", marginTop: 2 }}>{pageDescription}</p>
          </div>
          <div className="header-meta" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 9, padding: "4px 8px", borderRadius: 8, color: "#f5a623", background: "rgba(245,166,35,.1)", border: "1px solid rgba(245,166,35,.2)", textTransform: "uppercase", letterSpacing: ".08em" }}>
              Modo demonstração
            </span>
            <span className="mono" style={{ fontSize: 11, padding: "5px 12px", borderRadius: 8, background: "#0d1b36", color: "#8a9bbf", border: "1px solid rgba(255,255,255,0.07)" }}>
              {isDay ? "Cenário diurno" : "Cenário noturno"} · LDR {ldrValue}
            </span>
            <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, background: "rgba(245,166,35,0.15)", color: "#f5a623", border: "1px solid rgba(245,166,35,0.25)" }}>
              OP
            </div>
          </div>
        </header>

        <div
          className="content-area"
          style={{
            display: "grid",
            padding: "14px 24px 14px 24px",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {renderPage()}
        </div>
      </main>
    </div>
  )
}
