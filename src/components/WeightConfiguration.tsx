import { useState } from 'react';
import type { OptimizationWeights, OptimizationPreset } from '../types';
import { OPTIMIZATION_PRESETS, DEFAULT_OPTIMIZATION_WEIGHTS } from '../types';
import './WeightConfiguration.css';

interface WeightSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  isNegative?: boolean;
}

function WeightSlider({
  label,
  value,
  min,
  max,
  onChange,
  isNegative = false,
}: WeightSliderProps) {
  const displayValue = isNegative ? -Math.abs(value) : value;

  return (
    <div className="weight-slider">
      <div className="weight-slider-header">
        <span className="weight-slider-label">{label}</span>
        <span className={`weight-slider-value ${displayValue < 0 ? 'negative' : ''}`}>
          {displayValue > 0 ? '+' : ''}
          {displayValue}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={Math.abs(value)}
        onChange={(e) => {
          const absValue = parseInt(e.target.value, 10);
          onChange(isNegative ? -absValue : absValue);
        }}
      />
    </div>
  );
}

interface WeightConfigurationProps {
  weights: OptimizationWeights;
  onChange: (weights: OptimizationWeights) => void;
  eventType?: 'wedding' | 'corporate' | 'social' | 'other';
}

export function WeightConfiguration({
  weights,
  onChange,
  eventType,
}: WeightConfigurationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<OptimizationPreset>('custom');

  const updateWeight = (
    path: string,
    value: number
  ) => {
    const newWeights = { ...weights };
    const parts = path.split('.');

    if (parts.length === 2) {
      const [section, key] = parts;
      if (section === 'relationships') {
        newWeights.relationships = {
          ...newWeights.relationships,
          [key]: value,
        };
      } else if (section === 'constraints') {
        newWeights.constraints = {
          ...newWeights.constraints,
          [key]: value,
        };
      }
    } else if (path === 'groupCohesion') {
      newWeights.groupCohesion = value;
    } else if (path === 'interestMatch') {
      newWeights.interestMatch = value;
    }

    setActivePreset('custom');
    onChange(newWeights);
  };

  const applyPreset = (preset: Exclude<OptimizationPreset, 'custom'>) => {
    setActivePreset(preset);
    onChange(OPTIMIZATION_PRESETS[preset]);
  };

  const resetToDefault = () => {
    setActivePreset('custom');
    onChange(DEFAULT_OPTIMIZATION_WEIGHTS);
  };

  // Suggest preset based on event type
  const suggestedPreset =
    eventType === 'wedding'
      ? 'wedding'
      : eventType === 'corporate'
        ? 'corporate'
        : null;

  return (
    <div className="weight-configuration">
      <button
        className={`weight-config-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="toggle-label">
          <span>Optimization Priorities</span>
          {activePreset !== 'custom' && (
            <span className="preset-badge">{activePreset}</span>
          )}
        </span>
        <span className="toggle-icon">▼</span>
      </button>

      {isOpen && (
        <div className="weight-config-content">
          {/* Presets */}
          <div className="weight-presets">
            <button
              className={`preset-btn ${activePreset === 'wedding' ? 'active' : ''}`}
              onClick={() => applyPreset('wedding')}
            >
              Wedding
            </button>
            <button
              className={`preset-btn ${activePreset === 'corporate' ? 'active' : ''}`}
              onClick={() => applyPreset('corporate')}
            >
              Corporate
            </button>
            <button
              className={`preset-btn ${activePreset === 'networking' ? 'active' : ''}`}
              onClick={() => applyPreset('networking')}
            >
              Networking
            </button>
          </div>

          {suggestedPreset && activePreset === 'custom' && (
            <p className="preset-suggestion">
              Tip: Try the{' '}
              <button onClick={() => applyPreset(suggestedPreset)}>
                {suggestedPreset}
              </button>{' '}
              preset for your event type
            </p>
          )}

          {/* Relationship Weights */}
          <div className="weight-section">
            <h4>Relationship Weights</h4>
            <WeightSlider
              label="Partners (must sit together)"
              value={weights.relationships.partner}
              min={0}
              max={200}
              onChange={(v) => updateWeight('relationships.partner', v)}
            />
            <WeightSlider
              label="Family members"
              value={weights.relationships.family}
              min={0}
              max={100}
              onChange={(v) => updateWeight('relationships.family', v)}
            />
            <WeightSlider
              label="Friends"
              value={weights.relationships.friend}
              min={0}
              max={100}
              onChange={(v) => updateWeight('relationships.friend', v)}
            />
            <WeightSlider
              label="Colleagues"
              value={weights.relationships.colleague}
              min={0}
              max={100}
              onChange={(v) => updateWeight('relationships.colleague', v)}
            />
            <WeightSlider
              label="Avoid penalty"
              value={weights.relationships.avoid}
              min={50}
              max={500}
              onChange={(v) => updateWeight('relationships.avoid', v)}
              isNegative
            />
          </div>

          {/* Group & Social */}
          <div className="weight-section">
            <h4>Group & Social</h4>
            <WeightSlider
              label="Group cohesion bonus"
              value={weights.groupCohesion}
              min={0}
              max={100}
              onChange={(v) => updateWeight('groupCohesion', v)}
            />
            <WeightSlider
              label="Shared interests bonus"
              value={weights.interestMatch}
              min={0}
              max={20}
              onChange={(v) => updateWeight('interestMatch', v)}
            />
          </div>

          <button className="reset-btn" onClick={resetToDefault}>
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}
