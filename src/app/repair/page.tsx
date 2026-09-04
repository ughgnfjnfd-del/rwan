import type { Metadata } from "next";
import RepairExperience from "@/components/RepairExperience";

export const metadata: Metadata = {
  title: "الصيانة المعتمدة | مركز الروان",
  description: "احجز فحص وصيانة جهازك في مركز الروان مع تشخيص واضح، موافقة قبل الإصلاح وضمان داخل المركز فقط.",
};

export default function RepairPage() {
  return <RepairExperience />;
}
