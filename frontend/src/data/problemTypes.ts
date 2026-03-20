export interface Problem {
  question: string;
  answer: string | number;
  hint?: string;
}

export interface ProblemType {
  id: string;
  name: string;
  icon: string;
  grade: number;
  generate: () => Problem;
}

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T,>(arr: T[]): T => arr[rand(0, arr.length - 1)]!;

export const GRADE_LABELS: Record<number, string> = {
  8: '8 класс',
  9: '9 класс (ОГЭ)',
  10: '10 класс',
  11: '11 класс (ЕГЭ)',
};

const addition: ProblemType = {
  id: 'addition', name: 'Сложение', icon: '+', grade: 8,
  generate: () => {
    const a = rand(10, 999); const b = rand(10, 999);
    return { question: `${a} + ${b} = ?`, answer: a + b };
  },
};

const subtraction: ProblemType = {
  id: 'subtraction', name: 'Вычитание', icon: '−', grade: 8,
  generate: () => {
    const a = rand(100, 999); const b = rand(10, a);
    return { question: `${a} − ${b} = ?`, answer: a - b };
  },
};

const multiplication: ProblemType = {
  id: 'multiplication', name: 'Умножение', icon: '×', grade: 8,
  generate: () => {
    const a = rand(2, 12); const b = rand(2, 12);
    return { question: `${a} × ${b} = ?`, answer: a * b };
  },
};

const division: ProblemType = {
  id: 'division', name: 'Деление', icon: '÷', grade: 8,
  generate: () => {
    const b = rand(2, 12); const answer = rand(2, 12); const a = b * answer;
    return { question: `${a} ÷ ${b} = ?`, answer };
  },
};

const percentBasic: ProblemType = {
  id: 'percent', name: 'Проценты', icon: '%', grade: 8,
  generate: () => {
    const p = pick([10, 20, 25, 50, 75]);
    const base = rand(2, 20) * 10;
    return { question: `${p}% от ${base} = ?`, answer: (base * p) / 100, hint: `${p}% = ${p}/100` };
  },
};

const square: ProblemType = {
  id: 'square', name: 'Квадрат числа', icon: 'x²', grade: 8,
  generate: () => {
    const a = rand(2, 15);
    return { question: `${a}² = ?`, answer: a * a };
  },
};

const sqrtBasic: ProblemType = {
  id: 'sqrt', name: 'Корень квадратный', icon: '√', grade: 8,
  generate: () => {
    const answer = rand(2, 15); const a = answer * answer;
    return { question: `√${a} = ?`, answer };
  },
};

const fractions: ProblemType = {
  id: 'fraction', name: 'Дроби', icon: '½', grade: 8,
  generate: () => {
    const types = [
      () => {
        const a = rand(1, 5); const b = rand(a + 1, 10); const c = rand(1, 5);
        return { question: `${a}/${b} + ${c}/${b} = ?`, answer: `${a + c}/${b}` };
      },
      () => {
        const whole = rand(1, 5); const num = rand(1, 3); const den = rand(num + 1, 8);
        return { question: `Переведите ${whole} ${num}/${den} в неправильную дробь`, answer: `${whole * den + num}/${den}` };
      },
    ];
    return pick(types)();
  },
};

// ─── 9 класс (ОГЭ) ─────────────────────────────────────────

const linearEquation: ProblemType = {
  id: 'linear_eq', name: 'Линейные уравнения', icon: 'x', grade: 9,
  generate: () => {
    const x = rand(2, 20); const a = rand(2, 10); const b = rand(1, 50);
    const result = a * x + b;
    return { question: `${a}x + ${b} = ${result}. Найдите x`, answer: x, hint: `${a}x = ${result} − ${b}` };
  },
};

const diffOfSquares: ProblemType = {
  id: 'diff_squares', name: 'Разность квадратов', icon: 'a²−b²', grade: 9,
  generate: () => {
    const mid = rand(10, 50); const diff = rand(1, 5);
    const a = mid + diff; const b = mid - diff;
    return { question: `${a}² − ${b}² = ?`, answer: (a - b) * (a + b), hint: `a² − b² = (a−b)(a+b) = ${a - b} × ${a + b}` };
  },
};

const powers: ProblemType = {
  id: 'powers', name: 'Степени', icon: 'aⁿ', grade: 9,
  generate: () => {
    const types = [
      () => {
        const base = rand(2, 5); const n = rand(2, 4); const m = rand(1, 3);
        return { question: `${base}${sup(n)} · ${base}${sup(m)} = ?`, answer: Math.pow(base, n + m), hint: `aⁿ · aᵐ = aⁿ⁺ᵐ = ${base}${sup(n + m)}` };
      },
      () => {
        const base = rand(2, 5); const n = rand(3, 6); const m = rand(1, n - 1);
        return { question: `${base}${sup(n)} ÷ ${base}${sup(m)} = ?`, answer: Math.pow(base, n - m), hint: `aⁿ ÷ aᵐ = aⁿ⁻ᵐ = ${base}${sup(n - m)}` };
      },
    ];
    return pick(types)();
  },
};

const arithmeticProg: ProblemType = {
  id: 'arith_prog', name: 'Арифметическая прогрессия', icon: 'aₙ', grade: 9,
  generate: () => {
    const a1 = rand(1, 10); const d = rand(2, 8); const n = rand(4, 10);
    const an = a1 + (n - 1) * d;
    return { question: `a₁ = ${a1}, d = ${d}. Найдите a${sub(n)}`, answer: an, hint: `aₙ = a₁ + (n−1)·d = ${a1} + ${n - 1}·${d}` };
  },
};

const geometricProg: ProblemType = {
  id: 'geom_prog', name: 'Геометрическая прогрессия', icon: 'bₙ', grade: 9,
  generate: () => {
    const b1 = rand(1, 5); const q = rand(2, 4); const n = rand(3, 5);
    const bn = b1 * Math.pow(q, n - 1);
    return { question: `b₁ = ${b1}, q = ${q}. Найдите b${sub(n)}`, answer: bn, hint: `bₙ = b₁ · qⁿ⁻¹ = ${b1} · ${q}${sup(n - 1)}` };
  },
};

const geometryBasic: ProblemType = {
  id: 'geometry', name: 'Площади фигур', icon: '△', grade: 9,
  generate: () => {
    const types = [
      () => {
        const a = rand(3, 15); const b = rand(3, 15);
        return { question: `Площадь прямоугольника ${a} × ${b} = ?`, answer: a * b, hint: 'S = a × b' };
      },
      () => {
        const a = rand(3, 12); const h = rand(2, 10);
        return { question: `Площадь треугольника, основание ${a}, высота ${h}. S = ?`, answer: (a * h) / 2, hint: 'S = (a × h) / 2' };
      },
      () => {
        const a = rand(4, 12); const b = rand(2, a - 1); const h = rand(3, 10);
        return { question: `Площадь трапеции, a = ${a}, b = ${b}, h = ${h}. S = ?`, answer: ((a + b) * h) / 2, hint: 'S = (a + b) · h / 2' };
      },
      () => {
        const a = rand(3, 10); const h = rand(3, 10);
        return { question: `Площадь параллелограмма, a = ${a}, h = ${h}. S = ?`, answer: a * h, hint: 'S = a · h' };
      },
    ];
    return pick(types)();
  },
};

const pythagoras: ProblemType = {
  id: 'pythagoras', name: 'Теорема Пифагора', icon: 'c²', grade: 9,
  generate: () => {
    const triples: [number, number, number][] = [[3, 4, 5], [5, 12, 13], [6, 8, 10], [8, 15, 17], [9, 12, 15], [7, 24, 25]];
    const [a, b, c] = pick(triples);
    const variant = rand(0, 1);
    if (variant === 0) {
      return { question: `Катеты: ${a} и ${b}. Гипотенуза = ?`, answer: c, hint: `c = √(${a}² + ${b}²) = √${a * a + b * b}` };
    }
    return { question: `Гипотенуза: ${c}, катет: ${a}. Второй катет = ?`, answer: b, hint: `b = √(${c}² − ${a}²) = √${c * c - a * a}` };
  },
};

const probabilityBasic: ProblemType = {
  id: 'probability_basic', name: 'Вероятность', icon: 'P', grade: 9,
  generate: () => {
    const favorable = rand(1, 8); const unfavorable = rand(1, 10);
    const total = favorable + unfavorable;
    const colors = [
      ['красных', 'синих'], ['белых', 'чёрных'], ['зелёных', 'жёлтых'],
    ];
    const pair = pick(colors);
    const c1 = pair[0]!;
    const c2 = pair[1]!;
    const p = favorable / total;
    const answer = Number.isInteger(p * 1000) ? p : Math.round(p * 100) / 100;
    return {
      question: `В мешке ${favorable} ${c1} и ${unfavorable} ${c2} шаров. Вероятность достать ${c1.replace('ых', 'ый').replace('их', 'ий')} шар? (округлите до сотых)`,
      answer,
      hint: `P = ${favorable} / ${total}`,
    };
  },
};

// ─── 10 класс ───────────────────────────────────────────────

const trigValues: ProblemType = {
  id: 'trig_values', name: 'Тригонометрия', icon: 'sin', grade: 10,
  generate: () => {
    const table: { func: string; angle: number; value: number }[] = [
      { func: 'sin', angle: 0, value: 0 },
      { func: 'sin', angle: 30, value: 0.5 },
      { func: 'sin', angle: 90, value: 1 },
      { func: 'sin', angle: 150, value: 0.5 },
      { func: 'sin', angle: 180, value: 0 },
      { func: 'cos', angle: 0, value: 1 },
      { func: 'cos', angle: 60, value: 0.5 },
      { func: 'cos', angle: 90, value: 0 },
      { func: 'cos', angle: 120, value: -0.5 },
      { func: 'cos', angle: 180, value: -1 },
      { func: 'tg', angle: 0, value: 0 },
      { func: 'tg', angle: 45, value: 1 },
    ];
    const item = pick(table);
    return { question: `${item.func} ${item.angle}° = ?`, answer: item.value };
  },
};

const derivativePower: ProblemType = {
  id: 'derivatives', name: 'Производные', icon: "f'", grade: 10,
  generate: () => {
    const n = rand(2, 5); const x0 = rand(1, 3);
    const result = n * Math.pow(x0, n - 1);
    return { question: `f(x) = x${sup(n)}. Найдите f'(${x0})`, answer: result, hint: `f'(x) = ${n}x${sup(n - 1)}, f'(${x0}) = ${n} · ${x0}${sup(n - 1)}` };
  },
};

const logarithms: ProblemType = {
  id: 'logarithms', name: 'Логарифмы', icon: 'log', grade: 10,
  generate: () => {
    const pairs: { base: number; arg: number; value: number }[] = [
      { base: 2, arg: 4, value: 2 }, { base: 2, arg: 8, value: 3 },
      { base: 2, arg: 16, value: 4 }, { base: 2, arg: 32, value: 5 },
      { base: 3, arg: 9, value: 2 }, { base: 3, arg: 27, value: 3 },
      { base: 3, arg: 81, value: 4 }, { base: 5, arg: 25, value: 2 },
      { base: 5, arg: 125, value: 3 }, { base: 10, arg: 100, value: 2 },
      { base: 10, arg: 1000, value: 3 },
    ];
    const p = pick(pairs);
    return { question: `log${sub(p.base)}(${p.arg}) = ?`, answer: p.value };
  },
};

const nthRoot: ProblemType = {
  id: 'nth_root', name: 'Корень n-й степени', icon: '∛', grade: 10,
  generate: () => {
    const pairs: { n: number; val: number; root: number }[] = [
      { n: 3, val: 8, root: 2 }, { n: 3, val: 27, root: 3 },
      { n: 3, val: 64, root: 4 }, { n: 3, val: 125, root: 5 },
      { n: 4, val: 16, root: 2 }, { n: 4, val: 81, root: 3 },
      { n: 4, val: 256, root: 4 }, { n: 4, val: 625, root: 5 },
    ];
    const p = pick(pairs);
    const rootSymbol = p.n === 3 ? '∛' : '∜';
    return { question: `${rootSymbol}${p.val} = ?`, answer: p.root };
  },
};

const quadraticRoots: ProblemType = {
  id: 'quadratic_roots', name: 'Квадратные уравнения', icon: 'x²', grade: 10,
  generate: () => {
    const x1 = rand(1, 8); const x2 = rand(1, 8);
    const b = -(x1 + x2); const c = x1 * x2;
    const types = [
      () => ({
        question: `x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x + ${c} = 0. Найдите сумму корней`,
        answer: x1 + x2,
        hint: 'По теореме Виета: x₁ + x₂ = −b/a',
      }),
      () => ({
        question: `x² ${b >= 0 ? '+' : '−'} ${Math.abs(b)}x + ${c} = 0. Найдите произведение корней`,
        answer: x1 * x2,
        hint: 'По теореме Виета: x₁ · x₂ = c/a',
      }),
    ];
    return pick(types)();
  },
};

// ─── 11 класс (ЕГЭ) ────────────────────────────────────────

const integrals: ProblemType = {
  id: 'integrals', name: 'Определённый интеграл', icon: '∫', grade: 11,
  generate: () => {
    // ∫₀ᵃ xⁿ dx = aⁿ⁺¹/(n+1) — подбираем так, чтобы ответ целый
    const pairs: { n: number; a: number; result: number }[] = [
      { n: 1, a: 4, result: 8 }, { n: 1, a: 6, result: 18 },
      { n: 1, a: 10, result: 50 }, { n: 2, a: 3, result: 9 },
      { n: 2, a: 6, result: 72 }, { n: 3, a: 2, result: 4 },
      { n: 3, a: 4, result: 64 },
    ];
    const p = pick(pairs);
    return {
      question: `∫₀${sup(p.a)} x${p.n > 1 ? sup(p.n) : ''} dx = ?`,
      answer: p.result,
      hint: `∫xⁿ dx = xⁿ⁺¹/(n+1). Здесь: ${p.a}${sup(p.n + 1)}/${p.n + 1}`,
    };
  },
};

const probIndependent: ProblemType = {
  id: 'prob_independent', name: 'Независимые события', icon: 'P·P', grade: 11,
  generate: () => {
    const p1 = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    const p2 = pick([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]);
    const result = Math.round(p1 * p2 * 100) / 100;
    return {
      question: `P(A) = ${p1}, P(B) = ${p2}. A и B независимы. P(A и B) = ?`,
      answer: result,
      hint: 'P(A ∩ B) = P(A) · P(B)',
    };
  },
};

const volumes: ProblemType = {
  id: 'volumes', name: 'Объёмы тел', icon: 'V', grade: 11,
  generate: () => {
    const types = [
      () => {
        const r = rand(2, 6); const h = rand(2, 8);
        return { question: `Объём цилиндра: r = ${r}, h = ${h}. V = kπ, найдите k`, answer: r * r * h, hint: 'V = πr²h' };
      },
      () => {
        const r = rand(2, 6); const h = rand(3, 9);
        const k = r * r * h;
        return { question: `Объём конуса: r = ${r}, h = ${h}. V = kπ/3, найдите k`, answer: k, hint: 'V = πr²h/3' };
      },
      () => {
        const a = rand(3, 10); const b = rand(3, 10); const h = rand(2, 8);
        return { question: `Объём прямоугольного параллелепипеда: ${a} × ${b} × ${h} = ?`, answer: a * b * h, hint: 'V = a · b · c' };
      },
    ];
    return pick(types)();
  },
};

const exponentialEq: ProblemType = {
  id: 'exponential_eq', name: 'Показательные уравнения', icon: 'aˣ', grade: 11,
  generate: () => {
    const pairs: { base: number; result: number; x: number }[] = [
      { base: 2, result: 4, x: 2 }, { base: 2, result: 8, x: 3 },
      { base: 2, result: 16, x: 4 }, { base: 2, result: 32, x: 5 },
      { base: 2, result: 64, x: 6 }, { base: 3, result: 9, x: 2 },
      { base: 3, result: 27, x: 3 }, { base: 3, result: 81, x: 4 },
      { base: 5, result: 25, x: 2 }, { base: 5, result: 125, x: 3 },
    ];
    const p = pick(pairs);
    return { question: `${p.base}ˣ = ${p.result}. Найдите x`, answer: p.x };
  },
};

const logProperties: ProblemType = {
  id: 'log_properties', name: 'Свойства логарифмов', icon: 'lg', grade: 11,
  generate: () => {
    const types = [
      () => {
        const base = pick([2, 3, 5, 10]);
        const a = rand(2, 4);
        const b = rand(2, 4);
        // log(a) + log(b) = log(a*b)
        const argA = Math.pow(base, a);
        const argB = Math.pow(base, b);
        return {
          question: `log${sub(base)}(${argA}) + log${sub(base)}(${argB}) = ?`,
          answer: a + b,
          hint: `log a + log b = log(a·b)`,
        };
      },
      () => {
        const base = pick([2, 3, 5]);
        const n = rand(2, 4);
        const arg = Math.pow(base, n);
        const k = rand(2, 3);
        return {
          question: `log${sub(base)}(${arg}${sup(k)}) = ?`,
          answer: n * k,
          hint: `log(aⁿ) = n · log(a)`,
        };
      },
    ];
    return pick(types)();
  },
};

// ─── Helpers ────────────────────────────────────────────────

function sup(n: number): string {
  const map: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
  return String(n).split('').map(c => map[c] ?? c).join('');
}

function sub(n: number): string {
  const map: Record<string, string> = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉' };
  return String(n).split('').map(c => map[c] ?? c).join('');
}

// ─── Export ─────────────────────────────────────────────────

export const PROBLEM_TYPES: ProblemType[] = [
  // 8 класс
  addition, subtraction, multiplication, division, percentBasic, square, sqrtBasic, fractions,
  // 9 класс (ОГЭ)
  linearEquation, diffOfSquares, powers, arithmeticProg, geometricProg, geometryBasic, pythagoras, probabilityBasic,
  // 10 класс
  trigValues, derivativePower, logarithms, nthRoot, quadraticRoots,
  // 11 класс (ЕГЭ)
  integrals, probIndependent, volumes, exponentialEq, logProperties,
];
