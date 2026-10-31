'use client';

import { useState } from 'react';
import { markOnboardingDone } from '@/lib/storage';

interface OnboardingGuideProps {
  onComplete: () => void;
}

const steps = [
  {
    title: '欢迎来到诗韵方格',
    icon: '🎯',
    content: '这是一款结合苏尔特方格与唐诗三百首的专注力训练游戏。在诗词中寻找汉字，锻炼你的观察力与记忆力。',
  },
  {
    title: '三种游戏模式',
    icon: '🎮',
    content: '循序点诗：按诗句顺序依次点击汉字\n混字寻诗：在混杂干扰字中找出诗句\n忆诗找字：先记忆诗句，再凭记忆点字',
  },
  {
    title: '方格点击规则',
    icon: '👆',
    content: '屏幕上方显示当前需要找的诗句汉字，在方格中找到并点击对应的字。相同汉字点任意一个都算正确，连续点对会触发连击特效！',
  },
  {
    title: '个性化主题',
    icon: '🎨',
    content: '右上角可以切换三种风格主题：水墨古风、现代简约、卡通趣味。选择你喜欢的视觉风格，让训练更愉悦。',
  },
  {
    title: '准备好了吗？',
    icon: '🚀',
    content: '完成关卡可获得星级评价和成就徽章。每天坚持训练，成为诗词达人吧！',
  },
];

export function OnboardingGuide({ onComplete }: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      markOnboardingDone();
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    markOnboardingDone();
    onComplete();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      padding: 20,
      animation: 'fadeIn 0.3s ease-out',
    }}>
      <style dangerouslySetInnerHTML={{__html:`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .ob-card { background: var(--color-surface); border-radius: var(--rounded-lg); padding: 32px 24px; max-width: 360px; width: 100%; text-align: center; animation: slideUp 0.4s ease-out; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        .ob-icon { font-size: 64px; margin-bottom: 20px; animation: bounce 2s ease-in-out infinite; }
        .ob-title { font-size: 22px; font-weight: 800; color: var(--color-on-surface); margin-bottom: 16px; letter-spacing: 2px; }
        .ob-content { font-size: 15px; color: var(--color-on-surface-2); line-height: 1.8; margin-bottom: 24px; white-space: pre-line; min-height: 80px; }
        .ob-progress { display: flex; gap: 6px; justify-content: center; margin-bottom: 24px; }
        .ob-dot { width: 8px; height: 8px; border-radius: 50%; background: color-mix(in srgb, var(--color-on-surface) 15%, transparent); transition: all 0.3s; }
        .ob-dot.active { background: var(--color-primary); width: 24px; border-radius: 4px; }
        .ob-buttons { display: flex; gap: 12px; }
        .ob-btn { flex: 1; padding: 14px; border-radius: var(--rounded-md); font-size: 15px; font-weight: 600; cursor: pointer; border: none; transition: all 0.2s; }
        .ob-btn:active { transform: scale(0.96); }
        .ob-btn-skip { background: transparent; color: var(--color-on-surface-2); }
        .ob-btn-next { background: var(--color-primary); color: #fff; box-shadow: 0 4px 12px color-mix(in srgb, var(--color-primary) 30%, transparent); }
      `}} />

      <div className="ob-card">
        <div className="ob-icon">{step.icon}</div>
        <div className="ob-title">{step.title}</div>
        <div className="ob-content">{step.content}</div>

        <div className="ob-progress">
          {steps.map((_, i) => (
            <div key={i} className={`ob-dot${i === currentStep ? ' active' : ''}`} />
          ))}
        </div>

        <div className="ob-buttons">
          {!isLastStep && (
            <button className="ob-btn ob-btn-skip" onClick={handleSkip}>
              跳过
            </button>
          )}
          <button className="ob-btn ob-btn-next" onClick={handleNext}>
            {isLastStep ? '开始训练' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  );
}
