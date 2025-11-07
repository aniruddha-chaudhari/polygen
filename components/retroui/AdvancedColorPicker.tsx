'use client';

import Color from 'color';
import { PipetteIcon } from 'lucide-react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import {
  type ComponentProps,
  createContext,
  type HTMLAttributes,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/retroui/Button';
import { Input } from '@/components/retroui/Input';
import { Select } from '@/components/retroui/Select';
import { cn } from '@/lib/utils';

interface ColorPickerContextValue {
  hue: number;
  saturation: number;
  lightness: number;
  alpha: number;
  mode: string;
  setHue: (hue: number) => void;
  setSaturation: (saturation: number) => void;
  setLightness: (lightness: number) => void;
  setAlpha: (alpha: number) => void;
  setMode: (mode: string) => void;
}

const ColorPickerContext = createContext<ColorPickerContextValue | undefined>(
  undefined
);

export const useColorPicker = () => {
  const context = useContext(ColorPickerContext);
  if (!context) {
    throw new Error('useColorPicker must be used within a ColorPickerProvider');
  }
  return context;
};

export type ColorPickerProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> & {
  value?: Parameters<typeof Color>[0];
  defaultValue?: Parameters<typeof Color>[0];
  onChange?: (value: string) => void;
};

export const ColorPicker = ({
  value,
  defaultValue = '#000000',
  onChange,
  className,
  ...props
}: ColorPickerProps) => {
  const selectedColor = Color(value);
  const defaultColor = Color(defaultValue);

  const [hue, setHue] = useState(
    selectedColor.hue() || defaultColor.hue() || 0
  );
  const [saturation, setSaturation] = useState(
    selectedColor.saturationl() || defaultColor.saturationl() || 100
  );
  const [lightness, setLightness] = useState(
    selectedColor.lightness() || defaultColor.lightness() || 50
  );
  const [alpha, setAlpha] = useState(
    selectedColor.alpha() * 100 || defaultColor.alpha() * 100
  );
  const [mode, setMode] = useState('hex');
  const isUpdatingFromProp = useRef(false);

  // Update color when controlled value changes
  useEffect(() => {
    if (value) {
      const color = Color(value);
      const newHue = color.hue();
      const newSat = color.saturationl();
      const newLight = color.lightness();
      const newAlpha = color.alpha() * 100;
      
      // Only update if values are significantly different to avoid precision issues
      const hasChanged = 
        Math.abs(hue - newHue) > 0.5 ||
        Math.abs(saturation - newSat) > 0.5 ||
        Math.abs(lightness - newLight) > 0.5 ||
        Math.abs(alpha - newAlpha) > 0.5;
      
      if (hasChanged) {
        isUpdatingFromProp.current = true;
        setHue(newHue);
        setSaturation(newSat);
        setLightness(newLight);
        setAlpha(newAlpha);
        // Reset flag after state updates are processed
        setTimeout(() => {
          isUpdatingFromProp.current = false;
        }, 0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // Only re-run when value prop changes, not when internal state changes

  // Notify parent of changes
  useEffect(() => {
    // Don't trigger onChange if we're updating from the prop
    if (onChange && !isUpdatingFromProp.current) {
      const color = Color.hsl(hue, saturation, lightness);
      const hex = color.hex();
      onChange(hex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, saturation, lightness]); // Intentionally omitting onChange to prevent infinite loops

  return (
    <ColorPickerContext.Provider
      value={{
        hue,
        saturation,
        lightness,
        alpha,
        mode,
        setHue,
        setSaturation,
        setLightness,
        setAlpha,
        setMode,
      }}
    >
      <div
        className={cn('flex size-full flex-col gap-4', className)}
        {...props}
      />
    </ColorPickerContext.Provider>
  );
};

export type ColorPickerSelectionProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerSelection = memo(
  ({ className, ...props }: ColorPickerSelectionProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [positionX, setPositionX] = useState(0);
    const [positionY, setPositionY] = useState(0);

    const { hue, saturation, lightness, setSaturation, setLightness } = useColorPicker();

    // Update position when saturation/lightness changes
    useEffect(() => {
      setPositionX(saturation / 100);
      setPositionY(1 - (lightness / 100));
    }, [saturation, lightness]);

    const backgroundGradient = useMemo(() => {
      return `linear-gradient(0deg, rgba(0,0,0,1), rgba(0,0,0,0)),
            linear-gradient(90deg, rgba(255,255,255,1), rgba(255,255,255,0)),
            hsl(${hue}, 100%, 50%)`;
    }, [hue]);

    const handlePointerMove = useCallback(
      (event: PointerEvent) => {
        if (!(isDragging && containerRef.current)) {
          return;
        }
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (event.clientX - rect.left) / rect.width)
        );
        const y = Math.max(
          0,
          Math.min(1, (event.clientY - rect.top) / rect.height)
        );
        setPositionX(x);
        setPositionY(y);
        setSaturation(x * 100);
        const topLightness = x < 0.01 ? 100 : 50 + 50 * (1 - x);
        const lightness = topLightness * (1 - y);
        setLightness(lightness);
      },
      [isDragging, setSaturation, setLightness]
    );

    useEffect(() => {
      const handlePointerUp = () => setIsDragging(false);
      if (isDragging) {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
      }
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }, [isDragging, handlePointerMove]);

    return (
      <div
        className={cn('relative size-full cursor-crosshair border-2 border-black', className)}
        onPointerDown={(e) => {
          e.preventDefault();
          setIsDragging(true);
          handlePointerMove(e.nativeEvent);
        }}
        ref={containerRef}
        style={{
          background: backgroundGradient,
        }}
        {...props}
      >
        <div
          className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute h-4 w-4 rounded-full border-2 border-white shadow-md"
          style={{
            left: `${positionX * 100}%`,
            top: `${positionY * 100}%`,
            boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
          }}
        />
      </div>
    );
  }
);

ColorPickerSelection.displayName = 'ColorPickerSelection';

export type ColorPickerHueProps = ComponentProps<typeof SliderPrimitive.Root>;

export const ColorPickerHue = ({
  className,
  ...props
}: ColorPickerHueProps) => {
  const { hue, setHue } = useColorPicker();

  const handleHueChange = useCallback((value: number[]) => {
    setHue(value[0]);
  }, [setHue]);

  return (
    <SliderPrimitive.Root
      className={cn('relative flex h-4 w-full touch-none', className)}
      max={360}
      min={0}
      onValueChange={handleHueChange}
      step={1}
      value={[hue]}
      {...props}
    >
      <SliderPrimitive.Track className="relative my-0.5 h-3 w-full grow border border-black bg-[linear-gradient(90deg,#FF0000,#FFFF00,#00FF00,#00FFFF,#0000FF,#FF00FF,#FF0000)]">
        <SliderPrimitive.Range className="absolute h-full" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-none border-2 border-black bg-background shadow-md transition-all hover:shadow-lg active:shadow-none active:translate-y-1 active:translate-x-1" />
    </SliderPrimitive.Root>
  );
};

export type ColorPickerAlphaProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerAlpha = ({
  className,
  ...props
}: ColorPickerAlphaProps) => {
  const { alpha, setAlpha } = useColorPicker();

  const handleValueChange = useCallback((value: number[]) => {
    setAlpha(value[0]);
  }, [setAlpha]);

  return (
    <div className={cn("relative", className)} {...props}>
      <input
        type="range"
        min="0"
        max="100"
        value={alpha}
        onChange={(e) => handleValueChange([parseInt(e.target.value)])}
        className="w-full h-2 bg-transparent cursor-pointer appearance-none"
        style={{
          background: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 100%)',
        }}
      />
      <div className="absolute inset-0 border border-black pointer-events-none rounded-none" />
    </div>
  );
};

export type ColorPickerEyeDropperProps = ComponentProps<typeof Button>;

export const ColorPickerEyeDropper = ({
  className,
  ...props
}: ColorPickerEyeDropperProps) => {
  const { setHue, setSaturation, setLightness, setAlpha } = useColorPicker();

  const handleEyeDropper = async () => {
    try {
      // @ts-expect-error - EyeDropper API is experimental
      const eyeDropper = new EyeDropper();
      const result = await eyeDropper.open();
      const color = Color(result.sRGBHex);
      const [h, s, l] = color.hsl().array();
      setHue(h);
      setSaturation(s);
      setLightness(l);
      setAlpha(100);
    } catch (error) {
      console.error('EyeDropper failed:', error);
    }
  };

  return (
    <Button
      className={cn('shrink-0 text-foreground border-2 border-black', className)}
      onClick={handleEyeDropper}
      size="icon"
      variant="outline"
      type="button"
      {...props}
    >
      <PipetteIcon size={16} />
    </Button>
  );
};

export type ColorPickerOutputProps = Omit<HTMLAttributes<HTMLDivElement>, 'onChange'>;

const formats = ['hex', 'rgb', 'css', 'hsl'];

export const ColorPickerOutput = ({
  className,
  ...props
}: ColorPickerOutputProps) => {
  const { mode, setMode } = useColorPicker();

  return (
    <div className={className} {...props}>
      <Select onValueChange={setMode} value={mode}>
        <Select.Trigger className="h-8 w-20 shrink-0 text-xs border-2 border-black bg-background">
          <Select.Value placeholder="Mode" />
        </Select.Trigger>
        <Select.Content>
          {formats.map((format) => (
            <Select.Item className="text-xs" key={format} value={format}>
              {format.toUpperCase()}
            </Select.Item>
          ))}
        </Select.Content>
      </Select>
    </div>
  );
};

type PercentageInputProps = ComponentProps<typeof Input>;

const PercentageInput = ({ className, ...props }: PercentageInputProps) => {
  return (
    <div className="relative">
      <Input
        readOnly
        type="text"
        {...props}
        className={cn(
          'h-8 w-[3.25rem] rounded-l-none bg-secondary px-2 text-xs shadow-none border-2 border-black',
          className
        )}
      />
      <span className="-translate-y-1/2 absolute top-1/2 right-2 text-muted-foreground text-xs">
        %
      </span>
    </div>
  );
};

export type ColorPickerFormatProps = HTMLAttributes<HTMLDivElement>;

export const ColorPickerFormat = ({
  className,
  ...props
}: ColorPickerFormatProps) => {
  const { hue, saturation, lightness, alpha, mode } = useColorPicker();

  const color = Color.hsl(hue, saturation, lightness, alpha / 100);

  if (mode === 'hex') {
    const hex = color.hex();
    return (
      <div
        className={cn(
          '-space-x-px relative flex w-full items-center rounded-none shadow-sm',
          className
        )}
        {...props}
      >
        <Input
          className="h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none border-2 border-black"
          readOnly
          type="text"
          value={hex}
        />
        <PercentageInput value={alpha} />
      </div>
    );
  }

  if (mode === 'rgb') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value));
    return (
      <div
        className={cn(
          '-space-x-px flex items-center rounded-none shadow-sm',
          className
        )}
        {...props}
      >
        {rgb.map((value, index) => (
          <Input
            className={cn(
              'h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none border-2 border-black',
              index && 'rounded-l-none',
              className
            )}
            key={index}
            readOnly
            type="text"
            value={value}
          />
        ))}
        <PercentageInput value={alpha} />
      </div>
    );
  }

  if (mode === 'css') {
    const rgb = color
      .rgb()
      .array()
      .map((value) => Math.round(value));
    return (
      <div className={cn('w-full rounded-none shadow-sm', className)} {...props}>
        <Input
          className="h-8 w-full bg-secondary px-2 text-xs shadow-none border-2 border-black"
          readOnly
          type="text"
          value={`rgba(${rgb.join(', ')}, ${alpha}%)`}
          {...props}
        />
      </div>
    );
  }

  if (mode === 'hsl') {
    const hsl = color
      .hsl()
      .array()
      .map((value) => Math.round(value));
    return (
      <div
        className={cn(
          '-space-x-px flex items-center rounded-none shadow-sm',
          className
        )}
        {...props}
      >
        {hsl.map((value, index) => (
          <Input
            className={cn(
              'h-8 rounded-r-none bg-secondary px-2 text-xs shadow-none border-2 border-black',
              index && 'rounded-l-none',
              className
            )}
            key={index}
            readOnly
            type="text"
            value={value}
          />
        ))}
        <PercentageInput value={alpha} />
      </div>
    );
  }

  return null;
};
