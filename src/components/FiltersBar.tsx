import { ArrowDownNarrowWide, ShieldCheck, SlidersHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

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
    <section>
      <Card className="filters-panel">
      <div className="filters-panel__row">
        <div className="section-title">
          <SlidersHorizontal size={16} />
          <span>Find the right sport</span>
        </div>
        <Button
          variant={filters.womenOnly ? 'default' : 'outline'}
          size="sm"
          className="pill-button pill-button--toggle"
          onClick={() => updateFilters({ womenOnly: !filters.womenOnly })}
        >
          <ShieldCheck size={14} />
          Women-only
        </Button>
      </div>

      <div className="chip-grid chip-grid--categories">
        <Button
          variant={filters.category === 'all' ? 'secondary' : 'outline'}
          className="category-chip"
          onClick={() => updateFilters({ category: 'all' })}
          >
            <span className="category-chip__emoji">🏅</span>
            <span>All sports</span>
          </Button>
        {Object.entries(CATEGORY_META).map(([id, meta]) => (
          <Button
            key={id}
            variant={filters.category === id ? 'secondary' : 'outline'}
            className="category-chip"
            onClick={() => updateFilters({ category: id as CategoryId })}
          >
            <span className="category-chip__emoji">{meta.emoji}</span>
            <span>{meta.label}</span>
          </Button>
        ))}
      </div>

      <div className="filters-panel__row filters-panel__row--wrap">
        {COST_FILTERS.map((option) => (
          <Button
            key={option.value}
            variant={filters.cost === option.value ? 'default' : 'outline'}
            size="sm"
            className="pill-button"
            onClick={() => updateFilters({ cost: option.value })}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="filters-panel__row filters-panel__row--wrap">
        <label className="field field--compact">
          <span className="field__label">Skill level</span>
          <NativeSelect
            value={filters.skill}
            onChange={(event) =>
              updateFilters({ skill: event.target.value as DiscoverFilters['skill'] })
            }
          >
            <NativeSelectOption value="all">All levels</NativeSelectOption>
            {SKILL_LEVELS.map((level) => (
              <NativeSelectOption key={level.value} value={level.value}>
                {level.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </label>

        <Button
          variant={filters.sort === 'closest' ? 'default' : 'outline'}
          size="sm"
          className="pill-button pill-button--toggle"
          onClick={() =>
            updateFilters({
              sort: filters.sort === 'closest' ? 'soonest' : 'closest',
            })
          }
        >
          <ArrowDownNarrowWide size={14} />
          {filters.sort === 'closest' ? 'Closest first' : 'Soonest first'}
        </Button>
      </div>
      </Card>
    </section>
  );
}
