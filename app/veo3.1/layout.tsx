import { ModelProvider } from "@/app/lib/context/ModelContext";

export default function Veo31Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModelProvider defaultModelId="veo3.1">
      {children}
    </ModelProvider>
  );
}
