import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, Save, User, Activity, HeartPulse, Coffee, CheckCircle2, Pencil, X, Scale, TrendingUp } from 'lucide-react';
import { profileApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { UserProfile, UserProfileUpdate, MeasurementHistoryPoint } from '../types/api';
import PageTransition from '../components/ui/PageTransition';
import GlassCard from '../components/ui/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const { register, handleSubmit, reset, watch, setValue } = useForm<UserProfileUpdate>();

  useEffect(() => {
    profileApi.get().then((data) => {
      setProfile(data);
      reset(data);
      setIsLoading(false);
    });
  }, [reset]);

  // Auto-calculate BMI
  const height = watch('height');
  const weight = watch('weight');

  useEffect(() => {
    if (height && weight && height > 0 && weight > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setValue('bmi', parseFloat(bmi.toFixed(1)));
    }
  }, [height, weight, setValue]);

  const handleEdit = () => {
    if (profile) {
      reset({
        full_name: profile.full_name || user?.full_name || '',
        age: profile.age,
        dob: profile.dob,
        gender: profile.gender,
        height: profile.height,
        height_unit: profile.height_unit || 'cm',
        weight: profile.weight,
        weight_unit: profile.weight_unit || 'kg',
        bmi: profile.bmi,
        medical_conditions: profile.medical_conditions,
        previous_surgeries: profile.previous_surgeries,
        allergies: profile.allergies,
        medications: profile.medications,
        family_history: profile.family_history,
        major_medical_events: profile.major_medical_events,
        activity_level: profile.activity_level,
        exercise_frequency: profile.exercise_frequency,
        sleep_information: profile.sleep_information,
        smoking_status: profile.smoking_status,
        alcohol_consumption: profile.alcohol_consumption,
        health_concerns: profile.health_concerns,
        health_goals: profile.health_goals,
        dietary_preference: profile.dietary_preference,
      });
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (profile) reset(profile);
    setIsEditing(false);
    setSaveSuccess(false);
  };

  const onSubmit = async (data: UserProfileUpdate) => {
    try {
      setIsSaving(true);
      setSaveSuccess(false);
      const cleanedData = { ...data };
      if (!cleanedData.age) cleanedData.age = null;
      if (!cleanedData.height) cleanedData.height = null;
      if (!cleanedData.weight) cleanedData.weight = null;

      const updated = await profileApi.update(cleanedData);
      setProfile(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-12 w-64 skeleton mb-10" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-[300px] skeleton rounded-3xl" />
          <div className="h-[300px] skeleton rounded-3xl" />
          <div className="h-[300px] skeleton rounded-3xl" />
          <div className="h-[300px] skeleton rounded-3xl" />
        </div>
      </div>
    );
  }

  const inputStyle = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 font-medium text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 transition-all shadow-inner placeholder-slate-400";
  const readOnlyStyle = "w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 font-medium text-sm cursor-default";
  const labelStyle = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2";
  const sectionHeaderStyle = "flex items-center gap-3 mb-6 pb-4 border-b border-slate-100";

  const displayVal = (val: any) => val || '—';
  const weightHistory = profile?.weight_history || [];

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-2">
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>BASELINE CLINICAL PROFILE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            Personal Health Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">Calibrate neural analysis and diagnostic insights with your clinical baseline parameters.</p>
        </div>

        {/* Edit / Cancel Button */}
        {!isEditing ? (
          <button
            onClick={handleEdit}
            className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-emerald-300 hover:text-emerald-700 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Pencil className="w-4 h-4 text-emerald-600" /> Edit Profile
          </button>
        ) : (
          <button
            onClick={handleCancel}
            className="px-5 py-2.5 rounded-xl bg-white border border-rose-200 text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Section 1: Personal */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="card-futuristic p-6 sm:p-8 h-full shadow-card">
              <div className={sectionHeaderStyle}>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">Identity & Demographics</h2>
              </div>

              {isEditing ? (
                <div className="space-y-5">
                  <div>
                    <label className={labelStyle}>Full Name</label>
                    <input type="text" {...register('full_name')} className={inputStyle} placeholder="Your full name" />
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Age</label>
                      <input type="number" {...register('age', { valueAsNumber: true })} className={inputStyle} placeholder="e.g. 35" />
                    </div>
                    <div>
                      <label className={labelStyle}>Gender</label>
                      <select {...register('gender')} className={`${inputStyle} appearance-none cursor-pointer`}>
                        <option value="">Select...</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelStyle}>Date of Birth</label>
                    <input type="date" {...register('dob')} className={inputStyle} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Name</span>
                    <span className="text-sm font-bold text-[#172033]">{displayVal(profile?.full_name || user?.full_name)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[#F1F5F9]">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Age</span>
                    <span className="text-sm font-bold text-[#172033]">{profile?.age ? `${profile.age} yrs` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[#F1F5F9]">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Gender</span>
                    <span className="text-sm font-bold text-[#172033]">{displayVal(profile?.gender)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[#F1F5F9]">
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Date of Birth</span>
                    <span className="text-sm font-bold text-slate-800">{displayVal(profile?.dob)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 2: Body */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="card-futuristic p-6 sm:p-8 h-full shadow-card">
              <div className={sectionHeaderStyle}>
                <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center">
                  <Activity className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">Body Biometrics</h2>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelStyle}>Height (cm)</label>
                    <input type="number" step="0.1" {...register('height', { valueAsNumber: true })} className={inputStyle} placeholder="175" />
                  </div>
                  <div>
                    <label className={labelStyle}>Weight (kg)</label>
                    <input type="number" step="0.1" {...register('weight', { valueAsNumber: true })} className={inputStyle} placeholder="70" />
                  </div>
                  <div>
                    <label className={labelStyle}>BMI</label>
                    <div className="relative">
                      <input type="number" {...register('bmi')} className={`${readOnlyStyle} text-emerald-700 font-extrabold bg-emerald-50 border-emerald-200`} readOnly placeholder="-" />
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Auto</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Height</span>
                    <span className="text-sm font-bold text-slate-800">{profile?.height ? `${profile.height} ${profile.height_unit || 'cm'}` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weight</span>
                    <span className="text-sm font-bold text-slate-800">{profile?.weight ? `${profile.weight} ${profile.weight_unit || 'kg'}` : '—'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">BMI</span>
                    <span className="text-sm font-extrabold font-mono text-emerald-600">{profile?.bmi ?? '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 3: Medical */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="card-futuristic p-6 sm:p-8 h-full shadow-card">
              <div className={sectionHeaderStyle}>
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">Clinical Background</h2>
              </div>

              {isEditing ? (
                <div className="space-y-5">
                  <div>
                    <label className={labelStyle}>Medical Conditions</label>
                    <textarea {...register('medical_conditions')} className={`${inputStyle} min-h-[80px] resize-none`} placeholder="e.g. Hypertension, Type 2 Diabetes" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Allergies</label>
                      <input type="text" {...register('allergies')} className={inputStyle} placeholder="e.g. Penicillin" />
                    </div>
                    <div>
                      <label className={labelStyle}>Current Medications</label>
                      <input type="text" {...register('medications')} className={inputStyle} placeholder="e.g. Metformin 500mg" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className={labelStyle}>Previous Surgeries</label>
                      <input type="text" {...register('previous_surgeries')} className={inputStyle} placeholder="e.g. Appendectomy (2019)" />
                    </div>
                    <div>
                      <label className={labelStyle}>Family History</label>
                      <input type="text" {...register('family_history')} className={inputStyle} placeholder="e.g. Father — heart disease" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="py-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Conditions</span>
                    <p className="text-sm font-medium text-slate-800 mt-1">{displayVal(profile?.medical_conditions)}</p>
                  </div>
                  <div className="py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies</span>
                    <p className="text-sm font-medium text-slate-800 mt-1">{displayVal(profile?.allergies)}</p>
                  </div>
                  <div className="py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medications</span>
                    <p className="text-sm font-medium text-slate-800 mt-1">{displayVal(profile?.medications)}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Section 4: Lifestyle */}
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="card-futuristic p-6 sm:p-8 h-full shadow-card">
              <div className={sectionHeaderStyle}>
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center">
                  <Coffee className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">Lifestyle & Habits</h2>
              </div>

              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Activity Level</label>
                    <select {...register('activity_level')} className={`${inputStyle} appearance-none cursor-pointer`}>
                      <option value="">Select...</option>
                      <option value="sedentary">Sedentary (Little/no exercise)</option>
                      <option value="light">Light (1-3 days/week)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Active (6-7 days/week)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Smoking Status</label>
                    <select {...register('smoking_status')} className={`${inputStyle} appearance-none cursor-pointer`}>
                      <option value="">Select...</option>
                      <option value="never">Never smoked</option>
                      <option value="former">Former smoker</option>
                      <option value="current">Current smoker</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Dietary Preference</label>
                    <input type="text" {...register('dietary_preference')} className={inputStyle} placeholder="e.g. Mediterranean, Vegetarian" />
                  </div>
                  <div>
                    <label className={labelStyle}>Sleep Habits</label>
                    <input type="text" {...register('sleep_information')} className={inputStyle} placeholder="e.g. 7-8 hours restful" />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Activity</span>
                    <span className="text-sm font-bold text-slate-800">{displayVal(profile?.activity_level)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Smoking</span>
                    <span className="text-sm font-bold text-slate-800">{displayVal(profile?.smoking_status)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diet</span>
                    <span className="text-sm font-bold text-slate-800">{displayVal(profile?.dietary_preference)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sleep</span>
                    <span className="text-sm font-bold text-slate-800">{displayVal(profile?.sleep_information)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

        </div>

        {/* Weight Measurement History */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-6">
          <div className="card-futuristic p-6 sm:p-8 shadow-card">
            <div className={sectionHeaderStyle}>
              <div className="w-9 h-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display text-slate-900 tracking-tight">Weight Trajectory History</h2>
                <p className="text-xs text-slate-400 font-medium">Logged automatically when you update your body measurements.</p>
              </div>
            </div>

            {weightHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider py-3 px-4">Date</th>
                      <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider py-3 px-4">Weight</th>
                      <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider py-3 px-4">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weightHistory.map((point: MeasurementHistoryPoint, idx: number) => {
                      const prev = idx > 0 ? weightHistory[idx - 1].value : null;
                      const change = prev !== null ? point.value - prev : null;
                      return (
                        <tr key={point.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {format(new Date(point.recorded_at), 'MMM d, yyyy')}
                          </td>
                          <td className="py-3 px-4 text-right font-bold font-mono text-slate-900">
                            {point.value} <span className="text-xs text-slate-400 font-sans">{point.unit}</span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono">
                            {change !== null ? (
                              <span className={`text-xs font-bold ${change > 0 ? 'text-amber-600' : change < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                                {change > 0 ? '+' : ''}{change.toFixed(1)} {point.unit}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">Baseline</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl">
                <Scale className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-600">No weight history recorded yet.</p>
                <p className="text-xs text-slate-400 mt-1">Update your weight in Body Biometrics above to begin trend tracking.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Floating Save Bar — only visible in edit mode */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="sticky bottom-8 mt-10 flex justify-center md:justify-end z-20"
            >
              <div className="p-2 rounded-full flex items-center gap-4 bg-white border border-[#E2E8F0] shadow-lg pr-2">
                <AnimatePresence>
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, x: -20, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 'auto' }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-2 pl-4 text-[#16A34A] font-bold text-sm whitespace-nowrap overflow-hidden"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Profile Updated
                    </motion.div>
                  )}
                </AnimatePresence>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-5 py-2.5 rounded-full text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-primary rounded-full px-6 py-2.5 min-w-[150px]"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </PageTransition>
  );
}
