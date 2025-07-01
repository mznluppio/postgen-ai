"use client";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function HelpPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!email || !message) return;
    const existing = JSON.parse(localStorage.getItem("supportMessages") || "[]");
    existing.push({ id: Date.now().toString(), email, message });
    localStorage.setItem("supportMessages", JSON.stringify(existing));
    setSent(true);
    setEmail("");
    setMessage("");
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Aide & Support</h1>
      <Separator />
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Contactez-nous</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Textarea
            placeholder="Comment pouvons-nous vous aider ?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          {sent && <p className="text-sm text-green-600">Message envoy\u00e9 !</p>}
          <Button onClick={handleSend} disabled={!email || !message}>
            Envoyer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
