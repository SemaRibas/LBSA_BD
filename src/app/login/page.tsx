"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, Lock } from "lucide-react";
import { useToast } from "@/contexts/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      if (res.ok) {
        toast.success("Bem-vindo ao LBSA!", "Login realizado com sucesso.");
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        const msg = data.error || "Erro ao fazer login";
        setError(msg);
        toast.error("Falha na autenticação", msg);
      }
    } catch {
      const msg = "Erro ao conectar com o servidor";
      setError(msg);
      toast.error("Erro de Conexão", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-6 pt-2">
          <img
            src="/logo_black.png"
            alt="LBSA Logo"
            className="w-48 sm:w-56 h-auto max-h-32 object-contain mx-auto filter drop-shadow-md dark:hidden"
          />
          <img
            src="/logo_white.png"
            alt="LBSA Logo"
            className="w-48 sm:w-56 h-auto max-h-32 object-contain mx-auto filter drop-shadow-md hidden dark:block"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <Input
            label="E-mail"
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

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-surface-600 dark:text-surface-400">
            Não tem uma conta?{" "}
            <Link
              href="/register"
              className="text-teal-600 hover:text-teal-700 font-medium"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
