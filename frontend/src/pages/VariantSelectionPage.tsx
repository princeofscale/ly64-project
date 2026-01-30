import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SUBJECT_LABELS } from '@lyceum64/shared';
import { Button } from '../components/Button';
import { sdamgiaService, SdamgiaVariant } from '../services/sdamgiaService';

export default function VariantSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, grade } = location.state || {};

  const [variants, setVariants] = useState<SdamgiaVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    if (!subject || !grade) {
      toast.error('Не указан предмет или класс');
      navigate('/dashboard');
      return;
    }

    loadVariants();
  }, [subject, grade]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const data = await sdamgiaService.getVariants(subject, grade);
      setVariants(data);
    } catch (error) {
      console.error('Error loading variants:', error);
      toast.error('Ошибка загрузки вариантов');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = () => {
    if (!selectedVariant) {
      toast.error('Выберите вариант');
      return;
    }

    // Переходим на страницу с тестом, передавая ID варианта
    navigate('/test/sdamgia', {
      state: {
        variantId: selectedVariant,
        subject,
        grade,
        examType: getExamType(grade),
      },
    });
  };

  const getExamType = (gradeNum: number): string => {
    if (gradeNum === 8 || gradeNum === 10) return 'VPR';
    if (gradeNum === 9) return 'OGE';
    if (gradeNum === 11) return 'EGE';
    return 'VPR';
  };

  const subjectLabel = subject
    ? SUBJECT_LABELS[subject as keyof typeof SUBJECT_LABELS]
    : 'Неизвестный предмет';

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
          <div
            className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"
            style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />

      <div className="absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: '1s' }}
      />

      <div className="relative z-10 max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="group mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-sans"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Назад
        </button>

        <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              Выберите вариант
            </h1>
            <p className="text-gray-400 text-lg font-sans">
              {subjectLabel} • {grade} класс • {getExamType(grade)}
            </p>
          </div>

          {variants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 font-sans">Варианты не найдены</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                {variants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant.id)}
                    className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 animate-scale-in ${
                      selectedVariant === variant.id
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                        : 'border-gray-700/50 bg-gray-800/30 hover:border-cyan-500/50'
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="text-center">
                      <div
                        className={`text-3xl font-bold font-display mb-2 transition-colors ${
                          selectedVariant === variant.id
                            ? 'text-cyan-400'
                            : 'text-gray-300 group-hover:text-cyan-400'
                        }`}
                      >
                        {variant.number}
                      </div>
                      <div className="text-xs text-gray-500 font-sans">Вариант</div>
                    </div>

                    {selectedVariant === variant.id && (
                      <div className="absolute top-2 right-2">
                        <svg
                          className="w-5 h-5 text-cyan-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartTest}
                  disabled={!selectedVariant}
                  className="px-8 py-3"
                >
                  Начать тест
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
