import React from "react";
import { Scale, CheckCircle2, AlertCircle } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="space-y-6 text-right">
      
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="p-2 bg-amber-50 rounded-xl text-amber-500">
          <Scale className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">سياسة الاسترجاع والتبديل</h2>
          <p className="text-xs text-slate-400">آخر تحديث: يونيو 2026</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        في  <strong>مركز الروان</strong>، نحرص على تقديم تجربة تسوق مرضية ومضمونة. تم إعداد سياسة الاسترجاع والتبديل بوضوح لضمان حقوق الزبون وحقوق المحل وفق القوانين التجارية والضمانات المعتمدة.
      </p>

      {/* Grid: Customer vs Store Rights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Rights */}
        <div className="bg-emerald-50/30 border border-emerald-100 p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            حقوق الزبون (المشتري)
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>الاسترجاع خلال 1 يوم</strong>: يحق للزبون استرجاع أي ملحق أو إكسسوار واسترداد قيمته بالكامل خلال 1 يوم من الشراء إذا كان لا يعمل وبحالته الأصلية.
            </li>
            <li>
              <strong>العيوب المصنعية</strong>:  في حال وجود عيب مصنعي واضح في الهاتف أو الملحق، يحق للزبون استبداله فوراً أو استرداد كامل المبلغ دون تحميله أي رسوم توصيل أو صيانة خلال يوم واحد من الشراء
            </li>
            <li>
              <strong>استرجاع المبالغ</strong>: يتم إرجاع الأموال بنفس طريقة الدفع الأصلية (نقداً، أو عبر المحافظ الإلكترونية مثل زين كاش وغيرها) خلال 24 ساعة.
            </li>
          </ul>
        </div>

        {/* Store Rights */}
        <div className="bg-amber-50/20 border border-amber-100 p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            حقوق المتجر (المحل)
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>سلامة الغلاف الخارجي</strong>: يجب أن يكون المنتج المسترجع غير مستخدم، وفي غلافه المصنعي الأصلي المغلق دون أي تمزق أو تلف.
            </li>
            <li>
              <strong>تفعيل الهواتف الذكية</strong>: لا يمكن استرجاع الهواتف الذكية التي تم فتح غلافها أو تفعيل نظامها (تسجيل الدخول بحساب Apple/Google أو إدخال الشريحة SIM) ما لم يثبت فحص فني وجود عطل مصنعي.
            </li>
            <li>
              <strong>المنتجات المستثناة</strong>: لا تشمل سياسة الاسترجاع والتبديل البرمجيات المفعلة، بطاقات الشحن الرقمية، والقطع التي تم تركيبها مسبقاً في مركز الصيانة مثل الشاشات والبطاريات.
            </li>
            <li>
              <strong>إحضار الفاتورة الأصلية</strong>: يعتبر إبراز الفاتورة الأصلية أو رقم الطلب الإلكتروني شرطاً أساسياً للاستفادة من خدمات الاسترجاع والتبديل.
            </li>
          </ul>
        </div>

      </div>

      {/* Return steps */}
      <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
        <h3 className="font-extrabold text-sm sm:text-base text-slate-800">خطوات تقديم طلب الاسترجاع أو التبديل:</h3>
        <ol className="text-xs text-slate-600 space-y-2.5 leading-relaxed list-decimal list-inside pr-1">
          <li>
            تواصل مع خدمة العملاء هاتفياً على الرقم <strong className="text-slate-800" dir="ltr">0773 165 0096</strong> أو قم بزيارة فرعنا الرئيسي في الصالحية , شارع التقاعد.
          </li>
          <li>
            قم بتقديم الفاتورة الأصلية والمنتج في علبته وحالته التي استلمته بها.
          </li>
          <li>
            سيقوم فني الصيانة بفحص المنتج سريعاً للتأكد من خلوه من سوء الاستخدام.
          </li>
          <li>
            بمجرد الموافقة، يتم إرجاع المبلغ نقداً أو استبدال السلعة بمنتج بديل فوراً.
          </li>
        </ol>
      </div>

    </div>
  );
}
