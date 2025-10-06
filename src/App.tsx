import AppRouter from "@/router/AppRouter";
import { Toaster } from "@/components/ui/sonner";
import { UploadProvider } from "@/contexts/UploadContext";
import UploadToast from "@/components/UploadToast";

function App() {
  return (
    <>
      <UploadProvider>
        <AppRouter />
        <UploadToast />
      </UploadProvider>
      <Toaster />
    </>
  );
}

export default App;
