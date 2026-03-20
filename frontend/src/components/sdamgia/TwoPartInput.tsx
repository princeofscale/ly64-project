interface TwoPartInputProps {
  value: string;
  onChange: (combined: string) => void;
  labels?: [string, string];
  disabled?: boolean;
}

export default function TwoPartInput({
  value,
  onChange,
  labels = ['а)', 'б)'],
  disabled = false,
}: TwoPartInputProps) {
  const parts = value.split(';');
  const partA = parts[0] ?? '';
  const partB = parts[1] ?? '';

  const handleChange = (index: 0 | 1, inputValue: string) => {
    const sanitized = inputValue.replace(/;/g, '');
    const newParts = [partA, partB];
    newParts[index] = sanitized;
    onChange(newParts.join(';'));
  };

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="sdamgia-answer-a" className="block text-slate-700 text-sm mb-2">
          {labels[0]} Ваш ответ:
        </label>
        <input
          id="sdamgia-answer-a"
          type="text"
          value={partA}
          onChange={e => handleChange(0, e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          placeholder="Введите ответ"
        />
      </div>
      <div>
        <label htmlFor="sdamgia-answer-b" className="block text-slate-700 text-sm mb-2">
          {labels[1]} Ваш ответ:
        </label>
        <input
          id="sdamgia-answer-b"
          type="text"
          value={partB}
          onChange={e => handleChange(1, e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
          placeholder="Введите ответ"
        />
      </div>
    </div>
  );
}
