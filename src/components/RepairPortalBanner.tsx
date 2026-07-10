import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, Smartphone, Wrench } from "lucide-react";

export default function RepairPortalBanner() {
  return (
    <section className="relative overflow-hidden rounded-[28px] bg-slate-950 text-white shadow-[0_28px_75px_rgba(15,23,42,0.2)]">
      <div className="grid min-h-[420px] items-center lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10 p-7 sm:p-11 lg:p-14">
          <span className="inline-flex items-center gap-2 text-[11px] font-black text-cyan-300">
            <Wrench className="h-4 w-4" />
            AL-RWAN CARE
          </span>
          <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[1.02] sm:text-6xl">
            مو كل عطل يحتاج قطعة.
            <span className="mt-2 block text-slate-400">يحتاج تشخيص صح.</span>
          </h2>
          <p className="mt-6 max-w-xl text-sm font-semibold leading-7 text-slate-400 sm:text-base">
            ادخل إلى مركز الصيانة الجديد، اختر مشكلة جهازك واحجز فحصك خلال دقيقة.
          </p>
          <Link href="/repair" className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-white px-7 text-sm font-black text-slate-950 transition-all hover:-translate-y-0.5 hover:bg-cyan-50 active:scale-[0.98]">
            اكتشف مركز الصيانة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden border-t border-white/10 bg-white/[0.035] lg:min-h-full lg:border-r lg:border-t-0">
          <span className="absolute text-[clamp(5rem,14vw,11rem)] font-black text-white/[0.035]" dir="ltr">CARE</span>
          <div className="relative flex h-[300px] w-[152px] items-center justify-center rounded-[34px] border-[7px] border-slate-700 bg-black shadow-[0_35px_65px_rgba(0,0,0,0.52)] sm:h-[330px] sm:w-[166px]">
            <div className="absolute top-2 h-5 w-16 rounded-full bg-slate-950" />
            <div className="absolute inset-3 overflow-hidden rounded-[24px] border border-white/10 bg-slate-900">
              <div className="absolute inset-x-0 top-[42%] h-px bg-cyan-300 shadow-[0_0_18px_4px_rgba(103,232,249,0.7)]" />
              <div className="flex h-full flex-col items-center justify-center">
                <Smartphone className="h-14 w-14 text-cyan-300" strokeWidth={1.25} />
                <span className="mt-4 text-[9px] font-black text-white">فحص الجهاز</span>
              </div>
            </div>
          </div>
          <div className="absolute right-[8%] top-[18%] hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black backdrop-blur-md sm:flex">
            <ShieldCheck className="h-4 w-4 text-cyan-300" />
            بيانات محمية
          </div>
          <div className="absolute bottom-[18%] left-[7%] hidden items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-black backdrop-blur-md sm:flex">
            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            موافقة قبل الإصلاح
          </div>
        </div>
      </div>
    </section>
  );
}
