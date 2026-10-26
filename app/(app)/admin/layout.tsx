import { Suspense, type ReactNode } from "react";
import { AdminNav } from "../../../components/admin/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="w-full px-4 pt-8 sm:px-8 lg:px-12">
        <Suspense fallback={<div className="h-10" />}>
          <AdminNav />
        </Suspense>
      </div>
      {children}
    </>
  );
}