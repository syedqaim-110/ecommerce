import { createContext, useContext, useState, useEffect } from 'react';
import API from '../utils/api';

const SettingsContext = createContext();

// Built-in translations
const translations = {
  en: {
    search: 'Search', allCategory: 'All category', hotOffers: 'Hot offers',
    login: 'Login', register: 'Register', profile: 'Profile', orders: 'Orders',
    myCart: 'My cart', messages: 'Messages', home: 'Home', products: 'Products',
    addToCart: 'Add to Cart', buyNow: 'Buy Now', inStock: 'In stock',
    outOfStock: 'Out of stock', description: 'Description', reviews: 'Reviews',
    shipping: 'Shipping', aboutCompany: 'About company', relatedProducts: 'Related products',
    youMayLike: 'You may like', sendInquiry: 'Send inquiry', subscribe: 'Subscribe',
    subscribeNewsletter: 'Subscribe on our newsletter', sourceNow: 'Source now',
    learnMore: 'Learn more', joinNow: 'Join now', shipTo: 'Ship to',
    dealsOffers: 'Deals and offers', recommendedItems: 'Recommended items',
    ourServices: 'Our extra services', suppliersByRegion: 'Suppliers by region',
    sendQuote: 'Send quote to suppliers', customerService: 'Customer Service',
    helpCenter: 'Help Center', writeReview: 'Write a Review', submitReview: 'Submit Review',
    rating: 'Rating', comment: 'Your comment', noReviews: 'No reviews yet. Be the first!',
    cart: 'Cart', total: 'Total', checkout: 'Place Order', remove: 'Remove',
    quantity: 'Quantity', price: 'Price', myOrders: 'My Orders', logout: 'Logout',
    adminPanel: 'Admin Panel', verified: 'Verified Seller', worldwide: 'Worldwide shipping',
    negotiable: 'Negotiable', size: 'Size', material: 'Material', design: 'Design',
    superDiscount: 'Super discount on more than 100 USD', shopNow: 'Shop now',
    myMessages: 'My Messages', sendMessage: 'Send Message', subject: 'Subject', message: 'Message',
    noMessages: 'No messages yet', reply: 'Reply', read: 'Read', unread: 'Unread',
  },
  ur: {
    search: 'تلاش', allCategory: 'تمام اقسام', hotOffers: 'گرم آفرز',
    login: 'لاگ ان', register: 'رجسٹر', profile: 'پروفائل', orders: 'آرڈرز',
    myCart: 'میری ٹوکری', messages: 'پیغامات', home: 'ہوم', products: 'مصنوعات',
    addToCart: 'ٹوکری میں ڈالیں', buyNow: 'ابھی خریدیں', inStock: 'اسٹاک میں',
    outOfStock: 'اسٹاک ختم', description: 'تفصیل', reviews: 'جائزے',
    shipping: 'شپنگ', aboutCompany: 'کمپنی کے بارے میں', relatedProducts: 'متعلقہ مصنوعات',
    youMayLike: 'آپ کو پسند آ سکتا ہے', sendInquiry: 'انکوائری بھیجیں', subscribe: 'سبسکرائب',
    subscribeNewsletter: 'نیوز لیٹر سبسکرائب کریں', sourceNow: 'ابھی سورس کریں',
    learnMore: 'مزید جانیں', joinNow: 'ابھی شامل ہوں', shipTo: 'شپ کریں',
    dealsOffers: 'ڈیلز اور آفرز', recommendedItems: 'تجویز کردہ اشیاء',
    ourServices: 'ہماری اضافی خدمات', suppliersByRegion: 'علاقے کے مطابق سپلائرز',
    sendQuote: 'سپلائرز کو کوٹ بھیجیں', customerService: 'کسٹمر سروس',
    helpCenter: 'مدد مرکز', writeReview: 'جائزہ لکھیں', submitReview: 'جائزہ جمع کریں',
    rating: 'درجہ بندی', comment: 'آپ کی رائے', noReviews: 'ابھی تک کوئی جائزہ نہیں',
    cart: 'ٹوکری', total: 'کل', checkout: 'آرڈر دیں', remove: 'ہٹائیں',
    quantity: 'مقدار', price: 'قیمت', myOrders: 'میرے آرڈرز', logout: 'لاگ آؤٹ',
    adminPanel: 'ایڈمن پینل', verified: 'تصدیق شدہ بیچنے والا', worldwide: 'دنیا بھر میں شپنگ',
    negotiable: 'قابل مذاکرات', size: 'سائز', material: 'مواد', design: 'ڈیزائن',
    superDiscount: '100 ڈالر سے زیادہ پر سپر ڈسکاؤنٹ', shopNow: 'ابھی خریدیں',
    myMessages: 'میرے پیغامات', sendMessage: 'پیغام بھیجیں', subject: 'موضوع', message: 'پیغام',
    noMessages: 'ابھی تک کوئی پیغام نہیں', reply: 'جواب', read: 'پڑھا', unread: 'نہیں پڑھا',
  },
  ar: {
    search: 'بحث', allCategory: 'جميع الفئات', hotOffers: 'عروض ساخنة',
    login: 'تسجيل الدخول', register: 'تسجيل', profile: 'الملف الشخصي', orders: 'الطلبات',
    myCart: 'سلتي', messages: 'الرسائل', home: 'الرئيسية', products: 'المنتجات',
    addToCart: 'أضف إلى السلة', buyNow: 'اشتر الآن', inStock: 'متوفر',
    outOfStock: 'غير متوفر', description: 'الوصف', reviews: 'التقييمات',
    shipping: 'الشحن', aboutCompany: 'عن الشركة', relatedProducts: 'منتجات مماثلة',
    youMayLike: 'قد يعجبك', sendInquiry: 'إرسال استفسار', subscribe: 'اشترك',
    subscribeNewsletter: 'اشترك في النشرة الإخبارية', sourceNow: 'تواصل الآن',
    learnMore: 'تعرف أكثر', joinNow: 'انضم الآن', shipTo: 'شحن إلى',
    dealsOffers: 'العروض والصفقات', recommendedItems: 'المنتجات الموصى بها',
    ourServices: 'خدماتنا الإضافية', suppliersByRegion: 'الموردون حسب المنطقة',
    sendQuote: 'إرسال عرض للموردين', customerService: 'خدمة العملاء',
    helpCenter: 'مركز المساعدة', writeReview: 'اكتب تقييما', submitReview: 'إرسال التقييم',
    rating: 'التقييم', comment: 'تعليقك', noReviews: 'لا توجد تقييمات بعد',
    cart: 'السلة', total: 'الإجمالي', checkout: 'إتمام الطلب', remove: 'حذف',
    quantity: 'الكمية', price: 'السعر', myOrders: 'طلباتي', logout: 'تسجيل الخروج',
    adminPanel: 'لوحة الإدارة', verified: 'بائع موثق', worldwide: 'شحن عالمي',
    negotiable: 'قابل للتفاوض', size: 'الحجم', material: 'المادة', design: 'التصميم',
    superDiscount: 'خصم كبير على أكثر من 100 دولار', shopNow: 'تسوق الآن',
    myMessages: 'رسائلي', sendMessage: 'إرسال رسالة', subject: 'الموضوع', message: 'الرسالة',
    noMessages: 'لا توجد رسائل بعد', reply: 'رد', read: 'مقروء', unread: 'غير مقروء',
  },
  fr: {
    search: 'Rechercher', allCategory: 'Toutes catégories', hotOffers: 'Offres chaudes',
    login: 'Connexion', register: 'S\'inscrire', profile: 'Profil', orders: 'Commandes',
    myCart: 'Mon panier', messages: 'Messages', home: 'Accueil', products: 'Produits',
    addToCart: 'Ajouter au panier', buyNow: 'Acheter maintenant', inStock: 'En stock',
    outOfStock: 'Rupture de stock', description: 'Description', reviews: 'Avis',
    shipping: 'Livraison', aboutCompany: 'À propos', relatedProducts: 'Produits similaires',
    youMayLike: 'Vous aimerez aussi', sendInquiry: 'Envoyer une demande', subscribe: 'S\'abonner',
    subscribeNewsletter: 'Abonnez-vous à notre newsletter', sourceNow: 'Commander maintenant',
    learnMore: 'En savoir plus', joinNow: 'Rejoindre', shipTo: 'Expédier vers',
    dealsOffers: 'Offres et promotions', recommendedItems: 'Articles recommandés',
    ourServices: 'Nos services supplémentaires', suppliersByRegion: 'Fournisseurs par région',
    sendQuote: 'Envoyer un devis', customerService: 'Service client',
    helpCenter: 'Centre d\'aide', writeReview: 'Écrire un avis', submitReview: 'Soumettre',
    rating: 'Note', comment: 'Votre commentaire', noReviews: 'Aucun avis pour l\'instant',
    cart: 'Panier', total: 'Total', checkout: 'Commander', remove: 'Supprimer',
    quantity: 'Quantité', price: 'Prix', myOrders: 'Mes commandes', logout: 'Déconnexion',
    adminPanel: 'Panneau Admin', verified: 'Vendeur vérifié', worldwide: 'Livraison mondiale',
    negotiable: 'Négociable', size: 'Taille', material: 'Matériau', design: 'Design',
    superDiscount: 'Super réduction sur plus de 100 USD', shopNow: 'Acheter',
    myMessages: 'Mes messages', sendMessage: 'Envoyer un message', subject: 'Sujet', message: 'Message',
    noMessages: 'Pas encore de messages', reply: 'Répondre', read: 'Lu', unread: 'Non lu',
  },
  de: {
    search: 'Suchen', allCategory: 'Alle Kategorien', hotOffers: 'Heisse Angebote',
    login: 'Anmelden', register: 'Registrieren', profile: 'Profil', orders: 'Bestellungen',
    myCart: 'Mein Warenkorb', messages: 'Nachrichten', home: 'Startseite', products: 'Produkte',
    addToCart: 'In den Warenkorb', buyNow: 'Jetzt kaufen', inStock: 'Auf Lager',
    description: 'Beschreibung', reviews: 'Bewertungen', shipping: 'Versand',
    sendInquiry: 'Anfrage senden', subscribe: 'Abonnieren', learnMore: 'Mehr erfahren',
    joinNow: 'Jetzt beitreten', dealsOffers: 'Angebote', recommendedItems: 'Empfohlene Artikel',
    ourServices: 'Zusätzliche Dienste', suppliersByRegion: 'Lieferanten nach Region',
    cart: 'Warenkorb', total: 'Gesamt', checkout: 'Bestellen', remove: 'Entfernen',
    logout: 'Abmelden', adminPanel: 'Admin-Panel', shopNow: 'Jetzt einkaufen',
    myMessages: 'Meine Nachrichten', sendMessage: 'Nachricht senden', noMessages: 'Keine Nachrichten',
    addToCart: 'In den Warenkorb', writeReview: 'Bewertung schreiben', noReviews: 'Noch keine Bewertungen',
  },
};

export const SettingsProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => JSON.parse(localStorage.getItem('lang') || '{"code":"en","name":"English","flag_code":"US"}'));
  const [currency, setCurrency] = useState(() => JSON.parse(localStorage.getItem('currency') || '{"code":"USD","symbol":"$","exchange_rate":1}'));
  const [languages, setLanguages] = useState([]);
  const [currencies, setCurrencies] = useState([]);

  useEffect(() => {
    API.get('/settings/languages').then(({data}) => setLanguages(data)).catch(()=>{});
    API.get('/settings/currencies').then(({data}) => setCurrencies(data)).catch(()=>{});
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('lang', JSON.stringify(lang));
    // RTL for Arabic/Urdu
    document.documentElement.dir = ['ar','ur'].includes(lang.code) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang.code;
  };

  const changeCurrency = (curr) => {
    setCurrency(curr);
    localStorage.setItem('currency', JSON.stringify(curr));
  };

  // Translation function
  const t = (key) => {
    const trans = translations[language.code] || translations.en;
    return trans[key] || translations.en[key] || key;
  };

  // Price conversion
  const formatPrice = (priceUSD) => {
    const converted = parseFloat(priceUSD || 0) * parseFloat(currency.exchange_rate || 1);
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <SettingsContext.Provider value={{ language, currency, languages, currencies, changeLanguage, changeCurrency, t, formatPrice }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
