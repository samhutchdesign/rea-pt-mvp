import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/base/buttons/button';

export function DictateButton({ dictating, dictSecs, onPress }: { dictating: boolean; dictSecs: number; onPress: () => void }) {
  return (
    <Button
      size="sm"
      color={dictating ? 'primary-destructive' : 'secondary'}
      iconLeading={dictating ? MicOff : Mic}
      onPress={onPress}
    >
      {dictating
        ? `Stop  ${Math.floor(dictSecs / 60)}:${String(dictSecs % 60).padStart(2, '0')}`
        : 'Dictate'}
    </Button>
  );
}
