import {
 AVAILABLE_GRADES,
 CURRENT_GRADE_LABELS,
 DIRECTION_LABELS,
 USER_STATUS_LABELS,
} from '@lyceum64/shared';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

import { Header } from '../components/Header';
import api from '../services/api';

const AVATAR_OPTIONS = [
 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=6',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=7',
 'https://api.dicebear.com/7.x/avataaars/svg?seed=8',
 'https://api.dicebear.com/7.x/bottts/svg?seed=1',
 'https://api.dicebear.com/7.x/bottts/svg?seed=2',
 'https://api.dicebear.com/7.x/bottts/svg?seed=3',
 'https://api.dicebear.com/7.x/bottts/svg?seed=4',
 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=1',
 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=2',
 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=3',
 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=4',
];

type Tab = 'profile' | 'security' | 'privacy';

interface UserProfile {
 id: string;
 email: string;
 username: string;
 name: string;
 status: 'STUDENT' | 'APPLICANT';
 currentGrade: number;
 desiredDirection?: string | null;
 motivation?: string | null;
 authProvider: string;
 avatar?: string | null;
 bio?: string | null;
 isPublic: boolean;
}

export default function SettingsPage() {
 const [tab, setTab] = useState<Tab>('profile');
 const [user, setUser] = useState<UserProfile | null>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);

 // Profile form
 const [profileForm, setProfileForm] = useState({
 name: '',
 bio: '',
 status: 'STUDENT' as 'STUDENT' | 'APPLICANT',
 currentGrade: 10,
 desiredDirection: '' as string,
 motivation: '',
 });

 // Privacy form
 const [isPublic, setIsPublic] = useState(true);

 // Password form
 const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
 const [pwLoading, setPwLoading] = useState(false);
 const [showPw, setShowPw] = useState({ current: false, next: false, confirm: false });

 // Avatar
 const [showAvatarPicker, setShowAvatarPicker] = useState(false);
 const [uploadingAvatar, setUploadingAvatar] = useState(false);

 useEffect(() => {
 void loadProfile();
 }, []);

 const loadProfile = async () => {
 try {
 const { data } = await api.get<UserProfile>('/users/profile');
 setUser(data);
 setProfileForm({
 name: data.name ?? '',
 bio: data.bio ?? '',
 status: data.status,
 currentGrade: data.currentGrade,
 desiredDirection: data.desiredDirection ?? '',
 motivation: data.motivation ?? '',
 });
 setIsPublic(data.isPublic);
 } catch {
 toast.error('Не удалось загрузить профиль');
 } finally {
 setLoading(false);
 }
 };

 const saveProfile = async () => {
 setSaving(true);
 try {
 const payload: Record<string, unknown> = {
 name: profileForm.name,
 bio: profileForm.bio,
 status: profileForm.status,
 currentGrade: profileForm.currentGrade,
 motivation: profileForm.motivation,
 desiredDirection: profileForm.desiredDirection || null,
 };
 const { data } = await api.put<UserProfile>('/users/profile', payload);
 setUser(data);
 toast.success('Профиль сохранён');
 } catch {
 toast.error('Ошибка сохранения');
 } finally {
 setSaving(false);
 }
 };

 const savePrivacy = async () => {
 setSaving(true);
 try {
 await api.put('/users/profile', { isPublic });
 setUser(prev => prev ? { ...prev, isPublic } : null);
 toast.success('Настройки приватности сохранены');
 } catch {
 toast.error('Ошибка сохранения');
 } finally {
 setSaving(false);
 }
 };

 const changePassword = async () => {
 if (pwForm.next !== pwForm.confirm) {
 toast.error('Пароли не совпадают');
 return;
 }
 if (pwForm.next.length < 8) {
 toast.error('Пароль должен быть не менее 8 символов');
 return;
 }
 setPwLoading(true);
 try {
 await api.put('/users/change-password', {
 currentPassword: pwForm.current,
 newPassword: pwForm.next,
 });
 setPwForm({ current: '', next: '', confirm: '' });
 toast.success('Пароль успешно изменён');
 } catch (err: unknown) {
 const msg =
 (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
 'Ошибка смены пароля';
 toast.error(msg);
 } finally {
 setPwLoading(false);
 }
 };

 const handleAvatarSelect = async (url: string) => {
 try {
 await api.put('/users/avatar', { avatar: url });
 setUser(prev => prev ? { ...prev, avatar: url } : null);
 setShowAvatarPicker(false);
 toast.success('Аватар обновлён');
 } catch {
 toast.error('Ошибка обновления аватара');
 }
 };

 const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
 const file = e.target.files?.[0];
 if (!file) return;
 if (file.size > 5 * 1024 * 1024) { toast.error('Максимум 5MB'); return; }
 if (!file.type.startsWith('image/')) { toast.error('Выберите изображение'); return; }

 setUploadingAvatar(true);
 const reader = new FileReader();
 reader.onload = async ev => {
 const base64 = ev.target?.result as string;
 try {
 await api.put('/users/avatar', { avatar: base64 });
 setUser(prev => prev ? { ...prev, avatar: base64 } : null);
 setShowAvatarPicker(false);
 toast.success('Аватар загружен');
 } catch { toast.error('Ошибка загрузки'); }
 setUploadingAvatar(false);
 };
 reader.onerror = () => { toast.error('Ошибка чтения файла'); setUploadingAvatar(false); };
 reader.readAsDataURL(file);
 };

 const tabs: { key: Tab; label: string; icon: string }[] = [
 { key: 'profile', label: 'Профиль', icon: '👤' },
 { key: 'privacy', label: 'Приватность', icon: '🔒' },
 { key: 'security', label: 'Безопасность',icon: '🛡️' },
 ];

 if (loading) return (
 <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
 <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
 </div>
 );

 return (
 <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)' }}>
 <Header />

 {/* Avatar picker modal */}
 {showAvatarPicker && (
 <div
 className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
 onClick={() => setShowAvatarPicker(false)}
 >
 <div
 className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6"
 onClick={e => e.stopPropagation()}
 >
 <div className="flex items-center justify-between mb-4">
 <h3 className="font-bold " style={{ color: 'var(--color-text)' }}>Выберите аватар</h3>
 <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-slate-600">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
 <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>
 <div className="grid grid-cols-4 gap-3 mb-4">
 {AVATAR_OPTIONS.map((url, i) => (
 <button
 key={i}
 onClick={() => void handleAvatarSelect(url)}
 className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all hover:scale-105 ${
 user?.avatar === url ? 'border-blue-500' : 'border-slate-200 hover:border-blue-300'
 }`}
 >
 <img src={url} alt="avatar" className="w-full h-full" />
 </button>
 ))}
 </div>
 <label className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 rounded-xl p-3 hover:bg-slate-100 transition-colors">
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">
 <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
 </svg>
 <span className="text-sm text-slate-700">{uploadingAvatar ? 'Загрузка...' : 'Загрузить своё фото'}</span>
 <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
 </label>
 </div>
 </div>
 )}

 <main className="max-w-2xl mx-auto px-4 py-8">
 <div className="mb-6">
 <Link to="/profile" className="text-blue-400 hover:text-blue-300 text-sm mb-4 inline-block">
 &larr; Назад к профилю
 </Link>
 <h1 className="text-2xl font-bold " style={{ color: 'var(--color-text)' }}>Настройки профиля</h1>
 </div>

 {/* Avatar block */}
 <div className=" border border-slate-200 rounded-2xl p-5 mb-5 flex items-center gap-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div
 className="relative group cursor-pointer"
 onClick={() => setShowAvatarPicker(true)}
 role="button"
 tabIndex={0}
 onKeyDown={e => e.key === 'Enter' && setShowAvatarPicker(true)}
 aria-label="Изменить аватар"
 >
 <div className="w-20 h-20 rounded-2xl bg-slate-100 border-2 border-white shadow-md overflow-hidden">
 {user?.avatar ? (
 <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
 ) : (
 <div className="w-full h-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white">
 {user?.name?.charAt(0).toUpperCase()}
 </div>
 )}
 </div>
 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
 <span className="text-white text-xs font-medium">Изменить</span>
 </div>
 </div>
 <div>
 <p className="font-semibold text-slate-900">{user?.name}</p>
 <p className="text-sm text-slate-500">@{user?.username}</p>
 <button
 onClick={() => setShowAvatarPicker(true)}
 className="text-xs text-blue-500 hover:text-blue-600 mt-1"
 >
 Сменить аватар
 </button>
 </div>
 </div>

 {/* Tabs */}
 <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-5">
 {tabs.map(t => (
 <button
 key={t.key}
 onClick={() => setTab(t.key)}
 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
 tab === t.key
 ? 'bg-white text-slate-900 shadow-sm'
 : 'text-slate-500 hover:text-slate-700'
 }`}
 >
 <span>{t.icon}</span>
 <span className="hidden sm:inline">{t.label}</span>
 </button>
 ))}
 </div>

 {/* Profile tab */}
 {tab === 'profile' && (
 <div className=" border border-slate-200 rounded-2xl p-6 space-y-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="font-semibold " style={{ color: 'var(--color-text)' }}>Основная информация</h2>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Имя</label>
 <input
 type="text"
 value={profileForm.name}
 onChange={e => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
 placeholder="Ваше имя"
 maxLength={100}
 />
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">О себе</label>
 <textarea
 value={profileForm.bio}
 onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
 rows={3}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
 placeholder="Расскажите о себе..."
 maxLength={1000}
 />
 <p className="text-xs text-slate-400 mt-1 text-right">{profileForm.bio.length}/1000</p>
 </div>

 <div className="grid sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Статус</label>
 <select
 value={profileForm.status}
 onChange={e => setProfileForm(prev => ({ ...prev, status: e.target.value as 'STUDENT' | 'APPLICANT' }))}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
 >
 {Object.entries(USER_STATUS_LABELS).map(([k, v]) => (
 <option key={k} value={k}>{v}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Класс</label>
 <select
 value={profileForm.currentGrade}
 onChange={e => setProfileForm(prev => ({ ...prev, currentGrade: Number(e.target.value) }))}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
 >
 {AVAILABLE_GRADES.map(g => (
 <option key={g} value={g}>
 {(CURRENT_GRADE_LABELS as Record<number, string>)[g] ?? `${g} класс`}
 </option>
 ))}
 </select>
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Желаемое направление</label>
 <select
 value={profileForm.desiredDirection}
 onChange={e => setProfileForm(prev => ({ ...prev, desiredDirection: e.target.value }))}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 bg-white"
 >
 <option value="">Не выбрано</option>
 {Object.entries(DIRECTION_LABELS).map(([k, v]) => (
 <option key={k} value={k}>{v}</option>
 ))}
 </select>
 </div>

 <div>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">Мотивация</label>
 <textarea
 value={profileForm.motivation}
 onChange={e => setProfileForm(prev => ({ ...prev, motivation: e.target.value }))}
 rows={2}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
 placeholder="Почему вы хотите поступить в лицей?"
 maxLength={500}
 />
 </div>

 <button
 onClick={() => void saveProfile()}
 disabled={saving}
 className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
 >
 {saving ? 'Сохранение...' : 'Сохранить изменения'}
 </button>
 </div>
 )}

 {/* Privacy tab */}
 {tab === 'privacy' && (
 <div className=" border border-slate-200 rounded-2xl p-6 space-y-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <h2 className="font-semibold " style={{ color: 'var(--color-text)' }}>Приватность профиля</h2>

 <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
 <div>
 <p className="font-medium text-slate-900 text-sm">Публичный профиль</p>
 <p className="text-xs text-slate-500 mt-0.5">
 {isPublic
 ? 'Ваш профиль виден всем пользователям'
 : 'Ваш профиль скрыт от других пользователей'}
 </p>
 </div>
 <button
 onClick={() => setIsPublic(v => !v)}
 className={`relative w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-blue-600' : 'bg-slate-300'}`}
 role="switch"
 aria-checked={isPublic}
 >
 <span
 className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0'}`}
 />
 </button>
 </div>

 <div className="text-xs text-slate-500 bg-blue-50 border border-blue-100 rounded-xl p-3">
 <p className="font-medium text-blue-700 mb-1">Что видят другие?</p>
 <ul className="space-y-0.5">
 <li>✓ Имя и аватар — всегда видны в рейтинге</li>
 <li>{isPublic ? '✓' : '✗'} Статистика тестов — {isPublic ? 'видна' : 'скрыта'}</li>
 <li>{isPublic ? '✓' : '✗'} Публичная страница @{user?.username} — {isPublic ? 'доступна' : 'скрыта'}</li>
 </ul>
 </div>

 <button
 onClick={() => void savePrivacy()}
 disabled={saving}
 className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
 >
 {saving ? 'Сохранение...' : 'Сохранить настройки'}
 </button>
 </div>
 )}

 {/* Security tab */}
 {tab === 'security' && (
 <div className=" border border-slate-200 rounded-2xl p-6 space-y-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
 <div>
 <h2 className="font-semibold " style={{ color: 'var(--color-text)' }}>Смена пароля</h2>
 <p className="text-sm text-slate-500 mt-0.5">Используйте надёжный пароль (минимум 8 символов)</p>
 </div>

 {user?.authProvider !== 'EMAIL' && (
 <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-700">
 Смена пароля доступна только для аккаунтов с входом по Email
 </div>
 )}

 <div className="space-y-4">
 {[
 { key: 'current', label: 'Текущий пароль', placeholder: 'Введите текущий пароль' },
 { key: 'next', label: 'Новый пароль', placeholder: 'Минимум 8 символов' },
 { key: 'confirm', label: 'Подтвердите пароль', placeholder: 'Повторите новый пароль' },
 ].map(f => (
 <div key={f.key}>
 <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
 <div className="relative">
 <input
 type={showPw[f.key as keyof typeof showPw] ? 'text' : 'password'}
 value={pwForm[f.key as keyof typeof pwForm]}
 onChange={e => setPwForm(prev => ({ ...prev, [f.key]: e.target.value }))}
 placeholder={f.placeholder}
 className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 pr-11"
 disabled={user?.authProvider !== 'EMAIL'}
 />
 <button
 type="button"
 onClick={() => setShowPw(prev => ({ ...prev, [f.key]: !prev[f.key as keyof typeof prev] }))}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
 aria-label="Показать/скрыть пароль"
 >
 {showPw[f.key as keyof typeof showPw] ? (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
 </svg>
 ) : (
 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
 <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
 <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
 </svg>
 )}
 </button>
 </div>
 </div>
 ))}
 </div>

 {/* Strength indicator */}
 {pwForm.next && (
 <div>
 <div className="flex gap-1 mb-1">
 {[8, 12, 16].map(len => (
 <div
 key={len}
 className={`h-1.5 flex-1 rounded-full transition-colors ${
 pwForm.next.length >= len
 ? len === 8 ? 'bg-red-400' : len === 12 ? 'bg-yellow-400' : 'bg-green-500'
 : 'bg-slate-200'
 }`}
 />
 ))}
 </div>
 <p className="text-xs text-slate-500">
 {pwForm.next.length < 8 ? 'Слишком короткий' :
 pwForm.next.length < 12 ? 'Слабый' :
 pwForm.next.length < 16 ? 'Средний' : 'Надёжный'}
 </p>
 </div>
 )}

 <button
 onClick={() => void changePassword()}
 disabled={pwLoading || user?.authProvider !== 'EMAIL' || !pwForm.current || !pwForm.next || !pwForm.confirm}
 className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-xl transition-colors"
 >
 {pwLoading ? 'Смена пароля...' : 'Изменить пароль'}
 </button>

 <div className="border-t border-slate-100 pt-4">
 <h3 className="font-semibold  mb-2 text-sm" style={{ color: 'var(--color-text)' }}>Email аккаунта</h3>
 <p className="text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
 {user?.email}
 </p>
 <p className="text-xs text-slate-400 mt-1">Email изменить нельзя</p>
 </div>
 </div>
 )}
 </main>
 </div>
 );
}
