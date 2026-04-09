# Internationalization - Technical Implementation

## Overview

The College Management System provides complete bilingual support for Arabic and English languages with RTL (Right-to-Left) layout support for Arabic. All user-facing content, including static text and dynamic database content, is available in both languages.

## Technical Stack

- i18n Library: i18next 24.x
- React Integration: react-i18next
- Language Detection: Browser language detection
- Storage: localStorage for persistence
- RTL Support: CSS direction property and Tailwind utilities

## Implementation Details

### i18next Configuration

**File Location:** `client/src/i18n.js`

**Configuration:**

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en/translation.json';
import translationAR from './locales/ar/translation.json';

const resources = {
  en: {
    translation: translationEN
  },
  ar: {
    translation: translationAR
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

**Configuration Options:**
- `fallbackLng: 'ar'`: Default language is Arabic
- `escapeValue: false`: React already escapes values
- `detection.order`: Check localStorage first, then browser language
- `detection.caches`: Persist language choice in localStorage

### Language Context

**File Location:** `client/src/contexts/LanguageContext.jsx`

**Implementation:**

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'ar';
  });

  useEffect(() => {
    i18n.changeLanguage(language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, i18n]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <LanguageContext.Provider value={{ language, direction, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

**Provided Values:**
- `language`: Current language code ('en' or 'ar')
- `direction`: Text direction ('ltr' or 'rtl')
- `changeLanguage(lang)`: Function to switch languages
- `t(key)`: Translation function

### Language Switching

**Component Example:**

```javascript
const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div>
      <button
        onClick={() => changeLanguage('en')}
        className={language === 'en' ? 'active' : ''}
      >
        English
      </button>
      <button
        onClick={() => changeLanguage('ar')}
        className={language === 'ar' ? 'active' : ''}
      >
        العربية
      </button>
    </div>
  );
};
```

**Effects of Language Change:**
1. i18next language updated
2. localStorage updated
3. HTML `dir` attribute set (rtl/ltr)
4. HTML `lang` attribute set (ar/en)
5. All components re-render with new translations

### Translation Files Structure

**Directory Structure:**

```
client/src/locales/
├── en/
│   └── translation.json
└── ar/
    └── translation.json
```

**English Translation Example:**

```json
{
  "nav": {
    "home": "Home",
    "about": "About",
    "activities": "Activities",
    "departments": "Departments",
    "schedules": "Schedules",
    "materials": "Materials",
    "login": "Login",
    "register": "Register",
    "logout": "Logout"
  },
  "home": {
    "title": "Welcome to Computer Science College",
    "subtitle": "Excellence in Education and Research",
    "featuredNews": "Featured News",
    "latestUpdates": "Latest Updates"
  },
  "auth": {
    "email": "Email",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "profileName": "Profile Name",
    "login": "Login",
    "register": "Register",
    "forgotPassword": "Forgot Password?",
    "dontHaveAccount": "Don't have an account?",
    "alreadyHaveAccount": "Already have an account?"
  }
}
```

**Arabic Translation Example:**

```json
{
  "nav": {
    "home": "الرئيسية",
    "about": "عن الكلية",
    "activities": "الأنشطة",
    "departments": "الأقسام",
    "schedules": "الجداول",
    "materials": "المواد الدراسية",
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "logout": "تسجيل الخروج"
  },
  "home": {
    "title": "مرحباً بكم في كلية علوم الحاسوب",
    "subtitle": "التميز في التعليم والبحث العلمي",
    "featuredNews": "الأخبار المميزة",
    "latestUpdates": "آخر التحديثات"
  },
  "auth": {
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور",
    "confirmPassword": "تأكيد كلمة المرور",
    "profileName": "الاسم",
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "forgotPassword": "نسيت كلمة المرور؟",
    "dontHaveAccount": "ليس لديك حساب؟",
    "alreadyHaveAccount": "لديك حساب بالفعل؟"
  }
}
```

### Using Translations in Components

**Basic Usage:**

```javascript
import { useLanguage } from '../contexts/LanguageContext';

const HomePage = () => {
  const { t } = useLanguage();

  return (
    <div>
      <h1>{t('home.title')}</h1>
      <p>{t('home.subtitle')}</p>
    </div>
  );
};
```

**With Interpolation:**

```javascript
const WelcomeMessage = ({ userName }) => {
  const { t } = useLanguage();

  return <p>{t('welcome.message', { name: userName })}</p>;
};

// translation.json
{
  "welcome": {
    "message": "Welcome, {{name}}!"
  }
}
```

**With Pluralization:**

```javascript
const ItemCount = ({ count }) => {
  const { t } = useLanguage();

  return <p>{t('items.count', { count })}</p>;
};

// translation.json
{
  "items": {
    "count_one": "{{count}} item",
    "count_other": "{{count}} items"
  }
}
```

## RTL Layout Support

### CSS Direction

**Automatic Direction Setting:**

```javascript
// LanguageContext.jsx
document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
```

**Result:**
- Arabic: `<html dir="rtl" lang="ar">`
- English: `<html dir="ltr" lang="en">`

### Tailwind CSS RTL Utilities

**Text Alignment:**

```javascript
<div className="text-left rtl:text-right">
  {content}
</div>
```

**Padding/Margin:**

```javascript
<div className="pl-4 rtl:pr-4 rtl:pl-0">
  {content}
</div>

// Or use logical properties
<div className="ps-4">  // padding-inline-start
  {content}
</div>
```

**Flexbox Direction:**

```javascript
<div className="flex flex-row rtl:flex-row-reverse">
  <div>First</div>
  <div>Second</div>
</div>
```

**Icons and Images:**

```javascript
<ChevronRight className="rtl:rotate-180" />
```

### RTL-Aware Components

**Navigation Menu:**

```javascript
const Navigation = () => {
  const { direction } = useLanguage();

  return (
    <nav className={`flex ${direction === 'rtl' ? 'flex-row-reverse' : 'flex-row'}`}>
      <NavItem />
      <NavItem />
      <NavItem />
    </nav>
  );
};
```

**Form Layout:**

```javascript
const LoginForm = () => {
  return (
    <form className="space-y-4">
      <div className="flex flex-col">
        <label className="text-left rtl:text-right">
          {t('auth.email')}
        </label>
        <input
          type="email"
          className="text-left rtl:text-right"
          dir="auto"  // Auto-detect input direction
        />
      </div>
    </form>
  );
};
```

## Database Content Translation

### Bilingual Content Storage

**Database Schema:**

All content entities store both English and Arabic versions:

```csharp
public class News
{
    public string TitleEn { get; set; }
    public string TitleAr { get; set; }
    public string ContentEn { get; set; }
    public string ContentAr { get; set; }
}
```

**API Response:**

Backend returns both language versions:

```json
{
  "id": "guid",
  "titleEn": "News Title",
  "titleAr": "عنوان الخبر",
  "contentEn": "News content...",
  "contentAr": "محتوى الخبر..."
}
```

### Frontend Language Selection

**Display Based on Current Language:**

```javascript
const NewsCard = ({ news }) => {
  const { language } = useLanguage();

  const title = language === 'ar' ? news.titleAr : news.titleEn;
  const content = language === 'ar' ? news.contentAr : news.contentEn;

  return (
    <div>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};
```

**Helper Function:**

```javascript
const useLocalizedContent = (item) => {
  const { language } = useLanguage();

  return {
    title: language === 'ar' ? item.titleAr : item.titleEn,
    content: language === 'ar' ? item.contentAr : item.contentEn,
    description: language === 'ar' ? item.descriptionAr : item.descriptionEn,
    name: language === 'ar' ? item.nameAr : item.nameEn
  };
};

// Usage
const NewsCard = ({ news }) => {
  const { title, content } = useLocalizedContent(news);

  return (
    <div>
      <h3>{title}</h3>
      <p>{content}</p>
    </div>
  );
};
```

## Language Persistence

**Storage Mechanism:**

```javascript
// Save language preference
localStorage.setItem('language', 'ar');

// Load language preference
const savedLanguage = localStorage.getItem('language') || 'ar';
```

**Initialization Flow:**

1. Check localStorage for saved language
2. If not found, use browser language
3. If browser language not supported, use fallback ('ar')
4. Apply language to i18next
5. Set HTML dir and lang attributes

## Date and Time Localization

**Using Intl API:**

```javascript
const formatDate = (date, language) => {
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

// Usage
const NewsDate = ({ publishedAt }) => {
  const { language } = useLanguage();
  const formattedDate = formatDate(publishedAt, language);

  return <span>{formattedDate}</span>;
};
```

**Number Formatting:**

```javascript
const formatNumber = (number, language) => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(number);
};
```

## Translation Keys Organization

**Naming Convention:**

```
{category}.{subcategory}.{key}
```

**Examples:**

```json
{
  "nav.home": "Home",
  "nav.about": "About",
  "auth.login": "Login",
  "auth.register": "Register",
  "errors.required": "This field is required",
  "errors.invalidEmail": "Invalid email address",
  "buttons.submit": "Submit",
  "buttons.cancel": "Cancel"
}
```

**Benefits:**
- Easy to locate translations
- Prevents key conflicts
- Logical grouping
- Scalable structure

## Code References

**Frontend:**
- i18n Configuration: `client/src/i18n.js`
- Language Context: `client/src/contexts/LanguageContext.jsx`
- English Translations: `client/src/locales/en/translation.json`
- Arabic Translations: `client/src/locales/ar/translation.json`

**Backend:**
- All entities with bilingual fields in `server/Models/Entities/`

## Testing Considerations

**Key Test Scenarios:**
1. Language switching functionality
2. RTL layout rendering
3. Translation key coverage
4. Missing translation fallback
5. Date/time localization
6. Number formatting
7. Dynamic content language selection
8. Persistence across sessions

**Edge Cases:**
- Missing translation keys
- Very long translated text
- Mixed LTR/RTL content
- Special characters in translations
- Pluralization edge cases

## Performance Considerations

- Translation files loaded once on app initialization
- Language change triggers minimal re-renders
- localStorage access is synchronous and fast
- No network requests for translations

## Future Enhancements

- Add more languages (Kurdish, Turkish)
- Implement translation management system
- Add context-aware translations
- Implement translation versioning
- Add translation quality checks
- Implement automatic translation suggestions
- Add translation analytics
- Support for regional dialects
- Implement lazy loading for translation files
- Add translation memory for consistency
