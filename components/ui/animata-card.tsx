import { Card, CardHeader, CardContent } from "./card";

export function AnimataCard({
  title,
  children,
  ...props
}: React.ComponentProps<typeof Card> & { title: string }) {
  return (
    <Card className="border-blue-500" {...props}>
      <CardHeader className="bg-blue-50 text-blue-600 font-bold">{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
