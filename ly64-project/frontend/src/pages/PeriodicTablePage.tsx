import { useState } from 'react';

import { Header } from '../components/Header';

interface Element {
  number: number;
  symbol: string;
  name: string;
  nameRu: string;
  mass: string;
  category: string;
  group: number;
  period: number;
  electron: string;
  discovered: string;
}

const CATEGORIES: Record<string, { color: string; name: string }> = {
  alkali: { color: '#ef4444', name: 'Щелочные металлы' },
  alkaline: { color: '#f97316', name: 'Щёлочноземельные' },
  transition: { color: '#eab308', name: 'Переходные металлы' },
  'post-transition': { color: '#84cc16', name: 'Постпереходные' },
  metalloid: { color: '#22c55e', name: 'Полуметаллы' },
  nonmetal: { color: '#14b8a6', name: 'Неметаллы' },
  halogen: { color: '#06b6d4', name: 'Галогены' },
  noble: { color: '#8b5cf6', name: 'Благородные газы' },
  lanthanide: { color: '#ec4899', name: 'Лантаноиды' },
  actinide: { color: '#f43f5e', name: 'Актиноиды' },
};

const ELEMENTS: Element[] = [
  {
    number: 1,
    symbol: 'H',
    name: 'Hydrogen',
    nameRu: 'Водород',
    mass: '1.008',
    category: 'nonmetal',
    group: 1,
    period: 1,
    electron: '1s¹',
    discovered: '1766',
  },
  {
    number: 2,
    symbol: 'He',
    name: 'Helium',
    nameRu: 'Гелий',
    mass: '4.003',
    category: 'noble',
    group: 18,
    period: 1,
    electron: '1s²',
    discovered: '1868',
  },
  {
    number: 3,
    symbol: 'Li',
    name: 'Lithium',
    nameRu: 'Литий',
    mass: '6.941',
    category: 'alkali',
    group: 1,
    period: 2,
    electron: '[He] 2s¹',
    discovered: '1817',
  },
  {
    number: 4,
    symbol: 'Be',
    name: 'Beryllium',
    nameRu: 'Бериллий',
    mass: '9.012',
    category: 'alkaline',
    group: 2,
    period: 2,
    electron: '[He] 2s²',
    discovered: '1798',
  },
  {
    number: 5,
    symbol: 'B',
    name: 'Boron',
    nameRu: 'Бор',
    mass: '10.81',
    category: 'metalloid',
    group: 13,
    period: 2,
    electron: '[He] 2s² 2p¹',
    discovered: '1808',
  },
  {
    number: 6,
    symbol: 'C',
    name: 'Carbon',
    nameRu: 'Углерод',
    mass: '12.01',
    category: 'nonmetal',
    group: 14,
    period: 2,
    electron: '[He] 2s² 2p²',
    discovered: 'древность',
  },
  {
    number: 7,
    symbol: 'N',
    name: 'Nitrogen',
    nameRu: 'Азот',
    mass: '14.01',
    category: 'nonmetal',
    group: 15,
    period: 2,
    electron: '[He] 2s² 2p³',
    discovered: '1772',
  },
  {
    number: 8,
    symbol: 'O',
    name: 'Oxygen',
    nameRu: 'Кислород',
    mass: '16.00',
    category: 'nonmetal',
    group: 16,
    period: 2,
    electron: '[He] 2s² 2p⁴',
    discovered: '1774',
  },
  {
    number: 9,
    symbol: 'F',
    name: 'Fluorine',
    nameRu: 'Фтор',
    mass: '19.00',
    category: 'halogen',
    group: 17,
    period: 2,
    electron: '[He] 2s² 2p⁵',
    discovered: '1886',
  },
  {
    number: 10,
    symbol: 'Ne',
    name: 'Neon',
    nameRu: 'Неон',
    mass: '20.18',
    category: 'noble',
    group: 18,
    period: 2,
    electron: '[He] 2s² 2p⁶',
    discovered: '1898',
  },
  {
    number: 11,
    symbol: 'Na',
    name: 'Sodium',
    nameRu: 'Натрий',
    mass: '22.99',
    category: 'alkali',
    group: 1,
    period: 3,
    electron: '[Ne] 3s¹',
    discovered: '1807',
  },
  {
    number: 12,
    symbol: 'Mg',
    name: 'Magnesium',
    nameRu: 'Магний',
    mass: '24.31',
    category: 'alkaline',
    group: 2,
    period: 3,
    electron: '[Ne] 3s²',
    discovered: '1755',
  },
  {
    number: 13,
    symbol: 'Al',
    name: 'Aluminium',
    nameRu: 'Алюминий',
    mass: '26.98',
    category: 'post-transition',
    group: 13,
    period: 3,
    electron: '[Ne] 3s² 3p¹',
    discovered: '1825',
  },
  {
    number: 14,
    symbol: 'Si',
    name: 'Silicon',
    nameRu: 'Кремний',
    mass: '28.09',
    category: 'metalloid',
    group: 14,
    period: 3,
    electron: '[Ne] 3s² 3p²',
    discovered: '1824',
  },
  {
    number: 15,
    symbol: 'P',
    name: 'Phosphorus',
    nameRu: 'Фосфор',
    mass: '30.97',
    category: 'nonmetal',
    group: 15,
    period: 3,
    electron: '[Ne] 3s² 3p³',
    discovered: '1669',
  },
  {
    number: 16,
    symbol: 'S',
    name: 'Sulfur',
    nameRu: 'Сера',
    mass: '32.07',
    category: 'nonmetal',
    group: 16,
    period: 3,
    electron: '[Ne] 3s² 3p⁴',
    discovered: 'древность',
  },
  {
    number: 17,
    symbol: 'Cl',
    name: 'Chlorine',
    nameRu: 'Хлор',
    mass: '35.45',
    category: 'halogen',
    group: 17,
    period: 3,
    electron: '[Ne] 3s² 3p⁵',
    discovered: '1774',
  },
  {
    number: 18,
    symbol: 'Ar',
    name: 'Argon',
    nameRu: 'Аргон',
    mass: '39.95',
    category: 'noble',
    group: 18,
    period: 3,
    electron: '[Ne] 3s² 3p⁶',
    discovered: '1894',
  },
  {
    number: 19,
    symbol: 'K',
    name: 'Potassium',
    nameRu: 'Калий',
    mass: '39.10',
    category: 'alkali',
    group: 1,
    period: 4,
    electron: '[Ar] 4s¹',
    discovered: '1807',
  },
  {
    number: 20,
    symbol: 'Ca',
    name: 'Calcium',
    nameRu: 'Кальций',
    mass: '40.08',
    category: 'alkaline',
    group: 2,
    period: 4,
    electron: '[Ar] 4s²',
    discovered: '1808',
  },
  {
    number: 21,
    symbol: 'Sc',
    name: 'Scandium',
    nameRu: 'Скандий',
    mass: '44.96',
    category: 'transition',
    group: 3,
    period: 4,
    electron: '[Ar] 3d¹ 4s²',
    discovered: '1879',
  },
  {
    number: 22,
    symbol: 'Ti',
    name: 'Titanium',
    nameRu: 'Титан',
    mass: '47.87',
    category: 'transition',
    group: 4,
    period: 4,
    electron: '[Ar] 3d² 4s²',
    discovered: '1791',
  },
  {
    number: 23,
    symbol: 'V',
    name: 'Vanadium',
    nameRu: 'Ванадий',
    mass: '50.94',
    category: 'transition',
    group: 5,
    period: 4,
    electron: '[Ar] 3d³ 4s²',
    discovered: '1801',
  },
  {
    number: 24,
    symbol: 'Cr',
    name: 'Chromium',
    nameRu: 'Хром',
    mass: '52.00',
    category: 'transition',
    group: 6,
    period: 4,
    electron: '[Ar] 3d⁵ 4s¹',
    discovered: '1797',
  },
  {
    number: 25,
    symbol: 'Mn',
    name: 'Manganese',
    nameRu: 'Марганец',
    mass: '54.94',
    category: 'transition',
    group: 7,
    period: 4,
    electron: '[Ar] 3d⁵ 4s²',
    discovered: '1774',
  },
  {
    number: 26,
    symbol: 'Fe',
    name: 'Iron',
    nameRu: 'Железо',
    mass: '55.85',
    category: 'transition',
    group: 8,
    period: 4,
    electron: '[Ar] 3d⁶ 4s²',
    discovered: 'древность',
  },
  {
    number: 27,
    symbol: 'Co',
    name: 'Cobalt',
    nameRu: 'Кобальт',
    mass: '58.93',
    category: 'transition',
    group: 9,
    period: 4,
    electron: '[Ar] 3d⁷ 4s²',
    discovered: '1735',
  },
  {
    number: 28,
    symbol: 'Ni',
    name: 'Nickel',
    nameRu: 'Никель',
    mass: '58.69',
    category: 'transition',
    group: 10,
    period: 4,
    electron: '[Ar] 3d⁸ 4s²',
    discovered: '1751',
  },
  {
    number: 29,
    symbol: 'Cu',
    name: 'Copper',
    nameRu: 'Медь',
    mass: '63.55',
    category: 'transition',
    group: 11,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s¹',
    discovered: 'древность',
  },
  {
    number: 30,
    symbol: 'Zn',
    name: 'Zinc',
    nameRu: 'Цинк',
    mass: '65.38',
    category: 'transition',
    group: 12,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s²',
    discovered: '1746',
  },
  {
    number: 31,
    symbol: 'Ga',
    name: 'Gallium',
    nameRu: 'Галлий',
    mass: '69.72',
    category: 'post-transition',
    group: 13,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s² 4p¹',
    discovered: '1875',
  },
  {
    number: 32,
    symbol: 'Ge',
    name: 'Germanium',
    nameRu: 'Германий',
    mass: '72.63',
    category: 'metalloid',
    group: 14,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s² 4p²',
    discovered: '1886',
  },
  {
    number: 33,
    symbol: 'As',
    name: 'Arsenic',
    nameRu: 'Мышьяк',
    mass: '74.92',
    category: 'metalloid',
    group: 15,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s² 4p³',
    discovered: '1250',
  },
  {
    number: 34,
    symbol: 'Se',
    name: 'Selenium',
    nameRu: 'Селен',
    mass: '78.97',
    category: 'nonmetal',
    group: 16,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s² 4p⁴',
    discovered: '1817',
  },
  {
    number: 35,
    symbol: 'Br',
    name: 'Bromine',
    nameRu: 'Бром',
    mass: '79.90',
    category: 'halogen',
    group: 17,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s² 4p⁵',
    discovered: '1826',
  },
  {
    number: 36,
    symbol: 'Kr',
    name: 'Krypton',
    nameRu: 'Криптон',
    mass: '83.80',
    category: 'noble',
    group: 18,
    period: 4,
    electron: '[Ar] 3d¹⁰ 4s² 4p⁶',
    discovered: '1898',
  },
  {
    number: 37,
    symbol: 'Rb',
    name: 'Rubidium',
    nameRu: 'Рубидий',
    mass: '85.47',
    category: 'alkali',
    group: 1,
    period: 5,
    electron: '[Kr] 5s¹',
    discovered: '1861',
  },
  {
    number: 38,
    symbol: 'Sr',
    name: 'Strontium',
    nameRu: 'Стронций',
    mass: '87.62',
    category: 'alkaline',
    group: 2,
    period: 5,
    electron: '[Kr] 5s²',
    discovered: '1790',
  },
  {
    number: 39,
    symbol: 'Y',
    name: 'Yttrium',
    nameRu: 'Иттрий',
    mass: '88.91',
    category: 'transition',
    group: 3,
    period: 5,
    electron: '[Kr] 4d¹ 5s²',
    discovered: '1794',
  },
  {
    number: 40,
    symbol: 'Zr',
    name: 'Zirconium',
    nameRu: 'Цирконий',
    mass: '91.22',
    category: 'transition',
    group: 4,
    period: 5,
    electron: '[Kr] 4d² 5s²',
    discovered: '1789',
  },
  {
    number: 41,
    symbol: 'Nb',
    name: 'Niobium',
    nameRu: 'Ниобий',
    mass: '92.91',
    category: 'transition',
    group: 5,
    period: 5,
    electron: '[Kr] 4d⁴ 5s¹',
    discovered: '1801',
  },
  {
    number: 42,
    symbol: 'Mo',
    name: 'Molybdenum',
    nameRu: 'Молибден',
    mass: '95.95',
    category: 'transition',
    group: 6,
    period: 5,
    electron: '[Kr] 4d⁵ 5s¹',
    discovered: '1781',
  },
  {
    number: 43,
    symbol: 'Tc',
    name: 'Technetium',
    nameRu: 'Технеций',
    mass: '(98)',
    category: 'transition',
    group: 7,
    period: 5,
    electron: '[Kr] 4d⁵ 5s²',
    discovered: '1937',
  },
  {
    number: 44,
    symbol: 'Ru',
    name: 'Ruthenium',
    nameRu: 'Рутений',
    mass: '101.1',
    category: 'transition',
    group: 8,
    period: 5,
    electron: '[Kr] 4d⁷ 5s¹',
    discovered: '1844',
  },
  {
    number: 45,
    symbol: 'Rh',
    name: 'Rhodium',
    nameRu: 'Родий',
    mass: '102.9',
    category: 'transition',
    group: 9,
    period: 5,
    electron: '[Kr] 4d⁸ 5s¹',
    discovered: '1803',
  },
  {
    number: 46,
    symbol: 'Pd',
    name: 'Palladium',
    nameRu: 'Палладий',
    mass: '106.4',
    category: 'transition',
    group: 10,
    period: 5,
    electron: '[Kr] 4d¹⁰',
    discovered: '1803',
  },
  {
    number: 47,
    symbol: 'Ag',
    name: 'Silver',
    nameRu: 'Серебро',
    mass: '107.9',
    category: 'transition',
    group: 11,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s¹',
    discovered: 'древность',
  },
  {
    number: 48,
    symbol: 'Cd',
    name: 'Cadmium',
    nameRu: 'Кадмий',
    mass: '112.4',
    category: 'transition',
    group: 12,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s²',
    discovered: '1817',
  },
  {
    number: 49,
    symbol: 'In',
    name: 'Indium',
    nameRu: 'Индий',
    mass: '114.8',
    category: 'post-transition',
    group: 13,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s² 5p¹',
    discovered: '1863',
  },
  {
    number: 50,
    symbol: 'Sn',
    name: 'Tin',
    nameRu: 'Олово',
    mass: '118.7',
    category: 'post-transition',
    group: 14,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s² 5p²',
    discovered: 'древность',
  },
  {
    number: 51,
    symbol: 'Sb',
    name: 'Antimony',
    nameRu: 'Сурьма',
    mass: '121.8',
    category: 'metalloid',
    group: 15,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s² 5p³',
    discovered: 'древность',
  },
  {
    number: 52,
    symbol: 'Te',
    name: 'Tellurium',
    nameRu: 'Теллур',
    mass: '127.6',
    category: 'metalloid',
    group: 16,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s² 5p⁴',
    discovered: '1783',
  },
  {
    number: 53,
    symbol: 'I',
    name: 'Iodine',
    nameRu: 'Йод',
    mass: '126.9',
    category: 'halogen',
    group: 17,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s² 5p⁵',
    discovered: '1811',
  },
  {
    number: 54,
    symbol: 'Xe',
    name: 'Xenon',
    nameRu: 'Ксенон',
    mass: '131.3',
    category: 'noble',
    group: 18,
    period: 5,
    electron: '[Kr] 4d¹⁰ 5s² 5p⁶',
    discovered: '1898',
  },
  {
    number: 55,
    symbol: 'Cs',
    name: 'Caesium',
    nameRu: 'Цезий',
    mass: '132.9',
    category: 'alkali',
    group: 1,
    period: 6,
    electron: '[Xe] 6s¹',
    discovered: '1860',
  },
  {
    number: 56,
    symbol: 'Ba',
    name: 'Barium',
    nameRu: 'Барий',
    mass: '137.3',
    category: 'alkaline',
    group: 2,
    period: 6,
    electron: '[Xe] 6s²',
    discovered: '1808',
  },
  {
    number: 72,
    symbol: 'Hf',
    name: 'Hafnium',
    nameRu: 'Гафний',
    mass: '178.5',
    category: 'transition',
    group: 4,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d² 6s²',
    discovered: '1923',
  },
  {
    number: 73,
    symbol: 'Ta',
    name: 'Tantalum',
    nameRu: 'Тантал',
    mass: '180.9',
    category: 'transition',
    group: 5,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d³ 6s²',
    discovered: '1802',
  },
  {
    number: 74,
    symbol: 'W',
    name: 'Tungsten',
    nameRu: 'Вольфрам',
    mass: '183.8',
    category: 'transition',
    group: 6,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d⁴ 6s²',
    discovered: '1783',
  },
  {
    number: 75,
    symbol: 'Re',
    name: 'Rhenium',
    nameRu: 'Рений',
    mass: '186.2',
    category: 'transition',
    group: 7,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d⁵ 6s²',
    discovered: '1925',
  },
  {
    number: 76,
    symbol: 'Os',
    name: 'Osmium',
    nameRu: 'Осмий',
    mass: '190.2',
    category: 'transition',
    group: 8,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d⁶ 6s²',
    discovered: '1803',
  },
  {
    number: 77,
    symbol: 'Ir',
    name: 'Iridium',
    nameRu: 'Иридий',
    mass: '192.2',
    category: 'transition',
    group: 9,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d⁷ 6s²',
    discovered: '1803',
  },
  {
    number: 78,
    symbol: 'Pt',
    name: 'Platinum',
    nameRu: 'Платина',
    mass: '195.1',
    category: 'transition',
    group: 10,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d⁹ 6s¹',
    discovered: '1735',
  },
  {
    number: 79,
    symbol: 'Au',
    name: 'Gold',
    nameRu: 'Золото',
    mass: '197.0',
    category: 'transition',
    group: 11,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    discovered: 'древность',
  },
  {
    number: 80,
    symbol: 'Hg',
    name: 'Mercury',
    nameRu: 'Ртуть',
    mass: '200.6',
    category: 'transition',
    group: 12,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s²',
    discovered: 'древность',
  },
  {
    number: 81,
    symbol: 'Tl',
    name: 'Thallium',
    nameRu: 'Таллий',
    mass: '204.4',
    category: 'post-transition',
    group: 13,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹',
    discovered: '1861',
  },
  {
    number: 82,
    symbol: 'Pb',
    name: 'Lead',
    nameRu: 'Свинец',
    mass: '207.2',
    category: 'post-transition',
    group: 14,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²',
    discovered: 'древность',
  },
  {
    number: 83,
    symbol: 'Bi',
    name: 'Bismuth',
    nameRu: 'Висмут',
    mass: '209.0',
    category: 'post-transition',
    group: 15,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³',
    discovered: '1753',
  },
  {
    number: 84,
    symbol: 'Po',
    name: 'Polonium',
    nameRu: 'Полоний',
    mass: '(209)',
    category: 'metalloid',
    group: 16,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴',
    discovered: '1898',
  },
  {
    number: 85,
    symbol: 'At',
    name: 'Astatine',
    nameRu: 'Астат',
    mass: '(210)',
    category: 'halogen',
    group: 17,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵',
    discovered: '1940',
  },
  {
    number: 86,
    symbol: 'Rn',
    name: 'Radon',
    nameRu: 'Радон',
    mass: '(222)',
    category: 'noble',
    group: 18,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶',
    discovered: '1900',
  },
  {
    number: 87,
    symbol: 'Fr',
    name: 'Francium',
    nameRu: 'Франций',
    mass: '(223)',
    category: 'alkali',
    group: 1,
    period: 7,
    electron: '[Rn] 7s¹',
    discovered: '1939',
  },
  {
    number: 88,
    symbol: 'Ra',
    name: 'Radium',
    nameRu: 'Радий',
    mass: '(226)',
    category: 'alkaline',
    group: 2,
    period: 7,
    electron: '[Rn] 7s²',
    discovered: '1898',
  },
  // Лантаноиды
  {
    number: 57,
    symbol: 'La',
    name: 'Lanthanum',
    nameRu: 'Лантан',
    mass: '138.9',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 5d¹ 6s²',
    discovered: '1839',
  },
  {
    number: 58,
    symbol: 'Ce',
    name: 'Cerium',
    nameRu: 'Церий',
    mass: '140.1',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹ 5d¹ 6s²',
    discovered: '1803',
  },
  {
    number: 59,
    symbol: 'Pr',
    name: 'Praseodymium',
    nameRu: 'Празеодим',
    mass: '140.9',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f³ 6s²',
    discovered: '1885',
  },
  {
    number: 60,
    symbol: 'Nd',
    name: 'Neodymium',
    nameRu: 'Неодим',
    mass: '144.2',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f⁴ 6s²',
    discovered: '1885',
  },
  {
    number: 61,
    symbol: 'Pm',
    name: 'Promethium',
    nameRu: 'Прометий',
    mass: '(145)',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f⁵ 6s²',
    discovered: '1945',
  },
  {
    number: 62,
    symbol: 'Sm',
    name: 'Samarium',
    nameRu: 'Самарий',
    mass: '150.4',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f⁶ 6s²',
    discovered: '1879',
  },
  {
    number: 63,
    symbol: 'Eu',
    name: 'Europium',
    nameRu: 'Европий',
    mass: '152.0',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f⁷ 6s²',
    discovered: '1901',
  },
  {
    number: 64,
    symbol: 'Gd',
    name: 'Gadolinium',
    nameRu: 'Гадолиний',
    mass: '157.3',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f⁷ 5d¹ 6s²',
    discovered: '1880',
  },
  {
    number: 65,
    symbol: 'Tb',
    name: 'Terbium',
    nameRu: 'Тербий',
    mass: '158.9',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f⁹ 6s²',
    discovered: '1843',
  },
  {
    number: 66,
    symbol: 'Dy',
    name: 'Dysprosium',
    nameRu: 'Диспрозий',
    mass: '162.5',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹⁰ 6s²',
    discovered: '1886',
  },
  {
    number: 67,
    symbol: 'Ho',
    name: 'Holmium',
    nameRu: 'Гольмий',
    mass: '164.9',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹¹ 6s²',
    discovered: '1878',
  },
  {
    number: 68,
    symbol: 'Er',
    name: 'Erbium',
    nameRu: 'Эрбий',
    mass: '167.3',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹² 6s²',
    discovered: '1843',
  },
  {
    number: 69,
    symbol: 'Tm',
    name: 'Thulium',
    nameRu: 'Тулий',
    mass: '168.9',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹³ 6s²',
    discovered: '1879',
  },
  {
    number: 70,
    symbol: 'Yb',
    name: 'Ytterbium',
    nameRu: 'Иттербий',
    mass: '173.0',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹⁴ 6s²',
    discovered: '1878',
  },
  {
    number: 71,
    symbol: 'Lu',
    name: 'Lutetium',
    nameRu: 'Лютеций',
    mass: '175.0',
    category: 'lanthanide',
    group: 3,
    period: 6,
    electron: '[Xe] 4f¹⁴ 5d¹ 6s²',
    discovered: '1907',
  },
  // Актиноиды
  {
    number: 89,
    symbol: 'Ac',
    name: 'Actinium',
    nameRu: 'Актиний',
    mass: '(227)',
    category: 'actinide',
    group: 3,
    period: 7,
    electron: '[Rn] 6d¹ 7s²',
    discovered: '1899',
  },
  {
    number: 90,
    symbol: 'Th',
    name: 'Thorium',
    nameRu: 'Торий',
    mass: '232.0',
    category: 'actinide',
    group: 3,
    period: 7,
    electron: '[Rn] 6d² 7s²',
    discovered: '1829',
  },
  {
    number: 91,
    symbol: 'Pa',
    name: 'Protactinium',
    nameRu: 'Протактиний',
    mass: '231.0',
    category: 'actinide',
    group: 3,
    period: 7,
    electron: '[Rn] 5f² 6d¹ 7s²',
    discovered: '1913',
  },
  {
    number: 92,
    symbol: 'U',
    name: 'Uranium',
    nameRu: 'Уран',
    mass: '238.0',
    category: 'actinide',
    group: 3,
    period: 7,
    electron: '[Rn] 5f³ 6d¹ 7s²',
    discovered: '1789',
  },
];

function PeriodicTablePage() {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getElementPosition = (el: Element): { gridColumn: number; gridRow: number } | null => {
    // Лантаноиды
    if (el.number >= 57 && el.number <= 71) {
      return { gridColumn: el.number - 57 + 4, gridRow: 9 };
    }
    // Актиноиды
    if (el.number >= 89 && el.number <= 103) {
      return { gridColumn: el.number - 89 + 4, gridRow: 10 };
    }
    return { gridColumn: el.group, gridRow: el.period };
  };

  const filteredElements = searchQuery
    ? ELEMENTS.filter(
        el =>
          el.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
          el.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          el.number.toString() === searchQuery
      )
    : ELEMENTS;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-30" />

        <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Таблица Менделеева
            </h1>
            <p className="text-gray-400">Нажмите на элемент для подробной информации</p>
          </div>

          {/* Поиск */}
          <div className="max-w-md mx-auto mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск элемента..."
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Легенда */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {Object.entries(CATEGORIES).map(([key, { color, name }]) => (
              <div key={key} className="flex items-center gap-1 text-xs">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                <span className="text-gray-400">{name}</span>
              </div>
            ))}
          </div>

          {/* Таблица */}
          <div className="overflow-x-auto pb-4">
            <div
              className="grid gap-1 min-w-[900px]"
              style={{
                gridTemplateColumns: 'repeat(18, minmax(48px, 1fr))',
                gridTemplateRows: 'repeat(10, minmax(48px, auto))',
              }}
            >
              {filteredElements.map(el => {
                const pos = getElementPosition(el);
                if (!pos) return null;

                const isHighlighted =
                  searchQuery &&
                  (el.nameRu.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    el.symbol.toLowerCase().includes(searchQuery.toLowerCase()));

                return (
                  <div
                    key={el.number}
                    onClick={() => setSelectedElement(el)}
                    className={`relative p-1 rounded cursor-pointer transition-all hover:scale-110 hover:z-10 ${
                      isHighlighted ? 'ring-2 ring-white' : ''
                    } ${selectedElement?.number === el.number ? 'ring-2 ring-cyan-400' : ''}`}
                    style={{
                      gridColumn: pos.gridColumn,
                      gridRow: pos.gridRow,
                      backgroundColor: CATEGORIES[el.category]?.color || '#666',
                    }}
                  >
                    <div className="text-[10px] text-white/70">{el.number}</div>
                    <div className="text-lg font-bold text-white text-center leading-none">
                      {el.symbol}
                    </div>
                    <div className="text-[8px] text-white/70 text-center truncate">{el.mass}</div>
                  </div>
                );
              })}

              {/* Метки лантаноидов и актиноидов */}
              <div
                className="flex items-center justify-center text-xs text-gray-500"
                style={{ gridColumn: 3, gridRow: 6 }}
              >
                57-71 →
              </div>
              <div
                className="flex items-center justify-center text-xs text-gray-500"
                style={{ gridColumn: 3, gridRow: 7 }}
              >
                89-103 →
              </div>
            </div>
          </div>

          {/* Информация о выбранном элементе */}
          {selectedElement && (
            <div className="mt-8 max-w-2xl mx-auto bg-gray-900/80 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-start gap-6">
                <div
                  className="w-24 h-24 rounded-xl flex flex-col items-center justify-center"
                  style={{ backgroundColor: CATEGORIES[selectedElement.category]?.color }}
                >
                  <span className="text-sm text-white/70">{selectedElement.number}</span>
                  <span className="text-4xl font-bold text-white">{selectedElement.symbol}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{selectedElement.nameRu}</h2>
                  <p className="text-gray-400">{selectedElement.name}</p>
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Атомная масса:</span>
                      <span className="text-white ml-2">{selectedElement.mass}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Категория:</span>
                      <span className="text-white ml-2">
                        {CATEGORIES[selectedElement.category]?.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Электронная конфигурация:</span>
                      <span className="text-white ml-2">{selectedElement.electron}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Открыт:</span>
                      <span className="text-white ml-2">{selectedElement.discovered}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Группа:</span>
                      <span className="text-white ml-2">{selectedElement.group}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Период:</span>
                      <span className="text-white ml-2">{selectedElement.period}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}

export default PeriodicTablePage;
