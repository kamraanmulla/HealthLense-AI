import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { profileApi } from '../lib/api';
import { useAuth } from '../lib/auth';
import {
  User, Heart, Activity, Stethoscope, ChevronRight, ChevronLeft,
  Check, SkipForward, Sparkles
} from 'lucide-react';
import type { UserProfileUpdate } from '../types/api';

const STEPS = [
  { id: 'basic', title: 'Basic Information', icon: User, description: 'Tell us about yourself' },
  { id: 'lifestyle', title: 'Lifestyle', icon: Activity, description: 'Your daily habits' },
  { id: 'medical', title: 'Medical Background', icon: Stethoscope, description: 'Important health context' },
  { id: 'goals', title: 'Health Context', icon: Heart, description: 'What matters to you' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { refreshUser, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UserProfileUpdate>({
    full_name: user?.full_name || '',
    age: null,
    dob: null,
    gender: null,
    height: null,
    height_unit: 'cm',
    weight: null,
    weight_unit: 'kg',
    activity_level: null,
    exercise_frequency: null,
    sleep_information: null,
    smoking_status: null,
    alcohol_consumption: null,
    dietary_preference: null,
    medical_conditions: null,
    previous_surgeries: null,
    allergies: null,
    medications: null,
    family_history: null,
    major_medical_events: null,
    health_concerns: null,
    health_goals: null,
  });

  const update = (field: keyof UserProfileUpdate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value || null }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await profileApi.update({
        ...formData,
        onboarding_completed: true,
      });
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Onboarding failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await profileApi.update({ onboarding_completed: true });
      await refreshUser();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Skip failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canAdvance = currentStep < STEPS.length - 1;

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white border border-[#E2E8F0] text-[#172033] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#16A34A]/30 focus:border-[#16A34A] transition-all placeholder:text-[#94A3B8]";
  const selectClass = inputClass;
  const labelClass = "block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2";

  const renderStep = () => {
    switch (STEPS[currentStep].id) {
      case 'basic':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Full Name</label>
              <input className={inputClass} placeholder="Enter your full name" value={formData.full_name || ''} onChange={e => update('full_name', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Date of Birth</label>
              <input type="date" className={inputClass} value={formData.dob || ''} onChange={e => update('dob', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" className={inputClass} placeholder="e.g. 28" value={formData.age ?? ''} onChange={e => update('age', e.target.value ? parseInt(e.target.value) : null)} />
            </div>
            <div>
              <label className={labelClass}>Sex</label>
              <select className={selectClass} value={formData.gender || ''} onChange={e => update('gender', e.target.value)}>
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Height ({formData.height_unit || 'cm'})</label>
              <input type="number" step="0.1" className={inputClass} placeholder="e.g. 175" value={formData.height ?? ''} onChange={e => update('height', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
            <div>
              <label className={labelClass}>Weight ({formData.weight_unit || 'kg'})</label>
              <input type="number" step="0.1" className={inputClass} placeholder="e.g. 72" value={formData.weight ?? ''} onChange={e => update('weight', e.target.value ? parseFloat(e.target.value) : null)} />
            </div>
          </div>
        );
      case 'lifestyle':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Activity Level</label>
              <select className={selectClass} value={formData.activity_level || ''} onChange={e => update('activity_level', e.target.value)}>
                <option value="">Select</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Lightly active (1-2 days/week)</option>
                <option value="moderate">Moderately active (3-5 days/week)</option>
                <option value="active">Very active (6-7 days/week)</option>
                <option value="athlete">Athlete / intense training</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Exercise Frequency</label>
              <select className={selectClass} value={formData.exercise_frequency || ''} onChange={e => update('exercise_frequency', e.target.value)}>
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="1-2_per_week">1-2 times/week</option>
                <option value="3-4_per_week">3-4 times/week</option>
                <option value="5+_per_week">5+ times/week</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Sleep Quality</label>
              <select className={selectClass} value={formData.sleep_information || ''} onChange={e => update('sleep_information', e.target.value)}>
                <option value="">Select</option>
                <option value="less_than_5">Less than 5 hours</option>
                <option value="5-6_hours">5-6 hours</option>
                <option value="7-8_hours">7-8 hours (recommended)</option>
                <option value="more_than_8">More than 8 hours</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Smoking Status</label>
              <select className={selectClass} value={formData.smoking_status || ''} onChange={e => update('smoking_status', e.target.value)}>
                <option value="">Select</option>
                <option value="never">Never smoked</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Alcohol Consumption</label>
              <select className={selectClass} value={formData.alcohol_consumption || ''} onChange={e => update('alcohol_consumption', e.target.value)}>
                <option value="">Select</option>
                <option value="none">None</option>
                <option value="occasional">Occasional (social)</option>
                <option value="moderate">Moderate (1-2 drinks/day)</option>
                <option value="heavy">Heavy (3+ drinks/day)</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Dietary Preference</label>
              <select className={selectClass} value={formData.dietary_preference || ''} onChange={e => update('dietary_preference', e.target.value)}>
                <option value="">Select</option>
                <option value="no_restriction">No restriction</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="keto">Keto / Low-carb</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        );
      case 'medical':
        return (
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelClass}>Known Medical Conditions</label>
              <textarea className={inputClass + ' min-h-[80px] resize-none'} placeholder="e.g. Hypertension, Type 2 Diabetes, Asthma..." value={formData.medical_conditions || ''} onChange={e => update('medical_conditions', e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Allergies</label>
                <input className={inputClass} placeholder="e.g. Penicillin, Peanuts..." value={formData.allergies || ''} onChange={e => update('allergies', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Current Medications</label>
                <input className={inputClass} placeholder="e.g. Metformin 500mg, Amlodipine..." value={formData.medications || ''} onChange={e => update('medications', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Previous Surgeries</label>
                <input className={inputClass} placeholder="e.g. Appendectomy (2019)..." value={formData.previous_surgeries || ''} onChange={e => update('previous_surgeries', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Family Medical History</label>
                <input className={inputClass} placeholder="e.g. Father — heart disease, Mother — diabetes..." value={formData.family_history || ''} onChange={e => update('family_history', e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Major Medical Events</label>
              <input className={inputClass} placeholder="e.g. Hospitalization in 2020 for pneumonia..." value={formData.major_medical_events || ''} onChange={e => update('major_medical_events', e.target.value)} />
            </div>
          </div>
        );
      case 'goals':
        return (
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className={labelClass}>Current Health Concerns</label>
              <textarea className={inputClass + ' min-h-[80px] resize-none'} placeholder="What health issues or symptoms are you currently experiencing or worried about?" value={formData.health_concerns || ''} onChange={e => update('health_concerns', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Health Goals</label>
              <textarea className={inputClass + ' min-h-[80px] resize-none'} placeholder="What are your primary health objectives? (e.g. weight management, better sleep, monitor blood sugar...)" value={formData.health_goals || ''} onChange={e => update('health_goals', e.target.value)} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const StepIcon = STEPS[currentStep].icon;

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-10 w-[480px] h-[480px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[480px] h-[480px] bg-teal-500/10 blur-[130px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>CLINICAL CALIBRATION SETUP</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight">Configure Your Health Profile</h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Calibrates your baseline data for individualized report analysis. All fields are optional.</p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep(i)}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all duration-300 cursor-pointer ${
                  i === currentStep ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/40' :
                  i < currentStep ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {i < currentStep ? <Check className="w-4 h-4 stroke-[2.5]" /> : i + 1}
              </button>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-0.5 rounded-full transition-all duration-500 ${i < currentStep ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="card-futuristic shadow-card overflow-hidden">
          {/* Step Header */}
          <div className="px-8 py-5 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <StepIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-display text-slate-900">{STEPS[currentStep].title}</h2>
                <p className="text-xs text-slate-400 font-medium">{STEPS[currentStep].description} — Step {currentStep + 1} of {STEPS.length}</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-4.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between">
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep(s => s - 1)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-slate-600 hover:bg-white transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSkip}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-600 transition-all flex items-center gap-1 cursor-pointer"
              >
                <SkipForward className="w-3.5 h-3.5" /> Skip setup
              </button>
              {canAdvance ? (
                <button
                  onClick={() => setCurrentStep(s => s + 1)}
                  className="btn-primary rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-emerald-500/20 cursor-pointer"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isSubmitting}
                  className="btn-primary rounded-xl px-6 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Enter Dashboard'} <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
