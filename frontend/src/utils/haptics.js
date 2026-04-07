import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export const feedback = {
    // Para cuando algo sale bien (vibración doble suave)
    success: async () => {
        await Haptics.notification({ type: NotificationType.Success });
    },
    // Para errores (vibración triple rápida)
    error: async () => {
        await Haptics.notification({ type: NotificationType.Error });
    },
    // Para clics normales o selección de ítems (vibración ligera)
    impact: async () => {
        await Haptics.impact({ style: ImpactStyle.Light });
    }
};