import { useState } from 'react';

import { Header } from '../components/Header';

interface UnitCategory {
  name: string;
  icon: string;
  units: { id: string; name: string; toBase: number }[];
}

const CATEGORIES: Record<string, UnitCategory> = {
  length: {
    name: 'Длина',
    icon: '📏',
    units: [
      { id: 'mm', name: 'Миллиметры (мм)', toBase: 0.001 },
      { id: 'cm', name: 'Сантиметры (см)', toBase: 0.01 },
      { id: 'dm', name: 'Дециметры (дм)', toBase: 0.1 },
      { id: 'm', name: 'Метры (м)', toBase: 1 },
      { id: 'km', name: 'Километры (км)', toBase: 1000 },
      { id: 'in', name: 'Дюймы (in)', toBase: 0.0254 },
      { id: 'ft', name: 'Футы (ft)', toBase: 0.3048 },
      { id: 'mi', name: 'Мили (mi)', toBase: 1609.344 },
    ],
  },
  mass: {
    name: 'Масса',
    icon: '⚖️',
    units: [
      { id: 'mg', name: 'Миллиграммы (мг)', toBase: 0.000001 },
      { id: 'g', name: 'Граммы (г)', toBase: 0.001 },
      { id: 'kg', name: 'Килограммы (кг)', toBase: 1 },
      { id: 't', name: 'Тонны (т)', toBase: 1000 },
      { id: 'oz', name: 'Унции (oz)', toBase: 0.0283495 },
      { id: 'lb', name: 'Фунты (lb)', toBase: 0.453592 },
    ],
  },
  temperature: {
    name: 'Температура',
    icon: '🌡️',
    units: [
      { id: 'c', name: 'Цельсий (°C)', toBase: 1 },
      { id: 'f', name: 'Фаренгейт (°F)', toBase: 1 },
      { id: 'k', name: 'Кельвин (K)', toBase: 1 },
    ],
  },
  area: {
    name: 'Площадь',
    icon: '📐',
    units: [
      { id: 'mm2', name: 'мм²', toBase: 0.000001 },
      { id: 'cm2', name: 'см²', toBase: 0.0001 },
      { id: 'm2', name: 'м²', toBase: 1 },
      { id: 'km2', name: 'км²', toBase: 1000000 },
      { id: 'ha', name: 'Гектары (га)', toBase: 10000 },
      { id: 'ar', name: 'Ары (сотки)', toBase: 100 },
    ],
  },
  volume: {
    name: 'Объём',
    icon: '🧊',
    units: [
      { id: 'ml', name: 'Миллилитры (мл)', toBase: 0.000001 },
      { id: 'l', name: 'Литры (л)', toBase: 0.001 },
      { id: 'cm3', name: 'см³', toBase: 0.000001 },
      { id: 'm3', name: 'м³', toBase: 1 },
      { id: 'gal', name: 'Галлоны US (gal)', toBase: 0.00378541 },
    ],
  },
  speed: {
    name: 'Скорость',
    icon: '🚀',
    units: [
      { id: 'ms', name: 'м/с', toBase: 1 },
      { id: 'kmh', name: 'км/ч', toBase: 0.277778 },
      { id: 'mph', name: 'миль/ч', toBase: 0.44704 },
      { id: 'knot', name: 'Узлы', toBase: 0.514444 },
    ],
  },
  time: {
    name: 'Время',
    icon: '⏱️',
    units: [
      { id: 'ms', name: 'Миллисекунды', toBase: 0.001 },
      { id: 's', name: 'Секунды', toBase: 1 },
      { id: 'min', name: 'Минуты', toBase: 60 },
      { id: 'h', name: 'Часы', toBase: 3600 },
      { id: 'd', name: 'Дни', toBase: 86400 },
      { id: 'w', name: 'Недели', toBase: 604800 },
    ],
  },
  data: {
    name: 'Данные',
    icon: '💾',
    units: [
      { id: 'b', name: 'Биты (b)', toBase: 0.125 },
      { id: 'B', name: 'Байты (B)', toBase: 1 },
      { id: 'KB', name: 'Килобайты (KB)', toBase: 1024 },
      { id: 'MB', name: 'Мегабайты (MB)', toBase: 1048576 },
      { id: 'GB', name: 'Гигабайты (GB)', toBase: 1073741824 },
      { id: 'TB', name: 'Терабайты (TB)', toBase: 1099511627776 },
    ],
  },
};

function UnitConverterPage() {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState(CATEGORIES.length.units[3].id); // метры
  const [toUnit, setToUnit] = useState(CATEGORIES.length.units[4].id); // километры
  const [fromValue, setFromValue] = useState('1');
  const [toValue, setToValue] = useState('');

  const currentCategory = CATEGORIES[category];

  const convertTemperature = (value: number, from: string, to: string): number => {
    // Сначала в Цельсий
    let celsius: number;
    switch (from) {
      case 'f':
        celsius = ((value - 32) * 5) / 9;
        break;
      case 'k':
        celsius = value - 273.15;
        break;
      default:
        celsius = value;
    }
    // Из Цельсия в нужную
    switch (to) {
      case 'f':
        return (celsius * 9) / 5 + 32;
      case 'k':
        return celsius + 273.15;
      default:
        return celsius;
    }
  };

  const convert = (value: string, from: string, to: string): string => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';

    if (category === 'temperature') {
      const result = convertTemperature(numValue, from, to);
      return result.toFixed(4).replace(/\.?0+$/, '');
    }

    const fromUnitData = currentCategory.units.find(u => u.id === from);
    const toUnitData = currentCategory.units.find(u => u.id === to);

    if (!fromUnitData || !toUnitData) return '';

    const baseValue = numValue * fromUnitData.toBase;
    const result = baseValue / toUnitData.toBase;

    // Умное форматирование
    if (Math.abs(result) < 0.0001 || Math.abs(result) >= 1000000) {
      return result.toExponential(4);
    }
    return result.toFixed(6).replace(/\.?0+$/, '');
  };

  const handleFromValueChange = (value: string) => {
    setFromValue(value);
    setToValue(convert(value, fromUnit, toUnit));
  };

  const handleToValueChange = (value: string) => {
    setToValue(value);
    setFromValue(convert(value, toUnit, fromUnit));
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    const units = CATEGORIES[newCategory].units;
    setFromUnit(units[0].id);
    setToUnit(units[1]?.id || units[0].id);
    setFromValue('1');
    setToValue(convert('1', units[0].id, units[1]?.id || units[0].id));
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    setToValue(fromValue);
  };

  // Обновляем конвертацию при смене единиц
  const handleFromUnitChange = (unit: string) => {
    setFromUnit(unit);
    setToValue(convert(fromValue, unit, toUnit));
  };

  const handleToUnitChange = (unit: string) => {
    setToUnit(unit);
    setToValue(convert(fromValue, fromUnit, unit));
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden">
        {/* Background blur circles */}
        <div className="absolute top-20 right-20 w-96 h-96 bg-amber-100/50 rounded-full blur-3xl" />
        <div
          className="absolute bottom-20 left-20 w-96 h-96 bg-orange-100/50 rounded-full blur-3xl"
          style={{ animationDelay: '1s' }}
        />

        <main className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Конвертер единиц
            </h1>
            <p className="text-slate-600 text-lg">
              Быстрая конвертация между различными единицами измерения
            </p>
          </div>

          {/* Категории */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {Object.entries(CATEGORIES).map(([key, cat]) => (
              <button
                key={key}
                onClick={() => handleCategoryChange(key)}
                className={`px-4 py-2 rounded-xl font-medium transition-all shadow-sm ${
                  category === key
                    ? 'bg-amber-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>

          {/* Конвертер */}
          <div className="bg-white border border-slate-200 shadow-lg rounded-2xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              {/* От */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">Из</label>
                <select
                  value={fromUnit}
                  onChange={e => handleFromUnitChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 mb-2"
                >
                  {currentCategory.units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={fromValue}
                  onChange={e => handleFromValueChange(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-2xl font-bold focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="0"
                />
              </div>

              {/* Кнопка swap */}
              <div className="flex justify-center py-4">
                <button
                  onClick={swapUnits}
                  className="p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                    />
                  </svg>
                </button>
              </div>

              {/* В */}
              <div>
                <label className="block text-slate-700 text-sm font-medium mb-2">В</label>
                <select
                  value={toUnit}
                  onChange={e => handleToUnitChange(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 mb-2"
                >
                  {currentCategory.units.map(unit => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  value={toValue}
                  onChange={e => handleToValueChange(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-2xl font-bold focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Формула */}
            {fromValue && toValue && (
              <div className="mt-6 text-center">
                <p className="text-slate-600">
                  <span className="text-amber-600 font-bold">{fromValue}</span>{' '}
                  {currentCategory.units.find(u => u.id === fromUnit)?.name}
                  {' = '}
                  <span className="text-orange-600 font-bold">{toValue}</span>{' '}
                  {currentCategory.units.find(u => u.id === toUnit)?.name}
                </p>
              </div>
            )}
          </div>

          {/* Быстрые примеры */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {currentCategory.units.slice(0, 4).map(unit => (
              <div
                key={unit.id}
                className="bg-white border border-slate-200 shadow-sm rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-bold text-slate-900">
                  {convert(fromValue || '0', fromUnit, unit.id) || '0'}
                </p>
                <p className="text-slate-600 text-sm">{unit.name}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}

export default UnitConverterPage;
