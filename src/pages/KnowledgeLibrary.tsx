import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Search, Clock, BookOpen } from 'lucide-react'
import {
  KNOWLEDGE_BASE,
  KNOWLEDGE_CATEGORIES,
  type KnowledgeArticle,
  type KnowledgeCategory,
  type KnowledgeSection,
} from '../data/knowledge'

// ─── Difficulty Badge ────────────────────────────────────────────────────────

function DifficultyBadge({ difficulty }: { difficulty: KnowledgeArticle['difficulty'] }) {
  const config = {
    beginner: { label: 'מתחיל', color: '#34D4A8', bg: 'rgba(52,212,168,0.15)' },
    intermediate: { label: 'בינוני', color: '#C8A951', bg: 'rgba(200,169,81,0.15)' },
    advanced: { label: 'מתקדם', color: '#FF4B5C', bg: 'rgba(255,75,92,0.15)' },
  }[difficulty]

  return (
    <span
      className="text-xs font-assistant font-semibold px-2 py-0.5 rounded-full"
      style={{ color: config.color, background: config.bg }}
    >
      {config.label}
    </span>
  )
}

// ─── Section Block ───────────────────────────────────────────────────────────

function SectionBlock({ section }: { section: KnowledgeSection }) {
  const baseClass = 'rounded-xl p-4 my-3'

  if (section.type === 'formula') {
    return (
      <div
        className={baseClass}
        style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(200,169,81,0.3)' }}
      >
        {section.title && (
          <p className="text-xs text-text-muted font-assistant mb-2 font-semibold">
            {section.title}
          </p>
        )}
        <p className="font-numbers text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
          {section.text}
        </p>
        {section.highlight && (
          <p
            className="mt-2 font-bold text-sm font-numbers"
            style={{ color: 'var(--gold)', fontFamily: 'monospace' }}
          >
            {section.highlight}
          </p>
        )}
      </div>
    )
  }

  if (section.type === 'warning') {
    return (
      <div
        className={baseClass}
        style={{ background: 'rgba(255,75,92,0.08)', border: '1px solid rgba(255,75,92,0.25)' }}
      >
        {section.title && (
          <p className="text-sm font-bold font-assistant mb-1" style={{ color: '#FF4B5C' }}>
            ⚠️ {section.title}
          </p>
        )}
        <p className="text-sm font-assistant" style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
          {section.text}
        </p>
        {section.highlight && (
          <p className="mt-2 text-sm font-semibold font-assistant" style={{ color: '#FF4B5C' }}>
            {section.highlight}
          </p>
        )}
      </div>
    )
  }

  if (section.type === 'tip') {
    return (
      <div
        className={baseClass}
        style={{ background: 'rgba(200,169,81,0.08)', border: '1px solid rgba(200,169,81,0.25)' }}
      >
        {section.title && (
          <p className="text-sm font-bold font-assistant mb-1" style={{ color: 'var(--gold)' }}>
            💡 {section.title}
          </p>
        )}
        <p className="text-sm font-assistant" style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
          {section.text}
        </p>
        {section.highlight && (
          <p className="mt-2 text-sm font-semibold font-assistant" style={{ color: 'var(--gold)' }}>
            {section.highlight}
          </p>
        )}
      </div>
    )
  }

  if (section.type === 'example') {
    return (
      <div
        className={baseClass}
        style={{ background: 'rgba(91,120,255,0.08)', border: '1px solid rgba(91,120,255,0.25)' }}
      >
        {section.title && (
          <p className="text-sm font-bold font-assistant mb-1" style={{ color: '#5B78FF' }}>
            📊 {section.title}
          </p>
        )}
        <p className="text-sm font-assistant" style={{ color: 'var(--text-primary)', lineHeight: 1.7 }}>
          {section.text}
        </p>
        {section.highlight && (
          <p className="mt-2 text-sm font-bold font-numbers" style={{ color: '#5B78FF' }}>
            {section.highlight}
          </p>
        )}
      </div>
    )
  }

  // intro / explanation
  return (
    <div className="my-3">
      {section.title && (
        <p
          className="text-base font-bold font-assistant mb-1.5"
          style={{ color: 'var(--text-primary)' }}
        >
          {section.title}
        </p>
      )}
      <p className="text-sm font-assistant leading-relaxed" style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
        {section.text}
      </p>
      {section.highlight && (
        <p className="mt-2 text-sm font-semibold font-numbers" style={{ color: 'var(--gold)' }}>
          {section.highlight}
        </p>
      )}
    </div>
  )
}

// ─── Article Modal ────────────────────────────────────────────────────────────

function ArticleModal({
  article,
  onClose,
}: {
  article: KnowledgeArticle
  onClose: () => void
}) {
  const catConfig = KNOWLEDGE_CATEGORIES[article.category]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="sticky top-0 z-10 flex items-start justify-between p-6 pb-4"
            style={{
              background: 'var(--surface)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="flex-1 min-w-0 ml-4">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-assistant font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(200,169,81,0.15)',
                    color: 'var(--gold)',
                    border: '1px solid rgba(200,169,81,0.25)',
                  }}
                >
                  {catConfig.emoji} {catConfig.label}
                </span>
                <DifficultyBadge difficulty={article.difficulty} />
                <span
                  className="flex items-center gap-1 text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Clock size={12} />
                  {article.readTime} דקות קריאה
                </span>
              </div>
              <h2
                className="text-xl font-bold font-assistant leading-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                {article.title}
              </h2>
              <p className="text-sm mt-0.5 font-assistant" style={{ color: 'var(--text-secondary)' }}>
                {article.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-xl transition-colors"
              style={{
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 pt-4" dir="rtl">
            {article.content.map((section, idx) => (
              <SectionBlock key={idx} section={section} />
            ))}

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-assistant px-2 py-0.5 rounded-full"
                      style={{
                        background: 'var(--surface-elevated)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({
  article,
  onClick,
}: {
  article: KnowledgeArticle
  onClick: () => void
}) {
  const catConfig = KNOWLEDGE_CATEGORIES[article.category]

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 16px 40px rgba(0,0,0,0.4)' }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={onClick}
      className="cursor-pointer rounded-2xl p-5 flex flex-col gap-3"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(200,169,81,0.4)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
      }}
    >
      {/* Icon + category */}
      <div className="flex items-start justify-between">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, rgba(200,169,81,0.25), rgba(200,169,81,0.08))',
            border: '1px solid rgba(200,169,81,0.3)',
          }}
        >
          {article.icon}
        </div>
        <span
          className="text-xs font-assistant font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(200,169,81,0.12)',
            color: 'var(--gold)',
            border: '1px solid rgba(200,169,81,0.2)',
          }}
        >
          {catConfig.label}
        </span>
      </div>

      {/* Title / subtitle */}
      <div className="flex-1">
        <h3
          className="font-bold font-assistant text-sm leading-snug mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {article.title}
        </h3>
        <p
          className="text-xs font-assistant leading-relaxed line-clamp-2"
          style={{ color: 'var(--text-secondary)' }}
        >
          {article.subtitle}
        </p>
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
        <DifficultyBadge difficulty={article.difficulty} />
        <span
          className="flex items-center gap-1 text-xs font-assistant"
          style={{ color: 'var(--text-muted)' }}
        >
          <Clock size={11} />
          {article.readTime} דק'
        </span>
      </div>
    </motion.div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function KnowledgeLibrary() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<KnowledgeCategory | 'all'>('all')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)

  const categories: { id: KnowledgeCategory | 'all'; label: string; emoji: string }[] = [
    { id: 'all', label: 'הכל', emoji: '📚' },
    ...Object.entries(KNOWLEDGE_CATEGORIES).map(([id, cfg]) => ({
      id: id as KnowledgeCategory,
      label: cfg.label,
      emoji: cfg.emoji,
    })),
  ]

  const filteredArticles = useMemo(() => {
    let list = KNOWLEDGE_BASE
    if (activeCategory !== 'all') {
      list = list.filter((a) => a.category === activeCategory)
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      )
    }
    return list
  }, [activeCategory, searchQuery])

  return (
    <div
      className="min-h-full"
      dir="rtl"
      style={{ background: 'var(--bg)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(200,169,81,0.3), rgba(200,169,81,0.08))',
                border: '1px solid rgba(200,169,81,0.4)',
              }}
            >
              <BookOpen size={20} style={{ color: 'var(--gold)' }} />
            </div>
            <div>
              <h1
                className="text-2xl sm:text-3xl font-bold font-assistant"
                style={{ color: 'var(--text-primary)' }}
              >
                ספריית הידע
              </h1>
              <p className="text-sm font-assistant" style={{ color: 'var(--text-secondary)' }}>
                הכל על הכספים שלך — מוסבר בפשטות
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search
            size={16}
            className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="חפש מאמר..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl py-3 pr-10 pl-4 text-sm font-assistant outline-none transition-colors"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(200,169,81,0.5)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
            }}
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-assistant font-semibold transition-all"
                style={{
                  background: isActive ? 'var(--gold)' : 'var(--surface)',
                  color: isActive ? 'var(--bg)' : 'var(--text-secondary)',
                  border: `1px solid ${isActive ? 'var(--gold)' : 'var(--border)'}`,
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Results count */}
        <p className="text-xs font-assistant mb-4" style={{ color: 'var(--text-muted)' }}>
          {filteredArticles.length} מאמרים
        </p>

        {/* Articles grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => setSelectedArticle(article)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <span className="text-4xl">🔍</span>
            <p className="text-base font-assistant" style={{ color: 'var(--text-secondary)' }}>
              לא נמצאו מאמרים התואמים לחיפוש
            </p>
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveCategory('all')
              }}
              className="text-sm font-assistant"
              style={{ color: 'var(--gold)' }}
            >
              נקה פילטרים
            </button>
          </div>
        )}
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
        />
      )}
    </div>
  )
}
