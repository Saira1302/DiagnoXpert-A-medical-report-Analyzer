import { Suspense } from "react";
import GoogleRegisterPage from "./page";

export default function Layout() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GoogleRegisterPage />
    </Suspense>
  );
}