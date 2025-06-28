import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function FeatureOverview() {
  const features = [
    {
      emoji: "🎯",
      title: "Champ de recherche",
      description: "Saisissez un sujet ou une idée comme point de départ."
    },
    {
      emoji: "📝",
      title: "Contenu multicanal",
      description: "Posts LinkedIn, légendes Instagram, tweets et emails courts."
    },
    {
      emoji: "🎨",
      title: "Carrousel",
      description: "Slides de carrousel prêts à l'export (texte uniquement)."
    },
    {
      emoji: "✍️",
      title: "Article de blog",
      description: "Article complet optimisé pour le SEO."
    },
    {
      emoji: "🧠",
      title: "Choix du ton",
      description: "Personnalisez le ton : pro, fun, éducatif ou storytelling."
    },
    {
      emoji: "📤",
      title: "Export simple",
      description: "Copiez ou téléchargez immédiatement vos contenus générés."
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fonctionnalités clés</CardTitle>
        <CardDescription>
          Aperçu des principales fonctions de Postgen AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-xl">{feature.emoji}</span>
              <div>
                <p className="font-medium leading-none">{feature.title}</p>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
