import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/* USERS */
const USERS = [
  { email: "b.uros@nikodex.fr", password: "Ukiuki16", initials: "UB" },
  { email: "d.baralic@nikodex.fr", password: "Tatjana1977", initials: "DB" },
  { email: "b.daniela@nikodex.fr", password: "Tatjana1977", initials: "KIKI" },
  { email: "m.sunny@nikodex.fr", password: "Tatjana1977", initials: "SM" },
  { email: "t.sacha@nikodex.fr", password: "Tatjana1977", initials: "ST" },
  { email: "d.gilles@nikodex.fr", password: "Tatjana1977", initials: "GD" },
];

/* LOGIN */
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      onLogin(user);
    } else {
      alert("Identifiants incorrects");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Planning NIKODEX</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10 }}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 10 }}
      />

      <br /><br />

      <button onClick={handleLogin}>Connexion</button>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user"))
  );

  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // 🔥 TRI
  const [orderAsc, setOrderAsc] = useState(false);

  const [form, setForm] = useState({
    date: "",
    chantier: "",
    intervenant: "",
    tache: "",
    duree: "",
    camion: "",
  });

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  useEffect(() => {
    fetchEntries();
  }, [orderAsc]);

  /* FETCH */
  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("date", { ascending: orderAsc });

    if (error) {
      console.error(error);
      return;
    }

    setEntries(data || []);
  };

  /* SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSave = {
      date: form.date,
      chantier: form.chantier,
      intervenant: form.intervenant,
      tache: form.tache,
      duree: form.duree,
      camion: form.camion,
      user: user?.initials || "??",
    };

    let error;

    if (editingId) {
      const res = await supabase
        .from("entries")
        .update(dataToSave)
        .eq("id", editingId);

      error = res.error;
    } else {
      const res = await supabase
        .from("entries")
        .insert([dataToSave]);

      error = res.error;
    }

    if (error) {
      console.error(error);
      alert("Erreur Supabase !");
      return;
    }

    setEditingId(null);
    await fetchEntries();

    setForm({
      date: "",
      chantier: "",
      intervenant: "",
      tache: "",
      duree: "",
      camion: "",
    });
  };

  /* DELETE */
  const deleteEntry = async (id) => {
    await supabase.from("entries").delete().eq("id", id);
    fetchEntries();
  };

  /* EDIT */
  const editEntry = (entry) => {
    setForm({
      date: entry.date || "",
      chantier: entry.chantier || "",
      intervenant: entry.intervenant || "",
      tache: entry.tache || "",
      duree: entry.duree || "",
      camion: entry.camion || "",
    });

    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* FILTER */
  const filtered = filter
    ? entries.filter((e) => e.chantier === filter)
    : entries;

  /* PDF */
  const exportPDF = () => {
    const input = document.getElementById("pdf");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 10, 10, 180, 0);
      pdf.save("planning.pdf");
    });
  };

  const theme = {
    background: darkMode ? "#0f172a" : "#f1f5f9",
    color: darkMode ? "#fff" : "#000",
  };

  return (
    <div style={{ ...theme, minHeight: "100vh", padding: 15 }}>
      <h2 style={{ textAlign: "center" }}>Planning Chantier</h2>

      {/* TOP BAR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les chantiers</option>
          {[...new Set(entries.map((e) => e.chantier))].map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* 🔥 BOUTON TRI */}
        <button onClick={() => setOrderAsc(!orderAsc)}>
          {orderAsc ? "🔼 Ancien" : "🔽 Récent"}
        </button>

        <button onClick={exportPDF}>📄 PDF</button>

        <button
          onClick={() => {
            localStorage.removeItem("user");
            window.location.reload();
          }}
        >
          🚪
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10 }}>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          style={{ background: "#fff", color: "#000" }}
        />

        <button type="button" onClick={() => {
          const today = new Date().toISOString().split("T")[0];
          setForm({ ...form, date: today });
        }}>
          📅 Aujourd’hui
        </button>

        <input placeholder="Chantier" value={form.chantier} onChange={(e) => setForm({ ...form, chantier: e.target.value })} />
        <input placeholder="Intervenant" value={form.intervenant} onChange={(e) => setForm({ ...form, intervenant: e.target.value })} />
        <input placeholder="Tâche" value={form.tache} onChange={(e) => setForm({ ...form, tache: e.target.value })} />
        <input placeholder="Durée" value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} />
        <input placeholder="Camion" value={form.camion} onChange={(e) => setForm({ ...form, camion: e.target.value })} />

        <button>{editingId ? "Modifier" : "Ajouter"}</button>
      </form>

      {/* LISTE */}
      <div id="pdf">
        {filtered.map((e) => (
          <div key={e.id}>
            <b>{e.chantier}</b> — {e.tache} ({e.user})
          </div>
        ))}
      </div>
    </div>
  );
}