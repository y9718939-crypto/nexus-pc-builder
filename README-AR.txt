# Nexus PC Builder — Android APK build kit

هذه الحزمة تضيف إعداد Capacitor وبناء APK تلقائياً إلى مستودع Nexus الحالي.

## طريقة الاستخدام
1. فك ضغط هذه الحزمة.
2. ارفع الملفات والمجلدات الموجودة بداخلها إلى جذر مستودع GitHub نفسه:
   `y9718939-crypto/nexus-pc-builder`
   مع الحفاظ على المسارات، خصوصاً:
   - `package.json`
   - `capacitor.config.json`
   - `scripts/prepare-web.mjs`
   - `.github/workflows/android-apk.yml`
3. اضغط **Commit changes**.
4. افتح تبويب **Actions** في GitHub.
5. افتح سير العمل **Build Nexus Android APK** وانتظر حتى يصبح أخضر.
6. افتح نتيجة التشغيل، ثم من **Artifacts** نزّل `Nexus-PC-Builder-APK`.
7. فك ضغط الملف على هاتفك وثبّت `app-debug.apk`.

## ملاحظة
يستخدم البناء ملفات الموقع المسطّحة الموجودة حالياً في جذر المستودع ويضعها في المسارات التي تتوقعها صفحات HTML. الأسعار الموجودة في المشروع تجريبية وليست أسعار سوق مباشرة.
