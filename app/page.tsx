"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Share2, ShieldCheck, LineChart, Layers, Users2, Clock3, MessageSquare, ArrowRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    title: "Génération guidée par vos objectifs",
    description:
      "Briefs intelligents, ton calibré et prompts prêts à l'emploi pour délivrer un contenu aligné sur votre stratégie.",
    icon: Sparkles,
  },
  {
    title: "Collaboratif par design",
    description:
      "Invitez votre équipe, organisez vos projets et validez chaque publication sans friction.",
    icon: Users2,
  },
  {
    title: "Multi-canal et contextualisé",
    description:
      "LinkedIn, Instagram, newsletters : adaptez automatiquement vos messages aux formats de chaque réseau.",
    icon: Share2,
  },
  {
    title: "Pilotage et apprentissage continu",
    description:
      "Suivez les performances, recyclez les contenus qui fonctionnent et améliorez votre voix de marque.",
    icon: LineChart,
  },
];

const workflow = [
  {
    title: "Paramétrez Postgen AI",
    description:
      "Définissez votre audience, votre ton et vos objectifs business. Postgen AI mémorise vos préférences pour toute l'équipe.",
  },
  {
    title: "Générez et personnalisez",
    description:
      "Choisissez un modèle, ajoutez vos inputs et laissez l'IA proposer des variantes. Ajoutez votre touche en quelques secondes.",
  },
  {
    title: "Publiez, mesurez, itérez",
    description:
      "Planifiez vos publications, analysez les résultats et réutilisez facilement ce qui fonctionne pour booster votre présence.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "Gratuit",
    description: "Idéal pour découvrir Postgen AI et publier vos premiers contenus.",
    perks: [
      "Génération de posts illimitée en mode brouillon",
      "1 organisation et 2 membres inclus",
      "Bibliothèque de prompts et briefs prêts à l'emploi",
    ],
  },
  {
    name: "Pro",
    price: "29€ / mois",
    description: "Pensé pour les équipes marketing qui publient chaque semaine.",
    perks: [
      "Collaborateurs illimités",
      "Automatisations multi-canales et planification",
      "Analyses d'engagement et recommandations IA",
    ],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sur mesure",
    description: "Accompagnement premium pour les marques à forte volumétrie.",
    perks: [
      "Support dédié et SLA contractuel",
      "Espaces sur-mesure et intégrations avancées",
      "Hébergement souverain et conformité renforcée",
    ],
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-slate-50 text-foreground">
      <header className="relative overflow-hidden border-b border-border bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.35),_transparent_60%)]" />
        <div className="relative z-10">
          <nav className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <div className="h-9 w-9 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span>Postgen AI</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-200">
              <Link href="#features" className="transition hover:text-white">
                Fonctionnalités
              </Link>
              <Link href="#workflow" className="transition hover:text-white">
                Comment ça marche
              </Link>
              <Link href="#pricing" className="transition hover:text-white">
                Tarifs
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                <Link href="/auth">Connexion</Link>
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                <Link href="/auth">Commencer gratuitement</Link>
              </Button>
            </div>
          </nav>
          <div className="max-w-6xl mx-auto px-6 pb-24 pt-12">
            <div className="max-w-2xl">
              <Badge className="bg-white/10 text-white hover:bg-white/20">
                Nouveauté 2024 • Assistant social media complet
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight md:text-6xl">
                Accélérez votre stratégie social media avec une IA qui comprend votre marque.
              </h1>
              <p className="mt-6 text-lg text-slate-200">
                Postgen AI est la plateforme SaaS qui transforme vos idées en contenus performants pour LinkedIn, Instagram et vos newsletters. Générez, validez, planifiez et mesurez sans quitter votre espace de travail.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                  <Link href="/auth">
                    Essayer Postgen AI
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10" asChild>
                  <Link href="#features">Découvrir la plateforme</Link>
                </Button>
              </div>
              <div className="mt-12 grid gap-6 md:grid-cols-3">
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">
                      Temps moyen gagné
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold">6h / semaine</p>
                    <p className="text-sm text-slate-300">
                      grâce à l'automatisation des briefs et validations.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">
                      Satisfaction des équipes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold">94%</p>
                    <p className="text-sm text-slate-300">
                      des utilisateurs constatent une meilleure cohérence éditoriale.
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10 text-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200">
                      Vitesse de publication
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold">x4</p>
                    <p className="text-sm text-slate-300">
                      de posts déployés sur vos réseaux préférés.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section id="features" className="py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-4 border-slate-200 text-slate-600">
                Conçu pour les équipes marketing modernes
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Une plateforme unifiée pour orchestrer votre contenu et vos campagnes.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Postgen AI combine génération assistée, workflow d'équipe et analyses pour que chaque publication ait un impact mesurable.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {features.map((feature) => (
                <Card key={feature.title} className="h-full border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                        <feature.icon className="h-6 w-6" />
                      </div>
                    </div>
                    <CardTitle className="mt-4 text-xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="workflow" className="bg-muted/60 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-2xl">
              <Badge variant="outline" className="mb-4 border-slate-300 text-slate-600">
                Un onboarding simple
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Lancez votre espace en moins d'une heure, sans effort technique.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Chaque étape est guidée dans le dashboard : vous restez concentré sur le contenu, Postgen AI s'occupe du reste.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {workflow.map((step, index) => (
                <Card key={step.title} className="relative h-full border-border bg-card">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
                        {index + 1}
                      </div>
                      <CardTitle className="text-xl font-semibold">
                        {step.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-6xl mx-auto px-6 grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-slate-200 text-slate-600">
                Ce qu'en disent les utilisateurs
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                "Postgen AI nous permet de garder une voix cohérente tout en publiant quatre fois plus vite."
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Clara, Head of Content chez NovaTech, pilote une équipe de 6 créateurs. Avec Postgen AI, elle collabore sur un même calendrier éditorial, valide les contenus en quelques clics et mesure l'impact sans multiplier les outils.
              </p>
              <div className="mt-8 flex flex-col gap-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                  Données hébergées en Europe et chiffrées de bout en bout.
                </div>
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-slate-700" />
                  Intégration native avec vos outils : Notion, HubSpot, Slack, Zapier.
                </div>
                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-slate-700" />
                  Support en français disponible en moins de 5 minutes ouvrées.
                </div>
              </div>
            </div>
            <Card className="border-primary/20 shadow-lg shadow-slate-900/5">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold">Résumé des bénéfices</CardTitle>
                <CardDescription>
                  Une plateforme pensée pour faire gagner du temps aux équipes marketing exigeantes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {["Automatisez les tâches répétitives de rédaction", "Centralisez votre contenu et vos validations", "Analysez ce qui fonctionne et réutilisez-le"].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 text-slate-700" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="pricing" className="bg-muted/60 py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="max-w-3xl text-center mx-auto">
              <Badge variant="outline" className="mb-4 border-slate-300 text-slate-600">
                Tarification transparente
              </Badge>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Des plans adaptés à chaque étape de votre croissance.
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Passez au plan supérieur quand votre production s'accélère. Sans frais cachés, sans surprise.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`flex h-full flex-col border ${plan.highlight ? "border-slate-900 shadow-xl shadow-slate-900/10" : "border-border"}`}
                >
                  <CardHeader>
                    <Badge className={plan.highlight ? "w-fit bg-slate-900 text-white" : "w-fit bg-slate-100 text-slate-700"}>
                      {plan.name}
                    </Badge>
                    <CardTitle className="mt-4 text-3xl font-semibold">{plan.price}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <ul className="space-y-3 text-sm text-muted-foreground">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-3">
                          <MessageSquare className="mt-0.5 h-4 w-4 text-slate-700" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                    {plan.highlight && (
                      <Button className="mt-8 w-full" asChild>
                        <Link href="/auth">Choisir le plan Pro</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white/70">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Prêt à faire passer votre contenu à l'échelle ?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Créez votre organisation, invitez vos collaborateurs et commencez à publier des contenus qui performent aujourd'hui.
          </p>
          <div className="mt-8 flex justify-center">
            <Button size="lg" asChild>
              <Link href="/auth">Lancer mon espace</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Essai gratuit sans carte bancaire • Résiliation à tout moment
          </p>
        </div>
      </footer>
    </div>
  );
}
