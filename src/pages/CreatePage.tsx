import { MapPinned, Rocket, ShieldCheck } from 'lucide-react';
import { useState, type Dispatch, type FormEvent, type SetStateAction } from 'react';
import { Alert, Button, Card, Checkbox, Input, Select, Steps, Switch, Tag, Typography } from 'antd';

import { AppFrame, PageHeader } from '../components/AppFrame';
import { EventMap } from '../components/EventMap';
import {
  CATEGORY_META,
  EQUIPMENT_OPTIONS,
  FACILITY_OPTIONS,
  SKILL_LEVELS,
} from '../lib/constants';
import { toLocalDateTimeInputValue } from '../lib/format';
import { useAnimatedNavigate } from '../lib/useAnimatedNavigate';
import { useBubbleStore } from '../store/BubbleStore';
import type { CategoryId, EventLocation, SkillLevel } from '../types';

const STEPS = ['Sport', 'Details', 'Location', 'Review'];

export function CreatePage() {
  const navigate = useAnimatedNavigate();
  const { createEvent, events, userLocation } = useBubbleStore();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<CategoryId>('tennis');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState(toLocalDateTimeInputValue());
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [price, setPrice] = useState(0);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('open');
  const [womenOnly, setWomenOnly] = useState(false);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);
  const [extraFacilities, setExtraFacilities] = useState<string[]>(['Lockers']);
  const [location, setLocation] = useState<EventLocation>({
    label: userLocation.label,
    lat: userLocation.lat,
    lng: userLocation.lng,
  });
  const [errorMessage, setErrorMessage] = useState('');

  const toggleListValue = (
    value: string,
    setter: Dispatch<SetStateAction<string[]>>,
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((entry) => entry !== value)
        : [...current, value],
    );
  };

  const handleSubmit = (submitEvent: FormEvent<HTMLFormElement>) => {
    submitEvent.preventDefault();

    if (!title.trim() || !description.trim() || !startTime || !location.label.trim()) {
      setErrorMessage(
        'Title, description, start time, and location are required.',
      );
      return;
    }

    const eventId = createEvent({
      title,
      description,
      category,
      startTime: new Date(startTime).toISOString(),
      durationMinutes,
      price,
      skillLevel,
      womenOnly,
      requiredEquipment,
      extraFacilities,
      location,
    });

    if (!eventId) {
      setErrorMessage(
        'You need an active profile before creating a session.',
      );
      return;
    }

    navigate(`/event/${eventId}`);
  };

  const canProceed = () => {
    if (step === 0) return Boolean(category);
    if (step === 1) return title.trim() && description.trim() && startTime;
    if (step === 2) return location.label.trim();
    return true;
  };

  const sportOptions = Object.entries(CATEGORY_META).map(([id, meta]) => ({
    value: id,
    label: `${meta.emoji} ${meta.label}`,
  }));

  return (
    <AppFrame>
      <main className="flex min-h-0 flex-1 flex-col gap-4 p-5 pb-8">
        <PageHeader
          title="Create session"
          subtitle={`Step ${step + 1} of ${STEPS.length}`}
          backTo="/discover"
        />

        <Steps
          current={step}
          size="small"
          items={STEPS.map((label) => ({ title: label }))}
        />

        <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2" onSubmit={handleSubmit}>
          {step === 0 && (
            <>
              <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
                <div className="mb-3.5 inline-flex items-center gap-2 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                  <Rocket size={16} />
                  <span>Choose a sport</span>
                </div>
                <p className="mb-3 text-sm text-muted-foreground">
                  Pick the activity first, then we will tailor details like level and facilities.
                </p>
                <Select
                  size="large"
                  className="w-full"
                  value={category}
                  onChange={(value) => setCategory(value as CategoryId)}
                  options={sportOptions}
                />
              </Card>

              <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
                <Typography.Text className="!text-xs !font-semibold !uppercase !tracking-wide !text-muted-foreground">
                  Selected sport
                </Typography.Text>
                <div className="mt-2.5 flex items-center gap-3 rounded-xl bg-[color:var(--surface-strong)] p-3">
                  <span className="text-2xl">{CATEGORY_META[category]?.emoji}</span>
                  <div>
                    <Typography.Text className="!block !text-sm !font-semibold !text-ink-strong dark:!text-foreground">
                      {CATEGORY_META[category]?.label}
                    </Typography.Text>
                    <Typography.Text className="!text-xs !text-muted-foreground">
                      You can refine the session details in the next step.
                    </Typography.Text>
                  </div>
                </div>
              </Card>
            </>
          )}

          {step === 1 && (
            <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
              <div className="mb-1.5 inline-flex items-center gap-2 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                <span>Session details</span>
              </div>
              <p className="mb-4 text-sm text-muted-foreground">
                Add enough context so people can quickly decide whether to join.
              </p>
              <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-2">
                <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Title</span>
                <Input
                  type="text"
                  placeholder="e.g. Thursday evening padel doubles"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Details</span>
                <Input.TextArea
                  rows={4}
                  placeholder="What is the format, who is it for, what should players bring?"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Start time</span>
                  <Input
                    type="datetime-local"
                    value={startTime}
                    onChange={(event) => setStartTime(event.target.value)}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Duration (minutes)</span>
                  <Input
                    type="number"
                    min="30"
                    step="15"
                    value={durationMinutes}
                    onChange={(event) =>
                      setDurationMinutes(Number(event.target.value))
                    }
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2">
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Price</span>
                  <Input
                    type="number"
                    min="0"
                    step="5"
                    value={price}
                    onChange={(event) => setPrice(Number(event.target.value))}
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Skill level</span>
                  <Select
                    value={skillLevel}
                    onChange={(val) => setSkillLevel(val as SkillLevel)}
                    options={SKILL_LEVELS.map((level) => ({
                      value: level.value,
                      label: level.label,
                    }))}
                  />
                </label>
              </div>

              <label className="grid grid-cols-[1fr_auto] items-center gap-3 p-4 rounded-[20px] border border-[rgba(112,95,163,0.14)] bg-white/68 dark:bg-white/10">
                <div>
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Women-only session</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Keep eligibility explicit on the session card.</p>
                </div>
                <Switch checked={womenOnly} onChange={setWomenOnly} />
              </label>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
              <div className="mb-3.5 inline-flex items-center gap-2 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                <MapPinned size={16} />
                <span>Set the location</span>
              </div>
              <label className="flex flex-col gap-2 mb-4">
                <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Location label</span>
                <Input
                  type="text"
                  placeholder="e.g. X TU Delft Outdoor Courts"
                  value={location.label}
                  onChange={(event) =>
                    setLocation((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                />
              </label>
              <p className="mb-4 text-[0.88rem] leading-relaxed text-muted-foreground">
                Tap anywhere on the map to place the session pin.
              </p>
              <EventMap
                compact
                events={events}
                userLocation={userLocation}
                pickerLocation={location}
                onPickLocation={setLocation}
              />

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Required equipment</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {EQUIPMENT_OPTIONS.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={requiredEquipment.includes(item)}
                        onChange={() =>
                          toggleListValue(item, setRequiredEquipment)
                        }
                      />
                      <span className="text-sm font-medium">{item}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="block text-sm font-bold text-ink-strong dark:text-foreground">Extra facilities</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {FACILITY_OPTIONS.map((item) => (
                    <label
                      key={item}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={extraFacilities.includes(item)}
                        onChange={() =>
                          toggleListValue(item, setExtraFacilities)
                        }
                      />
                      <span className="text-sm font-medium">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="rounded-2xl" styles={{ body: { padding: 16 } }}>
              <div className="mb-3.5 inline-flex items-center gap-2 text-[0.98rem] font-extrabold text-ink-strong dark:text-foreground">
                <ShieldCheck size={16} />
                <span>Review & launch</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_META[category]?.emoji}</span>
                  <div>
                    <strong className="text-ink-strong dark:text-foreground">
                      {title || 'Untitled session'}
                    </strong>
                    <p className="text-[0.88rem] leading-relaxed text-muted-foreground">
                      {description || 'No description'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-[10px]">
                  <div className="grid gap-1 rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
                    <span className="block text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Time</span>
                    <strong className="text-ink-strong dark:text-foreground">
                      {startTime
                        ? new Date(startTime).toLocaleString()
                        : 'Not set'}
                    </strong>
                  </div>
                  <div className="grid gap-1 rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
                    <span className="block text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted-foreground">Price</span>
                    <strong className="text-ink-strong dark:text-foreground">
                      {price === 0 ? 'Free' : `€${price}`}
                    </strong>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--surface-strong)] p-3 text-[0.86rem] text-ink">
                  <MapPinned size={14} />
                  <strong className="text-ink-strong dark:text-foreground">
                    {location.label || 'No location set'}
                  </strong>
                </div>
              </div>
              <Tag
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-[0.8rem] font-bold bg-white/70 text-ink-strong dark:bg-white/20 mt-3"
              >
                <ShieldCheck size={12} />
                Text, map, and attendee transparency only
              </Tag>
            </Card>
          )}

          {errorMessage ? <Alert type="error" showIcon message={errorMessage} /> : null}

          <div className="sticky bottom-0 z-10 mt-auto rounded-2xl border border-[rgba(44,44,44,0.12)] bg-[color:var(--surface-strong)] p-3 backdrop-blur">
          <div className="flex flex-wrap gap-[10px]">
            {step > 0 && (
              <Button
                htmlType="button"
                type="default"
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            )}
            {step < STEPS.length - 1 ? (
              <Button
                htmlType="button"
                type="primary"
                className="flex-1 !shadow-[4px_4px_0_#2C2C2C]"
                onClick={() => canProceed() && setStep((s) => s + 1)}
                disabled={!canProceed()}
              >
                Next
              </Button>
            ) : (
              <Button
                className="flex-1 !shadow-[4px_4px_0_#2C2C2C]"
                htmlType="submit"
                type="primary"
              >
                Launch session
                <Rocket size={16} />
              </Button>
            )}
          </div>
          </div>
        </form>
      </main>
    </AppFrame>
  );
}
