"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  Check,
  ChevronDown,
  CircuitBoard,
  Clock3,
  Droplets,
  Fingerprint,
  Gauge,
  Headphones,
  Home,
  LockKeyhole,
  MessageCircle,
  Mic2,
  MonitorSmartphone,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Volume2,
  Wrench,
  Zap,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import RepairModal from "@/components/RepairModal";

const repairIssues = [
  { id: "screen", label: "الشاشة", detail: "كسر، لمس أو ألوان", icon: MonitorSmartphone, progress: 72 },
  { id: "battery", label: "البطارية", detail: "نفاد سريع أو حرارة", icon: BatteryCharging, progress: 88 },
  { id: "charge", label: "الشحن", detail: "منفذ أو شحن متقطع", icon: Zap, progress: 64 },
  { id: "audio", label: "الصوت", detail: "سماعة أو مايكروفون", icon: Volume2, progress: 79 },
  { id: "water", label: "السوائل", detail: "رطوبة أو سقوط بالماء", icon: Droplets, progress: 46 },
  { id: "system", label: "النظام", detail: "تعليق أو فقدان بيانات", icon: CircuitBoard, progress: 92 },
];

const services = [
  { icon: MonitorSmartphone, title: "الشاشات واللمس", text: "فحص طبقات الشاشة واللمس واستبدال القطعة المناسبة بدقة." },
  { icon: BatteryCharging, title: "البطارية والطاقة", text: "قياس صحة البطارية، استهلاك الطاقة ودوائر التشغيل قبل الاستبدال." },
  { icon: Mic2, title: "الصوت والاتصال", text: "السماعات، المايكروفون، الشبكة والبلوتوث ضمن فحص واحد." },
  { icon: Droplets, title: "أضرار السوائل", text: "تنظيف ومعالجة دقيقة لتقليل الضرر قبل أن يصل إلى اللوحة." },
  { icon: CircuitBoard, title: "اللوحة والنظام", text: "تشخيص الأعطال المعقدة والبرمجيات مع حماية بياناتك." },
  { icon: Headphones, title: "الملحقات والمنافذ", text: "منافذ الشحن، الكاميرات والأزرار والقطع المحيطة." },
];

const processSteps = [
  { number: "01", title: "نسمع المشكلة", text: "نسجل الأعراض ونوع الجهاز والوقت المناسب لك." },
  { number: "02", title: "نفحص بدقة", text: "تشخيص واضح يحدد سبب العطل وليس شكله فقط." },
  { number: "03", title: "نطلب موافقتك", text: "السعر والمدة والقطعة تظهر قبل بدء أي عمل." },
  { number: "04", title: "نسلّم بضمان", text: "اختبار نهائي وتوثيق الصيانة قبل استلام الجهاز." },
];

const questions = [
  { q: "هل يبدأ التصليح مباشرة بعد الحجز؟", a: "لا. يبدأ الطلب بفحص وتشخيص، وبعدها نوضح لك السعر والمدة وننتظر موافقتك قبل أي إصلاح." },
  { q: "هل بيانات الجهاز تبقى آمنة؟", a: "نطلب أقل قدر ممكن من الوصول، ولا نطلب كلمات مرور أو حسابات إلا عند ضرورة فنية وبعد موافقتك الواضحة." },
  { q: "كم يستغرق الفحص؟", a: "يختلف حسب نوع العطل، لكن الفحص الأولي للأعطال الشائعة يتم عادة خلال وقت قصير ويصلك تحديث من المركز." },
  { q: "هل توجد كفالة على الصيانة؟", a: "نعم، تُحدد الكفالة بحسب نوع الإصلاح والقطعة المستخدمة وتُوثق لك عند التسليم." },
];

export default function RepairExperience() {
  const { siteSettings } = useApp();
  const [isRepairOpen, setIsRepairOpen] = useState(false);
  const [activeIssue, setActiveIssue] = useState(repairIssues[0]);
  const whatsappHref = `https://wa.me/${siteSettings?.phone?.replace(/[^\d+]/g, "") || ""}`;
  const ActiveIssueIcon = activeIssue.icon;

  return (
    <div dir="rtl" className="min-h-screen overflow-x-clip bg-white text-slate-950 selection:bg-cyan-200/60">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/82 backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="العودة إلى الرئيسية">
            {siteSettings?.logo?.url ? (
              <img src={siteSettings.logo.url} alt="مركز الروان" className="h-11 w-auto object-contain" />
            ) : (
              <div>
                <span className="block text-sm font-black">مركز الروان</span>
                <span className="block text-[9px] font-bold text-slate-400" dir="ltr">AL-RWAN CENTER</span>
              </div>
            )}
          </Link>

          <nav className="hidden items-center gap-7 text-xs font-black text-slate-500 md:flex">
            <Link href="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-slate-950">
              <Home className="h-3.5 w-3.5" />
              الرئيسية
            </Link>
            <a href="#services" className="transition-colors hover:text-slate-950">الخدمات</a>
            <a href="#process" className="transition-colors hover:text-slate-950">طريقة العمل</a>
            <a href="#guarantee" className="transition-colors hover:text-slate-950">الضمان</a>
            <a href="#questions" className="transition-colors hover:text-slate-950">الأسئلة</a>
          </nav>

          <button
            onClick={() => setIsRepairOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-xs font-black text-white transition-all hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
          >
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">احجز فحصاً</span>
            <span className="sm:hidden">احجز</span>
          </button>
        </div>
      </header>

      <main>
        <section className="relative border-b border-slate-200 bg-[#f5f7fa]">
          <div className="mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-16">
            <div className="relative order-2 lg:order-1">
              <div className="relative mx-auto max-w-[560px]">
                <div className="absolute inset-x-14 bottom-2 h-16 rounded-[100%] bg-slate-950/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[28px] border border-white/80 bg-white/72 p-4 shadow-[0_32px_90px_rgba(15,23,42,0.14)] backdrop-blur-xl sm:p-6">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                      <span className="text-[10px] font-black text-slate-500">الفحص المباشر جاهز</span>
                    </div>
                    <span className="font-mono text-[10px] font-black text-slate-400" dir="ltr">RWAN CARE / 01</span>
                  </div>

                  <div className="grid items-center gap-5 sm:grid-cols-[1fr_180px]">
                    <div className="order-2 sm:order-1">
                      <span className="text-[10px] font-black text-slate-400">المسار المحدد</span>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white">
                          <ActiveIssueIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="text-lg font-black">فحص {activeIssue.label}</h2>
                          <p className="mt-0.5 text-[11px] font-bold text-slate-500">{activeIssue.detail}</p>
                        </div>
                      </div>

                      <div className="mt-7 space-y-4">
                        {[
                          { label: "قراءة المستشعرات", value: activeIssue.progress },
                          { label: "سلامة الاتصال", value: Math.min(96, activeIssue.progress + 8) },
                          { label: "جاهزية الاختبار", value: 100 },
                        ].map((metric) => (
                          <div key={metric.label}>
                            <div className="mb-1.5 flex items-center justify-between text-[10px] font-black text-slate-500">
                              <span>{metric.label}</span>
                              <span dir="ltr">{metric.value}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-slate-950 transition-all duration-700" style={{ width: `${metric.value}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-1 mx-auto sm:order-2">
                      <div className="relative flex h-[310px] w-[156px] items-center justify-center rounded-[34px] border-[7px] border-slate-950 bg-slate-900 shadow-[0_28px_55px_rgba(15,23,42,0.3)]">
                        <div className="absolute top-2 h-5 w-16 rounded-full bg-slate-950" />
                        <div className="absolute inset-3 overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,#111827,#020617)]">
                          <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400 shadow-[0_0_18px_4px_rgba(34,211,238,0.62)]" />
                          <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                            <ActiveIssueIcon className="h-12 w-12 text-cyan-300" strokeWidth={1.35} />
                            <span className="mt-4 text-[10px] font-black text-white">جاري التحليل</span>
                            <span className="mt-1 text-[8px] font-bold text-slate-500" dir="ltr">NO DATA IS ACCESSED</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
                    {[
                      { icon: LockKeyhole, value: "محمي", label: "البيانات" },
                      { icon: Clock3, value: "سريع", label: "الفحص" },
                      { icon: ShieldCheck, value: "موثق", label: "الضمان" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 text-slate-400" />
                        <span>
                          <span className="block text-[10px] font-black">{item.value}</span>
                          <span className="block text-[8px] font-bold text-slate-400">{item.label}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 text-center lg:order-2 lg:text-right">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-slate-950">
                  <ArrowRight className="h-4 w-4" />
                  العودة للرئيسية
                </Link>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[11px] font-black text-slate-700 shadow-sm">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  مركز عناية متكامل لجهازك
                </span>
              </div>
              <h1 className="mx-auto mt-7 max-w-3xl text-[clamp(3rem,6vw,5.8rem)] font-black leading-[1.12] tracking-normal lg:mx-0">
                جهازك يرجع
                <span className="mt-2 block text-[0.76em] leading-[1.25] text-cyan-600">مثل أول يوم.</span>
              </h1>
              <p className="mx-auto mt-7 max-w-xl text-sm font-semibold leading-8 text-slate-500 sm:text-base lg:mx-0">
                مو مجرد تصليح. نحدد سبب العطل، نشرح الحل والكلفة، ونبدأ بعد موافقتك. تجربة هادئة وواضحة من أول فحص إلى آخر اختبار.
              </p>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
                <button
                  onClick={() => setIsRepairOpen(true)}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-slate-950 px-7 text-sm font-black text-white shadow-[0_18px_36px_rgba(15,23,42,0.2)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] cursor-pointer"
                >
                  ابدأ طلب الصيانة
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-7 text-sm font-black text-slate-800 transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-700"
                >
                  <MessageCircle className="h-4 w-4" />
                  اسأل الفني
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 border-y border-slate-200 py-5">
                {[
                  { value: "6+", label: "مسارات فحص" },
                  { value: "100%", label: "موافقة قبل الإصلاح" },
                  { value: "1:1", label: "متابعة مباشرة" },
                ].map((stat) => (
                  <div key={stat.label} className="border-l border-slate-200 px-2 last:border-l-0">
                    <span className="block text-lg font-black sm:text-2xl" dir="ltr">{stat.value}</span>
                    <span className="mt-1 block text-[9px] font-bold leading-4 text-slate-400 sm:text-[10px]">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-slate-200 bg-white py-7">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {repairIssues.map((issue) => (
              <button
                key={issue.id}
                onClick={() => setActiveIssue(issue)}
                className={`flex min-w-[168px] items-center gap-3 rounded-full border px-4 py-3 text-right transition-all cursor-pointer ${activeIssue.id === issue.id ? "border-slate-950 bg-slate-950 text-white shadow-md" : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
              >
                <issue.icon className="h-4 w-4 flex-shrink-0" />
                <span>
                  <span className="block text-xs font-black">{issue.label}</span>
                  <span className={`block text-[9px] font-bold ${activeIssue.id === issue.id ? "text-slate-400" : "text-slate-400"}`}>{issue.detail}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section id="services" className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="text-xs font-black text-cyan-600">كل الأعطال. مكان واحد.</span>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">نعالج السبب، مو العَرَض.</h2>
              <p className="mt-5 max-w-2xl text-sm font-semibold leading-7 text-slate-500 sm:text-base">كل مسار يبدأ بتشخيص مستقل حتى نختار الإصلاح المناسب لجهازك، بدون تبديل قطع على التخمين.</p>
            </div>

            <div className="mt-12 grid border-r border-t border-slate-200 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article key={service.title} className="group min-h-64 border-b border-l border-slate-200 p-7 transition-colors hover:bg-[#f7f9fb] sm:p-9">
                  <service.icon className="h-8 w-8 text-slate-950 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.5} />
                  <h3 className="mt-10 text-xl font-black">{service.title}</h3>
                  <p className="mt-3 max-w-sm text-xs font-semibold leading-6 text-slate-500">{service.text}</p>
                  <button onClick={() => setIsRepairOpen(true)} className="mt-7 inline-flex items-center gap-2 text-xs font-black text-cyan-700 cursor-pointer">
                    احجز لهذا العطل
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="process" className="bg-slate-950 py-20 text-white sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
              <div>
                <span className="text-xs font-black text-cyan-300">من الحجز إلى التسليم</span>
                <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">أربع خطوات.<br />ولا مفاجأة.</h2>
              </div>
              <p className="max-w-2xl text-sm font-semibold leading-7 text-slate-400 sm:text-base">أنت تعرف ماذا يحدث لجهازك في كل مرحلة. لا تبديل قطعة، ولا كلفة إضافية، ولا بدء عمل من دون موافقة واضحة منك.</p>
            </div>

            <div className="mt-14 grid border-r border-t border-white/10 md:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step) => (
                <article key={step.number} className="min-h-72 border-b border-l border-white/10 p-7 sm:p-8">
                  <span className="font-mono text-xs font-black text-cyan-300">{step.number}</span>
                  <div className="mt-16 flex h-9 w-9 items-center justify-center rounded-full border border-white/20">
                    <Check className="h-4 w-4" />
                  </div>
                  <h3 className="mt-5 text-lg font-black">{step.title}</h3>
                  <p className="mt-3 text-xs font-semibold leading-6 text-slate-400">{step.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="guarantee" className="py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="relative mx-auto flex w-full max-w-lg items-center justify-center py-12">
              <div className="absolute h-72 w-72 rounded-full border border-slate-200" />
              <div className="absolute h-52 w-52 rounded-full border border-slate-200" />
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-slate-950 text-white shadow-[0_28px_70px_rgba(15,23,42,0.28)]">
                <Fingerprint className="h-16 w-16 text-cyan-300" strokeWidth={1.2} />
              </div>
              <span className="absolute right-3 top-5 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black shadow-sm">بياناتك لك</span>
              <span className="absolute bottom-6 left-1 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black shadow-sm">ضمان موثق</span>
              <span className="absolute left-2 top-16 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black shadow-sm">قطع معتمدة</span>
            </div>

            <div>
              <span className="text-xs font-black text-cyan-600">الثقة جزء من الإصلاح</span>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-6xl">جهازك وبياناتك.<br />بأيدٍ أمينة.</h2>
              <p className="mt-6 max-w-xl text-sm font-semibold leading-8 text-slate-500 sm:text-base">نشرح ما نحتاجه من الجهاز ولماذا. الفحص الذي يتطلب وصولاً إضافياً لا يتم إلا بعد موافقتك، والقطعة المستبدلة تُوثق ضمن طلب الصيانة.</p>

              <div className="mt-9 space-y-4">
                {[
                  "لا نطلب كلمات المرور أو الحسابات دون حاجة فنية واضحة.",
                  "لا يبدأ الإصلاح قبل اعتماد السعر والمدة من قبلك.",
                  "اختبار نهائي للجهاز قبل التسليم وتوثيق الضمان.",
                ].map((text) => (
                  <div key={text} className="flex items-start gap-3 border-b border-slate-200 pb-4 text-sm font-bold text-slate-700">
                    <BadgeCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="questions" className="border-t border-slate-200 bg-[#f7f8fa] py-20 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:px-8">
            <div>
              <span className="text-xs font-black text-cyan-600">قبل ما تحجز</span>
              <h2 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">إجابات واضحة.</h2>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-slate-500">إذا عندك سؤال مختلف، الفني موجود على واتساب ويجاوبك قبل الحجز.</p>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 text-sm font-black text-emerald-700">
                <MessageCircle className="h-4 w-4" />
                تحدث مع الفني
              </a>
            </div>

            <div className="border-t border-slate-300">
              {questions.map((item) => (
                <details key={item.q} className="group border-b border-slate-300 py-2">
                  <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-5 text-sm font-black sm:text-base [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="max-w-2xl pb-5 text-xs font-semibold leading-7 text-slate-500 sm:text-sm">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
            <Gauge className="mx-auto h-10 w-10 text-cyan-600" strokeWidth={1.4} />
            <h2 className="mt-7 text-4xl font-black leading-tight sm:text-7xl">خلّينا نرجّع جهازك للحياة.</h2>
            <p className="mx-auto mt-5 max-w-xl text-sm font-semibold leading-7 text-slate-500">احجز خلال دقيقة. نراجع طلبك ونتواصل وياك لتأكيد الفحص والموعد.</p>
            <button onClick={() => setIsRepairOpen(true)} className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-slate-950 px-8 text-sm font-black text-white shadow-[0_20px_40px_rgba(15,23,42,0.2)] transition-all hover:-translate-y-0.5 hover:bg-slate-800 active:scale-[0.98] cursor-pointer">
              احجز موعد الصيانة
              <ArrowLeft className="h-4 w-4" />
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#f7f8fa]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-xs font-bold text-slate-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <Smartphone className="h-5 w-5 text-slate-950" />
            <span>مركز الروان للعناية والصيانة المعتمدة</span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/" className="hover:text-slate-950">الرئيسية</Link>
            <Link href="/policies/repair-terms" className="hover:text-slate-950">شروط الصيانة</Link>
            <Link href="/policies/warranty" className="hover:text-slate-950">الضمان</Link>
          </div>
        </div>
      </footer>

      <RepairModal isOpen={isRepairOpen} onClose={() => setIsRepairOpen(false)} />
    </div>
  );
}
