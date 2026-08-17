// Crew job and department translation mappings (EN → TH)
// Used by movie/TV detail pages to display localized crew roles.

const JOB_TRANSLATIONS: Record<string, Record<string, string>> = {
  th: {
    'Director': 'ผู้กำกับ',
    'Director of Photography': 'ผู้กำกับภาพ',
    'Executive Producer': 'ผู้อำนวยการสร้าง',
    'Producer': 'ผู้ผลิต',
    'Co-Producer': 'ผู้ร่วมผลิต',
    'Associate Producer': 'ผู้ช่วยผู้ผลิต',
    'Screenplay': 'บทภาพยนตร์',
    'Writer': 'ผู้เขียน',
    'Story': 'เรื่องราว',
    'Original Music Composer': 'ผู้แต่งเพลงต้นฉบับ',
    'Music': 'ดนตรี',
    'Music Supervisor': 'ผู้ดูแลดนตรี',
    'Editor': 'ตัดต่อ',
    'Production Design': 'ออกแบบงานสร้าง',
    'Art Direction': 'ศิลปกรรม',
    'Costume Design': 'ออกแบบเครื่องแต่งกาย',
    'Casting': 'คัดเลือกนักแสดง',
    'Casting Director': 'ผู้คัดเลือกนักแสดง',
    'Makeup Artist': 'ช่างแต่งหน้า',
    'Visual Effects': 'เอฟเฟกต์ภาพ',
    'Special Effects': 'เอฟเฟกต์พิเศษ',
    'Stunt Coordinator': 'ผู้ประสานงานฉากเสี่ยง',
    'Stunts': 'ฉากเสี่ยง',
    'Camera Operator': 'ช่างกล้อง',
    'Sound Designer': 'ผู้ออกแบบเสียง',
    'Sound Re-Recording Mixer': 'ผู้ผสมเสียง',
    'Supervising Sound Editor': 'ผู้ดูแลตัดเสียง',
    'Foley': 'เสียงประกอบ',
    'Original Film Score': 'เพลงประกอบภาพยนตร์',
    'Dialect Coach': 'ผู้ฝึกสำเนียง',
    'Thanks': 'กิตติกรรมประกาศ',
    'Novel': 'นวนิยาย',
    'Characters': 'ตัวละคร',
    'Comic': 'การ์ตูน',
    'Graphic Novel': 'นวนิยายภาพ',
    'Executive In Charge Of Production': 'ผู้บริหารดูแลงานผลิต',
    'Post Production Supervisor': 'ผู้ดูแลหลังการผลิต',
    'Unit Production Manager': 'ผู้จัดการฝ่ายผลิต',
    'First Assistant Director': 'ผู้กำกับร่วม 1',
    'Second Assistant Director': 'ผู้กำกับร่วม 2',
    'Script Supervisor': 'ผู้ดูแลบท',
    'Transportation Captain': 'หัวหน้าฝ่ายขนส่ง',
    'Production Accountant': 'นักบัญชีฝ่ายผลิต',
    'Location Manager': 'ผู้จัดการสถานที่',
    'Set Decorator': 'ผู้ตกแต่งฉาก',
    'Set Dresser': 'ผู้จัดฉาก',
    'Prop Master': 'ผู้ดูแลอุปกรณ์',
    'Special Effects Supervisor': 'ผู้ดูแลเอฟเฟกต์พิเศษ',
    'Visual Effects Supervisor': 'ผู้ดูแลเอฟเฟกต์ภาพ',
    'Color Timer': 'ผู้ปรับสี',
    'Negative Cutter': 'ผู้ตัดฟิล์ม',
    'Digital Intermediate': 'ดิจิทัลอินเตอร์มีเดีย',
    'Dailies Operator': 'ผู้ดูแลเทปวันต่อวัน',
    'Re-Recording Mixer': 'ผู้ผสมเสียง',
    'Best Boy Electric': 'ผู้ช่วยช่างไฟ (บอย)',
    'Gaffer': 'ช่างไฟ',
    'Key Grip': 'ช่างจับ (คีย์กริป)',
    'Best Boy Grip': 'ผู้ช่วยช่างจับ (บอยกริป)',
    'Dolly Grip': 'ช่างเข็นรถเข็น',
    'Rigging Grip': 'ช่างจับอุปกรณ์',
    'Steadicam Operator': 'ช่างกล้อง steadicam',
    'Still Photographer': 'ช่างภาพนิ่ง',
    'Video Assist Operator': 'ผู้ดูแลวิดีโอช่วย',
    'Special Sound Effects': 'เอฟเฟกต์เสียงพิเศษ',
    'ADR Mixer': 'ผู้ผสมเสียง ADR',
    'ADR Editor': 'ผู้ตัดเสียง ADR',
    'Boom Operator': 'ช่างไมค์ boom',
    'Utility Sound': 'เสียงอเนกประสงค์',
    'Talent Coordinator': 'ผู้ประสานงานนักแสดง',
    'Post-Production Supervisor': 'ผู้ดูแลหลังการผลิต',
    'Co-Director': 'ผู้กำกับร่วม',
    'Assistant Director': 'ผู้ช่วยผู้กำกับ',
    'Line Producer': 'ผู้ผลิตไลน์',
    'Casting Associate': 'ผู้ช่วยคัดเลือกนักแสดง',
  },
  en: {
    // No-op — English is the default display
  },
};

const DEPARTMENT_TRANSLATIONS: Record<string, Record<string, string>> = {
  th: {
    'Directing': 'การกำกับ',
    'Writing': 'การเขียน',
    'Production': 'การผลิต',
    'Sound': 'เสียง',
    'Camera': 'กล้อง',
    'Costume & Make-Up': 'เครื่องแต่งกายและแต่งหน้า',
    'Art': 'ศิลปะ',
    'Editing': 'การตัดต่อ',
    'Visual Effects': 'เอฟเฟกต์ภาพ',
    'Crew': 'ทีมงาน',
    'Lighting': 'แสงสว่าง',
  },
  en: {},
};

export function translateJob(job: string | null, locale: string): string {
  if (!job) return '';
  const map = JOB_TRANSLATIONS[locale];
  return map?.[job] ?? job;
}

export function translateDepartment(department: string | null, locale: string): string {
  if (!department) return '';
  const map = DEPARTMENT_TRANSLATIONS[locale];
  return map?.[department] ?? department;
}

const STATUS_TRANSLATIONS: Record<string, Record<string, string>> = {
  th: {
    'Released': 'เข้าฉายแล้ว',
    'Returning Series': 'กำลังฉาย',
    'Planned': 'วางแผนแล้ว',
    'In Production': 'กำลังผลิต',
    'Post Production': 'หลังการผลิต',
    'Canceled': 'ยกเลิก',
    'Rumored': 'มีข่าวลือ',
  },
  en: {},
};

export function translateStatus(status: string | null, locale: string): string {
  if (!status) return '—';
  const map = STATUS_TRANSLATIONS[locale];
  return map?.[status] ?? status;
}
