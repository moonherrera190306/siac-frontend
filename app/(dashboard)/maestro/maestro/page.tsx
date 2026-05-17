"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MaestroPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/maestro/dashboard");
  }, [router]);

  return null;
}