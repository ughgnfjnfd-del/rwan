import React from "react";
import { ShieldCheck, CheckCircle2, AlertTriangle, HelpCircle } from "lucide-react";

export default function WarrantyPolicyPage() {
  return (
    <div className="space-y-6 text-right">
      
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-500">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">تفاصيل ضمان الأجهزة والقطع</h2>
          <p className="text-xs text-slate-400">آخر تحديث: يونيو 2026</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        في <strong>مركز الروان</strong>، نثق بجودة أجهزتنا وقطع الغيار التي نستخدمها في مركز الصيانة. لذلك، نوفر لعملائنا ضمانات حقيقية مكتوبة وموثقة تضمن راحة بالهم واستمرارية كفاءة هواتفهم.
      </p>

      {/* Grid: Device Warranty vs Spare Part Warranty */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Device Warranty */}
        <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            ضمان الأجهزة الجديدة (سنة كاملة)
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>ضمان الوكيل 3 أيام</strong>: تشمل جميع الهواتف الجديدة ضماناً لمدة 3 أيام ضد العيوب المصنعية والأعطال الداخلية في الهاردوير.
            </li>
            <li>
              <strong>الاستبدال الفوري</strong>: إذا تبين وجود عيب مصنعي في الهاتف خلال الـ 3 أيام الأولى من الشراء، يتم استبداله بجهاز جديد فوراً.
            </li>
            <li>
              <strong>الدعم الفني المجاني</strong>: يحصل العميل على دعم فني واستشارات مجانية لحل المشكلات البرمجية طوال فترة الضمان.
            </li>
          </ul>
        </div>

        {/* Parts & Repair Warranty */}
        <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            ضمان قطع الصيانة (3 يوماً)
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>ضمان الشاشات والبطاريات</strong>: نوفر ضماناً حقيقياً لمدة 3 أيام على جميع الشاشات والبطاريات وقطع الغيار التي يتم تركيبها في مركزنا.
            </li>
            <li>
              <strong>عطل القطعة المستبدلة</strong>: إذا توقفت القطعة أو ظهر فيها خلل أثناء فترة الـ 3 أيام، يتم استبدالها بقطعة جديدة أخرى مجاناً بالكامل.
            </li>
            <li>
              <strong>موثوقية القطع</strong>: نضمن أن جميع قطع الغيار المستخدمة هي قطع أصلية معتمدة من الوكلاء والشركات المصنعة.
            </li>
          </ul>
        </div>

      </div>

      {/* Warranty Exclusions */}
      <div className="bg-rose-50/20 border border-rose-100 p-5 rounded-2xl space-y-3">
        <h3 className="font-extrabold text-sm sm:text-base text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          حالات مستثناة ولا يشملها الضمان:
        </h3>
        <p className="text-[11px] text-slate-500 leading-normal">
          يرجى الانتباه إلى أن الضمان يعتبر ملغياً أو غير سارٍ في الحالات التالية لحماية حقوق المحل من سوء الاستخدام:
        </p>
        <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <li>
            • <strong>سوء الاستخدام أو التلف الفيزيائي</strong>: مثل تعرض الهاتف للكسر، الخدوش العميقة، الانحناء، أو كسر الشاشة الخارجي والداخلي نتيجة السقوط.
          </li>
          <li>
            • <strong>تلف السوائل والرطوبة</strong>: تسرب المياه أو السوائل إلى داخل الهاتف (حتى وإن كان الهاتف مصنفاً كمقاوم للماء من المصنع).
          </li>
          <li>
            • <strong>الصيانة الخارجية</strong>: فتح الهاتف أو إجراء أي صيانة له في مراكز غير معتمدة أو خارج  مركز الروان.
          </li>
          <li>
            • <strong>التعديل البرمجي (الجيلبريك والروت)</strong>: تعديل نظام التشغيل الأساسي بطرق غير رسمية تؤدي لعطل في السوفتوير أو الهاردوير.
          </li>
        </ul>
      </div>

      {/* How to claim warranty */}
      <div className="p-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl flex gap-3 text-xs text-slate-700">
        <HelpCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-emerald-800 mb-1">كيف أستفيد من الضمان؟</span>
          عند حدوث أي خلل، يرجى إحضار الهاتف مع الفاتورة الأصلية أو بطاقة الضمان التي استلمتها عند الشراء أو الصيانة إلى فرعنا. سيقوم المهندسون بفحص جهازك وإصلاحه أو استبدال القطعة المعطلة بأسرع وقت ممكن.
        </div>
      </div>

    </div>
  );
}
