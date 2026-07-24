"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("As senhas nao conferem");
      return;
    }

    if (password.length < 6) {
      setError("A senha deve ter no minimo 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push("/login");
      } else {
        const data = await res.json();
        setError(data.error || "Erro ao cadastrar");
      }
    } catch {
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
            Criar Conta
          </h1>
          <p className="text-surface-600 dark:text-surface-400 mt-1">
            Junte-se ao LBSA
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Nome completo"
            placeholder="Seu nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="h-4 w-4" />}
            required
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="h-4 w-4" />}
            required
          />

          <Input
            label="Senha"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            required
          />

          <Input
            label="Confirmar senha"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock className="h-4 w-4" />}
            required
          />

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Cadastrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Ja tem uma conta?{" "}
            <Link
              href="/login"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Faca login
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
