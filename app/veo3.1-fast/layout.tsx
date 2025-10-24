import { ModelProvider } from "@/app/lib/context/ModelContext";

export default function Veo31FastLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ModelProvider defaultModelId="veo3.1-fast">
      {children}
    </ModelProvider>
  );
}
