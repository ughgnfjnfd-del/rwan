import React from "react";
import { Truck, CheckCircle2, AlertCircle, PhoneCall } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="space-y-6 text-right">
      
      {/* Page Title */}
      <div className="border-b border-slate-100 pb-4 flex items-center gap-3">
        <div className="p-2 bg-purple-50 rounded-xl text-purple-500">
          <Truck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#1a1a1a]">خدمة التوصيل والشحن</h2>
          <p className="text-xs text-slate-400">آخر تحديث: يونيو 2026</p>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        في <strong>مركز الروان</strong>، نوفر خدمة شحن وتوصيل سريعة وآمنة تغطي كافة محافظات العراق من الشمال إلى الجنوب. نتعاون مع أفضل شركات الخدمات اللوجستية لضمان وصول طلبك بحالته الأصلية وفي أسرع وقت.
      </p>

      {/* Grid: Delivery Rates vs Delivery Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Shipping Rates */}
        <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            أجور الشحن والتوصيل
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>داخل الناصرية</strong>: مجاني بالكامل لجميع الطلبات التي تتجاوز قيمتها (150,000 د.ع). للطلبات الأقل من ذلك، تبلغ تكلفة التوصيل (2,000 د.ع) فقط.
            </li>
          </ul>
        </div>

        {/* Shipping Times */}
        <div className="bg-slate-50 border border-card-border p-5 rounded-2xl space-y-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            مدة الشحن والتوصيل المتوقعة
          </h3>
          <ul className="text-xs text-slate-600 space-y-2.5 leading-relaxed">
            <li>
              <strong>داخل الناصرية</strong>: يتم تسليم الطلب للعميل خلال (24 إلى 48 ساعة) كحد أقصى من تأكيد الطلب.
            </li>
          </ul>
        </div>

      </div>

      {/* Customer Rights on Delivery */}
      <div className="bg-emerald-50/20 border border-emerald-100 p-5 rounded-2xl space-y-3">
        <h3 className="font-extrabold text-sm sm:text-base text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          حق فحص المنتج عند الاستلام (حقوق المشتري):
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <li>
            • <strong>الفحص العيني للمنتج</strong>: يحق للزبون فحص غلاف المنتج الخارجي والتأكد من مطابقة اللون والموديل للفاتورة أمام مندوب التوصيل قبل دفع المبلغ.
          </li>
          <li>
            • <strong>رفض استلام الشحنة</strong>: في حال وجود أي كسر أو تلف في الغلاف أو عدم تطابق المواصفات المطلوبة، يحق للزبون رفض الاستلام فوراً دون تحمل أي أجور شحن أو توصيل.
          </li>
        </ul>
      </div>

      {/* Store Rights on Delivery */}
      <div className="bg-amber-50/20 border border-amber-100 p-5 rounded-2xl space-y-3">
        <h3 className="font-extrabold text-sm sm:text-base text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          ملاحظات مهمة (حقوق المحل):
        </h3>
        <ul className="text-xs text-slate-600 space-y-2 leading-relaxed">
          <li>
            • <strong>التأكيد الهاتفي</strong>: لن يتم شحن أي طلب إلكتروني دون إجراء مكالمة تأكيدية مع العميل هاتفياً للتأكد من الاسم والعنوان والقطع المطلوبة.
          </li>
          <li>
            • <strong>عنوان التسليم</strong>: يجب على العميل تزويد مندوب الشحن بعنوان تسليم واضح ورقم هاتف بديل لتجنب تأخر وصول الشحنة.
          </li>
        </ul>
      </div>

      {/* Support hotline */}
      <div className="p-4 bg-purple-50/30 border border-purple-100 rounded-2xl flex gap-3 text-xs text-slate-700">
        <PhoneCall className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-purple-800 mb-1">هل تأخر طلبك؟</span>
          إذا مر الوقت المتوقع ولم تستلم طلبك، يرجى التواصل فوراً مع خط متابعة الشحنات السريع على الرقم <strong className="text-slate-800" dir="ltr">0773 165 0096</strong> وسنقوم بحل المشكلة بالحال.
        </div>
      </div>

    </div>
  );
}
