"use client";
import { useState } from "react";
import Dashboard from "../components/Dashboard";
import LandingHero from "../components/LandingHero";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [persona, setPersona] = useState<"industry" | "consumer">("industry");

  if (!entered) {
    return (
      <LandingHero
        onEnter={(p) => {
          setPersona(p);
          setEntered(true);
        }}
      />
    );
  }

  return <Dashboard persona={persona} onLogout={() => setEntered(false)} />;
}
