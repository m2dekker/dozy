export type Language = 'en' | 'th';

export interface Translations {
  // Header
  title: string;
  subtitle: string;

  // Form
  cloneNameLabel: string;
  cloneNamePlaceholder: string;
  destinationLabel: string;
  destinationPlaceholder: string;
  sendCloneButton: string;

  // Errors
  errorCloneName: string;
  errorDestination: string;

  // Sections
  travelingClones: string;
  arrivedClones: string;
  arrivesIn: string;

  // Categories
  local: string;
  regional: string;
  international: string;
  intercontinental: string;

  // Buttons
  cancel: string;
  viewMessage: string;
  dismiss: string;
  close: string;
  dismissClone: string;

  // Modal
  arrivedTitle: string;

  // Info box
  howItWorks: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step5: string;

  // Footer
  footer: string;

  // Status
  arrived: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header
    title: '🛫 AI Clone Traveler',
    subtitle: 'Create and send AI clones on adventures around the world',

    // Form
    cloneNameLabel: 'Clone Name',
    cloneNamePlaceholder: 'e.g., Explorer Mike, Travel Sarah...',
    destinationLabel: 'Destination',
    destinationPlaceholder: 'e.g., Thailand, Paris, Tokyo...',
    sendCloneButton: 'Send Clone 🚀',

    // Errors
    errorCloneName: 'Please enter a clone name',
    errorDestination: 'Please enter a destination',

    // Sections
    travelingClones: '✈️ Traveling Clones',
    arrivedClones: '🎉 Arrived Clones',
    arrivesIn: 'Arrives in',

    // Categories
    local: 'local',
    regional: 'regional',
    international: 'international',
    intercontinental: 'intercontinental',

    // Buttons
    cancel: 'Cancel',
    viewMessage: 'View Message',
    dismiss: 'Dismiss',
    close: 'Close',
    dismissClone: 'Dismiss Clone',

    // Modal
    arrivedTitle: 'Arrived!',

    // Info box
    howItWorks: '💡 How it works:',
    step1: 'Give your clone a name',
    step2: 'Choose a destination',
    step3: 'Your clone will travel there (simulated time)',
    step4: 'Get a unique AI-generated arrival message',
    step5: 'Create multiple clones and send them everywhere!',

    // Footer
    footer: 'Powered by Claude AI • Travel times simulated for demo',

    // Status
    arrived: '✓ Arrived',
  },
  th: {
    // Header
    title: '🛫 โคลนเอไอท่องเที่ยว',
    subtitle: 'สร้างและส่งโคลน AI ไปผจญภัยทั่วโลก',

    // Form
    cloneNameLabel: 'ชื่อโคลน',
    cloneNamePlaceholder: 'เช่น ไมค์นักผจญภัย, ซาร่านักเดินทาง...',
    destinationLabel: 'จุดหมายปลายทาง',
    destinationPlaceholder: 'เช่น ไทย, ปารีส, โตเกียว...',
    sendCloneButton: 'ส่งโคลน 🚀',

    // Errors
    errorCloneName: 'กรุณาใส่ชื่อโคลน',
    errorDestination: 'กรุณาใส่จุดหมายปลายทาง',

    // Sections
    travelingClones: '✈️ โคลนที่กำลังเดินทาง',
    arrivedClones: '🎉 โคลนที่มาถึงแล้ว',
    arrivesIn: 'จะมาถึงใน',

    // Categories
    local: 'ท้องถิ่น',
    regional: 'ภูมิภาค',
    international: 'ต่างประเทศ',
    intercontinental: 'ข้ามทวีป',

    // Buttons
    cancel: 'ยกเลิก',
    viewMessage: 'ดูข้อความ',
    dismiss: 'ปิด',
    close: 'ปิด',
    dismissClone: 'ปิดโคลน',

    // Modal
    arrivedTitle: 'มาถึงแล้ว!',

    // Info box
    howItWorks: '💡 วิธีการใช้งาน:',
    step1: 'ตั้งชื่อให้โคลนของคุณ',
    step2: 'เลือกจุดหมายปลายทาง',
    step3: 'โคลนของคุณจะเดินทางไปที่นั่น (เวลาจำลอง)',
    step4: 'รับข้อความมาถึงที่สร้างโดย AI ที่ไม่ซ้ำใคร',
    step5: 'สร้างหลายโคลนและส่งพวกเขาไปทุกที่!',

    // Footer
    footer: 'ขับเคลื่อนโดย Claude AI • เวลาเดินทางจำลองเพื่อการสาธิต',

    // Status
    arrived: '✓ มาถึงแล้ว',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function saveLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
}

export function getLanguage(): Language {
  if (typeof window === 'undefined') return 'en';

  const stored = localStorage.getItem('language');
  if (stored === 'th' || stored === 'en') {
    return stored;
  }

  return 'en';
}
