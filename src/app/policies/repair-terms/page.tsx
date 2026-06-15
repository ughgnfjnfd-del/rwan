import React from "react";
import { Wrench, AlertTriangle, ShieldCheck } from "lucide-react";

export default function RepairTermsPage() {
  return (
    <div className="space-y-6 text-right">

      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="p-2 bg-blue-50 rounded-xl text-blue-500">
          <Wrench className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">شروط حجز موعد الصيانة</h2>
          <p className="text-xs text-slate-400">آخر تحديث: يونيو 2026</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        في مركز الصيانة المعتمد لـ <strong>مركز الروان</strong>، نوفر صيانة احترافية سريعة. لضمان سير عملية الصيانة بفعالية وحماية خصوصية بياناتك وجهازك، يرجى الاطلاع على الشروط والأحكام الخاصة بخدمة الصيانة.
      </p>

      {/* Grid: Pre-repair requirements vs Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Customer Responsibility */}
        <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            مسؤولية البيانات والنسخ الاحتياطي
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>النسخ الاحتياطي للملفات</strong>: يتحمل الزبون كامل المسؤولية عن عمل نسخة احتياطية لبياناته (الصور، جهات الاتصال، الملاحظات) قبل تسليم الهاتف للصيانة. المركز غير مسؤول عن أي فقدان للبيانات قد يحدث أثناء تبديل القطع أو فلاش السوفتوير.
            </li>
            <li>
              <strong>إلغاء قفل الحماية</strong>: لضمان فحص كفاءة الشاشة أو الكاميرا أو الصوت بعد التصليح، يرجى تزويد الفني برمز القفل أو إلغاء تفعيل ميزة البحث عن الهاتف (Find My iPhone) للأجهزة الذكية.
            </li>
          </ul>
        </div>

        {/* Diagnostics & Fees */}
        <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            أجور الفحص ورفض الصيانة
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>فحص مجاني</strong>: يكون فحص الجهاز وتحديد العطل مجانياً بالكامل في حال وافق الزبون على إجراء الصيانة وتصليح الجهاز داخل المركز.
            </li>
            <li>
              <strong>أجور فحص العطل</strong>: في حال تم تشخيص العطل ورفض الزبون إجراء الصيانة لأي سبب، يتم احتساب رسوم فحص ثابتة قدرها (10,000 د.ع) فقط لقاء وقت المهندس وجهد التشخيص.
            </li>
          </ul>
        </div>

      </div>

      {/* Retention and Pickup */}
      <div className="bg-amber-50/20 border border-amber-100 p-5 rounded-2xl space-y-3">
        <h3 className="font-extrabold text-sm sm:text-base text-amber-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          مدة استلام الهواتف ومسؤولية المركز:
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <li>
            • <strong>فترة الاستلام القصوى</strong>: يجب على الزبون استلام هاتفه فور إبلاغه بانتهاء عملية الصيانة. أقصى مدة للاحتفاظ بالجهاز هي ً من تاريخ الاتصال به.
          </li>
          <li>
            • <strong>إخلاء المسؤولية</strong>: يخلى المركز مسؤوليته تماماً عن الأجهزة التي يتركها أصحابها لأكثر من 45 يوماً دون استلام أو تواصل، وللمركز الحق في التصرف بها لتغطية تكاليف قطع الغيار المستخدمة.
          </li>
          <li>
            • <strong>فاتورة الصيانة</strong>: يتم تسليم الهاتف المصلح لصاحبه حصرياً بموجب فاتورة الصيانة الأصلية المسلمة له عند تسليم الهاتف.
          </li>
        </ul>
      </div>

      {/* Repair Guarantee */}
      <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-2xl flex gap-3 text-xs text-slate-700">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-blue-800 mb-1">ضمان ما بعد التصليح</span>
          جميع عمليات الصيانة وقطع الغيار المستبدلة (شاشات، بطاريات، منافذ شحن، إلخ) مشمولة بضمان حقيقي لمدة 3 أيام. في حال تكرار نفس المشكلة نتيجة خلل في القطعة، نقوم بإعادة صيانتها مجاناً.
        </div>
      </div>

    </div>
  );
}
