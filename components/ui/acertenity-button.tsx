import { Button } from "./button";

export function AcertenityButton(props: React.ComponentProps<typeof Button>) {
  return <Button className="bg-purple-600 hover:bg-purple-700 text-white" {...props} />;
}
