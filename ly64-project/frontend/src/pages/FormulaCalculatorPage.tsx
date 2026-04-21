import { useState } from 'react';

import { Header } from '../components/Header';

interface Formula {
  id: string;
  name: string;
  formula: string;
  description: string;
  variables: { id: string; name: string; unit: string }[];
  calculate: (vars: Record<string, number>) => { result: number; unit: string; name: string };
}

const FORMULAS: Record<string, Formula[]> = {
  physics: [
    {
      id: 'speed',
      name: 'Скорость',
      formula: 'v = S / t',
      description: 'Скорость равна отношению пройденного пути ко времени',
      variables: [
        { id: 'S', name: 'Путь (S)', unit: 'м' },
        { id: 't', name: 'Время (t)', unit: 'с' },
      ],
      calculate: v => ({ result: v.S! / v.t!, unit: 'м/с', name: 'Скорость (v)' }),
    },
    {
      id: 'force',
      name: 'Сила (второй закон Ньютона)',
      formula: 'F = m · a',
      description: 'Сила равна произведению массы на ускорение',
      variables: [
        { id: 'm', name: 'Масса (m)', unit: 'кг' },
        { id: 'a', name: 'Ускорение (a)', unit: 'м/с²' },
      ],
      calculate: v => ({ result: v.m! * v.a!, unit: 'Н', name: 'Сила (F)' }),
    },
    {
      id: 'kinetic',
      name: 'Кинетическая энергия',
      formula: 'Eₖ = mv² / 2',
      description: 'Энергия движущегося тела',
      variables: [
        { id: 'm', name: 'Масса (m)', unit: 'кг' },
        { id: 'v', name: 'Скорость (v)', unit: 'м/с' },
      ],
      calculate: v => ({ result: (v.m! * v.v! * v.v!) / 2, unit: 'Дж', name: 'Энергия (Eₖ)' }),
    },
    {
      id: 'potential',
      name: 'Потенциальная энергия',
      formula: 'Eₚ = mgh',
      description: 'Энергия тела на высоте h',
      variables: [
        { id: 'm', name: 'Масса (m)', unit: 'кг' },
        { id: 'g', name: 'g (≈9.8)', unit: 'м/с²' },
        { id: 'h', name: 'Высота (h)', unit: 'м' },
      ],
      calculate: v => ({ result: v.m! * v.g! * v.h!, unit: 'Дж', name: 'Энергия (Eₚ)' }),
    },
    {
      id: 'ohm',
      name: 'Закон Ома',
      formula: 'I = U / R',
      description: 'Сила тока равна отношению напряжения к сопротивлению',
      variables: [
        { id: 'U', name: 'Напряжение (U)', unit: 'В' },
        { id: 'R', name: 'Сопротивление (R)', unit: 'Ом' },
      ],
      calculate: v => ({ result: v.U! / v.R!, unit: 'А', name: 'Сила тока (I)' }),
    },
    {
      id: 'power',
      name: 'Мощность',
      formula: 'P = A / t',
      description: 'Мощность равна работе, делённой на время',
      variables: [
        { id: 'A', name: 'Работа (A)', unit: 'Дж' },
        { id: 't', name: 'Время (t)', unit: 'с' },
      ],
      calculate: v => ({ result: v.A! / v.t!, unit: 'Вт', name: 'Мощность (P)' }),
    },
    {
      id: 'pressure',
      name: 'Давление',
      formula: 'p = F / S',
      description: 'Давление равно силе, делённой на площадь',
      variables: [
        { id: 'F', name: 'Сила (F)', unit: 'Н' },
        { id: 'S', name: 'Площадь (S)', unit: 'м²' },
      ],
      calculate: v => ({ result: v.F! / v.S!, unit: 'Па', name: 'Давление (p)' }),
    },
    {
      id: 'density',
      name: 'Плотность',
      formula: 'ρ = m / V',
      description: 'Плотность равна массе, делённой на объём',
      variables: [
        { id: 'm', name: 'Масса (m)', unit: 'кг' },
        { id: 'V', name: 'Объём (V)', unit: 'м³' },
      ],
      calculate: v => ({ result: v.m! / v.V!, unit: 'кг/м³', name: 'Плотность (ρ)' }),
    },
  ],
  math: [
    {
      id: 'circle_area',
      name: 'Площадь круга',
      formula: 'S = πr²',
      description: 'Площадь круга с радиусом r',
      variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
      calculate: v => ({ result: Math.PI * v.r! * v.r!, unit: 'кв.ед.', name: 'Площадь (S)' }),
    },
    {
      id: 'circle_length',
      name: 'Длина окружности',
      formula: 'C = 2πr',
      description: 'Длина окружности с радиусом r',
      variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
      calculate: v => ({ result: 2 * Math.PI * v.r!, unit: 'ед.', name: 'Длина (C)' }),
    },
    {
      id: 'sphere_volume',
      name: 'Объём шара',
      formula: 'V = (4/3)πr³',
      description: 'Объём шара с радиусом r',
      variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
      calculate: v => ({
        result: (4 / 3) * Math.PI * Math.pow(v.r!, 3),
        unit: 'куб.ед.',
        name: 'Объём (V)',
      }),
    },
    {
      id: 'pythagorean',
      name: 'Теорема Пифагора',
      formula: 'c = √(a² + b²)',
      description: 'Гипотенуза прямоугольного треугольника',
      variables: [
        { id: 'a', name: 'Катет a', unit: '' },
        { id: 'b', name: 'Катет b', unit: '' },
      ],
      calculate: v => ({
        result: Math.sqrt(v.a! * v.a! + v.b! * v.b!),
        unit: '',
        name: 'Гипотенуза (c)',
      }),
    },
    {
      id: 'discriminant',
      name: 'Дискриминант',
      formula: 'D = b² - 4ac',
      description: 'Дискриминант квадратного уравнения ax² + bx + c = 0',
      variables: [
        { id: 'a', name: 'Коэффициент a', unit: '' },
        { id: 'b', name: 'Коэффициент b', unit: '' },
        { id: 'c', name: 'Коэффициент c', unit: '' },
      ],
      calculate: v => ({ result: v.b! * v.b! - 4 * v.a! * v.c!, unit: '', name: 'Дискриминант (D)' }),
    },
    {
      id: 'triangle_area',
      name: 'Площадь треугольника',
      formula: 'S = (a · h) / 2',
      description: 'Площадь треугольника по основанию и высоте',
      variables: [
        { id: 'a', name: 'Основание (a)', unit: '' },
        { id: 'h', name: 'Высота (h)', unit: '' },
      ],
      calculate: v => ({ result: (v.a! * v.h!) / 2, unit: 'кв.ед.', name: 'Площадь (S)' }),
    },
    {
      id: 'arithmetic_sum',
      name: 'Сумма арифм. прогрессии',
      formula: 'Sₙ = (a₁ + aₙ) · n / 2',
      description: 'Сумма n членов арифметической прогрессии',
      variables: [
        { id: 'a1', name: 'Первый член (a₁)', unit: '' },
        { id: 'an', name: 'Последний член (aₙ)', unit: '' },
        { id: 'n', name: 'Количество членов (n)', unit: '' },
      ],
      calculate: v => ({ result: ((v.a1! + v.an!) * v.n!) / 2, unit: '', name: 'Сумма (Sₙ)' }),
    },
    {
      id: 'percent',
      name: 'Процент от числа',
      formula: 'x = (a · p) / 100',
      description: 'Найти p процентов от числа a',
      variables: [
        { id: 'a', name: 'Число (a)', unit: '' },
        { id: 'p', name: 'Процент (p)', unit: '%' },
      ],
      calculate: v => ({ result: (v.a! * v.p!) / 100, unit: '', name: 'Результат' }),
    },
  ],
};

function FormulaCalculatorPage() {
  const [category, setCategory] = useState<'physics' | 'math'>('physics');
  const [selectedFormula, setSelectedFormula] = useState<Formula>(FORMULAS.physics?.[0]!);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ result: number; unit: string; name: string } | null>(null);

  const handleFormulaChange = (formula: Formula) => {
    setSelectedFormula(formula);
    setValues({});
    setResult(null);
  };

  const handleValueChange = (varId: string, value: string) => {
    const newValues = { ...values, [varId]: value };
    setValues(newValues);

    // Проверяем, все ли значения заполнены
    const allFilled = selectedFormula.variables.every(
      v => newValues[v.id] && !isNaN(parseFloat(newValues[v.id]!))
    );

    if (allFilled) {
      const numericValues: Record<string, number> = {};
      selectedFormula.variables.forEach(v => {
        numericValues[v.id] = parseFloat(newValues[v.id]!);
      });
      try {
        const calculatedResult = selectedFormula.calculate(numericValues);
        setResult(calculatedResult);
      } catch {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  };

  const handleCategoryChange = (cat: 'physics' | 'math') => {
    setCategory(cat);
    const firstFormula = FORMULAS[cat]?.[0];
    if (firstFormula) {
      setSelectedFormula(firstFormula);
    }
    setValues({});
    setResult(null);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white relative overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-100/50 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px]" />

        <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Калькулятор формул
            </h1>
            <p className="text-slate-600 text-lg">Подставляйте значения - получайте результат</p>
          </div>

          {/* Категории */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => handleCategoryChange('physics')}
              className={`px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
                category === 'physics'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚛️ Физика
            </button>
            <button
              onClick={() => handleCategoryChange('math')}
              className={`px-6 py-3 rounded-xl font-medium transition-all shadow-lg ${
                category === 'math'
                  ? 'bg-purple-500 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              📐 Математика
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Список формул */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 max-h-[600px] overflow-y-auto shadow-lg">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Формулы</h2>
              <div className="space-y-2">
                {FORMULAS[category]?.map(formula => (
                  <button
                    key={formula.id}
                    onClick={() => handleFormulaChange(formula)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedFormula.id === formula.id
                        ? 'bg-indigo-50 border border-indigo-500'
                        : 'bg-slate-50 border border-transparent hover:border-slate-300'
                    }`}
                  >
                    <p
                      className={`font-medium ${selectedFormula.id === formula.id ? 'text-indigo-700' : 'text-slate-900'}`}
                    >
                      {formula.name}
                    </p>
                    <p className="text-sm text-slate-600 font-mono">{formula.formula}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Калькулятор */}
            <div className="lg:col-span-2 space-y-6">
              {/* Формула */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedFormula.name}</h2>
                <p className="text-slate-600 mb-4">{selectedFormula.description}</p>
                <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
                  <span className="text-3xl font-mono text-indigo-600">
                    {selectedFormula.formula}
                  </span>
                </div>
              </div>

              {/* Ввод значений */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Введите значения</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedFormula.variables.map(variable => (
                    <div key={variable.id}>
                      <label className="block text-slate-600 text-sm mb-2">{variable.name}</label>
                      <div className="flex">
                        <input
                          type="number"
                          value={values[variable.id] || ''}
                          onChange={e => handleValueChange(variable.id, e.target.value)}
                          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-l-xl text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          placeholder="0"
                        />
                        {variable.unit && (
                          <span className="px-4 py-3 bg-slate-100 border border-slate-200 border-l-0 rounded-r-xl text-slate-600">
                            {variable.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Результат */}
              {result && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-6 animate-fade-in shadow-lg">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Результат</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-indigo-600">
                      {result.result.toFixed(4).replace(/\.?0+$/, '')}
                    </span>
                    <span className="text-xl text-slate-600">{result.unit}</span>
                  </div>
                  <p className="text-slate-600 mt-2">{result.name}</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default FormulaCalculatorPage;
