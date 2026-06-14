import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, payload } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error("Telegram Bot Token or Chat ID not configured in server environment.");
      return NextResponse.json(
        { error: "Telegram notifications not configured on server." },
        { status: 500 }
      );
    }

    let text = "";

    if (type === "order") {
      const { customer, items, total } = payload;
      text = `<b>🛍️ طلب شراء جديد من المتجر!</b>\n\n`;
      text += `<b>👤 معلومات العميل:</b>\n`;
      text += `• الاسم: ${customer.name}\n`;
      text += `• الهاتف: <code>${customer.phone}</code>\n`;
      text += `• العنوان: ${customer.address}\n\n`;
      
      text += `<b>📦 المنتجات المطلوبة:</b>\n`;
      items.forEach((item: any, i: number) => {
        const colorText = item.selectedColor ? ` (اللون: ${item.selectedColor.name})` : "";
        const portText = item.selectedPort ? ` (المنفذ: ${item.selectedPort})` : "";
        text += `${i + 1}. <b>${item.product.name}${colorText}${portText}</b>\n`;
        text += `   الكمية: ${item.quantity} | السعر: ${(item.product.price * item.quantity).toLocaleString()} د.ع\n`;
      });
      
      text += `\n💵 <b>إجمالي الطلب:</b> <u>${total.toLocaleString()} د.ع</u>\n`;
      text += `📅 التاريخ: ${new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' })}`;
    } else if (type === "booking") {
      const { name, phone, device, issueType, details, date, timeSlot } = payload;
      text = `<b>🛠️ حجز صيانة جديد!</b>\n\n`;
      text += `<b>👤 العميل:</b> ${name}\n`;
      text += `<b>📞 الهاتف:</b> <code>${phone}</code>\n`;
      text += `<b>📱 الجهاز:</b> ${device}\n`;
      text += `<b>⚙️ نوع العطل:</b> ${issueType}\n`;
      if (details) {
        text += `<b>📝 تفاصيل إضافية:</b> ${details}\n`;
      }
      text += `\n<b>📅 الموعد المحجوز:</b>\n`;
      text += `• التاريخ: ${date}\n`;
      text += `• الوقت: ${timeSlot}\n\n`;
      text += `📅 تاريخ التسجيل: ${new Date().toLocaleString('ar-IQ', { timeZone: 'Asia/Baghdad' })}`;
    } else {
      return NextResponse.json({ error: "Invalid notification type" }, { status: 400 });
    }

    const chatIds = chatId.split(",").map(id => id.trim()).filter(Boolean);
    const sendPromises = chatIds.map(async (id) => {
      const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
      const res = await fetch(telegramUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: id,
          text: text,
          parse_mode: "HTML",
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`Telegram API Error for chat ID ${id}:`, errText);
      }
      return res.ok;
    });

    const results = await Promise.all(sendPromises);
    const anySuccess = results.some(r => r === true);

    if (!anySuccess) {
      return NextResponse.json({ error: "Failed to send Telegram message to any configured chat ID" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Server error notifying Telegram:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
