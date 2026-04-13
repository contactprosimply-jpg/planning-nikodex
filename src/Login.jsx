import { useState } from "react";

export default function Login({ onLogin }) {
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (password === "nikodex123") {
      localStorage.setItem("auth", "true");
      onLogin();
    } else {
      alert("Mot de passe incorrect");
    }
  };

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>Planning NIKODEX</h2>

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ padding: 10, marginBottom: 10 }}
      />

      <br />

      <button onClick={handleLogin}>Connexion</button>
    </div>
  );
}