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
  const [orderAsc, setOrderAsc] = useState(false);

  const [selectedMonth, setSelectedMonth] = useState("Global");

  const months = [
    "Global",
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre",
  ];

  const [form, setForm] = useState({
    date: "",
    chantier: "",
    intervenant: "",
    tache: "",
    duree: "",
    camion: "",
    prix: "",
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
      prix: Number(form.prix) || 0,
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
      prix: "",
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
      prix: entry.prix || "",
    });

    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* FILTER */
  const filtered = entries.filter((entry) => {
    const chantierMatch = filter ? entry.chantier === filter : true;

    if (selectedMonth === "Global") return chantierMatch;

    const entryMonth = new Date(entry.date).getMonth();
    const monthIndex = months.indexOf(selectedMonth) - 1;

    return chantierMatch && entryMonth === monthIndex;
  });

  /* TOTAL */
  const totalPrix = filtered.reduce(
    (sum, e) => sum + (e.prix || 0),
    0
  );

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

      {/* ONGLET MOIS */}
      <div style={{ display: "flex", gap: 5, overflowX: "auto", marginBottom: 10 }}>
        {months.map((m) => (
          <button
            key={m}
            onClick={() => setSelectedMonth(m)}
            style={{
              padding: "6px 10px",
              borderRadius: 5,
              background: selectedMonth === m ? "#2563eb" : "#ccc",
              color: selectedMonth === m ? "#fff" : "#000",
              border: "none",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* TOP BAR */}
      <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">Tous les chantiers</option>
          {[...new Set(entries.map((e) => e.chantier).filter(Boolean))].map((c, i) => (
            <option key={i} value={c}>
              {c}
            </option>
          ))}
        </select>

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

      {/* TOTAL */}
      <div style={{ fontWeight: "bold", marginBottom: 10 }}>
        💰 Total : {totalPrix} €
      </div>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 15,
        }}
      >
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />

        <button
          type="button"
          onClick={() => {
            const today = new Date().toISOString().split("T")[0];
            setForm({ ...form, date: today });
          }}
        >
          📅 Aujourd’hui
        </button>

        <input placeholder="Chantier" value={form.chantier} onChange={(e) => setForm({ ...form, chantier: e.target.value })} />
        <input placeholder="Intervenant" value={form.intervenant} onChange={(e) => setForm({ ...form, intervenant: e.target.value })} />
        <input placeholder="Tâche" value={form.tache} onChange={(e) => setForm({ ...form, tache: e.target.value })} />
        <input placeholder="Durée" value={form.duree} onChange={(e) => setForm({ ...form, duree: e.target.value })} />
        <input placeholder="Camion" value={form.camion} onChange={(e) => setForm({ ...form, camion: e.target.value })} />
        <input type="number" placeholder="Prix €" value={form.prix} onChange={(e) => setForm({ ...form, prix: e.target.value })} />

        <button style={{ gridColumn: "1 / -1", padding: 15 }}>
          {editingId ? "Modifier" : "Ajouter"}
        </button>
      </form>

      {/* LISTE */}
      <div id="pdf">
        {filtered.map((e) => (
          <div
            key={e.id}
            style={{
              padding: 15,
              marginBottom: 10,
              borderRadius: 10,
              background: darkMode ? "#1e293b" : "#ffffff",
            }}
          >
            <b>{e.chantier}</b> — {e.tache} ({e.user || "??"})
            <br />
            {e.date} | {e.intervenant} | {e.duree}h | {e.camion} | 💰 {e.prix || 0} €

            <div style={{ marginTop: 10 }}>
              <button onClick={() => editEntry(e)}>✏️</button>
              <button onClick={() => deleteEntry(e.id)}>❌</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}