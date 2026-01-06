import { ref } from 'vue';
import { STORAGE_KEYS } from '../constants';
import { setMusicVolume } from '../services/audio';

export function useVolumeControl() {
    const savedVolume = localStorage.getItem(STORAGE_KEYS.MUSIC_VOLUME);
    const musicVolume = ref(savedVolume ? parseFloat(savedVolume) : 0.3);

    function handleVolumeChange(event: Event) {
        const target = event.target as HTMLInputElement;
        const volume = parseFloat(target.value);
        musicVolume.value = volume;
        setMusicVolume(volume);
        localStorage.setItem(STORAGE_KEYS.MUSIC_VOLUME, volume.toString());
    }

    return {
        musicVolume,
        handleVolumeChange,
    };
}
