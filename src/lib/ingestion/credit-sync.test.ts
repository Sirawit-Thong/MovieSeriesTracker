import {describe, it, expect} from 'vitest';
import {isThaiOrEnglishTitle} from './credit-sync';

describe('isThaiOrEnglishTitle', () => {
  it('should return true for Thai titles', () => {
    expect(isThaiOrEnglishTitle('อเวนเจอร์ส: เผด็จศึก')).toBe(true);
    expect(isThaiOrEnglishTitle('ชนชั้นปรสิต')).toBe(true);
    expect(isThaiOrEnglishTitle('บุพเพสันนิวาส 2')).toBe(true);
    expect(isThaiOrEnglishTitle('เพื่อนสนิท (2005)')).toBe(true);
  });

  it('should return true for English / Latin titles', () => {
    expect(isThaiOrEnglishTitle('Avengers: Endgame')).toBe(true);
    expect(isThaiOrEnglishTitle('Spider-Man: No Way Home')).toBe(true);
    expect(isThaiOrEnglishTitle('Inception (2010)')).toBe(true);
    expect(isThaiOrEnglishTitle('1917')).toBe(true);
    expect(isThaiOrEnglishTitle('Fast & Furious 9')).toBe(true);
    expect(isThaiOrEnglishTitle('Amélie')).toBe(true);
  });

  it('should return false for Chinese titles without Thai', () => {
    expect(isThaiOrEnglishTitle('流浪地球')).toBe(false);
    expect(isThaiOrEnglishTitle('陈情令')).toBe(false);
    expect(isThaiOrEnglishTitle('卧虎藏龙')).toBe(false);
  });

  it('should return false for Korean titles without Thai', () => {
    expect(isThaiOrEnglishTitle('기생충')).toBe(false);
    expect(isThaiOrEnglishTitle('오징어 เกม')).toBe(true);
    expect(isThaiOrEnglishTitle('오징어 게임')).toBe(false);
    expect(isThaiOrEnglishTitle('도깨비')).toBe(false);
  });

  it('should return false for Japanese titles without Thai', () => {
    expect(isThaiOrEnglishTitle('君の名は。')).toBe(false);
    expect(isThaiOrEnglishTitle('鬼滅の刃')).toBe(false);
    expect(isThaiOrEnglishTitle('千と千尋の神隠し')).toBe(false);
  });

  it('should return false for Cyrillic or Arabic without Thai', () => {
    expect(isThaiOrEnglishTitle('Сталкер')).toBe(false);
    expect(isThaiOrEnglishTitle('الرسالة')).toBe(false);
  });

  it('should return false for empty or null strings', () => {
    expect(isThaiOrEnglishTitle('')).toBe(false);
    expect(isThaiOrEnglishTitle('   ')).toBe(false);
    expect(isThaiOrEnglishTitle(null)).toBe(false);
    expect(isThaiOrEnglishTitle(undefined)).toBe(false);
  });
});
