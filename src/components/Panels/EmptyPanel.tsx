import React from 'react';
import { motion } from 'framer-motion';
import { Square, Plus, ArrowRight } from 'lucide-react';

export const EmptyPanel: React.FC = () => {
  return (
    <div className="h-full flex items-center justify-center neu-bg-base p-6">
      <motion.div 
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* 🎨 중앙 아이콘 */}
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-3xl neu-shadow-1 flex items-center justify-center"
          style={{
            background: 'linear-gradient(145deg, var(--neu-base), var(--neu-accent))',
          }}
          animate={{ 
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Square className="w-10 h-10 neu-text-secondary" strokeWidth={1.5} />
        </motion.div>

        {/* 📝 제목 */}
        <motion.h3 
          className="neu-heading-secondary mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          빈 패널
        </motion.h3>

        {/* 📄 설명 */}
        <motion.p 
          className="neu-body-secondary text-sm mb-6 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          이 패널은 아직 설정되지 않았습니다.<br />
          상단의 패널 선택 버튼을 클릭하여<br />
          원하는 패널 타입을 선택하세요.
        </motion.p>

        {/* 🎯 액션 가이드 */}
        <motion.div
          className="neu-card p-4 space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center space-x-3 text-sm">
            <motion.div
              className="w-6 h-6 rounded-lg neu-shadow-subtle flex items-center justify-center"
              style={{ background: 'var(--neu-primary)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Square className="w-3 h-3 text-white" />
            </motion.div>
            <ArrowRight className="w-4 h-4 neu-text-secondary" />
            <span className="neu-text-primary">패널 선택 버튼 클릭</span>
          </div>

          <div className="flex items-center space-x-3 text-sm">
            <motion.div
              className="w-6 h-6 rounded-lg neu-shadow-subtle flex items-center justify-center"
              style={{ background: 'var(--neu-success)' }}
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <Plus className="w-3 h-3 text-white" />
            </motion.div>
            <ArrowRight className="w-4 h-4 neu-text-secondary" />
            <span className="neu-text-primary">원하는 패널 타입 선택</span>
          </div>
        </motion.div>

        {/* ✨ 장식적 요소 */}
        <motion.div
          className="mt-8 flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ background: 'var(--neu-text-muted)' }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                delay: i * 0.3
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};