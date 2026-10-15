# تريلرز

منصة موحدة لعروض الأفلام والمسلسلات والألعاب التشويقية (Next.js).

## التشغيل
1. سجلي في https://www.themoviedb.org وخذي مفتاح API (v3 auth).
2. سجلي في https://rawg.io/apidocs وخذي مفتاح API.
3. انسخي `.env.local.example` إلى `.env.local` وحطي المفتاحين.
4. شغلي:
   npm install
   npm run dev
5. افتحي http://localhost:3000

## النشر (Netlify/Vercel)
أضيفي TMDB_API_KEY و RAWG_API_KEY في Environment Variables.

## ملاحظات
- المفاتيح تبقى على السيرفر داخل app/api فلا تنكشف للمتصفح.
- تريلرات الألعاب من RAWG محدودة؛ إن لم يوجد تريلر يظهر رابط بحث يوتيوب.
- شرط TMDB: إبقاء جملة الإسناد في أسفل الصفحة.
