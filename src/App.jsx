import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function App() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: "",
    chantier: "",
    intervenant: "",
    tache: "",
    duree: "",
    camion: "",
  });

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("entries")
      .select("*")
      .order("id", { ascending: false });

    setEntries(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editingId) {
      await supabase.from("entries").update(form).eq("id", editingId);
    } else {
      await supabase.from("entries").insert([form]);
    }

    setEditingId(null);
    fetchEntries();

    setForm({
      date: "",
      chantier: "",
      intervenant: "",
      tache: "",
      duree: "",
      camion: "",
    });
  };

  const deleteEntry = async (id) => {
    await supabase.from("entries").delete().eq("id", id);
    fetchEntries();
  };

  const editEntry = (entry) => {
    setForm(entry);
    setEditingId(entry.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = entries.filter((e) =>
    e.chantier?.toLowerCase().includes(filter.toLowerCase())
  );

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

        <input
          placeholder="🔍 Filtrer chantier"
          onChange={(e) => setFilter(e.target.value)}
          style={{
            flex: 1,
            padding: 12,
            borderRadius: 8,
          }}
        />
      </div>

      {/* FORM GRID */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
          marginBottom: 15,
        }}
      >
        {/* DATE FIX MOBILE */}
<input
  type="date"
  value={form.date}
  onChange={(e) => setForm({ ...form, date: e.target.value })}
  style={{
    width: "100%",
    padding: 16,
    fontSize: 16,
    borderRadius: 8,
    backgroundColor: "#ffffff",   // 🔥 toujours blanc
    color: "#000000",             // 🔥 texte noir
    border: "1px solid #ccc",
    colorScheme: "light"          // 🔥 force iPhone en mode clair
  }}
/>
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

        <button
          style={{
            gridColumn: "1 / -1",
            padding: 15,
            fontSize: 18,
            borderRadius: 8,
            background: "#3b82f6",
            color: "white",
          }}
        >
          {editingId ? "Modifier" : "Ajouter"}
        </button>
      </form>

      {/* LISTE */}
      <div>
        {filtered.map((e) => (
          <div
            key={e.id}
            style={{
              padding: 15,
              marginBottom: 10,
              borderRadius: 10,
              background: darkMode ? "#1e293b" : "#fff",
            }}
          >
            <b>{e.chantier}</b> — {e.tache}
            <br />
            {e.date} | {e.intervenant} | {e.duree} | {e.camion}

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