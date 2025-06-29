"use client";
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { AnimataCard } from "@/components/ui/animata-card";
import { AcertenityButton } from "@/components/ui/acertenity-button";
import { CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Notification {
  id: string;
  message: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) setItems(JSON.parse(stored));
  }, []);

  const save = (data: Notification[]) => {
    setItems(data);
    localStorage.setItem("notifications", JSON.stringify(data));
  };

  const markRead = (id: string) => {
    const updated = items.map((n) =>
      n.id === id ? { ...n, read: true } : n,
    );
    save(updated);
  };

  const clearAll = () => save([]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>
      <Separator />
      {items.length === 0 ? (
        <p className="text-muted-foreground">Aucune notification.</p>
      ) : (
        <div className="grid gap-2">
          {items.map((n) => (
            <AnimataCard key={n.id} className="p-3 flex items-center justify-between">
              <div className={n.read ? "text-muted-foreground" : ""}>{n.message}</div>
              {!n.read && (
                <AcertenityButton size="sm" onClick={() => markRead(n.id)}>
                  Marquer lu
                </AcertenityButton>
              )}
            </AnimataCard>
          ))}
          <AcertenityButton onClick={clearAll} className="mt-2" variant="destructive">
            Vider
          </AcertenityButton>
        </div>
      )}
    </div>
  );
}
