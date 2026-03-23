import { ArrowDownNarrowWide, ShieldCheck, SlidersHorizontal } from 'lucide-react';

import { CATEGORY_META, COST_FILTERS, SKILL_LEVELS } from '../lib/constants';
import type { CategoryId, CostFilter, SkillLevel, SortMode } from '../types';

export type DiscoverFilters = {
  category: 'all' | CategoryId;
  cost: CostFilter;
  skill: 'all' | SkillLevel;
  womenOnly: boolean;
  sort: SortMode;
};

type FiltersBarProps = {
  filters: DiscoverFilters;
  onChange: (filters: DiscoverFilters) => void;
};

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const updateFilters = (patch: Partial<DiscoverFilters>) => {
    onChange({
      ...filters,
      ...patch,
    });
  };

  return (
    <section className="filters-panel glass-card">
      <div className="filters-panel__row">
        <div className="section-title">
          <SlidersHorizontal size={16} />
          <span>Find the right vibe</span>
        </div>
        <button
          className={`pill-button pill-button--toggle${filters.womenOnly ? ' is-active' : ''}`}
          type="button"
          onClick={() => updateFilters({ womenOnly: !filters.womenOnly })}
        >
          <ShieldCheck size={14} />
          Women-only
        </button>
      </div>

      <div className="chip-grid chip-grid--categories">
        <button
          className={`category-chip${filters.category === 'all' ? ' is-active' : ''}`}
          type="button"
          onClick={() => updateFilters({ category: 'all' })}
        >
          <span className="category-chip__emoji">✨</span>
          <span>All vibes</span>
        </button>
        {Object.entries(CATEGORY_META).map(([id, meta]) => (
          <button
            key={id}
            className={`category-chip${filters.category === id ? ' is-active' : ''}`}
            type="button"
            onClick={() => updateFilters({ category: id as CategoryId })}
          >
            <span className="category-chip__emoji">{meta.emoji}</span>
            <span>{meta.label}</span>
          </button>
        ))}
      </div>

      <div className="filters-panel__row filters-panel__row--wrap">
        {COST_FILTERS.map((option) => (
          <button
            key={option.value}
            className={`pill-button${filters.cost === option.value ? ' is-active' : ''}`}
            type="button"
            onClick={() => updateFilters({ cost: option.value })}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="filters-panel__row filters-panel__row--wrap">
        <label className="field field--compact">
          <span className="field__label">Skill level</span>
          <select
            className="select-field"
            value={filters.skill}
            onChange={(event) =>
              updateFilters({ skill: event.target.value as DiscoverFilters['skill'] })
            }
          >
            <option value="all">All levels</option>
            {SKILL_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </label>

        <button
          className={`pill-button pill-button--toggle${filters.sort === 'closest' ? ' is-active' : ''}`}
          type="button"
          onClick={() =>
            updateFilters({
              sort: filters.sort === 'closest' ? 'soonest' : 'closest',
            })
          }
        >
          <ArrowDownNarrowWide size={14} />
          {filters.sort === 'closest' ? 'Closest first' : 'Soonest first'}
        </button>
      </div>
    </section>
  );
}
