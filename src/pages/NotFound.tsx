import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Foydalanuvchi mavjud bo'lmagan sahifaga kirishga urindi:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        
        <a href="/" className="text-primary underline hover:text-primary/90">
          Bosh sahifaga qaytish
        </a>
      </div>
    </div>
  );
};

export default NotFound;