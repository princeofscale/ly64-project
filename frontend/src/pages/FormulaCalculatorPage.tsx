import { useState, useMemo } from 'react';

import { Header } from '../components/Header';

interface Formula {
 id: string;
 name: string;
 formula: string;
 description: string;
 variables: { id: string; name: string; unit: string }[];
 calculate: (vars: Record<string, number>) => { result: number; unit: string; name: string };
}

const g = (v: Record<string, number>, k: string): number => v[k] ?? 0;

type FormulaCategory = 'physics' | 'math' | 'geometry' | 'chemistry';

const CATEGORIES: { id: FormulaCategory; name: string; icon: string }[] = [
 { id: 'physics', name: 'Физика', icon: '⚛️' },
 { id: 'math', name: 'Алгебра', icon: '📊' },
 { id: 'geometry', name: 'Геометрия', icon: '📐' },
 { id: 'chemistry', name: 'Химия', icon: '🧪' },
];

const FORMULAS: Record<FormulaCategory, Formula[]> = {
 physics: [
 {
 id: 'speed', name: 'Скорость', formula: 'v = S / t',
 description: 'Скорость равна отношению пройденного пути ко времени',
 variables: [{ id: 'S', name: 'Путь (S)', unit: 'м' }, { id: 't', name: 'Время (t)', unit: 'с' }],
 calculate: v => ({ result: g(v, 'S') / g(v, 't'), unit: 'м/с', name: 'Скорость (v)' }),
 },
 {
 id: 'force', name: 'Сила (второй закон Ньютона)', formula: 'F = m · a',
 description: 'Сила равна произведению массы на ускорение',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'a', name: 'Ускорение (a)', unit: 'м/с²' }],
 calculate: v => ({ result: g(v, 'm') * g(v, 'a'), unit: 'Н', name: 'Сила (F)' }),
 },
 {
 id: 'gravity', name: 'Сила тяжести', formula: 'F = m · g',
 description: 'Сила тяжести — сила притяжения тела к Земле',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'g_val', name: 'g (≈9.8)', unit: 'м/с²' }],
 calculate: v => ({ result: g(v, 'm') * g(v, 'g_val'), unit: 'Н', name: 'Сила тяжести (F)' }),
 },
 {
 id: 'impulse', name: 'Импульс тела', formula: 'p = m · v',
 description: 'Импульс равен произведению массы на скорость',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'v', name: 'Скорость (v)', unit: 'м/с' }],
 calculate: v => ({ result: g(v, 'm') * g(v, 'v'), unit: 'кг·м/с', name: 'Импульс (p)' }),
 },
 {
 id: 'kinetic', name: 'Кинетическая энергия', formula: 'Eₖ = mv² / 2',
 description: 'Энергия движущегося тела',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'v', name: 'Скорость (v)', unit: 'м/с' }],
 calculate: v => ({ result: (g(v, 'm') * g(v, 'v') * g(v, 'v')) / 2, unit: 'Дж', name: 'Энергия (Eₖ)' }),
 },
 {
 id: 'potential', name: 'Потенциальная энергия', formula: 'Eₚ = mgh',
 description: 'Энергия тела на высоте h',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'g_val', name: 'g (≈9.8)', unit: 'м/с²' }, { id: 'h', name: 'Высота (h)', unit: 'м' }],
 calculate: v => ({ result: g(v, 'm') * g(v, 'g_val') * g(v, 'h'), unit: 'Дж', name: 'Энергия (Eₚ)' }),
 },
 {
 id: 'work', name: 'Механическая работа', formula: 'A = F · s',
 description: 'Работа силы на перемещении',
 variables: [{ id: 'F', name: 'Сила (F)', unit: 'Н' }, { id: 's', name: 'Перемещение (s)', unit: 'м' }],
 calculate: v => ({ result: g(v, 'F') * g(v, 's'), unit: 'Дж', name: 'Работа (A)' }),
 },
 {
 id: 'ohm', name: 'Закон Ома', formula: 'I = U / R',
 description: 'Сила тока равна отношению напряжения к сопротивлению',
 variables: [{ id: 'U', name: 'Напряжение (U)', unit: 'В' }, { id: 'R', name: 'Сопротивление (R)', unit: 'Ом' }],
 calculate: v => ({ result: g(v, 'U') / g(v, 'R'), unit: 'А', name: 'Сила тока (I)' }),
 },
 {
 id: 'power', name: 'Мощность', formula: 'P = A / t',
 description: 'Мощность равна работе, делённой на время',
 variables: [{ id: 'A', name: 'Работа (A)', unit: 'Дж' }, { id: 't', name: 'Время (t)', unit: 'с' }],
 calculate: v => ({ result: g(v, 'A') / g(v, 't'), unit: 'Вт', name: 'Мощность (P)' }),
 },
 {
 id: 'pressure', name: 'Давление', formula: 'p = F / S',
 description: 'Давление равно силе, делённой на площадь',
 variables: [{ id: 'F', name: 'Сила (F)', unit: 'Н' }, { id: 'S', name: 'Площадь (S)', unit: 'м²' }],
 calculate: v => ({ result: g(v, 'F') / g(v, 'S'), unit: 'Па', name: 'Давление (p)' }),
 },
 {
 id: 'density', name: 'Плотность', formula: 'ρ = m / V',
 description: 'Плотность равна массе, делённой на объём',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'V', name: 'Объём (V)', unit: 'м³' }],
 calculate: v => ({ result: g(v, 'm') / g(v, 'V'), unit: 'кг/м³', name: 'Плотность (ρ)' }),
 },
 {
 id: 'heat', name: 'Количество теплоты', formula: 'Q = c · m · Δt',
 description: 'Теплота, необходимая для нагревания тела',
 variables: [{ id: 'c', name: 'Уд. теплоёмкость (c)', unit: 'Дж/(кг·°C)' }, { id: 'm', name: 'Масса (m)', unit: 'кг' }, { id: 'dt', name: 'Разность температур (Δt)', unit: '°C' }],
 calculate: v => ({ result: g(v, 'c') * g(v, 'm') * g(v, 'dt'), unit: 'Дж', name: 'Теплота (Q)' }),
 },
 {
 id: 'archimedes', name: 'Сила Архимеда', formula: 'Fа = ρ · g · V',
 description: 'Выталкивающая сила, действующая на тело в жидкости',
 variables: [{ id: 'rho', name: 'Плотность жидкости (ρ)', unit: 'кг/м³' }, { id: 'g_val', name: 'g (≈9.8)', unit: 'м/с²' }, { id: 'V', name: 'Объём тела (V)', unit: 'м³' }],
 calculate: v => ({ result: g(v, 'rho') * g(v, 'g_val') * g(v, 'V'), unit: 'Н', name: 'Сила Архимеда (Fа)' }),
 },
 {
 id: 'coulomb', name: 'Закон Кулона', formula: 'F = k · q₁q₂ / r²',
 description: 'Сила взаимодействия двух точечных зарядов',
 variables: [{ id: 'k', name: 'k (≈9·10⁹)', unit: 'Н·м²/Кл²' }, { id: 'q1', name: 'Заряд q₁', unit: 'Кл' }, { id: 'q2', name: 'Заряд q₂', unit: 'Кл' }, { id: 'r', name: 'Расстояние (r)', unit: 'м' }],
 calculate: v => ({ result: g(v, 'k') * g(v, 'q1') * g(v, 'q2') / (g(v, 'r') * g(v, 'r')), unit: 'Н', name: 'Сила (F)' }),
 },
 ],
 math: [
 {
 id: 'discriminant', name: 'Дискриминант', formula: 'D = b² − 4ac',
 description: 'Дискриминант квадратного уравнения ax² + bx + c = 0',
 variables: [{ id: 'a', name: 'Коэффициент a', unit: '' }, { id: 'b', name: 'Коэффициент b', unit: '' }, { id: 'c', name: 'Коэффициент c', unit: '' }],
 calculate: v => ({ result: g(v, 'b') * g(v, 'b') - 4 * g(v, 'a') * g(v, 'c'), unit: '', name: 'Дискриминант (D)' }),
 },
 {
 id: 'arithmetic_nth', name: 'n-й член арифм. прогрессии', formula: 'aₙ = a₁ + (n−1)·d',
 description: 'Найти n-й член арифметической прогрессии',
 variables: [{ id: 'a1', name: 'Первый член (a₁)', unit: '' }, { id: 'n', name: 'Номер (n)', unit: '' }, { id: 'd', name: 'Разность (d)', unit: '' }],
 calculate: v => ({ result: g(v, 'a1') + (g(v, 'n') - 1) * g(v, 'd'), unit: '', name: 'aₙ' }),
 },
 {
 id: 'arithmetic_sum', name: 'Сумма арифм. прогрессии', formula: 'Sₙ = (a₁ + aₙ) · n / 2',
 description: 'Сумма n членов арифметической прогрессии',
 variables: [{ id: 'a1', name: 'Первый член (a₁)', unit: '' }, { id: 'an', name: 'Последний член (aₙ)', unit: '' }, { id: 'n', name: 'Количество членов (n)', unit: '' }],
 calculate: v => ({ result: ((g(v, 'a1') + g(v, 'an')) * g(v, 'n')) / 2, unit: '', name: 'Сумма (Sₙ)' }),
 },
 {
 id: 'geometric_nth', name: 'n-й член геом. прогрессии', formula: 'bₙ = b₁ · qⁿ⁻¹',
 description: 'Найти n-й член геометрической прогрессии',
 variables: [{ id: 'b1', name: 'Первый член (b₁)', unit: '' }, { id: 'q', name: 'Знаменатель (q)', unit: '' }, { id: 'n', name: 'Номер (n)', unit: '' }],
 calculate: v => ({ result: g(v, 'b1') * Math.pow(g(v, 'q'), g(v, 'n') - 1), unit: '', name: 'bₙ' }),
 },
 {
 id: 'percent', name: 'Процент от числа', formula: 'x = (a · p) / 100',
 description: 'Найти p процентов от числа a',
 variables: [{ id: 'a', name: 'Число (a)', unit: '' }, { id: 'p', name: 'Процент (p)', unit: '%' }],
 calculate: v => ({ result: (g(v, 'a') * g(v, 'p')) / 100, unit: '', name: 'Результат' }),
 },
 {
 id: 'compound_interest', name: 'Сложный процент', formula: 'S = P · (1 + r/100)ⁿ',
 description: 'Итоговая сумма при сложном проценте',
 variables: [{ id: 'P', name: 'Начальная сумма (P)', unit: '' }, { id: 'r', name: 'Процент (r)', unit: '%' }, { id: 'n', name: 'Количество периодов (n)', unit: '' }],
 calculate: v => ({ result: g(v, 'P') * Math.pow(1 + g(v, 'r') / 100, g(v, 'n')), unit: '', name: 'Итого (S)' }),
 },
 {
 id: 'power_calc', name: 'Степень числа', formula: 'aⁿ',
 description: 'Возведение числа в степень',
 variables: [{ id: 'a', name: 'Основание (a)', unit: '' }, { id: 'n', name: 'Показатель (n)', unit: '' }],
 calculate: v => ({ result: Math.pow(g(v, 'a'), g(v, 'n')), unit: '', name: 'Результат' }),
 },
 {
 id: 'distance_points', name: 'Расстояние между точками', formula: 'd = √((x₂−x₁)² + (y₂−y₁)²)',
 description: 'Расстояние между двумя точками на плоскости',
 variables: [{ id: 'x1', name: 'x₁', unit: '' }, { id: 'y1', name: 'y₁', unit: '' }, { id: 'x2', name: 'x₂', unit: '' }, { id: 'y2', name: 'y₂', unit: '' }],
 calculate: v => ({ result: Math.sqrt(Math.pow(g(v, 'x2') - g(v, 'x1'), 2) + Math.pow(g(v, 'y2') - g(v, 'y1'), 2)), unit: '', name: 'Расстояние (d)' }),
 },
 ],
 geometry: [
 {
 id: 'circle_area', name: 'Площадь круга', formula: 'S = πr²',
 description: 'Площадь круга с радиусом r',
 variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
 calculate: v => ({ result: Math.PI * g(v, 'r') * g(v, 'r'), unit: 'кв.ед.', name: 'Площадь (S)' }),
 },
 {
 id: 'circle_length', name: 'Длина окружности', formula: 'C = 2πr',
 description: 'Длина окружности с радиусом r',
 variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
 calculate: v => ({ result: 2 * Math.PI * g(v, 'r'), unit: 'ед.', name: 'Длина (C)' }),
 },
 {
 id: 'triangle_area', name: 'Площадь треугольника', formula: 'S = (a · h) / 2',
 description: 'Площадь треугольника по основанию и высоте',
 variables: [{ id: 'a', name: 'Основание (a)', unit: '' }, { id: 'h', name: 'Высота (h)', unit: '' }],
 calculate: v => ({ result: (g(v, 'a') * g(v, 'h')) / 2, unit: 'кв.ед.', name: 'Площадь (S)' }),
 },
 {
 id: 'parallelogram_area', name: 'Площадь параллелограмма', formula: 'S = a · h',
 description: 'Площадь параллелограмма по стороне и высоте',
 variables: [{ id: 'a', name: 'Сторона (a)', unit: '' }, { id: 'h', name: 'Высота (h)', unit: '' }],
 calculate: v => ({ result: g(v, 'a') * g(v, 'h'), unit: 'кв.ед.', name: 'Площадь (S)' }),
 },
 {
 id: 'trapezoid_area', name: 'Площадь трапеции', formula: 'S = (a + b) · h / 2',
 description: 'Площадь трапеции по двум основаниям и высоте',
 variables: [{ id: 'a', name: 'Основание a', unit: '' }, { id: 'b', name: 'Основание b', unit: '' }, { id: 'h', name: 'Высота (h)', unit: '' }],
 calculate: v => ({ result: ((g(v, 'a') + g(v, 'b')) * g(v, 'h')) / 2, unit: 'кв.ед.', name: 'Площадь (S)' }),
 },
 {
 id: 'rhombus_area', name: 'Площадь ромба', formula: 'S = d₁ · d₂ / 2',
 description: 'Площадь ромба по двум диагоналям',
 variables: [{ id: 'd1', name: 'Диагональ d₁', unit: '' }, { id: 'd2', name: 'Диагональ d₂', unit: '' }],
 calculate: v => ({ result: (g(v, 'd1') * g(v, 'd2')) / 2, unit: 'кв.ед.', name: 'Площадь (S)' }),
 },
 {
 id: 'pythagorean', name: 'Теорема Пифагора', formula: 'c = √(a² + b²)',
 description: 'Гипотенуза прямоугольного треугольника',
 variables: [{ id: 'a', name: 'Катет a', unit: '' }, { id: 'b', name: 'Катет b', unit: '' }],
 calculate: v => ({ result: Math.sqrt(g(v, 'a') ** 2 + g(v, 'b') ** 2), unit: '', name: 'Гипотенуза (c)' }),
 },
 {
 id: 'sphere_volume', name: 'Объём шара', formula: 'V = (4/3)πr³',
 description: 'Объём шара с радиусом r',
 variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
 calculate: v => ({ result: (4 / 3) * Math.PI * Math.pow(g(v, 'r'), 3), unit: 'куб.ед.', name: 'Объём (V)' }),
 },
 {
 id: 'sphere_area', name: 'Площадь сферы', formula: 'S = 4πr²',
 description: 'Площадь поверхности сферы',
 variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }],
 calculate: v => ({ result: 4 * Math.PI * g(v, 'r') ** 2, unit: 'кв.ед.', name: 'Площадь (S)' }),
 },
 {
 id: 'cylinder_volume', name: 'Объём цилиндра', formula: 'V = πr²h',
 description: 'Объём цилиндра с радиусом r и высотой h',
 variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }, { id: 'h', name: 'Высота (h)', unit: '' }],
 calculate: v => ({ result: Math.PI * g(v, 'r') ** 2 * g(v, 'h'), unit: 'куб.ед.', name: 'Объём (V)' }),
 },
 {
 id: 'cone_volume', name: 'Объём конуса', formula: 'V = πr²h / 3',
 description: 'Объём конуса с радиусом основания r и высотой h',
 variables: [{ id: 'r', name: 'Радиус (r)', unit: '' }, { id: 'h', name: 'Высота (h)', unit: '' }],
 calculate: v => ({ result: (Math.PI * g(v, 'r') ** 2 * g(v, 'h')) / 3, unit: 'куб.ед.', name: 'Объём (V)' }),
 },
 {
 id: 'pyramid_volume', name: 'Объём пирамиды', formula: 'V = S · h / 3',
 description: 'Объём пирамиды с площадью основания S и высотой h',
 variables: [{ id: 'S', name: 'Площадь основания (S)', unit: '' }, { id: 'h', name: 'Высота (h)', unit: '' }],
 calculate: v => ({ result: (g(v, 'S') * g(v, 'h')) / 3, unit: 'куб.ед.', name: 'Объём (V)' }),
 },
 ],
 chemistry: [
 {
 id: 'moles', name: 'Количество вещества', formula: 'n = m / M',
 description: 'Количество вещества (моль) из массы и молярной массы',
 variables: [{ id: 'm', name: 'Масса (m)', unit: 'г' }, { id: 'M', name: 'Молярная масса (M)', unit: 'г/моль' }],
 calculate: v => ({ result: g(v, 'm') / g(v, 'M'), unit: 'моль', name: 'Количество (n)' }),
 },
 {
 id: 'gas_volume', name: 'Объём газа (н.у.)', formula: 'V = n · 22.4',
 description: 'Объём газа при нормальных условиях (н.у.)',
 variables: [{ id: 'n', name: 'Количество вещества (n)', unit: 'моль' }],
 calculate: v => ({ result: g(v, 'n') * 22.4, unit: 'л', name: 'Объём (V)' }),
 },
 {
 id: 'mass_fraction', name: 'Массовая доля', formula: 'ω = (m_в / m_р) · 100%',
 description: 'Массовая доля вещества в растворе',
 variables: [{ id: 'mv', name: 'Масса вещества (m_в)', unit: 'г' }, { id: 'mr', name: 'Масса раствора (m_р)', unit: 'г' }],
 calculate: v => ({ result: (g(v, 'mv') / g(v, 'mr')) * 100, unit: '%', name: 'Массовая доля (ω)' }),
 },
 {
 id: 'molar_concentration', name: 'Молярная концентрация', formula: 'C = n / V',
 description: 'Молярная концентрация раствора',
 variables: [{ id: 'n', name: 'Количество вещества (n)', unit: 'моль' }, { id: 'V', name: 'Объём раствора (V)', unit: 'л' }],
 calculate: v => ({ result: g(v, 'n') / g(v, 'V'), unit: 'моль/л', name: 'Концентрация (C)' }),
 },
 {
 id: 'mass_from_moles', name: 'Масса вещества', formula: 'm = n · M',
 description: 'Масса вещества из количества моль и молярной массы',
 variables: [{ id: 'n', name: 'Количество вещества (n)', unit: 'моль' }, { id: 'M', name: 'Молярная масса (M)', unit: 'г/моль' }],
 calculate: v => ({ result: g(v, 'n') * g(v, 'M'), unit: 'г', name: 'Масса (m)' }),
 },
 ],
};

function FormulaCalculatorPage() {
 const [category, setCategory] = useState<FormulaCategory>('physics');
 const [selectedFormula, setSelectedFormula] = useState<Formula>(FORMULAS.physics[0]!);
 const [values, setValues] = useState<Record<string, string>>({});
 const [result, setResult] = useState<{ result: number; unit: string; name: string } | null>(null);
 const [searchQuery, setSearchQuery] = useState('');

 const allFormulas = useMemo(
 () => Object.entries(FORMULAS).flatMap(([cat, formulas]) =>
 formulas.map(f => ({ ...f, category: cat as FormulaCategory }))
 ),
 [],
 );

 const displayedFormulas = useMemo(() => {
 const query = searchQuery.trim().toLowerCase();
 if (!query) return FORMULAS[category]!;
 return allFormulas.filter(
 f => f.name.toLowerCase().includes(query) ||
 f.formula.toLowerCase().includes(query) ||
 f.description.toLowerCase().includes(query)
 );
 }, [searchQuery, category, allFormulas]);

 const getCategoryName = (catId: string) =>
 CATEGORIES.find(c => c.id === catId)?.name ?? catId;

 const handleFormulaChange = (formula: Formula) => {
 setSelectedFormula(formula);
 setValues({});
 setResult(null);
 };

 const handleValueChange = (varId: string, value: string) => {
 const newValues = { ...values, [varId]: value };
 setValues(newValues);

 const allFilled = selectedFormula.variables.every(
 v => newValues[v.id] && !isNaN(parseFloat(newValues[v.id] ?? ''))
 );

 if (allFilled) {
 const numericValues: Record<string, number> = {};
 selectedFormula.variables.forEach(v => {
 numericValues[v.id] = parseFloat(newValues[v.id] ?? '0');
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

 const handleCategoryChange = (cat: FormulaCategory) => {
 setCategory(cat);
 setSearchQuery('');
 const firstFormula = FORMULAS[cat]![0]!;
 setSelectedFormula(firstFormula);
 setValues({});
 setResult(null);
 };

 return (
 <>
 <Header />
 <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-100/50 rounded-full blur-[120px]" />
 <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px]" />

 <main className="relative z-10 max-w-6xl mx-auto px-4 py-12">
 <div className="text-center mb-12">
 <h1 className="text-4xl md:text-5xl font-bold  mb-4" style={{ color: 'var(--color-text)' }}>
 Калькулятор формул
 </h1>
 <p className="text-slate-600 text-lg">Подставляйте значения — получайте результат</p>
 </div>

 {}
 <div className="flex flex-wrap justify-center gap-3 mb-8">
 {CATEGORIES.map(cat => (
 <button
 key={cat.id}
 onClick={() => handleCategoryChange(cat.id)}
 className={`px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg text-sm ${
 category === cat.id && !searchQuery.trim()
 ? 'bg-indigo-500 text-white'
 : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-indigo-300'
 }`}
 >
 {cat.icon} {cat.name} ({FORMULAS[cat.id]!.length})
 </button>
 ))}
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Список формул */}
 <div className=" border border-slate-200 rounded-2xl p-4 max-h-[600px] overflow-y-auto shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-lg font-bold  mb-3" style={{ color: 'var(--color-text)' }}>Формулы</h2>

 {/* Search bar */}
 <div className="mb-3">
 <input
 type="text"
 value={searchQuery}
 onChange={e => setSearchQuery(e.target.value)}
 placeholder="Поиск формулы..."
 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
 />
 </div>

 {searchQuery.trim() && (
 <p className="text-xs text-slate-500 mb-2">
 Найдено: {displayedFormulas.length}
 </p>
 )}

 <div className="space-y-1.5">
 {displayedFormulas.map(formula => {
 const formulaWithCategory = formula as Formula & { category?: FormulaCategory };
 return (
 <button
 key={formula.id}
 onClick={() => handleFormulaChange(formula)}
 className={`w-full text-left p-3 rounded-xl transition-all ${
 selectedFormula.id === formula.id
 ? 'bg-indigo-50 border border-indigo-500'
 : 'bg-slate-50 border border-transparent hover:border-slate-300'
 }`}
 >
 <p className={`font-medium text-sm ${selectedFormula.id === formula.id ? 'text-indigo-700' : 'text-slate-900'}`}>
 {formula.name}
 </p>
 <p className="text-xs text-slate-600 font-mono">{formula.formula}</p>
 {searchQuery.trim() && formulaWithCategory.category && (
 <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-lg">
 {getCategoryName(formulaWithCategory.category)}
 </span>
 )}
 </button>
 );
 })}
 {displayedFormulas.length === 0 && (
 <p className="text-slate-500 text-sm text-center py-4">Ничего не найдено</p>
 )}
 </div>
 </div>

 {/* Калькулятор */}
 <div className="lg:col-span-2 space-y-6">
 {/* Формула */}
 <div className=" border border-slate-200 rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="text-xl font-bold  mb-2" style={{ color: 'var(--color-text)' }}>{selectedFormula.name}</h2>
 <p className="text-slate-600 mb-4">{selectedFormula.description}</p>
 <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200">
 <span className="text-3xl font-mono text-indigo-600">
 {selectedFormula.formula}
 </span>
 </div>
 </div>

 {/* Ввод значений */}
 <div className=" border border-slate-200 rounded-2xl p-6 shadow-lg" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h3 className="text-lg font-bold  mb-4" style={{ color: 'var(--color-text)' }}>Введите значения</h3>
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
 <span className="px-4 py-3 bg-slate-100 border border-slate-200 border-l-0 rounded-r-xl text-slate-600 text-sm">
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
 <h3 className="text-lg font-bold  mb-2" style={{ color: 'var(--color-text)' }}>Результат</h3>
 <div className="flex items-baseline gap-2">
 <span className="text-4xl font-bold text-indigo-600">
 {isFinite(result.result)
 ? result.result.toFixed(4).replace(/\.?0+$/, '')
 : 'Ошибка'}
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
